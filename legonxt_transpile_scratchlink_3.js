(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("NXT extension must run unsandboxed");
  }

  const Cast = Scratch.Cast;

  console.log("🧱 [LEGO NXT] Extension loading...");

  // ==================== i18n SUPPORT ====================

  const translations = {
    en: {
      // Connection
      "legonxt.connect": "connect to NXT",
      "legonxt.disconnect": "disconnect from NXT",
      "legonxt.isConnected": "connected to NXT?",

      // Motors
      "legonxt.motorOn": "motor [PORT] power [POWER]",
      "legonxt.motorRunDegrees": "motor [PORT] power [POWER] for [DEGREES]°",
      "legonxt.motorRunRotations":
        "motor [PORT] power [POWER] for [ROTATIONS] rotations",
      "legonxt.motorStop": "stop motor [PORT] [ACTION]",
      "legonxt.getMotorPosition": "motor [PORT] position",
      "legonxt.resetMotorPosition": "reset motor [PORT] position",

      // Advanced Motors
      "legonxt.getMotorPower": "motor [PORT] power",
      "legonxt.getMotorMode": "motor [PORT] mode",
      "legonxt.getMotorRegulationMode": "motor [PORT] regulation mode",
      "legonxt.getMotorTurnRatio": "motor [PORT] turn ratio",
      "legonxt.getMotorRunState": "motor [PORT] run state",
      "legonxt.getMotorTachoLimit": "motor [PORT] tacho limit",
      "legonxt.getMotorTachoCount": "motor [PORT] tacho count",
      "legonxt.getMotorBlockTachoCount": "motor [PORT] block tacho count",
      "legonxt.getMotorRotationCount": "motor [PORT] rotation count",

      // Touch Sensor
      "legonxt.setupTouchSensorNXT": "setup touch sensor on [PORT]",
      "legonxt.isTouchPressed": "touch sensor [PORT] pressed?",

      // Light Sensor
      "legonxt.setupLightSensor": "setup light sensor on [PORT] LED [STATE]",
      "legonxt.getLightLevel": "light level on [PORT]",

      // Color Sensor
      "legonxt.setupColorSensor": "setup color sensor on [PORT] mode [MODE]",
      "legonxt.getColor": "color detected on [PORT]",

      // Sound Sensor
      "legonxt.setupSoundSensor": "setup sound sensor on [PORT] mode [MODE]",
      "legonxt.getSoundLevel": "sound level on [PORT]",

      // Ultrasonic Sensor
      "legonxt.setupUltrasonicSensor": "setup ultrasonic sensor on [PORT]",
      "legonxt.getDistance": "distance on [PORT] (cm)",

      // Advanced Sensors
      "legonxt.getSensorPort": "sensor [PORT] port number",
      "legonxt.getSensorValid": "sensor [PORT] valid?",
      "legonxt.getSensorCalibrated": "sensor [PORT] calibrated?",
      "legonxt.getSensorType": "sensor [PORT] type",
      "legonxt.getSensorMode": "sensor [PORT] mode",
      "legonxt.getSensorRawValue": "sensor [PORT] raw value",
      "legonxt.getSensorNormalizedValue": "sensor [PORT] normalized value",
      "legonxt.getSensorScaledValue": "sensor [PORT] scaled value",
      "legonxt.getSensorCalibratedValue": "sensor [PORT] calibrated value",

      // Sound
      "legonxt.playTone": "play tone [FREQ] Hz for [MS] ms",
      "legonxt.playNote": "play note [NOTE] for [BEATS] beats",

      // Display
      "legonxt.captureScreen": "capture screen from NXT",
      "legonxt.clearScreen": "clear screen",
      "legonxt.updateDisplay": "update display",
      "legonxt.drawText": "draw text [TEXT] at x:[X] y:[Y]",
      "legonxt.drawPixel": "draw pixel at x:[X] y:[Y] [STATE]",
      "legonxt.drawLine": "draw line from x1:[X1] y1:[Y1] to x2:[X2] y2:[Y2]",
      "legonxt.drawRect": "draw rectangle at x:[X] y:[Y] w:[W] h:[H] [FILL]",
      "legonxt.drawCircle": "draw circle at x:[X] y:[Y] radius:[R] [FILL]",
      "legonxt.drawPattern": "draw pattern [PATTERN]",

      // Status
      "legonxt.getBattery": "battery level (mV)",
      "legonxt.getRawSensorValue": "raw value of sensor [PORT]",

      // Sprite State
      "legonxt.spriteGetX": "sprite [SPRITE] x position",
      "legonxt.spriteGetY": "sprite [SPRITE] y position",
      "legonxt.spriteGetSize": "sprite [SPRITE] size",
      "legonxt.spriteGetVisible": "sprite [SPRITE] visible?",
      "legonxt.spriteSetPosition":
        "set sprite [SPRITE] position to x:[X] y:[Y]",
      "legonxt.spriteSetSize": "set sprite [SPRITE] size to [SIZE]",
      "legonxt.spriteSetVisible": "set sprite [SPRITE] visible [VISIBLE]",

      // Code Generation
      "legonxt.transpileProject": "transpile project to NXC",
      "legonxt.showNXCCode": "show generated NXC code",
      "legonxt.downloadNXC": "download as .nxc file",
      "legonxt.compileToRXE": "compile NXC to .rxe",
      "legonxt.uploadToNXT": "upload program to NXT",
      "legonxt.fullWorkflow": "🚀 transpile → compile → upload",

      // Device Info
      "legonxt.getDeviceName": "NXT name",
      "legonxt.getBluetoothAddress": "Bluetooth address",
      "legonxt.getFreeFlash": "free flash memory",
      "legonxt.getSignalStrength": "Bluetooth signal strength",

      // Mailbox
      "legonxt.sendMessage": "send message [MSG] to mailbox [BOX]",
      "legonxt.receiveMessage": "read message from mailbox [BOX] [REMOVE]",

      // Low-level I2C
      "legonxt.getLowSpeedStatus": "I2C bytes ready on [PORT]",

      // Program Control
      "legonxt.startProgram": "start program [FILENAME] on NXT",
      "legonxt.stopProgram": "stop running program on NXT",
      "legonxt.keepAlive": "keep NXT awake",
      "legonxt.getCurrentProgram": "current running program",

      // Section Labels
      "legonxt.connection": "🔌 CONNECTION",
      "legonxt.motors": "⚙️ MOTORS",
      "legonxt.advancedMotors": "⚙️ ADVANCED MOTORS",
      "legonxt.touchSensor": "🔘 TOUCH SENSOR",
      "legonxt.lightSensor": "💡 LIGHT SENSOR",
      "legonxt.colorSensor": "🎨 COLOR SENSOR",
      "legonxt.soundSensor": "🔊 SOUND SENSOR",
      "legonxt.ultrasonicSensor": "📏 ULTRASONIC SENSOR",
      "legonxt.advancedSensors": "🔬 ADVANCED SENSORS",
      "legonxt.sound": "🎵 SOUND",
      "legonxt.display": "🖥️ DISPLAY",
      "legonxt.status": "📊 STATUS",
      "legonxt.spriteState": "👻 SPRITE STATE",
      "legonxt.codeGeneration": "💾 CODE GENERATION",
      "legonxt.deviceInfo": "📱 DEVICE INFO",
      "legonxt.mailbox": "📬 MAILBOX (MESSAGES)",
      "legonxt.lowLevelI2C": "🔧 LOW-LEVEL I2C",
      "legonxt.programControl": "🎮 PROGRAM CONTROL",
    },
    de: {
      // German translations
      "legonxt.connect": "Mit NXT verbinden",
      "legonxt.disconnect": "Von NXT trennen",
      "legonxt.isConnected": "Mit NXT verbunden?",
      "legonxt.motorOn": "Motor [PORT] Leistung [POWER]",
      "legonxt.connection": "🔌 VERBINDUNG",
      "legonxt.motors": "⚙️ MOTOREN",
      // ... add more German translations as needed
    },
  };

  let currentLocale = "en";

  function formatMessage(id) {
    const lang = translations[currentLocale] || translations.en;
    return lang[id] || translations.en[id] || id;
  }

  // ==================== DEBUG LOGGER ====================

  class DebugLogger {
    constructor(prefix = "LEGO NXT") {
      this.prefix = prefix;
      this.verbose = true;
      this.logLevel = {
        DEBUG: 0,
        INFO: 1,
        SUCCESS: 2,
        WARN: 3,
        ERROR: 4,
      };
      this.currentLevel = this.logLevel.DEBUG;
    }

    setVerbosity(enabled) {
      this.verbose = enabled;
    }

    setLogLevel(level) {
      this.currentLevel = this.logLevel[level] || this.logLevel.DEBUG;
    }

    debug(message, ...args) {
      if (this.verbose && this.currentLevel <= this.logLevel.DEBUG) {
        console.debug(`[${this.prefix}] 🔍 ${message}`, ...args);
      }
    }

    log(message, ...args) {
      if (this.verbose && this.currentLevel <= this.logLevel.INFO) {
        console.log(`[${this.prefix}] ${message}`, ...args);
      }
    }

    error(message, ...args) {
      if (this.currentLevel <= this.logLevel.ERROR) {
        console.error(`[${this.prefix}] ❌ ${message}`, ...args);
      }
    }

    success(message, ...args) {
      if (this.verbose && this.currentLevel <= this.logLevel.SUCCESS) {
        console.log(`[${this.prefix}] ✅ ${message}`, ...args);
      }
    }

    warn(message, ...args) {
      if (this.verbose && this.currentLevel <= this.logLevel.WARN) {
        console.warn(`[${this.prefix}] ⚠️ ${message}`, ...args);
      }
    }

    info(message, ...args) {
      if (this.verbose && this.currentLevel <= this.logLevel.INFO) {
        console.info(`[${this.prefix}] ℹ️ ${message}`, ...args);
      }
    }

    group(title) {
      if (this.verbose) {
        console.group(`[${this.prefix}] ${title}`);
      }
    }

    groupEnd() {
      if (this.verbose) {
        console.groupEnd();
      }
    }

    table(data) {
      if (this.verbose) {
        console.table(data);
      }
    }
  }

  const logger = new DebugLogger();

  // ==================== UTILITY FUNCTIONS ====================

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

  // ==================== JSONRPC CLASS ====================

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
      const request = { jsonrpc: "2.0", method, params };
      if (id !== null && typeof id !== "undefined") {
        request.id = id;
      }
      this._sendMessage(request);
    }

    _handleMessage(json) {
      if (json.jsonrpc !== "2.0") {
        throw new Error(
          `Bad or missing JSON-RPC version in message: ${JSON.stringify(json)}`,
        );
      }
      if (Object.prototype.hasOwnProperty.call(json, "method")) {
        this._handleRequest(json);
      } else {
        this._handleResponse(json);
      }
    }

    _sendResponse(id, result, error) {
      const response = { jsonrpc: "2.0", id };
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

  // ==================== BT CLASS ====================

  class BT extends JSONRPC {
    constructor(
      runtime,
      extensionId,
      peripheralOptions,
      connectCallback,
      resetCallback = null,
      messageCallback,
    ) {
      super();
      this._socket = runtime.getScratchLinkSocket("BT");
      this._socket.setOnOpen(this.requestPeripheral.bind(this));
      this._socket.setOnClose(this.handleDisconnectError.bind(this));
      this._socket.setOnError(this._handleRequestError.bind(this));
      this._socket.setHandleMessage(this._handleMessage.bind(this));
      this._sendMessage = this._socket.sendMessage.bind(this._socket);
      this._availablePeripherals = {};
      this._connectCallback = connectCallback;
      this._connected = false;
      this._resetCallback = resetCallback;
      this._discoverTimeoutID = null;
      this._extensionId = extensionId;
      this._peripheralOptions = peripheralOptions;
      this._messageCallback = messageCallback;
      this._runtime = runtime;
      this._socket.open();
    }

    requestPeripheral() {
      this._availablePeripherals = {};
      if (this._discoverTimeoutID) window.clearTimeout(this._discoverTimeoutID);
      this._discoverTimeoutID = window.setTimeout(
        this._handleDiscoverTimeout.bind(this),
        15000,
      );
      this.sendRemoteRequest("discover", this._peripheralOptions).catch((e) =>
        this._handleRequestError(e),
      );
    }

    connectPeripheral(id, pin = null) {
      const params = { peripheralId: id };
      if (pin) params.pin = pin;
      this.sendRemoteRequest("connect", params)
        .then(() => {
          this._connected = true;
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
          this._connectCallback();
        })
        .catch((e) => this._handleRequestError(e));
    }

    disconnect() {
      if (this._connected) this._connected = false;
      if (this._socket.isOpen()) this._socket.close();
      if (this._discoverTimeoutID) window.clearTimeout(this._discoverTimeoutID);
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }

    isConnected() {
      return this._connected;
    }

    sendMessage(options) {
      return this.sendRemoteRequest("send", options).catch((e) =>
        this.handleDisconnectError(e),
      );
    }

    didReceiveCall(method, params) {
      switch (method) {
        case "didDiscoverPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
            this._availablePeripherals,
          );
          if (this._discoverTimeoutID)
            window.clearTimeout(this._discoverTimeoutID);
          break;
        case "userDidPickPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.USER_PICKED_PERIPHERAL,
            this._availablePeripherals,
          );
          if (this._discoverTimeoutID)
            window.clearTimeout(this._discoverTimeoutID);
          break;
        case "userDidNotPickPeripheral":
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
          if (this._discoverTimeoutID)
            window.clearTimeout(this._discoverTimeoutID);
          break;
        case "didReceiveMessage":
          if (this._messageCallback) this._messageCallback(params);
          break;
        case "ping":
          return 42;
      }
    }

    handleDisconnectError(/* e */) {
      if (!this._connected) return;
      this.disconnect();
      if (this._resetCallback) this._resetCallback();
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
      if (this._discoverTimeoutID) window.clearTimeout(this._discoverTimeoutID);
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
  }

  // ==================== NXT PROTOCOL CONSTANTS ====================

  const NXT_OPCODE = {
    DIRECT_CMD: 0x00,
    DIRECT_CMD_NO_REPLY: 0x80,
    SYSTEM_CMD: 0x01,
    SYSTEM_CMD_NO_REPLY: 0x81,
    REPLY: 0x02,
    START_PROGRAM: 0x00,
    STOP_PROGRAM: 0x01,
    PLAY_SOUND_FILE: 0x02,
    PLAY_TONE: 0x03,
    SET_OUT_STATE: 0x04,
    SET_IN_MODE: 0x05,
    GET_OUT_STATE: 0x06,
    GET_IN_VALS: 0x07,
    RESET_IN_VAL: 0x08,
    MESSAGE_WRITE: 0x09,
    RESET_POSITION: 0x0a,
    GET_BATT_LVL: 0x0b,
    STOP_SOUND: 0x0c,
    KEEP_ALIVE: 0x0d,
    LS_GET_STATUS: 0x0e,
    LS_WRITE: 0x0f,
    LS_READ: 0x10,
    GET_CURR_PROGRAM: 0x11,
    MESSAGE_READ: 0x13,
    OPEN_READ: 0x80,
    OPEN_WRITE: 0x81,
    READ: 0x82,
    WRITE: 0x83,
    CLOSE: 0x84,
    DELETE: 0x85,
    FIND_FIRST: 0x86,
    FIND_NEXT: 0x87,
    GET_FIRMWARE_VERSION: 0x88,
    OPEN_WRITE_LINEAR: 0x89,
    OPEN_WRITE_DATA: 0x8b,
    FIND_FIRST_MODULE: 0x90,
    FIND_NEXT_MODULE: 0x91,
    CLOSE_MODULE_HANDLE: 0x92,
    READ_IO_MAP: 0x94,
    WRITE_IO_MAP: 0x95,
    BOOT_CMD: 0x97,
    SET_BRICK_NAME: 0x98,
    GET_DEVICE_INFO: 0x9b,
  };

  const NXT_ERROR = {
    0x00: "Success",
    0x20: "Pending communication transaction in progress",
    0x40: "Specified mailbox queue is empty",
    0x81: "No more handles",
    0x82: "No space",
    0x83: "No more files",
    0x84: "End of file expected",
    0x85: "End of file",
    0x86: "Not a linear file",
    0x87: "File not found",
    0x88: "Handle already closed",
    0x89: "No linear space",
    0x8a: "Undefined error",
    0x8b: "File is busy",
    0x8c: "No write buffers",
    0x8d: "Append not possible",
    0x8e: "File is full",
    0x8f: "File exists",
    0x90: "Module not found",
    0x91: "Out of bounds",
    0x92: "Illegal file name",
    0x93: "Illegal handle",
    0xbd: "Request failed (i.e. specified file not found)",
    0xbe: "Unknown command opcode",
    0xbf: "Insane packet",
    0xc0: "Data contains out-of-range values",
    0xdd: "Communication bus error",
    0xde: "No free memory in communication buffer",
    0xdf: "Specified channel/connection is not valid",
    0xe0: "Specified channel/connection not configured or busy",
    0xec: "No active program",
    0xed: "Illegal size specified",
    0xee: "Illegal mailbox queue ID specified",
    0xef: "Attempted to access invalid field of a structure",
    0xf0: "Bad input or output specified",
    0xfb: "Insufficient memory available",
    0xff: "Bad arguments",
  };

  const PORT = {
    A: 0,
    B: 1,
    C: 2,
    S1: 0,
    S2: 1,
    S3: 2,
    S4: 3,
  };

  const MOTOR_MODE = {
    IDLE: 0x00,
    ON: 0x01,
    BRAKE: 0x02,
    REGULATED: 0x04,
    ON_REGULATED: 0x01 | 0x04,
    ON_BRAKE: 0x01 | 0x02,
    ON_BRAKE_REGULATED: 0x01 | 0x02 | 0x04,
  };

  const REGULATION_MODE = {
    IDLE: 0x00,
    SPEED: 0x01,
    SYNC: 0x02,
  };

  const RUN_STATE = {
    IDLE: 0x00,
    RAMP_UP: 0x10,
    RUNNING: 0x20,
    RAMP_DOWN: 0x40,
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
    LOW_SPEED: 0x0a,
    LOW_SPEED_9V: 0x0b,
    COLOR_FULL: 0x0d,
    COLOR_RED: 0x0e,
    COLOR_GREEN: 0x0f,
    COLOR_BLUE: 0x10,
    COLOR_NONE: 0x11,
    NO_OF_SENSOR_TYPES: 0x0c,
  };

  const SENSOR_MODE = {
    RAW: 0x00,
    BOOL: 0x20,
    TRANSITION_CNT: 0x40,
    PERIOD_COUNTER: 0x60,
    PCT_FULL_SCALE: 0x80,
    CELSIUS: 0xa0,
    FAHRENHEIT: 0xc0,
    ANGLE_STEPS: 0xe0,
    SLOPE_MASK: 0x1f,
    MODE_MASK: 0xe0,
  };

  const MODULE_DISPLAY = 0xa0001;
  const DISPLAY_OFFSET = 119;
  const DISPLAY_WIDTH = 100;
  const DISPLAY_HEIGHT = 64;
  const DISPLAY_BUFFER_SIZE = 800;

  const NXT_BT_SEND_RATE_MAX = 40;
  const NXT_PAIRING_PIN = "1234";

  const FONT_5X7 = {
    " ": [0x00, 0x00, 0x00, 0x00, 0x00],
    A: [0x7c, 0x12, 0x11, 0x12, 0x7c],
    B: [0x7f, 0x49, 0x49, 0x49, 0x36],
    C: [0x3e, 0x41, 0x41, 0x41, 0x22],
    D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
    E: [0x7f, 0x49, 0x49, 0x49, 0x41],
    F: [0x7f, 0x09, 0x09, 0x09, 0x01],
    G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
    H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
    I: [0x00, 0x41, 0x7f, 0x41, 0x00],
    J: [0x20, 0x40, 0x41, 0x3f, 0x01],
    K: [0x7f, 0x08, 0x14, 0x22, 0x41],
    L: [0x7f, 0x40, 0x40, 0x40, 0x40],
    M: [0x7f, 0x02, 0x0c, 0x02, 0x7f],
    N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
    O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
    P: [0x7f, 0x09, 0x09, 0x09, 0x06],
    Q: [0x3e, 0x41, 0x51, 0x21, 0x5e],
    R: [0x7f, 0x09, 0x19, 0x29, 0x46],
    S: [0x46, 0x49, 0x49, 0x49, 0x31],
    T: [0x01, 0x01, 0x7f, 0x01, 0x01],
    U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
    V: [0x1f, 0x20, 0x40, 0x20, 0x1f],
    W: [0x3f, 0x40, 0x38, 0x40, 0x3f],
    X: [0x63, 0x14, 0x08, 0x14, 0x63],
    Y: [0x07, 0x08, 0x70, 0x08, 0x07],
    Z: [0x61, 0x51, 0x49, 0x45, 0x43],
    0: [0x3e, 0x51, 0x49, 0x45, 0x3e],
    1: [0x00, 0x42, 0x7f, 0x40, 0x00],
    2: [0x42, 0x61, 0x51, 0x49, 0x46],
    3: [0x21, 0x41, 0x45, 0x4b, 0x31],
    4: [0x18, 0x14, 0x12, 0x7f, 0x10],
    5: [0x27, 0x45, 0x45, 0x45, 0x39],
    6: [0x3c, 0x4a, 0x49, 0x49, 0x30],
    7: [0x01, 0x71, 0x09, 0x05, 0x03],
    8: [0x36, 0x49, 0x49, 0x49, 0x36],
    9: [0x06, 0x49, 0x49, 0x29, 0x1e],
    "!": [0x00, 0x00, 0x5f, 0x00, 0x00],
    "?": [0x02, 0x01, 0x51, 0x09, 0x06],
    ".": [0x00, 0x60, 0x60, 0x00, 0x00],
    ",": [0x00, 0x80, 0x60, 0x00, 0x00],
    ":": [0x00, 0x36, 0x36, 0x00, 0x00],
    ";": [0x00, 0x80, 0x36, 0x00, 0x00],
    "-": [0x08, 0x08, 0x08, 0x08, 0x08],
    "+": [0x08, 0x08, 0x3e, 0x08, 0x08],
    "=": [0x14, 0x14, 0x14, 0x14, 0x14],
    "/": [0x20, 0x10, 0x08, 0x04, 0x02],
    "\\": [0x02, 0x04, 0x08, 0x10, 0x20],
    "*": [0x14, 0x08, 0x3e, 0x08, 0x14],
    "(": [0x00, 0x1c, 0x22, 0x41, 0x00],
    ")": [0x00, 0x41, 0x22, 0x1c, 0x00],
    "[": [0x00, 0x7f, 0x41, 0x41, 0x00],
    "]": [0x00, 0x41, 0x41, 0x7f, 0x00],
    "{": [0x00, 0x08, 0x36, 0x41, 0x00],
    "}": [0x00, 0x41, 0x36, 0x08, 0x00],
    "#": [0x14, 0x7f, 0x14, 0x7f, 0x14],
    $: [0x24, 0x2a, 0x7f, 0x2a, 0x12],
    "%": [0x23, 0x13, 0x08, 0x64, 0x62],
    "&": [0x36, 0x49, 0x56, 0x20, 0x50],
    "<": [0x08, 0x14, 0x22, 0x41, 0x00],
    ">": [0x00, 0x41, 0x22, 0x14, 0x08],
    "'": [0x00, 0x00, 0x07, 0x00, 0x00],
    '"': [0x00, 0x07, 0x00, 0x07, 0x00],
    "`": [0x00, 0x01, 0x02, 0x00, 0x00],
    "~": [0x04, 0x02, 0x04, 0x08, 0x04],
    _: [0x40, 0x40, 0x40, 0x40, 0x40],
    "|": [0x00, 0x00, 0x7f, 0x00, 0x00],
  };

  // ==================== NXC TRANSPILER ====================

  class NXCTranspiler {
    constructor() {
      this.code = [];
      this.indent = 0;
      this.variables = new Map();
      this.broadcasts = [];
      this.scriptCounter = 1;
      this.mainScripts = [];
      this.sensorSetup = new Set();
      this.spriteStates = {}; // Track sprite states for transpilation
      this.logger = new DebugLogger("Transpiler");
      this.activeSpriteName = "figur1";
    }

    reset() {
      this.logger.log("Resetting transpiler state");
      this.code = [];
      this.indent = 0;
      this.variables.clear();
      this.broadcasts = [];
      this.scriptCounter = 1;
      this.mainScripts = [];
      this.sensorSetup.clear();
      this.spriteStates = {};
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
      return this.code.join("\n");
    }

    sanitizeName(name) {
      if (!name) {
        this.logger.warn("sanitizeName called with empty name");
        return "unnamed";
      }

      this.logger.debug(`Sanitizing name: "${name}"`);

      // Remove any existing "sprite_" prefix first (case-insensitive)
      let cleanName = name.replace(/^sprite_/i, "");

      // Convert to lowercase and replace invalid characters
      let sanitized = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "_");

      // Remove consecutive underscores
      sanitized = sanitized.replace(/_+/g, "_");

      // Remove leading/trailing underscores
      sanitized = sanitized.replace(/^_+|_+$/g, "");

      // If empty, use default
      if (!sanitized) {
        sanitized = "unnamed";
      }

      // If starts with number, prefix with v_
      if (/^[0-9]/.test(sanitized)) {
        sanitized = "v_" + sanitized;
      }

      this.logger.debug(`  Result: "${name}" → "${sanitized}"`);
      return sanitized;
    }

    isNumeric(value) {
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        return !isNaN(value) && !isNaN(parseFloat(value));
      }
      return false;
    }

    getFieldValue(block, fieldName) {
      this.logger.debug(
        `Getting field "${fieldName}" from block ${block.opcode}`,
      );

      if (block.fields && block.fields[fieldName]) {
        const field = block.fields[fieldName];
        const value = field.value || field.id || field.name;

        this.logger.debug(`  Raw field value: ${value}`);

        // FIX: Map broadcast IDs to names
        if (
          (fieldName === "BROADCAST_OPTION" ||
            fieldName === "BROADCAST_INPUT") &&
          this.broadcastMap &&
          this.broadcastMap[value]
        ) {
          const mappedName = this.broadcastMap[value];
          this.logger.success(
            `  ✓ Mapped broadcast field: ${value} → "${mappedName}"`,
          );
          return mappedName; // ✅ Return mapped name
        }

        return value;
      }

      this.logger.warn(`  ⚠️ Field "${fieldName}" not found`);
      return null;
    }

    getSubstackId(block, substackName) {
      const substack = block.inputs[substackName];
      if (!substack) return null;

      if (typeof substack === "object" && !Array.isArray(substack)) {
        return substack.block || null;
      }

      if (Array.isArray(substack) && substack.length >= 2) {
        return substack[1];
      }

      return null;
    }

    convertPortToNumber(port) {
      // Convert Scratch port format to NXC IN_N format
      // S1 → IN_1, S2 → IN_2, etc.

      let portNum = port;

      // Remove 'S' prefix if present
      if (typeof port === "string" && port.startsWith("S")) {
        portNum = port.substring(1);
      }

      // Convert 0-based to 1-based (if needed)
      const num = parseInt(portNum, 10);
      if (num === 0) return "1";

      return String(num);
    }

    getInputValue(block, inputName, blocks) {
      this.logger.debug(
        `Getting input "${inputName}" from block ${block.opcode}`,
      );

      const input = block.inputs[inputName];
      if (!input) {
        this.logger.warn(`❌ Missing input: ${inputName}`);
        return "0";
      }

      // ========== NEW: Special handling for BROADCAST_INPUT ==========
      if (inputName === "BROADCAST_INPUT") {
        // Try to get broadcast ID from field first
        if (block.fields && block.fields.BROADCAST_OPTION) {
          const broadcastId =
            block.fields.BROADCAST_OPTION.value ||
            block.fields.BROADCAST_OPTION.id;

          if (this.broadcastMap && this.broadcastMap[broadcastId]) {
            const name = this.broadcastMap[broadcastId];
            this.logger.success(
              `✓ Broadcast via field: ${broadcastId} → "${name}"`,
            );
            return `"${name}"`;
          }
        }
      }
      // ================================================================

      this.logger.debug(
        `Input type: ${typeof input}, isArray: ${Array.isArray(input)}`,
      );
      this.logger.debug(`Input structure:`, input);

      // ==================== HANDLE OBJECT-STYLE INPUTS (NEW SCRATCH FORMAT) ====================
      if (typeof input === "object" && !Array.isArray(input)) {
        this.logger.debug(`Processing object-style input for "${inputName}"`);

        // Try to resolve the main block reference first
        if (input.block) {
          this.logger.debug(`Found block reference: ${input.block}`);
          const refBlock = blocks._blocks[input.block];
          if (refBlock) {
            this.logger.debug(
              `Evaluating referenced block: ${refBlock.opcode}`,
            );
            const result = this.evaluateBlock(refBlock, blocks);
            this.logger.success(
              `✓ Resolved "${inputName}" via block reference → ${result}`,
            );
            return result;
          } else {
            this.logger.warn(
              `⚠️ Block reference ${input.block} not found in blocks._blocks`,
            );
          }
        }

        // Try shadow block as fallback
        if (input.shadow) {
          this.logger.debug(`Found shadow block: ${input.shadow}`);
          const shadowBlock = blocks._blocks[input.shadow];
          if (shadowBlock) {
            this.logger.debug(`Shadow block opcode: ${shadowBlock.opcode}`);

            // SPECIAL HANDLING: Broadcast variables/menus
            if (
              shadowBlock.opcode === "data_variable" ||
              shadowBlock.opcode === "event_broadcast_menu"
            ) {
              this.logger.debug(`Detected broadcast variable/menu in shadow`);

              const varId =
                this.getFieldValue(shadowBlock, "BROADCAST_OPTION") ||
                this.getFieldValue(shadowBlock, "VARIABLE");

              this.logger.debug(`Broadcast ID: ${varId}`);

              if (this.broadcastMap && this.broadcastMap[varId]) {
                const name = this.broadcastMap[varId];
                this.logger.success(`✓ Mapped broadcast ${varId} → "${name}"`);
                return `"${name}"`;
              } else {
                this.logger.warn(
                  `⚠️ Broadcast ID ${varId} not in broadcastMap, using as-is`,
                );
                return `"${varId}"`;
              }
            }

            // Standard shadow block evaluation
            const result = this.evaluateBlock(shadowBlock, blocks);
            this.logger.success(
              `✓ Resolved "${inputName}" via shadow block → ${result}`,
            );
            return result;
          } else {
            this.logger.warn(`⚠️ Shadow block ${input.shadow} not found`);
          }
        }

        this.logger.warn(
          `❌ Could not resolve object-style input "${inputName}"`,
        );
        return "0";
      }

      // ==================== HANDLE ARRAY-STYLE INPUTS (OLD SCRATCH FORMAT) ====================
      if (!Array.isArray(input)) {
        this.logger.error(
          `❌ Input is neither object nor array for "${inputName}"`,
        );
        return "0";
      }

      const inputType = input[0];
      const inputData = input[1];

      this.logger.debug(
        `Array-style input: type=${inputType}, data type=${typeof inputData}`,
      );

      // Type 1, 2, 3 = Block inputs with optional shadows
      if (inputType === 1 || inputType === 2 || inputType === 3) {
        this.logger.debug(`Processing input type ${inputType}`);

        // ===== CASE 1: Input data is a primitive array =====
        if (Array.isArray(inputData)) {
          const primitiveType = inputData[0];
          const primitiveValue = inputData[1];

          this.logger.debug(
            `Primitive: type=${primitiveType}, value="${primitiveValue}"`,
          );

          // Number primitives (4=number, 5=positive, 6=integer, 7=angle)
          if (
            primitiveType === 4 ||
            primitiveType === 5 ||
            primitiveType === 6 ||
            primitiveType === 7
          ) {
            this.logger.success(`✓ Number primitive: ${primitiveValue}`);
            return String(primitiveValue);
          }
          // String/variable primitive (10)
          else if (primitiveType === 10) {
            if (this.isNumeric(primitiveValue)) {
              this.logger.success(`✓ Numeric string: ${primitiveValue}`);
              return String(primitiveValue);
            }

            // Check if it's a broadcast ID
            if (this.broadcastMap && this.broadcastMap[primitiveValue]) {
              const name = this.broadcastMap[primitiveValue];
              this.logger.success(
                `✓ Mapped broadcast in primitive: ${primitiveValue} → "${name}"`,
              );
              return `"${name}"`;
            }

            this.logger.success(`✓ String primitive: "${primitiveValue}"`);
            return '"' + primitiveValue + '"';
          }
          // Broadcast primitive (11) - Scratch 3.0 specific
          else if (primitiveType === 11) {
            this.logger.debug(
              `Broadcast primitive detected: ${primitiveValue}`,
            );

            // Extract ID and name
            const broadcastId = inputData[1];
            const broadcastName = inputData[2];

            if (this.broadcastMap && this.broadcastMap[broadcastId]) {
              const mappedName = this.broadcastMap[broadcastId];
              this.logger.success(
                `✓ Mapped broadcast primitive: ${broadcastId} → "${mappedName}"`,
              );
              return `"${mappedName}"`;
            } else if (broadcastName) {
              this.logger.success(
                `✓ Using broadcast name from primitive: "${broadcastName}"`,
              );
              return `"${broadcastName}"`;
            } else {
              this.logger.warn(
                `⚠️ Broadcast primitive ${broadcastId} not mapped, using ID`,
              );
              return `"${broadcastId}"`;
            }
          }
        }

        // ===== CASE 2: Input data is a block ID string =====
        else if (typeof inputData === "string") {
          this.logger.debug(`Input data is block ID: ${inputData}`);
          const refBlock = blocks._blocks[inputData];
          if (refBlock) {
            this.logger.debug(
              `Evaluating referenced block: ${refBlock.opcode}`,
            );
            const result = this.evaluateBlock(refBlock, blocks);
            this.logger.success(`✓ Resolved via block ID → ${result}`);
            return result;
          } else {
            this.logger.error(`❌ Block ID ${inputData} not found`);
          }
        }

        // ===== CASE 3: Type 3 inputs with shadow values =====
        if (
          inputType === 3 &&
          Array.isArray(inputData) &&
          inputData.length >= 2
        ) {
          this.logger.debug(`Processing type 3 input with shadow`);

          // Try main block first
          if (typeof inputData[0] === "string") {
            const blockId = inputData[0];
            this.logger.debug(`Type 3 main block: ${blockId}`);
            const refBlock = blocks._blocks[blockId];
            if (refBlock) {
              this.logger.debug(
                `Evaluating type 3 main block: ${refBlock.opcode}`,
              );
              const result = this.evaluateBlock(refBlock, blocks);
              this.logger.success(`✓ Resolved type 3 main block → ${result}`);
              return result;
            }
          }

          // Fallback to shadow
          const shadowData = inputData[1];
          if (Array.isArray(shadowData)) {
            const primitiveType = shadowData[0];
            const primitiveValue = shadowData[1];

            this.logger.debug(
              `Type 3 shadow: type=${primitiveType}, value="${primitiveValue}"`,
            );

            if (
              primitiveType === 4 ||
              primitiveType === 5 ||
              primitiveType === 6 ||
              primitiveType === 7
            ) {
              this.logger.success(`✓ Type 3 shadow number: ${primitiveValue}`);
              return String(primitiveValue);
            } else if (primitiveType === 10) {
              if (this.isNumeric(primitiveValue)) {
                this.logger.success(
                  `✓ Type 3 shadow numeric string: ${primitiveValue}`,
                );
                return String(primitiveValue);
              }

              // Check broadcast map
              if (this.broadcastMap && this.broadcastMap[primitiveValue]) {
                const name = this.broadcastMap[primitiveValue];
                this.logger.success(
                  `✓ Type 3 shadow broadcast: ${primitiveValue} → "${name}"`,
                );
                return `"${name}"`;
              }

              this.logger.success(
                `✓ Type 3 shadow string: "${primitiveValue}"`,
              );
              return '"' + primitiveValue + '"';
            } else if (primitiveType === 11) {
              // Broadcast in shadow
              const broadcastId = shadowData[1];
              const broadcastName = shadowData[2];

              if (this.broadcastMap && this.broadcastMap[broadcastId]) {
                const mappedName = this.broadcastMap[broadcastId];
                this.logger.success(
                  `✓ Type 3 shadow broadcast: ${broadcastId} → "${mappedName}"`,
                );
                return `"${mappedName}"`;
              } else if (broadcastName) {
                this.logger.success(
                  `✓ Type 3 shadow broadcast name: "${broadcastName}"`,
                );
                return `"${broadcastName}"`;
              }
            }
          }
        }
      }

      this.logger.error(
        `❌ Failed to resolve input "${inputName}" - returning "0"`,
      );
      this.logger.debug(
        `Final input structure:`,
        JSON.stringify(input, null, 2),
      );
      return "0";
    }

    evaluateBlock(block, blocks) {
      if (!block) {
        this.logger.error("evaluateBlock called with null block");
        return "0";
      }

      const opcode = block.opcode;
      this.logger.debug(`Evaluating block: ${opcode}`);

      // ===== NUMBERS AND TEXT =====
      if (
        opcode === "math_number" ||
        opcode === "math_whole_number" ||
        opcode === "math_positive_number" ||
        opcode === "math_integer"
      ) {
        const num = this.getFieldValue(block, "NUM");
        return num || "0";
      } else if (opcode === "text") {
        const text = this.getFieldValue(block, "TEXT");
        if (this.isNumeric(text)) return String(text);
        return '"' + (text || "").replace(/"/g, '\\"') + '"';
      } else if (opcode === "data_variable") {
        const varName = this.getFieldValue(block, "VARIABLE");
        return this.sanitizeName(varName);
      }

      // ===== NXT MOTOR REPORTERS =====
      else if (
        opcode === "legonxt_getMotorPosition" ||
        opcode === "getMotorPosition"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorRotationCount(OUT_${p})`;
      } else if (
        opcode === "legonxt_getMotorPower" ||
        opcode === "getMotorPower"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorPower(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorMode" ||
        opcode === "getMotorMode"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorMode(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorRegulationMode" ||
        opcode === "getMotorRegulationMode"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorRegulation(OUT_${p})`; //  (note: "Regulation" not "RegulationMode")
      } else if (
        opcode === "legonxt_getMotorTurnRatio" ||
        opcode === "getMotorTurnRatio"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorTurnRatio(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorRunState" ||
        opcode === "getMotorRunState"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorRunState(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorTachoLimit" ||
        opcode === "getMotorTachoLimit"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorTachoLimit(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorTachoCount" ||
        opcode === "getMotorTachoCount"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorTachoCount(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorBlockTachoCount" ||
        opcode === "getMotorBlockTachoCount"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorBlockTachoCount(OUT_${p})`; //
      } else if (
        opcode === "legonxt_getMotorRotationCount" ||
        opcode === "getMotorRotationCount"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        return `MotorRotationCount(OUT_${p})`; //
      }

      // ===== NXT SENSOR REPORTERS =====
      else if (
        opcode === "legonxt_isTouchPressed" ||
        opcode === "isTouchPressed"
      ) {
        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1"; // Fix 0-index to 1-index
        this.sensorSetup.add(`touch_S${n}`);
        return `(SENSOR_${n} == 1)`;
      } else if (
        opcode === "legonxt_getLightLevel" ||
        opcode === "getLightLevel"
      ) {
        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1";
        this.sensorSetup.add(`light_S${n}`);
        return `Sensor(IN_${n})`;
      } else if (
        opcode === "legonxt_getSoundLevel" ||
        opcode === "getSoundLevel"
      ) {
        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1";
        this.sensorSetup.add(`sound_S${n}`);
        return `Sensor(IN_${n})`;
      } else if (opcode === "legonxt_getDistance" || opcode === "getDistance") {
        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1";
        this.sensorSetup.add(`ultrasonic_S${n}`);
        return `SensorUS(IN_${n})`;
      }

      // ===== SPRITE STATE REPORTERS =====
      else if (opcode === "legonxt_spriteGetX" || opcode === "spriteGetX") {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const safeName = this.sanitizeName(sprite); // Now properly removes sprite_ prefix
        return `sprite_${safeName}.x`;
      } else if (opcode === "legonxt_spriteGetY" || opcode === "spriteGetY") {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const safeName = this.sanitizeName(sprite);
        return `sprite_${safeName}.y`;
      } else if (
        opcode === "legonxt_spriteGetSize" ||
        opcode === "spriteGetSize"
      ) {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const safeName = this.sanitizeName(sprite);
        return `sprite_${safeName}.size`;
      } else if (
        opcode === "legonxt_spriteGetVisible" ||
        opcode === "spriteGetVisible"
      ) {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const safeName = this.sanitizeName(sprite);
        return `sprite_${safeName}.visible`;
      }

      // ===== BATTERY REPORTER =====
      else if (opcode === "legonxt_getBattery" || opcode === "getBattery") {
        return "BatteryLevel()";
      }

      // ===== OPERATORS =====
      else if (opcode === "operator_gt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} > ${op2})`;
      } else if (opcode === "operator_lt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} < ${op2})`;
      } else if (opcode === "operator_equals") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} == ${op2})`;
      } else if (opcode === "operator_and") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} && ${op2})`;
      } else if (opcode === "operator_or") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} || ${op2})`;
      } else if (opcode === "operator_not") {
        const op = this.getInputValue(block, "OPERAND", blocks);
        return `!(${op})`;
      } else if (opcode === "operator_add") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} + ${num2})`;
      } else if (opcode === "operator_subtract") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} - ${num2})`;
      } else if (opcode === "operator_multiply") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} * ${num2})`;
      } else if (opcode === "operator_divide") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} / ${num2})`;
      } else if (opcode === "operator_random") {
        const from = this.getInputValue(block, "FROM", blocks);
        const to = this.getInputValue(block, "TO", blocks);
        return `(Random(${to} - ${from}) + ${from})`;
      } else if (opcode === "operator_mod") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} % ${num2})`;
      } else if (opcode === "operator_round") {
        const num = this.getInputValue(block, "NUM", blocks);
        return `round(${num})`;
      } else if (opcode === "operator_join") {
        const str1 = this.getInputValue(block, "STRING1", blocks);
        const str2 = this.getInputValue(block, "STRING2", blocks);
        return `StrCat(${str1}, ${str2})`;
      } else if (opcode === "operator_letter_of") {
        const letter = this.getInputValue(block, "LETTER", blocks);
        const string = this.getInputValue(block, "STRING", blocks);
        return `SubStr(${string}, ${letter} - 1, 1)`;
      } else if (opcode === "operator_length") {
        const string = this.getInputValue(block, "STRING", blocks);
        return `StrLen(${string})`;
      }

      // ===== MOTION REPORTERS =====
      else if (opcode === "motion_xposition") {
        return `sprite_${this.activeSpriteName}.x`;
      } else if (opcode === "motion_yposition") {
        return `sprite_${this.activeSpriteName}.y`;
      } else if (opcode === "motion_direction") {
        return `sprite_${this.activeSpriteName}.direction`;
      }

      // ===== NXT MENU REPORTERS =====
      else if (opcode === "legonxt_menu_SENSOR_PORT") {
        // Menu: S1, S2, S3, S4
        const port = this.getFieldValue(block, "SENSOR_PORT");
        this.logger.debug(`Menu SENSOR_PORT: ${port}`);
        return port || "S1";
      } else if (opcode === "legonxt_menu_MOTOR_PORT") {
        // Menu: A, B, C
        const port = this.getFieldValue(block, "MOTOR_PORT");
        this.logger.debug(`Menu MOTOR_PORT: ${port}`);
        return port || "A";
      } else if (opcode === "legonxt_menu_LED_STATE") {
        // Menu: on, off
        const state = this.getFieldValue(block, "LED_STATE");
        this.logger.debug(`Menu LED_STATE: ${state}`);
        return state || "on";
      } else if (opcode === "legonxt_menu_PIXEL_STATE") {
        // Menu: on, off
        const state = this.getFieldValue(block, "PIXEL_STATE");
        this.logger.debug(`Menu PIXEL_STATE: ${state}`);
        return state || "on";
      } else if (opcode === "legonxt_menu_MOTOR_STOP") {
        // Menu: brake, coast
        const action = this.getFieldValue(block, "MOTOR_STOP");
        this.logger.debug(`Menu MOTOR_STOP: ${action}`);
        return action || "brake";
      } else if (opcode === "legonxt_menu_COLOR_MODE") {
        // Menu: all colors, red, green, blue, none
        const mode = this.getFieldValue(block, "COLOR_MODE");
        this.logger.debug(`Menu COLOR_MODE: ${mode}`);
        return mode || "all colors";
      } else if (opcode === "legonxt_menu_SOUND_MODE") {
        // Menu: dBA, dB
        const mode = this.getFieldValue(block, "SOUND_MODE");
        this.logger.debug(`Menu SOUND_MODE: ${mode}`);
        return mode || "dBA";
      } else if (opcode === "legonxt_menu_RECT_FILL") {
        // Menu: outline, filled
        const fill = this.getFieldValue(block, "RECT_FILL");
        this.logger.debug(`Menu RECT_FILL: ${fill}`);
        return fill || "outline";
      } else if (opcode === "legonxt_menu_NOTE") {
        // Menu: C4, C#4, D4, etc.
        const note = this.getFieldValue(block, "NOTE");
        this.logger.debug(`Menu NOTE: ${note}`);
        return note || "C4";
      } else if (opcode === "legonxt_menu_PATTERN") {
        // Menu: checkerboard, stripes-h, etc.
        const pattern = this.getFieldValue(block, "PATTERN");
        this.logger.debug(`Menu PATTERN: ${pattern}`);
        return pattern || "checkerboard";
      } else if (opcode === "legonxt_menu_REMOVE_MSG") {
        // Menu: and remove, keep in mailbox
        const remove = this.getFieldValue(block, "REMOVE_MSG");
        this.logger.debug(`Menu REMOVE_MSG: ${remove}`);
        return remove || "and remove";
      }

      this.logger.warn(`Unhandled reporter block: ${opcode}`, block);
      return "0";
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.logger.debug(`Processing block: ${opcode}`, {
        id: block.id,
        inputs: Object.keys(block.inputs || {}),
        fields: Object.keys(block.fields || {}),
      });

      // ===== NXT MOTOR BLOCKS (with legonxt_ prefix) =====
      if (opcode === "legonxt_motorOn" || opcode === "motorOn") {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        const power = this.getInputValue(block, "POWER", blocks);
        this.addLine(`OnFwd(OUT_${p}, ${power});`);
      } else if (
        opcode === "legonxt_motorRunDegrees" ||
        opcode === "motorRunDegrees"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        const power = this.getInputValue(block, "POWER", blocks);
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(`RotateMotor(OUT_${p}, ${power}, ${degrees});`);
      } else if (
        opcode === "legonxt_motorRunRotations" ||
        opcode === "motorRunRotations"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        const power = this.getInputValue(block, "POWER", blocks);
        const rotations = this.getInputValue(block, "ROTATIONS", blocks);
        this.addLine(`RotateMotor(OUT_${p}, ${power}, (${rotations}) * 360);`);
      } else if (opcode === "legonxt_motorStop" || opcode === "motorStop") {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";

        // CRITICAL FIX: ACTION is a FIELD, not an INPUT (acceptReporters: false)
        const actionRaw = this.getFieldValue(block, "ACTION") || "brake";
        const action = String(actionRaw).toLowerCase().trim();

        this.logger.debug(`Motor stop: port=${p}, action=${action}`);

        if (action === "brake" || action === "bremsen") {
          this.addLine(`Off(OUT_${p});`);
          this.logger.success(`  → Off(OUT_${p}) [brake]`);
        } else if (action === "coast" || action === "auslaufen") {
          this.addLine(`Float(OUT_${p});`);
          this.logger.success(`  → Float(OUT_${p}) [coast]`);
        } else {
          this.logger.error(`  ⚠️ Unexpected action: "${action}"`);
          this.addLine(`Off(OUT_${p}); // Unknown action: ${action}`);
        }
      } else if (
        opcode === "legonxt_resetMotorPosition" ||
        opcode === "resetMotorPosition"
      ) {
        let p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        if (p === "0") p = "A";
        else if (p === "1") p = "B";
        else if (p === "2") p = "C";
        this.addLine(`ResetRotationCount(OUT_${p});`);
      }

      // ===== NXT SENSOR SETUP BLOCKS =====
      else if (
        opcode === "legonxt_setupTouchSensorNXT" ||
        opcode === "setupTouchSensorNXT"
      ) {
        this.logger.debug(`Processing touch sensor setup`);

        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1";

        this.sensorSetup.add(`touch_S${n}`);
        this.logger.success(`  ✓ Tracked: touch_S${n}`);
      } else if (
        opcode === "legonxt_setupLightSensor" ||
        opcode === "setupLightSensor"
      ) {
        this.logger.log(`🔴 SETUP LIGHT SENSOR HANDLER CALLED`);
        this.logger.log(`  sensorSetup before:`, Array.from(this.sensorSetup));

        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const stateRaw = this.getFieldValue(block, "STATE");
        const state = String(stateRaw || "on")
          .toLowerCase()
          .trim();

        let n = p.replace("S", "");
        if (n === "0") n = "1";

        this.logger.log(`  Port: S${n}, LED: ${state}`);

        if (state === "on" || state === "an" || state === "ein") {
          this.sensorSetup.add(`light_S${n}_on`);
          this.logger.log(`  Added: light_S${n}_on`);
        } else {
          this.sensorSetup.add(`light_S${n}_off`);
          this.logger.log(`  Added: light_S${n}_off`);
        }

        this.logger.log(`  sensorSetup after:`, Array.from(this.sensorSetup));
      } else if (
        opcode === "legonxt_setupColorSensor" ||
        opcode === "setupColorSensor"
      ) {
        this.logger.debug(`Processing color sensor setup`);

        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");

        this.sensorSetup.add(`color_S${sensorNum}`);
        this.logger.success(`  ✓ Tracked: color_S${sensorNum}`);
      } else if (
        opcode === "legonxt_setupSoundSensor" ||
        opcode === "setupSoundSensor"
      ) {
        this.logger.debug(`Processing sound sensor setup`);

        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");

        this.sensorSetup.add(`sound_S${sensorNum}`);
        this.logger.success(`  ✓ Tracked: sound_S${sensorNum}`);
      } else if (
        opcode === "legonxt_setupUltrasonicSensor" ||
        opcode === "setupUltrasonicSensor"
      ) {
        this.logger.debug(`Processing ultrasonic sensor setup`);

        const p = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        let n = p.replace("S", "");
        if (n === "0") n = "1";

        this.logger.debug(`  Port: S${n}`);

        this.sensorSetup.add(`ultrasonic_S${n}`);
        this.logger.success(`  ✓ Tracked: ultrasonic_S${n}`);
      }

      // ===== NXT SOUND BLOCKS =====
      else if (opcode === "legonxt_playTone" || opcode === "playTone") {
        const freq = this.getInputValue(block, "FREQ", blocks);
        const ms = this.getInputValue(block, "MS", blocks);
        this.addLine(`PlayTone(${freq}, ${ms});`);
      } else if (opcode === "legonxt_playNote" || opcode === "playNote") {
        const note = this.getInputValue(block, "NOTE", blocks).replace(
          /"/g,
          "",
        );
        const beats = this.getInputValue(block, "BEATS", blocks);
        const noteFreqs = {
          C4: 262,
          "C#4": 277,
          D4: 294,
          "D#4": 311,
          E4: 330,
          F4: 349,
          "F#4": 370,
          G4: 392,
          "G#4": 415,
          A4: 440,
          "A#4": 466,
          B4: 494,
          C5: 523,
          "C#5": 554,
          D5: 587,
          "D#5": 622,
          E5: 659,
          F5: 698,
          "F#5": 740,
          G5: 784,
          "G#5": 831,
          A5: 880,
          "A#5": 932,
          B5: 988,
        };
        const freq = noteFreqs[note] || 440;
        this.addLine(`PlayTone(${freq}, (${beats}) * 500);`);
      }

      // ===== NXT DISPLAY BLOCKS =====
      else if (opcode === "legonxt_clearScreen" || opcode === "clearScreen") {
        this.addLine(`ClearScreen();`);
      } else if (
        opcode === "legonxt_updateDisplay" ||
        opcode === "updateDisplay"
      ) {
        this.addLine(`// Display update`);
      } else if (opcode === "legonxt_drawText" || opcode === "drawText") {
        const text = this.getInputValue(block, "TEXT", blocks);
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine(`TextOut(${x}, LCD_LINE1 + ${y}, ${text});`);
      } else if (opcode === "legonxt_drawPixel" || opcode === "drawPixel") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);

        // CRITICAL FIX: STATE is a FIELD, not an INPUT (acceptReporters: false)
        const stateRaw = this.getFieldValue(block, "STATE") || "on";
        const state = String(stateRaw).toLowerCase().trim();

        this.logger.debug(`Draw pixel: (${x}, ${y}), state=${state}`);

        if (state === "on" || state === "an" || state === "ein") {
          this.addLine(`PointOut(${x}, ${y});`);
          this.logger.success(`  → PointOut(${x}, ${y}) [on]`);
        } else if (state === "off" || state === "aus") {
          this.addLine(`// Clear pixel at (${x}, ${y}) - not supported`);
          this.logger.debug(`  → Skipped [off]`);
        } else {
          this.logger.error(`  ⚠️ Unexpected state: "${state}"`);
          this.addLine(`PointOut(${x}, ${y}); // Unknown state: ${state}`);
        }
      } else if (opcode === "legonxt_drawLine" || opcode === "drawLine") {
        const x1 = this.getInputValue(block, "X1", blocks);
        const y1 = this.getInputValue(block, "Y1", blocks);
        const x2 = this.getInputValue(block, "X2", blocks);
        const y2 = this.getInputValue(block, "Y2", blocks);
        this.addLine(`LineOut(${x1}, ${y1}, ${x2}, ${y2});`);
      } else if (opcode === "legonxt_drawRect" || opcode === "drawRect") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const w = this.getInputValue(block, "W", blocks);
        const h = this.getInputValue(block, "H", blocks);
        const fill = this.getInputValue(block, "FILL", blocks).replace(
          /"/g,
          "",
        );
        if (fill === "filled") {
          this.addLine(`RectOut(${x}, ${y}, ${w}, ${h}, DRAW_OPT_FILL_SHAPE);`);
        } else {
          this.addLine(`RectOut(${x}, ${y}, ${w}, ${h});`);
        }
      } else if (opcode === "legonxt_drawCircle" || opcode === "drawCircle") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const r = this.getInputValue(block, "R", blocks);
        const fill = this.getInputValue(block, "FILL", blocks).replace(
          /"/g,
          "",
        );
        if (fill === "filled") {
          this.addLine(`CircleOut(${x}, ${y}, ${r}, DRAW_OPT_FILL_SHAPE);`);
        } else {
          this.addLine(`CircleOut(${x}, ${y}, ${r});`);
        }
      } else if (opcode === "legonxt_drawPattern" || opcode === "drawPattern") {
        const pattern = this.getInputValue(block, "PATTERN", blocks).replace(
          /"/g,
          "",
        );
        this.addLine(`// Pattern: ${pattern}`);
      } else if (
        opcode === "legonxt_captureScreen" ||
        opcode === "captureScreen"
      ) {
        this.addLine(`// Screen capture requested`);
      }

      // ===== SPRITE STATE BLOCKS =====
      else if (
        opcode === "legonxt_spriteSetPosition" ||
        opcode === "spriteSetPosition"
      ) {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const safeName = this.sanitizeName(sprite);
        if (!this.spriteStates[sprite]) {
          this.spriteStates[sprite] = { x: 0, y: 0, size: 100, visible: true };
        }
        this.addLine(`sprite_${safeName}.x = ${x};`);
        this.addLine(`sprite_${safeName}.y = ${y};`);
      } else if (
        opcode === "legonxt_spriteSetSize" ||
        opcode === "spriteSetSize"
      ) {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const size = this.getInputValue(block, "SIZE", blocks);
        const safeName = this.sanitizeName(sprite);
        if (!this.spriteStates[sprite]) {
          this.spriteStates[sprite] = { x: 0, y: 0, size: 100, visible: true };
        }
        this.addLine(`sprite_${safeName}.size = ${size};`);
      } else if (
        opcode === "legonxt_spriteSetVisible" ||
        opcode === "spriteSetVisible"
      ) {
        const sprite = this.getInputValue(block, "SPRITE", blocks).replace(
          /"/g,
          "",
        );
        const visible = this.getInputValue(block, "VISIBLE", blocks);
        const safeName = this.sanitizeName(sprite);
        if (!this.spriteStates[sprite]) {
          this.spriteStates[sprite] = { x: 0, y: 0, size: 100, visible: true };
        }
        this.addLine(`sprite_${safeName}.visible = ${visible};`);
      }

      // ===== STANDARD SCRATCH MOTION BLOCKS =====
      else if (opcode === "motion_movesteps") {
        const steps = this.getInputValue(block, "STEPS", blocks);

        // Check if steps is a motor position reporter
        if (steps.includes("MotorRotationCount")) {
          // Direct motor-based movement
          this.addLine(`// Move based on motor position`);
          this.addLine(`// Virtual sprite movement using ${steps}`);
          const sprite = `sprite_${this.activeSpriteName}`;
          this.addLine(
            `${sprite}.x += (Cos(${sprite}.direction) * ${steps}) / 100;`,
          );
          this.addLine(
            `${sprite}.y += (Sin(${sprite}.direction) * ${steps}) / 100;`,
          );
        } else {
          // Standard movement
          const sprite = `sprite_${this.activeSpriteName}`;
          this.addLine(
            `${sprite}.x += (Cos(${sprite}.direction) * ${steps}) / 100;`,
          );
          this.addLine(
            `${sprite}.y += (Sin(${sprite}.direction) * ${steps}) / 100;`,
          );
        }
      } else if (opcode === "motion_turnright") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(
          `sprite_${this.activeSpriteName}.direction += ${degrees};`,
        );
      } else if (opcode === "motion_turnleft") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(
          `sprite_${this.activeSpriteName}.direction -= ${degrees};`,
        );
      } else if (opcode === "motion_gotoxy") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const sprite = `sprite_${this.activeSpriteName}`;

        // ALWAYS generate assignments
        this.addLine(`${sprite}.x = ${x};`);
        this.addLine(`${sprite}.y = ${y};`);

        this.logger.debug(`  Set position to (${x}, ${y})`);
      }

      // ===== CONTROL BLOCKS =====
      else if (opcode === "control_wait") {
        const duration = this.getInputValue(block, "DURATION", blocks);
        this.addLine(`Wait((${duration}) * 1000);`);
      } else if (opcode === "control_repeat") {
        const times = this.getInputValue(block, "TIMES", blocks);
        const loopVar = `i${this.scriptCounter++}`; // Unique loop variable
        this.addLine(
          `for(int ${loopVar}=0; ${loopVar}<${times}; ${loopVar}++) {`,
        );
        this.increaseIndent();
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_forever") {
        this.addLine(`while(true) {`);
        this.increaseIndent();
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_if") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`if (${condition}) {`);
        this.increaseIndent();
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_if_else") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`if (${condition}) {`);
        this.increaseIndent();
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`} else {`);
        this.increaseIndent();
        const substack2Id = this.getSubstackId(block, "SUBSTACK2");
        if (substack2Id) {
          this.processBlockChain(substack2Id, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_repeat_until") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        // In NXC, "until" is "repeat while NOT condition"
        this.addLine(`while(!(${condition})) {`);
        this.increaseIndent();
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_stop") {
        const stopOption = this.getFieldValue(block, "STOP_OPTION") || "all";
        if (stopOption === "all") {
          this.addLine(`Stop(true);`);
        } else {
          this.addLine(`return;`);
        }
      }

      // ===== DATA BLOCKS =====
      else if (opcode === "data_setvariableto") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        const sanitized = this.sanitizeName(varName);
        this.variables.set(varName, sanitized);
        this.addLine(`${sanitized} = ${value};`);
      } else if (opcode === "data_changevariableby") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        const sanitized = this.sanitizeName(varName);
        this.variables.set(varName, sanitized);
        this.addLine(`${sanitized} += ${value};`);
      }

      // ===== LOOKS BLOCKS =====
      else if (opcode === "looks_say" || opcode === "looks_sayforsecs") {
        const message = this.getInputValue(block, "MESSAGE", blocks);
        this.addLine(`TextOut(0, LCD_LINE1, ${message});`);
        if (opcode === "looks_sayforsecs") {
          const secs = this.getInputValue(block, "SECS", blocks);
          this.addLine(`Wait((${secs}) * 1000);`);
        }
      }

      // ===== EVENT BLOCKS =====
      else if (
        opcode === "event_broadcast" ||
        opcode === "event_broadcastandwait"
      ) {
        this.logger.debug(`\n=== PROCESSING BROADCAST ===`);

        // STEP 1: Try to get broadcast value from field OR input
        let broadcastValue = null;

        if (block.fields && block.fields.BROADCAST_OPTION) {
          broadcastValue =
            block.fields.BROADCAST_OPTION.value ||
            block.fields.BROADCAST_OPTION.id ||
            block.fields.BROADCAST_OPTION.name;
          this.logger.debug(`Got from field: "${broadcastValue}"`);
        }

        if (!broadcastValue && block.inputs && block.inputs.BROADCAST_INPUT) {
          const input = block.inputs.BROADCAST_INPUT;
          if (
            typeof input === "object" &&
            !Array.isArray(input) &&
            input.shadow
          ) {
            const shadowBlock = blocks._blocks[input.shadow];
            if (
              shadowBlock &&
              shadowBlock.fields &&
              shadowBlock.fields.BROADCAST_OPTION
            ) {
              broadcastValue =
                shadowBlock.fields.BROADCAST_OPTION.value ||
                shadowBlock.fields.BROADCAST_OPTION.id ||
                shadowBlock.fields.BROADCAST_OPTION.name;
              this.logger.debug(`Got from shadow: "${broadcastValue}"`);
            }
          }
        }

        // STEP 2: Determine if this is an ID or a name
        let broadcastName = broadcastValue || "unknown";

        this.logger.debug(`\n=== BROADCAST MAPPING ===`);
        this.logger.debug(`Raw value: "${broadcastValue}"`);
        this.logger.debug(`Broadcast map:`, this.broadcastMap);

        // Check if it's an ID in the map
        if (
          this.broadcastMap &&
          broadcastValue &&
          this.broadcastMap[broadcastValue]
        ) {
          broadcastName = this.broadcastMap[broadcastValue];
          this.logger.success(
            `✓ Mapped ID: "${broadcastValue}" → "${broadcastName}"`,
          );
        }
        // Check if the value IS a name (reverse lookup)
        else if (this.broadcastMap && broadcastValue) {
          const isName = Object.values(this.broadcastMap).includes(
            broadcastValue,
          );
          if (isName) {
            broadcastName = broadcastValue;
            this.logger.success(`✓ Already a name: "${broadcastName}"`);
          } else {
            this.logger.warn(
              `⚠️ Not found in map, using as-is: "${broadcastValue}"`,
            );
          }
        }

        const funcName = `on_broadcast_${this.sanitizeName(broadcastName)}`;
        this.addLine(`${funcName}(); // Broadcast: ${broadcastName}`);

        this.logger.success(`✓ Generated: ${funcName}()`);
        this.logger.debug(`=== END BROADCAST ===\n`);
      }
    }

    processBlockChain(blockId, blocks) {
      let currentId = blockId;
      let chainLength = 0;

      while (currentId) {
        const block = blocks._blocks[currentId];
        if (!block) break;

        chainLength++;
        if (chainLength > 1000) {
          this.logger.warn("Chain length exceeded 1000 blocks, stopping");
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }
    }

    processHatBlock(hatBlock, blocks) {
      const opcode = hatBlock.opcode;
      let funcName = "";

      if (opcode === "event_whenflagclicked") {
        funcName = `script_${this.scriptCounter++}`;
        this.logger.log(`  Creating green flag script: ${funcName}`);
        this.addLine(`task ${funcName}() {`);
      } else if (opcode === "event_whenbroadcastreceived") {
        // FIX: Use getFieldValue which now maps broadcasts
        const broadcastField = this.getFieldValue(hatBlock, "BROADCAST_OPTION");
        this.logger.debug(`  Broadcast field value: ${broadcastField}`);

        let broadcastName = broadcastField;

        // Double-check broadcast map
        if (this.broadcastMap && this.broadcastMap[broadcastField]) {
          broadcastName = this.broadcastMap[broadcastField];
          this.logger.debug(`  Mapped via broadcastMap: ${broadcastName}`);
        }

        funcName = `on_broadcast_${this.sanitizeName(broadcastName)}`;
        this.logger.success(
          `  Creating broadcast handler: ${funcName} for "${broadcastName}"`,
        );
        this.addLine(`// When I receive: ${broadcastName}`);
        this.addLine(`sub ${funcName}() {`);
      }

      this.increaseIndent();
      let currentBlockId = hatBlock.next;
      if (!currentBlockId) {
        this.addLine("// Empty script");
        this.logger.warn("  ⚠️ Hat block has no following blocks");
      } else {
        this.processBlockChain(currentBlockId, blocks);
      }
      this.decreaseIndent();
      this.addLine("}");

      return funcName;
    }

    processTarget(target) {
      this.logger.log(`Processing target: ${target.sprite.name}`);
      const blocks = target.blocks;
      const blockArray = blocks._blocks;

      const functions = [];
      const mainScripts = [];

      // Find all hat blocks
      const hatBlocks = [];
      for (const blockId in blockArray) {
        const block = blockArray[blockId];
        if (
          block.opcode === "event_whenflagclicked" ||
          block.opcode === "event_whenbroadcastreceived"
        ) {
          hatBlocks.push(block);
        }
      }

      this.logger.log(`  Found ${hatBlocks.length} hat blocks`);

      // Process each hat block into a function
      for (const hatBlock of hatBlocks) {
        const funcCode = [];
        const savePreviousCode = this.code;
        this.code = funcCode;

        const funcName = this.processHatBlock(hatBlock, blocks);

        this.code = savePreviousCode;

        if (funcName) {
          functions.push(funcCode);

          // Track main scripts (green flag)
          if (hatBlock.opcode === "event_whenflagclicked") {
            mainScripts.push(funcName);
          }
        }
      }

      return { functions, mainScripts };
    }

    generateHeader() {
      this.addLine("// ========================================");
      this.addLine("// Generated from Scratch by LEGO NXT Extension");
      this.addLine(`// Generated: ${new Date().toISOString()}`);
      this.addLine("// ========================================");
      this.addLine("");
    }

    generateVariables() {
      if (this.variables.size > 0) {
        this.addLine("// Global Variables");
        for (const [original, sanitized] of this.variables) {
          this.addLine(`int ${sanitized} = 0; // ${original}`);
        }
        this.addLine("");
      }
    }

    generateSensorSetup() {
      this.logger.log("\n=== GENERATING SENSOR SETUP ===");
      this.logger.log(`Sensor setup size: ${this.sensorSetup.size}`);
      this.logger.log(`Sensor setup contents:`, Array.from(this.sensorSetup));

      // ALWAYS generate the function
      this.addLine("// Initialize sensors");
      this.addLine("sub InitSensors() {");
      this.increaseIndent();

      if (this.sensorSetup.size === 0) {
        this.addLine("// No sensors to initialize");
        this.logger.warn("  ⚠️ No sensors tracked");
      } else {
        // Parse sensor setup strings
        const sensors = [];

        for (const sensor of this.sensorSetup) {
          this.logger.debug(`  Parsing sensor: "${sensor}"`);

          // Format: "type_Sn_extra" or "type_Sn"
          // Examples: "light_S1_on", "ultrasonic_S2", "touch_S1"
          const match = sensor.match(/^(\w+)_S(\d)(?:_(\w+))?$/);

          if (match) {
            const type = match[1]; // "light", "ultrasonic", "touch", etc.
            const portNum = match[2]; // "1", "2", "3", "4"
            const extra = match[3] || ""; // "on", "off", or empty

            sensors.push({ type, portNum, extra, original: sensor });
            this.logger.debug(
              `    ✓ Parsed: type=${type}, port=${portNum}, extra=${extra}`,
            );
          } else {
            this.logger.error(`    ❌ Failed to parse: "${sensor}"`);
          }
        }

        // Sort by port number
        sensors.sort((a, b) => parseInt(a.portNum) - parseInt(b.portNum));

        this.logger.log(
          `  Generating setup code for ${sensors.length} sensor(s):`,
        );

        // Generate setup code
        for (const sensor of sensors) {
          const { type, portNum, extra } = sensor;

          if (type === "touch") {
            this.addLine(`SetSensorTouch(IN_${portNum});`);
            this.logger.log(`    ✓ SetSensorTouch(IN_${portNum})`);
          } else if (type === "light") {
            if (extra === "on") {
              this.addLine(`SetSensorLight(IN_${portNum});`);
              this.logger.log(`    ✓ SetSensorLight(IN_${portNum}) [LED on]`);
            } else {
              this.addLine(`SetSensorLowspeed(IN_${portNum});`);
              this.logger.log(
                `    ✓ SetSensorLowspeed(IN_${portNum}) [LED off]`,
              );
            }
          } else if (type === "sound") {
            this.addLine(`SetSensorSound(IN_${portNum});`);
            this.logger.log(`    ✓ SetSensorSound(IN_${portNum})`);
          } else if (type === "ultrasonic") {
            this.addLine(`SetSensorLowspeed(IN_${portNum});`);
            this.logger.log(`    ✓ SetSensorLowspeed(IN_${portNum})`);
          } else if (type === "color") {
            this.addLine(`SetSensorColorFull(IN_${portNum});`);
            this.logger.log(`    ✓ SetSensorColorFull(IN_${portNum})`);
          } else {
            this.logger.error(`    ❌ Unknown sensor type: "${type}"`);
          }
        }
      }

      this.decreaseIndent();
      this.addLine("}");
      this.addLine("");

      this.logger.log("=== SENSOR SETUP COMPLETE ===\n");
    }

    generateSpriteStateManager() {
      if (Object.keys(this.spriteStates).length === 0) return;

      this.addLine("// Virtual sprite state tracking");
      this.addLine("struct SpriteState {");
      this.increaseIndent();
      this.addLine("int x;");
      this.addLine("int y;");
      this.addLine("int direction;");
      this.addLine("int size;");
      this.addLine("bool visible;");
      this.decreaseIndent();
      this.addLine("};");
      this.addLine("");

      // Generate sprite state variables
      const spriteNames = Object.keys(this.spriteStates);
      for (const name of spriteNames) {
        const safeName = this.sanitizeName(name);
        this.addLine(`SpriteState sprite_${safeName};`);
      }
      this.addLine("");

      this.addLine("void InitSprites() {");
      this.increaseIndent();
      for (const name of spriteNames) {
        const state = this.spriteStates[name];
        const safeName = this.sanitizeName(name);
        this.addLine(`sprite_${safeName}.x = ${state.x};`);
        this.addLine(`sprite_${safeName}.y = ${state.y};`);
        this.addLine(
          `sprite_${safeName}.direction = ${state.direction || 90};`,
        ); // FIX: Default 90° (right)
        this.addLine(`sprite_${safeName}.size = ${state.size};`);
        this.addLine(
          `sprite_${safeName}.visible = ${state.visible ? "true" : "false"};`,
        );
      }
      this.decreaseIndent();
      this.addLine("}");
      this.addLine("");
    }

    collectAllReferencedSprites(targets) {
      const referencedSprites = new Set();

      // Collect sprite names from all sprite state blocks
      for (const target of targets) {
        const blocks = target.blocks._blocks;
        for (const blockId in blocks) {
          const block = blocks[blockId];

          // Check sprite state blocks
          if (
            (block.opcode && block.opcode.includes("spriteGet")) ||
            block.opcode.includes("spriteSet")
          ) {
            const spriteInput = block.inputs.SPRITE;
            if (spriteInput) {
              const spriteName = this.extractSpriteName(spriteInput, blocks);
              if (spriteName) {
                referencedSprites.add(spriteName);
              }
            }
          }
        }
      }

      return Array.from(referencedSprites);
    }

    // HELPER:
    extractSpriteName(input, blocks) {
      if (typeof input === "object" && !Array.isArray(input)) {
        if (input.shadow) {
          const shadowBlock = blocks._blocks[input.shadow];
          if (shadowBlock && shadowBlock.fields && shadowBlock.fields.TEXT) {
            return shadowBlock.fields.TEXT.value;
          }
        }
      } else if (Array.isArray(input) && input.length >= 2) {
        if (input[0] === 1 && Array.isArray(input[1])) {
          return input[1][1]; // Primitive string
        }
      }
      return null;
    }

    transpileProject() {
      this.logger.log("=".repeat(70));
      this.logger.log("🚀 STARTING NXC TRANSPILATION");
      this.logger.log("=".repeat(70));

      this.reset();

      try {
        const runtime = Scratch.vm.runtime;
        if (!runtime) {
          throw new Error("Scratch runtime not available");
        }

        const targets = runtime.targets;
        if (!targets || targets.length === 0) {
          throw new Error("No targets found in project");
        }

        this.logger.log(`\n📊 Project contains ${targets.length} target(s)`);

        // ==================== STEP 1: COLLECT SPRITE STATES ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 1: COLLECTING SPRITE STATES");
        this.logger.log("=".repeat(70));

        let spriteCount = 0;
        for (const target of targets) {
          if (!target.isStage) {
            spriteCount++;
            const spriteName = target.sprite.name;
            const state = {
              x: target.x || 0,
              y: target.y || 0,
              direction: target.direction || 0,
              size: target.size || 100,
              visible: target.visible !== false,
            };

            this.spriteStates[spriteName] = state;

            this.logger.log(`\n  Sprite: "${spriteName}"`);
            this.logger.log(`    Position: (${state.x}, ${state.y})`);
            this.logger.log(`    Direction: ${state.direction}°`);
            this.logger.log(`    Size: ${state.size}%`);
            this.logger.log(`    Visible: ${state.visible}`);
          }
        }
        this.logger.success(`\n✓ Collected ${spriteCount} sprite state(s)`);

        const referencedSprites = this.collectAllReferencedSprites(targets);
        for (const spriteName of referencedSprites) {
          if (!this.spriteStates[spriteName]) {
            // Initialize referenced but not scripted sprites
            this.spriteStates[spriteName] = {
              x: 0,
              y: 0,
              direction: 90,
              size: 100,
              visible: true,
            };
            this.logger.log(`  Added referenced sprite: "${spriteName}"`);
          }
        }

        // ==================== STEP 2: BUILD BROADCAST MAP ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 2: BUILDING BROADCAST MAP");
        this.logger.log("=".repeat(70));

        this.broadcastMap = {};
        let broadcastCount = 0;

        // Check stage variables
        const stage = runtime.getTargetForStage();
        if (stage && stage.variables) {
          this.logger.log("\n  Checking the Stage variables...");
          for (const varId in stage.variables) {
            const variable = stage.variables[varId];
            this.logger.debug(
              `    Variable: id="${varId}", name="${variable.name}", type="${variable.type}"`,
            );

            if (variable.type === "broadcast_msg") {
              this.broadcastMap[varId] = variable.name;
              broadcastCount++;
              this.logger.success(
                `    ✓ Mapped broadcast: "${varId}" → "${variable.name}"`,
              );
            }
          }
        }

        // Check all target variables (sprites can have broadcasts too)
        for (const target of targets) {
          if (target.variables) {
            const targetName = target.isStage ? "Stage" : target.sprite.name;
            this.logger.log(`\n  Checking "${targetName}" variables...`);

            for (const varId in target.variables) {
              const variable = target.variables[varId];
              if (variable.type === "broadcast_msg") {
                // Don't overwrite if already mapped
                if (!this.broadcastMap[varId]) {
                  this.broadcastMap[varId] = variable.name;
                  broadcastCount++;
                  this.logger.log(
                    `    ✓ Mapped: ${varId} → "${variable.name}"`,
                  );
                }
              }
            }
          }
        }

        this.logger.success(
          `\n✓ Built broadcast map with ${broadcastCount} message(s)`,
        );
        if (broadcastCount > 0) {
          this.logger.log("\n  Broadcast Map:");
          for (const [id, name] of Object.entries(this.broadcastMap)) {
            this.logger.log(`    ${id} → "${name}"`);
          }
        }

        // ==================== STEP 3: COLLECT VARIABLES ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 3: COLLECTING VARIABLES");
        this.logger.log("=".repeat(70));

        let varCount = 0;
        for (const target of targets) {
          if (target.variables) {
            const targetName = target.isStage ? "Stage" : target.sprite.name;
            this.logger.log(`\n  Checking "${targetName}" variables...`);

            for (const varId in target.variables) {
              const variable = target.variables[varId];

              // Only collect regular variables, not broadcasts or lists
              if (
                !variable.type ||
                variable.type === "" ||
                variable.type === "scalar"
              ) {
                const varName = variable.name;
                const sanitized = this.sanitizeName(varName);

                // Don't overwrite if already defined
                if (!this.variables.has(varName)) {
                  this.variables.set(varName, sanitized);
                  varCount++;
                  this.logger.log(
                    `    ✓ Variable: "${varName}" → ${sanitized}`,
                  );
                }
              }
            }
          }
        }

        this.logger.success(`\n✓ Collected ${varCount} variable(s)`);

        // ==================== STEP 4: GENERATE BOILERPLATE ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 4: GENERATING BOILERPLATE CODE");
        this.logger.log("=".repeat(70));

        this.generateHeader();
        this.logger.log("  ✓ Generated header");

        this.generateVariables();
        this.logger.log(
          `  ✓ Generated ${this.variables.size} variable declaration(s)`,
        );

        this.generateSensorSetup();
        this.logger.log(
          `  ✓ Generated sensor setup (${this.sensorSetup.size} sensor(s))`,
        );

        this.generateSpriteStateManager();
        this.logger.log(
          `  ✓ Generated sprite state manager (${Object.keys(this.spriteStates).length} sprite(s))`,
        );

        // ==================== STEP 5: PROCESS TARGETS ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 5: PROCESSING TARGETS (TRANSPILING BLOCKS)");
        this.logger.log("=".repeat(70));

        const allFunctions = [];
        const mainScripts = [];
        let totalHatBlocks = 0;

        for (const target of targets) {
          const targetName = target.isStage ? "Stage" : target.sprite.name;
          this.activeSpriteName = this.sanitizeName(targetName);

          this.logger.log(`\n  Processing: "${targetName}"`);
          this.logger.log(`    Active sprite name: ${this.activeSpriteName}`);

          const blocks = target.blocks;
          if (!blocks || !blocks._blocks) {
            this.logger.warn(`    ⚠️ No blocks found`);
            continue;
          }

          const blockCount = Object.keys(blocks._blocks).length;
          this.logger.log(`    Block count: ${blockCount}`);

          // Find hat blocks
          const hatBlocks = [];
          for (const blockId in blocks._blocks) {
            const block = blocks._blocks[blockId];
            if (
              block.opcode === "event_whenflagclicked" ||
              block.opcode === "event_whenbroadcastreceived"
            ) {
              hatBlocks.push(block);
            }
          }

          this.logger.log(`    Hat blocks found: ${hatBlocks.length}`);
          totalHatBlocks += hatBlocks.length;

          // Process each hat block
          for (let i = 0; i < hatBlocks.length; i++) {
            const hatBlock = hatBlocks[i];
            this.logger.log(
              `\n    Processing hat block ${i + 1}/${hatBlocks.length}: ${hatBlock.opcode}`,
            );

            const funcCode = [];
            const savePreviousCode = this.code;
            this.code = funcCode;

            try {
              const funcName = this.processHatBlock(hatBlock, blocks);

              if (funcName) {
                allFunctions.push(funcCode);

                if (hatBlock.opcode === "event_whenflagclicked") {
                  mainScripts.push(funcName);
                  this.logger.success(
                    `      ✓ Created main script: ${funcName}`,
                  );
                } else {
                  this.logger.success(`      ✓ Created function: ${funcName}`);
                }
              }
            } catch (error) {
              this.logger.error(`      ❌ Failed to process hat block:`, error);
            } finally {
              this.code = savePreviousCode;
            }
          }
        }

        this.logger.success(
          `\n✓ Processed ${totalHatBlocks} hat block(s) total`,
        );
        this.logger.log(`  Generated ${allFunctions.length} function(s)`);
        this.logger.log(`  Main scripts (green flag): ${mainScripts.length}`);

        // ==================== STEP 6: ASSEMBLE FINAL CODE ====================
        this.logger.log("\n" + "=".repeat(70));
        this.logger.log("STEP 6: ASSEMBLING FINAL CODE");
        this.logger.log("=".repeat(70));

        // Add all functions
        for (let i = 0; i < allFunctions.length; i++) {
          this.logger.log(
            `  Adding function ${i + 1}/${allFunctions.length}...`,
          );
          this.code.push(...allFunctions[i]);
        }

        // Generate main() function
        this.logger.log("\n  Generating main() function...");
        this.addLine("\ntask main() {");
        this.increaseIndent();

        if (this.sensorSetup.size > 0) {
          this.addLine("InitSensors();");
          this.logger.log("    ✓ Added InitSensors() call");
        }

        if (Object.keys(this.spriteStates).length > 0) {
          this.addLine("InitSprites();");
          this.logger.log("    ✓ Added InitSprites() call");
        }

        if (mainScripts.length > 0) {
          for (const scriptName of mainScripts) {
            this.addLine(`StartTask(${scriptName});`);
            this.logger.log(`    ✓ Added StartTask(${scriptName})`);
          }
        } else {
          this.addLine("// No green flag scripts found");
          this.logger.warn("    ⚠️ No green flag scripts found");
        }

        this.decreaseIndent();
        this.addLine("}");

        // ==================== FINAL STATISTICS ====================
        const finalCode = this.getCode();
        const lineCount = finalCode.split("\n").length;
        const charCount = finalCode.length;

        this.logger.log("\n" + "=".repeat(70));
        this.logger.success("✅ TRANSPILATION COMPLETE!");
        this.logger.log("=".repeat(70));
        this.logger.log("\n📊 FINAL STATISTICS:");
        this.logger.log(`  Total lines: ${lineCount}`);
        this.logger.log(`  Total characters: ${charCount}`);
        this.logger.log(`  Variables: ${this.variables.size}`);
        this.logger.log(
          `  Broadcasts: ${Object.keys(this.broadcastMap).length}`,
        );
        this.logger.log(`  Sprites: ${Object.keys(this.spriteStates).length}`);
        this.logger.log(`  Sensors: ${this.sensorSetup.size}`);
        this.logger.log(`  Functions: ${allFunctions.length}`);
        this.logger.log(`  Main scripts: ${mainScripts.length}`);
        this.logger.log("=".repeat(70) + "\n");

        return finalCode;
      } catch (error) {
        this.logger.log("\n" + "=".repeat(70));
        this.logger.error("❌ TRANSPILATION FAILED!");
        this.logger.log("=".repeat(70));
        this.logger.error("Error details:", error);
        this.logger.error("Stack trace:", error.stack);
        throw error;
      }
    }
  }

  // ==================== NXT PERIPHERAL CLASS (BT VERSION) ====================

  class NXTPeripheral {
    constructor(runtime, extensionId) {
      this.runtime = runtime;
      this.extensionId = extensionId;

      // BT connection
      this._bt = null;
      this._connected = false;
      this._rateLimiter = new RateLimiter(NXT_BT_SEND_RATE_MAX);

      // Data buffer for handling fragmented packets
      this._dataBuffer = [];

      // State
      this.batteryLevel = 0;
      this.motorState = {
        A: { power: 0, tachoCount: 0, position: 0 },
        B: { power: 0, tachoCount: 0, position: 0 },
        C: { power: 0, tachoCount: 0, position: 0 },
      };
      this.sensorState = {
        S1: { type: "none", value: 0, rawValue: 0 },
        S2: { type: "none", value: 0, rawValue: 0 },
        S3: { type: "none", value: 0, rawValue: 0 },
        S4: { type: "none", value: 0, rawValue: 0 },
      };

      this.ultrasonicDistance = { S1: 0, S2: 0, S3: 0, S4: 0 };
      this.screenBuffer = new Uint8Array(DISPLAY_BUFFER_SIZE);

      // Request tracking
      this.pendingRequests = new Map();
      this.requestId = 0;

      // Bind methods
      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);

      // Register with runtime
      if (this.runtime) {
        this.runtime.registerPeripheralExtension(extensionId, this);
      }

      logger.debug("NXTPeripheral initialized");
    }

    // ==================== CONNECTION ====================

    scan() {
      logger.log("Starting NXT scan...");
      if (this._bt) {
        this._bt.disconnect();
      }

      this._bt = new BT(
        this.runtime,
        this.extensionId,
        {
          majorDeviceClass: 8,
          minorDeviceClass: 1,
        },
        this._onConnect,
        this.reset,
        this._onMessage,
      );
    }

    connect(id) {
      logger.log(`Connecting to NXT: ${id}`);
      if (this._bt) {
        this._bt.connectPeripheral(id, NXT_PAIRING_PIN);
      }
    }

    disconnect() {
      logger.log("Disconnecting from NXT");
      if (this._bt) {
        this._bt.disconnect();
      }
      this.reset();
    }

    reset() {
      logger.log("Resetting NXT peripheral");
      this._connected = false;
      this._dataBuffer = [];
      this.batteryLevel = 0;
      this.motorState = {
        A: { power: 0, tachoCount: 0, position: 0 },
        B: { power: 0, tachoCount: 0, position: 0 },
        C: { power: 0, tachoCount: 0, position: 0 },
      };
      this.sensorState = {
        S1: { type: "none", value: 0, rawValue: 0 },
        S2: { type: "none", value: 0, rawValue: 0 },
        S3: { type: "none", value: 0, rawValue: 0 },
        S4: { type: "none", value: 0, rawValue: 0 },
      };
      this.ultrasonicDistance = { S1: 0, S2: 0, S3: 0, S4: 0 };
      this.screenBuffer = new Uint8Array(DISPLAY_BUFFER_SIZE);
      this.pendingRequests.clear();
    }

    isConnected() {
      return this._connected && this._bt && this._bt.isConnected();
    }

    _onConnect() {
      logger.success("NXT connected via Bluetooth!");
      this._connected = true;

      // Get firmware version to confirm connection
      this.getFirmwareVersion().then((version) => {
        logger.success(`NXT Firmware Version: ${version}`);
      });
    }

    _onMessage(params) {
      const message = params.message;
      const data = Base64Util.base64ToUint8Array(message);

      logger.debug(`Received ${data.length} bytes from NXT`);

      // Buffer the incoming data
      this._dataBuffer.push(...Array.from(data));

      // Process all complete packets in buffer
      while (this._dataBuffer.length >= 2) {
        const len = this._dataBuffer[0] | (this._dataBuffer[1] << 8);

        if (this._dataBuffer.length < len + 2) {
          // Not enough data yet
          break;
        }

        // Remove length header
        this._dataBuffer.splice(0, 2);

        // Extract complete packet
        const packet = this._dataBuffer.splice(0, len);

        // Process the packet
        this._processPacket(new Uint8Array(packet));
      }
    }

    _processPacket(telegram) {
      if (telegram.length === 0) return;

      const messageType = telegram[0];
      const command = telegram[1];

      logger.debug(
        `Processing packet: type=0x${messageType.toString(16)}, cmd=0x${command.toString(16)}, len=${telegram.length}`,
      );

      if (messageType === NXT_OPCODE.REPLY) {
        const status = telegram[2];
        logger.debug(
          `Reply status: 0x${status.toString(16)} (${NXT_ERROR[status] || "Unknown"})`,
        );

        // Resolve pending requests
        for (const [id, resolve] of this.pendingRequests.entries()) {
          resolve(telegram);
          this.pendingRequests.delete(id);
          break;
        }
      }
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async sendTelegram(
      command,
      payload = [],
      requireReply = true,
      isSystemCmd = false,
    ) {
      if (!this.isConnected()) {
        logger.warn("Cannot send telegram - not connected");
        throw new Error("NXT not connected");
      }

      const messageType = isSystemCmd
        ? requireReply
          ? NXT_OPCODE.SYSTEM_CMD
          : NXT_OPCODE.SYSTEM_CMD_NO_REPLY
        : requireReply
          ? NXT_OPCODE.DIRECT_CMD
          : NXT_OPCODE.DIRECT_CMD_NO_REPLY;

      const telegram = [messageType, command, ...payload];
      const length = telegram.length;
      const packet = new Uint8Array([
        length & 0xff,
        (length >> 8) & 0xff,
        ...telegram,
      ]);

      logger.debug(
        `Sending telegram: cmd=0x${command.toString(16)}, len=${length}, reply=${requireReply}`,
      );

      // Rate limiting
      if (!this._rateLimiter.okayToSend()) {
        logger.debug("Rate limited - waiting");
        await this.sleep(50);
      }

      // Send via BT
      await this._bt.sendMessage({
        message: Base64Util.uint8ArrayToBase64(packet),
        encoding: "base64",
      });

      if (requireReply) {
        return new Promise((resolve, reject) => {
          const id = this.requestId++;
          this.pendingRequests.set(id, resolve);
          setTimeout(() => {
            if (this.pendingRequests.has(id)) {
              this.pendingRequests.delete(id);
              logger.warn(`Request ${id} timed out`);
              reject(new Error("Request timed out - no response from NXT"));
            }
          }, 5000); // 5 second timeout
        });
      }

      return null;
    }

    // ==================== FIRMWARE ====================

    async getFirmwareVersion() {
      const reply = await this.sendTelegram(
        NXT_OPCODE.GET_FIRMWARE_VERSION,
        [],
        true,
        true,
      );
      if (reply && reply.length >= 7) {
        const minor = reply[3];
        const major = reply[4];
        return `${major}.${minor}`;
      }
      return "Unknown";
    }

    // ==================== MOTORS ====================

    async setMotorPower(port, power, immediate = true) {
      logger.log(`Setting motor ${port} to power ${power}`);
      const portNum = PORT[port];
      const clampedPower = MathUtil.clamp(power, -100, 100);
      const absPower = Math.abs(clampedPower);

      const mode = MOTOR_MODE.ON_BRAKE_REGULATED;
      const regulationMode = REGULATION_MODE.SPEED;
      const turnRatio = 0;
      const runState = RUN_STATE.RUNNING;
      const tachoLimit = 0;

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [
          portNum,
          clampedPower < 0 ? -absPower : absPower,
          mode,
          regulationMode,
          turnRatio,
          runState,
          tachoLimit & 0xff,
          (tachoLimit >> 8) & 0xff,
          (tachoLimit >> 16) & 0xff,
          (tachoLimit >> 24) & 0xff,
        ],
        false,
      );

      this.motorState[port].power = clampedPower;
    }

    async motorRunForDegrees(port, power, degrees) {
      logger.log(`Running motor ${port} for ${degrees}° at power ${power}`);
      const portNum = PORT[port];
      const clampedPower = MathUtil.clamp(power, -100, 100);
      const absPower = Math.abs(clampedPower);

      const mode = MOTOR_MODE.ON_BRAKE_REGULATED;
      const regulationMode = REGULATION_MODE.SPEED;
      const turnRatio = 0;
      const runState = RUN_STATE.RUNNING;
      const tachoLimit = Math.abs(degrees);

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [
          portNum,
          clampedPower < 0 ? -absPower : absPower,
          mode,
          regulationMode,
          turnRatio,
          runState,
          tachoLimit & 0xff,
          (tachoLimit >> 8) & 0xff,
          (tachoLimit >> 16) & 0xff,
          (tachoLimit >> 24) & 0xff,
        ],
        false,
      );
    }

    async motorStop(port, brake = true) {
      logger.log(`Stopping motor ${port} (brake: ${brake})`);
      const portNum = PORT[port];
      const mode = brake ? MOTOR_MODE.BRAKE : MOTOR_MODE.IDLE;

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [portNum, 0, mode, REGULATION_MODE.IDLE, 0, RUN_STATE.IDLE, 0, 0, 0, 0],
        false,
      );

      this.motorState[port].power = 0;
    }

    async getMotorPosition(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(
        NXT_OPCODE.GET_OUT_STATE,
        [portNum],
        true,
      );

      if (!reply || reply.length < 25) {
        throw new Error("Invalid GET_OUT_STATE response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `GET_OUT_STATE failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      // Parse all fields
      const ret_port = reply[3];
      const power = reply[4] > 127 ? reply[4] - 256 : reply[4];
      const mode = reply[5];
      const regulation_mode = reply[6];
      const turn_ratio = reply[7] > 127 ? reply[7] - 256 : reply[7];
      const run_state = reply[8];
      const tacho_limit =
        reply[9] | (reply[10] << 8) | (reply[11] << 16) | (reply[12] << 24);

      // Signed 32-bit values
      let tacho_count =
        reply[13] | (reply[14] << 8) | (reply[15] << 16) | (reply[16] << 24);
      if (tacho_count > 0x7fffffff) tacho_count = tacho_count - 0x100000000;

      let block_tacho_count =
        reply[17] | (reply[18] << 8) | (reply[19] << 16) | (reply[20] << 24);
      if (block_tacho_count > 0x7fffffff)
        block_tacho_count = block_tacho_count - 0x100000000;

      let rotation_count =
        reply[21] | (reply[22] << 8) | (reply[23] << 16) | (reply[24] << 24);
      if (rotation_count > 0x7fffffff)
        rotation_count = rotation_count - 0x100000000;

      return {
        port: ret_port,
        power,
        mode,
        regulation_mode,
        turn_ratio,
        run_state,
        tacho_limit,
        tacho_count,
        block_tacho_count,
        rotation_count,
      };
    }

    async resetMotorPosition(port, relative = false) {
      logger.log(`Resetting motor ${port} position (relative: ${relative})`);
      const portNum = PORT[port];
      await this.sendTelegram(
        NXT_OPCODE.RESET_POSITION,
        [portNum, relative ? 1 : 0],
        false,
      );
    }

    // ==================== SENSORS ====================

    async setupSensor(port, type, mode) {
      logger.log(`Setting up sensor on ${port} (type: ${type}, mode: ${mode})`);
      const portNum = PORT[port];
      await this.sendTelegram(
        NXT_OPCODE.SET_IN_MODE,
        [portNum, type, mode],
        false,
      );
      await this.sendTelegram(NXT_OPCODE.RESET_IN_VAL, [portNum], false);
    }

    async setupTouchNXT(port) {
      await this.setupSensor(port, SENSOR_TYPE.SWITCH, SENSOR_MODE.BOOL);
      this.sensorState[port].type = "touch-nxt";
    }

    async setupLightSensor(port, active = true) {
      const type = active
        ? SENSOR_TYPE.LIGHT_ACTIVE
        : SENSOR_TYPE.LIGHT_INACTIVE;
      await this.setupSensor(port, type, SENSOR_MODE.PCT_FULL_SCALE);
      this.sensorState[port].type = "light";
    }

    async setupColorSensor(port, mode = "full") {
      const typeMap = {
        full: SENSOR_TYPE.COLOR_FULL,
        red: SENSOR_TYPE.COLOR_RED,
        green: SENSOR_TYPE.COLOR_GREEN,
        blue: SENSOR_TYPE.COLOR_BLUE,
        none: SENSOR_TYPE.COLOR_NONE,
      };
      await this.setupSensor(port, typeMap[mode], SENSOR_MODE.RAW);
      this.sensorState[port].type = "color";
    }

    async setupSoundSensor(port, adjusted = true) {
      const type = adjusted ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
      await this.setupSensor(port, type, SENSOR_MODE.PCT_FULL_SCALE);
      this.sensorState[port].type = "sound";
    }

    async setupUltrasonicSensor(port) {
      await this.setupSensor(port, SENSOR_TYPE.LOW_SPEED_9V, SENSOR_MODE.RAW);
      this.sensorState[port].type = "ultrasonic";
    }

    async getSensorValue(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(
        NXT_OPCODE.GET_IN_VALS,
        [portNum],
        true,
      );

      if (!reply || reply.length < 16) {
        throw new Error("Invalid GET_IN_VALS response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `GET_IN_VALS failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const ret_port = reply[3];
      const valid = reply[4] !== 0;
      const calibrated = reply[5] !== 0;
      const sensor_type = reply[6];
      const sensor_mode = reply[7];
      const raw_value = reply[8] | (reply[9] << 8);
      const normalized_value = reply[10] | (reply[11] << 8);

      // Signed 16-bit
      let scaled_value = reply[12] | (reply[13] << 8);
      if (scaled_value > 0x7fff) scaled_value = scaled_value - 0x10000;

      let calibrated_value = reply[14] | (reply[15] << 8);
      if (calibrated_value > 0x7fff)
        calibrated_value = calibrated_value - 0x10000;

      return {
        port: ret_port,
        valid,
        calibrated,
        sensor_type,
        sensor_mode,
        raw_value,
        normalized_value,
        scaled_value,
        calibrated_value,
      };
    }

    async getRawSensorValue(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(
        NXT_OPCODE.GET_IN_VALS,
        [portNum],
        true,
      );
      if (reply && reply.length >= 13) {
        const rawValue = reply[10] | (reply[11] << 8);
        this.sensorState[port].rawValue = rawValue;
        return rawValue;
      }
      return 0;
    }

    async getUltrasonicDistance(port) {
      const portNum = PORT[port];

      await this.sendTelegram(
        NXT_OPCODE.LS_WRITE,
        [portNum, 2, 1, 0x02, 0x42],
        false,
      );

      await this.sleep(50);

      const reply = await this.sendTelegram(
        NXT_OPCODE.LS_READ,
        [portNum],
        true,
      );

      if (reply && reply.length >= 4) {
        const bytesRead = reply[3];
        if (bytesRead > 0 && reply.length >= 5) {
          const distance = reply[4];
          this.ultrasonicDistance[port] = distance;
          return distance;
        }
      }

      return this.ultrasonicDistance[port] || 0;
    }

    // ==================== SOUND ====================

    async playTone(freq, ms) {
      logger.log(`Playing tone: ${freq}Hz for ${ms}ms`);
      await this.sendTelegram(
        NXT_OPCODE.PLAY_TONE,
        [freq & 0xff, (freq >> 8) & 0xff, ms & 0xff, (ms >> 8) & 0xff],
        false,
      );
    }

    // ==================== STATUS ====================

    async getBatteryLevel() {
      const reply = await this.sendTelegram(NXT_OPCODE.GET_BATT_LVL, [], true);
      if (reply && reply.length >= 5) {
        const voltage = reply[3] | (reply[4] << 8);
        this.batteryLevel = voltage;
        return voltage;
      }
      return 0;
    }

    // ==================== DISPLAY ====================

    async readScreenBuffer() {
      logger.log("Reading screen buffer from NXT...");

      this.screenBuffer = new Uint8Array(DISPLAY_BUFFER_SIZE);

      const CHUNK_SIZE = 32;
      const chunks = Math.ceil(DISPLAY_BUFFER_SIZE / CHUNK_SIZE);

      for (let i = 0; i < chunks; i++) {
        const offset = DISPLAY_OFFSET + i * CHUNK_SIZE;
        const size = Math.min(CHUNK_SIZE, DISPLAY_BUFFER_SIZE - i * CHUNK_SIZE);

        const result = await this.read_io_map(MODULE_DISPLAY, offset, size);

        this.screenBuffer.set(result.data, i * CHUNK_SIZE);

        await this.sleep(20);
      }

      logger.success(`Read ${DISPLAY_BUFFER_SIZE} bytes from display`);
    }

    async updateDisplay() {
      logger.log("Updating NXT display...");

      const CHUNK_SIZE = 59;
      const chunks = Math.ceil(DISPLAY_BUFFER_SIZE / CHUNK_SIZE);

      for (let i = 0; i < chunks; i++) {
        const offset = DISPLAY_OFFSET + i * CHUNK_SIZE;
        const chunkSize = Math.min(
          CHUNK_SIZE,
          DISPLAY_BUFFER_SIZE - i * CHUNK_SIZE,
        );
        const chunkData = this.screenBuffer.slice(
          i * CHUNK_SIZE,
          i * CHUNK_SIZE + chunkSize,
        );

        await this.write_io_map(MODULE_DISPLAY, offset, chunkData);

        await this.sleep(20);
      }

      logger.success("Display updated");
    }

    clearScreenBuffer() {
      this.screenBuffer.fill(0);
    }

    setPixel(x, y, on = true) {
      x = Math.floor(x);
      y = Math.floor(y);

      if (x < 0 || x >= DISPLAY_WIDTH || y < 0 || y >= DISPLAY_HEIGHT) {
        return;
      }

      const byteIndex = Math.floor(x) + Math.floor(y / 8) * DISPLAY_WIDTH;
      const bitIndex = y % 8;

      if (on) {
        this.screenBuffer[byteIndex] |= 1 << bitIndex;
      } else {
        this.screenBuffer[byteIndex] &= ~(1 << bitIndex);
      }
    }

    async drawText(text, x, y) {
      logger.log(`Drawing text "${text}" at (${x}, ${y})`);
      const str = String(text);
      let currentX = Math.floor(x);

      for (const char of str) {
        const pattern = FONT_5X7[char.toUpperCase()] || FONT_5X7[" "];

        for (let col = 0; col < 5; col++) {
          const colData = pattern[col];
          for (let row = 0; row < 7; row++) {
            const on = (colData & (1 << row)) !== 0;
            this.setPixel(currentX + col, y + row, on);
          }
        }

        currentX += 6;
        if (currentX >= DISPLAY_WIDTH) break;
      }

      await this.updateDisplay();
    }

    async drawLine(x1, y1, x2, y2) {
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

      await this.updateDisplay();
    }

    async drawRect(x, y, w, h, filled = false) {
      x = Math.floor(x);
      y = Math.floor(y);
      w = Math.floor(w);
      h = Math.floor(h);

      if (filled) {
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < h; j++) {
            this.setPixel(x + i, y + j, true);
          }
        }
      } else {
        for (let i = 0; i < w; i++) {
          this.setPixel(x + i, y, true);
          this.setPixel(x + i, y + h - 1, true);
        }
        for (let j = 0; j < h; j++) {
          this.setPixel(x, y + j, true);
          this.setPixel(x + w - 1, y + j, true);
        }
      }

      await this.updateDisplay();
    }

    async drawCircle(x, y, r, filled = false) {
      x = Math.floor(x);
      y = Math.floor(y);
      r = Math.floor(r);

      if (filled) {
        for (let i = -r; i <= r; i++) {
          for (let j = -r; j <= r; j++) {
            if (i * i + j * j <= r * r) {
              this.setPixel(x + i, y + j, true);
            }
          }
        }
      } else {
        let px = 0;
        let py = r;
        let d = 1 - r;

        while (px <= py) {
          this.setPixel(x + px, y + py, true);
          this.setPixel(x - px, y + py, true);
          this.setPixel(x + px, y - py, true);
          this.setPixel(x - px, y - py, true);
          this.setPixel(x + py, y + px, true);
          this.setPixel(x - py, y + px, true);
          this.setPixel(x + py, y - px, true);
          this.setPixel(x - py, y - px, true);

          if (d < 0) {
            d += 2 * px + 3;
          } else {
            d += 2 * (px - py) + 5;
            py--;
          }
          px++;
        }
      }

      await this.updateDisplay();
    }

    async drawPattern(pattern) {
      this.clearScreenBuffer();

      switch (pattern) {
        case "checkerboard":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, (x + y) % 2 === 0);
            }
          }
          break;

        case "stripes-h":
          for (let y = 0; y < DISPLAY_HEIGHT; y++) {
            for (let x = 0; x < DISPLAY_WIDTH; x++) {
              this.setPixel(x, y, y % 4 < 2);
            }
          }
          break;

        case "stripes-v":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, x % 4 < 2);
            }
          }
          break;

        case "grid":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, x % 10 === 0 || y % 10 === 0);
            }
          }
          break;

        case "dots":
          for (let x = 0; x < DISPLAY_WIDTH; x += 5) {
            for (let y = 0; y < DISPLAY_HEIGHT; y += 5) {
              this.setPixel(x, y, true);
            }
          }
          break;

        case "border":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            this.setPixel(x, 0, true);
            this.setPixel(x, DISPLAY_HEIGHT - 1, true);
          }
          for (let y = 0; y < DISPLAY_HEIGHT; y++) {
            this.setPixel(0, y, true);
            this.setPixel(DISPLAY_WIDTH - 1, y, true);
          }
          break;

        case "smile":
          this.drawCircle(50, 32, 25, false);
          this.setPixel(40, 25, true);
          this.setPixel(60, 25, true);
          for (let x = 35; x <= 65; x++) {
            const y =
              35 + Math.floor(Math.sqrt(225 - (x - 50) * (x - 50)) * 0.3);
            this.setPixel(x, y, true);
          }
          break;
      }

      await this.updateDisplay();
    }

    // ==================== ADVANCED METHODS ====================

    async read_io_map(mod_id, offset, size) {
      logger.debug(
        `Reading IO map: module=0x${mod_id.toString(16)}, offset=${offset}, size=${size}`,
      );

      const reply = await this.sendTelegram(
        NXT_OPCODE.READ_IO_MAP,
        [
          mod_id & 0xff,
          (mod_id >> 8) & 0xff,
          (mod_id >> 16) & 0xff,
          (mod_id >> 24) & 0xff,
          offset & 0xff,
          (offset >> 8) & 0xff,
          size & 0xff,
          (size >> 8) & 0xff,
        ],
        true,
        true,
      );

      if (!reply || reply.length < 6) {
        throw new Error("Invalid read_io_map response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `read_io_map failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const ret_mod_id =
        reply[3] | (reply[4] << 8) | (reply[5] << 16) | (reply[6] << 24);
      const ret_size = reply[7] | (reply[8] << 8);
      const data = reply.slice(9, 9 + ret_size);

      logger.debug(
        `Read ${ret_size} bytes from module 0x${ret_mod_id.toString(16)}`,
      );

      return { mod_id: ret_mod_id, data: new Uint8Array(data) };
    }

    async write_io_map(mod_id, offset, data) {
      logger.debug(
        `Writing IO map: module=0x${mod_id.toString(16)}, offset=${offset}, size=${data.length}`,
      );

      const reply = await this.sendTelegram(
        NXT_OPCODE.WRITE_IO_MAP,
        [
          mod_id & 0xff,
          (mod_id >> 8) & 0xff,
          (mod_id >> 16) & 0xff,
          (mod_id >> 24) & 0xff,
          offset & 0xff,
          (offset >> 8) & 0xff,
          data.length & 0xff,
          (data.length >> 8) & 0xff,
          ...Array.from(data),
        ],
        true,
        true,
      );

      if (!reply || reply.length < 6) {
        throw new Error("Invalid write_io_map response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `write_io_map failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const ret_mod_id =
        reply[3] | (reply[4] << 8) | (reply[5] << 16) | (reply[6] << 24);
      const ret_size = reply[7] | (reply[8] << 8);

      logger.debug(
        `Wrote ${ret_size} bytes to module 0x${ret_mod_id.toString(16)}`,
      );

      return { mod_id: ret_mod_id, size: ret_size };
    }

    async message_write(mailbox, message) {
      logger.log(`Writing message to mailbox ${mailbox}: "${message}"`);

      const messageBytes =
        typeof message === "string"
          ? Array.from(new TextEncoder().encode(message))
          : Array.from(message);

      messageBytes.push(0);

      await this.sendTelegram(
        NXT_OPCODE.MESSAGE_WRITE,
        [mailbox, messageBytes.length, ...messageBytes],
        false,
      );
    }

    async message_read(remote_inbox, local_inbox, remove = true) {
      logger.log(`Reading message from mailbox ${remote_inbox}...`);

      const reply = await this.sendTelegram(
        NXT_OPCODE.MESSAGE_READ,
        [remote_inbox, local_inbox, remove ? 1 : 0],
        true,
      );

      if (!reply || reply.length < 5) {
        throw new Error("Invalid message_read response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `message_read failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const ret_local_inbox = reply[3];
      const size = reply[4];
      const message = reply.slice(5, 5 + size);

      logger.log(`Read ${size} bytes from mailbox ${ret_local_inbox}`);

      return { local_inbox: ret_local_inbox, message: new Uint8Array(message) };
    }

    async start_program(filename) {
      logger.log(`Starting program: ${filename}`);

      const filenameBytes = new Array(20).fill(0);
      for (let i = 0; i < Math.min(filename.length, 19); i++) {
        filenameBytes[i] = filename.charCodeAt(i);
      }

      const reply = await this.sendTelegram(
        NXT_OPCODE.START_PROGRAM,
        filenameBytes,
        true,
      );

      if (!reply || reply.length < 3) {
        throw new Error("Invalid start_program response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `start_program failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      logger.success(`Program "${filename}" started`);
    }

    async stop_program() {
      logger.log("Stopping program...");

      const reply = await this.sendTelegram(NXT_OPCODE.STOP_PROGRAM, [], true);

      if (!reply || reply.length < 3) {
        throw new Error("Invalid stop_program response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `stop_program failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      logger.success("Program stopped");
    }

    async keep_alive() {
      const reply = await this.sendTelegram(NXT_OPCODE.KEEP_ALIVE, [], true);

      if (!reply || reply.length < 7) {
        throw new Error("Invalid keep_alive response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `keep_alive failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const sleep_time =
        reply[3] | (reply[4] << 8) | (reply[5] << 16) | (reply[6] << 24);

      logger.log(`Keep alive OK, sleep time: ${sleep_time}ms`);

      return sleep_time;
    }

    async ls_get_status(port) {
      const portNum = PORT[port];

      const reply = await this.sendTelegram(
        NXT_OPCODE.LS_GET_STATUS,
        [portNum],
        true,
      );

      if (!reply || reply.length < 4) {
        throw new Error("Invalid ls_get_status response");
      }

      const status = reply[2];
      if (status !== 0x00 && status !== 0x20) {
        throw new Error(
          `ls_get_status failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      const bytes_ready = reply[3];

      return { status, bytes_ready };
    }

    async get_device_info() {
      logger.log("Getting device info...");

      const reply = await this.sendTelegram(
        NXT_OPCODE.GET_DEVICE_INFO,
        [],
        true,
        true,
      );

      if (!reply || reply.length < 33) {
        throw new Error("Invalid get_device_info response");
      }

      const status = reply[2];
      if (status !== 0x00) {
        throw new Error(
          `get_device_info failed: ${NXT_ERROR[status] || "Unknown error"}`,
        );
      }

      // Parse name (15 bytes, null-terminated)
      let name = "";
      for (let i = 0; i < 15; i++) {
        const char = reply[3 + i];
        if (char === 0) break;
        name += String.fromCharCode(char);
      }

      // Parse Bluetooth address (6 bytes)
      const a0 = reply[18];
      const a1 = reply[19];
      const a2 = reply[20];
      const a3 = reply[21];
      const a4 = reply[22];
      const a5 = reply[23];
      const address = `${a0.toString(16).padStart(2, "0").toUpperCase()}:${a1.toString(16).padStart(2, "0").toUpperCase()}:${a2.toString(16).padStart(2, "0").toUpperCase()}:${a3.toString(16).padStart(2, "0").toUpperCase()}:${a4.toString(16).padStart(2, "0").toUpperCase()}:${a5.toString(16).padStart(2, "0").toUpperCase()}`;

      const signal_strengths = [reply[25], reply[26], reply[27], reply[28]];

      const user_flash =
        reply[29] | (reply[30] << 8) | (reply[31] << 16) | (reply[32] << 24);

      logger.log(`Device: ${name}, Address: ${address}, Flash: ${user_flash}`);

      return { name, address, signal_strengths, user_flash };
    }
  }

  // ==================== LEGO NXT EXTENSION ====================

  class LegoNXTExtension {
    constructor(runtime) {
      this.runtime = runtime;
      if (!this.runtime && typeof Scratch !== "undefined" && Scratch.vm) {
        this.runtime = Scratch.vm.runtime;
      }

      this.peripheral = new NXTPeripheral(this.runtime, "legonxt");
      this.transpiler = new NXCTranspiler();

      // Sprite state tracking (for runtime)
      this.spriteStates = {};

      // Code generation state
      this.nxcCode = null;
      this.rxeBase64 = null;
      this.compilerUrl = "https://lego-compiler.vercel.app";

      logger.success(
        "Extension initialized with Bluetooth, transpilation, and sprite state support",
      );
    }

    getInfo() {
      return {
        id: "legonxt",
        name: "LEGO NXT",
        color1: "#FF6B00",
        color2: "#CC5500",
        blockIconURI:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjRkY2QjAwIi8+PC9zdmc+",
        showStatusButton: true,
        blocks: [
          formatMessage("legonxt.connection"),
          {
            opcode: "connect",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.connect"),
          },
          {
            opcode: "disconnect",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.disconnect"),
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: formatMessage("legonxt.isConnected"),
          },

          "---",
          formatMessage("legonxt.motors"),
          {
            opcode: "motorOn",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.motorOn"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "motorRunDegrees",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.motorRunDegrees"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              DEGREES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
            },
          },
          {
            opcode: "motorRunRotations",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.motorRunRotations"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.motorStop"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              ACTION: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_STOP",
                defaultValue: "brake",
              },
            },
          },
          {
            opcode: "getMotorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorPosition"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "resetMotorPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.resetMotorPosition"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },

          "---",
          formatMessage("legonxt.advancedMotors"),
          {
            opcode: "getMotorPower",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorPower"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorMode",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorMode"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorRegulationMode",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorRegulationMode"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorTurnRatio",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorTurnRatio"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorRunState",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorRunState"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorTachoLimit",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorTachoLimit"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorTachoCount",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorTachoCount"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorBlockTachoCount",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorBlockTachoCount"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorRotationCount",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getMotorRotationCount"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },

          "---",
          formatMessage("legonxt.touchSensor"),
          {
            opcode: "setupTouchSensorNXT",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.setupTouchSensorNXT"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "isTouchPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: formatMessage("legonxt.isTouchPressed"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.lightSensor"),
          {
            opcode: "setupLightSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.setupLightSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "LED_STATE",
                defaultValue: "on",
              },
            },
          },
          {
            opcode: "getLightLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getLightLevel"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.colorSensor"),
          {
            opcode: "setupColorSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.setupColorSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "COLOR_MODE",
                defaultValue: "all colors",
              },
            },
          },
          {
            opcode: "getColor",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getColor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.soundSensor"),
          {
            opcode: "setupSoundSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.setupSoundSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "SOUND_MODE",
                defaultValue: "dBA",
              },
            },
          },
          {
            opcode: "getSoundLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSoundLevel"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.ultrasonicSensor"),
          {
            opcode: "setupUltrasonicSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.setupUltrasonicSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getDistance",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getDistance"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.advancedSensors"),
          {
            opcode: "getSensorPort",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorPort"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorValid",
            blockType: Scratch.BlockType.BOOLEAN,
            text: formatMessage("legonxt.getSensorValid"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorCalibrated",
            blockType: Scratch.BlockType.BOOLEAN,
            text: formatMessage("legonxt.getSensorCalibrated"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorType",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorType"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorMode",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorMode"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorRawValue",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorRawValue"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorNormalizedValue",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorNormalizedValue"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorScaledValue",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorScaledValue"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "getSensorCalibratedValue",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSensorCalibratedValue"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.sound"),
          {
            opcode: "playTone",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.playTone"),
            arguments: {
              FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 440 },
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1000 },
            },
          },
          {
            opcode: "playNote",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.playNote"),
            arguments: {
              NOTE: {
                type: Scratch.ArgumentType.STRING,
                menu: "NOTE",
                defaultValue: "C4",
              },
              BEATS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },

          "---",
          formatMessage("legonxt.display"),
          {
            opcode: "captureScreen",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.captureScreen"),
          },
          {
            opcode: "clearScreen",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.clearScreen"),
          },
          {
            opcode: "updateDisplay",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.updateDisplay"),
          },
          {
            opcode: "drawText",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawText"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "HELLO",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "drawPixel",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawPixel"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "PIXEL_STATE",
                defaultValue: "on",
              },
            },
          },
          {
            opcode: "drawLine",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawLine"),
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 99 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 63 },
            },
          },
          {
            opcode: "drawRect",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawRect"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 25 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              FILL: {
                type: Scratch.ArgumentType.STRING,
                menu: "RECT_FILL",
                defaultValue: "outline",
              },
            },
          },
          {
            opcode: "drawCircle",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawCircle"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              FILL: {
                type: Scratch.ArgumentType.STRING,
                menu: "RECT_FILL",
                defaultValue: "outline",
              },
            },
          },
          {
            opcode: "drawPattern",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.drawPattern"),
            arguments: {
              PATTERN: {
                type: Scratch.ArgumentType.STRING,
                menu: "PATTERN",
                defaultValue: "checkerboard",
              },
            },
          },

          "---",
          formatMessage("legonxt.status"),
          {
            opcode: "getBattery",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getBattery"),
          },
          {
            opcode: "getRawSensorValue",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getRawSensorValue"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.spriteState"),
          {
            opcode: "spriteGetX",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.spriteGetX"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetY",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.spriteGetY"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetSize",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.spriteGetSize"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetVisible",
            blockType: Scratch.BlockType.BOOLEAN,
            text: formatMessage("legonxt.spriteGetVisible"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteSetPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.spriteSetPosition"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "spriteSetSize",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.spriteSetSize"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "spriteSetVisible",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.spriteSetVisible"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              VISIBLE: {
                type: Scratch.ArgumentType.BOOLEAN,
                defaultValue: true,
              },
            },
          },

          "---",
          formatMessage("legonxt.codeGeneration"),
          {
            opcode: "transpileProject",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.transpileProject"),
          },
          {
            opcode: "showNXCCode",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.showNXCCode"),
          },
          {
            opcode: "downloadNXC",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.downloadNXC"),
          },
          {
            opcode: "compileToRXE",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.compileToRXE"),
          },
          {
            opcode: "uploadToNXT",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.uploadToNXT"),
          },
          {
            opcode: "fullWorkflow",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.fullWorkflow"),
          },

          "---",
          formatMessage("legonxt.deviceInfo"),
          {
            opcode: "getDeviceName",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getDeviceName"),
          },
          {
            opcode: "getBluetoothAddress",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getBluetoothAddress"),
          },
          {
            opcode: "getFreeFlash",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getFreeFlash"),
          },
          {
            opcode: "getSignalStrength",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getSignalStrength"),
          },

          "---",
          formatMessage("legonxt.mailbox"),
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.sendMessage"),
            arguments: {
              MSG: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello" },
              BOX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "receiveMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.receiveMessage"),
            arguments: {
              BOX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              REMOVE: {
                type: Scratch.ArgumentType.STRING,
                menu: "REMOVE_MSG",
                defaultValue: "and remove",
              },
            },
          },

          "---",
          formatMessage("legonxt.lowLevelI2C"),
          {
            opcode: "getLowSpeedStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getLowSpeedStatus"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          formatMessage("legonxt.programControl"),
          {
            opcode: "startProgram",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.startProgram"),
            arguments: {
              FILENAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "program.rxe",
              },
            },
          },
          {
            opcode: "stopProgram",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.stopProgram"),
          },
          {
            opcode: "keepAlive",
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage("legonxt.keepAlive"),
          },
          {
            opcode: "getCurrentProgram",
            blockType: Scratch.BlockType.REPORTER,
            text: formatMessage("legonxt.getCurrentProgram"),
          },
        ],
        menus: {
          MOTOR_PORT: { acceptReporters: true, items: ["A", "B", "C"] },
          SENSOR_PORT: {
            acceptReporters: true,
            items: ["S1", "S2", "S3", "S4"],
          },
          COLOR_MODE: {
            acceptReporters: false,
            items: ["all colors", "red", "green", "blue", "none"],
          },
          MOTOR_STOP: { acceptReporters: false, items: ["brake", "coast"] },
          LED_STATE: { acceptReporters: false, items: ["on", "off"] },
          SOUND_MODE: { acceptReporters: false, items: ["dBA", "dB"] },
          PIXEL_STATE: { acceptReporters: false, items: ["on", "off"] },
          RECT_FILL: { acceptReporters: false, items: ["outline", "filled"] },
          REMOVE_MSG: {
            acceptReporters: false,
            items: ["and remove", "keep in mailbox"],
          },
          PATTERN: {
            acceptReporters: false,
            items: [
              "checkerboard",
              "stripes-h",
              "stripes-v",
              "grid",
              "dots",
              "border",
              "smile",
            ],
          },
          NOTE: {
            acceptReporters: false,
            items: [
              "C4",
              "C#4",
              "D4",
              "D#4",
              "E4",
              "F4",
              "F#4",
              "G4",
              "G#4",
              "A4",
              "A#4",
              "B4",
              "C5",
              "C#5",
              "D5",
              "D#5",
              "E5",
              "F5",
              "F#5",
              "G5",
              "G#5",
              "A5",
              "A#5",
              "B5",
            ],
          },
        },
      };
    }

    // ==================== CONNECTION ====================
    connect() {
      return this.peripheral.scan();
    }
    disconnect() {
      return this.peripheral.disconnect();
    }
    isConnected() {
      return this.peripheral.isConnected();
    }

    // ==================== SPRITE STATE BLOCKS (RUNTIME) ====================

    spriteGetX(args) {
      const spriteName = args.SPRITE;
      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }
      logger.debug(
        `Get sprite ${spriteName} x: ${this.spriteStates[spriteName].x}`,
      );
      return this.spriteStates[spriteName].x;
    }

    spriteGetY(args) {
      const spriteName = args.SPRITE;
      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }
      logger.debug(
        `Get sprite ${spriteName} y: ${this.spriteStates[spriteName].y}`,
      );
      return this.spriteStates[spriteName].y;
    }

    spriteGetSize(args) {
      const spriteName = args.SPRITE;
      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }
      logger.debug(
        `Get sprite ${spriteName} size: ${this.spriteStates[spriteName].size}`,
      );
      return this.spriteStates[spriteName].size;
    }

    spriteGetVisible(args) {
      const spriteName = args.SPRITE;
      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }
      logger.debug(
        `Get sprite ${spriteName} visible: ${this.spriteStates[spriteName].visible}`,
      );
      return this.spriteStates[spriteName].visible;
    }

    spriteSetPosition(args) {
      const spriteName = args.SPRITE;
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);

      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }

      this.spriteStates[spriteName].x = x;
      this.spriteStates[spriteName].y = y;

      logger.log(`Set sprite ${spriteName} position to (${x}, ${y})`);
    }

    spriteSetSize(args) {
      const spriteName = args.SPRITE;
      const size = Cast.toNumber(args.SIZE);

      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }

      this.spriteStates[spriteName].size = size;

      logger.log(`Set sprite ${spriteName} size to ${size}`);
    }

    spriteSetVisible(args) {
      const spriteName = args.SPRITE;
      const visible = Cast.toBoolean(args.VISIBLE);

      if (!this.spriteStates[spriteName]) {
        this.spriteStates[spriteName] = {
          x: 0,
          y: 0,
          size: 100,
          visible: true,
        };
      }

      this.spriteStates[spriteName].visible = visible;

      logger.log(`Set sprite ${spriteName} visible to ${visible}`);
    }

    // ==================== DEVICE INFO ====================

    async getDeviceName() {
      try {
        const info = await this.peripheral.get_device_info();
        return info.name;
      } catch (error) {
        logger.error("Failed to get device name:", error);
        return "Error";
      }
    }

    async getBluetoothAddress() {
      try {
        const info = await this.peripheral.get_device_info();
        return info.address;
      } catch (error) {
        logger.error("Failed to get Bluetooth address:", error);
        return "Error";
      }
    }

    async getFreeFlash() {
      try {
        const info = await this.peripheral.get_device_info();
        return info.user_flash;
      } catch (error) {
        logger.error("Failed to get free flash:", error);
        return 0;
      }
    }

    async getSignalStrength() {
      try {
        const info = await this.peripheral.get_device_info();
        const avg = info.signal_strengths.reduce((a, b) => a + b, 0) / 4;
        return Math.round(avg);
      } catch (error) {
        logger.error("Failed to get signal strength:", error);
        return 0;
      }
    }

    // ==================== MAILBOX MESSAGES ====================

    async sendMessage(args) {
      try {
        const mailbox = Cast.toNumber(args.BOX);
        const message = Cast.toString(args.MSG);
        await this.peripheral.message_write(mailbox, message);
        logger.success(`Message sent to mailbox ${mailbox}`);
      } catch (error) {
        logger.error("Failed to send message:", error);
      }
    }

    async receiveMessage(args) {
      try {
        const mailbox = Cast.toNumber(args.BOX);
        const remove = args.REMOVE === "and remove";
        const result = await this.peripheral.message_read(mailbox, 0, remove);

        const decoder = new TextDecoder();
        const message = decoder.decode(result.message);

        logger.log(`Received message from mailbox ${mailbox}: "${message}"`);
        return message;
      } catch (error) {
        logger.error("Failed to receive message:", error);
        return "";
      }
    }

    // ==================== PROGRAM CONTROL ====================

    async startProgram(args) {
      try {
        const filename = Cast.toString(args.FILENAME);
        await this.peripheral.start_program(filename);
        logger.success(`Started program: ${filename}`);
      } catch (error) {
        logger.error("Failed to start program:", error);
        alert(`❌ Failed to start program:\n\n${error.message}`);
      }
    }

    async stopProgram() {
      try {
        await this.peripheral.stop_program();
        logger.success("Program stopped");
      } catch (error) {
        logger.error("Failed to stop program:", error);
        alert(`❌ Failed to stop program:\n\n${error.message}`);
      }
    }

    async keepAlive() {
      try {
        const sleepTime = await this.peripheral.keep_alive();
        logger.log(`Keep alive successful, sleep time: ${sleepTime}ms`);
      } catch (error) {
        logger.error("Keep alive failed:", error);
      }
    }

    async getCurrentProgram() {
      try {
        const reply = await this.peripheral.sendTelegram(
          NXT_OPCODE.GET_CURR_PROGRAM,
          [],
          true,
        );

        if (!reply || reply.length < 3) {
          throw new Error("Invalid response");
        }

        const status = reply[2];
        if (status !== 0x00) {
          throw new Error(NXT_ERROR[status] || "Unknown error");
        }

        let filename = "";
        for (let i = 0; i < 20; i++) {
          const char = reply[3 + i];
          if (char === 0) break;
          filename += String.fromCharCode(char);
        }

        return filename || "none";
      } catch (error) {
        logger.error("Failed to get current program:", error);
        return "none";
      }
    }

    // ==================== ADVANCED SENSORS ====================

    async getSensorPort(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.port;
      } catch (error) {
        logger.error("Failed to get sensor port:", error);
        return 0;
      }
    }

    async getSensorValid(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.valid;
      } catch (error) {
        logger.error("Failed to get sensor valid:", error);
        return false;
      }
    }

    async getSensorCalibrated(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.calibrated;
      } catch (error) {
        logger.error("Failed to get sensor calibrated:", error);
        return false;
      }
    }

    async getSensorType(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.sensor_type;
      } catch (error) {
        logger.error("Failed to get sensor type:", error);
        return 0;
      }
    }

    async getSensorMode(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.sensor_mode;
      } catch (error) {
        logger.error("Failed to get sensor mode:", error);
        return 0;
      }
    }

    async getSensorRawValue(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.raw_value;
      } catch (error) {
        logger.error("Failed to get sensor raw value:", error);
        return 0;
      }
    }

    async getSensorNormalizedValue(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.normalized_value;
      } catch (error) {
        logger.error("Failed to get sensor normalized value:", error);
        return 0;
      }
    }

    async getSensorScaledValue(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.scaled_value;
      } catch (error) {
        logger.error("Failed to get sensor scaled value:", error);
        return 0;
      }
    }

    async getSensorCalibratedValue(args) {
      try {
        const data = await this.peripheral.getSensorValue(args.PORT);
        return data.calibrated_value;
      } catch (error) {
        logger.error("Failed to get sensor calibrated value:", error);
        return 0;
      }
    }

    // ==================== ADVANCED MOTORS ====================

    async getMotorPower(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.power;
      } catch (error) {
        logger.error("Failed to get motor power:", error);
        return 0;
      }
    }

    async getMotorMode(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.mode;
      } catch (error) {
        logger.error("Failed to get motor mode:", error);
        return 0;
      }
    }

    async getMotorRegulationMode(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.regulation_mode;
      } catch (error) {
        logger.error("Failed to get motor regulation mode:", error);
        return 0;
      }
    }

    async getMotorTurnRatio(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.turn_ratio;
      } catch (error) {
        logger.error("Failed to get motor turn ratio:", error);
        return 0;
      }
    }

    async getMotorRunState(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.run_state;
      } catch (error) {
        logger.error("Failed to get motor run state:", error);
        return 0;
      }
    }

    async getMotorTachoLimit(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.tacho_limit;
      } catch (error) {
        logger.error("Failed to get motor tacho limit:", error);
        return 0;
      }
    }

    async getMotorTachoCount(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.tacho_count;
      } catch (error) {
        logger.error("Failed to get motor tacho count:", error);
        return 0;
      }
    }

    async getMotorBlockTachoCount(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.block_tacho_count;
      } catch (error) {
        logger.error("Failed to get motor block tacho count:", error);
        return 0;
      }
    }

    async getMotorRotationCount(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.rotation_count;
      } catch (error) {
        logger.error("Failed to get motor rotation count:", error);
        return 0;
      }
    }

    // ==================== LOW-LEVEL I2C ====================

    async getLowSpeedStatus(args) {
      try {
        const result = await this.peripheral.ls_get_status(args.PORT);
        return result.bytes_ready;
      } catch (error) {
        logger.error("Failed to get low-speed status:", error);
        return 0;
      }
    }

    // ==================== MOTORS ====================
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
      const brake = args.ACTION === "brake";
      return this.peripheral.motorStop(args.PORT, brake);
    }
    async getMotorPosition(args) {
      try {
        const data = await this.peripheral.getMotorPosition(args.PORT);
        return data.rotation_count;
      } catch (error) {
        logger.error("Failed to get motor position:", error);
        return 0;
      }
    }
    resetMotorPosition(args) {
      return this.peripheral.resetMotorPosition(args.PORT, false);
    }

    // ==================== SENSORS ====================
    setupTouchSensorNXT(args) {
      return this.peripheral.setupTouchNXT(args.PORT);
    }
    async isTouchPressed(args) {
      const raw = await this.peripheral.getRawSensorValue(args.PORT);
      return raw < 500;
    }
    setupLightSensor(args) {
      const active = args.STATE === "on";
      return this.peripheral.setupLightSensor(args.PORT, active);
    }
    async getLightLevel(args) {
      const data = await this.peripheral.getSensorValue(args.PORT);
      return data.scaled_value;
    }
    setupColorSensor(args) {
      const modeMap = {
        "all colors": "full",
        red: "red",
        green: "green",
        blue: "blue",
        none: "none",
      };
      return this.peripheral.setupColorSensor(args.PORT, modeMap[args.MODE]);
    }
    async getColor(args) {
      const portNum = PORT[args.PORT];
      const reply = await this.peripheral.sendTelegram(
        NXT_OPCODE.GET_IN_VALS,
        [portNum],
        true,
      );
      if (reply && reply.length >= 11) {
        const colorIdx = reply[9];
        const colors = [
          "none",
          "black",
          "blue",
          "green",
          "yellow",
          "red",
          "white",
        ];
        return colors[colorIdx] || "none";
      }
      return "none";
    }
    setupSoundSensor(args) {
      const adjusted = args.MODE === "dBA";
      return this.peripheral.setupSoundSensor(args.PORT, adjusted);
    }
    async getSoundLevel(args) {
      const data = await this.peripheral.getSensorValue(args.PORT);
      return data.scaled_value;
    }
    setupUltrasonicSensor(args) {
      return this.peripheral.setupUltrasonicSensor(args.PORT);
    }
    getDistance(args) {
      return this.peripheral.getUltrasonicDistance(args.PORT);
    }

    // ==================== SOUND ====================
    playTone(args) {
      const freq = Cast.toNumber(args.FREQ);
      const ms = Cast.toNumber(args.MS);
      return this.peripheral.playTone(freq, ms);
    }
    playNote(args) {
      const noteFreqs = {
        C4: 262,
        "C#4": 277,
        D4: 294,
        "D#4": 311,
        E4: 330,
        F4: 349,
        "F#4": 370,
        G4: 392,
        "G#4": 415,
        A4: 440,
        "A#4": 466,
        B4: 494,
        C5: 523,
        "C#5": 554,
        D5: 587,
        "D#5": 622,
        E5: 659,
        F5: 698,
        "F#5": 740,
        G5: 784,
        "G#5": 831,
        A5: 880,
        "A#5": 932,
        B5: 988,
      };
      const freq = noteFreqs[args.NOTE] || 440;
      const beats = Cast.toNumber(args.BEATS);
      const ms = beats * 500;
      return this.peripheral.playTone(freq, ms);
    }

    // ==================== DISPLAY ====================
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
    async drawPixel(args) {
      const on = args.STATE === "on";
      this.peripheral.setPixel(
        Cast.toNumber(args.X),
        Cast.toNumber(args.Y),
        on,
      );
      await this.peripheral.updateDisplay();
    }
    drawLine(args) {
      return this.peripheral.drawLine(args.X1, args.Y1, args.X2, args.Y2);
    }
    drawRect(args) {
      const filled = args.FILL === "filled";
      return this.peripheral.drawRect(args.X, args.Y, args.W, args.H, filled);
    }
    drawCircle(args) {
      const filled = args.FILL === "filled";
      return this.peripheral.drawCircle(args.X, args.Y, args.R, filled);
    }
    drawPattern(args) {
      return this.peripheral.drawPattern(args.PATTERN);
    }

    // ==================== STATUS ====================
    getBattery() {
      return this.peripheral.getBatteryLevel();
    }
    async getRawSensorValue(args) {
      const value = await this.peripheral.getRawSensorValue(args.PORT);
      return value;
    }

    // ==================== TRANSPILATION ====================

    transpileProject() {
      logger.log("=".repeat(60));
      logger.log("TRANSPILE PROJECT TO NXC");
      logger.log("=".repeat(60));

      try {
        // Copy runtime sprite states to transpiler
        this.transpiler.spriteStates = { ...this.spriteStates };

        this.nxcCode = this.transpiler.transpileProject();
        logger.success("✅ Project successfully transpiled to NXC!");
        logger.log(
          `Generated ${this.nxcCode.split("\n").length} lines of code`,
        );
        alert("✅ Project transpiled to NXC!\n\nCheck console for details.");
      } catch (error) {
        logger.error("Transpilation failed:", error);
        alert(
          `❌ Transpilation failed:\n\n${error.message}\n\nCheck console for details.`,
        );
      }
    }

    showNXCCode() {
      logger.log("Showing NXC code...");

      if (!this.nxcCode) {
        alert(
          "⚠️ Generate NXC code first using 'transpile project to NXC' block!",
        );
        return;
      }

      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 3px solid #FF6B00;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        z-index: 100000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif;
    `;

      const title = document.createElement("h2");
      title.textContent = "📝 Generated NXC Code";
      title.style.cssText =
        "color: #FF6B00; margin: 0 0 15px 0; font-size: 24px;";

      const stats = document.createElement("div");
      stats.textContent = `Lines: ${this.nxcCode.split("\n").length} | Characters: ${this.nxcCode.length}`;
      stats.style.cssText =
        "color: #666; font-size: 14px; margin-bottom: 10px;";

      const pre = document.createElement("pre");
      pre.style.cssText = `
        background: #f5f5f5;
        padding: 15px;
        overflow: auto;
        max-height: 60vh;
        font-family: 'Courier New', Consolas, monospace;
        font-size: 13px;
        border-radius: 6px;
        color: #000;
        white-space: pre;
        line-height: 1.5;
        border: 1px solid #ddd;
    `;
      pre.textContent = this.nxcCode;

      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText =
        "margin-top: 15px; display: flex; gap: 10px;";

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋 Copy to Clipboard";
      copyBtn.style.cssText = `
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
    `;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(this.nxcCode);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => (copyBtn.textContent = "📋 Copy to Clipboard"), 2000);
      };

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = `
        padding: 10px 20px;
        background: #FF6B00;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
    `;
      closeBtn.onclick = () => document.body.removeChild(modal);

      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(closeBtn);

      modal.appendChild(title);
      modal.appendChild(stats);
      modal.appendChild(pre);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);

      logger.success("Code viewer opened");
    }

    downloadNXC() {
      logger.log("Downloading NXC file...");

      if (!this.nxcCode) {
        alert(
          "⚠️ Generate NXC code first using 'transpile project to NXC' block!",
        );
        return;
      }

      try {
        const blob = new Blob([this.nxcCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nxt_program.nxc";
        a.click();
        URL.revokeObjectURL(url);

        logger.success("✅ Downloaded: nxt_program.nxc");
        alert("✅ Downloaded: nxt_program.nxc");
      } catch (error) {
        logger.error("Download failed:", error);
        alert(`❌ Download failed:\n\n${error.message}`);
      }
    }

    async compileToRXE() {
      logger.log("=".repeat(60));
      logger.log("COMPILE NXC TO RXE BYTECODE");
      logger.log("=".repeat(60));

      if (!this.nxcCode) {
        alert(
          "⚠️ Generate NXC code first using 'transpile project to NXC' block!",
        );
        return;
      }

      try {
        logger.log(`Sending request to: ${this.compilerUrl}/compile`);
        logger.log(`Code length: ${this.nxcCode.length} characters`);

        const response = await fetch(`${this.compilerUrl}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compiler: "nxc",
            code: this.nxcCode,
          }),
        });

        logger.log(
          `Response status: ${response.status} ${response.statusText}`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        logger.log("Compilation response:", result);

        if (result.success) {
          this.rxeBase64 = result.base64;

          const binaryString = atob(this.rxeBase64);
          logger.success(`✅ Compilation successful!`);
          logger.log(`RXE file size: ${binaryString.length} bytes`);

          let message = "✅ Compilation successful!";
          if (result.message) {
            logger.log("Compiler output:", result.message);
            message += `\n\nCompiler output:\n${result.message}`;
          }
          alert(message);
        } else {
          throw new Error(result.error || "Unknown compilation error");
        }
      } catch (error) {
        logger.error("Compilation failed:", error);
        alert(
          `❌ Compilation failed:\n\n${error.message}\n\nCheck console for details.`,
        );
      }
    }

    async uploadToNXT() {
      logger.log("=".repeat(60));
      logger.log("UPLOAD RXE TO NXT");
      logger.log("=".repeat(60));

      if (!this.rxeBase64) {
        alert("⚠️ Compile to .rxe first using 'compile NXC to .rxe' block!");
        return;
      }

      if (!this.peripheral.isConnected()) {
        alert("⚠️ Connect to NXT first using 'connect to NXT' block!");
        return;
      }

      try {
        logger.log("Decoding base64 RXE data...");
        const binaryString = atob(this.rxeBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        logger.log(`File size: ${bytes.length} bytes`);

        const filename = "program.rxe";

        const filenameBytes = [];
        for (let i = 0; i < filename.length && i < 19; i++) {
          filenameBytes.push(filename.charCodeAt(i));
        }
        while (filenameBytes.length < 20) {
          filenameBytes.push(0);
        }

        logger.log(`Opening file "${filename}" for writing...`);
        logger.debug(`Filename bytes: [${filenameBytes.join(", ")}]`);

        const openCmd = [
          ...filenameBytes,
          bytes.length & 0xff,
          (bytes.length >> 8) & 0xff,
          (bytes.length >> 16) & 0xff,
          (bytes.length >> 24) & 0xff,
        ];

        logger.debug(`Open command length: ${openCmd.length} bytes`);

        let openReply;
        try {
          openReply = await this.peripheral.sendTelegram(
            NXT_OPCODE.OPEN_WRITE,
            openCmd,
            true,
            true,
          );
        } catch (error) {
          throw new Error(`Communication error: ${error.message}`);
        }

        if (!openReply) {
          throw new Error("No response from NXT - check Bluetooth connection");
        }

        logger.debug(
          `Open reply: [${Array.from(openReply)
            .map((b) => "0x" + b.toString(16))
            .join(", ")}]`,
        );

        if (openReply[2] !== 0x00) {
          const errorCode = openReply[2];
          const errorMsg =
            NXT_ERROR[errorCode] ||
            `Unknown error (0x${errorCode.toString(16)})`;
          throw new Error(`Failed to open file: ${errorMsg}`);
        }

        const handle = openReply[3];
        logger.log(`File opened with handle: ${handle}`);

        const chunkSize = 32;
        const totalChunks = Math.ceil(bytes.length / chunkSize);
        logger.log(
          `Uploading in ${totalChunks} chunks of ${chunkSize} bytes...`,
        );

        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          const writeCmd = [handle, ...Array.from(chunk)];

          let writeReply;
          try {
            writeReply = await this.peripheral.sendTelegram(
              NXT_OPCODE.WRITE,
              writeCmd,
              true,
              true,
            );
          } catch (error) {
            throw new Error(`Write failed at byte ${i}: ${error.message}`);
          }

          if (!writeReply || writeReply[2] !== 0x00) {
            const errorCode = writeReply ? writeReply[2] : 0xff;
            throw new Error(
              `Write failed at byte ${i}: ${NXT_ERROR[errorCode] || "Unknown error"}`,
            );
          }

          await this.peripheral.sleep(30);

          if (i % 320 === 0) {
            const progress = Math.round((i / bytes.length) * 100);
            logger.log(`Upload progress: ${progress}%`);
          }
        }

        logger.log("Closing file...");
        await this.peripheral.sendTelegram(
          NXT_OPCODE.CLOSE,
          [handle],
          true,
          true,
        );

        logger.success("✅ Upload complete!");
        alert(
          `✅ Program uploaded to NXT!\n\nFile: ${filename}\nSize: ${bytes.length} bytes\n\nYou can now run "${filename}" from the NXT menu.`,
        );
      } catch (error) {
        logger.error("Upload failed:", error);
        alert(
          `❌ Upload failed:\n\n${error.message}\n\nCheck console for details.`,
        );
      }
    }

    async fullWorkflow() {
      logger.log("=".repeat(60));
      logger.log("FULL WORKFLOW: TRANSPILE → COMPILE → UPLOAD");
      logger.log("=".repeat(60));

      try {
        // Step 1: Transpile
        logger.log("\n[1/3] Transpiling project...");
        this.transpiler.spriteStates = { ...this.spriteStates };
        this.nxcCode = this.transpiler.transpileProject();
        logger.success("✅ Transpilation complete");
        await this.peripheral.sleep(500);

        // Step 2: Compile
        logger.log("\n[2/3] Compiling to bytecode...");
        const response = await fetch(`${this.compilerUrl}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compiler: "nxc", code: this.nxcCode }),
        });

        if (!response.ok) {
          throw new Error(`Compilation failed: HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Compilation failed");
        }

        this.rxeBase64 = result.base64;
        logger.success("✅ Compilation complete");
        await this.peripheral.sleep(500);

        // Step 3: Upload
        if (!this.peripheral.isConnected()) {
          throw new Error("NXT not connected! Please connect first.");
        }

        logger.log("\n[3/3] Uploading to NXT...");
        const binaryString = atob(this.rxeBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const filename = "program.rxe";
        const filenameBytes = new Array(20).fill(0);
        for (let i = 0; i < Math.min(filename.length, 19); i++) {
          filenameBytes[i] = filename.charCodeAt(i);
        }

        const openCmd = [
          ...filenameBytes,
          bytes.length & 0xff,
          (bytes.length >> 8) & 0xff,
          (bytes.length >> 16) & 0xff,
          (bytes.length >> 24) & 0xff,
        ];

        const openReply = await this.peripheral.sendTelegram(
          NXT_OPCODE.OPEN_WRITE,
          openCmd,
          true,
          true,
        );

        if (!openReply || openReply[2] !== 0x00) {
          throw new Error("Failed to open file on NXT");
        }

        const handle = openReply[3];
        const chunkSize = 32;

        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          const writeCmd = [handle, ...Array.from(chunk)];
          await this.peripheral.sendTelegram(
            NXT_OPCODE.WRITE,
            writeCmd,
            true,
            true,
          );
          await this.peripheral.sleep(20);

          if (i % 320 === 0) {
            logger.log(`Upload: ${Math.round((i / bytes.length) * 100)}%`);
          }
        }

        await this.peripheral.sendTelegram(
          NXT_OPCODE.CLOSE,
          [handle],
          true,
          true,
        );

        logger.success("✅ Upload complete!");
        logger.log("=".repeat(60));
        logger.success("🎉 WORKFLOW COMPLETE!");
        logger.log("=".repeat(60));

        alert(
          `🎉 SUCCESS!\n\n✅ Transpiled\n✅ Compiled\n✅ Uploaded\n\nFile: ${filename}\nSize: ${bytes.length} bytes\n\nRun "${filename}" from the NXT menu!`,
        );
      } catch (error) {
        logger.error("Workflow failed:", error);
        alert(
          `❌ Workflow failed:\n\n${error.message}\n\nCheck console for details.`,
        );
      }
    }
  }
  Scratch.extensions.register(new LegoNXTExtension());
  logger.success(
    "🧱 LEGO NXT Extension loaded - Full featured with i18n, sprite state, and maximum debug verbosity!",
  );
})(Scratch);
