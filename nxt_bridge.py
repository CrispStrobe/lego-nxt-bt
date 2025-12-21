import asyncio
import websockets
import serial
import serial.tools.list_ports
import base64
import sys

# --- CONFIGURATION ---
LISTEN_PORT = 8080
NXT_COM_PORT = None  # Auto-detect

print(f"🚀 Initializing NXT WebSocket Bridge...")

# Auto-detect NXT port
def find_nxt_port():
    """Find the NXT Bluetooth COM port automatically"""
    ports = serial.tools.list_ports.comports()
    
    # Common NXT port names
    nxt_keywords = ['bluetooth', 'rfcomm', 'nxt', 'serial']
    
    for port in ports:
        port_name = port.device.lower()
        port_desc = (port.description or '').lower()
        
        # Check for common patterns
        for keyword in nxt_keywords:
            if keyword in port_name or keyword in port_desc:
                print(f"🔍 Found potential NXT port: {port.device} - {port.description}")
                return port.device
    
    return None

# Try to find NXT automatically
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

# Initialize Serial Connection
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
    print(f"📱 Client connected from {websocket.remote_address[0]}")
    
    # Task to handle data coming FROM the NXT to the client
    async def nxt_to_client():
        while True:
            try:
                if ser and ser.in_waiting > 0:
                    data = ser.read(ser.in_waiting)
                    b64_data = base64.b64encode(data).decode('utf-8')
                    await websocket.send(b64_data)
            except Exception as e:
                print(f"⚠️ NXT read error: {e}")
                break
            await asyncio.sleep(0.01)
    
    nxt_task = asyncio.create_task(nxt_to_client())
    
    try:
        # Handle data coming FROM the client to the NXT
        async for message in websocket:
            try:
                raw_telegram = base64.b64decode(message)
                if ser:
                    # ✅ Added try/except for serial write
                    try:
                        ser.write(raw_telegram)
                    except serial.SerialException as e:
                        print(f"⚠️ Serial write error: {e}")
                        # Try to recover
                        await asyncio.sleep(0.01)
                    except Exception as e:
                        print(f"❌ Unexpected serial error: {e}")
            except Exception as e:
                print(f"❌ Message handling error: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"📴 Client disconnected")
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
        if ser:
            ser.close()
