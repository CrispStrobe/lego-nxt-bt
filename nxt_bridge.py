import asyncio
import websockets
import serial
import base64
import sys
import time
from datetime import datetime

LISTEN_PORT = 8080
NXT_COM_PORT = "/dev/cu.NXT"
DEBUG = True

stats = {'to_nxt': 0, 'from_nxt': 0, 'errors': 0, 'start_time': None}

OPCODE_NAMES = {
    0x00: 'DIRECT_CMD', 0x80: 'DIRECT_CMD_NO_REPLY', 0x01: 'SYSTEM_CMD',
    0x02: 'REPLY', 0x03: 'PLAY_TONE', 0x04: 'SET_OUT_STATE', 0x05: 'SET_IN_MODE',
    0x06: 'GET_OUT_STATE', 0x07: 'GET_IN_VALS', 0x0A: 'RESET_POSITION',
    0x0B: 'GET_BATT_LVL', 0x0E: 'LS_GET_STATUS', 0x0F: 'LS_WRITE',
    0x10: 'LS_READ', 0x94: 'READ_IO_MAP', 0x95: 'WRITE_IO_MAP'
}

def log_packet(direction, data, description=""):
    if not DEBUG:
        return
    
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    hex_str = data.hex().upper()
    
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
    
    arrow = "➡️" if direction == "TO_NXT" else "⬅️"
    color = '\033[94m' if direction == "TO_NXT" else '\033[92m'
    
    log_line = f"[{timestamp}] {arrow} {direction}: {hex_str}{details}"
    if description:
        log_line += f" | {description}"
    
    print(f"{color}{log_line}\033[0m")

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

print("🚀 NXT WebSocket Bridge (Polling Mode)")
if DEBUG:
    print("🔍 DEBUG MODE ENABLED\n")

# Open serial with SHORT timeout (we'll poll instead of blocking)
try:
    ser = serial.Serial(NXT_COM_PORT, baudrate=115200, timeout=0.1)
    print(f"✅ Connected to NXT on {NXT_COM_PORT}")
except Exception as e:
    print(f"❌ Failed to open {NXT_COM_PORT}: {e}")
    sys.exit(1)


def read_nxt_packet_polling():
    """
    ✅ FIXED: Poll for data instead of blocking read
    This matches the diagnostic script that works!
    """
    try:
        # Poll for up to 5 seconds (NXT can be slow!)
        start_time = time.time()
        timeout = 5.0
        
        # Wait for at least 2 bytes (header)
        while time.time() - start_time < timeout:
            if ser.in_waiting >= 2:
                break
            time.sleep(0.01)  # 10ms poll interval
        
        # Check if we got header
        if ser.in_waiting < 2:
            return None  # Timeout, no data
        
        # Read header
        header = ser.read(2)
        if len(header) < 2:
            return None
        
        length = header[0] | (header[1] << 8)
        
        if length > 256 or length == 0:
            if DEBUG:
                print(f"⚠️ Invalid length: {length}")
            return None
        
        # Now wait for the data payload
        start_time = time.time()
        while time.time() - start_time < timeout:
            if ser.in_waiting >= length:
                break
            time.sleep(0.01)
        
        # Read data
        data = ser.read(length)
        
        if len(data) < length:
            if DEBUG:
                print(f"⚠️ Incomplete: got {len(data)}/{length}")
            return None
        
        return header + data
        
    except Exception as e:
        if DEBUG:
            print(f"⚠️ Read error: {e}")
        return None


async def relay_handler(websocket):
    client_ip = websocket.remote_address[0]
    print(f"📱 Client connected from {client_ip}")
    
    if stats['start_time'] is None:
        stats['start_time'] = datetime.now()
    
    # Read from NXT
    async def nxt_to_client():
        """Continuously poll for NXT packets"""
        while True:
            try:
                # Run polling read in executor (non-blocking)
                packet = await asyncio.get_event_loop().run_in_executor(
                    None, read_nxt_packet_polling
                )
                
                if packet:
                    log_packet("FROM_NXT", packet)
                    stats['from_nxt'] += 1
                    
                    b64_data = base64.b64encode(packet).decode('utf-8')
                    await websocket.send(b64_data)
                else:
                    # No packet, brief sleep
                    await asyncio.sleep(0.05)
                    
            except Exception as e:
                stats['errors'] += 1
                if DEBUG:
                    print(f"⚠️ Reader error: {e}")
                break
    
    reader_task = asyncio.create_task(nxt_to_client())
    
    try:
        async for message in websocket:
            try:
                raw_telegram = base64.b64decode(message)
                
                if len(raw_telegram) == 0:
                    continue
                
                log_packet("TO_NXT", raw_telegram)
                stats['to_nxt'] += 1
                
                # Write to NXT
                retry_count = 0
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        ser.write(raw_telegram)
                        ser.flush()
                        break
                        
                    except Exception as e:
                        retry_count += 1
                        stats['errors'] += 1
                        if DEBUG:
                            print(f"⚠️ Write error (attempt {retry_count}/{max_retries}): {e}")
                        
                        if retry_count < max_retries:
                            await asyncio.sleep(0.02)
                        else:
                            if DEBUG:
                                print(f"❌ Write failed after {max_retries} attempts")
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
        reader_task.cancel()


async def main():
    async with websockets.serve(relay_handler, "0.0.0.0", LISTEN_PORT):
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(('8.8.8.8', 1))
            local_ip = s.getsockname()[0]
        except:
            local_ip = '127.0.0.1'
        finally:
            s.close()
        
        print(f"\n🎉 Bridge running!")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📡 WebSocket: ws://{local_ip}:{LISTEN_PORT}")
        print(f"🔗 Local: ws://localhost:{LISTEN_PORT}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"\n💡 In TurboWarp: connect to [{local_ip}:{LISTEN_PORT}]")
        print(f"⌨️  Press Ctrl+C to stop\n")
        await asyncio.get_running_loop().create_future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Bridge stopped")
        if DEBUG:
            print_stats()
        if ser:
            ser.close()