(function(Scratch) {
    'use strict';

    const Cast = Scratch.Cast;

    // ============================================================================
    // CONSTANTS AND CONFIGURATION
    // ============================================================================

    const iconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACpQTFRF////fIel5ufolZ62/2YavsPS+YZOkJmy9/j53+Hk6+zs6N/b6dfO////tDhMHAAAAA50Uk5T/////////////////wBFwNzIAAAA6ElEQVR42uzX2w6DIBAEUGDVtlr//3dLaLwgiwUd2z7MJPJg5EQWiGhGcAxBggQJEiT436CIfqXJPTn3MKNYYMSDFpoAmp24OaYgvwKnFgL2zvVTCwHrMoMi+nUQLFthaNCCa0iwclLkDgYVsQp0mzxuqXgK1MRzoCLWgkPXNN2wI/q6Kvt7u/cX0HtejN8x2sXpnpb8J8D3b0Keuhh3X975M+i0xNVbg3s1TIasgK21bQyGO+s2PykaGMYbge8KrNrssvkOWDXkErB8UuBHETjoYLkKBA8ZfuDkbwVBggQJEiR4MC8BBgDTtMZLx2nFCQAAAABJRU5ErkJggg==';

    const BoostBLE = {
        sendInterval: 100,
        sendRateMax: 20
    };

    const BoostMotorMaxPowerAdd = 10;
    const BoostColorSampleSize = 5;

    const BoostIO = {
        MOTOR_WEDO: 0x01,
        MOTOR_SYSTEM: 0x02,
        BUTTON: 0x05,
        LIGHT: 0x08,
        VOLTAGE: 0x14,
        CURRENT: 0x15,
        PIEZO: 0x16,
        LED: 0x17,
        TILT_EXTERNAL: 0x22,
        MOTION_SENSOR: 0x23,
        COLOR: 0x25,
        MOTOREXT: 0x26,
        MOTORINT: 0x27,
        TILT: 0x28,
        TECHNIC_FORCE_SENSOR: 0x3f
    };

    const BoostPortFeedback = {
        IN_PROGRESS: 0x01,
        COMPLETED: 0x02,
        DISCARDED: 0x04,
        IDLE: 0x08,
        BUSY_OR_FULL: 0x10
    };

    const BoostPort10000223OrOlder = {
        A: 55, B: 56, C: 1, D: 2
    };

    const BoostPort10000224OrNewer = {
        A: 0, B: 1, C: 2, D: 3
    };

    let BoostPort = BoostPort10000224OrNewer;

    const BoostColor = {
        ANY: 'any', NONE: 'none', RED: 'red', BLUE: 'blue',
        GREEN: 'green', YELLOW: 'yellow', WHITE: 'white', BLACK: 'black'
    };

    const BoostColorIndex = {
        [BoostColor.NONE]: 255, [BoostColor.RED]: 9, [BoostColor.BLUE]: 3,
        [BoostColor.GREEN]: 5, [BoostColor.YELLOW]: 7, [BoostColor.WHITE]: 10, [BoostColor.BLACK]: 0
    };

    const BoostMessage = {
        HUB_PROPERTIES: 0x01,
        HUB_ACTIONS: 0x02,
        HUB_ALERTS: 0x03,
        HUB_ATTACHED_IO: 0x04,
        ERROR: 0x05,
        PORT_INPUT_FORMAT_SETUP_SINGLE: 0x41,
        PORT_VALUE: 0x45,
        OUTPUT: 0x81,
        PORT_FEEDBACK: 0x82
    };

    const BoostHubProperty = {
        FW_VERSION: 0x03,
        HW_VERSION: 0x04,
        RSSI: 0x05,
        BATTERY_VOLTAGE: 0x06,
        BUTTON: 0x02
    };

    const BoostHubPropertyOperation = {
        ENABLE_UPDATES: 0x02,
        REQUEST_UPDATE: 0x05,
        UPDATE: 0x06
    };

    const BoostHubAction = {
        SWITCH_OFF_HUB: 0x01
    };

    const BoostAlert = {
        LOW_VOLTAGE: 0x01,
        HIGH_CURRENT: 0x02,
        OVER_POWER_CONDITION: 0x04
    };

    const BoostAlertOperation = {
        ENABLE_UPDATES: 0x01,
        UPDATE: 0x04
    };

    const BoostOutputSubCommand = {
        START_POWER: 0x01,
        SET_ACC_TIME: 0x05,
        SET_DEC_TIME: 0x06,
        START_SPEED: 0x07,
        START_SPEED_FOR_DEGREES: 0x0B,
        GO_TO_ABS_POSITION: 0x0D,
        WRITE_DIRECT_MODE_DATA: 0x51
    };

    const BoostOutputExecution = {
        EXECUTE_IMMEDIATELY: 0x10,
        COMMAND_FEEDBACK: 0x01
    };

    const BoostMotorEndState = {
        FLOAT: 0,
        HOLD: 126,
        BRAKE: 127
    };

    const BoostMotorProfile = {
        DO_NOT_USE: 0x00,
        ACCELERATION: 0x01,
        DECELERATION: 0x02
    };

    const BoostIOEvent = {
        ATTACHED: 0x01,
        DETACHED: 0x00,
        ATTACHED_VIRTUAL: 0x02
    };

    const BoostMode = {
        TILT: 0,
        LED: 1,
        COLOR: 0,
        DISTANCE: 1,
        REFLECTION: 3,
        AMBIENT: 4,
        MOTOR_SENSOR: 2,
        FORCE: 0,
        TOUCHED: 1,
        UNKNOWN: 0
    };

    const BoostMotorState = {
        OFF: 0,
        ON_FOREVER: 1,
        ON_FOR_TIME: 2,
        ON_FOR_ROTATION: 3
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    const numberToInt32Array = function (number) {
        const buffer = new ArrayBuffer(4);
        const dataview = new DataView(buffer);
        dataview.setInt32(0, number, true);
        return [
            dataview.getInt8(0), dataview.getInt8(1),
            dataview.getInt8(2), dataview.getInt8(3)
        ];
    };

    const int32ArrayToNumber = function (array) {
        const i = Uint8Array.from(array);
        const d = new DataView(i.buffer);
        return d.getInt32(0, true);
    };

    const decodeVersion = function (version) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setInt32(0, version, true);
        
        const major = view.getUint8(3) >> 4;
        const minor = view.getUint8(3) & 0x0F;
        const bugfix = view.getUint8(2);
        const build = view.getUint16(0, true);
        
        return `${major}.${minor}.${bugfix.toString().padStart(2, '0')}.${build.toString().padStart(4, '0')}`;
    };

    const base64ToBytes = function (base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    };

    const bytesToBase64 = function (bytes) {
        return btoa(String.fromCharCode.apply(null, bytes));
    };

    const clamp = function (val, min, max) {
        return Math.max(min, Math.min(max, val));
    };

    const wrapClamp = function (val, min, max) {
        const range = max - min;
        return ((val - min) % range + range) % range + min;
    };

    const scale = function (val, inMin, inMax, outMin, outMax) {
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };

    const hsvToRgb = function (hsv) {
        const h = hsv.h / 360;
        const s = hsv.s;
        const v = hsv.v;
        
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return { r: r * 255, g: g * 255, b: b * 255 };
    };

    const rgbToDecimal = function (rgb) {
        return ((rgb.r & 0xFF) << 16) | ((rgb.g & 0xFF) << 8) | (rgb.b & 0xFF);
    };

    // ============================================================================
    // RATE LIMITER
    // ============================================================================

    class RateLimiter {
        constructor(maxRate) {
            this.maxRate = maxRate;
            this.lastSendTime = 0;
        }

        okayToSend() {
            const now = Date.now();
            const timeSinceLastSend = now - this.lastSendTime;
            if (timeSinceLastSend >= (1000 / this.maxRate)) {
                this.lastSendTime = now;
                return true;
            }
            return false;
        }
    }

    // ============================================================================
    // MOTOR CLASS
    // ============================================================================

    class BoostMotor {
        constructor(parent, index) {
            this._parent = parent;
            this._index = index;
            
            this._direction = 1;
            this._power = 50;
            this._position = 0;
            this._status = BoostMotorState.OFF;
            
            this._stopMode = BoostMotorEndState.BRAKE;
            this._accelerationTime = 0;
            this._decelerationTime = 0;
            this._useProfile = BoostMotorProfile.DO_NOT_USE;
            
            this._pendingDurationTimeoutId = null;
            this._pendingDurationTimeoutStartTime = null;
            this._pendingDurationTimeoutDelay = null;
            this._pendingRotationDestination = null;
            this._pendingRotationPromise = null;

            this.turnOff = this.turnOff.bind(this);
        }

        get direction() { return this._direction; }
        set direction(value) { this._direction = value < 0 ? -1 : 1; }

        get power() { return this._power; }
        set power(value) {
            if (value === 0) {
                this._power = 0;
            } else {
                this._power = scale(value, 1, 100, 10, 100);
            }
        }

        get position() { return this._position; }
        set position(value) { this._position = value; }

        get status() { return this._status; }
        set status(value) {
            this._clearRotationState();
            this._clearDurationTimeout();
            this._status = value;
        }

        get stopMode() { return this._stopMode; }
        set stopMode(value) { this._stopMode = value; }

        get pendingDurationTimeoutStartTime() { return this._pendingDurationTimeoutStartTime; }
        get pendingDurationTimeoutDelay() { return this._pendingDurationTimeoutDelay; }
        get pendingRotationDestination() { return this._pendingRotationDestination; }
        get pendingRotationPromise() { return this._pendingRotationPromise; }
        set pendingRotationPromise(func) { this._pendingRotationPromise = func; }

        setAcceleration(time) {
            this._accelerationTime = clamp(time, 0, 10000);
            this._useProfile |= BoostMotorProfile.ACCELERATION;
            
            const cmd = this._parent.generateOutputCommand(
                this._index,
                BoostOutputExecution.EXECUTE_IMMEDIATELY,
                BoostOutputSubCommand.SET_ACC_TIME,
                [...numberToInt32Array(this._accelerationTime).slice(0, 2), 0]
            );
            this._parent.send(cmd);
        }

        setDeceleration(time) {
            this._decelerationTime = clamp(time, 0, 10000);
            this._useProfile |= BoostMotorProfile.DECELERATION;
            
            const cmd = this._parent.generateOutputCommand(
                this._index,
                BoostOutputExecution.EXECUTE_IMMEDIATELY,
                BoostOutputSubCommand.SET_DEC_TIME,
                [...numberToInt32Array(this._decelerationTime).slice(0, 2), 0]
            );
            this._parent.send(cmd);
        }

        resetPosition(newPosition = 0) {
            const cmd = this._parent.generateOutputCommand(
                this._index,
                BoostOutputExecution.EXECUTE_IMMEDIATELY,
                BoostOutputSubCommand.WRITE_DIRECT_MODE_DATA,
                [BoostMode.MOTOR_SENSOR, ...numberToInt32Array(newPosition)]
            );
            return this._parent.send(cmd);
        }

        _turnOn() {
            const cmd = this._parent.generateOutputCommand(
                this._index,
                BoostOutputExecution.EXECUTE_IMMEDIATELY,
                BoostOutputSubCommand.START_SPEED,
                [
                    this.power * this.direction,
                    clamp(this.power + BoostMotorMaxPowerAdd, 0, 100),
                    this._useProfile
                ]
            );
            this._parent.send(cmd);
        }

        turnOnForever() {
            this.status = BoostMotorState.ON_FOREVER;
            this._turnOn();
        }

        turnOnFor(milliseconds) {
            milliseconds = Math.max(0, milliseconds);
            this.status = BoostMotorState.ON_FOR_TIME;
            this._turnOn();
            this._setNewDurationTimeout(this.turnOff, milliseconds);
        }

        turnOnForDegrees(degrees, direction) {
            degrees = Math.max(0, degrees);

            const cmd = this._parent.generateOutputCommand(
                this._index,
                (BoostOutputExecution.EXECUTE_IMMEDIATELY | BoostOutputExecution.COMMAND_FEEDBACK),
                BoostOutputSubCommand.START_SPEED_FOR_DEGREES,
                [
                    ...numberToInt32Array(degrees),
                    this.power * this.direction * direction,
                    clamp(this.power + BoostMotorMaxPowerAdd, 0, 100),
                    this._stopMode,
                    this._useProfile
                ]
            );

            this.status = BoostMotorState.ON_FOR_ROTATION;
            this._pendingRotationDestination = this.position + (degrees * this.direction * direction);
            this._parent.send(cmd);
        }

        turnToPosition(position) {
            const cmd = this._parent.generateOutputCommand(
                this._index,
                (BoostOutputExecution.EXECUTE_IMMEDIATELY | BoostOutputExecution.COMMAND_FEEDBACK),
                BoostOutputSubCommand.GO_TO_ABS_POSITION,
                [
                    ...numberToInt32Array(position),
                    this.power,
                    clamp(this.power + BoostMotorMaxPowerAdd, 0, 100),
                    this._stopMode,
                    this._useProfile
                ]
            );

            this.status = BoostMotorState.ON_FOR_ROTATION;
            this._pendingRotationDestination = position;
            this._parent.send(cmd);
        }

        turnOff(useLimiter = true) {
            const cmd = this._parent.generateOutputCommand(
                this._index,
                BoostOutputExecution.EXECUTE_IMMEDIATELY,
                BoostOutputSubCommand.START_POWER,
                [this._stopMode === BoostMotorEndState.FLOAT ? BoostMotorEndState.FLOAT : 0]
            );

            this.status = BoostMotorState.OFF;
            this._parent.send(cmd, useLimiter);
        }

        _clearDurationTimeout() {
            if (this._pendingDurationTimeoutId !== null) {
                clearTimeout(this._pendingDurationTimeoutId);
                this._pendingDurationTimeoutId = null;
                this._pendingDurationTimeoutStartTime = null;
                this._pendingDurationTimeoutDelay = null;
            }
        }

        _setNewDurationTimeout(callback, delay) {
            this._clearDurationTimeout();
            const timeoutID = setTimeout(() => {
                if (this._pendingDurationTimeoutId === timeoutID) {
                    this._pendingDurationTimeoutId = null;
                    this._pendingDurationTimeoutStartTime = null;
                    this._pendingDurationTimeoutDelay = null;
                }
                callback();
            }, delay);
            this._pendingDurationTimeoutId = timeoutID;
            this._pendingDurationTimeoutStartTime = Date.now();
            this._pendingDurationTimeoutDelay = delay;
        }

        _clearRotationState() {
            if (this._pendingRotationPromise !== null) {
                this._pendingRotationPromise();
                this._pendingRotationPromise = null;
            }
            this._pendingRotationDestination = null;
        }
    }

    // ============================================================================
    // BOOST BRIDGE PERIPHERAL
    // ============================================================================

    class BoostBridge {
        constructor() {
            this.ws = null;
            this.connected = false;
            this.shouldReconnect = true;
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = 5;
            this.lastUrl = null;
            
            this._rateLimiter = new RateLimiter(BoostBLE.sendRateMax);
            
            this._ports = [];
            this._motors = [];
            this._portModes = {};
            
            this._sensors = {
                tiltX: 0,
                tiltY: 0,
                color: {},
                distance: {},
                reflection: {},
                ambient: {},
                force: {},
                pressed: {},
                previousColor: BoostColor.NONE
            };
            
            this._colorSamples = [];
            
            this._hubStatus = {
                batteryLevel: 100,
                buttonPressed: false,
                rssi: 0,
                fwVersion: "0.0.0.0",
                hwVersion: "0.0.0.0",
                lowVoltage: false,
                highCurrent: false,
                overPower: false
            };
        }

        get tiltX() { return this._sensors.tiltX; }
        get tiltY() { return this._sensors.tiltY; }
        get color() {
            return this._sensors.color[BoostPort.C] || 
                   Object.values(this._sensors.color)[0] || 
                   BoostColor.NONE;
        }
        get previousColor() { return this._sensors.previousColor; }
        get hubStatus() { return this._hubStatus; }

        getColor(port) { return this._sensors.color[port] || BoostColor.NONE; }
        getDistance(port) { return this._sensors.distance[port] || 0; }
        getReflection(port) { return this._sensors.reflection[port] || 0; }
        getAmbient(port) { return this._sensors.ambient[port] || 0; }
        getForce(port) { return this._sensors.force[port] || 0; }
        isForcePressed(port) { return this._sensors.pressed[port] || false; }

        motor(index) {
            return this._motors[index];
        }

        boostColorForIndex(index) {
            const colorForIndex = Object.keys(BoostColorIndex).find(key => BoostColorIndex[key] === index);
            return colorForIndex || BoostColor.NONE;
        }

        stopAllMotors() {
            this._motors.forEach(motor => {
                if (motor) {
                    motor.turnOff(false);
                }
            });
        }

        shutdown() {
            if (!this.isConnected()) return;
            const cmd = [0, BoostMessage.HUB_ACTIONS, BoostHubAction.SWITCH_OFF_HUB];
            cmd.unshift(cmd.length + 1);
            this.send(cmd, false);
        }

        setLED(inputRGB) {
            const rgb = [
                (inputRGB >> 16) & 0x000000FF,
                (inputRGB >> 8) & 0x000000FF,
                (inputRGB) & 0x000000FF
            ];

            const ledPortIndex = this._ports.indexOf(BoostIO.LED);
            if (ledPortIndex === -1) return Promise.resolve();

            const cmd = this.generateOutputCommand(
                ledPortIndex,
                BoostOutputExecution.EXECUTE_IMMEDIATELY | BoostOutputExecution.COMMAND_FEEDBACK,
                BoostOutputSubCommand.WRITE_DIRECT_MODE_DATA,
                [BoostMode.LED, ...rgb]
            );

            return this.send(cmd);
        }

        setLEDMode() {
            const ledPortIndex = this._ports.indexOf(BoostIO.LED);
            if (ledPortIndex === -1) return Promise.resolve();

            const cmd = this.generateInputCommand(ledPortIndex, BoostMode.LED, 0, false);
            return this.send(cmd);
        }

        async connect(url) {
            this.lastUrl = url;
            this.shouldReconnect = true;
            return this._connect(url);
        }

        async _connect(url) {
            return new Promise((resolve, reject) => {
                const wsUrl = url.startsWith('ws://') ? url : `ws://${url}`;
                console.log(`🔌 [Boost] Connecting to ${wsUrl}...`);
                
                this.ws = new WebSocket(wsUrl);
                
                const timeout = setTimeout(() => {
                    this.ws.close();
                    reject(new Error('Connection timeout'));
                }, 5000);

                this.ws.onopen = async () => {
                    clearTimeout(timeout);
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    console.log('✅ [Boost] Connected!');
                    
                    try {
                        await this._initialize();
                        resolve();
                    } catch (e) {
                        this.disconnect();
                        reject(e);
                    }
                };

                this.ws.onmessage = (e) => {
                    const bytes = base64ToBytes(e.data);
                    this._onMessage(bytes);
                };

                this.ws.onerror = (err) => {
                    clearTimeout(timeout);
                    console.error('❌ [Boost] WebSocket error:', err);
                    reject(new Error('WebSocket error'));
                };
                
                this.ws.onclose = () => {
                    this.connected = false;
                    console.log('❌ [Boost] Disconnected');
                    
                    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`🔄 [Boost] Reconnecting in 2s...`);
                        setTimeout(() => {
                            if (this.shouldReconnect) {
                                this._connect(this.lastUrl).catch(console.error);
                            }
                        }, 2000);
                    }
                };
            });
        }

        disconnect() {
            this.shouldReconnect = false;
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.connected = false;
            this.reset();
        }

        isConnected() {
            return this.connected;
        }

        reset() {
            this._ports = [];
            this._motors = [];
            this._portModes = {};
            this._sensors = {
                tiltX: 0,
                tiltY: 0,
                color: {},
                distance: {},
                reflection: {},
                ambient: {},
                force: {},
                pressed: {},
                previousColor: BoostColor.NONE
            };
            this._colorSamples = [];
            this._hubStatus = {
                batteryLevel: 100,
                buttonPressed: false,
                rssi: 0,
                fwVersion: "0.0.0.0",
                hwVersion: "0.0.0.0",
                lowVoltage: false,
                highCurrent: false,
                overPower: false
            };
        }

        async _initialize() {
            console.log('⚙️ [Boost] Initializing hub...');
            
            // Request firmware version
            setTimeout(() => {
                const command = [
                    0x00,
                    BoostMessage.HUB_PROPERTIES,
                    BoostHubProperty.FW_VERSION,
                    BoostHubPropertyOperation.REQUEST_UPDATE
                ];
                command.unshift(command.length + 1);
                this.send(command, false);
            }, 500);

            // Enable status monitoring
            const statusCommands = [
                [BoostMessage.HUB_PROPERTIES, BoostHubProperty.HW_VERSION, BoostHubPropertyOperation.REQUEST_UPDATE],
                [BoostMessage.HUB_PROPERTIES, BoostHubProperty.BATTERY_VOLTAGE, BoostHubPropertyOperation.ENABLE_UPDATES],
                [BoostMessage.HUB_PROPERTIES, BoostHubProperty.BUTTON, BoostHubPropertyOperation.ENABLE_UPDATES],
                [BoostMessage.HUB_PROPERTIES, BoostHubProperty.RSSI, BoostHubPropertyOperation.ENABLE_UPDATES],
                [BoostMessage.HUB_ALERTS, BoostAlert.LOW_VOLTAGE, BoostAlertOperation.ENABLE_UPDATES],
                [BoostMessage.HUB_ALERTS, BoostAlert.HIGH_CURRENT, BoostAlertOperation.ENABLE_UPDATES],
                [BoostMessage.HUB_ALERTS, BoostAlert.OVER_POWER_CONDITION, BoostAlertOperation.ENABLE_UPDATES]
            ];

            statusCommands.forEach(cmdData => {
                const cmd = [0, ...cmdData];
                cmd.unshift(cmd.length + 1);
                this.send(cmd, false);
            });
        }

        send(message, useLimiter = true) {
            if (!this.connected) return Promise.resolve();

            if (useLimiter && !this._rateLimiter.okayToSend()) {
                return Promise.resolve();
            }

            const b64 = bytesToBase64(message);
            this.ws.send(b64);
            return Promise.resolve();
        }

        generateOutputCommand(portID, execution, subCommand, payload) {
            const hubID = 0x00;
            const command = [hubID, BoostMessage.OUTPUT, portID, execution, subCommand, ...payload];
            command.unshift(command.length + 1);
            return command;
        }

        generateInputCommand(portID, mode, delta, enableNotifications) {
            const command = [
                0x00,
                BoostMessage.PORT_INPUT_FORMAT_SETUP_SINGLE,
                portID,
                mode
            ].concat(numberToInt32Array(delta)).concat([
                enableNotifications ? 1 : 0
            ]);
            command.unshift(command.length + 1);
            return command;
        }

        async _setInputMode(port, mode) {
            if (this._portModes[port] === mode) return Promise.resolve();
            
            this._portModes[port] = mode;
            const cmd = this.generateInputCommand(port, mode, 1, true);
            await this.send(cmd);
            
            return new Promise(resolve => setTimeout(resolve, 50));
        }

        _onMessage(data) {
            const messageType = data[2];
            const portID = data[3];

            switch (messageType) {
            case BoostMessage.HUB_PROPERTIES: {
                const property = data[3];
                const operation = data[4];
                
                if (operation !== BoostHubPropertyOperation.UPDATE) break;
                
                switch (property) {
                case BoostHubProperty.FW_VERSION: {
                    const fwVersion10000224 = int32ArrayToNumber([0x24, 0x02, 0x00, 0x10]);
                    const fwHub = int32ArrayToNumber(data.slice(5, 9));
                    if (fwHub < fwVersion10000224) {
                        BoostPort = BoostPort10000223OrOlder;
                        console.log('[Boost] Using old port mapping');
                    } else {
                        BoostPort = BoostPort10000224OrNewer;
                    }
                    this._hubStatus.fwVersion = decodeVersion(fwHub);
                    break;
                }
                case BoostHubProperty.HW_VERSION: {
                    const hwVersion = int32ArrayToNumber(data.slice(5, 9));
                    this._hubStatus.hwVersion = decodeVersion(hwVersion);
                    break;
                }
                case BoostHubProperty.BATTERY_VOLTAGE:
                    this._hubStatus.batteryLevel = data[5];
                    break;
                case BoostHubProperty.BUTTON:
                    this._hubStatus.buttonPressed = (data[5] === 1);
                    break;
                case BoostHubProperty.RSSI:
                    this._hubStatus.rssi = data[5];
                    break;
                }
                break;
            }

            case BoostMessage.HUB_ALERTS: {
                const alertType = data[3];
                const operation = data[4];
                
                if (operation !== BoostAlertOperation.UPDATE) break;
                
                const status = data[5] === 0xFF;
                switch (alertType) {
                case BoostAlert.LOW_VOLTAGE:
                    this._hubStatus.lowVoltage = status;
                    break;
                case BoostAlert.HIGH_CURRENT:
                    this._hubStatus.highCurrent = status;
                    break;
                case BoostAlert.OVER_POWER_CONDITION:
                    this._hubStatus.overPower = status;
                    break;
                }
                break;
            }

            case BoostMessage.HUB_ATTACHED_IO: {
                const event = data[4];
                const typeId = data[5];

                switch (event) {
                case BoostIOEvent.ATTACHED:
                    this._registerSensorOrMotor(portID, typeId);
                    break;
                case BoostIOEvent.DETACHED:
                    this._clearPort(portID);
                    break;
                }
                break;
            }

            case BoostMessage.PORT_VALUE: {
                const type = this._ports[portID];
                const mode = this._portModes[portID];

                switch (type) {
                case BoostIO.TILT:
                    this._sensors.tiltX = data[4];
                    this._sensors.tiltY = data[5];
                    break;
                    
                case BoostIO.COLOR:
                    if (mode === BoostMode.COLOR) {
                        this._colorSamples.unshift(data[4]);
                        if (this._colorSamples.length > BoostColorSampleSize) {
                            this._colorSamples.pop();
                            if (this._colorSamples.every((v, i, arr) => v === arr[0])) {
                                this._sensors.previousColor = this._sensors.color[portID] || BoostColor.NONE;
                                this._sensors.color[portID] = this.boostColorForIndex(this._colorSamples[0]);
                            } else {
                                this._sensors.color[portID] = BoostColor.NONE;
                            }
                        } else {
                            this._sensors.color[portID] = BoostColor.NONE;
                        }
                    } else if (mode === BoostMode.DISTANCE) {
                        this._sensors.distance[portID] = data[4] * 10;
                    } else if (mode === BoostMode.REFLECTION) {
                        this._sensors.reflection[portID] = data[4];
                    } else if (mode === BoostMode.AMBIENT) {
                        this._sensors.ambient[portID] = data[4];
                    }
                    break;
                    
                case BoostIO.TECHNIC_FORCE_SENSOR:
                    if (mode === BoostMode.FORCE) {
                        this._sensors.force[portID] = data[4] / 10;
                    } else if (mode === BoostMode.TOUCHED) {
                        this._sensors.pressed[portID] = (data[4] > 0);
                    }
                    break;
                    
                case BoostIO.MOTOREXT:
                case BoostIO.MOTORINT:
                    if (this.motor(portID)) {
                        this.motor(portID).position = int32ArrayToNumber(data.slice(4, 8));
                    }
                    break;
                }
                break;
            }

            case BoostMessage.PORT_FEEDBACK: {
                const feedback = data[4];
                const motor = this.motor(portID);
                if (motor) {
                    const isBusy = feedback & BoostPortFeedback.IN_PROGRESS;
                    const commandCompleted = feedback & (BoostPortFeedback.COMPLETED | BoostPortFeedback.DISCARDED);
                    if (!isBusy && commandCompleted) {
                        if (motor.status === BoostMotorState.ON_FOR_ROTATION) {
                            motor.status = BoostMotorState.OFF;
                        }
                    }
                }
                break;
            }

            case BoostMessage.ERROR:
                console.warn(`[Boost] Error from hub:`, Array.from(data));
                break;
            }
        }

        _registerSensorOrMotor(portID, type) {
            this._ports[portID] = type;

            if (type === BoostIO.MOTORINT || type === BoostIO.MOTOREXT) {
                this._motors[portID] = new BoostMotor(this, portID);
            }

            let mode = null;
            let delta = 1;

            switch (type) {
            case BoostIO.MOTORINT:
            case BoostIO.MOTOREXT:
                mode = BoostMode.MOTOR_SENSOR;
                break;
            case BoostIO.COLOR:
                mode = BoostMode.COLOR;
                delta = 0;
                break;
            case BoostIO.TECHNIC_FORCE_SENSOR:
                mode = BoostMode.FORCE;
                break;
            case BoostIO.LED:
                mode = BoostMode.LED;
                this.setLEDMode();
                this.setLED(0x0000FF);
                break;
            case BoostIO.TILT:
                mode = BoostMode.TILT;
                break;
            default:
                mode = BoostMode.UNKNOWN;
            }

            const cmd = this.generateInputCommand(portID, mode, delta, true);
            this.send(cmd);
        }

        _clearPort(portID) {
            const type = this._ports[portID];
            
            if (type === BoostIO.TILT) {
                this._sensors.tiltX = this._sensors.tiltY = 0;
            }
            if (type === BoostIO.COLOR) {
                delete this._sensors.color[portID];
                delete this._sensors.distance[portID];
                delete this._sensors.reflection[portID];
                delete this._sensors.ambient[portID];
            }
            if (type === BoostIO.TECHNIC_FORCE_SENSOR) {
                delete this._sensors.force[portID];
                delete this._sensors.pressed[portID];
            }
            
            this._ports[portID] = 'none';
            this._motors[portID] = null;
            delete this._portModes[portID];
        }
    }

    // ============================================================================
    // SCRATCH EXTENSION
    // ============================================================================

    const BoostMotorLabel = {
        A: 'A', B: 'B', C: 'C', D: 'D', AB: 'AB', ALL: 'ALL'
    };

    const BoostMotorDirection = {
        FORWARD: 'this way', BACKWARD: 'that way', REVERSE: 'reverse'
    };

    const BoostTiltDirection = {
        UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right', ANY: 'any'
    };

    class BoostBridgeExtension {
        constructor(runtime) {
            this.runtime = runtime;
            this.peripheral = new BoostBridge();
        }

        static get TILT_THRESHOLD() {
            return 15;
        }

        getInfo() {
            return {
                id: 'legoboostbridge',
                name: 'LEGO Boost (Bridge)',
                color1: '#FF6B00',
                color2: '#CC5500',
                blockIconURI: iconURI,
                blocks: [
                    {
                        opcode: 'connect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🔌 connect to [URL]',
                        arguments: {
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'localhost:8082' }
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
                    
                    {
                        opcode: 'motorOnFor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn motor [MOTOR_ID] for [DURATION] seconds',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            DURATION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'motorOnForRotation',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn motor [MOTOR_ID] for [ROTATION] rotations',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            ROTATION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'motorRunToPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn motor [MOTOR_ID] to position [POSITION]',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID_SINGLE', defaultValue: BoostMotorLabel.A },
                            POSITION: { type: Scratch.ArgumentType.ANGLE, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'motorOn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn motor [MOTOR_ID] on',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A }
                        }
                    },
                    {
                        opcode: 'motorOff',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn motor [MOTOR_ID] off',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A }
                        }
                    },
                    
                    '---',
                    
                    {
                        opcode: 'setMotorPower',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set motor [MOTOR_ID] speed to [POWER] %',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.ALL },
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'setMotorDirection',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set motor [MOTOR_ID] direction [MOTOR_DIRECTION]',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            MOTOR_DIRECTION: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_DIRECTION', defaultValue: BoostMotorDirection.FORWARD }
                        }
                    },
                    {
                        opcode: 'setMotorStopAction',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set motor [MOTOR_ID] stop action to [ACTION]',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            ACTION: { type: Scratch.ArgumentType.STRING, menu: 'STOP_ACTION', defaultValue: 'brake' }
                        }
                    },
                    {
                        opcode: 'setMotorAcceleration',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set motor [MOTOR_ID] acceleration to [TIME] ms',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 300 }
                        }
                    },
                    {
                        opcode: 'setMotorDeceleration',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set motor [MOTOR_ID] deceleration to [TIME] ms',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 300 }
                        }
                    },
                    {
                        opcode: 'resetMotorPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset motor [MOTOR_ID] position to [POSITION]',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID', defaultValue: BoostMotorLabel.A },
                            POSITION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'getMotorPosition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'motor [MOTOR_ID] position',
                        arguments: {
                            MOTOR_ID: { type: Scratch.ArgumentType.STRING, menu: 'MOTOR_ID_SINGLE', defaultValue: BoostMotorLabel.A }
                        }
                    },

                    '---',

                    {
                        opcode: 'whenColor',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when [PORT] sees [COLOR] brick',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' },
                            COLOR: { type: Scratch.ArgumentType.STRING, menu: 'COLOR', defaultValue: BoostColor.ANY }
                        }
                    },
                    {
                        opcode: 'seeingColor',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[PORT] seeing [COLOR] brick?',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' },
                            COLOR: { type: Scratch.ArgumentType.STRING, menu: 'COLOR', defaultValue: BoostColor.ANY }
                        }
                    },
                    {
                        opcode: 'getDistance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[PORT] distance (mm)',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' }
                        }
                    },
                    {
                        opcode: 'getReflection',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[PORT] reflection (%)',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' }
                        }
                    },

                    '---',

                    {
                        opcode: 'getForce',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[PORT] force (N)',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' }
                        }
                    },
                    {
                        opcode: 'isForceSensorPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[PORT] force sensor pressed?',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' }
                        }
                    },
                    {
                        opcode: 'whenForceSensorPressed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when [PORT] force sensor pressed',
                        arguments: {
                            PORT: { type: Scratch.ArgumentType.STRING, menu: 'SENSOR_PORTS', defaultValue: 'C' }
                        }
                    },

                    '---',

                    {
                        opcode: 'whenTilted',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when tilted [TILT_DIRECTION_ANY]',
                        arguments: {
                            TILT_DIRECTION_ANY: { type: Scratch.ArgumentType.STRING, menu: 'TILT_DIRECTION_ANY', defaultValue: BoostTiltDirection.ANY }
                        }
                    },
                    {
                        opcode: 'isTilted',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'tilted [TILT_DIRECTION_ANY]?',
                        arguments: {
                            TILT_DIRECTION_ANY: { type: Scratch.ArgumentType.STRING, menu: 'TILT_DIRECTION_ANY', defaultValue: BoostTiltDirection.ANY }
                        }
                    },
                    {
                        opcode: 'getTiltAngle',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'tilt angle [TILT_DIRECTION]',
                        arguments: {
                            TILT_DIRECTION: { type: Scratch.ArgumentType.STRING, menu: 'TILT_DIRECTION', defaultValue: BoostTiltDirection.UP }
                        }
                    },

                    '---',

                    {
                        opcode: 'setLightHue',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set light color to [HUE]',
                        arguments: {
                            HUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                        }
                    },
                    {
                        opcode: 'shutdown',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'shutdown hub'
                    },
                    {
                        opcode: 'whenButtonPressed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when hub button pressed'
                    },
                    {
                        opcode: 'isButtonPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'hub button pressed?'
                    },
                    {
                        opcode: 'getBatteryLevel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'battery level (%)'
                    },
                    {
                        opcode: 'getFirmwareVersion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'firmware version'
                    },
                    {
                        opcode: 'getRSSI',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Bluetooth signal strength'
                    },

                    '---',

                    {
                        opcode: 'whenBatteryLow',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when battery is low'
                    },
                    {
                        opcode: 'whenMotorOverloaded',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when motor overloaded'
                    }
                ],
                menus: {
                    MOTOR_ID: {
                        acceptReporters: true,
                        items: ['A', 'B', 'C', 'D', 'AB', 'ALL']
                    },
                    MOTOR_ID_SINGLE: {
                        acceptReporters: true,
                        items: ['A', 'B', 'C', 'D']
                    },
                    SENSOR_PORTS: {
                        acceptReporters: true,
                        items: ['A', 'B', 'C', 'D']
                    },
                    STOP_ACTION: {
                        acceptReporters: true,
                        items: ['float', 'brake', 'hold']
                    },
                    MOTOR_DIRECTION: {
                        acceptReporters: true,
                        items: [
                            { text: 'this way', value: BoostMotorDirection.FORWARD },
                            { text: 'that way', value: BoostMotorDirection.BACKWARD },
                            { text: 'reverse', value: BoostMotorDirection.REVERSE }
                        ]
                    },
                    TILT_DIRECTION: {
                        acceptReporters: true,
                        items: ['up', 'down', 'left', 'right']
                    },
                    TILT_DIRECTION_ANY: {
                        acceptReporters: true,
                        items: ['up', 'down', 'left', 'right', 'any']
                    },
                    COLOR: {
                        acceptReporters: true,
                        items: ['red', 'blue', 'green', 'yellow', 'white', 'black', 'any color']
                    }
                }
            };
        }

        // Connection
        connect(args) { return this.peripheral.connect(args.URL); }
        disconnect() { return this.peripheral.disconnect(); }
        isConnected() { return this.peripheral.isConnected(); }

        // Utility
        _getPortFromLabel(label) {
            switch (label) {
            case 'A': return BoostPort.A;
            case 'B': return BoostPort.B;
            case 'C': return BoostPort.C;
            case 'D': return BoostPort.D;
            default: return null;
            }
        }

        _forEachMotor(motorID, callback) {
            let motors;
            switch (motorID) {
            case BoostMotorLabel.A: motors = [BoostPort.A]; break;
            case BoostMotorLabel.B: motors = [BoostPort.B]; break;
            case BoostMotorLabel.C: motors = [BoostPort.C]; break;
            case BoostMotorLabel.D: motors = [BoostPort.D]; break;
            case BoostMotorLabel.AB: motors = [BoostPort.A, BoostPort.B]; break;
            case BoostMotorLabel.ALL: motors = [BoostPort.A, BoostPort.B, BoostPort.C, BoostPort.D]; break;
            default: motors = []; break;
            }
            for (const index of motors) {
                callback(index);
            }
        }

        // Motors
        motorOnFor(args) {
            let durationMS = Cast.toNumber(args.DURATION) * 1000;
            durationMS = clamp(durationMS, 0, 15000);
            
            return new Promise(resolve => {
                this._forEachMotor(args.MOTOR_ID, motorIndex => {
                    const motor = this.peripheral.motor(motorIndex);
                    if (motor) motor.turnOnFor(durationMS);
                });
                setTimeout(resolve, durationMS);
            });
        }

        motorOnForRotation(args) {
            let degrees = Cast.toNumber(args.ROTATION) * 360;
            const sign = Math.sign(degrees);
            degrees = Math.abs(clamp(degrees, -360000, 360000));

            const motors = [];
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                motors.push(motorIndex);
            });

            const promises = motors.map(portID => {
                const motor = this.peripheral.motor(portID);
                if (motor) {
                    if (motor.power === 0) return Promise.resolve();
                    return new Promise(resolve => {
                        motor.turnOnForDegrees(degrees, sign);
                        motor.pendingRotationPromise = resolve;
                    });
                }
                return null;
            });
            
            return Promise.all(promises).then(() => {});
        }

        motorRunToPosition(args) {
            const position = Cast.toNumber(args.POSITION);
            const promises = [];
            
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    promises.push(new Promise(resolve => {
                        motor.turnToPosition(position);
                        motor.pendingRotationPromise = resolve;
                    }));
                }
            });
            
            return Promise.all(promises).then(() => {});
        }

        motorOn(args) {
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) motor.turnOnForever();
            });
            return new Promise(resolve => setTimeout(resolve, BoostBLE.sendInterval));
        }

        motorOff(args) {
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) motor.turnOff();
            });
            return new Promise(resolve => setTimeout(resolve, BoostBLE.sendInterval));
        }

        setMotorPower(args) {
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    motor.power = clamp(Cast.toNumber(args.POWER), 0, 100);
                    switch (motor.status) {
                    case BoostMotorState.ON_FOREVER:
                        motor.turnOnForever();
                        break;
                    case BoostMotorState.ON_FOR_TIME:
                        motor.turnOnFor(motor.pendingDurationTimeoutStartTime +
                            motor.pendingDurationTimeoutDelay - Date.now());
                        break;
                    }
                }
            });
            return new Promise(resolve => setTimeout(resolve, BoostBLE.sendInterval));
        }

        setMotorDirection(args) {
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    switch (args.MOTOR_DIRECTION) {
                    case BoostMotorDirection.FORWARD:
                        motor.direction = 1;
                        break;
                    case BoostMotorDirection.BACKWARD:
                        motor.direction = -1;
                        break;
                    case BoostMotorDirection.REVERSE:
                        motor.direction = -motor.direction;
                        break;
                    }
                    
                    switch (motor.status) {
                    case BoostMotorState.ON_FOREVER:
                        motor.turnOnForever();
                        break;
                    case BoostMotorState.ON_FOR_TIME:
                        motor.turnOnFor(motor.pendingDurationTimeoutStartTime +
                            motor.pendingDurationTimeoutDelay - Date.now());
                        break;
                    }
                }
            });
            return new Promise(resolve => setTimeout(resolve, BoostBLE.sendInterval));
        }

        setMotorStopAction(args) {
            const stopModeMap = {
                float: BoostMotorEndState.FLOAT,
                brake: BoostMotorEndState.BRAKE,
                hold: BoostMotorEndState.HOLD
            };
            const action = stopModeMap[args.ACTION] || BoostMotorEndState.BRAKE;
            
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    motor.stopMode = action;
                }
            });
        }

        setMotorAcceleration(args) {
            const time = Cast.toNumber(args.TIME);
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    motor.setAcceleration(time);
                }
            });
        }

        setMotorDeceleration(args) {
            const time = Cast.toNumber(args.TIME);
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    motor.setDeceleration(time);
                }
            });
        }

        resetMotorPosition(args) {
            const position = Cast.toNumber(args.POSITION);
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this.peripheral.motor(motorIndex);
                if (motor) {
                    motor.resetPosition(position);
                }
            });
        }

        getMotorPosition(args) {
            let portID = null;
            switch (args.MOTOR_ID) {
            case BoostMotorLabel.A: portID = BoostPort.A; break;
            case BoostMotorLabel.B: portID = BoostPort.B; break;
            case BoostMotorLabel.C: portID = BoostPort.C; break;
            case BoostMotorLabel.D: portID = BoostPort.D; break;
            default: return 0;
            }
            
            if (portID !== null && this.peripheral.motor(portID)) {
                let val = this.peripheral.motor(portID).position;
                if (portID === BoostPort.A) {
                    val *= -1;
                }
                return wrapClamp(val, 0, 360);
            }
            return 0;
        }

        // Sensors
        async _checkColor(args) {
            const port = this._getPortFromLabel(args.PORT);
            if (port === null) return false;
            
            await this.peripheral._setInputMode(port, BoostMode.COLOR);
            
            const currentColor = this.peripheral.getColor(port);
            if (args.COLOR === BoostColor.ANY) {
                return currentColor !== BoostColor.NONE;
            }
            return currentColor === args.COLOR;
        }

        whenColor(args) {
            if (args.COLOR === BoostColor.ANY) {
                return this.peripheral.color !== BoostColor.NONE &&
                    this.peripheral.color !== this.peripheral.previousColor;
            }
            return args.COLOR === this.peripheral.color || this._checkColor(args);
        }

        seeingColor(args) {
            return this._checkColor(args);
        }

        async getDistance(args) {
            const port = this._getPortFromLabel(args.PORT);
            if (port === null) return 0;
            
            await this.peripheral._setInputMode(port, BoostMode.DISTANCE);
            return this.peripheral.getDistance(port);
        }

        async getReflection(args) {
            const port = this._getPortFromLabel(args.PORT);
            if (port === null) return 0;
            
            await this.peripheral._setInputMode(port, BoostMode.REFLECTION);
            return this.peripheral.getReflection(port);
        }

        async getForce(args) {
            const port = this._getPortFromLabel(args.PORT);
            if (port === null) return 0;
            
            await this.peripheral._setInputMode(port, BoostMode.FORCE);
            return this.peripheral.getForce(port);
        }

        async isForceSensorPressed(args) {
            const port = this._getPortFromLabel(args.PORT);
            if (port === null) return false;
            
            await this.peripheral._setInputMode(port, BoostMode.TOUCHED);
            return this.peripheral.isForcePressed(port);
        }

        whenForceSensorPressed(args) {
            return this.isForceSensorPressed(args);
        }

        whenTilted(args) {
            return this._isTilted(args.TILT_DIRECTION_ANY);
        }

        isTilted(args) {
            return this._isTilted(args.TILT_DIRECTION_ANY);
        }

        getTiltAngle(args) {
            return this._getTiltAngle(args.TILT_DIRECTION);
        }

        _isTilted(direction) {
            switch (direction) {
            case BoostTiltDirection.ANY:
                return (Math.abs(this.peripheral.tiltX) >= BoostBridgeExtension.TILT_THRESHOLD) ||
                    (Math.abs(this.peripheral.tiltY) >= BoostBridgeExtension.TILT_THRESHOLD);
            default:
                return this._getTiltAngle(direction) >= BoostBridgeExtension.TILT_THRESHOLD;
            }
        }

        _getTiltAngle(direction) {
            switch (direction) {
            case BoostTiltDirection.UP:
                return this.peripheral.tiltY > 90 ? 256 - this.peripheral.tiltY : -this.peripheral.tiltY;
            case BoostTiltDirection.DOWN:
                return this.peripheral.tiltY > 90 ? this.peripheral.tiltY - 256 : this.peripheral.tiltY;
            case BoostTiltDirection.LEFT:
                return this.peripheral.tiltX > 90 ? this.peripheral.tiltX - 256 : this.peripheral.tiltX;
            case BoostTiltDirection.RIGHT:
                return this.peripheral.tiltX > 90 ? 256 - this.peripheral.tiltX : -this.peripheral.tiltX;
            default:
                return 0;
            }
        }

        // Hub control
        setLightHue(args) {
            let inputHue = Cast.toNumber(args.HUE);
            inputHue = wrapClamp(inputHue, 0, 100);
            const hue = inputHue * 360 / 100;

            const rgbObject = hsvToRgb({h: hue, s: 1, v: 1});
            const rgbDecimal = rgbToDecimal(rgbObject);

            this.peripheral.setLED(rgbDecimal);
            return new Promise(resolve => setTimeout(resolve, BoostBLE.sendInterval));
        }

        shutdown() {
            this.peripheral.shutdown();
        }

        whenButtonPressed() {
            return this.peripheral.hubStatus.buttonPressed;
        }

        isButtonPressed() {
            return this.peripheral.hubStatus.buttonPressed;
        }

        getBatteryLevel() {
            return this.peripheral.hubStatus.batteryLevel;
        }

        getFirmwareVersion() {
            return this.peripheral.hubStatus.fwVersion;
        }

        getRSSI() {
            return this.peripheral.hubStatus.rssi;
        }

        whenBatteryLow() {
            return this.peripheral.hubStatus.lowVoltage;
        }

        whenMotorOverloaded() {
            return this.peripheral.hubStatus.highCurrent || this.peripheral.hubStatus.overPower;
        }
    }

    Scratch.extensions.register(new BoostBridgeExtension());
    console.log('🎉 LEGO Boost Bridge Extension loaded!');

})(Scratch);