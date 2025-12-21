(function(Scratch) {
    'use strict';

    const Cast = Scratch.Cast;

    // ==================== CONSTANTS ====================
    
    const NXT_OPCODE = {
        DIRECT_CMD: 0x00,
        DIRECT_CMD_NO_REPLY: 0x80,
        SYSTEM_CMD: 0x01,
        REPLY: 0x02,
        
        PLAY_TONE: 0x03,
        SET_OUT_STATE: 0x04,
        SET_IN_MODE: 0x05,
        GET_OUT_STATE: 0x06,
        GET_IN_VALS: 0x07,
        RESET_POSITION: 0x0A,
        GET_BATT_LVL: 0x0B,
        LS_GET_STATUS: 0x0E,
        LS_WRITE: 0x0F,
        LS_READ: 0x10,
        READ_IO_MAP: 0x94,
        WRITE_IO_MAP: 0x95
    };

    const SENSOR_TYPE = {
        SWITCH: 0x01,
        LIGHT_ACTIVE: 0x05,
        LIGHT_INACTIVE: 0x06,
        SOUND_DB: 0x07,
        SOUND_DBA: 0x08,
        LOW_SPEED_9V: 0x0B
    };

    const SENSOR_MODE = {
        RAW: 0x00,
        BOOL: 0x20,
        TRANSITION_CNT: 0x40,
        PERIOD_COUNTER: 0x60,
        PCT_FULL_SCALE: 0x80,
        CELSIUS: 0xA0,
        FAHRENHEIT: 0xC0,
        ANGLE_STEPS: 0xE0
    };

    const MOTOR_MODE = {
        IDLE: 0x00,
        ON: 0x01,
        BRAKE: 0x02,
        REGULATED: 0x04
    };

    const MODULE_DISPLAY = 0xA0001;
    const DISPLAY_OFFSET = 119;
    const DISPLAY_WIDTH = 100;
    const DISPLAY_HEIGHT = 64;

    // ==================== HELPERS ====================

    function base64ToBytes(b64) {
        const str = atob(b64);
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }

    function bytesToBase64(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    // Simple 5x7 bitmap font for screen text
    const FONT_5X7 = {
        ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
        'A': [0x7C, 0x12, 0x11, 0x12, 0x7C],
        'B': [0x7F, 0x49, 0x49, 0x49, 0x36],
        'C': [0x3E, 0x41, 0x41, 0x41, 0x22],
        'D': [0x7F, 0x41, 0x41, 0x22, 0x1C],
        'E': [0x7F, 0x49, 0x49, 0x49, 0x41],
        'F': [0x7F, 0x09, 0x09, 0x09, 0x01],
        'G': [0x3E, 0x41, 0x49, 0x49, 0x7A],
        'H': [0x7F, 0x08, 0x08, 0x08, 0x7F],
        'I': [0x00, 0x41, 0x7F, 0x41, 0x00],
        'J': [0x20, 0x40, 0x41, 0x3F, 0x01],
        'K': [0x7F, 0x08, 0x14, 0x22, 0x41],
        'L': [0x7F, 0x40, 0x40, 0x40, 0x40],
        'M': [0x7F, 0x02, 0x0C, 0x02, 0x7F],
        'N': [0x7F, 0x04, 0x08, 0x10, 0x7F],
        'O': [0x3E, 0x41, 0x41, 0x41, 0x3E],
        'P': [0x7F, 0x09, 0x09, 0x09, 0x06],
        'Q': [0x3E, 0x41, 0x51, 0x21, 0x5E],
        'R': [0x7F, 0x09, 0x19, 0x29, 0x46],
        'S': [0x46, 0x49, 0x49, 0x49, 0x31],
        'T': [0x01, 0x01, 0x7F, 0x01, 0x01],
        'U': [0x3F, 0x40, 0x40, 0x40, 0x3F],
        'V': [0x1F, 0x20, 0x40, 0x20, 0x1F],
        'W': [0x3F, 0x40, 0x38, 0x40, 0x3F],
        'X': [0x63, 0x14, 0x08, 0x14, 0x63],
        'Y': [0x07, 0x08, 0x70, 0x08, 0x07],
        'Z': [0x61, 0x51, 0x49, 0x45, 0x43],
        '0': [0x3E, 0x51, 0x49, 0x45, 0x3E],
        '1': [0x00, 0x42, 0x7F, 0x40, 0x00],
        '2': [0x42, 0x61, 0x51, 0x49, 0x46],
        '3': [0x21, 0x41, 0x45, 0x4B, 0x31],
        '4': [0x18, 0x14, 0x12, 0x7F, 0x10],
        '5': [0x27, 0x45, 0x45, 0x45, 0x39],
        '6': [0x3C, 0x4A, 0x49, 0x49, 0x30],
        '7': [0x01, 0x71, 0x09, 0x05, 0x03],
        '8': [0x36, 0x49, 0x49, 0x49, 0x36],
        '9': [0x06, 0x49, 0x49, 0x29, 0x1E],
        '!': [0x00, 0x00, 0x5F, 0x00, 0x00],
        '?': [0x02, 0x01, 0x51, 0x09, 0x06],
        '.': [0x00, 0x60, 0x60, 0x00, 0x00],
        ',': [0x00, 0x80, 0x60, 0x00, 0x00],
        ':': [0x00, 0x36, 0x36, 0x00, 0x00],
        '-': [0x08, 0x08, 0x08, 0x08, 0x08],
        '+': [0x08, 0x08, 0x3E, 0x08, 0x08],
        '=': [0x14, 0x14, 0x14, 0x14, 0x14],
    };

    // ==================== PERIPHERAL ====================

    class NXTPeripheral {
        constructor() {
            this.ws = null;
            this.connected = false;
            this.readBuffer = new Uint8Array(0);
            
            // State
            this.battery = 0;
            this.sensors = { S1: 0, S2: 0, S3: 0, S4: 0 };
            this.motors = { A: 0, B: 0, C: 0 };
            this.screenBuffer = new Array(64).fill(0).map(() => new Array(100).fill(0));
            
            // Request tracking
            this.requests = new Map();
            this.nextId = 0;
        }

        async connect(url) {
            return new Promise((resolve, reject) => {
                const wsUrl = url.startsWith('ws://') ? url : `ws://${url}`;
                console.log(`🔌 Connecting to ${wsUrl}...`);
                
                this.ws = new WebSocket(wsUrl);
                
                const timeout = setTimeout(() => {
                    this.ws.close();
                    reject(new Error('Connection timeout'));
                }, 5000);

                this.ws.onopen = async () => {
                    clearTimeout(timeout);
                    this.connected = true;
                    console.log('✅ Connected!');
                    
                    try {
                        await this.getBattery();
                        resolve();
                    } catch (e) {
                        this.disconnect();
                        reject(e);
                    }
                };

                this.ws.onmessage = (e) => {
                    const bytes = base64ToBytes(e.data);
                    this.handleData(bytes);
                };

                this.ws.onerror = () => reject(new Error('WebSocket error'));
                this.ws.onclose = () => {
                    this.connected = false;
                    console.log('❌ Disconnected');
                };
            });
        }

        disconnect() {
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.connected = false;
        }

        async send(opcode, payload = [], needsReply = false, isSystemCmd = false) {
            if (!this.connected) return null;

            let cmd;
            if (isSystemCmd) {
                cmd = needsReply ? NXT_OPCODE.SYSTEM_CMD : NXT_OPCODE.SYSTEM_CMD;
            } else {
                cmd = needsReply ? NXT_OPCODE.DIRECT_CMD : NXT_OPCODE.DIRECT_CMD_NO_REPLY;
            }
            
            const telegram = new Uint8Array([cmd, opcode, ...payload]);
            
            const packet = new Uint8Array(telegram.length + 2);
            packet[0] = telegram.length & 0xFF;
            packet[1] = (telegram.length >> 8) & 0xFF;
            packet.set(telegram, 2);

            if (needsReply) {
                const id = this.nextId++;
                const promise = new Promise((resolve, reject) => {
                    this.requests.set(id, { opcode, resolve, reject });
                    setTimeout(() => {
                        if (this.requests.has(id)) {
                            this.requests.delete(id);
                            reject(new Error('Timeout'));
                        }
                    }, 3000);
                });

                this.ws.send(bytesToBase64(packet));
                return await promise;
            } else {
                this.ws.send(bytesToBase64(packet));
                return null;
            }
        }

        handleData(data) {
            const combined = new Uint8Array(this.readBuffer.length + data.length);
            combined.set(this.readBuffer);
            combined.set(data, this.readBuffer.length);
            this.readBuffer = combined;

            while (this.readBuffer.length >= 2) {
                const len = this.readBuffer[0] | (this.readBuffer[1] << 8);
                if (this.readBuffer.length < len + 2) break;

                const packet = this.readBuffer.slice(2, len + 2);
                this.readBuffer = this.readBuffer.slice(len + 2);
                this.parseReply(packet);
            }
        }

        parseReply(data) {
            if (data.length < 3) return;
            if (data[0] !== NXT_OPCODE.REPLY) return;
            
            const opcode = data[1];
            const status = data[2];
            
            if (status !== 0x00) {
                console.warn(`Error: ${status.toString(16)} for opcode ${opcode.toString(16)}`);
                this.resolveRequest(opcode, null);
                return;
            }

            switch (opcode) {
                case NXT_OPCODE.GET_BATT_LVL:
                    if (data.length >= 5) {
                        this.battery = data[3] | (data[4] << 8);
                        this.resolveRequest(opcode, this.battery);
                    }
                    break;

                case NXT_OPCODE.GET_IN_VALS:
                    if (data.length >= 16) {
                        const port = ['S1', 'S2', 'S3', 'S4'][data[3]];
                        const valid = data[4] === 1;
                        if (valid) {
                            const val = data[14] | (data[15] << 8);
                            this.sensors[port] = val > 32767 ? val - 65536 : val;
                            this.resolveRequest(opcode, this.sensors[port]);
                        }
                    }
                    break;

                case NXT_OPCODE.GET_OUT_STATE:
                    if (data.length >= 25) {
                        const port = ['A', 'B', 'C'][data[3]];
                        const rot = this.toSigned32(data[23], data[24], data[25], data[26]);
                        this.motors[port] = ((rot % 360) + 360) % 360;
                        this.resolveRequest(opcode, this.motors[port]);
                    }
                    break;

                case NXT_OPCODE.LS_READ:
                    if (data.length >= 5) {
                        const bytes = Array.from(data.slice(4, 4 + data[3]));
                        this.resolveRequest(opcode, bytes);
                    }
                    break;

                case NXT_OPCODE.READ_IO_MAP:
                    if (data.length >= 7) {
                        const bytesRead = data[3] | (data[4] << 8);
                        const ioData = Array.from(data.slice(5, 5 + bytesRead));
                        this.resolveRequest(opcode, ioData);
                    }
                    break;

                case NXT_OPCODE.WRITE_IO_MAP:
                    if (data.length >= 7) {
                        const bytesWritten = data[5] | (data[6] << 8);
                        this.resolveRequest(opcode, bytesWritten);
                    }
                    break;
            }
        }

        resolveRequest(opcode, value) {
            for (const [id, req] of this.requests) {
                if (req.opcode === opcode) {
                    req.resolve(value);
                    this.requests.delete(id);
                    break;
                }
            }
        }

        toSigned8(byte) {
            return byte > 127 ? byte - 256 : byte;
        }

        toSigned32(b0, b1, b2, b3) {
            const val = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);
            return val > 2147483647 ? val - 4294967296 : val;
        }

        // ==================== MOTOR COMMANDS ====================

        async setMotor(port, power, brake = true) {
            const ports = { A: 0, B: 1, C: 2 };
            const p = ports[port];
            
            let pwr = Cast.toNumber(power);
            pwr = Math.max(-100, Math.min(100, Math.round(pwr)));
            const pwrByte = pwr < 0 ? 256 + pwr : pwr;
            
            const mode = pwr === 0 ?
                (brake ? MOTOR_MODE.ON | MOTOR_MODE.BRAKE | MOTOR_MODE.REGULATED : MOTOR_MODE.IDLE) :
                MOTOR_MODE.ON | MOTOR_MODE.REGULATED;
            
            await this.send(NXT_OPCODE.SET_OUT_STATE, [
                p, pwrByte, mode, 0x01, 0, 0x20, 0, 0, 0, 0
            ]);
        }

        async motorForDegrees(port, power, degrees) {
            const ports = { A: 0, B: 1, C: 2 };
            let pwr = Cast.toNumber(power);
            pwr = Math.max(-100, Math.min(100, Math.round(pwr)));
            const pwrByte = pwr < 0 ? 256 + pwr : pwr;
            
            const deg = Math.abs(Cast.toNumber(degrees));
            
            await this.send(NXT_OPCODE.SET_OUT_STATE, [
                ports[port], pwrByte,
                MOTOR_MODE.ON | MOTOR_MODE.BRAKE | MOTOR_MODE.REGULATED,
                0x01, 0, 0x20,
                deg & 0xFF, (deg >> 8) & 0xFF, (deg >> 16) & 0xFF, (deg >> 24) & 0xFF
            ]);
            
            const estimatedTime = Math.abs(deg / Math.abs(pwr)) * 1000 + 200;
            await this.sleep(estimatedTime);
        }

        async getMotorPos(port) {
            const ports = { A: 0, B: 1, C: 2 };
            return await this.send(NXT_OPCODE.GET_OUT_STATE, [ports[port]], true);
        }

        async resetMotorPos(port) {
            const ports = { A: 0, B: 1, C: 2 };
            await this.send(NXT_OPCODE.RESET_POSITION, [ports[port], 0]);
        }

        // ==================== SENSOR COMMANDS ====================

        async setupTouch(port) {
            const p = parseInt(port.replace('S', '')) - 1;
            await this.send(NXT_OPCODE.SET_IN_MODE, [p, SENSOR_TYPE.SWITCH, SENSOR_MODE.BOOL]);
            await this.sleep(100);
        }

        async setupLight(port, led = true) {
            const p = parseInt(port.replace('S', '')) - 1;
            const type = led ? SENSOR_TYPE.LIGHT_ACTIVE : SENSOR_TYPE.LIGHT_INACTIVE;
            await this.send(NXT_OPCODE.SET_IN_MODE, [p, type, SENSOR_MODE.RAW]);
            await this.sleep(100);
        }

        async setupSound(port, dBA = true) {
            const p = parseInt(port.replace('S', '')) - 1;
            const type = dBA ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
            await this.send(NXT_OPCODE.SET_IN_MODE, [p, type, SENSOR_MODE.PCT_FULL_SCALE]);
            await this.sleep(100);
        }

        async setupUltrasonic(port) {
            const p = parseInt(port.replace('S', '')) - 1;
            await this.send(NXT_OPCODE.SET_IN_MODE, [p, SENSOR_TYPE.LOW_SPEED_9V, SENSOR_MODE.RAW]);
            await this.sleep(200);
        }

        async getSensor(port) {
            const p = parseInt(port.replace('S', '')) - 1;
            return await this.send(NXT_OPCODE.GET_IN_VALS, [p], true);
        }

        async getUltrasonic(port) {
            const p = parseInt(port.replace('S', '')) - 1;
            
            await this.send(NXT_OPCODE.LS_WRITE, [p, 2, 1, 0x02, 0x42]);
            await this.sleep(50);
            
            const data = await this.send(NXT_OPCODE.LS_READ, [p], true);
            return data && data.length > 0 ? data[0] : 0;
        }

        // ==================== SCREEN COMMANDS ====================

        async readIOMap(moduleId, offset, bytesToRead) {
            const payload = [
                moduleId & 0xFF,
                (moduleId >> 8) & 0xFF,
                (moduleId >> 16) & 0xFF,
                (moduleId >> 24) & 0xFF,
                offset & 0xFF,
                (offset >> 8) & 0xFF,
                bytesToRead & 0xFF,
                (bytesToRead >> 8) & 0xFF
            ];
            
            return await this.send(NXT_OPCODE.READ_IO_MAP, payload, true, true);
        }

        async writeIOMap(moduleId, offset, data) {
            const payload = [
                moduleId & 0xFF,
                (moduleId >> 8) & 0xFF,
                (moduleId >> 16) & 0xFF,
                (moduleId >> 24) & 0xFF,
                offset & 0xFF,
                (offset >> 8) & 0xFF,
                data.length & 0xFF,
                (data.length >> 8) & 0xFF,
                ...data
            ];
            
            return await this.send(NXT_OPCODE.WRITE_IO_MAP, payload, true, true);
        }

        async readScreen() {
            const allData = [];
            
            for (let i = 0; i < 20; i++) {
                const offset = DISPLAY_OFFSET + (i * 40);
                const chunk = await this.readIOMap(MODULE_DISPLAY, offset, 40);
                if (chunk) {
                    allData.push(...chunk);
                } else {
                    console.error(`Failed to read screen chunk ${i}`);
                    return null;
                }
                await this.sleep(10);
            }

            if (allData.length !== 800) {
                console.error(`Incomplete screen data: ${allData.length} bytes`);
                return null;
            }

            const pixels = [];
            for (let row = 0; row < 8; row++) {
                for (let x = 0; x < 100; x++) {
                    const byte = allData[row * 100 + x];
                    for (let bit = 0; bit < 8; bit++) {
                        const y = row * 8 + bit;
                        if (!pixels[y]) pixels[y] = [];
                        pixels[y][x] = (byte >> bit) & 1;
                    }
                }
            }

            this.screenBuffer = pixels;
            return this.createScreenDataURI(pixels);
        }

        async writeScreen(pixels) {
            // Convert pixel array to NXT format (800 bytes)
            const bytes = new Array(800).fill(0);
            
            for (let row = 0; row < 8; row++) {
                for (let x = 0; x < 100; x++) {
                    let byte = 0;
                    for (let bit = 0; bit < 8; bit++) {
                        const y = row * 8 + bit;
                        if (pixels[y] && pixels[y][x]) {
                            byte |= (1 << bit);
                        }
                    }
                    bytes[row * 100 + x] = byte;
                }
            }

            // Write in chunks of 32 bytes
            for (let i = 0; i < bytes.length; i += 32) {
                const chunk = bytes.slice(i, Math.min(i + 32, bytes.length));
                const offset = DISPLAY_OFFSET + i;
                await this.writeIOMap(MODULE_DISPLAY, offset, chunk);
                await this.sleep(10);
            }

            this.screenBuffer = pixels;
        }

        async clearScreen() {
            const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
            await this.writeScreen(pixels);
        }

        async drawPixel(x, y, on = true) {
            x = Math.floor(Cast.toNumber(x));
            y = Math.floor(Cast.toNumber(y));
            
            if (x < 0 || x >= 100 || y < 0 || y >= 64) return;
            
            this.screenBuffer[y][x] = on ? 1 : 0;
            // ❌ REMOVED: await this.writeScreen(this.screenBuffer);
        }

        async drawLine(x1, y1, x2, y2, on = true) {
            x1 = Math.floor(Cast.toNumber(x1));
            y1 = Math.floor(Cast.toNumber(y1));
            x2 = Math.floor(Cast.toNumber(x2));
            y2 = Math.floor(Cast.toNumber(y2));
            
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;

            while (true) {
                if (x1 >= 0 && x1 < 100 && y1 >= 0 && y1 < 64) {
                    this.screenBuffer[y1][x1] = on ? 1 : 0;
                }

                if (x1 === x2 && y1 === y2) break;

                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x1 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y1 += sy;
                }
            }
            // ❌ REMOVED: await this.writeScreen(this.screenBuffer);
        }

        async drawRect(x, y, w, h, filled = false, on = true) {
            x = Math.floor(Cast.toNumber(x));
            y = Math.floor(Cast.toNumber(y));
            w = Math.floor(Cast.toNumber(w));
            h = Math.floor(Cast.toNumber(h));
            
            if (filled) {
                for (let dy = 0; dy < h; dy++) {
                    for (let dx = 0; dx < w; dx++) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= 0 && px < 100 && py >= 0 && py < 64) {
                            this.screenBuffer[py][px] = on ? 1 : 0;
                        }
                    }
                }
            } else {
                for (let dx = 0; dx < w; dx++) {
                    if (x + dx >= 0 && x + dx < 100) {
                        if (y >= 0 && y < 64) this.screenBuffer[y][x + dx] = on ? 1 : 0;
                        if (y + h - 1 >= 0 && y + h - 1 < 64) this.screenBuffer[y + h - 1][x + dx] = on ? 1 : 0;
                    }
                }
                for (let dy = 0; dy < h; dy++) {
                    if (y + dy >= 0 && y + dy < 64) {
                        if (x >= 0 && x < 100) this.screenBuffer[y + dy][x] = on ? 1 : 0;
                        if (x + w - 1 >= 0 && x + w - 1 < 100) this.screenBuffer[y + dy][x + w - 1] = on ? 1 : 0;
                    }
                }
            }
            // ❌ REMOVED: await this.writeScreen(this.screenBuffer);
        }

        async drawText(text, x, y, on = true) {
            x = Math.floor(Cast.toNumber(x));
            y = Math.floor(Cast.toNumber(y));
            const str = Cast.toString(text).toUpperCase();
            
            let cursorX = x;
            
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const glyph = FONT_5X7[char] || FONT_5X7[' '];
                
                for (let col = 0; col < 5; col++) {
                    const byte = glyph[col];
                    for (let row = 0; row < 7; row++) {
                        const px = cursorX + col;
                        const py = y + row;
                        if (px >= 0 && px < 100 && py >= 0 && py < 64) {
                            const pixelOn = (byte >> row) & 1;
                            this.screenBuffer[py][px] = pixelOn ? (on ? 1 : 0) : 0;
                        }
                    }
                }
                
                cursorX += 6;
                if (cursorX >= 100) break;
            }
            // ❌ REMOVED: await this.writeScreen(this.screenBuffer);
        }

        async drawPattern(pattern) {
            const patterns = {
                'checkerboard': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let y = 0; y < 64; y++) {
                        for (let x = 0; x < 100; x++) {
                            pixels[y][x] = ((x + y) % 2) ? 1 : 0;
                        }
                    }
                    return pixels;
                },
                'stripes-h': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let y = 0; y < 64; y++) {
                        const fill = (y % 4 < 2) ? 1 : 0;
                        for (let x = 0; x < 100; x++) {
                            pixels[y][x] = fill;
                        }
                    }
                    return pixels;
                },
                'stripes-v': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let y = 0; y < 64; y++) {
                        for (let x = 0; x < 100; x++) {
                            pixels[y][x] = (x % 4 < 2) ? 1 : 0;
                        }
                    }
                    return pixels;
                },
                'grid': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let y = 0; y < 64; y++) {
                        for (let x = 0; x < 100; x++) {
                            pixels[y][x] = (x % 8 === 0 || y % 8 === 0) ? 1 : 0;
                        }
                    }
                    return pixels;
                },
                'dots': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let y = 0; y < 64; y += 4) {
                        for (let x = 0; x < 100; x += 4) {
                            pixels[y][x] = 1;
                        }
                    }
                    return pixels;
                },
                'border': () => {
                    const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
                    for (let x = 0; x < 100; x++) {
                        pixels[0][x] = 1;
                        pixels[63][x] = 1;
                    }
                    for (let y = 0; y < 64; y++) {
                        pixels[y][0] = 1;
                        pixels[y][99] = 1;
                    }
                    return pixels;
                }
            };

            const pixels = patterns[pattern] ? patterns[pattern]() : patterns['checkerboard']();
            await this.writeScreen(pixels);
        }

        createScreenDataURI(pixels) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            const imageData = ctx.createImageData(100, 64);
            for (let y = 0; y < 64; y++) {
                for (let x = 0; x < 100; x++) {
                    const i = (y * 100 + x) * 4;
                    const color = pixels[y][x] === 0 ? 176 : 0;
                    imageData.data[i] = color;
                    imageData.data[i + 1] = color;
                    imageData.data[i + 2] = color;
                    imageData.data[i + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            
            return canvas.toDataURL();
        }

        // ==================== OTHER COMMANDS ====================

        async playTone(freq, ms) {
            const f = Math.max(200, Math.min(14000, Cast.toNumber(freq)));
            const d = Math.max(0, Math.min(65535, Cast.toNumber(ms)));
            
            await this.send(NXT_OPCODE.PLAY_TONE, [
                f & 0xFF, (f >> 8) & 0xFF,
                d & 0xFF, (d >> 8) & 0xFF
            ]);
        }

        async getBattery() {
            return await this.send(NXT_OPCODE.GET_BATT_LVL, [], true);
        }

        sleep(ms) {
            return new Promise(r => setTimeout(r, ms));
        }
    }

    // ==================== EXTENSION ====================

    class LegoNXTExtension {
        constructor(runtime) {
            this.runtime = runtime;
            this.nxt = new NXTPeripheral();
        }

        getInfo() {
            return {
                id: 'legonxt',
                name: 'LEGO NXT',
                color1: '#FF6B00',
                color2: '#CC5500',
                blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjAwIiByeD0iNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OWFQ8L3RleHQ+PC9zdmc+',
                blocks: [
                    {
                        opcode: 'connect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🔌 connect to [URL]',
                        arguments: {
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'localhost:8080' }
                        }
                    },
                    {
                        opcode: 'disconnect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'disconnect'
                    },
                    {
                        opcode: 'isConnected',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'connected?'
                    },
                    
                    '---',
                    '🔧 MOTORS',
                    
                    {
                        opcode: 'motorOn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] power [POWER] %',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 }
                        }
                    },
                    {
                        opcode: 'motorDegrees',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] power [POWER] % for [DEG] °',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
                            DEG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 }
                        }
                    },
                    {
                        opcode: 'motorRotations',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] power [POWER] % for [ROT] rotations',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
                            ROT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'motorStop',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] [ACTION]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            ACTION: { type: Scratch.ArgumentType.STRING, menu: 'STOP_ACTION', defaultValue: 'brake' }
                        }
                    },
                    {
                        opcode: 'motorPosition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'motor [PORT] position',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' } }
                    },
                    {
                        opcode: 'resetMotor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset motor [PORT]',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' } }
                    },
                    
                    '---',
                    '👆 TOUCH SENSOR',
                    
                    {
                        opcode: 'setupTouch',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup touch sensor [PORT]',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' } }
                    },
                    {
                        opcode: 'touchPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'touch [PORT] pressed?',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' } }
                    },
                    
                    '---',
                    '💡 LIGHT SENSOR',
                    
                    {
                        opcode: 'setupLight',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup light sensor [PORT] LED [LED]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' },
                            LED: { type: Scratch.ArgumentType.STRING, menu: 'LED_STATE', defaultValue: 'on' }
                        }
                    },
                    {
                        opcode: 'lightValue',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'light [PORT] brightness',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' } }
                    },
                    
                    '---',
                    '🔊 SOUND SENSOR',
                    
                    {
                        opcode: 'setupSound',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup sound sensor [PORT] mode [MODE]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' },
                            MODE: { type: Scratch.ArgumentType.STRING, menu: 'SOUND_MODE', defaultValue: 'dBA' }
                        }
                    },
                    {
                        opcode: 'soundValue',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'sound [PORT] loudness %',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' } }
                    },
                    
                    '---',
                    '📏 ULTRASONIC SENSOR',
                    
                    {
                        opcode: 'setupUltrasonic',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup ultrasonic [PORT]',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S4' } }
                    },
                    {
                        opcode: 'ultrasonicDist',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ultrasonic [PORT] distance (cm)',
                        arguments: { PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S4' } }
                    },
                    
                    '---',
                    '🔔 SOUND',
                    
                    {
                        opcode: 'playTone',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'play tone [FREQ] Hz for [MS] ms',
                        arguments: {
                            FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 440 },
                            MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
                        }
                    },
                    {
                        opcode: 'playNote',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'play note [NOTE] for [BEATS] beats',
                        arguments: {
                            NOTE: { type: Scratch.ArgumentType.STRING, menu: 'NOTE', defaultValue: 'C4' },
                            BEATS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
                        }
                    },
                    
                    '---',
                    '🖥️ SCREEN',
                    
                    {
                        opcode: 'captureScreen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'capture NXT screen'
                    },
                    {
                        opcode: 'clearScreen',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear screen'
                    },
                    {
                        opcode: 'updateDisplay',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🖥️ update display'
                    },
                    {
                        opcode: 'drawText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw text [TEXT] at x:[X] y:[Y]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'HELLO' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
                        }
                    },
                    {
                        opcode: 'drawPixel',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw pixel at x:[X] y:[Y] [STATE]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
                            STATE: { type: Scratch.ArgumentType.STRING, menu: 'PIXEL_STATE', defaultValue: 'on' }
                        }
                    },
                    {
                        opcode: 'drawLine',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw line from x:[X1] y:[Y1] to x:[X2] y:[Y2]',
                        arguments: {
                            X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
                            Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 54 }
                        }
                    },
                    {
                        opcode: 'drawRect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw [FILL] rectangle x:[X] y:[Y] w:[W] h:[H]',
                        arguments: {
                            FILL: { type: Scratch.ArgumentType.STRING, menu: 'RECT_FILL', defaultValue: 'outline' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 44 }
                        }
                    },
                    {
                        opcode: 'drawPattern',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw pattern [PATTERN]',
                        arguments: {
                            PATTERN: { type: Scratch.ArgumentType.STRING, menu: 'PATTERN', defaultValue: 'checkerboard' }
                        }
                    },
                    
                    '---',
                    '📊 STATUS',
                    
                    {
                        opcode: 'battery',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'battery (mV)'
                    }
                ],
                menus: {
                    MOTOR_PORT: { acceptReporters: true, items: ['A', 'B', 'C'] },
                    SENSOR_PORT: { acceptReporters: true, items: ['S1', 'S2', 'S3', 'S4'] },
                    STOP_ACTION: { acceptReporters: false, items: ['brake', 'coast'] },
                    LED_STATE: { acceptReporters: false, items: ['on', 'off'] },
                    SOUND_MODE: { acceptReporters: false, items: ['dBA', 'dB'] },
                    PIXEL_STATE: { acceptReporters: false, items: ['on', 'off'] },
                    RECT_FILL: { acceptReporters: false, items: ['outline', 'filled'] },
                    PATTERN: {
                        acceptReporters: false,
                        items: ['checkerboard', 'stripes-h', 'stripes-v', 'grid', 'dots', 'border']
                    },
                    NOTE: {
                        acceptReporters: false,
                        items: [
                            'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
                            'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
                        ]
                    }
                }
            };
        }

        // Connection
        connect(args) { return this.nxt.connect(args.URL); }
        disconnect() { return this.nxt.disconnect(); }
        isConnected() { return this.nxt.connected; }

        // Motors
        motorOn(args) { return this.nxt.setMotor(args.PORT, args.POWER); }
        motorDegrees(args) { return this.nxt.motorForDegrees(args.PORT, args.POWER, args.DEG); }
        motorRotations(args) { return this.nxt.motorForDegrees(args.PORT, args.POWER, args.ROT * 360); }
        motorStop(args) { return this.nxt.setMotor(args.PORT, 0, args.ACTION === 'brake'); }
        motorPosition(args) { return this.nxt.getMotorPos(args.PORT); }
        resetMotor(args) { return this.nxt.resetMotorPos(args.PORT); }

        // Sensors
        setupTouch(args) { return this.nxt.setupTouch(args.PORT); }
        async touchPressed(args) {
            const val = await this.nxt.getSensor(args.PORT);
            return val === 1;
        }
        setupLight(args) { return this.nxt.setupLight(args.PORT, args.LED === 'on'); }
        lightValue(args) { return this.nxt.getSensor(args.PORT); }
        setupSound(args) { return this.nxt.setupSound(args.PORT, args.MODE === 'dBA'); }
        soundValue(args) { return this.nxt.getSensor(args.PORT); }
        setupUltrasonic(args) { return this.nxt.setupUltrasonic(args.PORT); }
        ultrasonicDist(args) { return this.nxt.getUltrasonic(args.PORT); }

        // Sound
        playTone(args) { return this.nxt.playTone(args.FREQ, args.MS); }
        playNote(args) {
            const notes = {
                'C4': 262, 'C#4': 277, 'D4': 294, 'D#4': 311, 'E4': 330, 'F4': 349,
                'F#4': 370, 'G4': 392, 'G#4': 415, 'A4': 440, 'A#4': 466, 'B4': 494,
                'C5': 523, 'C#5': 554, 'D5': 587, 'D#5': 622, 'E5': 659, 'F5': 698,
                'F#5': 740, 'G5': 784, 'G#5': 831, 'A5': 880, 'A#5': 932, 'B5': 988
            };
            return this.nxt.playTone(notes[args.NOTE] || 440, args.BEATS * 500);
        }

        // Screen
        captureScreen() { return this.nxt.readScreen(); }
        clearScreen() { return this.nxt.clearScreen(); }
        updateDisplay() { 
            return this.nxt.updateDisplay(); 
        }
        drawText(args) { return this.nxt.drawText(args.TEXT, args.X, args.Y); }
        drawPixel(args) { return this.nxt.drawPixel(args.X, args.Y, args.STATE === 'on'); }
        drawLine(args) { return this.nxt.drawLine(args.X1, args.Y1, args.X2, args.Y2); }
        drawRect(args) { return this.nxt.drawRect(args.X, args.Y, args.W, args.H, args.FILL === 'filled'); }
        drawPattern(args) { return this.nxt.drawPattern(args.PATTERN); }

        // Status
        battery() { return this.nxt.getBattery(); }
    }

    Scratch.extensions.register(new LegoNXTExtension());
    console.log('🎉 LEGO NXT Extension Loaded! (Full Screen Support)');
})(Scratch);