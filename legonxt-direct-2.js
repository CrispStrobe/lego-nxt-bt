(function(Scratch) {
    'use strict';

    const Cast = Scratch.Cast;

    // ==================== NXT PROTOCOL CONSTANTS ====================
    
    const NXT_OPCODE = {
        // Direct commands (reply required)
        DIRECT_CMD: 0x00,
        // Direct commands (no reply)
        DIRECT_CMD_NO_REPLY: 0x80,
        // System commands (reply required)
        SYSTEM_CMD: 0x01,
        // System commands (no reply) 
        SYSTEM_CMD_NO_REPLY: 0x81,
        // Reply
        REPLY: 0x02,
        
        // Opcodes
        PLAY_TONE: 0x03,
        SET_OUT_STATE: 0x04,
        SET_IN_MODE: 0x05,
        GET_OUT_STATE: 0x06,
        GET_IN_VALS: 0x07,
        RESET_IN_VAL: 0x08,
        RESET_POSITION: 0x0A,
        GET_BATT_LVL: 0x0B,
        LS_GET_STATUS: 0x0E,
        LS_WRITE: 0x0F,
        LS_READ: 0x10,
        
        // System commands for display
        READ_IO_MAP: 0x94,
        WRITE_IO_MAP: 0x95
    };

    const PORT = {
        // Motor ports
        A: 0, B: 1, C: 2,
        // Sensor ports
        S1: 0, S2: 1, S3: 2, S4: 3
    };

    const MOTOR_MODE = {
        IDLE: 0x00,
        ON: 0x01,
        BRAKE: 0x02,
        REGULATED: 0x04,
        ON_REGULATED: 0x01 | 0x04,
        ON_BRAKE: 0x01 | 0x02,
        ON_BRAKE_REGULATED: 0x01 | 0x02 | 0x04
    };

    const REGULATION_MODE = {
        IDLE: 0x00,
        SPEED: 0x01,
        SYNC: 0x02
    };

    const RUN_STATE = {
        IDLE: 0x00,
        RAMP_UP: 0x10,
        RUNNING: 0x20,
        RAMP_DOWN: 0x40
    };

    const SENSOR_TYPE = {
        NO_SENSOR: 0x00,
        SWITCH: 0x01,           // Touch
        TEMPERATURE: 0x02,
        REFLECTION: 0x03,
        ANGLE: 0x04,
        LIGHT_ACTIVE: 0x05,
        LIGHT_INACTIVE: 0x06,
        SOUND_DB: 0x07,
        SOUND_DBA: 0x08,
        CUSTOM: 0x09,
        LOW_SPEED: 0x0A,
        LOW_SPEED_9V: 0x0B      // Digital I2C sensors
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

    // Display constants
    const MODULE_DISPLAY = 0xA0001;
    const DISPLAY_OFFSET = 119;
    const DISPLAY_WIDTH = 100;
    const DISPLAY_HEIGHT = 64;
    const DISPLAY_BUFFER_SIZE = 800; // 100 * 64 / 8

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
        '/': [0x20, 0x10, 0x08, 0x04, 0x02],
        '*': [0x14, 0x08, 0x3E, 0x08, 0x14],
        '(': [0x00, 0x1C, 0x22, 0x41, 0x00],
        ')': [0x00, 0x41, 0x22, 0x1C, 0x00],
        '#': [0x14, 0x7F, 0x14, 0x7F, 0x14],
        '<': [0x08, 0x14, 0x22, 0x41, 0x00],
        '>': [0x00, 0x41, 0x22, 0x14, 0x08],
    };

    // ==================== NXT PERIPHERAL CLASS ====================

    class NXTPeripheral {
        constructor(runtime) {
            this.runtime = runtime;
            
            // Connection
            this.port = null;
            this.reader = null;
            this.writer = null;
            this.connected = false;
            
            // State
            this.batteryLevel = 0;
            this.motorState = {
                A: { power: 0, tachoCount: 0, position: 0 },
                B: { power: 0, tachoCount: 0, position: 0 },
                C: { power: 0, tachoCount: 0, position: 0 }
            };
            this.sensorState = {
                S1: { type: 'none', value: 0, rawValue: 0 },
                S2: { type: 'none', value: 0, rawValue: 0 },
                S3: { type: 'none', value: 0, rawValue: 0 },
                S4: { type: 'none', value: 0, rawValue: 0 }
            };
            
            // I2C state for ultrasonic
            this.ultrasonicDistance = { S1: 0, S2: 0, S3: 0, S4: 0 };
            
            // Display buffer (100x64 pixels = 800 bytes)
            this.screenBuffer = new Uint8Array(DISPLAY_BUFFER_SIZE);
            
            // Request tracking
            this.pendingRequests = new Map();
            this.requestId = 0;
            
            // Read buffer
            this.readBuffer = new Uint8Array(0);
        }

        // ==================== CONNECTION ====================

        async connect() {
            if (!navigator.serial) {
                alert('Web Serial API not supported!\n\nUse Chrome/Edge 89+ or TurboWarp Desktop with --enable-unsafe-webserial flag');
                return;
            }

            try {
                console.log('🔌 [NXT] Requesting serial port...');
                this.port = await navigator.serial.requestPort();
                
                await this.port.open({ 
                    baudRate: 115200,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'none'
                });
                
                this.reader = this.port.readable.getReader();
                this.writer = this.port.writable.getWriter();
                this.connected = true;
                
                console.log('✅ [NXT] Port opened');
                
                // Start read loop
                this.startReadLoop();
                
                // Test connection
                await this.getBatteryLevel();
                
                console.log('🎉 [NXT] Connected successfully!');
                alert('✅ Connected to LEGO NXT!\n\nTip: Pair your NXT via Bluetooth settings first,\nthen select the virtual COM port.');
                
            } catch (error) {
                console.error('❌ [NXT] Connection error:', error);
                alert('Connection failed: ' + error.message);
                this.disconnect();
            }
        }

        async disconnect() {
            console.log('👋 [NXT] Disconnecting...');
            
            this.connected = false;
            
            if (this.reader) {
                try {
                    await this.reader.cancel();
                } catch (e) {}
                this.reader.releaseLock();
            }
            
            if (this.writer) {
                this.writer.releaseLock();
            }
            
            if (this.port) {
                await this.port.close();
            }
            
            this.reset();
        }

        reset() {
            this.connected = false;
            this.port = null;
            this.reader = null;
            this.writer = null;
            this.batteryLevel = 0;
            this.readBuffer = new Uint8Array(0);
            this.screenBuffer.fill(0);
        }

        isConnected() {
            return this.connected;
        }

        // ==================== TELEGRAM PROTOCOL ====================

        async sendTelegram(opcode, payload = [], needsReply = false) {
            if (!this.connected || !this.writer) {
                console.warn('[NXT] Not connected');
                return null;
            }

            const commandType = needsReply ? NXT_OPCODE.DIRECT_CMD : NXT_OPCODE.DIRECT_CMD_NO_REPLY;
            const telegram = new Uint8Array([commandType, opcode, ...payload]);
            
            // Add 2-byte length header (little-endian)
            const packet = new Uint8Array(telegram.length + 2);
            packet[0] = telegram.length & 0xFF;
            packet[1] = (telegram.length >> 8) & 0xFF;
            packet.set(telegram, 2);

            if (needsReply) {
                const reqId = this.requestId++;
                const promise = new Promise((resolve, reject) => {
                    this.pendingRequests.set(reqId, { resolve, reject, opcode });
                    setTimeout(() => {
                        if (this.pendingRequests.has(reqId)) {
                            this.pendingRequests.delete(reqId);
                            reject(new Error('Request timeout'));
                        }
                    }, 2000);
                });

                try {
                    await this.writer.write(packet);
                    return await promise;
                } catch (error) {
                    this.pendingRequests.delete(reqId);
                    throw error;
                }
            } else {
                await this.writer.write(packet);
                return null;
            }
        }

        // System commands for IO Map operations
        async sendSystemCommand(opcode, payload = [], needsReply = true) {
            if (!this.connected || !this.writer) {
                console.warn('[NXT] Not connected');
                return null;
            }

            const commandType = needsReply ? NXT_OPCODE.SYSTEM_CMD : NXT_OPCODE.SYSTEM_CMD_NO_REPLY;
            const telegram = new Uint8Array([commandType, opcode, ...payload]);
            
            // Add 2-byte length header (little-endian)
            const packet = new Uint8Array(telegram.length + 2);
            packet[0] = telegram.length & 0xFF;
            packet[1] = (telegram.length >> 8) & 0xFF;
            packet.set(telegram, 2);

            if (needsReply) {
                const reqId = this.requestId++;
                const promise = new Promise((resolve, reject) => {
                    this.pendingRequests.set(reqId, { resolve, reject, opcode, isSystem: true });
                    setTimeout(() => {
                        if (this.pendingRequests.has(reqId)) {
                            this.pendingRequests.delete(reqId);
                            reject(new Error('System command timeout'));
                        }
                    }, 3000); // Longer timeout for system commands
                });

                try {
                    await this.writer.write(packet);
                    return await promise;
                } catch (error) {
                    this.pendingRequests.delete(reqId);
                    throw error;
                }
            } else {
                await this.writer.write(packet);
                return null;
            }
        }

        // ==================== READ LOOP ====================

        async startReadLoop() {
            try {
                while (this.connected && this.reader) {
                    const { value, done } = await this.reader.read();
                    if (done || !this.connected) break;
                    
                    this.processIncomingData(value);
                }
            } catch (error) {
                if (this.connected) {
                    console.error('[NXT] Read error:', error);
                    this.disconnect();
                }
            }
        }

        processIncomingData(data) {
            // Append to buffer
            const newBuffer = new Uint8Array(this.readBuffer.length + data.length);
            newBuffer.set(this.readBuffer);
            newBuffer.set(data, this.readBuffer.length);
            this.readBuffer = newBuffer;

            // Process complete packets
            while (this.readBuffer.length >= 2) {
                const length = this.readBuffer[0] | (this.readBuffer[1] << 8);
                
                if (this.readBuffer.length < length + 2) break; // Wait for complete packet
                
                const packet = this.readBuffer.slice(2, 2 + length);
                this.readBuffer = this.readBuffer.slice(2 + length);
                
                this.handleReply(packet);
            }
        }

        handleReply(packet) {
            if (packet.length < 3) return;

            const replyType = packet[0];
            const opcode = packet[1];
            const status = packet[2];

            // Find matching request
            for (const [reqId, request] of this.pendingRequests.entries()) {
                if (request.opcode === opcode) {
                    this.pendingRequests.delete(reqId);
                    
                    if (status === 0x00) {
                        request.resolve(packet.slice(3));
                    } else {
                        request.reject(new Error(`NXT Error: 0x${status.toString(16)}`));
                    }
                    return;
                }
            }
        }

        // ==================== MOTOR OPERATIONS ====================

        async setMotorPower(port, power, regulated = true) {
            const portNum = PORT[port];
            power = Math.max(-100, Math.min(100, power));

            const mode = regulated ? MOTOR_MODE.ON_REGULATED : MOTOR_MODE.ON;
            const regMode = regulated ? REGULATION_MODE.SPEED : REGULATION_MODE.IDLE;
            const runState = RUN_STATE.RUNNING;

            await this.sendTelegram(NXT_OPCODE.SET_OUT_STATE, [
                portNum,
                power & 0xFF,
                mode,
                regMode,
                0,          // Turn ratio
                runState,
                0, 0, 0, 0  // Tacho limit (0 = unlimited)
            ]);

            this.motorState[port].power = power;
        }

        async motorRunForDegrees(port, power, degrees) {
            const portNum = PORT[port];
            power = Math.max(-100, Math.min(100, power));
            
            const tachoLimit = Math.abs(degrees);
            const mode = MOTOR_MODE.ON_BRAKE_REGULATED;
            const regMode = REGULATION_MODE.SPEED;
            const runState = RUN_STATE.RUNNING;

            await this.sendTelegram(NXT_OPCODE.SET_OUT_STATE, [
                portNum,
                power & 0xFF,
                mode,
                regMode,
                0,
                runState,
                tachoLimit & 0xFF,
                (tachoLimit >> 8) & 0xFF,
                (tachoLimit >> 16) & 0xFF,
                (tachoLimit >> 24) & 0xFF
            ]);
        }

        async motorStop(port, brake = true) {
            const portNum = PORT[port];
            const mode = brake ? MOTOR_MODE.BRAKE : MOTOR_MODE.IDLE;
            const runState = RUN_STATE.IDLE;

            await this.sendTelegram(NXT_OPCODE.SET_OUT_STATE, [
                portNum,
                0,
                mode,
                REGULATION_MODE.IDLE,
                0,
                runState,
                0, 0, 0, 0
            ]);

            this.motorState[port].power = 0;
        }

        async getMotorPosition(port) {
            const portNum = PORT[port];
            const reply = await this.sendTelegram(NXT_OPCODE.GET_OUT_STATE, [portNum], true);
            
            if (reply && reply.length >= 21) {
                const position = reply[16] | (reply[17] << 8) | 
                                (reply[18] << 16) | (reply[19] << 24);
                this.motorState[port].position = position;
                return position;
            }
            return this.motorState[port].position;
        }

        async resetMotorPosition(port, relative = false) {
            const portNum = PORT[port];
            await this.sendTelegram(NXT_OPCODE.RESET_POSITION, [portNum, relative ? 1 : 0]);
            this.motorState[port].position = 0;
        }

        // ==================== SENSOR OPERATIONS ====================

        async setupTouchSensor(port) {
            const portNum = PORT[port];
            await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [
                portNum,
                SENSOR_TYPE.SWITCH,
                SENSOR_MODE.BOOL
            ]);
            this.sensorState[port].type = 'touch';
        }

        async setupLightSensor(port, active = true) {
            const portNum = PORT[port];
            const sensorType = active ? SENSOR_TYPE.LIGHT_ACTIVE : SENSOR_TYPE.LIGHT_INACTIVE;
            
            await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [
                portNum,
                sensorType,
                SENSOR_MODE.PCT_FULL_SCALE
            ]);
            this.sensorState[port].type = 'light';
        }

        async setupSoundSensor(port, adjusted = true) {
            const portNum = PORT[port];
            const sensorType = adjusted ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
            
            await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [
                portNum,
                sensorType,
                SENSOR_MODE.PCT_FULL_SCALE
            ]);
            this.sensorState[port].type = 'sound';
        }

        async setupUltrasonicSensor(port) {
            const portNum = PORT[port];
            
            await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [
                portNum,
                SENSOR_TYPE.LOW_SPEED_9V,
                SENSOR_MODE.RAW
            ]);
            
            this.sensorState[port].type = 'ultrasonic';
            
            // Give sensor time to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        async getSensorValue(port) {
            const portNum = PORT[port];
            
            try {
                const reply = await this.sendTelegram(NXT_OPCODE.GET_IN_VALS, [portNum], true);
                
                if (reply && reply.length >= 13) {
                    const scaledValue = reply[7] | (reply[8] << 8);
                    this.sensorState[port].value = scaledValue;
                    return scaledValue;
                }
            } catch (error) {
                console.warn(`[NXT] Error reading sensor ${port}:`, error);
            }
            
            return this.sensorState[port].value;
        }

        async getUltrasonicDistance(port) {
            const portNum = PORT[port];
            
            try {
                // Write I2C command to read distance (register 0x42)
                await this.sendTelegram(NXT_OPCODE.LS_WRITE, [
                    portNum,
                    2,      // TX length
                    1,      // RX length
                    0x02,   // I2C address (0x01 << 1)
                    0x42    // Distance register
                ]);
                
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Read I2C response
                const reply = await this.sendTelegram(NXT_OPCODE.LS_READ, [portNum], true);
                
                if (reply && reply.length >= 4) {
                    const distance = reply[3];
                    this.ultrasonicDistance[port] = distance;
                    return distance;
                }
            } catch (error) {
                console.warn(`[NXT] Error reading ultrasonic ${port}:`, error);
            }
            
            return this.ultrasonicDistance[port];
        }

        // ==================== SOUND OPERATIONS ====================

        async playTone(frequency, durationMs) {
            frequency = Math.max(200, Math.min(14000, frequency));
            durationMs = Math.max(0, durationMs);
            
            await this.sendTelegram(NXT_OPCODE.PLAY_TONE, [
                frequency & 0xFF,
                (frequency >> 8) & 0xFF,
                durationMs & 0xFF,
                (durationMs >> 8) & 0xFF
            ]);
        }

        // ==================== BATTERY ====================

        async getBatteryLevel() {
            try {
                const reply = await this.sendTelegram(NXT_OPCODE.GET_BATT_LVL, [], true);
                
                if (reply && reply.length >= 2) {
                    this.batteryLevel = reply[0] | (reply[1] << 8);
                    return this.batteryLevel;
                }
            } catch (error) {
                console.warn('[NXT] Error reading battery:', error);
            }
            
            return this.batteryLevel;
        }

        // ==================== DISPLAY OPERATIONS ====================

        // Read the NXT screen buffer
        async readScreenBuffer() {
            try {
                // Module ID in little-endian format
                const moduleId = [
                    MODULE_DISPLAY & 0xFF,
                    (MODULE_DISPLAY >> 8) & 0xFF,
                    (MODULE_DISPLAY >> 16) & 0xFF,
                    (MODULE_DISPLAY >> 24) & 0xFF
                ];

                const reply = await this.sendSystemCommand(NXT_OPCODE.READ_IO_MAP, [
                    ...moduleId,
                    DISPLAY_OFFSET & 0xFF,
                    (DISPLAY_OFFSET >> 8) & 0xFF,
                    DISPLAY_BUFFER_SIZE & 0xFF,
                    (DISPLAY_BUFFER_SIZE >> 8) & 0xFF
                ], true);

                if (reply && reply.length >= 4 + DISPLAY_BUFFER_SIZE) {
                    // Extract display buffer from reply (skip 4-byte module ID)
                    const buffer = reply.slice(4, 4 + DISPLAY_BUFFER_SIZE);
                    this.screenBuffer.set(buffer);
                    return this.screenBufferToBase64();
                }
            } catch (error) {
                console.error('[NXT] Error reading screen:', error);
            }
            return null;
        }

        // Write the local screen buffer to NXT display
        async updateDisplay() {
            try {
                // Module ID in little-endian format
                const moduleId = [
                    MODULE_DISPLAY & 0xFF,
                    (MODULE_DISPLAY >> 8) & 0xFF,
                    (MODULE_DISPLAY >> 16) & 0xFF,
                    (MODULE_DISPLAY >> 24) & 0xFF
                ];

                const payload = [
                    ...moduleId,
                    DISPLAY_OFFSET & 0xFF,
                    (DISPLAY_OFFSET >> 8) & 0xFF,
                    DISPLAY_BUFFER_SIZE & 0xFF,
                    (DISPLAY_BUFFER_SIZE >> 8) & 0xFF,
                    ...this.screenBuffer
                ];

                await this.sendSystemCommand(NXT_OPCODE.WRITE_IO_MAP, payload, false);
                
                // Small delay to ensure display updates
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('[NXT] Error updating display:', error);
            }
        }

        // Clear the local screen buffer
        clearScreenBuffer() {
            this.screenBuffer.fill(0);
        }

        // Set a pixel in the local screen buffer
        setPixel(x, y, on = true) {
            if (x < 0 || x >= DISPLAY_WIDTH || y < 0 || y >= DISPLAY_HEIGHT) return;
            
            const byteIndex = Math.floor(y / 8) * DISPLAY_WIDTH + x;
            const bitIndex = y % 8;
            
            if (on) {
                this.screenBuffer[byteIndex] |= (1 << bitIndex);
            } else {
                this.screenBuffer[byteIndex] &= ~(1 << bitIndex);
            }
        }

        // Get a pixel from the local screen buffer
        getPixel(x, y) {
            if (x < 0 || x >= DISPLAY_WIDTH || y < 0 || y >= DISPLAY_HEIGHT) return false;
            
            const byteIndex = Math.floor(y / 8) * DISPLAY_WIDTH + x;
            const bitIndex = y % 8;
            
            return (this.screenBuffer[byteIndex] & (1 << bitIndex)) !== 0;
        }

        // Draw a line using Bresenham's algorithm
        drawLine(x1, y1, x2, y2) {
            x1 = Math.floor(x1);
            y1 = Math.floor(y1);
            x2 = Math.floor(x2);
            y2 = Math.floor(y2);

            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;

            while (true) {
                this.setPixel(x1, y1, true);

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
        }

        // Draw a rectangle
        drawRect(x, y, width, height, filled = false) {
            x = Math.floor(x);
            y = Math.floor(y);
            width = Math.floor(width);
            height = Math.floor(height);

            if (filled) {
                for (let row = y; row < y + height; row++) {
                    for (let col = x; col < x + width; col++) {
                        this.setPixel(col, row, true);
                    }
                }
            } else {
                // Top and bottom
                for (let col = x; col < x + width; col++) {
                    this.setPixel(col, y, true);
                    this.setPixel(col, y + height - 1, true);
                }
                // Left and right
                for (let row = y; row < y + height; row++) {
                    this.setPixel(x, row, true);
                    this.setPixel(x + width - 1, row, true);
                }
            }
        }

        // Draw text using bitmap font
        drawText(text, x, y) {
            text = String(text).toUpperCase();
            let cursorX = Math.floor(x);
            const cursorY = Math.floor(y);

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const bitmap = FONT_5X7[char] || FONT_5X7[' '];

                for (let col = 0; col < 5; col++) {
                    const columnData = bitmap[col];
                    for (let row = 0; row < 7; row++) {
                        if (columnData & (1 << row)) {
                            this.setPixel(cursorX + col, cursorY + row, true);
                        }
                    }
                }

                cursorX += 6; // 5 pixels + 1 space
            }
        }

        // Draw predefined patterns
        drawPattern(pattern) {
            this.clearScreenBuffer();

            switch (pattern) {
                case 'checkerboard':
                    for (let y = 0; y < DISPLAY_HEIGHT; y++) {
                        for (let x = 0; x < DISPLAY_WIDTH; x++) {
                            if ((x + y) % 2 === 0) {
                                this.setPixel(x, y, true);
                            }
                        }
                    }
                    break;

                case 'stripes-h':
                    for (let y = 0; y < DISPLAY_HEIGHT; y += 4) {
                        for (let x = 0; x < DISPLAY_WIDTH; x++) {
                            this.setPixel(x, y, true);
                            this.setPixel(x, y + 1, true);
                        }
                    }
                    break;

                case 'stripes-v':
                    for (let x = 0; x < DISPLAY_WIDTH; x += 4) {
                        for (let y = 0; y < DISPLAY_HEIGHT; y++) {
                            this.setPixel(x, y, true);
                            this.setPixel(x + 1, y, true);
                        }
                    }
                    break;

                case 'grid':
                    for (let y = 0; y < DISPLAY_HEIGHT; y += 8) {
                        for (let x = 0; x < DISPLAY_WIDTH; x++) {
                            this.setPixel(x, y, true);
                        }
                    }
                    for (let x = 0; x < DISPLAY_WIDTH; x += 8) {
                        for (let y = 0; y < DISPLAY_HEIGHT; y++) {
                            this.setPixel(x, y, true);
                        }
                    }
                    break;

                case 'dots':
                    for (let y = 2; y < DISPLAY_HEIGHT; y += 8) {
                        for (let x = 2; x < DISPLAY_WIDTH; x += 8) {
                            this.setPixel(x, y, true);
                            this.setPixel(x + 1, y, true);
                            this.setPixel(x, y + 1, true);
                            this.setPixel(x + 1, y + 1, true);
                        }
                    }
                    break;

                case 'border':
                    this.drawRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, false);
                    this.drawRect(2, 2, DISPLAY_WIDTH - 4, DISPLAY_HEIGHT - 4, false);
                    break;

                default:
                    break;
            }
        }

        // Convert screen buffer to base64 for Scratch costume
        screenBufferToBase64() {
            // Create a simple BMP image (monochrome)
            const width = DISPLAY_WIDTH;
            const height = DISPLAY_HEIGHT;
            const rowSize = Math.floor((width + 31) / 32) * 4;
            const imageSize = rowSize * height;
            const fileSize = 62 + imageSize; // BMP header + palette + image data

            const bmp = new Uint8Array(fileSize);
            let offset = 0;

            // BMP Header
            bmp[offset++] = 0x42; bmp[offset++] = 0x4D; // "BM"
            bmp[offset++] = fileSize & 0xFF; bmp[offset++] = (fileSize >> 8) & 0xFF;
            bmp[offset++] = (fileSize >> 16) & 0xFF; bmp[offset++] = (fileSize >> 24) & 0xFF;
            bmp[offset++] = 0; bmp[offset++] = 0; // Reserved
            bmp[offset++] = 0; bmp[offset++] = 0; // Reserved
            bmp[offset++] = 62; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Offset to pixel data

            // DIB Header (BITMAPINFOHEADER)
            bmp[offset++] = 40; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Header size
            bmp[offset++] = width & 0xFF; bmp[offset++] = (width >> 8) & 0xFF;
            bmp[offset++] = (width >> 16) & 0xFF; bmp[offset++] = (width >> 24) & 0xFF;
            bmp[offset++] = height & 0xFF; bmp[offset++] = (height >> 8) & 0xFF;
            bmp[offset++] = (height >> 16) & 0xFF; bmp[offset++] = (height >> 24) & 0xFF;
            bmp[offset++] = 1; bmp[offset++] = 0; // Planes
            bmp[offset++] = 1; bmp[offset++] = 0; // Bits per pixel (1-bit)
            bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Compression (none)
            bmp[offset++] = imageSize & 0xFF; bmp[offset++] = (imageSize >> 8) & 0xFF;
            bmp[offset++] = (imageSize >> 16) & 0xFF; bmp[offset++] = (imageSize >> 24) & 0xFF;
            bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // X pixels per meter
            bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Y pixels per meter
            bmp[offset++] = 2; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Colors in palette
            bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Important colors

            // Color palette (black and white)
            bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; bmp[offset++] = 0; // Black
            bmp[offset++] = 255; bmp[offset++] = 255; bmp[offset++] = 255; bmp[offset++] = 0; // White

            // Pixel data (bottom-up)
            for (let y = height - 1; y >= 0; y--) {
                let byteValue = 0;
                let bitPos = 7;

                for (let x = 0; x < width; x++) {
                    if (this.getPixel(x, y)) {
                        byteValue |= (1 << bitPos);
                    }

                    bitPos--;
                    if (bitPos < 0) {
                        bmp[offset++] = byteValue;
                        byteValue = 0;
                        bitPos = 7;
                    }
                }

                // Finish the row
                if (bitPos < 7) {
                    bmp[offset++] = byteValue;
                }

                // Padding to 4-byte boundary
                while (offset % 4 !== 0) {
                    bmp[offset++] = 0;
                }
            }

            // Convert to base64
            let binary = '';
            for (let i = 0; i < bmp.length; i++) {
                binary += String.fromCharCode(bmp[i]);
            }
            return 'data:image/bmp;base64,' + btoa(binary);
        }
    }

    // ==================== SCRATCH EXTENSION ====================

    class LegoNXTExtension {
        constructor(runtime) {
            this.runtime = runtime;
            this.peripheral = new NXTPeripheral(runtime);
        }

        getInfo() {
            return {
                id: 'legonxtdirect',
                name: 'LEGO NXT Direct',
                color1: '#FF6600',
                color2: '#E65C00',
                color3: '#CC5200',
                blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2NjAwIiByeD0iNSIvPjx0ZXh0IHg9IjIwIiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk48L3RleHQ+PC9zdmc+',
                blocks: [
                    '🔌 CONNECTION',
                    {
                        opcode: 'connect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'connect to NXT'
                    },
                    {
                        opcode: 'disconnect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'disconnect from NXT'
                    },
                    {
                        opcode: 'isConnected',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'connected?'
                    },
                    
                    '---',
                    '🎮 MOTORS',
                    
                    {
                        opcode: 'motorOn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] on at [POWER]% power',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 }
                        }
                    },
                    {
                        opcode: 'motorRunDegrees',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] run [DEGREES]° at [POWER]% power',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            DEGREES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 }
                        }
                    },
                    {
                        opcode: 'motorRunRotations',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] run [ROTATIONS] rotations at [POWER]% power',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 }
                        }
                    },
                    {
                        opcode: 'motorStop',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] stop and [ACTION]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            ACTION: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_STOP', defaultValue: 'brake' }
                        }
                    },
                    {
                        opcode: 'getMotorPosition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'motor [PORT] position',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' }
                        }
                    },
                    {
                        opcode: 'resetMotorPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset motor [PORT] position',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' }
                        }
                    },
                    
                    '---',
                    '👆 TOUCH SENSOR',
                    
                    {
                        opcode: 'setupTouchSensor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup touch sensor on [PORT]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
                        }
                    },
                    {
                        opcode: 'isTouchPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'touch sensor [PORT] pressed?',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
                        }
                    },
                    
                    '---',
                    '💡 LIGHT SENSOR',
                    
                    {
                        opcode: 'setupLightSensor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup light sensor on [PORT] LED [STATE]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' },
                            STATE: { type: Scratch.ArgumentType.STRING, menu: 'LED_STATE', defaultValue: 'on' }
                        }
                    },
                    {
                        opcode: 'getLightLevel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'light sensor [PORT] brightness',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
                        }
                    },
                    
                    '---',
                    '🔊 SOUND SENSOR',
                    
                    {
                        opcode: 'setupSoundSensor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup sound sensor on [PORT] mode [MODE]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' },
                            MODE: { type: Scratch.ArgumentType.STRING, menu: 'SOUND_MODE', defaultValue: 'dBA' }
                        }
                    },
                    {
                        opcode: 'getSoundLevel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'sound sensor [PORT] loudness',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
                        }
                    },
                    
                    '---',
                    '📏 ULTRASONIC SENSOR',
                    
                    {
                        opcode: 'setupUltrasonicSensor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'setup ultrasonic sensor on [PORT]',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S4' }
                        }
                    },
                    {
                        opcode: 'getDistance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ultrasonic [PORT] distance (cm)',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S4' }
                        }
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
                    '🖥️ DISPLAY',
                    
                    {
                        opcode: 'captureScreen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'capture NXT screen'
                    },
                    {
                        opcode: 'clearScreen',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear screen buffer'
                    },
                    {
                        opcode: 'updateDisplay',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🖥️ update NXT display'
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
                        opcode: 'getBattery',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'battery level (mV)'
                    }
                ],
                menus: {
                    MOTOR_PORT: { acceptReporters: true, items: ['A', 'B', 'C'] },
                    SENSOR_PORT: { acceptReporters: true, items: ['S1', 'S2', 'S3', 'S4'] },
                    MOTOR_STOP: { acceptReporters: false, items: ['brake', 'coast'] },
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
        connect() { return this.peripheral.connect(); }
        disconnect() { return this.peripheral.disconnect(); }
        isConnected() { return this.peripheral.isConnected(); }

        // Motors
        motorOn(args) {
            const power = Cast.toNumber(args.POWER);
            return this.peripheral.setMotorPower(args.PORT, power, true);
        }

        motorRunDegrees(args) {
            const power = Cast.toNumber(args.POWER);
            const degrees = Cast.toNumber(args.DEGREES);
            return this.peripheral.motorRunForDegrees(args.PORT, power, degrees);
        }

        motorRunRotations(args) {
            const power = Cast.toNumber(args.POWER);
            const rotations = Cast.toNumber(args.ROTATIONS);
            const degrees = rotations * 360;
            return this.peripheral.motorRunForDegrees(args.PORT, power, degrees);
        }

        motorStop(args) {
            const brake = args.ACTION === 'brake';
            return this.peripheral.motorStop(args.PORT, brake);
        }

        getMotorPosition(args) {
            return this.peripheral.getMotorPosition(args.PORT);
        }

        resetMotorPosition(args) {
            return this.peripheral.resetMotorPosition(args.PORT, false);
        }

        // Touch Sensor
        setupTouchSensor(args) {
            return this.peripheral.setupTouchSensor(args.PORT);
        }

        async isTouchPressed(args) {
            const value = await this.peripheral.getSensorValue(args.PORT);
            return value === 1;
        }

        // Light Sensor
        setupLightSensor(args) {
            const active = args.STATE === 'on';
            return this.peripheral.setupLightSensor(args.PORT, active);
        }

        getLightLevel(args) {
            return this.peripheral.getSensorValue(args.PORT);
        }

        // Sound Sensor
        setupSoundSensor(args) {
            const adjusted = args.MODE === 'dBA';
            return this.peripheral.setupSoundSensor(args.PORT, adjusted);
        }

        getSoundLevel(args) {
            return this.peripheral.getSensorValue(args.PORT);
        }

        // Ultrasonic Sensor
        setupUltrasonicSensor(args) {
            return this.peripheral.setupUltrasonicSensor(args.PORT);
        }

        getDistance(args) {
            return this.peripheral.getUltrasonicDistance(args.PORT);
        }

        // Sound
        playTone(args) {
            const freq = Cast.toNumber(args.FREQ);
            const ms = Cast.toNumber(args.MS);
            return this.peripheral.playTone(freq, ms);
        }

        playNote(args) {
            const noteFreqs = {
                'C4': 262, 'C#4': 277, 'D4': 294, 'D#4': 311, 'E4': 330, 'F4': 349,
                'F#4': 370, 'G4': 392, 'G#4': 415, 'A4': 440, 'A#4': 466, 'B4': 494,
                'C5': 523, 'C#5': 554, 'D5': 587, 'D#5': 622, 'E5': 659, 'F5': 698,
                'F#5': 740, 'G5': 784, 'G#5': 831, 'A5': 880, 'A#5': 932, 'B5': 988
            };
            const freq = noteFreqs[args.NOTE] || 440;
            const beats = Cast.toNumber(args.BEATS);
            const ms = beats * 500; // 120 BPM = 500ms per beat
            return this.peripheral.playTone(freq, ms);
        }

        // Display operations
        captureScreen() {
            return this.peripheral.readScreenBuffer();
        }

        clearScreen() {
            return this.peripheral.clearScreenBuffer();
        }

        updateDisplay() {
            return this.peripheral.updateDisplay();
        }

        drawText(args) {
            return this.peripheral.drawText(args.TEXT, args.X, args.Y);
        }

        drawPixel(args) {
            const on = args.STATE === 'on';
            return this.peripheral.setPixel(args.X, args.Y, on);
        }

        drawLine(args) {
            return this.peripheral.drawLine(args.X1, args.Y1, args.X2, args.Y2);
        }

        drawRect(args) {
            const filled = args.FILL === 'filled';
            return this.peripheral.drawRect(args.X, args.Y, args.W, args.H, filled);
        }

        drawPattern(args) {
            return this.peripheral.drawPattern(args.PATTERN);
        }

        // Status
        getBattery() {
            return this.peripheral.getBatteryLevel();
        }
    }

    Scratch.extensions.register(new LegoNXTExtension());
    console.log('🎉 [LEGO NXT Direct Extended] Extension loaded successfully with display features!');

})(Scratch);