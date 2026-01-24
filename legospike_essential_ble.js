(function (Scratch) {
  "use strict";

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const MathUtil = {
    clamp: function (val, min, max) {
      return Math.max(min, Math.min(val, max));
    },
    wrapClamp: function (val, min, max) {
      const range = max - min;
      return ((((val - min) % range) + range) % range) + min;
    },
  };

  const Base64Util = {
    uint8ArrayToBase64: function (array) {
      let binary = "";
      for (let i = 0; i < array.length; i++) {
        binary += String.fromCharCode(array[i]);
      }
      return btoa(binary);
    },
    base64ToUint8Array: function (base64) {
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      return array;
    },
  };

  class RateLimiter {
    constructor(maxRate) {
      this._maxRate = maxRate;
      this._lastSendTime = 0;
      this._sendInterval = 1000 / maxRate;
    }
    okayToSend() {
      const now = Date.now();
      if (now - this._lastSendTime >= this._sendInterval) {
        this._lastSendTime = now;
        return true;
      }
      return false;
    }
  }

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const iconURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAUKADAAQAAAABAAAAUAAAAAAx4ExPAAADMElEQVR4Ae3bT2gTQRQG8LetpI1GK4iUKhRSoQhVMfRealAEr4J40It/ToLgSVFEPHjoqSdv6kVBQXoVBIk2IHjRQjUVBKkKKh7VaBrFrvttM5ApSX3TyHYSvoGwmc2b2X2/ziS7dEeEhQIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKEABClCAAhSgAAUoQAEKUIACFKAABSiQhEDgepAwDIMrE/dORduTUduRUMKMax8+xQcSlKPzKQVBcPPq+aM3om3ocn5OgNcmpwYq1eodCcO8y0HaJjYICumenmOXzh3+rD3nddpAjLzLE3djvL5N6+XgvpxkB/sls6FX24WXceUfCzL/4Ys8fDwjX7/9zGOARLnu147Ebm1WYXrn6ajjs8A7c+KQbB/YIqmU2l97mMTjkEP/1s2S2z0ks3PvpFr9nZ1+Wvo4/WjqheZkujRBiKl958UjL92b0jZrmzjkhFmFYnLVnLwaMOpsBB1i2nZqqcstzlWTpxrQ/Nq2+3feSigmN5PrSrHmMzWgacCtLUBA28O5RkBnMrsBAW0P5xoBncnsBgS0PZxrBHQmsxsQ0PZwrhHQmcxuQEDbw7lGQGcyuwEBbQ/nGgGdyewGBLQ9nGsEdCazGxDQ9nCuEdCZzG7gzX+F/iwuSqE4KzOv5uV7uWKfZa22MZOW3K6s5Mf2SHeXH397bwCBV3w21xDO7ASsiTkwvtfsXtOtN4AYeSjHj4zL8NC2hihv3n6S2/efxKPUF0A/5kHEZaZtMzyIDu9YgjWxDZUT3ukNYMJ5/7fDEbBFSgISsEWBFptzBHYKIC6SUXCp0qyYz0xss7gk93tzHYg7DFwk4zrvXwWxvhRvAHF7hqK9lSPgMgHc2+LuAq+xi8+XfbpULV4Ybbh/LXfyR6RFfTVg7Wl2wTPFSZW+wVHBK6licjO5ao6rBow6K6FDPJDdqaUutzhXTZ5qQKyjQId4mr2y8EvTd1vFICfkhmJy1SSgBsQilKjnQrQUQK7feiAvX79PdDprkllNDKYtckFOyA05xrkqO+NCm3qoVSy0cQLEsaIlAFzqVY/O9xSgAAUoQAEKUIACFKAABShAAQpQgAIUoAAFKECBRAT+AigB5y5rdsAFAAAAAElFTkSuQmCC";

  const BLE = {
    service: "00001623-1212-efde-1623-785feabcd123",
    characteristic: "00001624-1212-efde-1623-785feabcd123",
    sendRateMax: 20,
  };

  const HubType = 0x83; // SPIKE Essential Hub

  const MessageType = {
    HUB_PROPERTIES: 0x01,
    HUB_ATTACHED_IO: 0x04,
    GENERIC_ERROR_MESSAGES: 0x05,
    PORT_INPUT_FORMAT_SETUP: 0x41,
    PORT_VALUE: 0x45,
    PORT_OUTPUT_COMMAND: 0x81,
    PORT_OUTPUT_COMMAND_FEEDBACK: 0x82,
  };

  const HubPropertyReference = {
    ADVERTISING_NAME: 0x01,
    BUTTON: 0x02,
    FW_VERSION: 0x03,
    BATTERY_VOLTAGE: 0x06,
  };

  const HubPropertyOperation = {
    SET: 0x01,
    ENABLE_UPDATES: 0x02,
    DISABLE_UPDATES: 0x03,
    RESET: 0x04,
    REQUEST_UPDATE: 0x05,
    UPDATE: 0x06,
  };

  const IOType = {
    MEDIUM_LINEAR_MOTOR: 0x0001,
    TECHNIC_LARGE_MOTOR: 0x002e,
    TECHNIC_XL_MOTOR: 0x002f,
    COLOR_DISTANCE_SENSOR: 0x0025,
    TECHNIC_COLOR_SENSOR: 0x003d,
    TECHNIC_DISTANCE_SENSOR: 0x003e,
    TECHNIC_FORCE_SENSOR: 0x003f,
    TECHNIC_HUB_TILT_SENSOR: 0x0042,
  };

  const Color = {
    BLACK: 0,
    PINK: 1,
    PURPLE: 2,
    BLUE: 3,
    LIGHT_BLUE: 4,
    LIGHT_GREEN: 5,
    GREEN: 6,
    YELLOW: 7,
    ORANGE: 8,
    RED: 9,
    WHITE: 10,
  };

  const MAX_INT32 = Math.pow(2, 31) - 1;
  const MIN_INT32 = Math.pow(2, 31) * -1;
  const MAX_INT16 = Math.pow(2, 15) - 1;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const numberToInt32Array = function (number) {
    const buffer = new ArrayBuffer(4);
    const dataview = new DataView(buffer);
    dataview.setInt32(0, number, true);
    return [
      dataview.getUint8(0),
      dataview.getUint8(1),
      dataview.getUint8(2),
      dataview.getUint8(3),
    ];
  };

  const numberToInt16Array = function (number) {
    const buffer = new ArrayBuffer(2);
    const dataview = new DataView(buffer);
    dataview.setInt16(0, number, true);
    return [dataview.getUint8(0), dataview.getUint8(1)];
  };

  const decodeVersion = function (value) {
    if (value.length !== 4) return "0.0.0.0";
    const s = value.reduce(
      (output, elem) => ("0" + (elem & 0xff).toString(16)).slice(-2) + output,
      ""
    );
    return s.slice(0, 1) + "." + s.slice(1, 2) + "." + s.slice(2, 4) + "." + s.slice(4);
  };

  // ============================================================================
  // DEVICE CLASS
  // ============================================================================

  class Device {
    constructor(ioType) {
      this._ioType = ioType;
      this._inputValues = {};
      this._speed = 75;
    }

    get ioType() {
      return this._ioType;
    }

    get mode() {
      switch (this._ioType) {
        case IOType.MEDIUM_LINEAR_MOTOR:
        case IOType.TECHNIC_LARGE_MOTOR:
        case IOType.TECHNIC_XL_MOTOR:
          return 2; // Relative Position
        case IOType.COLOR_DISTANCE_SENSOR:
          return 8; // Color and Distance
        case IOType.TECHNIC_COLOR_SENSOR:
          return 0; // Color
        case IOType.TECHNIC_DISTANCE_SENSOR:
          return 0; // Distance
        case IOType.TECHNIC_FORCE_SENSOR:
          return 0; // Force
        case IOType.TECHNIC_HUB_TILT_SENSOR:
          return 0; // Tilt X, Y, Z
        default:
          return null;
      }
    }

    get inputValues() {
      return this._inputValues;
    }

    get speed() {
      return this._speed;
    }

    set speed(value) {
      this._speed = MathUtil.clamp(value, -100, 100);
    }

    get isMotor() {
      return (
        this._ioType === IOType.MEDIUM_LINEAR_MOTOR ||
        this._ioType === IOType.TECHNIC_LARGE_MOTOR ||
        this._ioType === IOType.TECHNIC_XL_MOTOR
      );
    }

    updateInputValues(data) {
      if (data.length === 0) {
        this._inputValues = {};
        return;
      }

      const buffer = new DataView(new Uint8Array(data).buffer);

      switch (this._ioType) {
        case IOType.MEDIUM_LINEAR_MOTOR:
        case IOType.TECHNIC_LARGE_MOTOR:
        case IOType.TECHNIC_XL_MOTOR:
          this._inputValues = {
            relativePosition: buffer.getInt32(0, true),
          };
          break;

        case IOType.COLOR_DISTANCE_SENSOR:
          this._inputValues = {
            color: buffer.getInt8(0),
            distance: buffer.getInt8(1),
          };
          break;

        case IOType.TECHNIC_COLOR_SENSOR:
          this._inputValues = {
            color: buffer.getInt8(0),
          };
          break;

        case IOType.TECHNIC_DISTANCE_SENSOR:
          this._inputValues = {
            distance: buffer.getInt16(0, true),
          };
          break;

        case IOType.TECHNIC_FORCE_SENSOR:
          this._inputValues = {
            force: buffer.getInt8(0),
          };
          break;

        case IOType.TECHNIC_HUB_TILT_SENSOR:
          this._inputValues = {
            tiltX: buffer.getInt16(4, true),
            tiltY: buffer.getInt16(2, true),
            tiltZ: buffer.getInt16(0, true),
          };
          break;

        default:
          this._inputValues = {};
          break;
      }
    }
  }

  // ============================================================================
  // HUB CLASS
  // ============================================================================

  class SpikeEssentialHub {
    constructor() {
      this._rateLimiter = new RateLimiter(BLE.sendRateMax);
      this._ble = null;
      this._characteristic = null;

      this._name = null;
      this._firmwareVersion = null;
      this._batteryLevel = 0;
      this._devices = [];

      this._outputCommandFeedbackCallbacks = [];

      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
    }

    get name() {
      return this._name;
    }
    get firmwareVersion() {
      return this._firmwareVersion;
    }
    get batteryLevel() {
      return this._batteryLevel;
    }

    connect() {
      if (this._ble && this._ble.gatt && this._ble.gatt.connected) {
        return;
      }

      const options = {
        filters: [
          {
            services: [BLE.service],
            manufacturerData: [
              {
                companyIdentifier: 0x0397,
                dataPrefix: new Uint8Array([0x00, HubType]),
                mask: new Uint8Array([0x00, 0xff]),
              },
            ],
          },
        ],
      };

      navigator.bluetooth
        .requestDevice(options)
        .then((device) => {
          this._ble = device;
          return device.gatt.connect();
        })
        .then((server) => {
          return server.getPrimaryService(BLE.service);
        })
        .then((service) => {
          return service.getCharacteristic(BLE.characteristic);
        })
        .then((characteristic) => {
          this._characteristic = characteristic;
          return characteristic.startNotifications();
        })
        .then((characteristic) => {
          characteristic.addEventListener("characteristicvaluechanged", (event) => {
            const value = event.target.value;
            const array = new Uint8Array(value.buffer);
            const base64 = Base64Util.uint8ArrayToBase64(array);
            this._onMessage(base64);
          });
          this._onConnect();
        })
        .catch((error) => {
          console.error("BLE connection failed:", error);
          this.disconnect();
        });
    }

    disconnect() {
      if (this._ble && this._ble.gatt && this._ble.gatt.connected) {
        this._ble.gatt.disconnect();
      }
      this.reset();
    }

    reset() {
      this._name = null;
      this._firmwareVersion = null;
      this._batteryLevel = 0;
      this._devices = [];
      this._outputCommandFeedbackCallbacks = [];
    }

    isConnected() {
      return this._ble && this._ble.gatt && this._ble.gatt.connected;
    }

    send(data, useLimiter = true) {
      if (!this.isConnected()) return Promise.resolve();

      if (useLimiter && !this._rateLimiter.okayToSend()) {
        return Promise.resolve();
      }

      const value = new Uint8Array(data);
      return this._characteristic.writeValue(value);
    }

    sendMessage(messageType, payload, useLimiter = true) {
      const command = [0x00, messageType, ...payload];
      command.unshift(command.length + 1);
      return this.send(command, useLimiter);
    }

    sendOutputCommand(portId, subCommand, payload, needsFeedback = true, useLimiter = true) {
      const flag = needsFeedback ? 0x11 : 0x10;
      return this.sendMessage(
        MessageType.PORT_OUTPUT_COMMAND,
        [portId, flag, subCommand, ...payload],
        useLimiter
      );
    }

    _onConnect() {
      setTimeout(() => {
        this.sendMessage(
          MessageType.HUB_PROPERTIES,
          [HubPropertyReference.ADVERTISING_NAME, HubPropertyOperation.ENABLE_UPDATES],
          false
        );
        this.sendMessage(
          MessageType.HUB_PROPERTIES,
          [HubPropertyReference.FW_VERSION, HubPropertyOperation.REQUEST_UPDATE],
          false
        );
        this.sendMessage(
          MessageType.HUB_PROPERTIES,
          [HubPropertyReference.BATTERY_VOLTAGE, HubPropertyOperation.ENABLE_UPDATES],
          false
        );
      }, 100);
    }

    _onMessage(base64) {
      const data = Base64Util.base64ToUint8Array(base64);
      const messageType = data[2];

      switch (messageType) {
        case MessageType.HUB_PROPERTIES: {
          const property = data[3];
          const operation = data[4];

          if (operation !== HubPropertyOperation.UPDATE) break;

          switch (property) {
            case HubPropertyReference.ADVERTISING_NAME:
              if (typeof TextDecoder !== "undefined") {
                const uint8Array = new Uint8Array(data.slice(5));
                this._name = new TextDecoder().decode(uint8Array);
              }
              break;
            case HubPropertyReference.FW_VERSION:
              this._firmwareVersion = decodeVersion(data.slice(5, 9));
              break;
            case HubPropertyReference.BATTERY_VOLTAGE:
              this._batteryLevel = data[5];
              break;
          }
          break;
        }

        case MessageType.HUB_ATTACHED_IO: {
          const portId = data[3];
          const event = data[4];
          const ioType = (data[6] << 8) | data[5];

          switch (event) {
            case 0x00: // Detached
              this._devices[portId] = null;
              break;
            case 0x01: // Attached
              this._attachDevice(portId, ioType);
              break;
          }
          break;
        }

        case MessageType.PORT_VALUE: {
          const portId = data[3];
          const device = this._devices[portId];
          if (device) {
            device.updateInputValues(data.slice(4));
          }
          break;
        }

        case MessageType.PORT_OUTPUT_COMMAND_FEEDBACK: {
          const portId = data[3];
          const feedback = data[4];
          const completed = feedback & 0x02;

          if (completed && this._outputCommandFeedbackCallbacks[portId]) {
            this._outputCommandFeedbackCallbacks[portId]();
            this._outputCommandFeedbackCallbacks[portId] = null;
          }
          break;
        }
      }
    }

    _attachDevice(portId, ioType) {
      const device = new Device(ioType);
      this._devices[portId] = device;

      const mode = device.mode;
      if (mode !== null) {
        setTimeout(() => {
          this.sendMessage(
            MessageType.PORT_INPUT_FORMAT_SETUP,
            [portId, mode, 1, 0, 0, 0, 1],
            false
          );
        }, 100);
      }
    }

    getDevice(portId) {
      return this._devices[portId];
    }

    // Motor Commands
    motorPWM(portId, power) {
      power = MathUtil.clamp(power, -100, 100);
      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        return this.sendOutputCommand(portId, 0x51, [0x00, power]);
      }
      return Promise.resolve();
    }

    motorRunForDegrees(portId, direction, degrees) {
      direction = direction * Math.sign(degrees);
      degrees = MathUtil.clamp(Math.abs(degrees), 1, MAX_INT32);

      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        const speed = device.speed * direction;
        return this.sendOutputCommand(portId, 0x0b, [
          ...numberToInt32Array(degrees),
          speed,
          100,
          0x7f,
          0x00,
        ]).then(() => {
          return new Promise((resolve) => {
            this._outputCommandFeedbackCallbacks[portId] = resolve;
          });
        });
      }
      return Promise.resolve();
    }

    motorRunTimed(portId, direction, seconds) {
      const milliseconds = MathUtil.clamp(seconds * 1000, 0, MAX_INT16);

      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        const speed = device.speed * direction;
        return this.sendOutputCommand(portId, 0x09, [
          ...numberToInt16Array(milliseconds),
          speed,
          100,
          0x7f,
          0x00,
        ]).then(() => {
          return new Promise((resolve) => {
            this._outputCommandFeedbackCallbacks[portId] = resolve;
          });
        });
      }
      return Promise.resolve();
    }

    motorStart(portId, direction) {
      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        const speed = device.speed * direction;
        return this.sendOutputCommand(portId, 0x07, [speed, 100, 0x00]);
      }
      return Promise.resolve();
    }

    motorSetSpeed(portId, speed) {
      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        device.speed = speed;
      }
    }

    motorResetRelativePosition(portId, relativePosition) {
      relativePosition = MathUtil.clamp(relativePosition, MIN_INT32, MAX_INT32);

      const device = this.getDevice(portId);
      if (device && device.isMotor) {
        return this.sendOutputCommand(portId, 0x51, [
          0x02,
          ...numberToInt32Array(relativePosition),
        ]);
      }
      return Promise.resolve();
    }

    inputValue(portId, key) {
      const device = this._devices[portId];
      if (device && device.inputValues.hasOwnProperty(key)) {
        return device.inputValues[key];
      }
      return null;
    }

    internalInputValue(key) {
      for (let portId = 0x32; portId < this._devices.length; portId++) {
        const device = this._devices[portId];
        if (device && device.inputValues.hasOwnProperty(key)) {
          return device.inputValues[key];
        }
      }
      return null;
    }

    setLEDColor(color) {
      color = MathUtil.clamp(color, 0, 10);

      for (let portId = 0x32; portId < this._devices.length; portId++) {
        const device = this._devices[portId];
        if (device && device.ioType === 0x17) {
          // RGB_LIGHT
          return this.sendOutputCommand(portId, 0x51, [0x00, color]);
        }
      }
      return Promise.resolve();
    }

    stopAllMotors() {
      for (let portId = 0; portId < this._devices.length; portId++) {
        const device = this._devices[portId];
        if (device && device.isMotor) {
          this.sendOutputCommand(portId, 0x51, [0x00, 0], false);
          this._outputCommandFeedbackCallbacks[portId] = null;
        }
      }
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================

  class SpikeEssentialExtension {
    constructor() {
      this._peripheral = new SpikeEssentialHub();
    }

    getInfo() {
      return {
        id: "spikeessential",
        name: "SPIKE Essential",
        blockIconURI: iconURI,
        blocks: [
          {
            opcode: "connect",
            text: "connect to SPIKE Essential",
            blockType: BlockType.COMMAND,
          },
          {
            opcode: "disconnect",
            text: "disconnect SPIKE Essential",
            blockType: BlockType.COMMAND,
          },
          "---",
          {
            opcode: "motorPWM",
            text: "[PORT] start motor at [POWER] % power",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
              POWER: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "motorStop",
            text: "[PORT] stop motor",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "motorRunFor",
            text: "[PORT] run [DIRECTION] for [VALUE] [UNIT]",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
              DIRECTION: {
                type: ArgumentType.NUMBER,
                menu: "DIRECTION",
                defaultValue: 1,
              },
              VALUE: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
              UNIT: {
                type: ArgumentType.STRING,
                menu: "MOTOR_UNIT",
                defaultValue: "rotations",
              },
            },
          },
          {
            opcode: "motorStart",
            text: "[PORT] start motor [DIRECTION]",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
              DIRECTION: {
                type: ArgumentType.NUMBER,
                menu: "DIRECTION",
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorSetSpeed",
            text: "[PORT] set speed to [SPEED] %",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
            },
          },
          {
            opcode: "getRelativePosition",
            text: "[PORT] relative position",
            blockType: BlockType.REPORTER,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "motorResetRelativePosition",
            text: "[PORT] reset relative position to [RELATIVE_POSITION]",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "MULTIPLE_PORT",
                defaultValue: "A",
              },
              RELATIVE_POSITION: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          "---",
          {
            opcode: "getColor",
            text: "[PORT] color",
            blockType: BlockType.REPORTER,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getDistance",
            text: "[PORT] distance",
            blockType: BlockType.REPORTER,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getForce",
            text: "[PORT] force",
            blockType: BlockType.REPORTER,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "setHubLEDColor",
            text: "set hub LED color to [COLOR]",
            blockType: BlockType.COMMAND,
            arguments: {
              COLOR: {
                type: ArgumentType.NUMBER,
                menu: "LED_COLOR",
                defaultValue: Color.BLUE,
              },
            },
          },
          {
            opcode: "getHubTilt",
            text: "hub tilt [XYZ]",
            blockType: BlockType.REPORTER,
            arguments: {
              XYZ: {
                type: ArgumentType.STRING,
                menu: "XYZ",
                defaultValue: "x",
              },
            },
          },
          "---",
          {
            opcode: "getName",
            text: "name",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getFirmwareVersion",
            text: "firmware version",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getBatteryLevel",
            text: "battery level",
            blockType: BlockType.REPORTER,
          },
        ],
        menus: {
          PORT: {
            acceptReporters: true,
            items: ["A", "B"],
          },
          MULTIPLE_PORT: {
            acceptReporters: true,
            items: ["A", "B", "A+B"],
          },
          MOTOR_UNIT: {
            acceptReporters: false,
            items: ["rotations", "degrees", "seconds"],
          },
          DIRECTION: {
            acceptReporters: false,
            items: [
              { text: "⬆︎", value: "1" },
              { text: "⬇", value: "-1" },
            ],
          },
          LED_COLOR: {
            acceptReporters: true,
            items: [
              { text: "(0) Black", value: String(Color.BLACK) },
              { text: "(1) Pink", value: String(Color.PINK) },
              { text: "(2) Purple", value: String(Color.PURPLE) },
              { text: "(3) Blue", value: String(Color.BLUE) },
              { text: "(4) Light blue", value: String(Color.LIGHT_BLUE) },
              { text: "(5) Light green", value: String(Color.LIGHT_GREEN) },
              { text: "(6) Green", value: String(Color.GREEN) },
              { text: "(7) Yellow", value: String(Color.YELLOW) },
              { text: "(8) Orange", value: String(Color.ORANGE) },
              { text: "(9) Red", value: String(Color.RED) },
              { text: "(10) White", value: String(Color.WHITE) },
            ],
          },
          XYZ: {
            acceptReporters: false,
            items: ["x", "y", "z"],
          },
        },
      };
    }

    connect() {
      this._peripheral.connect();
    }

    disconnect() {
      this._peripheral.disconnect();
    }

    _validatePorts(text) {
      return text
        .toUpperCase()
        .replace(/[^AB]/g, "")
        .split("")
        .filter((x, i, self) => self.indexOf(x) === i)
        .sort();
    }

    _getPortId(port) {
      return port === "A" ? 0 : 1;
    }

    motorPWM(args) {
      const power = Cast.toNumber(args.POWER);
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorPWM(portId, power);
      });

      return Promise.all(promises).then(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
    }

    motorStop(args) {
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorPWM(portId, 0);
      });

      return Promise.all(promises).then(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
    }

    motorRunFor(args) {
      const direction = args.DIRECTION;
      const value = Cast.toNumber(args.VALUE);
      const unit = args.UNIT;

      const ports = this._validatePorts(Cast.toString(args.PORT));

      switch (unit) {
        case "rotations":
          return this._motorRunForDegrees(ports, direction, value * 360);
        case "degrees":
          return this._motorRunForDegrees(ports, direction, value);
        case "seconds":
          return this._motorRunTimed(ports, direction, value);
        default:
          return Promise.resolve();
      }
    }

    _motorRunForDegrees(ports, direction, degrees) {
      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorRunForDegrees(portId, direction, degrees);
      });

      return Promise.all(promises);
    }

    _motorRunTimed(ports, direction, seconds) {
      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorRunTimed(portId, direction, seconds);
      });

      return Promise.all(promises);
    }

    motorStart(args) {
      const direction = args.DIRECTION;
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorStart(portId, direction);
      });

      return Promise.all(promises).then(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
    }

    motorSetSpeed(args) {
      const speed = Cast.toNumber(args.SPEED);
      const ports = this._validatePorts(Cast.toString(args.PORT));

      ports.forEach((port) => {
        const portId = this._getPortId(port);
        this._peripheral.motorSetSpeed(portId, speed);
      });

      return Promise.resolve();
    }

    motorResetRelativePosition(args) {
      const relativePosition = Cast.toNumber(args.RELATIVE_POSITION);
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const portId = this._getPortId(port);
        return this._peripheral.motorResetRelativePosition(portId, relativePosition);
      });

      return Promise.all(promises).then(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
    }

    getRelativePosition(args) {
      return this._getSensorValue(args, "relativePosition", 0);
    }

    getColor(args) {
      return this._getSensorValue(args, "color", -1);
    }

    getDistance(args) {
      return this._getSensorValue(args, "distance", 0);
    }

    getForce(args) {
      return this._getSensorValue(args, "force", 0);
    }

    _getSensorValue(args, key, defaultValue) {
      const port = this._validatePorts(Cast.toString(args.PORT)).shift();
      if (port) {
        const portId = this._getPortId(port);
        const value = this._peripheral.inputValue(portId, key);
        return value != null ? value : defaultValue;
      }
      return defaultValue;
    }

    setHubLEDColor(args) {
      const color = Cast.toNumber(args.COLOR);
      return this._peripheral.setLEDColor(color).then(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
    }

    getHubTilt(args) {
      const key = "tilt" + args.XYZ.toUpperCase();
      const value = this._peripheral.internalInputValue(key);
      return value != null ? value / 10 : 0;
    }

    getName() {
      return this._peripheral.name ? this._peripheral.name : "";
    }

    getFirmwareVersion() {
      return this._peripheral.firmwareVersion ? this._peripheral.firmwareVersion : "";
    }

    getBatteryLevel() {
      return this._peripheral.batteryLevel;
    }
  }

  Scratch.extensions.register(new SpikeEssentialExtension());
})(Scratch);