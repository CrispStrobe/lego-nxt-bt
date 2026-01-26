# TurboWarp Extensions (mostly for LEGO Hubs)

For some of these, if you use them on Desktop (Windows, MacOS), you need the LEGO SratchLink software as a bridge. Alternatively, some of these extensions support a custom (Websocket) bridge.

For most most these, you must disable Sandbox Mode in TurboWarp.

For iOS, you might try them in Scrub App which provides a ScratchLink-like functionality (https://github.com/bricklife/Scrub) (this is untested yet).

## LEGO Spike Prime = Robot Inventor Hub

### Bluetooth Classic (BTC)

Use **legospikeprime_btc.js**

Note for this you need the older 2.x firmware firmware which works with Bluetooth Classics (BTC).

You can switch firmwares by running upgrade from spike prime app, or downgrade https://spikelegacy.legoeducation.com/hubdowngrade/#step-1 or dfu-util/pybricksdev (backup/restore)

### Bluetooth Low Energe (BLE)

This is work in progress and i could net yet test it: **legospike_ble.js** 

For this you need the newer firmware (you can upgrade from spike prime app).

## LEGO Boost (BLE)

Try **legoboost_scratchlink.js** (with ScratchLink installed).

## LEGO EV3

### Original Firmware 

Connecting to the original Firmware would also be possible but only in direct streaming mode (controlling PC/Tablet must be active) (upload would require more efforts than i can invest atm at least).

### EV3DEV Firmware

With ev3dev, you have Linux on the device and can do lots of cool things.

For instance, you can run a simple python bridge: **ev3_ondevice_bridge.py** which will support both streaming mode as well as uploading scripts directly from TurboWarp, from which we simply transpile them to python scripts and upload them.

For this, you need **ev3_transpile.js** extension in TurboWarp.

This is all work in progress.

## LEGO NXT

**legonxt_transpile_scratchlink.js** works with ScratchLink and gives you the option to transpile the Codeblocks to NXC and then compile them to RXE files which the NXT Brick can run directly. 

The compilation needs internet connectivity, because it uses a REST API which wraps NBC (https://bricxcc.sourceforge.net/nbc/) and lsmasm (https://github.com/ev3dev/lmsasm) at https://lego-compiler.vercel.app/ (source: https://github.com/CrispStrobe/legacy-lego-compiler).

(There are other, yet incomplete legonxt_transpile_direct and legonxt_transpile_bridge scripts. I might bring those up to feature parity sometime, but they were mostly for testing only.)

**legonxt-direct.js** will give you direct control of the NXT Brick. Note you probably must beforehand connect over your device Bluetooth Settings the Brick, then you will have it available for TurboWarp.

**legonxt_turbowarp.js** uses a Websocket bridge script, **nxt_bridge.py** (older attempt: **lego_bridge.py**), which you must keep running. 

(This is very much work in progress, and **nxt-diag.py** (connection tests), **nxt-pybluez-bridge.py** (exterimental alternative bridge), **reset_nxt.sh** (resets pairing on macOS) and **test_bt.py** (test BT discovery) are test/debug script artifacts which i keep here for now.)

Below you find a few more technical details.

## Non-LEGO Extensions

### Math

**csp.js** gives you a simple Constraint-Satisfaction-Problem solver

**planetemaths.js** gives you some more basic maths ops etc. This is rewritten from the CodePM extension.

**arrays.js** provides some handling for arrays / vectors / tensors.

### Gamepad ###

**gamepad.js** is untested yet.



# LEGO NXT Bluetooth Control for TurboWarp

Control LEGO Mindstorms NXT robots directly from TurboWarp using Bluetooth. This project provides both a WebSocket bridge for remote access and a direct Web Serial API extension for local connections.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## 🎯 Features

### Motor Control
- Continuous motor power control (-100% to 100%)
- Precise angle-based movement (degrees/rotations)
- Position tracking and reset
- Brake and coast modes

### Sensor Support
- **Touch Sensor**: Boolean press detection
- **Light Sensor**: Brightness readings (0-1023) with LED control
- **Sound Sensor**: Loudness measurement in dB/dBA mode
- **Ultrasonic Sensor**: Distance measurement (0-255 cm) via I2C

### Display Graphics
- Clear screen and update display
- Draw text with 5×7 bitmap font (A-Z, 0-9, symbols)
- Draw pixels, lines, rectangles (filled/outline)
- Built-in patterns (checkerboard, stripes, grid, dots, border)
- Screen capture (returns base64 BMP image)

### Sound
- Play tones (200-14000 Hz)
- Musical notes (C4-B5)

### Status
- Battery voltage monitoring (mV)
- Connection status

## 📋 Requirements

### Hardware
- LEGO Mindstorms NXT brick (NXT 1.0 or 2.0)
- Bluetooth connection (built-in NXT Bluetooth)
- **macOS, Windows, or Linux** computer

### Software
- **Python 3.8+** (for WebSocket bridge)
- **Chrome/Edge 89+** (for Web Serial API) (TurboWarp desktop might work for our bridge, but has afaik atm no sufficient Web Serial support - untested)
- **Python packages**: `websockets`, `pyserial`

```bash
pip install websockets pyserial
```

## 🚀 Quick Start

### Method 1: WebSocket Bridge (Recommended for iPad/Remote Access)

1. **Pair NXT via Bluetooth** (see [macOS Setup](#macos-bluetooth-setup) below)

2. **Run the bridge**:
```bash
python nxt_bridge.py
```

3. **Load extension in TurboWarp**:
   - Load `legonxt_turbowarp.js` as a custom extension
   - Use the "connect to [URL]" block with `localhost:8080`

### Method 2 (experimental): Direct Web Serial (Desktop Only) (untested)

1. **Pair NXT via Bluetooth**
2. **Load extension** in TurboWarp Desktop
3. **Connect** and select `/dev/cu.NXT` (macOS) or appropriate COM port

## 🔧 Setup

### macOS Bluetooth Setup

**Critical Steps** (Bluetooth connection drops frequently on macOS):

1. **Forget existing pairing** (if any):
```bash
blueutil --disconnect 00-16-53-XX-XX-XX
blueutil --unpair 00-16-53-XX-XX-XX
```

2. **Turn NXT off and back on**

3. **Re-pair with PIN 1234**:
```bash
blueutil --pair 00-16-53-XX-XX-XX
# Enter PIN: 1234
```

4. **Verify connection**:
```bash
python nxt-diag.py
```

You should hear a beep and see battery data!

**⚠️ Important**: The Bluetooth connection may drop after inactivity. If commands stop working, **repeat the pairing process** using the `reset_nxt.sh` script:

```bash
chmod +x reset_nxt.sh
./reset_nxt.sh
```

### Windows Setup

1. Pair NXT via Bluetooth settings
   You probably must first enable "Advanced" Discovery in Windows 11:
   Open Settings (Win + I).
   Go to Bluetooth & devices > Devices.
   Scroll down to Device settings.
   Change Bluetooth devices discovery from "Default" to Advanced.
   Enter the NXT Bluetooth PIN: default = 1234

   Note you might also do this in Windows Terminal:

```cmd
btpair -u
```

2. Note the COM port (Windows)
3. Run the bridge

### Linux Setup

You can inspect the COM port at `/dev/rfcomm0`

## 📁 File Descriptions

### JavaScript Extensions

| File | Description |
|------|-------------|
| `legonxt_turbowarp.js` | Lego NXT over local Python Bridge (Full feature set) |
| `legonxt-direct.js` | Lego NXT Direct Bluetooth Connection (Development version) |

### Python Bridge

| File | Description |
|------|-------------|
| `nxt_bridge.py` | **WebSocket bridge** - Polling-based for reliable communication |
| `nxt-diag.py` | **Diagnostic tool** - Test Bluetooth connection |
| `nxt-pybluez-bridge.py` | PyBluez alternative bridge (experimental) |
| `reset_nxt.sh` | Quick reset script for macOS pairing |
| `test_bt.py` | Bluetooth discovery test |

## 💻 Usage Examples

### Basic Motor Control

```scratch
when flag clicked
connect to [localhost:8080]
wait until <connected?>
motor [A] power [75] %
wait (2) seconds
motor [A] [brake]
```

### Sensor Reading

```scratch
setup ultrasonic [S4]
forever
  say (join [Distance: ] (ultrasonic [S4] distance (cm)))
end
```

### Display Graphics

```scratch
clear screen
draw text [HELLO NXT] at x:[10] y:[10]
draw line from x:[0] y:[0] to x:[99] y:[63]
🖥️ update display
wait (3) seconds  // Display update takes 1-3 seconds
```

### Pattern Drawing

```scratch
draw pattern [checkerboard]
wait (2) seconds
draw pattern [smile]
```

## 🐛 Troubleshooting

### Problem: No beep, no data received

**Cause**: Bluetooth connection not established

**Solution**:
1. Run `blueutil --unpair <MAC-address>`
2. Turn NXT off/on
3. Re-pair with PIN 1234
4. Test with `python nxt-diag.py`

### Problem: Commands sent but nothing happens

**Cause**: Bluetooth RFCOMM channel dropped

**Solution**:
- Run `./reset_nxt.sh` to reset connection
- Wait 10 seconds after pairing before testing

### Problem: Display patterns work, but text/drawings don't

**Cause**: Missing `updateDisplay()` method

**Solution**: 
- Ensure you're using `legonxt_turbowarp.js` (latest version)
- Call "🖥️ update display" block after drawing operations
- Wait 2-3 seconds for display update to complete

### Problem: `ModuleNotFoundError: No module named 'serial'`

**Cause**: Must install python package `pyserial`

**Solution**:
```bash
pip install pyserial
```

### Problem: "Port not found" error

**macOS**: Use `/dev/cu.NXT` (NOT e.g. `/dev/cu.Bluetooth-Incoming-Port`)

**Windows**: Check Device Manager for COM port number

**Linux**: Try `/dev/rfcomm0` or create with `rfcomm bind`

## ⚡ Performance Notes

### Display Operations
- **Update time**: 1-3 seconds per display update
- **Strategy**: Batch all drawing operations, call `updateDisplay()` once
- **Buffer size**: 800 bytes (100×64 pixels ÷ 8 bits)

```javascript
// Try this pattern (faster)
clearScreen();
drawText('Line 1', 0, 0);
drawText('Line 2', 0, 10);
drawRect(0, 0, 100, 64, false);
updateDisplay();  // Single 1-3s operation

// Probably worse pattern (slower)
drawText('Line 1', 0, 0);
updateDisplay();  // 1-3s wait
drawText('Line 2', 0, 10);
updateDisplay();  // Another 1-3s wait
```

## 🔬 Protocol Details

### NXT Telegram Structure
```
[2-byte length (LE)] [command type] [opcode] [payload...]
```

**Command Types**:
- `0x00`: Direct command (with reply)
- `0x80`: Direct command (no reply)
- `0x01`: System command (with reply)
- `0x02`: Reply telegram

**Key Opcodes**:
- `0x03`: PLAY_TONE
- `0x04`: SET_OUT_STATE (motors)
- `0x05`: SET_IN_MODE (sensors)
- `0x07`: GET_IN_VALS (read sensor)
- `0x0B`: GET_BATT_LVL (battery)
- `0x0F`/`0x10`: LS_WRITE/LS_READ (I2C)
- `0x94`/`0x95`: READ_IO_MAP/WRITE_IO_MAP (display)

### Display Memory Layout
- **Resolution**: 100×64 pixels (monochrome)
- **Module ID**: `0xA0001` (little-endian)
- **Offset**: 119
- **Format**: 800 bytes, 8 vertical pixels per byte
- **Bit order**: LSB = top pixel, MSB = bottom pixel

## 📜 License

This project is licensed under the GNU General Public License v3.0.

**Happy building! 🤖**