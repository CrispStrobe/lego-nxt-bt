// wedo2.js - WeDo 2.0 Extension for TurboWarp/Scratch

class WeDo2Extension {
  constructor(runtime) {
    this.runtime = runtime;
    
    // Connection state
    this._device = null;
    this._server = null;
    this._connected = false;
    
    // Characteristics
    this._attachedIOChar = null;
    this._inputValuesChar = null;
    this._inputCommandChar = null;
    this._outputCommandChar = null;
    
    // Device state
    this._ports = ['none', 'none']; // Port 1 and Port 2
    this._motors = [null, null];
    this._sensors = {
      tiltX: 0,
      tiltY: 0,
      distance: 0
    };
    
    // Service and Characteristic UUIDs
    this.DEVICE_SERVICE = '00001523-1212-efde-1523-785feabcd123';
    this.IO_SERVICE = '00004f0e-1212-efde-1523-785feabcd123';
    
    this.ATTACHED_IO = '00001527-1212-efde-1523-785feabcd123';
    this.INPUT_VALUES = '00001560-1212-efde-1523-785feabcd123';
    this.INPUT_COMMAND = '00001563-1212-efde-1523-785feabcd123';
    this.OUTPUT_COMMAND = '00001565-1212-efde-1523-785feabcd123';
    
    // Device types
    this.DEVICE_MOTOR = 1;
    this.DEVICE_LED = 23;
    this.DEVICE_PIEZO = 22;
    this.DEVICE_TILT = 34;
    this.DEVICE_DISTANCE = 35;
    
    // Command IDs
    this.CMD_MOTOR_POWER = 1;
    this.CMD_PLAY_TONE = 2;
    this.CMD_STOP_TONE = 3;
    this.CMD_WRITE_RGB = 4;
    
    // Modes
    this.MODE_TILT = 0;
    this.MODE_DISTANCE = 0;
    
    // Connect IDs for built-in devices
    this.LED_PORT = 6;
    this.PIEZO_PORT = 5;
    
    this.runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));
  }

  getInfo() {
    return {
      id: 'wedo2',
      name: 'WeDo 2.0',
      color1: '#0fBD8C',
      color2: '#0DA57A',
      color3: '#0B8E69',
      blocks: [
        {
          opcode: 'connect',
          blockType: 'command',
          text: 'connect WeDo 2.0'
        },
        {
          opcode: 'disconnect',
          blockType: 'command',
          text: 'disconnect WeDo 2.0'
        },
        '---',
        {
          opcode: 'motorOn',
          blockType: 'command',
          text: 'turn motor [MOTOR] on',
          arguments: {
            MOTOR: {
              type: 'number',
              menu: 'MOTOR_MENU',
              defaultValue: 1
            }
          }
        },
        {
          opcode: 'motorOnFor',
          blockType: 'command',
          text: 'turn motor [MOTOR] on for [DURATION] seconds',
          arguments: {
            MOTOR: {
              type: 'number',
              menu: 'MOTOR_MENU',
              defaultValue: 1
            },
            DURATION: {
              type: 'number',
              defaultValue: 1
            }
          }
        },
        {
          opcode: 'motorOff',
          blockType: 'command',
          text: 'turn motor [MOTOR] off',
          arguments: {
            MOTOR: {
              type: 'number',
              menu: 'MOTOR_MENU',
              defaultValue: 1
            }
          }
        },
        {
          opcode: 'setMotorPower',
          blockType: 'command',
          text: 'set motor [MOTOR] power to [POWER]',
          arguments: {
            MOTOR: {
              type: 'number',
              menu: 'MOTOR_MENU',
              defaultValue: 1
            },
            POWER: {
              type: 'number',
              defaultValue: 100
            }
          }
        },
        {
          opcode: 'setMotorDirection',
          blockType: 'command',
          text: 'set motor [MOTOR] direction to [DIRECTION]',
          arguments: {
            MOTOR: {
              type: 'number',
              menu: 'MOTOR_MENU',
              defaultValue: 1
            },
            DIRECTION: {
              type: 'string',
              menu: 'DIRECTION_MENU',
              defaultValue: 'forward'
            }
          }
        },
        '---',
        {
          opcode: 'setLEDColor',
          blockType: 'command',
          text: 'set LED to [COLOR]',
          arguments: {
            COLOR: {
              type: 'string',
              menu: 'COLOR_MENU',
              defaultValue: 'blue'
            }
          }
        },
        {
          opcode: 'setLEDRGB',
          blockType: 'command',
          text: 'set LED to r:[R] g:[G] b:[B]',
          arguments: {
            R: { type: 'number', defaultValue: 255 },
            G: { type: 'number', defaultValue: 0 },
            B: { type: 'number', defaultValue: 0 }
          }
        },
        {
          opcode: 'ledOff',
          blockType: 'command',
          text: 'turn LED off'
        },
        '---',
        {
          opcode: 'playNote',
          blockType: 'command',
          text: 'play note [NOTE] for [DURATION] seconds',
          arguments: {
            NOTE: {
              type: 'number',
              defaultValue: 60
            },
            DURATION: {
              type: 'number',
              defaultValue: 0.5
            }
          }
        },
        {
          opcode: 'playTone',
          blockType: 'command',
          text: 'play tone [FREQ] Hz for [DURATION] seconds',
          arguments: {
            FREQ: {
              type: 'number',
              defaultValue: 440
            },
            DURATION: {
              type: 'number',
              defaultValue: 0.5
            }
          }
        },
        {
          opcode: 'stopSound',
          blockType: 'command',
          text: 'stop sound'
        },
        '---',
        {
          opcode: 'getDistance',
          blockType: 'reporter',
          text: 'distance'
        },
        {
          opcode: 'getTiltX',
          blockType: 'reporter',
          text: 'tilt X'
        },
        {
          opcode: 'getTiltY',
          blockType: 'reporter',
          text: 'tilt Y'
        },
        {
          opcode: 'isTilted',
          blockType: 'Boolean',
          text: 'tilted [DIRECTION]?',
          arguments: {
            DIRECTION: {
              type: 'string',
              menu: 'TILT_MENU',
              defaultValue: 'any'
            }
          }
        },
        {
          opcode: 'whenDistance',
          blockType: 'hat',
          text: 'when distance [OP] [VALUE]',
          arguments: {
            OP: {
              type: 'string',
              menu: 'COMPARE_MENU',
              defaultValue: '<'
            },
            VALUE: {
              type: 'number',
              defaultValue: 5
            }
          }
        },
        {
          opcode: 'whenTilted',
          blockType: 'hat',
          text: 'when tilted [DIRECTION]',
          arguments: {
            DIRECTION: {
              type: 'string',
              menu: 'TILT_MENU',
              defaultValue: 'any'
            }
          }
        }
      ],
      menus: {
        MOTOR_MENU: {
          acceptReporters: true,
          items: [
            { text: 'A (port 1)', value: 1 },
            { text: 'B (port 2)', value: 2 }
          ]
        },
        DIRECTION_MENU: {
          acceptReporters: true,
          items: ['forward', 'backward', 'reverse']
        },
        COLOR_MENU: {
          acceptReporters: true,
          items: [
            'off', 'pink', 'purple', 'blue', 'sky blue', 
            'teal', 'green', 'yellow', 'orange', 'red', 'white'
          ]
        },
        TILT_MENU: {
          acceptReporters: true,
          items: ['up', 'down', 'left', 'right', 'any']
        },
        COMPARE_MENU: {
          acceptReporters: true,
          items: ['<', '>']
        }
      }
    };
  }

  // ============================================================================
  // CONNECTION METHODS
  // ============================================================================

  async connect() {
    if (this._connected) {
      console.log('Already connected');
      return;
    }

    try {
      // Request Bluetooth device
      this._device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.DEVICE_SERVICE] }],
        optionalServices: [this.IO_SERVICE]
      });

      console.log('Connecting to', this._device.name);
      
      // Connect to GATT server
      this._server = await this._device.gatt.connect();
      
      // Get services
      const deviceService = await this._server.getPrimaryService(this.DEVICE_SERVICE);
      const ioService = await this._server.getPrimaryService(this.IO_SERVICE);
      
      // Get characteristics
      this._attachedIOChar = await deviceService.getCharacteristic(this.ATTACHED_IO);
      this._inputValuesChar = await ioService.getCharacteristic(this.INPUT_VALUES);
      this._inputCommandChar = await ioService.getCharacteristic(this.INPUT_COMMAND);
      this._outputCommandChar = await ioService.getCharacteristic(this.OUTPUT_COMMAND);
      
      // Start notifications for device attach/detach
      await this._attachedIOChar.startNotifications();
      this._attachedIOChar.addEventListener('characteristicvaluechanged', 
        this._handleAttachedIO.bind(this));
      
      // Start notifications for sensor values
      await this._inputValuesChar.startNotifications();
      this._inputValuesChar.addEventListener('characteristicvaluechanged', 
        this._handleSensorValue.bind(this));
      
      this._connected = true;
      console.log('Connected to WeDo 2.0!');
      
      // Initialize LED
      await this._setLEDMode();
      await this._setLEDColorByIndex(3); // Blue
      
    } catch (error) {
      console.error('Connection failed:', error);
      this._connected = false;
    }
  }

  async disconnect() {
    if (this._device && this._device.gatt.connected) {
      await this._device.gatt.disconnect();
    }
    this._connected = false;
    this._ports = ['none', 'none'];
    this._motors = [null, null];
    console.log('Disconnected');
  }

  // ============================================================================
  // MESSAGE HANDLERS
  // ============================================================================

  _handleAttachedIO(event) {
    const data = new Uint8Array(event.target.value.buffer);
    const portId = data[0];
    const attached = data[1];
    
    if (attached === 0) {
      // Device detached
      this._clearPort(portId);
      console.log(`Device detached from port ${portId}`);
    } else if (attached === 1) {
      // Device attached
      const deviceType = data[3];
      this._registerDevice(portId, deviceType);
      console.log(`Device type ${deviceType} attached to port ${portId}`);
    }
  }

  _handleSensorValue(event) {
    const data = new Uint8Array(event.target.value.buffer);
    const portId = data[1];
    const deviceType = this._ports[portId - 1];
    
    if (deviceType === this.DEVICE_DISTANCE) {
      this._sensors.distance = data[2];
    } else if (deviceType === this.DEVICE_TILT) {
      // Handle signed values
      this._sensors.tiltX = data[2] > 127 ? data[2] - 256 : data[2];
      this._sensors.tiltY = data[3] > 127 ? data[3] - 256 : data[3];
    }
  }

  _registerDevice(portId, deviceType) {
    this._ports[portId - 1] = deviceType;
    
    if (deviceType === this.DEVICE_MOTOR) {
      this._motors[portId - 1] = {
        portId,
        power: 100,
        direction: 1,
        isOn: false
      };
    } else if (deviceType === this.DEVICE_DISTANCE || deviceType === this.DEVICE_TILT) {
      // Set up sensor input format
      const mode = deviceType === this.DEVICE_DISTANCE ? this.MODE_DISTANCE : this.MODE_TILT;
      const unit = deviceType === this.DEVICE_DISTANCE ? 1 : 0; // percent or raw
      
      const cmd = new Uint8Array([
        1,        // Command ID: Sensor Format
        2,        // Command Type: Write
        portId,   // Port ID
        deviceType,
        mode,
        1,        // Delta interval (1 = any change)
        0, 0, 0,  // Delta interval bytes 2-4
        unit,     // Unit
        1         // Enable notifications
      ]);
      
      this._writeCharacteristic(this._inputCommandChar, cmd);
    }
  }

  _clearPort(portId) {
    const deviceType = this._ports[portId - 1];
    
    if (deviceType === this.DEVICE_TILT) {
      this._sensors.tiltX = 0;
      this._sensors.tiltY = 0;
    } else if (deviceType === this.DEVICE_DISTANCE) {
      this._sensors.distance = 0;
    }
    
    this._ports[portId - 1] = 'none';
    this._motors[portId - 1] = null;
  }

  // ============================================================================
  // MOTOR BLOCKS
  // ============================================================================

  motorOn(args) {
    const motor = this._getMotor(args.MOTOR);
    if (!motor) return;
    
    this._sendMotorCommand(motor.portId, motor.power * motor.direction);
    motor.isOn = true;
  }

  async motorOnFor(args) {
    const motor = this._getMotor(args.MOTOR);
    if (!motor) return;
    
    const duration = Math.max(0, args.DURATION * 1000);
    
    this._sendMotorCommand(motor.portId, motor.power * motor.direction);
    motor.isOn = true;
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    this._sendMotorCommand(motor.portId, 127); // Brake
    await new Promise(resolve => setTimeout(resolve, 100));
    this._sendMotorCommand(motor.portId, 0); // Stop
    motor.isOn = false;
  }

  motorOff(args) {
    const motor = this._getMotor(args.MOTOR);
    if (!motor) return;
    
    this._sendMotorCommand(motor.portId, 0);
    motor.isOn = false;
  }

  setMotorPower(args) {
    const motor = this._getMotor(args.MOTOR);
    if (!motor) return;
    
    // Map [0-100] to [30-100] (WeDo 2.0 only responds to 30-100)
    let power = Math.max(0, Math.min(100, args.POWER));
    if (power > 0) {
      power = 30 + (70 * power / 100);
    }
    
    motor.power = power;
    
    if (motor.isOn) {
      this._sendMotorCommand(motor.portId, motor.power * motor.direction);
    }
  }

  setMotorDirection(args) {
    const motor = this._getMotor(args.MOTOR);
    if (!motor) return;
    
    if (args.DIRECTION === 'forward') {
      motor.direction = 1;
    } else if (args.DIRECTION === 'backward') {
      motor.direction = -1;
    } else if (args.DIRECTION === 'reverse') {
      motor.direction = -motor.direction;
    }
    
    if (motor.isOn) {
      this._sendMotorCommand(motor.portId, motor.power * motor.direction);
    }
  }

  _sendMotorCommand(portId, power) {
    // Clamp power to valid range [-100, 100] or 127 for brake
    let powerByte = Math.max(-100, Math.min(100, power));
    if (powerByte < 0) {
      powerByte = 256 + powerByte; // Convert to unsigned
    }
    
    const cmd = new Uint8Array([
      portId,
      this.CMD_MOTOR_POWER,
      1,          // Number of bytes
      powerByte
    ]);
    
    this._writeCharacteristic(this._outputCommandChar, cmd);
  }

  _getMotor(portId) {
    const index = portId - 1;
    if (index < 0 || index > 1) return null;
    return this._motors[index];
  }

  // ============================================================================
  // LED BLOCKS
  // ============================================================================

  async setLEDColor(args) {
    const colorMap = {
      'off': 0, 'pink': 1, 'purple': 2, 'blue': 3,
      'sky blue': 4, 'teal': 5, 'green': 6, 'yellow': 7,
      'orange': 8, 'red': 9, 'white': 10
    };
    
    const colorIndex = colorMap[args.COLOR] ?? 0;
    await this._setLEDColorByIndex(colorIndex);
  }

  async setLEDRGB(args) {
    const r = Math.max(0, Math.min(255, args.R));
    const g = Math.max(0, Math.min(255, args.G));
    const b = Math.max(0, Math.min(255, args.B));
    
    // Set LED to RGB mode
    await this._writeCharacteristic(this._inputCommandChar, new Uint8Array([
      1, 2,               // Command format
      this.LED_PORT,      // LED port
      this.DEVICE_LED,
      1,                  // RGB mode
      1, 0, 0, 0,        // Delta
      0,                  // Unit
      1                   // Enable notifications
    ]));
    
    // Send RGB values
    await this._writeCharacteristic(this._outputCommandChar, new Uint8Array([
      this.LED_PORT,
      this.CMD_WRITE_RGB,
      3,                  // Number of bytes
      r, g, b
    ]));
  }

  ledOff() {
    return this._setLEDColorByIndex(0);
  }

  async _setLEDMode() {
    await this._writeCharacteristic(this._inputCommandChar, new Uint8Array([
      1, 2,               // Command format
      this.LED_PORT,
      this.DEVICE_LED,
      0,                  // Color index mode
      1, 0, 0, 0,        // Delta
      0,                  // Unit
      1                   // Enable notifications
    ]));
  }

  async _setLEDColorByIndex(colorIndex) {
    await this._setLEDMode();
    
    await this._writeCharacteristic(this._outputCommandChar, new Uint8Array([
      this.LED_PORT,
      this.CMD_WRITE_RGB,
      1,                  // Number of bytes
      colorIndex
    ]));
  }

  // ============================================================================
  // SOUND BLOCKS
  // ============================================================================

  async playNote(args) {
    const note = Math.max(0, Math.min(127, args.NOTE));
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    return this.playTone({ FREQ: freq, DURATION: args.DURATION });
  }

  async playTone(args) {
    const freq = Math.max(0, Math.min(5000, args.FREQ));
    const duration = Math.max(0, Math.min(3, args.DURATION)) * 1000;
    
    if (duration === 0) return; // WeDo 2.0 plays forever if duration is 0
    
    const freqLow = freq & 0xFF;
    const freqHigh = (freq >> 8) & 0xFF;
    const durLow = duration & 0xFF;
    const durHigh = (duration >> 8) & 0xFF;
    
    const cmd = new Uint8Array([
      this.PIEZO_PORT,
      this.CMD_PLAY_TONE,
      4,                // Number of bytes
      freqLow, freqHigh,
      durLow, durHigh
    ]);
    
    await this._writeCharacteristic(this._outputCommandChar, cmd);
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  stopSound() {
    const cmd = new Uint8Array([
      this.PIEZO_PORT,
      this.CMD_STOP_TONE
    ]);
    
    this._writeCharacteristic(this._outputCommandChar, cmd);
  }

  // ============================================================================
  // SENSOR BLOCKS
  // ============================================================================

  getDistance() {
    return this._sensors.distance;
  }

  getTiltX() {
    return this._sensors.tiltX;
  }

  getTiltY() {
    return this._sensors.tiltY;
  }

  isTilted(args) {
    const threshold = 15;
    const x = Math.abs(this._sensors.tiltX);
    const y = Math.abs(this._sensors.tiltY);
    
    switch (args.DIRECTION) {
      case 'up':
        return this._sensors.tiltY < -threshold;
      case 'down':
        return this._sensors.tiltY > threshold;
      case 'left':
        return this._sensors.tiltX < -threshold;
      case 'right':
        return this._sensors.tiltX > threshold;
      case 'any':
        return x > threshold || y > threshold;
      default:
        return false;
    }
  }

  whenDistance(args) {
    if (args.OP === '<') {
      return this._sensors.distance < args.VALUE;
    } else if (args.OP === '>') {
      return this._sensors.distance > args.VALUE;
    }
    return false;
  }

  whenTilted(args) {
    return this.isTilted(args);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  stopAll() {
    if (!this._connected) return;
    
    // Stop all motors
    for (let i = 0; i < 2; i++) {
      if (this._motors[i]) {
        this._sendMotorCommand(this._motors[i].portId, 0);
        this._motors[i].isOn = false;
      }
    }
    
    // Stop sound
    this.stopSound();
  }

  async _writeCharacteristic(characteristic, data) {
    if (!characteristic) {
      console.warn('Characteristic not available');
      return;
    }
    
    try {
      await characteristic.writeValue(data);
    } catch (error) {
      console.error('Write failed:', error);
    }
  }
}

// Register the extension
if (typeof Scratch !== 'undefined') {
  Scratch.extensions.register(new WeDo2Extension());
}

// Export for Node.js / module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeDo2Extension;
}