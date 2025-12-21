import asyncio
import websockets
import serial
import serial.tools.list_ports
import base64
import sys
import os
from datetime import datetime

# --- CONFIGURATION ---
LISTEN_PORT = 8080
NXT_COM_PORT = None  # Auto-detect
DEBUG = True
LOG_TO_FILE = False

# ✅ Initialize ANSI colors for Windows
def init_colors():
    if sys.platform == "win32":
        try:
            os.system('color')
            return True
        except:
            return False
    return True

USE_COLORS = init_colors()

# Packet statistics
stats = {
    'to_nxt': 0,
    'from_nxt': 0,
    'errors': 0,
    'start_time': None
}

# Opcode lookup
OPCODE_NAMES = {
    0x00: 'DIRECT_CMD', 0x80: 'DIRECT_CMD_NO_REPLY', 0x01: 'SYSTEM_CMD',
    0x02: 'REPLY', 0x03: 'PLAY_TONE', 0x04: 'SET_OUT_STATE', 0x05: 'SET_IN_MODE',
    0x06: 'GET_OUT_STATE', 0x07: 'GET_IN_VALS', 0x0A: 'RESET_POSITION',
    0x0B: 'GET_BATT_LVL', 0x0E: 'LS_GET_STATUS', 0x0F: 'LS_WRITE',
    0x10: 'LS_READ', 0x94: 'READ_IO_MAP', 0x95: 'WRITE_IO_MAP'
}

def log_packet(direction, data, description=""):
    """Log packet with timestamp and hex dump"""
    if not DEBUG:
        return
    
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    hex_str = data.hex().upper()
    
    # Parse packet structure
    details = ""
    if len(data) >= 2:
        length = data[0] | (data[1] << 8)
        details = f" [Len:{length}]"
        
        if len(data) >= 4:
            cmd_type = data[2]
            opcode = data[3]
            cmd_name = OPCODE_NAMES.get(cmd_type, f"0x{cmd_type:02X}")
            op_name = OPCODE_NAMES.get(opcode, f"0x{opcode:02X}")
            details += f" [{cmd_name} → {op_name}]"
    
    # Colors
    if USE_COLORS:
        COLORS = {'TO': '\033[94m', 'FROM': '\033[92m', 'ERROR': '\033[91m', 'RESET': '\033[0m'}
    else:
        COLORS = {'TO': '', 'FROM': '', 'ERROR': '', 'RESET': ''}
    
    if direction == "TO_NXT":
        arrow = "➡️" if USE_COLORS else "=>"
        color = COLORS['TO']
        # ✅ Stats incremented in relay_handler, not here
    else:
        arrow = "⬅️" if USE_COLORS else "<="
        color = COLORS['FROM']
    
    log_line = f"[{timestamp}] {arrow} {direction}: {hex_str}{details}"
    if description:
        log_line += f" | {description}"
    
    print(f"{color}{log_line}{COLORS['RESET']}")
    
    if LOG_TO_FILE:
        with open('nxt_bridge_log.txt', 'a') as f:
            f.write(f"{log_line}\n")

def print_stats():
    if not DEBUG or stats['start_time'] is None:
        return
    
    elapsed = (datetime.now() - stats['start_time']).total_seconds()
    print(f"\n📊 Statistics:")
    print(f"   Uptime: {elapsed:.1f}s")
    print(f"   Packets TO NXT: {stats['to_nxt']}")
    print(f"   Packets FROM NXT: {stats['from_nxt']}")
    print(f"   Errors: {stats['errors']}")
    if elapsed > 0:
        print(f"   Rate: {(stats['to_nxt'] + stats['from_nxt']) / elapsed:.1f} packets/sec")

print(f"🚀 Initializing NXT WebSocket Bridge...")
if DEBUG:
    print("🔍 DEBUG MODE ENABLED - Packet traffic will be logged")
    if LOG_TO_FILE:
        print("📝 Logging to file: nxt_bridge_log.txt")
    if not USE_COLORS:
        print("⚠️  ANSI colors disabled (unsupported terminal)")

def find_nxt_port():
    ports = serial.tools.list_ports.comports()
    nxt_keywords = ['bluetooth', 'rfcomm', 'nxt', 'serial']
    
    for port in ports:
        port_name = port.device.lower()
        port_desc = (port.description or '').lower()
        
        for keyword in nxt_keywords:
            if keyword in port_name or keyword in port_desc:
                print(f"🔍 Found potential NXT port: {port.device} - {port.description}")
                return port.device
    
    return None

NXT_COM_PORT = find_nxt_port()

if not NXT_COM_PORT:
    print("\n❌ Could not auto-detect NXT port!")
    print("\n📋 Available ports:")
    for port in serial.tools.list_ports.comports():
        print(f"   {port.device} - {port.description}")
    
    user_input = input("\n🔧 Enter COM port manually (or press Enter to quit): ").strip()
    if user_input:
        NXT_COM_PORT = user_input
    else:
        sys.exit(1)

try:
    ser = serial.Serial(NXT_COM_PORT, baudrate=115200, timeout=0.1)
    print(f"✅ Connected to NXT on {NXT_COM_PORT}")
except Exception as e:
    print(f"❌ Failed to open {NXT_COM_PORT}: {e}")
    print("\n💡 Make sure:")
    print("   1. NXT is paired via Bluetooth in Windows/macOS settings")
    print("   2. No other app is using the port")
    print("   3. The port exists in Device Manager")
    sys.exit(1)

async def relay_handler(websocket):
    client_ip = websocket.remote_address[0]
    print(f"📱 Client connected from {client_ip}")
    
    if stats['start_time'] is None:
        stats['start_time'] = datetime.now()
    
    # ✅ CORRECTED: Zero-Logic Relay - No buffering!
    async def nxt_to_client():
        while True:
            try:
                if ser and ser.in_waiting > 0:
                    # Read whatever is currently in the OS serial buffer
                    chunk = ser.read(ser.in_waiting)
                    
                    if chunk:  # ✅ Only process if we got data
                        log_packet("FROM_NXT", chunk)
                        stats['from_nxt'] += 1
                        
                        # Send immediately - iPad's handleIncomingData() 
                        # will reassemble chunks into complete Telegrams
                        b64_data = base64.b64encode(chunk).decode('utf-8')
                        await websocket.send(b64_data)
                        
            except Exception as e:
                stats['errors'] += 1
                if DEBUG:
                    print(f"⚠️ NXT read error: {e}")
                break
            
            # ✅ 5ms poll for responsive sensor data
            await asyncio.sleep(0.005)
    
    nxt_task = asyncio.create_task(nxt_to_client())
    
    try:
        async for message in websocket:
            try:
                raw_telegram = base64.b64decode(message)
                
                # Skip empty messages
                if len(raw_telegram) == 0:
                    continue
                
                log_packet("TO_NXT", raw_telegram)
                stats['to_nxt'] += 1
                
                if ser:
                    # ✅ Protected write with retry and flush
                    retry_count = 0
                    max_retries = 3
                    
                    while retry_count < max_retries:
                        try:
                            ser.write(raw_telegram)
                            ser.flush()  # ✅ Ensure transmission
                            break
                            
                        except serial.SerialException as e:
                            retry_count += 1
                            stats['errors'] += 1
                            if DEBUG:
                                print(f"⚠️ Serial write error (attempt {retry_count}/{max_retries}): {e}")
                            if retry_count < max_retries:
                                await asyncio.sleep(0.02)
                            else:
                                if DEBUG:
                                    print(f"❌ Serial write failed after {max_retries} attempts")
                                    
                        except Exception as e:
                            stats['errors'] += 1
                            if DEBUG:
                                print(f"❌ Unexpected serial error: {e}")
                            break
                            
            except Exception as e:
                stats['errors'] += 1
                if DEBUG:
                    print(f"❌ Message handling error: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"📴 Client {client_ip} disconnected")
        if DEBUG:
            print_stats()
    finally:
        nxt_task.cancel()

async def main():
    async with websockets.serve(relay_handler, "0.0.0.0", LISTEN_PORT):
        local_ip = get_local_ip()
        print(f"\n🎉 Bridge running!")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📡 WebSocket Server: ws://{local_ip}:{LISTEN_PORT}")
        print(f"🔗 Local connection:  ws://localhost:{LISTEN_PORT}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"\n💡 In TurboWarp/Scratch:")
        print(f"   Use block: connect to [{local_ip}:{LISTEN_PORT}]")
        print(f"\n📱 For iPad/Phone on same WiFi:")
        print(f"   Use: {local_ip}:{LISTEN_PORT}")
        print(f"\n⌨️  Press Ctrl+C to stop\n")
        await asyncio.get_running_loop().create_future()

def get_local_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Bridge stopped")
        if DEBUG:
            print_stats()
        if ser:
            ser.close()