(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("SPIKE Prime Ultimate (BLE) extension must run unsandboxed");
  }

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // ============================================================================
  // DEBUG CONFIGURATION
  // ============================================================================
  const DEBUG = {
    enabled: true,
    bluetooth: true,
    protocol: true,
    sensors: true,
    motors: true,
    transpiler: true,
    execution: true,
    verbose: false, // Set to false to reduce noise
  };

  const log = {
    info: (...args) => DEBUG.enabled && console.log("🔵 [SPIKE-BLE]", ...args),
    warn: (...args) => DEBUG.enabled && console.warn("⚠️  [SPIKE-BLE]", ...args),
    error: (...args) => DEBUG.enabled && console.error("❌ [SPIKE-BLE]", ...args),
    bt: (...args) => DEBUG.bluetooth && console.log("📡 [BLE]", ...args),
    proto: (...args) => DEBUG.protocol && console.log("📦 [PROTOCOL]", ...args),
    sensor: (...args) => DEBUG.sensors && console.log("📊 [SENSOR]", ...args),
    motor: (...args) => DEBUG.motors && console.log("⚙️  [MOTOR]", ...args),
    transpile: (...args) => DEBUG.transpiler && console.log("🔄 [TRANSPILE]", ...args),
    exec: (...args) => DEBUG.execution && console.log("▶️  [EXEC]", ...args),
    verbose: (...args) => DEBUG.verbose && console.log("🔍 [VERBOSE]", ...args),
  };

  log.info("Extension loading...");

  // ============================================================================
  // TRANSLATIONS
  // ============================================================================
  const translations = {
    en: {
      extensionName: "SPIKE Prime Ultimate (BLE)",
      
      // Connection & Modes
      connection: "Connection & Modes",
      scanAndConnect: "scan and connect to SPIKE hub",
      disconnect: "disconnect from hub",
      isConnected: "connected to hub?",
      enableStreamingMode: "enable streaming mode",
      disableStreamingMode: "disable streaming mode",
      transpileProject: "transpile project to SPIKE Python",
      showGeneratedCode: "show generated code",
      downloadCode: "download as .py file",
      getHubType: "hub type",
      
      // Movement
      movement: "Movement (Motor Pairs)",
      setMovementMotors: "set movement motors [PORT_A] and [PORT_B]",
      moveForward: "move [DIRECTION] for [VALUE] [UNIT]",
      steer: "start steering [STEERING]",
      startTank: "start tank drive left [LEFT_SPEED] right [RIGHT_SPEED]",
      setMovementSpeed: "set movement speed to [SPEED]%",
      stopMovement: "stop movement",
      
      // Motors
      motors: "Motors",
      motorRunFor: "[PORT] run [DIRECTION] for [VALUE] [UNIT]",
      motorRunToPosition: "[PORT] run to position [POSITION] degrees",
      motorStart: "[PORT] start motor [DIRECTION]",
      motorStop: "[PORT] stop motor",
      motorSetSpeed: "[PORT] set speed to [SPEED]%",
      getPosition: "[PORT] position",
      getSpeed: "[PORT] speed (deg/s)",
      resetMotorPosition: "reset [PORT] motor position to [POSITION]",
      
      // Display
      display: "5x5 Display",
      displayText: "write [TEXT]",
      displayImage: "show image [IMAGE]",
      displayPattern: "display pattern [PATTERN]",
      displayClear: "clear display",
      setPixel: "set pixel [X] [Y] to [BRIGHTNESS]%",
      setCenterButtonColor: "set center button to [COLOR]",
      
      // IMU
      imu: "IMU (Motion Sensor)",
      getYaw: "yaw angle",
      getPitch: "pitch angle",
      getRoll: "roll angle",
      resetYaw: "reset yaw angle",
      presetYaw: "preset yaw to [ANGLE] degrees",
      
      // Sound
      sound: "Sound",
      playBeep: "beep [FREQUENCY] Hz for [DURATION] ms",
      playNote: "play note [NOTE] for [SECS] seconds",
      setVolume: "set volume to [VOLUME]%",
      stopSound: "stop all sounds",
      
      // Sensors
      sensors: "Sensors",
      getDistance: "[PORT] distance (mm)",
      setDistanceLights: "set [PORT] distance lights [TL] [TR] [BL] [BR]",
      getColor: "[PORT] color",
      getReflection: "[PORT] reflection",
      getForceSensor: "[PORT] force",
      isForceSensorPressed: "[PORT] force sensor pressed?",
      isColor: "[PORT] sees [COLOR]?",
      
      // Status
      status: "Hub Status",
      getBatteryLevel: "battery level %",
      
      // Python
      python: "Python Execution",
      runPythonCode: "run Python: [CODE]",
      
      // Menus
      forward: "forward",
      backward: "backward",
    },
    de: {
      extensionName: "SPIKE Prime Ultimate (BLE)",
      // ... German translations (keeping from original)
    },
  };

  // Language detection
  function detectLanguage() {
    const navLang = navigator.language || navigator.userLanguage || "en";
    const lang = navLang.toLowerCase().startsWith("de") ? "de" : "en";
    log.info("Selected language:", lang);
    return lang;
  }

  const currentLanguage = detectLanguage();
  const t = (key) => translations[currentLanguage][key] || translations.en[key] || key;

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
      if (frame[0] === 0x01) start = 1;
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
  // JSONRPC CLASS (from working extension)
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
        
        setTimeout(() => {
          if (this._openRequests[requestID]) {
            delete this._openRequests[requestID];
            log.warn("Request timeout:", method, "ID:", requestID);
            reject(new Error("Request timeout"));
          }
        }, 5000);
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
          }
        );
      }
    }
  }

  // ============================================================================
  // BLE CLASS (from working extension)
  // ============================================================================
  class BLE extends JSONRPC {
    constructor(runtime, extensionId, peripheralOptions, connectCallback, resetCallback = null) {
      super();

      this._runtime = runtime;
      this._extensionId = extensionId;
      this._peripheralOptions = peripheralOptions;
      this._connectCallback = connectCallback;
      this._resetCallback = resetCallback;

      this._socket = runtime.getScratchLinkSocket("BLE");
      this._socket.setOnOpen(this.requestPeripheral.bind(this));
      this._socket.setOnClose(this.handleDisconnectError.bind(this));
      this._socket.setOnError(this._handleRequestError.bind(this));
      this._socket.setHandleMessage(this._handleMessage.bind(this));

      this._sendMessage = this._socket.sendMessage.bind(this._socket);

      this._availablePeripherals = {};
      this._connected = false;
      this._characteristicDidChangeCallback = null;
      this._discoverTimeoutID = null;

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
  // SPIKE BLE CONFIG
  // ============================================================================
  const SpikeBLE = {
    service: "0000FD02-0000-1000-8000-00805F9B34FB",
    rxChar: "0000FD02-0001-1000-8000-00805F9B34FB",
    txChar: "0000FD02-0002-1000-8000-00805F9B34FB",
    sendRateMax: 20,
  };

  // ============================================================================
  // SPIKE PERIPHERAL CLASS
  // ============================================================================
  class SpikePeripheral {
    constructor(runtime, extensionId) {
      log.info("SpikePeripheral initializing...");
      
      this._runtime = runtime;
      this._extensionId = extensionId;
      this._ble = null;
      this._rateLimiter = new RateLimiter(SpikeBLE.sendRateMax);
      this._hubType = "unknown";
      
      // Sensor data storage
      this._sensors = {
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        battery: { level: 0, temperature: 0, voltage: 0, current: 0 },
        imu: { 
          yaw: 0, pitch: 0, roll: 0, 
          gyroX: 0, gyroY: 0, gyroZ: 0, 
          accelX: 0, accelY: 0, accelZ: 0
        },
      };
      
      // BLE message buffer
      this._buffer = [];
      
      // Python execution
      this._replOutput = "";
      
      // Bind methods
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
      this.reset = this.reset.bind(this);
      
      log.info("SpikePeripheral initialized");
    }

    // ========================================================================
    // CONNECTION MANAGEMENT
    // ========================================================================
    
    scan() {
      log.bt("Starting scan...");
      if (this._ble) {
        this._ble.disconnect();
      }

      const bleConfig = {
        filters: [
          { services: [SpikeBLE.service] },
        ],
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
        log.error("Error creating BLE:", error);
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
      log.bt("Resetting peripheral state");
      this._sensors = {
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        battery: { level: 0, temperature: 0, voltage: 0, current: 0 },
        imu: { 
          yaw: 0, pitch: 0, roll: 0, 
          gyroX: 0, gyroY: 0, gyroZ: 0, 
          accelX: 0, accelY: 0, accelZ: 0
        },
      };
      this._buffer = [];
      this._replOutput = "";
    }

    isConnected() {
      return this._ble ? this._ble.isConnected() : false;
    }

    getHubType() {
      return this._hubType;
    }

    // ========================================================================
    // BLE MESSAGE HANDLING
    // ========================================================================
    
    _onConnect() {
      log.bt("Connected! Starting notifications...");
      
      this._ble.startNotifications(
        SpikeBLE.service,
        SpikeBLE.txChar,
        this._onMessage
      );

      // Request device notifications
      setTimeout(() => {
        this._enableDeviceNotifications();
      }, 500);
    }

    _enableDeviceNotifications() {
      log.proto("Enabling device notifications...");
      const message = new Uint8Array([
        MessageType.DEVICE_NOTIFICATION_REQUEST,
        100 & 0xFF,  // interval: 100ms
        (100 >> 8) & 0xFF,
      ]);
      this._send(message, false);
    }

    _onMessage(base64) {
      const frame = Base64Util.base64ToUint8Array(base64);
      log.verbose("Received BLE data, length:", frame.length);
      
      for (const byte of frame) {
        this._buffer.push(byte);
        
        if (byte === DELIMITER) {
          const message = new Uint8Array(this._buffer);
          this._buffer = [];
          
          try {
            const unpacked = COBS.unpack(message);
            this._processMessage(unpacked);
          } catch (error) {
            log.error("Failed to process frame:", error);
          }
        }
      }
    }

    _processMessage(data) {
      if (data.length === 0) return;

      const messageType = data[0];
      log.proto("Processing message, type:", `0x${messageType.toString(16)}`);

      switch (messageType) {
        case MessageType.INFO_RESPONSE:
          log.proto("INFO_RESPONSE received");
          break;

        case MessageType.DEVICE_NOTIFICATION:
          this._handleDeviceNotification(data);
          break;

        case MessageType.CONSOLE_NOTIFICATION:
          const message = new TextDecoder().decode(data.slice(1));
          log.info("Console output:", message);
          this._replOutput += message;
          break;

        case MessageType.PROGRAM_FLOW_RESPONSE:
        case MessageType.PROGRAM_FLOW_NOTIFICATION:
          log.proto("Program flow message received");
          break;
      }
    }

    _handleDeviceNotification(data) {
      const payloadSize = (data[1] | (data[2] << 8));
      let offset = 3;

      while (offset < data.length) {
        const deviceType = data[offset];
        log.sensor("Device notification, type:", `0x${deviceType.toString(16)}`);

        switch (deviceType) {
          case DeviceMessageType.BATTERY:
            this._sensors.battery.level = data[offset + 1];
            log.sensor("Battery:", this._sensors.battery.level, "%");
            offset += 2;
            break;

          case DeviceMessageType.IMU_VALUES:
            {
              const yaw = (data[offset + 3] | (data[offset + 4] << 8));
              const pitch = (data[offset + 5] | (data[offset + 6] << 8));
              const roll = (data[offset + 7] | (data[offset + 8] << 8));
              
              this._sensors.imu.yaw = yaw > 32767 ? yaw - 65536 : yaw;
              this._sensors.imu.pitch = pitch > 32767 ? pitch - 65536 : pitch;
              this._sensors.imu.roll = roll > 32767 ? roll - 65536 : roll;
              
              log.verbose("IMU updated:", this._sensors.imu);
              offset += 21;
            }
            break;

          case DeviceMessageType.MOTOR:
            {
              const port = data[offset + 1];
              const position = (data[offset + 8] | (data[offset + 9] << 8) | 
                               (data[offset + 10] << 16) | (data[offset + 11] << 24));
              const speed = data[offset + 7];
              
              this._sensors.motors[port] = {
                position: position > 2147483647 ? position - 4294967296 : position,
                speed: speed > 127 ? speed - 256 : speed,
              };
              
              log.motor("Motor port", port, "updated:", this._sensors.motors[port]);
              offset += 12;
            }
            break;

          case DeviceMessageType.COLOR_SENSOR:
            {
              const port = data[offset + 1];
              this._sensors.colorSensors[port] = {
                color: data[offset + 2],
                red: (data[offset + 3] | (data[offset + 4] << 8)),
                green: (data[offset + 5] | (data[offset + 6] << 8)),
                blue: (data[offset + 7] | (data[offset + 8] << 8)),
              };
              log.sensor("Color sensor port", port, "updated");
              offset += 9;
            }
            break;

          case DeviceMessageType.DISTANCE_SENSOR:
            {
              const port = data[offset + 1];
              const distance = (data[offset + 2] | (data[offset + 3] << 8));
              this._sensors.distanceSensors[port] = distance;
              log.sensor("Distance sensor port", port, ":", distance, "mm");
              offset += 4;
            }
            break;

          case DeviceMessageType.FORCE_SENSOR:
            {
              const port = data[offset + 1];
              const value = data[offset + 2];
              const pressed = data[offset + 3] === 0x01;
              this._sensors.forceSensors[port] = { value, pressed };
              log.sensor("Force sensor port", port, "updated");
              offset += 4;
            }
            break;

          default:
            log.warn("Unknown device type:", `0x${deviceType.toString(16)}`);
            return;
        }
      }
    }

    // ========================================================================
    // MESSAGE SENDING
    // ========================================================================
    
    _send(message, useLimiter = true) {
      if (!this.isConnected()) {
        return Promise.resolve();
      }

      if (useLimiter && !this._rateLimiter.okayToSend()) {
        log.verbose("Rate limit - message queued");
        return Promise.resolve();
      }

      const packed = COBS.pack(message);
      const base64 = Base64Util.uint8ArrayToBase64(packed);
      
      log.proto("Sending message, size:", packed.length);
      
      return this._ble.write(SpikeBLE.service, SpikeBLE.rxChar, base64, "base64");
    }

    executeCode(code) {
      if (!this.isConnected()) {
        log.error("Cannot execute code: not connected");
        return Promise.resolve();
      }

      log.exec("Executing Python code:", code);
      
      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(code);
      
      const message = new Uint8Array(3 + codeBytes.length);
      message[0] = MessageType.TUNNEL_MESSAGE;
      message[1] = codeBytes.length & 0xFF;
      message[2] = (codeBytes.length >> 8) & 0xFF;
      message.set(codeBytes, 3);
      
      return this._send(message, true);
    }

    // ========================================================================
    // SENSOR ACCESSORS
    // ========================================================================
    
    getBattery() {
      return this._sensors.battery.level;
    }

    getIMU() {
      return this._sensors.imu;
    }

    getMotor(port) {
      return this._sensors.motors[port] || { position: 0, speed: 0 };
    }

    getSensor(type, port) {
      if (type === "color") return this._sensors.colorSensors[port];
      if (type === "distance") return this._sensors.distanceSensors[port];
      if (type === "force") return this._sensors.forceSensors[port];
      return null;
    }

    getReplOutput() {
      return this._replOutput;
    }

    clearReplOutput() {
      this._replOutput = "";
    }
  }

  // ============================================================================
  // CODE TRANSPILER
  // ============================================================================
  class SpikeTranspiler {
    constructor() {
      this.code = [];
      this.imports = new Set();
      this.indent = 0;
      this.movementMotors = { left: "A", right: "B" };
    }

    reset() {
      this.code = [];
      this.imports = new Set();
      this.indent = 0;
    }

    addImport(module) {
      this.imports.add(module);
    }

    addLine(line) {
      const spaces = "    ".repeat(this.indent);
      this.code.push(spaces + line);
    }

    increaseIndent() {
      this.indent++;
    }

    decreaseIndent() {
      this.indent = Math.max(0, this.indent - 1);
    }

    getCode() {
      const imports = Array.from(this.imports).sort().join("\n");
      const body = this.code.join("\n");
      return imports + "\n\n" + body;
    }

    // Basic transpilation - extend as needed
    transpileBlock(block, blocks) {
      // Add transpilation logic here
      log.transpile("Transpiling block:", block.opcode);
    }
  }

  // ============================================================================
  // MAIN EXTENSION CLASS
  // ============================================================================
  class SpikeExtension {
    constructor(runtime) {
      log.info("SpikeExtension constructor called");
      
      this._runtime = runtime;
      this._peripheral = new SpikePeripheral(runtime, "spikeprime");
      this._transpiler = new SpikeTranspiler();
      this._streamingMode = true;
      this._generatedCode = null;
      
      // Movement configuration
      this._movementMotors = { left: "A", right: "B" };
      this._movementSpeed = 50;
      
      // Register with runtime
      if (this._runtime) {
        this._runtime.registerPeripheralExtension("spikeprime", this);
      }
      
      log.info("SpikeExtension initialized");
    }

    getInfo() {
      return {
        id: "spikeprime",
        name: t("extensionName"),
        color1: "#FF661A",
        color2: "#FF5500",
        color3: "#CC4400",
        showStatusButton: true,
        blocks: this._getBlocks(),
        menus: this._getMenus(),
      };
    }

    scan() {
      this._peripheral.scan();
    }

    connect(id) {
      this._peripheral.connect(id);
    }

    disconnect() {
      this._peripheral.disconnect();
    }

    isConnected() {
      return this._peripheral.isConnected();
    }

    _getBlocks() {
      return [
        {
          blockType: BlockType.LABEL,
          text: t("connection"),
        },
        {
          opcode: "isConnected",
          text: t("isConnected"),
          blockType: BlockType.BOOLEAN,
        },
        {
          opcode: "getHubType",
          text: t("getHubType"),
          blockType: BlockType.REPORTER,
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("movement"),
        },
        {
          opcode: "setMovementMotors",
          text: t("setMovementMotors"),
          blockType: BlockType.COMMAND,
          arguments: {
            PORT_A: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
            PORT_B: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "B" },
          },
        },
        {
          opcode: "motorPairMove",
          text: t("steer"),
          blockType: BlockType.COMMAND,
          arguments: {
            STEERING: { type: ArgumentType.NUMBER, defaultValue: 0 },
          },
        },
        {
          opcode: "motorPairMoveForTime",
          text: t("moveForward"),
          blockType: BlockType.COMMAND,
          arguments: {
            DIRECTION: { type: ArgumentType.STRING, menu: "DIRECTION", defaultValue: "forward" },
            VALUE: { type: ArgumentType.NUMBER, defaultValue: 1 },
            UNIT: { type: ArgumentType.STRING, menu: "TIME_UNIT", defaultValue: "seconds" },
          },
        },
        {
          opcode: "stopMovement",
          text: t("stopMovement"),
          blockType: BlockType.COMMAND,
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("motors"),
        },
        {
          opcode: "motorRun",
          text: t("motorStart"),
          blockType: BlockType.COMMAND,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
            DIRECTION: { type: ArgumentType.STRING, menu: "DIRECTION", defaultValue: "forward" },
          },
        },
        {
          opcode: "motorRunForTime",
          text: t("motorRunFor"),
          blockType: BlockType.COMMAND,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
            DIRECTION: { type: ArgumentType.STRING, menu: "DIRECTION", defaultValue: "forward" },
            VALUE: { type: ArgumentType.NUMBER, defaultValue: 1 },
            UNIT: { type: ArgumentType.STRING, menu: "TIME_UNIT", defaultValue: "seconds" },
          },
        },
        {
          opcode: "motorStop",
          text: t("motorStop"),
          blockType: BlockType.COMMAND,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "getMotorPosition",
          text: t("getPosition"),
          blockType: BlockType.REPORTER,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "getMotorSpeed",
          text: t("getSpeed"),
          blockType: BlockType.REPORTER,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "resetMotorPosition",
          text: t("resetMotorPosition"),
          blockType: BlockType.COMMAND,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
            POSITION: { type: ArgumentType.NUMBER, defaultValue: 0 },
          },
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("display"),
        },
        {
          opcode: "displayShowImage",
          text: t("displayImage"),
          blockType: BlockType.COMMAND,
          arguments: {
            IMAGE: { type: ArgumentType.NUMBER, defaultValue: 1 },
          },
        },
        {
          opcode: "displayWrite",
          text: t("displayText"),
          blockType: BlockType.COMMAND,
          arguments: {
            TEXT: { type: ArgumentType.STRING, defaultValue: "Hi!" },
          },
        },
        {
          opcode: "displaySetPixel",
          text: t("setPixel"),
          blockType: BlockType.COMMAND,
          arguments: {
            X: { type: ArgumentType.NUMBER, defaultValue: 0 },
            Y: { type: ArgumentType.NUMBER, defaultValue: 0 },
            BRIGHTNESS: { type: ArgumentType.NUMBER, defaultValue: 100 },
          },
        },
        {
          opcode: "displayClear",
          text: t("displayClear"),
          blockType: BlockType.COMMAND,
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("sound"),
        },
        {
          opcode: "playBeep",
          text: t("playBeep"),
          blockType: BlockType.COMMAND,
          arguments: {
            FREQUENCY: { type: ArgumentType.NUMBER, defaultValue: 440 },
            DURATION: { type: ArgumentType.NUMBER, defaultValue: 500 },
          },
        },
        {
          opcode: "playNote",
          text: t("playNote"),
          blockType: BlockType.COMMAND,
          arguments: {
            NOTE: { type: ArgumentType.NUMBER, defaultValue: 60 },
            SECS: { type: ArgumentType.NUMBER, defaultValue: 0.5 },
          },
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("sensors"),
        },
        {
          opcode: "getColorSensorColor",
          text: t("getColor"),
          blockType: BlockType.REPORTER,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "getDistanceSensor",
          text: t("getDistance"),
          blockType: BlockType.REPORTER,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "getForceSensor",
          text: t("getForceSensor"),
          blockType: BlockType.REPORTER,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },
        {
          opcode: "isForceSensorPressed",
          text: t("isForceSensorPressed"),
          blockType: BlockType.BOOLEAN,
          arguments: {
            PORT: { type: ArgumentType.STRING, menu: "PORT", defaultValue: "A" },
          },
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("imu"),
        },
        {
          opcode: "getYaw",
          text: t("getYaw"),
          blockType: BlockType.REPORTER,
        },
        {
          opcode: "getPitch",
          text: t("getPitch"),
          blockType: BlockType.REPORTER,
        },
        {
          opcode: "getRoll",
          text: t("getRoll"),
          blockType: BlockType.REPORTER,
        },
        {
          opcode: "resetYaw",
          text: t("resetYaw"),
          blockType: BlockType.COMMAND,
        },
        {
          opcode: "presetYaw",
          text: t("presetYaw"),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: { type: ArgumentType.NUMBER, defaultValue: 0 },
          },
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("status"),
        },
        {
          opcode: "getBattery",
          text: t("getBatteryLevel"),
          blockType: BlockType.REPORTER,
        },

        "---",

        {
          blockType: BlockType.LABEL,
          text: t("python"),
        },
        {
          opcode: "runPythonCode",
          text: t("runPythonCode"),
          blockType: BlockType.COMMAND,
          arguments: {
            CODE: { type: ArgumentType.STRING, defaultValue: "print('Hello')" },
          },
        },
      ];
    }

    _getMenus() {
      return {
        PORT: {
          acceptReporters: true,
          items: ["A", "B", "C", "D", "E", "F"],
        },
        DIRECTION: {
          acceptReporters: true,
          items: [
            { text: t("forward"), value: "forward" },
            { text: t("backward"), value: "backward" },
          ],
        },
        TIME_UNIT: {
          acceptReporters: false,
          items: ["seconds", "rotations", "degrees"],
        },
      };
    }

    // ========================================================================
    // CONNECTION BLOCKS
    // ========================================================================

    isConnected() {
      return this._peripheral.isConnected();
    }

    getHubType() {
      return this._peripheral.getHubType();
    }

    // ========================================================================
    // MOVEMENT BLOCKS
    // ========================================================================

    setMovementMotors(args) {
      this._movementMotors.left = Cast.toString(args.PORT_A);
      this._movementMotors.right = Cast.toString(args.PORT_B);
      log.motor("Movement motors set:", this._movementMotors);
    }

    motorPairMove(args) {
      const steering = MathUtil.clamp(Cast.toNumber(args.STEERING), -100, 100);
      
      const code = `import motor_pair
from hub import port
motor_pair.unpair(motor_pair.PAIR_1)
motor_pair.pair(motor_pair.PAIR_1, port.${this._movementMotors.left}, port.${this._movementMotors.right})
motor_pair.move(motor_pair.PAIR_1, ${steering}, velocity=${this._movementSpeed * 10})`;
      
      return this._peripheral.executeCode(code);
    }

    motorPairMoveForTime(args) {
      const direction = Cast.toString(args.DIRECTION);
      const value = Cast.toNumber(args.VALUE);
      const unit = Cast.toString(args.UNIT);
      
      let timeMs = value * 1000;
      let speed = this._movementSpeed;
      
      if (direction === "backward") {
        speed = -Math.abs(speed);
      }
      
      const code = `import motor_pair, runloop
from hub import port
async def main():
    motor_pair.unpair(motor_pair.PAIR_1)
    motor_pair.pair(motor_pair.PAIR_1, port.${this._movementMotors.left}, port.${this._movementMotors.right})
    await motor_pair.move_for_time(motor_pair.PAIR_1, 0, ${timeMs}, velocity=${speed * 10})
runloop.run(main())`;
      
      return this._peripheral.executeCode(code);
    }

    stopMovement() {
      const code = `import motor_pair
from hub import port
motor_pair.unpair(motor_pair.PAIR_1)
motor_pair.pair(motor_pair.PAIR_1, port.${this._movementMotors.left}, port.${this._movementMotors.right})
motor_pair.stop(motor_pair.PAIR_1)`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // MOTOR BLOCKS
    // ========================================================================

    motorRun(args) {
      const port = Cast.toString(args.PORT);
      const direction = Cast.toString(args.DIRECTION);
      const speed = direction === "forward" ? 750 : -750;
      
      const code = `import motor
from hub import port
motor.run(port.${port}, ${speed})`;
      
      return this._peripheral.executeCode(code);
    }

    motorRunForTime(args) {
      const port = Cast.toString(args.PORT);
      const direction = Cast.toString(args.DIRECTION);
      const value = Cast.toNumber(args.VALUE);
      const unit = Cast.toString(args.UNIT);
      
      let speed = 750;
      if (direction === "backward") speed = -750;
      
      let timeMs = value * 1000;
      
      const code = `import motor, runloop
from hub import port
async def main():
    await motor.run_for_time(port.${port}, ${timeMs}, ${speed})
runloop.run(main())`;
      
      return this._peripheral.executeCode(code);
    }

    motorStop(args) {
      const port = Cast.toString(args.PORT);
      
      const code = `import motor
from hub import port
motor.stop(port.${port})`;
      
      return this._peripheral.executeCode(code);
    }

    resetMotorPosition(args) {
      const port = Cast.toString(args.PORT);
      const position = Cast.toNumber(args.POSITION);
      
      const code = `import motor
from hub import port
motor.reset_relative_position(port.${port}, ${position})`;
      
      return this._peripheral.executeCode(code);
    }

    getMotorPosition(args) {
      const port = SpikePort[Cast.toString(args.PORT)];
      const motor = this._peripheral.getMotor(port);
      return motor ? motor.position : 0;
    }

    getMotorSpeed(args) {
      const port = SpikePort[Cast.toString(args.PORT)];
      const motor = this._peripheral.getMotor(port);
      return motor ? motor.speed : 0;
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
      const freq = MathUtil.clamp(Cast.toNumber(args.FREQUENCY), 100, 10000);
      const time = Math.max(0, Cast.toNumber(args.DURATION));
      
      const code = `from hub import sound
sound.beep(${freq}, ${time}, 100)`;
      
      return this._peripheral.executeCode(code);
    }

    playNote(args) {
      const note = Cast.toNumber(args.NOTE);
      const secs = Cast.toNumber(args.SECS);
      const freq = Math.pow(2, (note - 69) / 12) * 440;
      
      const code = `from hub import sound
sound.beep(${Math.round(freq)}, ${secs * 1000}, 100)`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // SENSOR BLOCKS
    // ========================================================================

    getColorSensorColor(args) {
      const port = SpikePort[Cast.toString(args.PORT)];
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
      const port = SpikePort[Cast.toString(args.PORT)];
      const distance = this._peripheral.getSensor("distance", port);
      return distance !== null && distance !== undefined ? distance : -1;
    }

    getForceSensor(args) {
      const port = SpikePort[Cast.toString(args.PORT)];
      const sensor = this._peripheral.getSensor("force", port);
      return sensor ? sensor.value : 0;
    }

    isForceSensorPressed(args) {
      const port = SpikePort[Cast.toString(args.PORT)];
      const sensor = this._peripheral.getSensor("force", port);
      return sensor ? sensor.pressed : false;
    }

    // ========================================================================
    // IMU BLOCKS
    // ========================================================================

    getYaw() {
      return this._peripheral.getIMU().yaw / 10;
    }

    getPitch() {
      return this._peripheral.getIMU().pitch / 10;
    }

    getRoll() {
      return this._peripheral.getIMU().roll / 10;
    }

    resetYaw() {
      const code = `from hub import motion_sensor
motion_sensor.reset_yaw(0)`;
      
      return this._peripheral.executeCode(code);
    }

    presetYaw(args) {
      const angle = Cast.toNumber(args.ANGLE);
      
      const code = `from hub import motion_sensor
motion_sensor.reset_yaw(${angle})`;
      
      return this._peripheral.executeCode(code);
    }

    // ========================================================================
    // STATUS BLOCKS
    // ========================================================================

    getBattery() {
      return this._peripheral.getBattery();
    }

    // ========================================================================
    // PYTHON BLOCKS
    // ========================================================================

    runPythonCode(args) {
      const code = Cast.toString(args.CODE);
      return this._peripheral.executeCode(code);
    }
  }

  Scratch.extensions.register(new SpikeExtension());
  log.info("🎉 Extension registered successfully!");
})(Scratch);