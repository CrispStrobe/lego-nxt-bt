#!/usr/bin/env python3

"""
ev3_ondevice_bridge.py
Complete EV3 Bridge Server v2.0
Runs on EV3 Brick - Provides HTTP API for both streaming control and script management
"""

import http.server
import socketserver
import json
import os
import sys
import threading
import subprocess
import time
import base64
import argparse
from datetime import datetime

# EV3 imports
from ev3dev2.motor import LargeMotor, MediumMotor, OUTPUT_A, OUTPUT_B, OUTPUT_C, OUTPUT_D, SpeedPercent
from ev3dev2.sensor import INPUT_1, INPUT_2, INPUT_3, INPUT_4
from ev3dev2.sensor.lego import TouchSensor, ColorSensor, UltrasonicSensor, GyroSensor, InfraredSensor
from ev3dev2.sound import Sound
from ev3dev2.display import Display
from ev3dev2.button import Button
from ev3dev2.led import Leds
from ev3dev2.power import PowerSupply

# Configuration
PORT = 8080
SCRIPTS_DIR = "/home/robot/scripts"
SOUNDS_DIR = "/home/robot/sounds"

# Ensure directories exist
os.makedirs(SCRIPTS_DIR, exist_ok=True)
os.makedirs(SOUNDS_DIR, exist_ok=True)

# Global verbose flag
VERBOSE = False

# Hardware Cache
motors = {}
sensors = {}
display = Display()
sound = Sound()
buttons = Button()
leds = Leds()
power = PowerSupply()

# Running scripts tracking
running_scripts = {}
script_counter = 0

def vlog(message, data=None):
    """Verbose logging"""
    if VERBOSE:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        if data:
            print(f"[{timestamp}] [BRIDGE] {message}: {data}")
        else:
            print(f"[{timestamp}] [BRIDGE] {message}")

def log(message, data=None):
    """Standard logging"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if data:
        print(f"[{timestamp}] {message}: {data}")
    else:
        print(f"[{timestamp}] {message}")

def get_motor(port_char):
    """Lazy load motors with verbose logging"""
    vlog(f"get_motor called", {"port": port_char})
    if port_char not in motors:
        try:
            mapping = {'A': OUTPUT_A, 'B': OUTPUT_B, 'C': OUTPUT_C, 'D': OUTPUT_D}
            motors[port_char] = LargeMotor(mapping[port_char])
            log(f"Motor initialized on port {port_char}")
            vlog(f"Motor details", {
                "port": port_char,
                "driver": motors[port_char].driver_name,
                "address": motors[port_char].address
            })
        except Exception as e:
            log(f"Failed to initialize motor on port {port_char}", str(e))
            motors[port_char] = None
    return motors[port_char]

def get_sensor(port_num, type_cls):
    """Lazy load sensors with verbose logging"""
    vlog(f"get_sensor called", {"port": port_num, "type": type_cls.__name__})
    key = f"{port_num}_{type_cls.__name__}"
    if key not in sensors:
        try:
            mapping = {'1': INPUT_1, '2': INPUT_2, '3': INPUT_3, '4': INPUT_4}
            sensors[key] = type_cls(mapping[port_num])
            log(f"Sensor initialized: {type_cls.__name__} on port {port_num}")
            vlog(f"Sensor details", {
                "port": port_num,
                "type": type_cls.__name__,
                "driver": sensors[key].driver_name,
                "address": sensors[key].address
            })
        except Exception as e:
            log(f"Failed to initialize {type_cls.__name__} on port {port_num}", str(e))
            sensors[key] = None
    return sensors[key]

class BridgeHandler(http.server.BaseHTTPRequestHandler):
    
    def log_message(self, format, *args):
        """Override to use our logging"""
        if VERBOSE:
            vlog(f"HTTP {self.command}", {"path": self.path, "client": self.client_address[0]})
    
    def _send_json(self, data, code=200):
        """Send JSON response"""
        vlog(f"Sending response", {"code": code, "data": data})
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        vlog("CORS preflight request")
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

    def do_POST(self):
        """Handle POST requests (commands)"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data)
            command = data.get('cmd')
            
            log(f"Command received: {command}")
            vlog(f"Command data", data)

            # === UPLOAD HANDLING ===
            if command == 'upload_script':
                filename = os.path.join(SCRIPTS_DIR, data['name'])
                with open(filename, 'w') as f:
                    f.write(data['code'])
                os.chmod(filename, 0o755)
                log(f"Script uploaded: {data['name']}")
                self._send_json({"status": "ok", "msg": f"Saved {data['name']}"})

            elif command == 'upload_sound':
                filename = os.path.join(SOUNDS_DIR, data['name'])
                # Decode base64 if present
                if 'data' in data:
                    sound_data = base64.b64decode(data['data'])
                    with open(filename, 'wb') as f:
                        f.write(sound_data)
                    log(f"Sound uploaded: {data['name']}")
                    self._send_json({"status": "ok", "msg": "Sound uploaded"})
                else:
                    self._send_json({"status": "error", "msg": "No sound data"}, 400)

            # === SCRIPT EXECUTION ===
            elif command == 'run_script':
                path = os.path.join(SCRIPTS_DIR, data['name'])
                if os.path.exists(path):
                    global script_counter
                    script_id = script_counter
                    script_counter += 1
                    proc = subprocess.Popen(['python3', path])
                    running_scripts[script_id] = {
                        'name': data['name'],
                        'process': proc,
                        'started': time.time()
                    }
                    log(f"Script started: {data['name']} (ID: {script_id})")
                    self._send_json({"status": "ok", "msg": "Started", "script_id": script_id})
                else:
                    self._send_json({"status": "error", "msg": "File not found"}, 404)

            elif command == 'stop_script':
                script_id = data.get('script_id')
                if script_id in running_scripts:
                    running_scripts[script_id]['process'].terminate()
                    del running_scripts[script_id]
                    log(f"Script stopped (ID: {script_id})")
                    self._send_json({"status": "ok", "msg": "Stopped"})
                else:
                    self._send_json({"status": "error", "msg": "Script not found"}, 404)

            # === MOTORS ===
            elif command == 'motor_run':
                m = get_motor(data['port'])
                if m:
                    m.on(SpeedPercent(data['speed']))
                    vlog(f"Motor running", {"port": data['port'], "speed": data['speed']})
                    self._send_json({"status": "ok"})
                else:
                    self._send_json({"status": "error", "msg": "Motor not connected"})

            elif command == 'motor_run_for':
                m = get_motor(data['port'])
                if m:
                    m.on_for_rotations(
                        SpeedPercent(data['speed']), 
                        data['rotations'], 
                        block=False
                    )
                    vlog(f"Motor run_for", {
                        "port": data['port'], 
                        "speed": data['speed'], 
                        "rotations": data['rotations']
                    })
                    self._send_json({"status": "ok"})
                else:
                    self._send_json({"status": "error"})

            elif command == 'motor_stop':
                m = get_motor(data['port'])
                if m:
                    brake_mode = data.get('brake', 'brake')
                    m.stop(stop_action=brake_mode)
                    vlog(f"Motor stopped", {"port": data['port'], "mode": brake_mode})
                    self._send_json({"status": "ok"})
                else:
                    self._send_json({"status": "error"})

            elif command == 'motor_reset':
                m = get_motor(data['port'])
                if m:
                    m.position = 0
                    vlog(f"Motor position reset", {"port": data['port']})
                    self._send_json({"status": "ok"})
                else:
                    self._send_json({"status": "error"})

            elif command == 'tank_drive':
                motor_left = get_motor('B')
                motor_right = get_motor('C')
                if motor_left and motor_right:
                    motor_left.on_for_rotations(
                        SpeedPercent(data['left']), 
                        data['rotations'], 
                        block=False
                    )
                    motor_right.on_for_rotations(
                        SpeedPercent(data['right']), 
                        data['rotations'], 
                        block=True
                    )
                    vlog(f"Tank drive", {
                        "left": data['left'], 
                        "right": data['right'], 
                        "rotations": data['rotations']
                    })
                    self._send_json({"status": "ok"})
                else:
                    self._send_json({"status": "error", "msg": "Motors not connected"})

            # === DISPLAY ===
            elif command == 'screen_clear':
                display.clear()
                display.update()
                vlog("Screen cleared")
                self._send_json({"status": "ok"})

            elif command == 'screen_text':
                display.text_pixels(str(data['text']), x=data['x'], y=data['y'])
                display.update()
                vlog(f"Text displayed", {"text": data['text'], "x": data['x'], "y": data['y']})
                self._send_json({"status": "ok"})

            elif command == 'draw_circle':
                try:
                    from PIL import ImageDraw
                    draw = ImageDraw.Draw(display.image)
                    x, y, r = data['x'], data['y'], data['r']
                    draw.ellipse((x-r, y-r, x+r, y+r), outline='black')
                    display.update()
                    vlog(f"Circle drawn", {"x": x, "y": y, "r": r})
                    self._send_json({"status": "ok"})
                except Exception as e:
                    log(f"Draw circle error", str(e))
                    self._send_json({"status": "error", "msg": str(e)})

            elif command == 'draw_rectangle':
                try:
                    from PIL import ImageDraw
                    draw = ImageDraw.Draw(display.image)
                    draw.rectangle((data['x1'], data['y1'], data['x2'], data['y2']), 
                                   outline='black')
                    display.update()
                    vlog(f"Rectangle drawn", data)
                    self._send_json({"status": "ok"})
                except Exception as e:
                    log(f"Draw rectangle error", str(e))
                    self._send_json({"status": "error", "msg": str(e)})

            elif command == 'draw_line':
                try:
                    from PIL import ImageDraw
                    draw = ImageDraw.Draw(display.image)
                    draw.line((data['x1'], data['y1'], data['x2'], data['y2']), 
                             fill='black')
                    display.update()
                    vlog(f"Line drawn", data)
                    self._send_json({"status": "ok"})
                except Exception as e:
                    log(f"Draw line error", str(e))
                    self._send_json({"status": "error", "msg": str(e)})

            # === SOUND ===
            elif command == 'speak':
                sound.speak(str(data['text']))
                vlog(f"Speaking", {"text": data['text']})
                self._send_json({"status": "ok"})

            elif command == 'beep':
                freq = data.get('freq', 1000)
                dur = data.get('dur', 100)
                sound.beep(frequency=freq, duration=dur)
                vlog(f"Beep", {"freq": freq, "dur": dur})
                self._send_json({"status": "ok"})

            elif command == 'set_volume':
                volume = data['volume']
                sound.set_volume(volume)
                vlog(f"Volume set", {"volume": volume})
                self._send_json({"status": "ok"})

            elif command == 'play_tone':
                note = data.get('note', 'C4')
                duration = data.get('duration', 0.5)
                sound.play_note(note, duration)
                vlog(f"Playing tone", {"note": note, "duration": duration})
                self._send_json({"status": "ok"})

            # === LED ===
            elif command == 'set_led':
                color = data['color']
                leds.set_color("LEFT", color)
                leds.set_color("RIGHT", color)
                vlog(f"LED set", {"color": color})
                self._send_json({"status": "ok"})

            else:
                log(f"Unknown command: {command}")
                self._send_json({"status": "error", "msg": "Unknown command"}, 400)

        except Exception as e:
            log(f"Error processing command", str(e))
            if VERBOSE:
                import traceback
                traceback.print_exc()
            self._send_json({"status": "error", "msg": str(e)}, 500)

    def do_GET(self):
        """Handle GET requests (sensor reads, status)"""
        vlog(f"GET request", {"path": self.path})
        
        try:
            # === ROOT STATUS ===
            if self.path == '/' or self.path == '/status':
                status = {
                    "status": "ev3_bridge_active",
                    "version": "2.0.0",
                    "uptime": time.time(),
                    "running_scripts": len(running_scripts),
                    "motors": list(motors.keys()),
                    "sensors": list(sensors.keys())
                }
                self._send_json(status)

            # === BATTERY ===
            elif self.path == '/battery':
                voltage = power.measured_volts
                # Approximate percentage (7.4V = 0%, 9.0V = 100%)
                percentage = max(0, min(100, ((voltage - 7.4) / (9.0 - 7.4)) * 100))
                vlog(f"Battery read", {"voltage": voltage, "percentage": percentage})
                self._send_json({"value": percentage, "voltage": voltage})

            # === MOTORS ===
            elif self.path.startswith('/motor/position/'):
                port = self.path.split('/')[-1].upper()
                m = get_motor(port)
                value = m.position if m else 0
                vlog(f"Motor position read", {"port": port, "position": value})
                self._send_json({"value": value})

            elif self.path.startswith('/motor/speed/'):
                port = self.path.split('/')[-1].upper()
                m = get_motor(port)
                value = m.speed if m else 0
                vlog(f"Motor speed read", {"port": port, "speed": value})
                self._send_json({"value": value})

            # === TOUCH SENSOR ===
            elif self.path.startswith('/sensor/touch/'):
                port = self.path.split('/')[-1]
                sensor = get_sensor(port, TouchSensor)
                value = sensor.is_pressed if sensor else False
                vlog(f"Touch sensor read", {"port": port, "pressed": value})
                self._send_json({"value": value})

            # === COLOR SENSOR ===
            elif self.path.startswith('/sensor/color/'):
                parts = self.path.split('/')
                port = parts[3]
                mode = parts[4] if len(parts) > 4 else 'color'
                
                sensor = get_sensor(port, ColorSensor)
                if sensor:
                    if mode == 'reflected_light_intensity':
                        value = sensor.reflected_light_intensity
                    elif mode == 'ambient_light_intensity':
                        value = sensor.ambient_light_intensity
                    elif mode == 'color':
                        value = sensor.color
                    else:
                        value = 0
                else:
                    value = 0
                
                vlog(f"Color sensor read", {"port": port, "mode": mode, "value": value})
                self._send_json({"value": value})

            # === COLOR SENSOR RGB ===
            elif self.path.startswith('/sensor/color_rgb/'):
                parts = self.path.split('/')
                port = parts[3]
                component = parts[4] if len(parts) > 4 else 'red'
                
                sensor = get_sensor(port, ColorSensor)
                if sensor:
                    rgb = sensor.rgb
                    component_map = {'red': 0, 'green': 1, 'blue': 2}
                    idx = component_map.get(component, 0)
                    value = rgb[idx]
                else:
                    value = 0
                
                vlog(f"Color RGB read", {"port": port, "component": component, "value": value})
                self._send_json({"value": value})

            # === ULTRASONIC SENSOR ===
            elif self.path.startswith('/sensor/ultrasonic/'):
                port = self.path.split('/')[-1]
                sensor = get_sensor(port, UltrasonicSensor)
                value = sensor.distance_centimeters if sensor else 0
                vlog(f"Ultrasonic sensor read", {"port": port, "distance": value})
                self._send_json({"value": value})

            # === GYRO SENSOR ===
            elif self.path.startswith('/sensor/gyro/'):
                parts = self.path.split('/')
                port = parts[3]
                mode = parts[4] if len(parts) > 4 else 'angle'
                
                sensor = get_sensor(port, GyroSensor)
                if sensor:
                    if mode == 'angle':
                        value = sensor.angle
                    elif mode == 'rate':
                        value = sensor.rate
                    else:
                        value = 0
                else:
                    value = 0
                
                vlog(f"Gyro sensor read", {"port": port, "mode": mode, "value": value})
                self._send_json({"value": value})

            # === INFRARED SENSOR ===
            elif self.path.startswith('/sensor/infrared/'):
                parts = self.path.split('/')
                port = parts[3]
                mode = parts[4] if len(parts) > 4 else 'proximity'
                
                sensor = get_sensor(port, InfraredSensor)
                
                if not sensor:
                    self._send_json({"value": 0})
                    return
                
                if mode == 'proximity':
                    value = sensor.proximity
                elif mode == 'heading':
                    channel = int(parts[5]) if len(parts) > 5 else 1
                    value = sensor.heading(channel)
                elif mode == 'distance':
                    channel = int(parts[5]) if len(parts) > 5 else 1
                    value = sensor.distance(channel) or 0
                elif mode == 'button':
                    channel = int(parts[5]) if len(parts) > 5 else 1
                    button = parts[6] if len(parts) > 6 else 'top_left'
                    button_methods = {
                        'top_left': sensor.top_left,
                        'bottom_left': sensor.bottom_left,
                        'top_right': sensor.top_right,
                        'bottom_right': sensor.bottom_right,
                        'beacon': sensor.beacon
                    }
                    value = button_methods.get(button, lambda ch: False)(channel)
                else:
                    value = 0
                
                vlog(f"Infrared sensor read", {"port": port, "mode": mode, "value": value})
                self._send_json({"value": value})

            # === BUTTONS ===
            elif self.path.startswith('/button/'):
                button_name = self.path.split('/')[-1]
                button_map = {
                    'up': buttons.up,
                    'down': buttons.down,
                    'left': buttons.left,
                    'right': buttons.right,
                    'enter': buttons.enter,
                    'backspace': buttons.backspace
                }
                pressed = button_map.get(button_name, False)
                vlog(f"Button read", {"button": button_name, "pressed": pressed})
                self._send_json({"value": pressed})

            else:
                self._send_json({"status": "error", "msg": "Unknown endpoint"}, 404)

        except Exception as e:
            log(f"Error processing GET", str(e))
            if VERBOSE:
                import traceback
                traceback.print_exc()
            self._send_json({"status": "error", "msg": str(e)}, 500)

def run_server():
    """Start HTTP server"""
    server = socketserver.TCPServer(("", PORT), BridgeHandler)
    log(f"Bridge server listening on port {PORT}")
    log(f"Verbose logging: {'ENABLED' if VERBOSE else 'DISABLED'}")
    log(f"Scripts directory: {SCRIPTS_DIR}")
    log(f"Sounds directory: {SOUNDS_DIR}")
    server.serve_forever()

def ui_loop():
    """Display UI on EV3 screen"""
    last_update = 0
    update_interval = 1.0  # Update every second
    
    while True:
        current_time = time.time()
        
        if current_time - last_update >= update_interval:
            display.clear()
            
            # Title
            display.text_pixels("EV3 BRIDGE v2.0", x=10, y=5)
            display.text_pixels("-" * 20, x=10, y=20)
            
            # Status
            display.text_pixels(f"Port: {PORT}", x=10, y=35)
            display.text_pixels(f"Scripts: {len(running_scripts)}", x=10, y=50)
            
            # Motor status
            y = 65
            for port, motor in motors.items():
                if motor:
                    display.text_pixels(f"M{port}: {motor.position}", x=10, y=y)
                    y += 15
                    if y > 110:
                        break
            
            # Sensors
            sensor_count = len([s for s in sensors.values() if s is not None])
            if sensor_count > 0:
                display.text_pixels(f"Sensors: {sensor_count}", x=10, y=95)
            
            # Instructions
            display.text_pixels("Press BACK to exit", x=10, y=115)
            
            display.update()
            last_update = current_time
        
        # Check for exit button
        if buttons.backspace:
            log("Backspace pressed - exiting")
            display.clear()
            display.text_pixels("Shutting down...", x=30, y=60)
            display.update()
            time.sleep(1)
            sys.exit(0)
        
        time.sleep(0.1)

def main():
    """Main entry point"""
    global VERBOSE
    
    parser = argparse.ArgumentParser(description='EV3 Bridge Server v2.0')
    parser.add_argument('--port', type=int, default=8080, help='HTTP server port (default: 8080)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose debug logging')
    parser.add_argument('--no-ui', action='store_true', help='Disable LCD UI (headless mode)')
    
    args = parser.parse_args()
    
    global PORT
    PORT = args.port
    VERBOSE = args.verbose
    
    # Banner
    print("=" * 50)
    print("EV3 BRIDGE SERVER v2.0")
    print("=" * 50)
    print(f"Port: {PORT}")
    print(f"Verbose: {VERBOSE}")
    print(f"UI: {'Disabled' if args.no_ui else 'Enabled'}")
    print("=" * 50)
    
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    if args.no_ui:
        # Headless mode - just keep running
        log("Running in headless mode (no UI)")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            log("Interrupted - shutting down")
    else:
        # Run UI loop in main thread
        ui_loop()

if __name__ == "__main__":
    main()