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

  // ============================================================================
  // BT (BLUETOOTH CLASSIC) CLASS
  // ============================================================================
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

      console.log("[BT] Constructor called", {
        runtime,
        extensionId,
        peripheralOptions,
      });

      this._socket = runtime.getScratchLinkSocket("BT");
      console.log("[BT] Got socket:", this._socket);

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

      console.log("[BT] Opening socket...");
      this._socket.open();
    }

    requestPeripheral() {
      console.log("[BT] requestPeripheral called");
      this._availablePeripherals = {};
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._discoverTimeoutID = window.setTimeout(
        this._handleDiscoverTimeout.bind(this),
        15000,
      );

      console.log(
        "[BT] Sending discover request with options:",
        this._peripheralOptions,
      );
      this.sendRemoteRequest("discover", this._peripheralOptions).catch((e) => {
        console.error("[BT] Discover error:", e);
        this._handleRequestError(e);
      });
    }

    connectPeripheral(id, pin = null) {
      console.log("[BT] connectPeripheral called with id:", id);
      const params = { peripheralId: id };
      if (pin) {
        params.pin = pin;
      }
      this.sendRemoteRequest("connect", params)
        .then(() => {
          console.log("[BT] Connected successfully");
          this._connected = true;
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
          this._connectCallback();
        })
        .catch((e) => {
          console.error("[BT] Connect error:", e);
          this._handleRequestError(e);
        });
    }

    disconnect() {
      console.log("[BT] disconnect called");
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

    sendMessage(options) {
      return this.sendRemoteRequest("send", options).catch((e) => {
        this.handleDisconnectError(e);
      });
    }

    didReceiveCall(method, params) {
      console.log("[BT] didReceiveCall", { method, params });
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
        case "didReceiveMessage":
          if (this._messageCallback) {
            this._messageCallback(params);
          }
          break;
        case "ping":
          return 42;
      }
    }

    handleDisconnectError(/* e */) {
      console.error("[BT] handleDisconnectError");
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
      console.error("[BT] _handleRequestError");
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
        message: `Scratch lost connection to`,
        extensionId: this._extensionId,
      });
    }

    _handleDiscoverTimeout() {
      console.warn("[BT] Discover timeout");
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
  }

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  const iconURI =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAUKADAAQAAAABAAAAUAAAAAASKG51AAAEUUlEQVR4Ae2cTWgTURDHZxORatUeFLUeqtaThSDFHopQ1HoQhB4LigjWq3pTEbUXK+LHUb2qICrYkwiCF7UUpYdq0UA9iFVbaFXqoWq1CMm6/022SZNsnsmb3X2kM7Dp5s17k5lf5r15KewjEhECQkAICAEhIASEgBBYjAQs7qB7r9zvoLR90rbtNsd2I7f9Ku1NWZY1TDHrat+pA4NV2ig5jBVg76W7Z2yyLpBts9ot6XkVjY5TabKot+/0wYtVDC85hC1QN/NS6efxeDzW2ZGg1kQzraivK/mhYTf+mp2jkeQYPR1MUiqVSlM8tosrE2NswWDaErnwOtpbjIGH+PBFwid8sfARSwxX3GwAs2uem3lcznHbwayAeL5y2F/CYSRrwy0YUU3b77NEt4aIkpMZbxIbiHraiVbX5yLM842tuHECzHka8h3gHe8n+jmX++CB90SvJ4iudS+EmOvBc8c2hXncqc4KMg/w2pqIbh/KXLhHG3RBSk0A9KbtsZ2ZbMO0xT3E02Xe8b/WBEB+LP9vsSYAomBArg8QYT3EhXuIp8u843+tiSKCaouCMTxOdPhODtJKZx8PXZBSEwCx5qHaqrYxQYCsCYAAA4gn9gSBqLzNmlgDy4cYrFYAavKNfgqPFvxDqMX5uV9OKu1fzhaDTjJQE6IAFICaBDSHR78Gqta8wgAr7V84nvm9TGFNoOFloF/1DLpdE5BquGSgipBCLwAVgFRqAagipNCHtwb6Vc+g2xUAdNWSgZoEw8vAoKutn31NQKrhkoEqQgq9AFQAUqkFoIqQQh/eGhh0tfWzrwCgq5YM1CQYXgb6OepXPStt97MfcLtkoCZgASgANQloDo9+DfSrnpW2a4KodrhM4WrJZcdFn4F+AfhVYb/+EbVLBmqCF4ACUJOA5nBz10C/KqwZMPdwmcKaRAWgANQkoDncyDXw1ZsPhOvb9Iwb3to1DbR92xb30oyXfbhRAPFYav+jlzT26cuCQCcmpwnX23efqbtrh1FPghoF0IPXsGo57d3dSpub1rkgP45/pSfPRlyw6NOzv3MB4CjfGFNEMGWReYB39Mg+Smzd6GYanrDEPdqgQx/0NUWMAggoyLxldUuL+KANOogALMJD8wXDm7YlusxPaa+4lOoTdpsxGRh24FyfZwxAbFUgKBh+4um8vn79wmw3BiD2eRBU2z9zf4sYoA06iNe3qFMEDUYBbN60nmZ+/KYbNx9T0tnzYV+IC/dogw59TAJo1D4Qm2RvL/jg4YuifAI89DFJOAFOOYE1ImPyTseoKFaMwyYZ2xRcXrXl+ikH37ICX1mEDSDOpnLOY+nCCUE45EZHgvrdC98g7jlaOg7mjeVbA52DvZzHBtM4XmlwaNRdu/I+J9JbZB58gm/wEYeQcTlU8Kikntlzl++dtdL2efd4JT1TgYx24Zl6+JgX8WI7/s6LW/4KASEgBISAEBACQkAILC4C/wDBL1fytvgQdgAAAABJRU5ErkJggg==";

  const BTSendRateMax = 40;
  const SpikePorts = ["A", "B", "C", "D", "E", "F"];

  const SpikeMotorStopMode = {
    float: 0,
    brake: 1,
    hold: 2,
  };

  const SpikeOrientation = {
    front: 1,
    back: 2,
    up: 3,
    down: 4,
    rightside: 5,
    leftside: 6,
  };

  // ============================================================================
  // MOTOR SETTING CLASS
  // ============================================================================
  class SpikeMotorSetting {
    constructor() {
      this._speed = 75;
      this._stopMode = SpikeMotorStopMode.brake;
      this._stallDetection = true;
    }
    get speed() {
      return this._speed;
    }
    set speed(value) {
      this._speed = MathUtil.clamp(value, -100, 100);
    }
    get stopMode() {
      return this._stopMode;
    }
    set stopMode(value) {
      if (value >= 0 && value <= 2) this._stopMode = value;
    }
    get stallDetection() {
      return this._stallDetection;
    }
    set stallDetection(value) {
      this._stallDetection = value;
    }
  }

  // ============================================================================
  // SPIKE PRIME PERIPHERAL CLASS
  // ============================================================================
  class SpikePrime {
    constructor(runtime, extensionId) {
      console.log("[SPIKE] Initializing SPIKE Prime extension", {
        runtime,
        extensionId,
      });

      this._runtime =
        runtime || (typeof vm !== "undefined" ? vm.runtime : null);
      console.log("[SPIKE] Resolved runtime:", this._runtime);

      this._extensionId = extensionId;
      this._remainingText = "";

      this._sensors = {
        buttons: [0, 0, 0, 0],
        angle: { pitch: 0, roll: 0, yaw: 0 },
        orientation: SpikeOrientation.front,
        battery: 100,
        gestures: {
          tapped: false,
          doubletapped: false,
          shake: false,
          freefall: false,
        },
      };

      this._portValues = {};
      this._pixelBrightness = 100;
      this._motorSettings = {
        A: new SpikeMotorSetting(),
        B: new SpikeMotorSetting(),
        C: new SpikeMotorSetting(),
        D: new SpikeMotorSetting(),
        E: new SpikeMotorSetting(),
        F: new SpikeMotorSetting(),
      };

      this._bt = null;
      this._rateLimiter = new RateLimiter(BTSendRateMax);

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
      this._openRequests = {};

      if (this._runtime) {
        console.log("[SPIKE] Registering peripheral extension");
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._runtime.on("PROJECT_STOP_ALL", this.stopAll.bind(this));
      } else {
        console.warn(
          "[SPIKE] No runtime available - peripheral features may not work",
        );
      }
    }

    // Getters
    get angle() {
      return this._sensors.angle;
    }
    get orientation() {
      return this._sensors.orientation;
    }
    get portValues() {
      return this._portValues;
    }
    get pixelBrightness() {
      return this._pixelBrightness;
    }
    set pixelBrightness(value) {
      this._pixelBrightness = value;
    }
    get motorSettings() {
      return this._motorSettings;
    }
    get battery() {
      return this._sensors.battery;
    }
    get gestures() {
      return this._sensors.gestures;
    }

    stopAll() {
      if (!this.isConnected()) return;
      this.stopAllMotors();
    }

    stopAllMotors() {
      for (const port of SpikePorts) {
        this.sendCommand("scratch.motor_stop", {
          port: port,
          stop: SpikeMotorStopMode.brake,
        });
      }
    }

    scan() {
      console.log("[SPIKE] ============ SCAN CALLED ============");

      if (this._bt) {
        console.log("[SPIKE] Disconnecting existing BT");
        this._bt.disconnect();
      }

      const btConfig = {
        majorDeviceClass: 8,
        minorDeviceClass: 1,
      };

      console.log("[SPIKE] Creating BT instance with config:", btConfig);

      try {
        this._bt = new BT(
          this._runtime,
          this._extensionId,
          btConfig,
          this._onConnect,
          this.reset,
          this._onMessage,
        );
        console.log("[SPIKE] ✅ BT instance created successfully");
      } catch (error) {
        console.error("[SPIKE] ❌ ERROR creating BT:", error);
        console.error("[SPIKE] Error stack:", error.stack);
      }
    }

    connect(id) {
      console.log("[SPIKE] connect() called with id:", id);
      if (this._bt) {
        console.log("[SPIKE] Calling connectPeripheral");
        this._bt.connectPeripheral(id);
      } else {
        console.error("[SPIKE] No BT instance available");
      }
    }

    disconnect() {
      if (this._bt) {
        this._bt.disconnect();
      }
      this.reset();
    }

    reset() {
      this._remainingText = "";
      this._sensors = {
        buttons: [0, 0, 0, 0],
        angle: { pitch: 0, roll: 0, yaw: 0 },
        orientation: SpikeOrientation.front,
        battery: 100,
        gestures: {
          tapped: false,
          doubletapped: false,
          shake: false,
          freefall: false,
        },
      };
      this._portValues = {};
    }

    isConnected() {
      const connected = this._bt ? this._bt.isConnected() : false;
      console.log("[SPIKE] isConnected() called, result:", connected);
      return connected;
    }

    sendRaw(text, useLimiter = false) {
      if (!this.isConnected()) return Promise.resolve();
      if (useLimiter && !this._rateLimiter.okayToSend())
        return Promise.resolve();

      return this._bt.sendMessage({ message: text });
    }

    sendJSON(json, useLimiter = false, id = null) {
      const jsonText = JSON.stringify(json);
      return this.sendRaw(`${jsonText}\r`, useLimiter);
    }

    sendCommand(method, params, needsResponse = true) {
      if (needsResponse) {
        const id = Math.random().toString(36).slice(-4);
        const promise = new Promise((resolve, reject) => {
          this._openRequests[id] = { resolve, reject };
        });
        this.sendJSON({ i: id, m: method, p: params });
        return promise;
      }
      return this.sendJSON({ m: method, p: params });
    }

    _onConnect() {
      console.log("[SPIKE] _onConnect() called - device connected!");

      // Request initial state
      setTimeout(() => {
        this.sendCommand("trigger_current_state", {}, false);
      }, 500);
    }

    _onMessage(params) {
      const message = params.message;
      const data = Base64Util.base64ToUint8Array(message);
      const text = new TextDecoder().decode(data);

      const responses = (this._remainingText + text).split("\r\n");
      this._remainingText = responses.pop();

      for (const responseText of responses) {
        const trimmedText = responseText.trim();
        if (!trimmedText) continue;

        try {
          const json = JSON.parse(trimmedText);
          console.log("[SPIKE] < JSON:", json);
          this._parseResponse(json);
        } catch (error) {
          console.log("[SPIKE] < RAW:", trimmedText);
        }
      }
    }

    _parseResponse(response) {
      if (response.hasOwnProperty("m")) {
        switch (response.m) {
          case 0: // Hub status
            this._parseHubStatus(response);
            break;
          case 2: // Battery
            if (response.p && response.p.length >= 2) {
              this._sensors.battery = Math.round(response.p[1]);
            }
            break;
          case 3: // Button
            this._parseButtonEvent(response);
            break;
          case 4: // Event (Orientation, Gesture)
            this._parseEventResponse(response);
            break;
        }
      }

      if (response.hasOwnProperty("i")) {
        const openRequest = this._openRequests[response.i];
        delete this._openRequests[response.i];
        if (openRequest) {
          openRequest.resolve();
        }
      }
    }

    _parseHubStatus(response) {
      // Parse port data
      for (let i = 0; i < 6; i++) {
        const port = SpikePorts[i];
        const deviceId = response.p[i][0];
        const values = response.p[i][1];

        switch (deviceId) {
          case 48: // Large motor
          case 49: // Medium motor
            this._portValues[port] = {
              type: "motor",
              speed: values[0],
              position: (values[2] + 360) % 360,
              power: values[3],
            };
            break;
          case 61: // Color sensor
            if (values.length >= 4) {
              this._portValues[port] = {
                type: "color",
                color: values[0],
                reflection: values[1],
                ambient: values[2],
              };
            }
            break;
          case 62: // Distance sensor
            this._portValues[port] = {
              type: "distance",
              distance: values[0] === -1 ? 0 : values[0],
            };
            break;
          case 63: // Force sensor
            this._portValues[port] = {
              type: "force",
              force: values[0],
              pressed: values[1] > 0,
            };
            break;
          default:
            this._portValues[port] = { type: "unknown" };
            break;
        }
      }

      // Parse angle data
      if (response.p.length > 8 && response.p[8] && response.p[8].length >= 3) {
        this._sensors.angle = {
          yaw: response.p[8][0],
          pitch: response.p[8][1],
          roll: response.p[8][2],
        };
      }
    }

    _parseButtonEvent(response) {
      if (response.p && response.p.length >= 2) {
        const button = response.p[0];
        const pressed = response.p[1] === 1;
        const buttonIndex = { left: 0, center: 1, right: 2 }[button];
        if (buttonIndex !== undefined) {
          this._sensors.buttons[buttonIndex] = pressed ? 1 : 0;
        }
      }
    }

    _parseEventResponse(response) {
      if (SpikeOrientation.hasOwnProperty(response.p)) {
        this._sensors.orientation = SpikeOrientation[response.p];
      }

      const gestureMap = {
        tapped: "tapped",
        doubletapped: "doubletapped",
        shake: "shake",
        freefall: "freefall",
      };
      if (gestureMap[response.p]) {
        this._sensors.gestures[gestureMap[response.p]] = true;
        setTimeout(() => {
          this._sensors.gestures[gestureMap[response.p]] = false;
        }, 100);
      }
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================
  class SpikePrimeExtension {
    constructor(runtime) {
      console.log(
        "[SPIKE Extension] Constructor called with runtime:",
        runtime,
      );

      this.runtime = runtime;

      if (!this.runtime && typeof Scratch !== "undefined" && Scratch.vm) {
        this.runtime = Scratch.vm.runtime;
        console.log("[SPIKE Extension] Got runtime from Scratch.vm.runtime");
      }

      console.log("[SPIKE Extension] Final runtime:", this.runtime);
      this._peripheral = new SpikePrime(this.runtime, "spikeprime");
      console.log("[SPIKE Extension] Peripheral created:", this._peripheral);
    }

    getInfo() {
      console.log("[SPIKE] getInfo() called");
      return {
        id: "spikeprime",
        name: "SPIKE Prime (BTC)",
        blockIconURI: iconURI,
        showStatusButton: true,
        blocks: [
          // Motor Control
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
              VALUE: { type: ArgumentType.NUMBER, defaultValue: 1 },
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
              SPEED: { type: ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "getPosition",
            text: "[PORT] position",
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
          // Display
          {
            opcode: "displayText",
            text: "write [TEXT]",
            blockType: BlockType.COMMAND,
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello" },
            },
          },
          {
            opcode: "displayImage",
            text: "turn on [MATRIX]",
            blockType: BlockType.COMMAND,
            arguments: {
              MATRIX: {
                type: ArgumentType.MATRIX,
                defaultValue: "1101111011000001000101110",
              },
            },
          },
          {
            opcode: "displayClear",
            text: "turn off pixels",
            blockType: BlockType.COMMAND,
          },
          {
            opcode: "setPixel",
            text: "set pixel [X] [Y] to [BRIGHTNESS] %",
            blockType: BlockType.COMMAND,
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 3 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 3 },
              BRIGHTNESS: { type: ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          "---",
          // Sensors
          {
            opcode: "getAngle",
            text: "[AXIS] angle",
            blockType: BlockType.REPORTER,
            arguments: {
              AXIS: {
                type: ArgumentType.STRING,
                menu: "AXIS",
                defaultValue: "pitch",
              },
            },
          },
          {
            opcode: "getOrientation",
            text: "orientation",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "getBatteryLevel",
            text: "battery level %",
            blockType: BlockType.REPORTER,
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
            opcode: "isButtonPressed",
            text: "[BUTTON] button pressed?",
            blockType: BlockType.BOOLEAN,
            arguments: {
              BUTTON: {
                type: ArgumentType.STRING,
                menu: "BUTTON",
                defaultValue: "center",
              },
            },
          },
        ],
        menus: {
          PORT: {
            acceptReporters: true,
            items: SpikePorts,
          },
          MULTIPLE_PORT: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "E", "F", "A+B", "C+D", "E+F"],
          },
          MOTOR_UNIT: {
            acceptReporters: false,
            items: ["rotations", "degrees", "seconds"],
          },
          AXIS: {
            acceptReporters: false,
            items: ["pitch", "roll", "yaw"],
          },
          DIRECTION: {
            acceptReporters: false,
            items: [
              { text: "⬆️", value: "1" },
              { text: "⬇️", value: "-1" },
            ],
          },
          BUTTON: {
            acceptReporters: false,
            items: ["left", "center", "right"],
          },
        },
      };
    }

    // Motor implementations
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
        const setting = this._peripheral.motorSettings[port];
        return this._peripheral.sendCommand("scratch.motor_run_for_degrees", {
          port: port,
          speed: setting.speed * direction,
          degrees: Math.floor(degrees),
          stop: setting.stopMode,
          stall: setting.stallDetection,
        });
      });
      return Promise.all(promises).then(() => {});
    }

    _motorRunTimed(ports, direction, seconds) {
      const promises = ports.map((port) => {
        const setting = this._peripheral.motorSettings[port];
        return this._peripheral.sendCommand("scratch.motor_run_timed", {
          port: port,
          speed: setting.speed * direction,
          time: Math.floor(seconds * 1000),
          stop: setting.stopMode,
          stall: setting.stallDetection,
        });
      });
      return Promise.all(promises).then(() => {});
    }

    motorStart(args) {
      const direction = args.DIRECTION;
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const setting = this._peripheral.motorSettings[port];
        return this._peripheral.sendCommand("scratch.motor_start", {
          port: port,
          speed: setting.speed * direction,
          stall: setting.stallDetection,
        });
      });
      return Promise.all(promises).then(() => {});
    }

    motorStop(args) {
      const ports = this._validatePorts(Cast.toString(args.PORT));

      const promises = ports.map((port) => {
        const setting = this._peripheral.motorSettings[port];
        return this._peripheral.sendCommand("scratch.motor_stop", {
          port: port,
          stop: setting.stopMode,
        });
      });
      return Promise.all(promises).then(() => {});
    }

    motorSetSpeed(args) {
      const speed = Cast.toNumber(args.SPEED);
      const ports = this._validatePorts(Cast.toString(args.PORT));
      ports.forEach((port) => {
        this._peripheral.motorSettings[port].speed = speed;
      });
    }

    getPosition(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this._peripheral.portValues[port]?.position ?? 0;
    }

    // Display implementations
    displayText(args) {
      const text = Cast.toString(args.TEXT);
      return this._peripheral.sendCommand("scratch.display_text", {
        text: text,
      });
    }

    displayImage(args) {
      const matrix = Cast.toString(args.MATRIX);
      const brightness = Math.round(
        (9 * this._peripheral.pixelBrightness) / 100,
      );
      const symbol = (matrix.replace(/\D/g, "") + "0".repeat(25)).slice(0, 25);
      const image = symbol.replace(/1/g, brightness).match(/.{5}/g).join(":");
      return this._peripheral.sendCommand("scratch.display_image", {
        image: image,
      });
    }

    displayClear() {
      return this._peripheral.sendCommand("scratch.display_clear", {});
    }

    setPixel(args) {
      const x = Cast.toNumber(args.X) - 1;
      const y = Cast.toNumber(args.Y) - 1;
      const brightness = Cast.toNumber(args.BRIGHTNESS);

      if (x < 0 || x > 4 || y < 0 || y > 4) return Promise.resolve();

      return this._peripheral.sendCommand("scratch.display_set_pixel", {
        x: x,
        y: y,
        brightness: Math.round((brightness * 9) / 100),
      });
    }

    // Sensor implementations
    getAngle(args) {
      const axis = Cast.toString(args.AXIS);
      return this._peripheral.angle[axis] || 0;
    }

    getOrientation() {
      const orientationNames = [
        "unknown",
        "front",
        "back",
        "up",
        "down",
        "rightside",
        "leftside",
      ];
      return orientationNames[this._peripheral.orientation] || "unknown";
    }

    getBatteryLevel() {
      return this._peripheral.battery;
    }

    getDistance(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const portData = this._peripheral.portValues[port];
      if (portData && portData.type === "distance") {
        return portData.distance;
      }
      return 0;
    }

    getColor(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const portData = this._peripheral.portValues[port];
      if (portData && portData.type === "color") {
        const colorNames = [
          "black",
          "magenta",
          "purple",
          "blue",
          "azure",
          "turquoise",
          "green",
          "yellow",
          "orange",
          "red",
          "white",
        ];
        return colorNames[portData.color] || "none";
      }
      return "none";
    }

    isButtonPressed(args) {
      const button = Cast.toString(args.BUTTON);
      const buttonIndex = { left: 0, center: 1, right: 2 }[button];
      if (buttonIndex !== undefined) {
        return this._peripheral._sensors.buttons[buttonIndex] === 1;
      }
      return false;
    }

    // Utility methods
    _validatePorts(text) {
      return text
        .toUpperCase()
        .replace(/[^ABCDEF]/g, "")
        .split("")
        .filter((x, i, self) => self.indexOf(x) === i)
        .sort();
    }
  }

  Scratch.extensions.register(new SpikePrimeExtension());
})(Scratch);
