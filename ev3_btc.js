(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("EV3 extension must run unsandboxed");
  }

  console.log("🤖 [EV3] Extension loading...");

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // ============================================================================
  // TRANSLATIONS
  // ============================================================================
  const translations = {
    en: {
      extensionName: "LEGO EV3",
      motorTurnClockwise: "motor [PORT] turn this way for [TIME] seconds",
      motorTurnCounterClockwise:
        "motor [PORT] turn that way for [TIME] seconds",
      motorSetPower: "motor [PORT] set power [POWER] %",
      getMotorPosition: "motor [PORT] position",
      whenButtonPressed: "when button [PORT] pressed",
      whenDistanceLessThan: "when distance < [DISTANCE]",
      whenBrightnessLessThan: "when brightness < [DISTANCE]",
      buttonPressed: "button [PORT] pressed?",
      getDistance: "distance",
      getBrightness: "brightness",
      beep: "beep note [NOTE] for [TIME] secs",
    },
    de: {
      extensionName: "LEGO EV3",
      motorTurnClockwise: "Motor [PORT] drehe so für [TIME] Sekunden",
      motorTurnCounterClockwise: "Motor [PORT] drehe anders für [TIME] Sekunden",
      motorSetPower: "Motor [PORT] setze Leistung [POWER] %",
      getMotorPosition: "Motor [PORT] Position",
      whenButtonPressed: "wenn Taste [PORT] gedrückt",
      whenDistanceLessThan: "wenn Abstand < [DISTANCE]",
      whenBrightnessLessThan: "wenn Helligkeit < [DISTANCE]",
      buttonPressed: "Taste [PORT] gedrückt?",
      getDistance: "Abstand",
      getBrightness: "Helligkeit",
      beep: "Piep Note [NOTE] für [TIME] Sek",
    },
  };

  // ============================================================================
  // LANGUAGE DETECTION
  // ============================================================================
  function detectLanguage() {
    const results = {};
    let finalLanguage = "en";

    console.log("🌍 [EV3] === LANGUAGE DETECTION DEBUG ===");

    try {
      results.navigatorLanguage = navigator.language;
      console.log("🌍 [EV3] 1. navigator.language:", navigator.language);
    } catch (e) {
      results.navigatorLanguage = "error: " + e.message;
    }

    try {
      results.navigatorLanguages = navigator.languages;
      console.log("🌍 [EV3] 2. navigator.languages:", navigator.languages);
    } catch (e) {
      results.navigatorLanguages = "error: " + e.message;
    }

    try {
      const twSettings = localStorage.getItem("tw:language");
      results.turboWarpLocalStorage = twSettings;
      console.log("🌍 [EV3] 3. TurboWarp localStorage:", twSettings);
    } catch (e) {
      results.turboWarpLocalStorage = "error: " + e.message;
    }

    try {
      if (typeof Scratch !== "undefined" && Scratch.vm && Scratch.vm.runtime) {
        const vmLocale = Scratch.vm.runtime.getLocale
          ? Scratch.vm.runtime.getLocale()
          : null;
        results.scratchVMLocale = vmLocale;
        console.log("🌍 [EV3] 4. Scratch VM locale:", vmLocale);
      } else {
        results.scratchVMLocale = null;
      }
    } catch (e) {
      results.scratchVMLocale = "error: " + e.message;
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.ReduxStore &&
        window.ReduxStore.getState
      ) {
        const state = window.ReduxStore.getState();
        const reduxLocale = state.locales?.locale;
        results.reduxStore = reduxLocale;
        console.log("🌍 [EV3] 5. Redux store locale:", reduxLocale);
      } else {
        results.reduxStore = "not available";
      }
    } catch (e) {
      results.reduxStore = "error: " + e.message;
    }

    try {
      const htmlLang = document.documentElement.lang;
      results.documentLang = htmlLang;
      console.log("🌍 [EV3] 6. document.documentElement.lang:", htmlLang || "(empty)");
    } catch (e) {
      results.documentLang = "error: " + e.message;
    }

    console.log("\n🌍 [EV3] === ALL DETECTION RESULTS ===");
    console.log(JSON.stringify(results, null, 2));

    if (
      results.reduxStore &&
      typeof results.reduxStore === "string" &&
      !results.reduxStore.includes("error") &&
      results.reduxStore !== "not available"
    ) {
      console.log("🌍 [EV3] ✓ Using Redux store locale:", results.reduxStore);
      finalLanguage = results.reduxStore.toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else if (
      results.turboWarpLocalStorage &&
      typeof results.turboWarpLocalStorage === "string" &&
      !results.turboWarpLocalStorage.includes("error")
    ) {
      console.log(
        "🌍 [EV3] ✓ Using TurboWarp localStorage:",
        results.turboWarpLocalStorage
      );
      finalLanguage = results.turboWarpLocalStorage.toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else if (
      results.scratchVMLocale &&
      typeof results.scratchVMLocale === "string" &&
      !results.scratchVMLocale.includes("error")
    ) {
      console.log("🌍 [EV3] ✓ Using Scratch VM locale:", results.scratchVMLocale);
      finalLanguage = results.scratchVMLocale.toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else if (
      results.documentLang &&
      typeof results.documentLang === "string" &&
      results.documentLang !== "" &&
      !results.documentLang.includes("error")
    ) {
      console.log(
        "🌍 [EV3] ✓ Using document.documentElement.lang:",
        results.documentLang
      );
      finalLanguage = results.documentLang.toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else if (
      results.navigatorLanguage &&
      typeof results.navigatorLanguage === "string" &&
      !results.navigatorLanguage.includes("error")
    ) {
      console.log("🌍 [EV3] ✓ Using navigator.language:", results.navigatorLanguage);
      finalLanguage = results.navigatorLanguage.toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else if (
      results.navigatorLanguages &&
      Array.isArray(results.navigatorLanguages) &&
      results.navigatorLanguages.length > 0
    ) {
      console.log(
        "🌍 [EV3] ✓ Using navigator.languages[0]:",
        results.navigatorLanguages[0]
      );
      finalLanguage = results.navigatorLanguages[0].toLowerCase().startsWith("de")
        ? "de"
        : "en";
    } else {
      console.log("🌍 [EV3] ✗ No locale detected, using default: en");
    }

    console.log("\n🌍 [EV3] === FINAL DECISION ===");
    console.log("🌍 [EV3] Selected language:", finalLanguage);
    console.log("🌍 [EV3] ================================\n");

    return finalLanguage;
  }

  let currentLang = detectLanguage();

  function t(key) {
    return translations[currentLang]?.[key] || translations["en"][key] || key;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === "tw:language") {
        console.log("🌍 [EV3] TurboWarp language changed, re-detecting...");
        const newLang = detectLanguage();
        if (newLang !== currentLang) {
          currentLang = newLang;
          console.log("🌍 [EV3] Language updated to:", currentLang);
        }
      }
    });

    let lastKnownLocale = null;
    setInterval(() => {
      try {
        if (window.ReduxStore && window.ReduxStore.getState) {
          const state = window.ReduxStore.getState();
          const currentLocale = state.locales?.locale;
          if (currentLocale && currentLocale !== lastKnownLocale) {
            lastKnownLocale = currentLocale;
            const newLang = currentLocale.toLowerCase().startsWith("de")
              ? "de"
              : "en";
            if (newLang !== currentLang) {
              currentLang = newLang;
              console.log("🌍 [EV3] Extension language updated to:", currentLang);
            }
          }
        }
      } catch (e) {}
    }, 1000);
  }

  // ============================================================================
  // UTILITY FUNCTIONS
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
      const request = { jsonrpc: "2.0", method, params };
      if (id !== null && typeof id !== "undefined") {
        request.id = id;
      }
      this._sendMessage(request);
    }

    _handleMessage(json) {
      if (json.jsonrpc !== "2.0") {
        throw new Error(
          `Bad or missing JSON-RPC version in message: ${JSON.stringify(json)}`
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
          }
        );
      }
    }
  }

  // ============================================================================
  // BT CLASS
  // ============================================================================
  class BT extends JSONRPC {
    constructor(
      runtime,
      extensionId,
      peripheralOptions,
      connectCallback,
      resetCallback = null,
      messageCallback
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
        15000
      );
      this.sendRemoteRequest("discover", this._peripheralOptions).catch((e) =>
        this._handleRequestError(e)
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
        this.handleDisconnectError(e)
      );
    }

    didReceiveCall(method, params) {
      switch (method) {
        case "didDiscoverPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
            this._availablePeripherals
          );
          if (this._discoverTimeoutID)
            window.clearTimeout(this._discoverTimeoutID);
          break;
        case "userDidPickPeripheral":
          this._availablePeripherals[params.peripheralId] = params;
          this._runtime.emit(
            this._runtime.constructor.USER_PICKED_PERIPHERAL,
            this._availablePeripherals
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
      if (this._discoverTimeoutID) window.clearTimeout(this._discoverTimeoutID);
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
  }

  // ============================================================================
  // EV3 CONSTANTS
  // ============================================================================
  const iconURI =
    "data:image/png;base64,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";

  const Ev3PairingPin = "1234";
  const BTSendRateMax = 40;

  const Ev3Encoding = {
    ONE_BYTE: 0x81,
    TWO_BYTES: 0x82,
    FOUR_BYTES: 0x83,
    GLOBAL_VARIABLE_ONE_BYTE: 0xe1,
    GLOBAL_CONSTANT_INDEX_0: 0x20,
    GLOBAL_VARIABLE_INDEX_0: 0x60,
  };

  const Ev3Command = {
    DIRECT_COMMAND_REPLY: 0x00,
    DIRECT_COMMAND_NO_REPLY: 0x80,
    DIRECT_REPLY: 0x02,
  };

  const Ev3Opcode = {
    OPOUTPUT_STEP_SPEED: 0xae,
    OPOUTPUT_TIME_SPEED: 0xaf,
    OPOUTPUT_STOP: 0xa3,
    OPOUTPUT_RESET: 0xa2,
    OPOUTPUT_STEP_SYNC: 0xb0,
    OPOUTPUT_TIME_SYNC: 0xb1,
    OPOUTPUT_GET_COUNT: 0xb3,
    OPSOUND: 0x94,
    OPSOUND_CMD_TONE: 1,
    OPSOUND_CMD_STOP: 0,
    OPINPUT_DEVICE_LIST: 0x98,
    OPINPUT_READSI: 0x9d,
  };

  const Ev3Args = {
    LAYER: 0,
    COAST: 0,
    BRAKE: 1,
    RAMP: 50,
    DO_NOT_CHANGE_TYPE: 0,
    MAX_DEVICES: 32,
  };

  const Ev3Device = {
    29: "color",
    30: "ultrasonic",
    32: "gyro",
    16: "touch",
    8: "mediumMotor",
    7: "largeMotor",
    126: "none",
    125: "none",
  };

  const Ev3Mode = {
    touch: 0,
    color: 1,
    ultrasonic: 1,
    none: 0,
  };

  const Ev3Label = {
    touch: "button",
    color: "brightness",
    ultrasonic: "distance",
  };

  // ============================================================================
  // EV3 MOTOR CLASS
  // ============================================================================
  class EV3Motor {
    constructor(parent, index, type) {
      this._parent = parent;
      this._index = index;
      this._type = type;
      this._direction = 1;
      this._power = 50;
      this._position = 0;
      this._commandID = null;
      this._coastDelay = 1000;
    }

    get type() {
      return this._type;
    }
    set type(value) {
      this._type = value;
    }

    get direction() {
      return this._direction;
    }
    set direction(value) {
      if (value < 0) {
        this._direction = -1;
      } else {
        this._direction = 1;
      }
    }

    get power() {
      return this._power;
    }
    set power(value) {
      this._power = value;
    }

    get position() {
      return this._position;
    }
    set position(array) {
      let value =
        array[0] +
        array[1] * 256 +
        array[2] * 256 * 256 +
        array[3] * 256 * 256 * 256;
      if (value > 0x7fffffff) {
        value = value - 0x100000000;
      }
      this._position = value;
    }

    turnOnFor(milliseconds) {
      if (this._power === 0) return;

      const port = this._portMask(this._index);
      let n = milliseconds;
      let speed = this._power * this._direction;
      const ramp = Ev3Args.RAMP;

      let byteCommand = [];
      byteCommand[0] = Ev3Opcode.OPOUTPUT_TIME_SPEED;

      if (speed < 0) {
        speed = -1 * speed;
        n = -1 * n;
      }
      const dir = n < 0 ? 0x100 - speed : speed;
      n = Math.abs(n);

      let rampup = ramp;
      let rampdown = ramp;
      let run = n - ramp * 2;
      if (run < 0) {
        rampup = Math.floor(n / 2);
        run = 0;
        rampdown = n - rampup;
      }

      const runcmd = this._runValues(run);
      byteCommand = byteCommand.concat([
        Ev3Args.LAYER,
        port,
        Ev3Encoding.ONE_BYTE,
        dir & 0xff,
        Ev3Encoding.ONE_BYTE,
        rampup,
      ]).concat(
        runcmd.concat([Ev3Encoding.ONE_BYTE, rampdown, Ev3Args.BRAKE])
      );

      const cmd = this._parent.generateCommand(
        Ev3Command.DIRECT_COMMAND_NO_REPLY,
        byteCommand
      );

      this._parent.send(cmd);
      this.coastAfter(milliseconds);
    }

    coastAfter(time) {
      if (this._power === 0) return;

      const commandId = Math.random().toString(36).slice(-4);
      this._commandID = commandId;

      setTimeout(() => {
        if (this._commandID === commandId) {
          this.coast();
          this._commandID = null;
        }
      }, time + this._coastDelay);
    }

    coast() {
      if (this._power === 0) return;

      const cmd = this._parent.generateCommand(
        Ev3Command.DIRECT_COMMAND_NO_REPLY,
        [
          Ev3Opcode.OPOUTPUT_STOP,
          Ev3Args.LAYER,
          this._portMask(this._index),
          Ev3Args.COAST,
        ]
      );

      this._parent.send(cmd, false);
    }

    _runValues(run) {
      if (run < 0x7fff) {
        return [Ev3Encoding.TWO_BYTES, run & 0xff, (run >> 8) & 0xff];
      }

      return [
        Ev3Encoding.FOUR_BYTES,
        run & 0xff,
        (run >> 8) & 0xff,
        (run >> 16) & 0xff,
        (run >> 24) & 0xff,
      ];
    }

    _portMask(port) {
      return Math.pow(2, port);
    }
  }

  // ============================================================================
  // EV3 PERIPHERAL CLASS
  // ============================================================================
  class EV3 {
    constructor(runtime, extensionId) {
      this._runtime = runtime;
      this._extensionId = extensionId;

      this._sensorPorts = [];
      this._motorPorts = [];
      this._sensors = {
        distance: 0,
        brightness: 0,
        buttons: [0, 0, 0, 0],
      };
      this._motors = [null, null, null, null];
      this._pollingInterval = 150;
      this._pollingIntervalID = null;
      this._pollingCounter = 0;
      this._bt = null;
      this._rateLimiter = new RateLimiter(BTSendRateMax);
      this._updateDevices = false;

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
      this._pollValues = this._pollValues.bind(this);

      if (this._runtime) {
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._runtime.on("PROJECT_STOP_ALL", this.stopAll.bind(this));
      }
    }

    get distance() {
      let value = this._sensors.distance > 100 ? 100 : this._sensors.distance;
      value = value < 0 ? 0 : value;
      value = Math.round(100 * value) / 100;
      return value;
    }

    get brightness() {
      return this._sensors.brightness;
    }

    motor(index) {
      return this._motors[index];
    }

    isButtonPressed(port) {
      return this._sensors.buttons[port] === 1;
    }

    beep(freq, time) {
      const cmd = this.generateCommand(Ev3Command.DIRECT_COMMAND_NO_REPLY, [
        Ev3Opcode.OPSOUND,
        Ev3Opcode.OPSOUND_CMD_TONE,
        Ev3Encoding.ONE_BYTE,
        2,
        Ev3Encoding.TWO_BYTES,
        freq,
        freq >> 8,
        Ev3Encoding.TWO_BYTES,
        time,
        time >> 8,
      ]);

      this.send(cmd);
    }

    stopAll() {
      this.stopAllMotors();
      this.stopSound();
    }

    stopSound() {
      const cmd = this.generateCommand(Ev3Command.DIRECT_COMMAND_NO_REPLY, [
        Ev3Opcode.OPSOUND,
        Ev3Opcode.OPSOUND_CMD_STOP,
      ]);

      this.send(cmd, false);
    }

    stopAllMotors() {
      this._motors.forEach((motor) => {
        if (motor) {
          motor.coast();
        }
      });
    }

    scan() {
      if (this._bt) {
        this._bt.disconnect();
      }
      this._bt = new BT(
        this._runtime,
        this._extensionId,
        {
          majorDeviceClass: 8,
          minorDeviceClass: 1,
        },
        this._onConnect,
        this.reset,
        this._onMessage
      );
    }

    connect(id) {
      if (this._bt) {
        this._bt.connectPeripheral(id, Ev3PairingPin);
      }
    }

    disconnect() {
      if (this._bt) {
        this._bt.disconnect();
      }
      this.reset();
    }

    reset() {
      this._sensorPorts = [];
      this._motorPorts = [];
      this._sensors = {
        distance: 0,
        brightness: 0,
        buttons: [0, 0, 0, 0],
      };
      this._motors = [null, null, null, null];

      if (this._pollingIntervalID) {
        window.clearInterval(this._pollingIntervalID);
        this._pollingIntervalID = null;
      }
    }

    isConnected() {
      let connected = false;
      if (this._bt) {
        connected = this._bt.isConnected();
      }
      return connected;
    }

    send(message, useLimiter = true) {
      if (!this.isConnected()) return Promise.resolve();

      if (useLimiter) {
        if (!this._rateLimiter.okayToSend()) return Promise.resolve();
      }

      return this._bt.sendMessage({
        message: Base64Util.uint8ArrayToBase64(message),
        encoding: "base64",
      });
    }

    generateCommand(type, byteCommands, allocation = 0) {
      let command = [];
      command[2] = 0;
      command[3] = 0;
      command[4] = type;
      command[5] = allocation & 0xff;
      command[6] = (allocation >> 8) & 0xff;

      command = command.concat(byteCommands);

      const len = command.length - 2;
      command[0] = len & 0xff;
      command[1] = (len >> 8) & 0xff;

      return command;
    }

    _onConnect() {
      this._pollingIntervalID = window.setInterval(
        this._pollValues,
        this._pollingInterval
      );
    }

    _pollValues() {
      if (!this.isConnected()) {
        window.clearInterval(this._pollingIntervalID);
        return;
      }

      const cmds = [];
      let allocation = 0;
      let sensorCount = 0;

      if (this._pollingCounter % 20 === 0) {
        cmds[0] = Ev3Opcode.OPINPUT_DEVICE_LIST;
        cmds[1] = Ev3Encoding.ONE_BYTE;
        cmds[2] = Ev3Args.MAX_DEVICES;
        cmds[3] = Ev3Encoding.GLOBAL_VARIABLE_INDEX_0;
        cmds[4] = Ev3Encoding.GLOBAL_VARIABLE_ONE_BYTE;
        cmds[5] = Ev3Encoding.GLOBAL_CONSTANT_INDEX_0;

        allocation = 33;
        this._updateDevices = true;
      } else {
        let index = 0;
        for (let i = 0; i < 4; i++) {
          if (this._sensorPorts[i] !== "none") {
            cmds[index + 0] = Ev3Opcode.OPINPUT_READSI;
            cmds[index + 1] = Ev3Args.LAYER;
            cmds[index + 2] = i;
            cmds[index + 3] = Ev3Args.DO_NOT_CHANGE_TYPE;
            cmds[index + 4] = Ev3Mode[this._sensorPorts[i]];
            cmds[index + 5] = Ev3Encoding.GLOBAL_VARIABLE_ONE_BYTE;
            cmds[index + 6] = sensorCount * 4;
            index += 7;
          }
          sensorCount++;
        }

        for (let i = 0; i < 4; i++) {
          cmds[index + 0] = Ev3Opcode.OPOUTPUT_GET_COUNT;
          cmds[index + 1] = Ev3Args.LAYER;
          cmds[index + 2] = i;
          cmds[index + 3] = Ev3Encoding.GLOBAL_VARIABLE_ONE_BYTE;
          cmds[index + 4] = sensorCount * 4;
          index += 5;
          sensorCount++;
        }

        allocation = sensorCount * 4;
      }

      const cmd = this.generateCommand(
        Ev3Command.DIRECT_COMMAND_REPLY,
        cmds,
        allocation
      );

      this.send(cmd);
      this._pollingCounter++;
    }

    _onMessage(params) {
      const message = params.message;
      const data = Base64Util.base64ToUint8Array(message);

      if (data[4] !== Ev3Command.DIRECT_REPLY) {
        return;
      }

      if (this._updateDevices) {
        for (let i = 0; i < 4; i++) {
          const deviceType = Ev3Device[data[i + 5]];
          this._sensorPorts[i] = deviceType ? deviceType : "none";
        }
        for (let i = 0; i < 4; i++) {
          const deviceType = Ev3Device[data[i + 21]];
          this._motorPorts[i] = deviceType ? deviceType : "none";
        }
        for (let m = 0; m < 4; m++) {
          const type = this._motorPorts[m];
          if (type !== "none" && !this._motors[m]) {
            this._motors[m] = new EV3Motor(this, m, type);
          }
          if (type === "none" && this._motors[m]) {
            this._motors[m] = null;
          }
        }
        this._updateDevices = false;
      } else if (
        !this._sensorPorts.includes(undefined) &&
        !this._motorPorts.includes(undefined)
      ) {
        let offset = 5;
        for (let i = 0; i < 4; i++) {
          const buffer = new Uint8Array([
            data[offset],
            data[offset + 1],
            data[offset + 2],
            data[offset + 3],
          ]).buffer;
          const view = new DataView(buffer);
          const value = view.getFloat32(0, true);

          if (Ev3Label[this._sensorPorts[i]] === "button") {
            this._sensors.buttons[i] = value ? value : 0;
          } else if (Ev3Label[this._sensorPorts[i]]) {
            this._sensors[Ev3Label[this._sensorPorts[i]]] = value ? value : 0;
          }
          offset += 4;
        }

        for (let i = 0; i < 4; i++) {
          const positionArray = [
            data[offset],
            data[offset + 1],
            data[offset + 2],
            data[offset + 3],
          ];
          if (this._motors[i]) {
            this._motors[i].position = positionArray;
          }
          offset += 4;
        }
      }
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================
  class EV3Extension {
    constructor(runtime) {
      this.runtime = runtime;
      if (!this.runtime && typeof Scratch !== "undefined" && Scratch.vm) {
        this.runtime = Scratch.vm.runtime;
      }
      this._peripheral = new EV3(this.runtime, "ev3");
      console.log("🤖 [EV3] Extension loaded - Language:", currentLang);
    }

    getInfo() {
      return {
        id: "ev3",
        name: t("extensionName"),
        blockIconURI: iconURI,
        showStatusButton: true,
        blocks: [
          {
            opcode: "motorTurnClockwise",
            text: t("motorTurnClockwise"),
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "motorPorts",
                defaultValue: "A",
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorTurnCounterClockwise",
            text: t("motorTurnCounterClockwise"),
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "motorPorts",
                defaultValue: "A",
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorSetPower",
            text: t("motorSetPower"),
            blockType: BlockType.COMMAND,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "motorPorts",
                defaultValue: "A",
              },
              POWER: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "getMotorPosition",
            text: t("getMotorPosition"),
            blockType: BlockType.REPORTER,
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "motorPorts",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "whenButtonPressed",
            blockType: BlockType.HAT,
            text: t("whenButtonPressed"),
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "sensorPorts",
                defaultValue: "1",
              },
            },
          },
          {
            opcode: "whenDistanceLessThan",
            blockType: BlockType.HAT,
            text: t("whenDistanceLessThan"),
            arguments: {
              DISTANCE: {
                type: ArgumentType.NUMBER,
                defaultValue: 5,
              },
            },
          },
          {
            opcode: "whenBrightnessLessThan",
            blockType: BlockType.HAT,
            text: t("whenBrightnessLessThan"),
            arguments: {
              DISTANCE: {
                type: ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          "---",
          {
            opcode: "buttonPressed",
            blockType: BlockType.BOOLEAN,
            text: t("buttonPressed"),
            arguments: {
              PORT: {
                type: ArgumentType.STRING,
                menu: "sensorPorts",
                defaultValue: "1",
              },
            },
          },
          {
            opcode: "getDistance",
            text: t("getDistance"),
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getBrightness",
            text: t("getBrightness"),
            blockType: BlockType.REPORTER,
          },
          "---",
          {
            opcode: "beep",
            text: t("beep"),
            blockType: BlockType.COMMAND,
            arguments: {
              NOTE: {
                type: ArgumentType.NOTE,
                defaultValue: 60,
              },
              TIME: {
                type: ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
        ],
        menus: {
          motorPorts: {
            acceptReporters: true,
            items: ["A", "B", "C", "D"],
          },
          sensorPorts: {
            acceptReporters: true,
            items: ["1", "2", "3", "4"],
          },
        },
      };
    }

    motorTurnClockwise(args) {
      const port = this._portToIndex(Cast.toString(args.PORT));
      let time = Cast.toNumber(args.TIME) * 1000;
      time = MathUtil.clamp(time, 0, 15000);

      return new Promise((resolve) => {
        this._forEachMotor(port, (motorIndex) => {
          const motor = this._peripheral.motor(motorIndex);
          if (motor) {
            motor.direction = 1;
            motor.turnOnFor(time);
          }
        });
        setTimeout(resolve, time);
      });
    }

    motorTurnCounterClockwise(args) {
      const port = this._portToIndex(Cast.toString(args.PORT));
      let time = Cast.toNumber(args.TIME) * 1000;
      time = MathUtil.clamp(time, 0, 15000);

      return new Promise((resolve) => {
        this._forEachMotor(port, (motorIndex) => {
          const motor = this._peripheral.motor(motorIndex);
          if (motor) {
            motor.direction = -1;
            motor.turnOnFor(time);
          }
        });
        setTimeout(resolve, time);
      });
    }

    motorSetPower(args) {
      const port = this._portToIndex(Cast.toString(args.PORT));
      const power = MathUtil.clamp(Cast.toNumber(args.POWER), 0, 100);

      this._forEachMotor(port, (motorIndex) => {
        const motor = this._peripheral.motor(motorIndex);
        if (motor) {
          motor.power = power;
        }
      });
    }

    getMotorPosition(args) {
      const port = this._portToIndex(Cast.toString(args.PORT));

      if (![0, 1, 2, 3].includes(port)) {
        return 0;
      }

      const motor = this._peripheral.motor(port);
      let position = 0;
      if (motor) {
        position = MathUtil.wrapClamp(motor.position, 0, 360);
      }

      return position;
    }

    whenButtonPressed(args) {
      return this.buttonPressed(args);
    }

    whenDistanceLessThan(args) {
      const distance = MathUtil.clamp(Cast.toNumber(args.DISTANCE), 0, 100);
      return this._peripheral.distance < distance;
    }

    whenBrightnessLessThan(args) {
      const brightness = MathUtil.clamp(Cast.toNumber(args.DISTANCE), 0, 100);
      return this._peripheral.brightness < brightness;
    }

    buttonPressed(args) {
      const port = this._portToIndex(Cast.toString(args.PORT));

      if (![0, 1, 2, 3].includes(port)) {
        return false;
      }

      return this._peripheral.isButtonPressed(port);
    }

    getDistance() {
      return this._peripheral.distance;
    }

    getBrightness() {
      return this._peripheral.brightness;
    }

    beep(args) {
      const note = MathUtil.clamp(Cast.toNumber(args.NOTE), 47, 99);
      let time = Cast.toNumber(args.TIME) * 1000;
      time = MathUtil.clamp(time, 0, 3000);

      if (time === 0) {
        return;
      }

      return new Promise((resolve) => {
        const freq = Math.pow(2, (note - 69 + 12) / 12) * 440;
        this._peripheral.beep(freq, time);
        setTimeout(resolve, time);
      });
    }

    _portToIndex(port) {
      const portMap = { A: 0, B: 1, C: 2, D: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      return portMap[port] !== undefined ? portMap[port] : 0;
    }

    _forEachMotor(motorID, callback) {
      let motors;
      switch (motorID) {
        case 0:
          motors = [0];
          break;
        case 1:
          motors = [1];
          break;
        case 2:
          motors = [2];
          break;
        case 3:
          motors = [3];
          break;
        default:
          motors = [];
          break;
      }
      for (const index of motors) {
        callback(index);
      }
    }
  }

  Scratch.extensions.register(new EV3Extension());
})(Scratch);