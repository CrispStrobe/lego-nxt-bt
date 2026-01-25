(function (Scratch) {
  "use strict";

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const MathUtil = {
    clamp: (val, min, max) => Math.max(min, Math.min(val, max)),
    scale: (val, inMin, inMax, outMin, outMax) =>
      ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin,
    wrapClamp: (val, min, max) => {
      const range = max - min;
      return ((((val - min) % range) + range) % range) + min;
    },
  };

  const color = {
    hsvToRgb: ({ h, s, v }) => {
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      let r, g, b;

      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
      } else {
        r = c; g = 0; b = x;
      }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      };
    },
    rgbToDecimal: ({ r, g, b }) => (r << 16) | (g << 8) | b,
  };

  // ============================================================================
  // COBS ENCODING/DECODING
  // ============================================================================

  const DELIMITER = 0x02;
  const XOR = 0x03;
  const COBS_CODE_OFFSET = 3;
  const MAX_BLOCK_SIZE = 84;
  const NO_DELIMITER = 0xFF;

  const COBS = {
    encode: (data) => {
      const buffer = [];
      let codeIndex = 0;
      let block = 0;

      const beginBlock = () => {
        codeIndex = buffer.length;
        buffer.push(NO_DELIMITER);
        block = 1;
      };

      beginBlock();

      for (const byte of data) {
        if (byte > DELIMITER) {
          buffer.push(byte);
          block++;
        }
        if (byte <= DELIMITER || block > MAX_BLOCK_SIZE) {
          if (byte <= DELIMITER) {
            const delimiterBase = byte * MAX_BLOCK_SIZE;
            const blockOffset = block + COBS_CODE_OFFSET;
            buffer[codeIndex] = delimiterBase + blockOffset;
          }
          beginBlock();
        }
      }

      buffer[codeIndex] = block + COBS_CODE_OFFSET;
      return new Uint8Array(buffer);
    },

    decode: (data) => {
      const buffer = [];

      const unescape = (code) => {
        if (code === 0xFF) {
          return { value: null, block: MAX_BLOCK_SIZE + 1 };
        }
        let value = Math.floor((code - COBS_CODE_OFFSET) / MAX_BLOCK_SIZE);
        let block = (code - COBS_CODE_OFFSET) % MAX_BLOCK_SIZE;
        if (block === 0) {
          block = MAX_BLOCK_SIZE;
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
        ({ value, block } = unescape(data[i]));
      }

      return new Uint8Array(buffer);
    },

    pack: (data) => {
      const encoded = COBS.encode(data);
      const buffer = new Uint8Array(encoded.length + 1);
      for (let i = 0; i < encoded.length; i++) {
        buffer[i] = encoded[i] ^ XOR;
      }
      buffer[buffer.length - 1] = DELIMITER;
      return buffer;
    },

    unpack: (frame) => {
      let start = 0;
      if (frame[0] === 0x01) {
        start = 1;
      }
      const unframed = new Uint8Array(frame.length - start - 1);
      for (let i = 0; i < unframed.length; i++) {
        unframed[i] = frame[start + i] ^ XOR;
      }
      return COBS.decode(unframed);
    },
  };

  // ============================================================================
  // MESSAGE TYPES
  // ============================================================================

  const MessageType = {
    INFO_REQUEST: 0x00,
    INFO_RESPONSE: 0x01,
    PROGRAM_FLOW_REQUEST: 0x1E,
    PROGRAM_FLOW_RESPONSE: 0x1F,
    PROGRAM_FLOW_NOTIFICATION: 0x20,
    CONSOLE_NOTIFICATION: 0x21,
    TUNNEL_MESSAGE: 0x32,
    DEVICE_NOTIFICATION_REQUEST: 0x28,
    DEVICE_NOTIFICATION_RESPONSE: 0x29,
    DEVICE_NOTIFICATION: 0x3C,
  };

  const DeviceMessageType = {
    BATTERY: 0x00,
    IMU_VALUES: 0x01,
    MATRIX_5x5_DISPLAY: 0x02,
    MOTOR: 0x0A,
    FORCE_SENSOR: 0x0B,
    COLOR_SENSOR: 0x0C,
    DISTANCE_SENSOR: 0x0D,
    MATRIX_3x3_COLOR: 0x0E,
  };

  const SpikeColor = {
    BLACK: 0x00,
    MAGENTA: 0x01,
    PURPLE: 0x02,
    BLUE: 0x03,
    AZURE: 0x04,
    TURQUOISE: 0x05,
    GREEN: 0x06,
    YELLOW: 0x07,
    ORANGE: 0x08,
    RED: 0x09,
    WHITE: 0x0A,
    NONE: 0xFF,
  };

  const SpikePort = {
    A: 0x00,
    B: 0x01,
    C: 0x02,
    D: 0x03,
    E: 0x04,
    F: 0x05,
  };

  // ============================================================================
  // BASE64 UTILITIES
  // ============================================================================

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

  // ============================================================================
  // RATE LIMITER
  // ============================================================================

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
  // JSONRPC CLASS
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
        throw new Error(`Bad or missing JSON-RPC version in message: ${JSON.stringify(json)}`);
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
          }
        );
      }
    }
  }

  // ============================================================================
  // BLE CLASS
  // ============================================================================

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
        15000
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
            this._availablePeripherals
          );
          if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
          }
          break;
        case "userDidPickPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.USER_PICKED_PERIPHERAL,
            this._availablePeripherals
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
        }
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
  // SPIKE PERIPHERAL CLASS
  // ============================================================================

  const SpikeBLE = {
    service: "0000FD02-0000-1000-8000-00805F9B34FB",
    rxChar: "0000FD02-0001-1000-8000-00805F9B34FB",
    txChar: "0000FD02-0002-1000-8000-00805F9B34FB",
    sendRateMax: 20,
  };

  class SpikeMotor {
    constructor(port) {
      this.port = port;
      this.absolutePosition = 0;
      this.power = 0;
      this.speed = 0;
      this.position = 0;
      this.deviceType = null;
    }

    updateFromMessage(data) {
      this.deviceType = data[2];
      this.absolutePosition = (data[3] | (data[4] << 8));
      if (this.absolutePosition > 32767) this.absolutePosition -= 65536;
      this.power = (data[5] | (data[6] << 8));
      if (this.power > 32767) this.power -= 65536;
      this.speed = data[7];
      if (this.speed > 127) this.speed -= 256;
      this.position = (data[8] | (data[9] << 8) | (data[10] << 16) | (data[11] << 24));
    }
  }

  class SpikeHub {
    constructor(runtime, extensionId) {
      this._runtime = runtime || (typeof vm !== "undefined" ? vm.runtime : null);
      this._extensionId = extensionId;

      this._ble = null;
      this._rateLimiter = new RateLimiter(SpikeBLE.sendRateMax);

      // Device state
      this._motors = {};
      this._battery = 0;
      this._imu = {
        faceUp: 0,
        yawFace: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        accelX: 0,
        accelY: 0,
        accelZ: 0,
        gyroX: 0,
        gyroY: 0,
        gyroZ: 0,
      };
      this._display = new Array(25).fill(0);
      this._sensors = {
        force: {},
        color: {},
        distance: {},
      };

      this._info = null;
      this._receiveBuffer = [];

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);

      if (this._runtime) {
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._runtime.on("PROJECT_STOP_ALL", this.stopAll.bind(this));
      }
    }

    // ========================================================================
    // CONNECTION MANAGEMENT
    // ========================================================================

    scan() {
      if (this._ble) {
        this._ble.disconnect();
      }

      const bleConfig = {
        filters: [{
          services: [SpikeBLE.service],
        }],
        optionalServices: [],
      };

      try {
        this._ble = new BLE(
          this._runtime,
          this._extensionId,
          bleConfig,
          this._onConnect,
          this.reset
        );
      } catch (error) {
        console.error("[SPIKE] Error creating BLE:", error);
      }
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
      this._motors = {};
      this._battery = 0;
      this._imu = {
        faceUp: 0,
        yawFace: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        accelX: 0,
        accelY: 0,
        accelZ: 0,
        gyroX: 0,
        gyroY: 0,
        gyroZ: 0,
      };
      this._display = new Array(25).fill(0);
      this._sensors = {
        force: {},
        color: {},
        distance: {},
      };
      this._info = null;
      this._receiveBuffer = [];
    }

    isConnected() {
      return this._ble ? this._ble.isConnected() : false;
    }

    // ========================================================================
    // MESSAGE SENDING
    // ========================================================================

    send(message, useLimiter = true) {
      if (!this.isConnected()) {
        return Promise.resolve();
      }

      if (useLimiter && !this._rateLimiter.okayToSend()) {
        return Promise.resolve();
      }

      const packed = COBS.pack(message);
      const base64 = Base64Util.uint8ArrayToBase64(packed);
      return this._ble.write(SpikeBLE.service, SpikeBLE.rxChar, base64, "base64");
    }

    sendInfoRequest() {
      const message = new Uint8Array([MessageType.INFO_REQUEST]);
      return this.send(message, false);
    }

    sendDeviceNotificationRequest(intervalMs) {
      const message = new Uint8Array([
        MessageType.DEVICE_NOTIFICATION_REQUEST,
        intervalMs & 0xFF,
        (intervalMs >> 8) & 0xFF,
      ]);
      return this.send(message, false);
    }

    sendTunnelMessage(pythonCode) {
      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(pythonCode);
      
      const message = new Uint8Array(3 + codeBytes.length);
      message[0] = MessageType.TUNNEL_MESSAGE;
      message[1] = codeBytes.length & 0xFF;
      message[2] = (codeBytes.length >> 8) & 0xFF;
      message.set(codeBytes, 3);
      
      return this.send(message, true);
    }

    // ========================================================================
    // MESSAGE RECEIVING
    // ========================================================================

    _onConnect() {
      this._ble.startNotifications(
        SpikeBLE.service,
        SpikeBLE.txChar,
        this._onMessage
      );

      setTimeout(() => {
        this.sendInfoRequest();
      }, 100);

      setTimeout(() => {
        this.sendDeviceNotificationRequest(100);
      }, 500);
    }

    _onMessage(base64) {
      const frame = Base64Util.base64ToUint8Array(base64);
      
      for (const byte of frame) {
        this._receiveBuffer.push(byte);
        
        if (byte === DELIMITER) {
          const message = new Uint8Array(this._receiveBuffer);
          this._receiveBuffer = [];
          
          try {
            const unpacked = COBS.unpack(message);
            this._processMessage(unpacked);
          } catch (error) {
            console.error("[SPIKE] Error unpacking message:", error);
          }
        }
      }
    }

    _processMessage(data) {
      if (data.length === 0) return;

      const messageType = data[0];

      switch (messageType) {
        case MessageType.INFO_RESPONSE:
          this._handleInfoResponse(data);
          break;
        case MessageType.DEVICE_NOTIFICATION:
          this._handleDeviceNotification(data);
          break;
        case MessageType.CONSOLE_NOTIFICATION:
          this._handleConsoleNotification(data);
          break;
      }
    }

    _handleInfoResponse(data) {
      this._info = {
        rpcMajor: data[1],
        rpcMinor: data[2],
        rpcBuild: (data[3] | (data[4] << 8)),
        fwMajor: data[5],
        fwMinor: data[6],
        fwBuild: (data[7] | (data[8] << 8)),
        maxPacketSize: (data[9] | (data[10] << 8)),
        maxMessageSize: (data[11] | (data[12] << 8)),
        maxChunkSize: (data[13] | (data[14] << 8)),
        productGroup: (data[15] | (data[16] << 8)),
      };
    }

    _handleDeviceNotification(data) {
      const payloadSize = (data[1] | (data[2] << 8));
      let offset = 3;

      while (offset < data.length) {
        const deviceType = data[offset];
        
        switch (deviceType) {
          case DeviceMessageType.BATTERY:
            this._battery = data[offset + 1];
            offset += 2;
            break;

          case DeviceMessageType.IMU_VALUES:
            this._imu.faceUp = data[offset + 1];
            this._imu.yawFace = data[offset + 2];
            this._imu.yaw = (data[offset + 3] | (data[offset + 4] << 8));
            if (this._imu.yaw > 32767) this._imu.yaw -= 65536;
            this._imu.pitch = (data[offset + 5] | (data[offset + 6] << 8));
            if (this._imu.pitch > 32767) this._imu.pitch -= 65536;
            this._imu.roll = (data[offset + 7] | (data[offset + 8] << 8));
            if (this._imu.roll > 32767) this._imu.roll -= 65536;
            this._imu.accelX = (data[offset + 9] | (data[offset + 10] << 8));
            if (this._imu.accelX > 32767) this._imu.accelX -= 65536;
            this._imu.accelY = (data[offset + 11] | (data[offset + 12] << 8));
            if (this._imu.accelY > 32767) this._imu.accelY -= 65536;
            this._imu.accelZ = (data[offset + 13] | (data[offset + 14] << 8));
            if (this._imu.accelZ > 32767) this._imu.accelZ -= 65536;
            this._imu.gyroX = (data[offset + 15] | (data[offset + 16] << 8));
            if (this._imu.gyroX > 32767) this._imu.gyroX -= 65536;
            this._imu.gyroY = (data[offset + 17] | (data[offset + 18] << 8));
            if (this._imu.gyroY > 32767) this._imu.gyroY -= 65536;
            this._imu.gyroZ = (data[offset + 19] | (data[offset + 20] << 8));
            if (this._imu.gyroZ > 32767) this._imu.gyroZ -= 65536;
            offset += 21;
            break;

          case DeviceMessageType.MATRIX_5x5_DISPLAY:
            for (let i = 0; i < 25; i++) {
              this._display[i] = data[offset + 1 + i];
            }
            offset += 26;
            break;

          case DeviceMessageType.MOTOR:
            const port = data[offset + 1];
            if (!this._motors[port]) {
              this._motors[port] = new SpikeMotor(port);
            }
            this._motors[port].updateFromMessage(data.slice(offset));
            offset += 12;
            break;

          case DeviceMessageType.FORCE_SENSOR:
            const forcePort = data[offset + 1];
            this._sensors.force[forcePort] = {
              value: data[offset + 2],
              pressed: data[offset + 3] === 0x01,
            };
            offset += 4;
            break;

          case DeviceMessageType.COLOR_SENSOR:
            const colorPort = data[offset + 1];
            this._sensors.color[colorPort] = {
              color: data[offset + 2],
              red: (data[offset + 3] | (data[offset + 4] << 8)),
              green: (data[offset + 5] | (data[offset + 6] << 8)),
              blue: (data[offset + 7] | (data[offset + 8] << 8)),
            };
            offset += 9;
            break;

          case DeviceMessageType.DISTANCE_SENSOR:
            const distPort = data[offset + 1];
            const dist = (data[offset + 2] | (data[offset + 3] << 8));
            this._sensors.distance[distPort] = dist >= 0 ? dist : null;
            offset += 4;
            break;

          default:
            return;
        }
      }
    }

    _handleConsoleNotification(data) {
      let message = "";
      for (let i = 1; i < data.length && data[i] !== 0; i++) {
        message += String.fromCharCode(data[i]);
      }
      console.log("[SPIKE Console]", message);
    }

    // ========================================================================
    // PYTHON CODE EXECUTION
    // ========================================================================

    executeCode(code) {
      return this.sendTunnelMessage(code);
    }

    stopAll() {
      // Stop all motors
      const code = `import motor
from hub import port
for p in [port.A, port.B, port.C, port.D, port.E, port.F]:
    try:
        motor.stop(p)
    except:
        pass`;
      this.executeCode(code);
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    getMotor(port) {
      return this._motors[port] || null;
    }

    getBattery() {
      return this._battery;
    }

    getIMU() {
      return this._imu;
    }

    getSensor(type, port) {
      return this._sensors[type][port] || null;
    }
  }

  // ============================================================================
  // SPIKE EXTENSION CLASS
  // ============================================================================

  const iconURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACpQTFRF////fIel5ufolZ62/2YavsPS+YZOkJmy9/j53+Hk6+zs6N/b6dfO////tDhMHAAAAA50Uk5T/////////////////wBFwNzIAAAA6ElEQVR42uzX2w6DIBAEUGDVtlr//3dLaLwgiwUd2z7MJPJg5EQWiGhGcAxBggQJEiT436CIfqXJPTn3MKNYYMSDFpoAmp24OaYgvwKnFgL2zvVTCwHrMoMi+nUQLFthaNCCa0iwclLkDgYVsQp0mzxuqXgK1MRzoCLWgkPXNN2wI/q6Kvt7u/cX0HtejN8x2sXpnpb8J8D3b0Keuhh3X975M+i0xNVbg3s1TIasgK21bQyGO+s2PykaGMYbge8KrNrssvkOWDXkErB8UuBHETjoYLkKBA8ZfuDkbwVBggQJEiR4MC8BBgDTtMZLx2nFCQAAAABJRU5ErkJggg==";

  class SpikeExtension {
    constructor(runtime) {
      this.runtime = runtime;

      if (!this.runtime && typeof Scratch !== "undefined" && Scratch.vm) {
        this.runtime = Scratch.vm.runtime;
      }

      this._peripheral = new SpikeHub(this.runtime, "spike");
    }

    getInfo() {
      return {
        id: "spike",
        name: "LEGO SPIKE Prime",
        blockIconURI: iconURI,
        showStatusButton: true,
        blocks: [
          {
            opcode: "motorRun",
            text: "motor [PORT] run at [SPEED]%",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
            },
          },
          {
            opcode: "motorRunForTime",
            text: "motor [PORT] run at [SPEED]% for [TIME] seconds",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorRunForDegrees",
            text: "motor [PORT] run at [SPEED]% for [DEGREES] degrees",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
              DEGREES: {
                type: ArgumentType.NUMBER,
                defaultValue: 360,
              },
            },
          },
          {
            opcode: "motorStop",
            text: "motor [PORT] stop",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "motorPairMove",
            text: "motor pair [LEFT] [RIGHT] move [STEERING] at [SPEED]%",
            blockType: BlockType.COMMAND,
            arguments: {
              LEFT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              RIGHT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "B",
              },
              STEERING: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
            },
          },
          {
            opcode: "motorPairMoveForTime",
            text: "motor pair [LEFT] [RIGHT] move [STEERING] at [SPEED]% for [TIME] seconds",
            blockType: BlockType.COMMAND,
            arguments: {
              LEFT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              RIGHT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "B",
              },
              STEERING: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
              SPEED: {
                type: ArgumentType.NUMBER,
                defaultValue: 75,
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          "---",
          {
            opcode: "displayShowImage",
            text: "display show image [IMAGE]",
            blockType: BlockType.COMMAND,
            arguments: {
              IMAGE: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "displayWrite",
            text: "display write [TEXT]",
            blockType: BlockType.COMMAND,
            arguments: {
              TEXT: {
                type: ArgumentType.STRING,
                defaultValue: "Hello!",
              },
            },
          },
          {
            opcode: "displaySetPixel",
            text: "display set pixel x:[X] y:[Y] brightness:[BRIGHTNESS]",
            blockType: BlockType.COMMAND,
            arguments: {
              X: {
                type: ArgumentType.NUMBER,
                defaultValue: 2,
              },
              Y: {
                type: ArgumentType.NUMBER,
                defaultValue: 2,
              },
              BRIGHTNESS: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "displayClear",
            text: "display clear",
            blockType: BlockType.COMMAND,
          },
          "---",
          {
            opcode: "playBeep",
            text: "play beep [FREQ] Hz for [TIME] seconds",
            blockType: BlockType.COMMAND,
            arguments: {
              FREQ: {
                type: ArgumentType.NUMBER,
                defaultValue: 1000,
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 0.2,
              },
            },
          },
          "---",
          {
            opcode: "getBattery",
            text: "battery level",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getMotorPosition",
            text: "motor [PORT] position",
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
            opcode: "getMotorSpeed",
            text: "motor [PORT] speed",
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
            opcode: "getYaw",
            text: "yaw angle",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getPitch",
            text: "pitch angle",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getRoll",
            text: "roll angle",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getColorSensorColor",
            text: "color sensor [PORT] color",
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
            opcode: "getDistanceSensor",
            text: "distance sensor [PORT] distance (mm)",
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
            opcode: "getForceSensor",
            text: "force sensor [PORT] value",
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
            opcode: "isForceSensorPressed",
            text: "force sensor [PORT] pressed?",
            blockType: BlockType.BOOLEAN,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
        ],
        menus: {
          PORT: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "E", "F"],
          },
        },
      };
    }

    // ========================================================================
    // MOTOR BLOCKS
    // ========================================================================

    motorRun(args) {
      const port = `port.${args.PORT}`;
      const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100) * 10;
      
      const code = `import motor
from hub import port
motor.run(${port}, ${speed})`;
      
      return this._peripheral.executeCode(code);
    }

    motorRunForTime(args) {
      const port = `port.${args.PORT}`;
      const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100) * 10;
      const time = Math.max(0, Cast.toNumber(args.TIME)) * 1000;
      
      const code = `import motor, runloop
from hub import port
async def main():
    await motor.run_for_time(${port}, ${time}, ${speed})
runloop.run(main())`;
      
      return this._peripheral.executeCode(code);
    }

    motorRunForDegrees(args) {
      const port = `port.${args.PORT}`;
      const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100) * 10;
      const degrees = Cast.toNumber(args.DEGREES);
      
      const code = `import motor, runloop
from hub import port
async def main():
    await motor.run_for_degrees(${port}, ${degrees}, ${speed})
runloop.run(main())`;
      
      return this._peripheral.executeCode(code);
    }

    motorStop(args) {
      const port = `port.${args.PORT}`;
      
      const code = `import motor
from hub import port
motor.stop(${port})`;
      
      return this._peripheral.executeCode(code);
    }

    motorPairMove(args) {
      const left = `port.${args.LEFT}`;
      const right = `port.${args.RIGHT}`;
      const steering = MathUtil.clamp(Cast.toNumber(args.STEERING), -100, 100);
      const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100) * 10;
      
      const code = `import motor_pair
from hub import port
motor_pair.unpair(motor_pair.PAIR_1)
motor_pair.pair(motor_pair.PAIR_1, ${left}, ${right})
motor_pair.move(motor_pair.PAIR_1, ${steering}, velocity=${speed})`;
      
      return this._peripheral.executeCode(code);
    }

    motorPairMoveForTime(args) {
      const left = `port.${args.LEFT}`;
      const right = `port.${args.RIGHT}`;
      const steering = MathUtil.clamp(Cast.toNumber(args.STEERING), -100, 100);
      const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100) * 10;
      const time = Math.max(0, Cast.toNumber(args.TIME)) * 1000;
      
      const code = `import motor_pair, runloop
from hub import port
async def main():
    motor_pair.unpair(motor_pair.PAIR_1)
    motor_pair.pair(motor_pair.PAIR_1, ${left}, ${right})
    await motor_pair.move_for_time(motor_pair.PAIR_1, ${steering}, ${time}, velocity=${speed})
runloop.run(main())`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // DISPLAY BLOCKS
    // ========================================================================

    displayShowImage(args) {
      const image = MathUtil.clamp(Cast.toNumber(args.IMAGE), 0, 66);
      
      const code = `from hub import light_matrix
light_matrix.show_image(${image})`;
      
      return this._peripheral.executeCode(code);
    }

    displayWrite(args) {
      const text = Cast.toString(args.TEXT).replace(/'/g, "\\'");
      
      const code = `from hub import light_matrix
light_matrix.write('${text}')`;
      
      return this._peripheral.executeCode(code);
    }

    displaySetPixel(args) {
      const x = MathUtil.clamp(Cast.toNumber(args.X), 0, 4);
      const y = MathUtil.clamp(Cast.toNumber(args.Y), 0, 4);
      const brightness = MathUtil.clamp(Cast.toNumber(args.BRIGHTNESS), 0, 100);
      
      const code = `from hub import light_matrix
light_matrix.set_pixel(${x}, ${y}, ${brightness})`;
      
      return this._peripheral.executeCode(code);
    }

    displayClear() {
      const code = `from hub import light_matrix
light_matrix.clear()`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // SOUND BLOCKS
    // ========================================================================

    playBeep(args) {
      const freq = MathUtil.clamp(Cast.toNumber(args.FREQ), 100, 10000);
      const time = Math.max(0, Cast.toNumber(args.TIME)) * 1000;
      
      const code = `from hub import sound
sound.beep(${freq}, ${time}, 100)`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // SENSOR BLOCKS
    // ========================================================================

    getBattery() {
      return this._peripheral.getBattery();
    }

    getMotorPosition(args) {
      const port = SpikePort[args.PORT];
      const motor = this._peripheral.getMotor(port);
      return motor ? motor.position : 0;
    }

    getMotorSpeed(args) {
      const port = SpikePort[args.PORT];
      const motor = this._peripheral.getMotor(port);
      return motor ? motor.speed : 0;
    }

    getYaw() {
      return this._peripheral.getIMU().yaw;
    }

    getPitch() {
      return this._peripheral.getIMU().pitch;
    }

    getRoll() {
      return this._peripheral.getIMU().roll;
    }

    getColorSensorColor(args) {
      const port = SpikePort[args.PORT];
      const sensor = this._peripheral.getSensor("color", port);
      if (!sensor) return "none";

      const colorNames = {
        [SpikeColor.BLACK]: "black",
        [SpikeColor.MAGENTA]: "magenta",
        [SpikeColor.PURPLE]: "purple",
        [SpikeColor.BLUE]: "blue",
        [SpikeColor.AZURE]: "azure",
        [SpikeColor.TURQUOISE]: "turquoise",
        [SpikeColor.GREEN]: "green",
        [SpikeColor.YELLOW]: "yellow",
        [SpikeColor.ORANGE]: "orange",
        [SpikeColor.RED]: "red",
        [SpikeColor.WHITE]: "white",
        [SpikeColor.NONE]: "none",
      };

      return colorNames[sensor.color] || "none";
    }

    getDistanceSensor(args) {
      const port = SpikePort[args.PORT];
      const distance = this._peripheral.getSensor("distance", port);
      return distance !== null ? distance : -1;
    }

    getForceSensor(args) {
      const port = SpikePort[args.PORT];
      const sensor = this._peripheral.getSensor("force", port);
      return sensor ? sensor.value : 0;
    }

    isForceSensorPressed(args) {
      const port = SpikePort[args.PORT];
      const sensor = this._peripheral.getSensor("force", port);
      return sensor ? sensor.pressed : false;
    }
  }

  Scratch.extensions.register(new SpikeExtension());
})(Scratch);