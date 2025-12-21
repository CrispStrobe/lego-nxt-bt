(function(Scratch) {
    'use strict';

    const Cast = Scratch.Cast;

    // ==================== NXT PROTOCOL CONSTANTS ====================
    
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
        RESET_IN_VAL: 0x08,
        RESET_POSITION: 0x0A,
        GET_BATT_LVL: 0x0B,
        LS_GET_STATUS: 0x0E,
        LS_WRITE: 0x0F,
        LS_READ: 0x10
    };

    const PORT = {
        A: 0, B: 1, C: 2,
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
        SWITCH: 0x01,
        TEMPERATURE: 0x02,
        REFLECTION: 0x03,
        ANGLE: 0x04,
        LIGHT_ACTIVE: 0x05,
        LIGHT_INACTIVE: 0x06,
        SOUND_DB: 0x07,
        SOUND_DBA: 0x08,
        CUSTOM: 0x09,
        LOW_SPEED: 0x0A,
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

    // ==================== BASE64 HELPERS ====================
    
    function base64ToBytes(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function bytesToBase64(bytes) {
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return btoa(binaryString);
    }

    // ==================== NXT PERIPHERAL CLASS ====================

    class NXTPeripheral {
        constructor(runtime) {
            this.runtime = runtime;
            
            // WebSocket connection
            this.ws = null;
            this.wsUrl = 'ws://localhost:8080';
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
            
            // Request tracking
            this.pendingRequests = new Map();
            this.requestId = 0;
            
            // Read buffer
            this.readBuffer = new Uint8Array(0);
        }

        // ==================== CONNECTION ====================

        async connect(url) {
            if (this.connected) {
                console.log('⚠️ [NXT] Already connected');
                return;
            }

            if (url) {
                this.wsUrl = url.startsWith('ws://') ? url : `ws://${url}`;
            }

            return new Promise((resolve, reject) => {
                console.log(`🔌 [NXT] Connecting to ${this.wsUrl}...`);
                
                try {
                    this.ws = new WebSocket(this.wsUrl);
                    this.ws.binaryType = 'arraybuffer';
                    
                    const timeout = setTimeout(() => {
                        if (this.ws.readyState !== WebSocket.OPEN) {
                            this.ws.close();
                            reject(new Error('Connection timeout'));
                        }
                    }, 5000);

                    this.ws.onopen = async () => {
                        clearTimeout(timeout);
                        this.connected = true;
                        console.log('✅ [NXT] WebSocket connected!');
                        
                        // Test connection
                        try {
                            await this.getBatteryLevel();
                            console.log('🎉 [NXT] NXT communication verified!');
                            resolve();
                        } catch (error) {
                            console.error('❌ [NXT] NXT not responding:', error);
                            this.disconnect();
                            reject(error);
                        }
                    };

                    this.ws.onmessage = (event) => {
                        // Decode Base64 message to binary
                        if (typeof event.data === 'string') {
                            const bytes = base64ToBytes(event.data);
                            this.handleIncomingData(bytes);
                        }
                    };

                    this.ws.onerror = (error) => {
                        clearTimeout(timeout);
                        console.error('❌ [NXT] WebSocket error:', error);
                        reject(new Error('WebSocket connection failed'));
                    };

                    this.ws.onclose = () => {
                        console.log('👋 [NXT] WebSocket closed');
                        this.connected = false;
                    };

                } catch (error) {
                    console.error('❌ [NXT] Connection error:', error);
                    reject(error);
                }
            });
        }

        disconnect() {
            console.log('👋 [NXT] Disconnecting...');
            
            this.connected = false;
            
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            
            this.reset();
        }

        reset() {
            this.connected = false;
            this.batteryLevel = 0;
            this.readBuffer = new Uint8Array(0);
            this.pendingRequests.clear();
        }

        isConnected() {
            return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
        }

        // ==================== TELEGRAM PROTOCOL ====================

        async sendTelegram(opcode, payload = [], needsReply = false) {
            if (!this.isConnected()) {
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
                    // Send as Base64 over WebSocket
                    const base64Data = bytesToBase64(packet);
                    this.ws.send(base64Data);
                    return await promise;
                } catch (error) {
                    console.error('[NXT] Send error:', error);
                    return null;
                }
            } else {
                const base64Data = bytesToBase64(packet);
                this.ws.send(base64Data);
                return null;
            }
        }

        handleIncomingData(data) {
            // Append to buffer
            const combined = new Uint8Array(this.readBuffer.length + data.length);
            combined.set(this.readBuffer);
            combined.set(data, this.readBuffer.length);
            this.readBuffer = combined;

            // Process complete packets
            while (this.readBuffer.length >= 2) {
                const length = this.readBuffer[0] | (this.readBuffer[1] << 8);
                
                if (this.readBuffer.length < length + 2) {
                    break;
                }

                const packet = this.readBuffer.slice(2, length + 2);
                this.readBuffer = this.readBuffer.slice(length + 2);

                this.parseReply(packet);
            }
        }

        parseReply(data) {
            if (data.length < 3) return;

            const replyType = data[0];
            const opcode = data[1];
            const status = data[2];

            if (replyType !== NXT_OPCODE.REPLY) return;
            if (status !== 0x00) {
                console.warn(`[NXT] Error status ${status.toString(16)} for opcode ${opcode.toString(16)}`);
                return;
            }

            switch (opcode) {
                case NXT_OPCODE.GET_BATT_LVL:
                    if (data.length >= 5) {
                        this.batteryLevel = data[3] | (data[4] << 8);
                        this.resolveRequest(opcode, this.batteryLevel);
                    }
                    break;

                case NXT_OPCODE.GET_OUT_STATE:
                    if (data.length >= 25) {
                        const port = ['A', 'B', 'C'][data[3]];
                        const power = this.toSigned8(data[4]);
                        const tachoCount = this.toSigned32(data[15], data[16], data[17], data[18]);
                        const rotationCount = this.toSigned32(data[23], data[24], data[25], data[26]);
                        
                        this.motorState[port] = {
                            power,
                            tachoCount,
                            rotationCount,
                            position: ((rotationCount % 360) + 360) % 360
                        };
                        
                        this.resolveRequest(opcode, this.motorState[port]);
                    }
                    break;

                case NXT_OPCODE.GET_IN_VALS:
                    if (data.length >= 16) {
                        const port = ['S1', 'S2', 'S3', 'S4'][data[3]];
                        const valid = data[4] === 1;
                        const sensorType = data[6];
                        const rawValue = data[10] | (data[11] << 8);
                        const normalizedValue = data[12] | (data[13] << 8);
                        const scaledValue = this.toSigned16(data[14], data[15]);
                        
                        if (valid) {
                            this.sensorState[port] = {
                                type: this.getSensorTypeName(sensorType),
                                rawValue,
                                normalizedValue,
                                value: scaledValue
                            };
                        }
                        
                        this.resolveRequest(opcode, this.sensorState[port]);
                    }
                    break;

                case NXT_OPCODE.LS_GET_STATUS:
                    if (data.length >= 4) {
                        this.resolveRequest(opcode, data[3]);
                    }
                    break;

                case NXT_OPCODE.LS_READ:
                    if (data.length >= 5) {
                        const bytesRead = data[3];
                        const i2cData = Array.from(data.slice(4, 4 + bytesRead));
                        this.resolveRequest(opcode, i2cData);
                    }
                    break;
            }
        }

        resolveRequest(opcode, data) {
            for (const [id, request] of this.pendingRequests.entries()) {
                if (request.opcode === opcode) {
                    request.resolve(data);
                    this.pendingRequests.delete(id);
                    break;
                }
            }
        }

        getSensorTypeName(type) {
            const types = {
                [SENSOR_TYPE.NO_SENSOR]: 'none',
                [SENSOR_TYPE.SWITCH]: 'touch',
                [SENSOR_TYPE.LIGHT_ACTIVE]: 'light',
                [SENSOR_TYPE.LIGHT_INACTIVE]: 'light',
                [SENSOR_TYPE.SOUND_DB]: 'sound',
                [SENSOR_TYPE.SOUND_DBA]: 'sound',
                [SENSOR_TYPE.LOW_SPEED_9V]: 'ultrasonic'
            };
            return types[type] || 'unknown';
        }

        toSigned8(byte) {
            return byte > 127 ? byte - 256 : byte;
        }

        toSigned16(low, high) {
            const val = low | (high << 8);
            return val > 32767 ? val - 65536 : val;
        }

        toSigned32(b0, b1, b2, b3) {
            const val = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);
            return val > 2147483647 ? val - 4294967296 : val;
        }

        // ==================== MOTOR COMMANDS ====================

        async setMotorPower(port, power, brake = true) {
            const portNum = PORT[port];
            const clampedPower = Math.max(-100, Math.min(100, power));
            
            const mode = clampedPower === 0 ? 
                (brake ? MOTOR_MODE.ON_BRAKE_REGULATED : MOTOR_MODE.IDLE) :
                MOTOR_MODE.ON_REGULATED;
            
            const payload = [
                portNum,
                clampedPower,
                mode,
                REGULATION_MODE.SPEED,
                0,
                RUN_STATE.RUNNING,
                0, 0, 0, 0
            ];
            
            await this.sendTelegram(NXT_OPCODE.SET_OUT_STATE, payload, false);
        }

        async motorRunForDegrees(port, power, degrees) {
            const portNum = PORT[port];
            const clampedPower = Math.max(-100, Math.min(100, power));
            const absDegrees = Math.abs(degrees);
            
            const payload = [
                portNum,
                clampedPower,
                MOTOR_MODE.ON_BRAKE_REGULATED,
                REGULATION_MODE.SPEED,
                0,
                RUN_STATE.RUNNING,
                absDegrees & 0xFF,
                (absDegrees >> 8) & 0xFF,
                (absDegrees >> 16) & 0xFF,
                (absDegrees >> 24) & 0xFF
            ];
            
            await this.sendTelegram(NXT_OPCODE.SET_OUT_STATE, payload, false);
            
            const waitTime = Math.abs(degrees / power) * 1000 + 200;
            await this.sleep(waitTime);
        }

        async motorStop(port, brake = true) {
            await this.setMotorPower(port, 0, brake);
        }

        async getMotorPosition(port) {
            const portNum = PORT[port];
            const result = await this.sendTelegram(NXT_OPCODE.GET_OUT_STATE, [portNum], true);
            return result ? result.position : 0;
        }

        async resetMotorPosition(port, relative = false) {
            const portNum = PORT[port];
            await this.sendTelegram(NXT_OPCODE.RESET_POSITION, [portNum, relative ? 1 : 0], false);
        }

        // ==================== SENSOR COMMANDS ====================

        async setSensorMode(port, sensorType, sensorMode) {
            const portNum = PORT[port];
            await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [portNum, sensorType, sensorMode], false);
            await this.sleep(100);
        }

        async getSensorValue(port) {
            const portNum = PORT[port];
            const result = await this.sendTelegram(NXT_OPCODE.GET_IN_VALS, [portNum], true);
            return result ? result.value : 0;
        }

        async setupTouchSensor(port) {
            await this.setSensorMode(port, SENSOR_TYPE.SWITCH, SENSOR_MODE.BOOL);
        }

        async setupLightSensor(port, active = true) {
            const type = active ? SENSOR_TYPE.LIGHT_ACTIVE : SENSOR_TYPE.LIGHT_INACTIVE;
            await this.setSensorMode(port, type, SENSOR_MODE.RAW);
        }

        async setupSoundSensor(port, adjusted = true) {
            const type = adjusted ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
            await this.setSensorMode(port, type, SENSOR_MODE.RAW);
        }

        async setupUltrasonicSensor(port) {
            await this.setSensorMode(port, SENSOR_TYPE.LOW_SPEED_9V, SENSOR_MODE.RAW);
            await this.sleep(200);
        }

        async getUltrasonicDistance(port) {
            const portNum = PORT[port];
            
            const i2cAddr = 0x02;
            const registerAddr = 0x42;
            const txData = [i2cAddr, registerAddr];
            const rxBytes = 1;
            
            await this.sendTelegram(NXT_OPCODE.LS_WRITE, [portNum, txData.length, rxBytes, ...txData], false);
            await this.sleep(50);
            
            let bytesReady = 0;
            for (let i = 0; i < 10; i++) {
                bytesReady = await this.sendTelegram(NXT_OPCODE.LS_GET_STATUS, [portNum], true);
                if (bytesReady >= rxBytes) break;
                await this.sleep(10);
            }
            
            if (bytesReady >= rxBytes) {
                const data = await this.sendTelegram(NXT_OPCODE.LS_READ, [portNum], true);
                if (data && data.length > 0) {
                    this.ultrasonicDistance[port] = data[0];
                    return data[0];
                }
            }
            
            return this.ultrasonicDistance[port] || 0;
        }

        // ==================== OTHER COMMANDS ====================

        async playTone(frequency, durationMs) {
            const freq = Math.max(200, Math.min(14000, frequency));
            const duration = Math.max(0, Math.min(65535, durationMs));
            
            const payload = [
                freq & 0xFF,
                (freq >> 8) & 0xFF,
                duration & 0xFF,
                (duration >> 8) & 0xFF
            ];
            
            await this.sendTelegram(NXT_OPCODE.PLAY_TONE, payload, false);
        }

        async getBatteryLevel() {
            const result = await this.sendTelegram(NXT_OPCODE.GET_BATT_LVL, [], true);
            return result || this.batteryLevel;
        }

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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
                        text: '🔌 disconnect'
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
                        opcode: 'motorRunDegrees',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] power [POWER] % for [DEGREES] °',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
                            DEGREES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 }
                        }
                    },
                    {
                        opcode: 'motorRunRotations',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] power [POWER] % for [ROTATIONS] rotations',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_PORT', defaultValue: 'A' },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
                            ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'motorStop',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'motor [PORT] [ACTION]',
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
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
                        }
                    },
                    {
                        opcode: 'getDistance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ultrasonic [PORT] distance (cm)',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORT', defaultValue: 'S1' }
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
        connect(args) { 
            const url = Cast.toString(args.URL);
            return this.peripheral.connect(url); 
        }
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
            const ms = beats * 500;
            return this.peripheral.playTone(freq, ms);
        }

        // Status
        getBattery() {
            return this.peripheral.getBatteryLevel();
        }
    }

    Scratch.extensions.register(new LegoNXTExtension());
    console.log('🎉 [LEGO NXT WebSocket] Extension loaded successfully!');

})(Scratch);
