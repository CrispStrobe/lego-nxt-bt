(function (Scratch) {
  "use strict";

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // ============================================================================
  // UTILITY CLASSES (from Boost extension)
  // ============================================================================

  const MathUtil = {
    clamp: (val, min, max) => Math.max(min, Math.min(val, max)),
    wrapClamp: (val, min, max) => {
      const range = max - min;
      return ((((val - min) % range) + range) % range) + min;
    },
  };

  const Base64Util = {
    uint8ArrayToBase64: (array) => btoa(String.fromCharCode.apply(null, array)),
    base64ToUint8Array: (base64) => {
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
  // COBS ENCODING/DECODING
  // ============================================================================

  const COBS = {
    DELIMITER: 0x02,
    NO_DELIMITER: 0xFF,
    COBS_CODE_OFFSET: 0x02,
    MAX_BLOCK_SIZE: 84,
    XOR: 0x03,

    encode(data) {
      const buffer = [];
      let codeIndex = 0;
      let block = 0;

      const beginBlock = () => {
        codeIndex = buffer.length;
        buffer.push(this.NO_DELIMITER);
        block = 1;
      };

      beginBlock();

      for (let i = 0; i < data.length; i++) {
        const byte = data[i];

        if (byte > this.DELIMITER) {
          buffer.push(byte);
          block++;
        }

        if (byte <= this.DELIMITER || block > this.MAX_BLOCK_SIZE) {
          if (byte <= this.DELIMITER) {
            const delimiterBase = byte * this.MAX_BLOCK_SIZE;
            const blockOffset = block + this.COBS_CODE_OFFSET;
            buffer[codeIndex] = delimiterBase + blockOffset;
          }
          beginBlock();
        }
      }

      buffer[codeIndex] = block + this.COBS_CODE_OFFSET;
      return new Uint8Array(buffer);
    },

    decode(data) {
      const buffer = [];

      const unescape = (code) => {
        if (code === 0xFF) {
          return { value: null, block: this.MAX_BLOCK_SIZE + 1 };
        }
        let value = Math.floor((code - this.COBS_CODE_OFFSET) / this.MAX_BLOCK_SIZE);
        let block = (code - this.COBS_CODE_OFFSET) % this.MAX_BLOCK_SIZE;
        if (block === 0) {
          block = this.MAX_BLOCK_SIZE;
          value -= 1;
        }
        return { value, block };
      };

      let { value, block } = unescape(data[0]);

      for (let i = 1; i < data.length; i++) {
        block--;
        if (block > 0) {
          buffer.push(data[i]);
          continue;
        }

        if (value !== null) {
          buffer.push(value);
        }

        const result = unescape(data[i]);
        value = result.value;
        block = result.block;
      }

      return new Uint8Array(buffer);
    },

    pack(data) {
      let buffer = this.encode(data);
      
      // XOR to remove problematic ctrl+C
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= this.XOR;
      }
      
      // Add delimiter
      const result = new Uint8Array(buffer.length + 1);
      result.set(buffer);
      result[buffer.length] = this.DELIMITER;
      return result;
    },

    unpack(frame) {
      let start = 0;
      if (frame[0] === 0x01) {
        start = 1;
      }

      // Unframe and XOR
      const unframed = new Uint8Array(frame.length - start - 1);
      for (let i = 0; i < unframed.length; i++) {
        unframed[i] = frame[start + i] ^ this.XOR;
      }

      return this.decode(unframed);
    }
  };

  // ============================================================================
  // MESSAGE HELPERS
  // ============================================================================

  class Message {
    static writeUInt8(value) {
      return new Uint8Array([value]);
    }

    static writeUInt16LE(value) {
      const buffer = new Uint8Array(2);
      new DataView(buffer.buffer).setUint16(0, value, true);
      return buffer;
    }

    static writeUInt32LE(value) {
      const buffer = new Uint8Array(4);
      new DataView(buffer.buffer).setUint32(0, value, true);
      return buffer;
    }

    static writeString(str, maxLength) {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(str);
      const buffer = new Uint8Array(maxLength);
      buffer.set(encoded.slice(0, maxLength - 1));
      return buffer;
    }

    static concat(...arrays) {
      const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    }

    static parseUInt16LE(data, offset) {
      return new DataView(data.buffer, data.byteOffset).getUint16(offset, true);
    }

    static parseUInt32LE(data, offset) {
      return new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
    }

    static parseString(data, offset, length) {
      const decoder = new TextDecoder();
      return decoder.decode(data.slice(offset, offset + length)).replace(/\0/g, '');
    }
  }

  // ============================================================================
  // MESSAGE TYPES
  // ============================================================================

  const MSG = {
    InfoRequest: 0x00,
    InfoResponse: 0x01,
    GetHubNameRequest: 0x18,
    GetHubNameResponse: 0x19,
    SetHubNameRequest: 0x16,
    SetHubNameResponse: 0x17,
    DeviceNotificationRequest: 0x28,
    DeviceNotificationResponse: 0x29,
    DeviceNotification: 0x3C,
    ConsoleNotification: 0x21,
  };

  const DeviceType = {
    Battery: 0x00,
    IMU: 0x01,
    Matrix5x5: 0x02,
    Motor: 0x0A,
    ForceSensor: 0x0B,
    ColorSensor: 0x0C,
    DistanceSensor: 0x0D,
  };

  const SpikeColor = {
    BLACK: 0,
    MAGENTA: 1,
    PURPLE: 2,
    BLUE: 3,
    AZURE: 4,
    TURQUOISE: 5,
    GREEN: 6,
    YELLOW: 7,
    ORANGE: 8,
    RED: 9,
    WHITE: 10,
    NONE: -1,
  };

  const ColorNames = ["black", "magenta", "purple", "blue", "azure", "turquoise", "green", "yellow", "orange", "red", "white"];

  // ============================================================================
  // BLE & JSONRPC (from Boost extension pattern)
  // ============================================================================

  class JSONRPC {
    constructor() {
      this._requestID = 0;
      this._openRequests = {};
    }

    sendRemoteRequest(method, params) {
      const requestID = this._requestID++;
      const promise = new Promise((resolve, reject) => {
        this._openRequests[requestID] = { resolve, reject };
      });
      this._sendRequest(method, params, requestID);
      return promise;
    }

    sendRemoteNotification(method, params) {
      this._sendRequest(method, params);
    }

    didReceiveCall(/* method, params */) {
      throw new Error("Must override didReceiveCall");
    }

    _sendMessage(/* jsonMessageObject */) {
      throw new Error("Must override _sendMessage");
    }

    _sendRequest(method, params, id) {
      const request = {
        jsonrpc: "2.0",
        method,
        params,
      };
      if (id !== null && typeof id !== "undefined") {
        request.id = id;
      }
      this._sendMessage(request);
    }

    _handleMessage(json) {
      if (json.jsonrpc !== "2.0") {
        throw new Error(`Bad JSON-RPC version: ${JSON.stringify(json)}`);
      }
      if (Object.prototype.hasOwnProperty.call(json, "method")) {
        this._handleRequest(json);
      } else {
        this._handleResponse(json);
      }
    }

    _sendResponse(id, result, error) {
      const response = {
        jsonrpc: "2.0",
        id,
      };
      if (error) {
        response.error = error;
      } else {
        response.result = result || null;
      }
      this._sendMessage(response);
    }

    _handleResponse(json) {
      const { result, error, id } = json;
      const openRequest = this._openRequests[id];
      delete this._openRequests[id];
      if (openRequest) {
        if (error) {
          openRequest.reject(error);
        } else {
          openRequest.resolve(result);
        }
      }
    }

    _handleRequest(json) {
      const { method, params, id } = json;
      const rawResult = this.didReceiveCall(method, params);
      if (id !== null && typeof id !== "undefined") {
        Promise.resolve(rawResult).then(
          (result) => {
            this._sendResponse(id, result);
          },
          (error) => {
            this._sendResponse(id, null, error);
          },
        );
      }
    }
  }

  class BLE extends JSONRPC {
    constructor(runtime, extensionId, peripheralOptions, connectCallback, resetCallback = null) {
      super();

      this._socket = runtime.getScratchLinkSocket("BLE");
      this._socket.setOnOpen(this.requestPeripheral.bind(this));
      this._socket.setOnClose(this.handleDisconnectError.bind(this));
      this._socket.setOnError(this._handleRequestError.bind(this));
      this._socket.setHandleMessage(this._handleMessage.bind(this));

      this._sendMessage = this._socket.sendMessage.bind(this._socket);

      this._availablePeripherals = {};
      this._connectCallback = connectCallback;
      this._connected = false;
      this._characteristicDidChangeCallback = null;
      this._resetCallback = resetCallback;
      this._discoverTimeoutID = null;
      this._extensionId = extensionId;
      this._peripheralOptions = peripheralOptions;
      this._runtime = runtime;

      this._socket.open();
    }

    requestPeripheral() {
      this._availablePeripherals = {};
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._discoverTimeoutID = window.setTimeout(
        this._handleDiscoverTimeout.bind(this),
        15000,
      );

      this.sendRemoteRequest("discover", this._peripheralOptions).catch((e) => {
        this._handleRequestError(e);
      });
    }

    connectPeripheral(id) {
      this.sendRemoteRequest("connect", { peripheralId: id })
        .then(() => {
          this._connected = true;
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
          this._connectCallback();
        })
        .catch((e) => {
          this._handleRequestError(e);
        });
    }

    disconnect() {
      if (this._connected) {
        this._connected = false;
      }

      if (this._socket.isOpen()) {
        this._socket.close();
      }

      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }

      this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }

    isConnected() {
      return this._connected;
    }

    startNotifications(serviceId, characteristicId, onCharacteristicChanged = null) {
      const params = {
        serviceId,
        characteristicId,
      };
      this._characteristicDidChangeCallback = onCharacteristicChanged;
      return this.sendRemoteRequest("startNotifications", params).catch((e) => {
        this.handleDisconnectError(e);
      });
    }

    read(serviceId, characteristicId, optStartNotifications = false, onCharacteristicChanged = null) {
      const params = {
        serviceId,
        characteristicId,
      };
      if (optStartNotifications) {
        params.startNotifications = true;
      }
      if (onCharacteristicChanged) {
        this._characteristicDidChangeCallback = onCharacteristicChanged;
      }
      return this.sendRemoteRequest("read", params).catch((e) => {
        this.handleDisconnectError(e);
      });
    }

    write(serviceId, characteristicId, message, encoding = null, withResponse = null) {
      const params = { serviceId, characteristicId, message };
      if (encoding) {
        params.encoding = encoding;
      }
      if (withResponse !== null) {
        params.withResponse = withResponse;
      }
      return this.sendRemoteRequest("write", params).catch((e) => {
        this.handleDisconnectError(e);
      });
    }

    didReceiveCall(method, params) {
      switch (method) {
        case "didDiscoverPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
            this._availablePeripherals,
          );
          if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
          }
          break;
        case "userDidPickPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.USER_PICKED_PERIPHERAL,
            this._availablePeripherals,
          );
          if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
          }
          break;
        case "userDidNotPickPeripheral":
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
          if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
          }
          break;
        case "characteristicDidChange":
          if (this._characteristicDidChangeCallback) {
            this._characteristicDidChangeCallback(params.message);
          }
          break;
        case "ping":
          return 42;
      }
    }

    handleDisconnectError(/* e */) {
      if (!this._connected) return;

      this.disconnect();

      if (this._resetCallback) {
        this._resetCallback();
      }

      this._runtime.emit(
        this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR,
        {
          message: `Scratch lost connection to`,
          extensionId: this._extensionId,
        },
      );
    }

    _handleRequestError(/* e */) {
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
        message: `Scratch lost connection to`,
        extensionId: this._extensionId,
      });
    }

    _handleDiscoverTimeout() {
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
  }

  // ============================================================================
  // SPIKE PRIME PERIPHERAL
  // ============================================================================

  class SpikePrime {
    constructor(runtime, extensionId) {
      this._runtime = runtime;
      this._extensionId = extensionId;

      this.SERVICE_UUID = "0000fd02-0000-1000-8000-00805f9b34fb";
      this.RX_UUID = "0000fd02-0001-1000-8000-00805f9b34fb";
      this.TX_UUID = "0000fd02-0002-1000-8000-00805f9b34fb";

      this._ble = null;
      this._rateLimiter = new RateLimiter(20);
      
      this._receiveBuffer = [];
      this._pendingResponses = new Map();

      this._maxPacketSize = 20;
      this._maxChunkSize = 84;

      this._sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: { yaw: 0, pitch: 0, roll: 0, accelX: 0, accelY: 0, accelZ: 0 },
      };

      this._hubName = "";

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);

      this._runtime.registerPeripheralExtension(extensionId, this);
      this._runtime.on("PROJECT_STOP_ALL", this.stopAll.bind(this));
    }

    scan() {
      if (this._ble) {
        this._ble.disconnect();
      }

      const bleConfig = {
        filters: [
          {
            services: [this.SERVICE_UUID],
          },
        ],
        optionalServices: [],
      };

      this._ble = new BLE(
        this._runtime,
        this._extensionId,
        bleConfig,
        this._onConnect,
        this.reset,
      );
    }

    connect(id) {
      if (this._ble) {
        this._ble.connectPeripheral(id);
      }
    }

    disconnect() {
      if (this._ble) {
        this._ble.disconnect();
      }
      this.reset();
    }

    reset() {
      this._receiveBuffer = [];
      this._pendingResponses.clear();
      this._sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: { yaw: 0, pitch: 0, roll: 0, accelX: 0, accelY: 0, accelZ: 0 },
      };
      this._hubName = "";
    }

    isConnected() {
      return this._ble ? this._ble.isConnected() : false;
    }

    stopAll() {
      if (!this.isConnected()) return;
      // Could stop motors here if needed
    }

    async send(message, useLimiter = true) {
      if (!this.isConnected()) {
        return Promise.resolve();
      }

      if (useLimiter && !this._rateLimiter.okayToSend()) {
        return Promise.resolve();
      }

      const frame = COBS.pack(message);
      const base64 = Base64Util.uint8ArrayToBase64(frame);

      return this._ble.write(this.SERVICE_UUID, this.RX_UUID, base64, "base64");
    }

    async sendRequest(messageType, payload, expectedResponse, timeoutMs = 5000) {
      return new Promise(async (resolve, reject) => {
        const timer = setTimeout(() => {
          this._pendingResponses.delete(expectedResponse);
          reject(new Error(`Timeout waiting for 0x${expectedResponse.toString(16)}`));
        }, timeoutMs);

        this._pendingResponses.set(expectedResponse, (data) => {
          clearTimeout(timer);
          resolve(data);
        });

        try {
          const message = Message.concat(Message.writeUInt8(messageType), payload);
          await this.send(message, false);
        } catch (error) {
          clearTimeout(timer);
          this._pendingResponses.delete(expectedResponse);
          reject(error);
        }
      });
    }

    _onConnect() {
      this._ble.startNotifications(
        this.SERVICE_UUID,
        this.TX_UUID,
        this._onMessage,
      );

      // Handshake
      setTimeout(async () => {
        try {
          const info = await this.sendRequest(
            MSG.InfoRequest,
            new Uint8Array([]),
            MSG.InfoResponse
          );
          
          this._maxPacketSize = Message.parseUInt16LE(info, 9);
          this._maxChunkSize = Message.parseUInt16LE(info, 13);

          // Get hub name
          const nameResp = await this.sendRequest(
            MSG.GetHubNameRequest,
            new Uint8Array([]),
            MSG.GetHubNameResponse
          );
          this._hubName = Message.parseString(nameResp, 1, 30);

          // Enable sensor notifications
          await this.enableSensorNotifications(100);
        } catch (error) {
          console.error("Connection setup error:", error);
        }
      }, 500);
    }

    _onMessage(base64) {
      const data = Base64Util.base64ToUint8Array(base64);
      
      // Buffer until delimiter
      for (let i = 0; i < data.length; i++) {
        this._receiveBuffer.push(data[i]);
        
        if (data[i] === COBS.DELIMITER) {
          const frame = new Uint8Array(this._receiveBuffer);
          this._receiveBuffer = [];
          
          try {
            const decoded = COBS.unpack(frame);
            this._handleMessage(decoded);
          } catch (error) {
            console.error("Decode error:", error);
          }
        }
      }
    }

    _handleMessage(data) {
      const messageType = data[0];

      // Check for pending request
      if (this._pendingResponses.has(messageType)) {
        const resolve = this._pendingResponses.get(messageType);
        this._pendingResponses.delete(messageType);
        resolve(data);
        return;
      }

      // Handle notifications
      switch (messageType) {
        case MSG.DeviceNotification:
          this._parseDeviceNotification(data);
          break;
        case MSG.ConsoleNotification:
          const text = Message.parseString(data, 1, 256);
          console.log("[SPIKE]", text);
          break;
      }
    }

    _parseDeviceNotification(data) {
      let offset = 3; // Skip message type and size

      while (offset < data.length) {
        const deviceType = data[offset];

        switch (deviceType) {
          case DeviceType.Battery:
            this._sensorData.battery = data[offset + 1];
            offset += 2;
            break;

          case DeviceType.IMU: {
            const view = new DataView(data.buffer, data.byteOffset + offset);
            this._sensorData.imu = {
              yaw: view.getInt16(3, true),
              pitch: view.getInt16(5, true),
              roll: view.getInt16(7, true),
              accelX: view.getInt16(9, true),
              accelY: view.getInt16(11, true),
              accelZ: view.getInt16(13, true),
            };
            offset += 15;
            break;
          }

          case DeviceType.Motor: {
            const port = data[offset + 1];
            const view = new DataView(data.buffer, data.byteOffset + offset);
            this._sensorData.motors[port] = {
              absPosition: view.getInt16(3, true),
              power: view.getInt16(5, true),
              speed: view.getInt8(7),
              position: view.getInt32(8, true),
            };
            offset += 12;
            break;
          }

          case DeviceType.ForceSensor: {
            const port = data[offset + 1];
            this._sensorData.forceSensors[port] = {
              value: data[offset + 2],
              pressed: data[offset + 3] === 0x01,
            };
            offset += 4;
            break;
          }

          case DeviceType.ColorSensor: {
            const port = data[offset + 1];
            const view = new DataView(data.buffer, data.byteOffset + offset);
            this._sensorData.colorSensors[port] = {
              color: view.getInt8(2),
              red: view.getUint16(3, true),
              green: view.getUint16(5, true),
              blue: view.getUint16(7, true),
            };
            offset += 9;
            break;
          }

          case DeviceType.DistanceSensor: {
            const port = data[offset + 1];
            const view = new DataView(data.buffer, data.byteOffset + offset);
            this._sensorData.distanceSensors[port] = {
              distance: view.getInt16(2, true),
            };
            offset += 4;
            break;
          }

          default:
            console.warn(`Unknown device: 0x${deviceType.toString(16)}`);
            return;
        }
      }
    }

    async enableSensorNotifications(intervalMs = 100) {
      const payload = Message.writeUInt16LE(intervalMs);
      await this.sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }

    async disableSensorNotifications() {
      const payload = Message.writeUInt16LE(0);
      await this.sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }

    async setHubName(name) {
      const payload = Message.writeString(name, 30);
      await this.sendRequest(MSG.SetHubNameRequest, payload, MSG.SetHubNameResponse);
      this._hubName = name;
    }

    getMotorPosition(port) {
      const motor = this._sensorData.motors[port];
      return motor ? motor.position : 0;
    }

    getMotorSpeed(port) {
      const motor = this._sensorData.motors[port];
      return motor ? motor.speed : 0;
    }

    getColorSensor(port, mode) {
      const sensor = this._sensorData.colorSensors[port];
      if (!sensor) return 0;

      switch (mode) {
        case "color": return sensor.color;
        case "red": return sensor.red;
        case "green": return sensor.green;
        case "blue": return sensor.blue;
        default: return 0;
      }
    }

    getDistanceSensor(port) {
      const sensor = this._sensorData.distanceSensors[port];
      return sensor ? sensor.distance : -1;
    }

    getForceSensor(port, mode) {
      const sensor = this._sensorData.forceSensors[port];
      if (!sensor) return 0;
      return mode === "pressed" ? (sensor.pressed ? 1 : 0) : sensor.value;
    }

    getIMU(axis) {
      return this._sensorData.imu[axis] || 0;
    }

    getBattery() {
      return this._sensorData.battery;
    }

    getHubName() {
      return this._hubName;
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================

  class SpikePrimeExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this._peripheral = new SpikePrime(this.runtime, "spikeprime");
    }

    getInfo() {
      return {
        id: "spikeprime",
        name: "SPIKE Prime",
        color1: "#FF661A",
        color2: "#E64D00",
        color3: "#CC4400",
        showStatusButton: true,
        blocks: [
          {
            opcode: "getMotorPosition",
            blockType: BlockType.REPORTER,
            text: "motor [PORT] position",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorSpeed",
            blockType: BlockType.REPORTER,
            text: "motor [PORT] speed",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "getColorSensor",
            blockType: BlockType.REPORTER,
            text: "color sensor [PORT] [MODE]",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
              MODE: {
                type: ArgumentType.STRING,
                menu: "colorMode",
                defaultValue: "color",
              },
            },
          },
          {
            opcode: "getColorName",
            blockType: BlockType.REPORTER,
            text: "color sensor [PORT] color name",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getDistanceSensor",
            blockType: BlockType.REPORTER,
            text: "distance sensor [PORT] (mm)",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getForceSensor",
            blockType: BlockType.REPORTER,
            text: "force sensor [PORT] [MODE]",
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
              MODE: {
                type: ArgumentType.STRING,
                menu: "forceMode",
                defaultValue: "value",
              },
            },
          },
          "---",
          {
            opcode: "getIMU",
            blockType: BlockType.REPORTER,
            text: "hub [IMU]",
            arguments: {
              IMU: {
                type: ArgumentType.STRING,
                menu: "imuMode",
                defaultValue: "yaw",
              },
            },
          },
          {
            opcode: "getBattery",
            blockType: BlockType.REPORTER,
            text: "battery level %",
          },
          {
            opcode: "getHubName",
            blockType: BlockType.REPORTER,
            text: "hub name",
          },
          "---",
          {
            opcode: "setHubName",
            blockType: BlockType.COMMAND,
            text: "set hub name to [NAME]",
            arguments: {
              NAME: {
                type: ArgumentType.STRING,
                defaultValue: "SPIKE",
              },
            },
          },
          {
            opcode: "enableSensors",
            blockType: BlockType.COMMAND,
            text: "enable sensors (update every [MS] ms)",
            arguments: {
              MS: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "disableSensors",
            blockType: BlockType.COMMAND,
            text: "disable sensors",
          },
        ],
        menus: {
          ports: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "E", "F"],
          },
          colorMode: {
            items: ["color", "red", "green", "blue"],
          },
          forceMode: {
            items: ["value", "pressed"],
          },
          imuMode: {
            items: ["yaw", "pitch", "roll", "accelX", "accelY", "accelZ"],
          },
        },
      };
    }

    getMotorPosition(args) {
      const portId = this._getPortId(args.PORT);
      return this._peripheral.getMotorPosition(portId);
    }

    getMotorSpeed(args) {
      const portId = this._getPortId(args.PORT);
      return this._peripheral.getMotorSpeed(portId);
    }

    getColorSensor(args) {
      const portId = this._getPortId(args.PORT);
      return this._peripheral.getColorSensor(portId, args.MODE);
    }

    getColorName(args) {
      const portId = this._getPortId(args.PORT);
      const colorIndex = this._peripheral.getColorSensor(portId, "color");
      if (colorIndex < 0 || colorIndex >= ColorNames.length) {
        return "none";
      }
      return ColorNames[colorIndex];
    }

    getDistanceSensor(args) {
      const portId = this._getPortId(args.PORT);
      return this._peripheral.getDistanceSensor(portId);
    }

    getForceSensor(args) {
      const portId = this._getPortId(args.PORT);
      return this._peripheral.getForceSensor(portId, args.MODE);
    }

    getIMU(args) {
      return this._peripheral.getIMU(args.IMU);
    }

    getBattery() {
      return this._peripheral.getBattery();
    }

    getHubName() {
      return this._peripheral.getHubName();
    }

    async setHubName(args) {
      await this._peripheral.setHubName(args.NAME);
    }

    async enableSensors(args) {
      const ms = Math.max(50, parseInt(args.MS));
      await this._peripheral.enableSensorNotifications(ms);
    }

    async disableSensors() {
      await this._peripheral.disableSensorNotifications();
    }

    _getPortId(port) {
      const portMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
      return portMap[port] || 0;
    }
  }

  Scratch.extensions.register(new SpikePrimeExtension());
})(Scratch);