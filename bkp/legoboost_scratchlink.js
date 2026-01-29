(function (Scratch) {
  "use strict";

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;

  // Utility functions that would normally come from scratch-vm
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
        r = c;
        g = x;
        b = 0;
      } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else {
        r = c;
        g = 0;
        b = x;
      }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      };
    },
    rgbToDecimal: ({ r, g, b }) => (r << 16) | (g << 8) | b,
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

  // Icon and constants
  const iconURI =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACpQTFRF////fIel5ufolZ62/2YavsPS+YZOkJmy9/j53+Hk6+zs6N/b6dfO////tDhMHAAAAA50Uk5T/////////////////wBFwNzIAAAA6ElEQVR42uzX2w6DIBAEUGDVtlr//3dLaLwgiwUd2z7MJPJg5EQWiGhGcAxBggQJEiT436CIfqXJPTn3MKNYYMSDFpoAmp24OaYgvwKnFgL2zvVTCwHrMoMi+nUQLFthaNCCa0iwclLkDgYVsQp0mzxuqXgK1MRzoCLWgkPXNN2wI/q6Kvt7u/cX0HtejN8x2sXpnpb8J8D3b0Keuhh3X975M+i0xNVbg3s1TIasgK21bQyGO+s2PykaGMYbge8KrNrssvkOWDXkErB8UuBHETjoYLkKBA8ZfuDkbwVBggQJEiR4MC8BBgDTtMZLx2nFCQAAAABJRU5ErkJggg==";

  const BoostBLE = {
    service: "00001623-1212-efde-1623-785feabcd123",
    characteristic: "00001624-1212-efde-1623-785feabcd123",
    sendInterval: 100,
    sendRateMax: 20,
  };

  const BoostMotorMaxPowerAdd = 10;
  const BoostPingInterval = 5000;
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
  };

  const BoostPortFeedback = {
    IN_PROGRESS: 0x01,
    COMPLETED: 0x02,
    DISCARDED: 0x04,
    IDLE: 0x08,
    BUSY_OR_FULL: 0x10,
  };

  const BoostPort10000223OrOlder = { A: 55, B: 56, C: 1, D: 2 };
  const BoostPort10000224OrNewer = { A: 0, B: 1, C: 2, D: 3 };
  let BoostPort = BoostPort10000224OrNewer;

  const BoostColor = {
    ANY: "any",
    NONE: "none",
    RED: "red",
    BLUE: "blue",
    GREEN: "green",
    YELLOW: "yellow",
    WHITE: "white",
    BLACK: "black",
  };

  const BoostColorIndex = {
    [BoostColor.NONE]: 255,
    [BoostColor.RED]: 9,
    [BoostColor.BLUE]: 3,
    [BoostColor.GREEN]: 5,
    [BoostColor.YELLOW]: 7,
    [BoostColor.WHITE]: 10,
    [BoostColor.BLACK]: 0,
  };

  const BoostOperator = { LESS: "<", GREATER: ">", EQUAL: "=" };

  const BoostMessage = {
    HUB_PROPERTIES: 0x01,
    HUB_ACTIONS: 0x02,
    HUB_ALERTS: 0x03,
    HUB_ATTACHED_IO: 0x04,
    ERROR: 0x05,
    PORT_INPUT_FORMAT_SETUP_SINGLE: 0x41,
    PORT_INPUT_FORMAT_SETUP_COMBINED: 0x42,
    PORT_INFORMATION: 0x43,
    PORT_MODEINFORMATION: 0x44,
    PORT_VALUE: 0x45,
    PORT_VALUE_COMBINED: 0x46,
    PORT_INPUT_FORMAT: 0x47,
    PORT_INPUT_FORMAT_COMBINED: 0x48,
    OUTPUT: 0x81,
    PORT_FEEDBACK: 0x82,
  };

  const BoostHubProperty = {
    ADVERTISEMENT_NAME: 0x01,
    BUTTON: 0x02,
    FW_VERSION: 0x03,
    HW_VERSION: 0x04,
    RSSI: 0x05,
    BATTERY_VOLTAGE: 0x06,
    BATTERY_TYPE: 0x07,
    MANUFACTURER_NAME: 0x08,
    RADIO_FW_VERSION: 0x09,
    LEGO_WP_VERSION: 0x0a,
    SYSTEM_TYPE_ID: 0x0b,
    HW_NETWORK_ID: 0x0c,
    PRIMARY_MAC: 0x0d,
    SECONDARY_MAC: 0x0e,
    HW_NETWORK_FAMILY: 0x0f,
  };

  const BoostHubPropertyOperation = {
    SET: 0x01,
    ENABLE_UPDATES: 0x02,
    DISABLE_UPDATES: 0x03,
    RESET: 0x04,
    REQUEST_UPDATE: 0x05,
    UPDATE: 0x06,
  };

  const BoostOutputSubCommand = {
    START_POWER: 0x01,
    START_POWER_PAIR: 0x02,
    SET_ACC_TIME: 0x05,
    SET_DEC_TIME: 0x06,
    START_SPEED: 0x07,
    START_SPEED_PAIR: 0x08,
    START_SPEED_FOR_TIME: 0x09,
    START_SPEED_FOR_TIME_PAIR: 0x0a,
    START_SPEED_FOR_DEGREES: 0x0b,
    START_SPEED_FOR_DEGREES_PAIR: 0x0c,
    GO_TO_ABS_POSITION: 0x0d,
    GO_TO_ABS_POSITION_PAIR: 0x0e,
    PRESET_ENCODER: 0x14,
    WRITE_DIRECT_MODE_DATA: 0x51,
  };

  const BoostOutputExecution = {
    BUFFER_IF_NECESSARY: 0x00,
    EXECUTE_IMMEDIATELY: 0x10,
    NO_ACTION: 0x00,
    COMMAND_FEEDBACK: 0x01,
  };

  const BoostMotorEndState = { FLOAT: 0, HOLD: 126, BRAKE: 127 };
  const BoostMotorProfile = {
    DO_NOT_USE: 0x00,
    ACCELERATION: 0x01,
    DECELERATION: 0x02,
  };
  const BoostIOEvent = {
    ATTACHED: 0x01,
    DETACHED: 0x00,
    ATTACHED_VIRTUAL: 0x02,
  };

  const BoostMode = {
    TILT: 0,
    LED: 1,
    COLOR: 0,
    COLOR_DISTANCE: 8,
    MOTOR_SENSOR: 2,
    UNKNOWN: 0,
  };

  const BoostMotorState = {
    OFF: 0,
    ON_FOREVER: 1,
    ON_FOR_TIME: 2,
    ON_FOR_ROTATION: 3,
  };

  const numberToInt32Array = (number) => {
    const buffer = new ArrayBuffer(4);
    const dataview = new DataView(buffer);
    dataview.setInt32(0, number);
    return [
      dataview.getInt8(3),
      dataview.getInt8(2),
      dataview.getInt8(1),
      dataview.getInt8(0),
    ];
  };

  const int32ArrayToNumber = (array) => {
    const i = Uint8Array.from(array);
    const d = new DataView(i.buffer);
    return d.getInt32(0, true);
  };

  // Motor class
  class BoostMotor {
    constructor(parent, index) {
      this._parent = parent;
      this._index = index;
      this._direction = 1;
      this._power = 50;
      this._position = 0;
      this._status = BoostMotorState.OFF;
      this._pendingDurationTimeoutId = null;
      this._pendingDurationTimeoutStartTime = null;
      this._pendingDurationTimeoutDelay = null;
      this._pendingRotationDestination = null;
      this._pendingRotationPromise = null;
      this.turnOff = this.turnOff.bind(this);
    }

    get direction() {
      return this._direction;
    }
    set direction(value) {
      this._direction = value < 0 ? -1 : 1;
    }
    get power() {
      return this._power;
    }
    set power(value) {
      if (value === 0) {
        this._power = 0;
      } else {
        this._power = MathUtil.scale(value, 1, 100, 10, 100);
      }
    }
    get position() {
      return this._position;
    }
    set position(value) {
      this._position = value;
    }
    get status() {
      return this._status;
    }
    set status(value) {
      this._clearRotationState();
      this._clearDurationTimeout();
      this._status = value;
    }
    get pendingDurationTimeoutStartTime() {
      return this._pendingDurationTimeoutStartTime;
    }
    get pendingDurationTimeoutDelay() {
      return this._pendingDurationTimeoutDelay;
    }
    get pendingRotationDestination() {
      return this._pendingRotationDestination;
    }
    get pendingRotationPromise() {
      return this._pendingRotationPromise;
    }
    set pendingRotationPromise(func) {
      this._pendingRotationPromise = func;
    }

    _turnOn() {
      const cmd = this._parent.generateOutputCommand(
        this._index,
        BoostOutputExecution.EXECUTE_IMMEDIATELY,
        BoostOutputSubCommand.START_SPEED,
        [
          this.power * this.direction,
          MathUtil.clamp(this.power + BoostMotorMaxPowerAdd, 0, 100),
          BoostMotorProfile.DO_NOT_USE,
        ],
      );
      this._parent.send(BoostBLE.characteristic, cmd);
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
        BoostOutputExecution.EXECUTE_IMMEDIATELY ^
          BoostOutputExecution.COMMAND_FEEDBACK,
        BoostOutputSubCommand.START_SPEED_FOR_DEGREES,
        [
          ...numberToInt32Array(degrees),
          this.power * this.direction * direction,
          MathUtil.clamp(this.power + BoostMotorMaxPowerAdd, 0, 100),
          BoostMotorEndState.BRAKE,
          BoostMotorProfile.DO_NOT_USE,
        ],
      );
      this.status = BoostMotorState.ON_FOR_ROTATION;
      this._pendingRotationDestination =
        this.position + degrees * this.direction * direction;
      this._parent.send(BoostBLE.characteristic, cmd);
    }

    turnOff(useLimiter = true) {
      const cmd = this._parent.generateOutputCommand(
        this._index,
        BoostOutputExecution.EXECUTE_IMMEDIATELY,
        BoostOutputSubCommand.START_POWER,
        [BoostMotorEndState.FLOAT],
      );
      this.status = BoostMotorState.OFF;
      this._parent.send(BoostBLE.characteristic, cmd, useLimiter);
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
  // JSONRPC CLASS (from scratch-vm)
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
  // BLE CLASS (from scratch-vm/src/io/ble.js)
  // ============================================================================
  class BLE extends JSONRPC {
    constructor(
      runtime,
      extensionId,
      peripheralOptions,
      connectCallback,
      resetCallback = null,
    ) {
      super();

      console.log("[BLE] Constructor called", {
        runtime,
        extensionId,
        peripheralOptions,
      });

      this._socket = runtime.getScratchLinkSocket("BLE");
      console.log("[BLE] Got socket:", this._socket);

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

      console.log("[BLE] Opening socket...");
      this._socket.open();
    }

    requestPeripheral() {
      console.log("[BLE] requestPeripheral called");
      this._availablePeripherals = {};
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._discoverTimeoutID = window.setTimeout(
        this._handleDiscoverTimeout.bind(this),
        15000,
      );

      console.log(
        "[BLE] Sending discover request with options:",
        this._peripheralOptions,
      );
      this.sendRemoteRequest("discover", this._peripheralOptions).catch((e) => {
        console.error("[BLE] Discover error:", e);
        this._handleRequestError(e);
      });
    }

    connectPeripheral(id) {
      console.log("[BLE] connectPeripheral called with id:", id);
      this.sendRemoteRequest("connect", { peripheralId: id })
        .then(() => {
          console.log("[BLE] Connected successfully");
          this._connected = true;
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
          this._connectCallback();
        })
        .catch((e) => {
          console.error("[BLE] Connect error:", e);
          this._handleRequestError(e);
        });
    }

    disconnect() {
      console.log("[BLE] disconnect called");
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

    startNotifications(
      serviceId,
      characteristicId,
      onCharacteristicChanged = null,
    ) {
      console.log("[BLE] startNotifications", { serviceId, characteristicId });
      const params = {
        serviceId,
        characteristicId,
      };
      this._characteristicDidChangeCallback = onCharacteristicChanged;
      return this.sendRemoteRequest("startNotifications", params).catch((e) => {
        console.error("[BLE] startNotifications error:", e);
        this.handleDisconnectError(e);
      });
    }

    read(
      serviceId,
      characteristicId,
      optStartNotifications = false,
      onCharacteristicChanged = null,
    ) {
      console.log("[BLE] read", {
        serviceId,
        characteristicId,
        optStartNotifications,
      });
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
        console.error("[BLE] read error:", e);
        this.handleDisconnectError(e);
      });
    }

    write(
      serviceId,
      characteristicId,
      message,
      encoding = null,
      withResponse = null,
    ) {
      console.log("[BLE] write", {
        serviceId,
        characteristicId,
        messageLength: message.length,
        encoding,
      });
      const params = { serviceId, characteristicId, message };
      if (encoding) {
        params.encoding = encoding;
      }
      if (withResponse !== null) {
        params.withResponse = withResponse;
      }
      return this.sendRemoteRequest("write", params).catch((e) => {
        console.error("[BLE] write error:", e);
        this.handleDisconnectError(e);
      });
    }

    didReceiveCall(method, params) {
      console.log("[BLE] didReceiveCall", { method, params });
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
      console.error("[BLE] handleDisconnectError");
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
      console.error("[BLE] _handleRequestError");
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
        message: `Scratch lost connection to`,
        extensionId: this._extensionId,
      });
    }

    _handleDiscoverTimeout() {
      console.warn("[BLE] Discover timeout");
      if (this._discoverTimeoutID) {
        window.clearTimeout(this._discoverTimeoutID);
      }
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
  }

  // Boost peripheral class
  class Boost {
    constructor(runtime, extensionId) {
      console.log("[BOOST] Initializing Boost extension", {
        runtime,
        extensionId,
      });

      this._runtime =
        runtime || (typeof vm !== "undefined" ? vm.runtime : null);
      console.log("[BOOST] Resolved runtime:", this._runtime);

      this._extensionId = extensionId;

      this._ports = [];
      this._motors = [];
      this._sensors = {
        tiltX: 0,
        tiltY: 0,
        color: BoostColor.NONE,
        previousColor: BoostColor.NONE,
        distance: null,
      };
      this._colorSamples = [];
      this._ble = null;
      this._rateLimiter = new RateLimiter(BoostBLE.sendRateMax);
      this._pingDeviceId = null;

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
      this._pingDevice = this._pingDevice.bind(this);

      if (this._runtime) {
        // Only register if we have a runtime
        console.log("[BOOST] Registering peripheral extension");
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._runtime.on("PROJECT_STOP_ALL", this.stopAll.bind(this));
      } else {
        console.warn(
          "[BOOST] No runtime available - peripheral features may not work",
        );
      }
    }

    get tiltX() {
      return this._sensors.tiltX;
    }
    get tiltY() {
      return this._sensors.tiltY;
    }
    get color() {
      return this._sensors.color;
    }
    get previousColor() {
      return this._sensors.previousColor;
    }
    get distance() {
      return this._sensors.distance;
    }

    boostColorForIndex(index) {
      const colorForIndex = Object.keys(BoostColorIndex).find(
        (key) => BoostColorIndex[key] === index,
      );
      return colorForIndex || BoostColor.NONE;
    }

    motor(index) {
      return this._motors[index];
    }

    stopAllMotors() {
      this._motors.forEach((motor) => {
        if (motor) motor.turnOff(false);
      });
    }

    setLED(inputRGB) {
      const rgb = [
        (inputRGB >> 16) & 0x000000ff,
        (inputRGB >> 8) & 0x000000ff,
        inputRGB & 0x000000ff,
      ];

      const cmd = this.generateOutputCommand(
        this._ports.indexOf(BoostIO.LED),
        BoostOutputExecution.EXECUTE_IMMEDIATELY ^
          BoostOutputExecution.COMMAND_FEEDBACK,
        BoostOutputSubCommand.WRITE_DIRECT_MODE_DATA,
        [BoostMode.LED, ...rgb],
      );

      return this.send(BoostBLE.characteristic, cmd);
    }

    setLEDMode() {
      const cmd = this.generateInputCommand(
        this._ports.indexOf(BoostIO.LED),
        BoostMode.LED,
        0,
        false,
      );
      return this.send(BoostBLE.characteristic, cmd);
    }

    stopAll() {
      if (!this.isConnected()) return;
      this.stopAllMotors();
    }

    scan() {
      console.log("[BOOST] ============ SCAN CALLED ============");

      if (this._ble) {
        console.log("[BOOST] Disconnecting existing BLE");
        this._ble.disconnect();
      }

      const bleConfig = {
        filters: [
          {
            services: [BoostBLE.service],
            manufacturerData: {
              0x0397: {
                dataPrefix: [0x00, 0x40],
                mask: [0x00, 0xff],
              },
            },
          },
        ],
        optionalServices: [],
      };

      console.log("[BOOST] Creating BLE instance with config:", bleConfig);

      try {
        this._ble = new BLE(
          this._runtime,
          this._extensionId,
          bleConfig,
          this._onConnect,
          this.reset,
        );
        console.log("[BOOST] ✅ BLE instance created successfully");
      } catch (error) {
        console.error("[BOOST] ❌ ERROR creating BLE:", error);
        console.error("[BOOST] Error stack:", error.stack);
      }
    }

    // Alternative scan method if BLE class is not directly accessible
    scanAlternative() {
      console.log(
        "[BOOST] Using alternative scan via runtime peripheral system",
      );

      // In TurboWarp, the runtime should handle BLE connection
      // We just need to trigger the peripheral search
      if (this._runtime && this._runtime.emit) {
        console.log("[BOOST] Emitting peripheralScanRequest");
        this._runtime.emit("peripheralScanRequest", {
          extensionId: this._extensionId,
        });
      }
    }

    connect(id) {
      console.log("[BOOST] connect() called with id:", id);
      if (this._ble) {
        console.log("[BOOST] Calling connectPeripheral");
        this._ble.connectPeripheral(id);
      } else {
        console.error("[BOOST] No BLE instance available");
      }
    }

    disconnect() {
      if (this._ble) {
        this._ble.disconnect();
      }
      this.reset();
    }

    reset() {
      this._ports = [];
      this._motors = [];
      this._sensors = {
        tiltX: 0,
        tiltY: 0,
        color: BoostColor.NONE,
        previousColor: BoostColor.NONE,
        distance: null,
      };
      if (this._pingDeviceId) {
        window.clearInterval(this._pingDeviceId);
        this._pingDeviceId = null;
      }
    }

    isConnected() {
      const connected = this._ble ? this._ble.isConnected() : false;
      console.log("[BOOST] isConnected() called, result:", connected);
      return connected;
    }

    send(uuid, message, useLimiter = true) {
      console.log("[BOOST] send() called", {
        uuid,
        message: Array.from(message),
        useLimiter,
        connected: this.isConnected(),
      });

      if (!this.isConnected()) {
        console.warn("[BOOST] Not connected, cannot send");
        return Promise.resolve();
      }

      if (useLimiter && !this._rateLimiter.okayToSend()) {
        console.warn("[BOOST] Rate limited");
        return Promise.resolve();
      }

      const base64 = Base64Util.uint8ArrayToBase64(message);
      console.log("[BOOST] Sending base64:", base64);

      return this._ble.write(BoostBLE.service, uuid, base64, "base64");
    }

    generateOutputCommand(portID, execution, subCommand, payload) {
      const hubID = 0x00;
      const command = [
        hubID,
        BoostMessage.OUTPUT,
        portID,
        execution,
        subCommand,
        ...payload,
      ];
      command.unshift(command.length + 1);
      return command;
    }

    generateInputCommand(portID, mode, delta, enableNotifications) {
      const command = [
        0x00,
        BoostMessage.PORT_INPUT_FORMAT_SETUP_SINGLE,
        portID,
        mode,
      ]
        .concat(numberToInt32Array(delta))
        .concat([enableNotifications]);
      command.unshift(command.length + 1);
      return command;
    }

    _onConnect() {
      console.log("[BOOST] _onConnect() called - device connected!");

      console.log("[BOOST] Starting notifications");
      this._ble.startNotifications(
        BoostBLE.service,
        BoostBLE.characteristic,
        this._onMessage,
      );

      console.log("[BOOST] Setting up ping interval");
      this._pingDeviceId = window.setInterval(
        this._pingDevice,
        BoostPingInterval,
      );

      console.log("[BOOST] Requesting firmware version");
      setTimeout(() => {
        const command = [
          0x00,
          BoostMessage.HUB_PROPERTIES,
          BoostHubProperty.FW_VERSION,
          BoostHubPropertyOperation.REQUEST_UPDATE,
        ];
        command.unshift(command.length + 1);
        console.log("[BOOST] Sending FW version request:", command);
        this.send(BoostBLE.characteristic, command, false);
      }, 500);
    }

    _onMessage(base64) {
      const data = Base64Util.base64ToUint8Array(base64);
      console.log("[BOOST] Received message:", {
        length: data.length,
        type: data[2],
        portID: data[3],
        raw: Array.from(data),
      });

      const messageType = data[2];
      const portID = data[3];

      switch (messageType) {
        case BoostMessage.HUB_PROPERTIES: {
          const property = data[3];
          switch (property) {
            case BoostHubProperty.FW_VERSION: {
              const fwVersion10000224 = int32ArrayToNumber([
                0x24, 0x02, 0x00, 0x10,
              ]);
              const fwHub = int32ArrayToNumber(data.slice(5, data.length));
              if (fwHub < fwVersion10000224) {
                BoostPort = BoostPort10000223OrOlder;
                console.log(
                  "Move Hub firmware older than version 1.0.00.0224 detected.",
                );
              } else {
                BoostPort = BoostPort10000224OrNewer;
              }
              break;
            }
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
          switch (type) {
            case BoostIO.TILT:
              this._sensors.tiltX = data[4];
              this._sensors.tiltY = data[5];
              break;
            case BoostIO.COLOR: {
              this._colorSamples.unshift(data[4]);
              if (this._colorSamples.length > BoostColorSampleSize) {
                this._colorSamples.pop();
                if (this._colorSamples.every((v, i, arr) => v === arr[0])) {
                  this._sensors.previousColor = this._sensors.color;
                  this._sensors.color = this.boostColorForIndex(
                    this._colorSamples[0],
                  );
                } else {
                  this._sensors.color = BoostColor.NONE;
                }
              } else {
                this._sensors.color = BoostColor.NONE;
              }
              const distance = data[5];
              const partialDistance = data[7];
              let totalDistance = distance;
              if (partialDistance > 0) {
                totalDistance = totalDistance + 1 / partialDistance;
              }
              this._sensors.distance = totalDistance;
              break;
            }
            case BoostIO.MOTOREXT:
            case BoostIO.MOTORINT:
              if (this.motor(portID)) {
                this.motor(portID).position = int32ArrayToNumber(
                  data.slice(4, 8),
                );
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
            const commandCompleted =
              feedback &
              (BoostPortFeedback.COMPLETED ^ BoostPortFeedback.DISCARDED);
            if (!isBusy && commandCompleted) {
              if (motor.status === BoostMotorState.ON_FOR_ROTATION) {
                motor.status = BoostMotorState.OFF;
              }
            }
          }
          break;
        }
        case BoostMessage.ERROR:
          console.warn("Error reported by hub:", data);
          break;
      }
    }

    _pingDevice() {
      this._ble.read(BoostBLE.service, BoostBLE.characteristic, false);
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
          mode = BoostMode.COLOR_DISTANCE;
          delta = 0;
          break;
        case BoostIO.LED:
          mode = BoostMode.LED;
          this.setLEDMode();
          this.setLED(0x0000ff);
          break;
        case BoostIO.TILT:
          mode = BoostMode.TILT;
          break;
        default:
          mode = BoostMode.UNKNOWN;
      }

      const cmd = this.generateInputCommand(portID, mode, delta, true);
      this.send(BoostBLE.characteristic, cmd);
    }

    _clearPort(portID) {
      const type = this._ports[portID];
      if (type === BoostIO.TILT) {
        this._sensors.tiltX = this._sensors.tiltY = 0;
      }
      if (type === BoostIO.COLOR) {
        this._sensors.color = BoostColor.NONE;
        this._sensors.distance = null;
      }
      this._ports[portID] = "none";
      this._motors[portID] = null;
    }
  }

  // Extension class
  const BoostMotorLabel = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    AB: "AB",
    ALL: "ABCD",
  };

  const BoostMotorDirection = {
    FORWARD: "this way",
    BACKWARD: "that way",
    REVERSE: "reverse",
  };

  const BoostTiltDirection = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    ANY: "any",
  };

  class BoostExtension {
    constructor(runtime) {
      console.log(
        "[BOOST Extension] Constructor called with runtime:",
        runtime,
      );
      console.log("[BOOST Extension] typeof runtime:", typeof runtime);
      console.log("[BOOST Extension] Scratch object:", typeof Scratch);

      this.runtime = runtime;

      // Try to get runtime from Scratch global if not provided
      if (!this.runtime && typeof Scratch !== "undefined" && Scratch.vm) {
        this.runtime = Scratch.vm.runtime;
        console.log("[BOOST Extension] Got runtime from Scratch.vm.runtime");
      }

      console.log("[BOOST Extension] Final runtime:", this.runtime);
      this._peripheral = new Boost(this.runtime, "boost");
      console.log("[BOOST Extension] Peripheral created:", this._peripheral);
    }

    getInfo() {
      console.log("[BOOST] getInfo() called");
      return {
        id: "boost", // MUST match the extensionId passed to Boost constructor
        name: "LEGO BOOST",
        blockIconURI: iconURI,
        showStatusButton: true, // This is critical!
        blocks: [
          {
            opcode: "motorOnFor",
            text: "turn motor [MOTOR_ID] for [DURATION] seconds",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.A,
              },
              DURATION: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorOnForRotation",
            text: "turn motor [MOTOR_ID] for [ROTATION] rotations",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.A,
              },
              ROTATION: {
                type: ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorOn",
            text: "turn motor [MOTOR_ID] on",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.A,
              },
            },
          },
          {
            opcode: "motorOff",
            text: "turn motor [MOTOR_ID] off",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.A,
              },
            },
          },
          {
            opcode: "setMotorPower",
            text: "set motor [MOTOR_ID] speed to [POWER] %",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.ALL,
              },
              POWER: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "setMotorDirection",
            text: "set motor [MOTOR_ID] direction [MOTOR_DIRECTION]",
            blockType: BlockType.COMMAND,
            arguments: {
              MOTOR_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_ID",
                defaultValue: BoostMotorLabel.A,
              },
              MOTOR_DIRECTION: {
                type: ArgumentType.STRING,
                menu: "MOTOR_DIRECTION",
                defaultValue: BoostMotorDirection.FORWARD,
              },
            },
          },
          {
            opcode: "getMotorPosition",
            text: "motor [MOTOR_REPORTER_ID] position",
            blockType: BlockType.REPORTER,
            arguments: {
              MOTOR_REPORTER_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_REPORTER_ID",
                defaultValue: BoostMotorLabel.A,
              },
            },
          },
          {
            opcode: "whenColor",
            text: "when [COLOR] brick seen",
            blockType: BlockType.HAT,
            arguments: {
              COLOR: {
                type: ArgumentType.STRING,
                menu: "COLOR",
                defaultValue: BoostColor.ANY,
              },
            },
          },
          {
            opcode: "seeingColor",
            text: "seeing [COLOR] brick?",
            blockType: BlockType.BOOLEAN,
            arguments: {
              COLOR: {
                type: ArgumentType.STRING,
                menu: "COLOR",
                defaultValue: BoostColor.ANY,
              },
            },
          },
          {
            opcode: "whenDistance",
            text: "when distance [OPERATOR] [THRESHOLD]",
            blockType: BlockType.HAT,
            arguments: {
              OPERATOR: {
                type: ArgumentType.STRING,
                menu: "OPERATOR",
                defaultValue: BoostOperator.LESS,
              },
              THRESHOLD: {
                type: ArgumentType.NUMBER,
                defaultValue: 5,
              },
            },
          },
          {
            opcode: "getDistance",
            text: "distance",
            blockType: BlockType.REPORTER,
          },
          {
            opcode: "whenTilted",
            text: "when tilted [TILT_DIRECTION_ANY]",
            blockType: BlockType.HAT,
            arguments: {
              TILT_DIRECTION_ANY: {
                type: ArgumentType.STRING,
                menu: "TILT_DIRECTION_ANY",
                defaultValue: BoostTiltDirection.ANY,
              },
            },
          },
          {
            opcode: "getTiltAngle",
            text: "tilt angle [TILT_DIRECTION]",
            blockType: BlockType.REPORTER,
            arguments: {
              TILT_DIRECTION: {
                type: ArgumentType.STRING,
                menu: "TILT_DIRECTION",
                defaultValue: BoostTiltDirection.UP,
              },
            },
          },
          {
            opcode: "setLightHue",
            text: "set light color to [HUE]",
            blockType: BlockType.COMMAND,
            arguments: {
              HUE: {
                type: ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          {
            opcode: "setLightBrightness",
            text: "set light on port [PORT_ID] brightness to [BRIGHTNESS] %",
            blockType: BlockType.COMMAND,
            arguments: {
              PORT_ID: {
                type: ArgumentType.STRING,
                menu: "MOTOR_REPORTER_ID",
                defaultValue: BoostMotorLabel.C,
              },
              BRIGHTNESS: {
                type: ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
        ],
        menus: {
          MOTOR_ID: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "AB", "ABCD"],
          },
          MOTOR_REPORTER_ID: {
            acceptReporters: true,
            items: ["A", "B", "C", "D"],
          },
          MOTOR_DIRECTION: {
            acceptReporters: true,
            items: ["this way", "that way", "reverse"],
          },
          TILT_DIRECTION: {
            acceptReporters: true,
            items: ["up", "down", "left", "right"],
          },
          TILT_DIRECTION_ANY: {
            acceptReporters: true,
            items: ["up", "down", "left", "right", "any"],
          },
          COLOR: {
            acceptReporters: true,
            items: [
              "red",
              "blue",
              "green",
              "yellow",
              "white",
              "black",
              "any color",
            ],
          },
          OPERATOR: {
            acceptReporters: true,
            items: ["<", ">", "="],
          },
        },
      };
    }

    motorOnFor(args) {
      let durationMS = Cast.toNumber(args.DURATION) * 1000;
      durationMS = MathUtil.clamp(durationMS, 0, 15000);
      return new Promise((resolve) => {
        this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
          const motor = this._peripheral.motor(motorIndex);
          if (motor) motor.turnOnFor(durationMS);
        });
        setTimeout(resolve, durationMS);
      });
    }

    motorOnForRotation(args) {
      let degrees = Cast.toNumber(args.ROTATION) * 360;
      const sign = Math.sign(degrees);
      degrees = Math.abs(MathUtil.clamp(degrees, -360000, 360000));

      const motors = [];
      this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
        motors.push(motorIndex);
      });

      const promises = motors.map((portID) => {
        const motor = this._peripheral.motor(portID);
        if (motor) {
          if (motor.power === 0) return Promise.resolve();
          return new Promise((resolve) => {
            motor.turnOnForDegrees(degrees, sign);
            motor.pendingRotationPromise = resolve;
          });
        }
        return null;
      });

      return Promise.all(promises).then(() => {});
    }

    motorOn(args) {
      this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
        const motor = this._peripheral.motor(motorIndex);
        if (motor) motor.turnOnForever();
      });
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }

    motorOff(args) {
      this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
        const motor = this._peripheral.motor(motorIndex);
        if (motor) motor.turnOff();
      });
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }

    setMotorPower(args) {
      this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
        const motor = this._peripheral.motor(motorIndex);
        if (motor) {
          motor.power = MathUtil.clamp(Cast.toNumber(args.POWER), 0, 100);
          switch (motor.status) {
            case BoostMotorState.ON_FOREVER:
              motor.turnOnForever();
              break;
            case BoostMotorState.ON_FOR_TIME:
              motor.turnOnFor(
                motor.pendingDurationTimeoutStartTime +
                  motor.pendingDurationTimeoutDelay -
                  Date.now(),
              );
              break;
          }
        }
      });
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }

    setMotorDirection(args) {
      this._forEachMotor(args.MOTOR_ID, (motorIndex) => {
        const motor = this._peripheral.motor(motorIndex);
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
              motor.turnOnFor(
                motor.pendingDurationTimeoutStartTime +
                  motor.pendingDurationTimeoutDelay -
                  Date.now(),
              );
              break;
          }
        }
      });
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }

    getMotorPosition(args) {
      let portID = null;
      switch (args.MOTOR_REPORTER_ID) {
        case BoostMotorLabel.A:
          portID = BoostPort.A;
          break;
        case BoostMotorLabel.B:
          portID = BoostPort.B;
          break;
        case BoostMotorLabel.C:
          portID = BoostPort.C;
          break;
        case BoostMotorLabel.D:
          portID = BoostPort.D;
          break;
        default:
          return 0;
      }
      if (portID !== null && this._peripheral.motor(portID)) {
        let val = this._peripheral.motor(portID).position;
        if (portID === BoostPort.A) {
          val *= -1;
        }
        return MathUtil.wrapClamp(val, 0, 360);
      }
      return 0;
    }

    _forEachMotor(motorID, callback) {
      let motors;
      switch (motorID) {
        case BoostMotorLabel.A:
          motors = [BoostPort.A];
          break;
        case BoostMotorLabel.B:
          motors = [BoostPort.B];
          break;
        case BoostMotorLabel.C:
          motors = [BoostPort.C];
          break;
        case BoostMotorLabel.D:
          motors = [BoostPort.D];
          break;
        case BoostMotorLabel.AB:
          motors = [BoostPort.A, BoostPort.B];
          break;
        case BoostMotorLabel.ALL:
          motors = [BoostPort.A, BoostPort.B, BoostPort.C, BoostPort.D];
          break;
        default:
          motors = [];
          break;
      }
      for (const index of motors) {
        callback(index);
      }
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
      const TILT_THRESHOLD = 15;
      switch (direction) {
        case BoostTiltDirection.ANY:
          return (
            Math.abs(this._peripheral.tiltX) >= TILT_THRESHOLD ||
            Math.abs(this._peripheral.tiltY) >= TILT_THRESHOLD
          );
        default:
          return this._getTiltAngle(direction) >= TILT_THRESHOLD;
      }
    }

    _getTiltAngle(direction) {
      switch (direction) {
        case BoostTiltDirection.UP:
          return this._peripheral.tiltY > 90
            ? 256 - this._peripheral.tiltY
            : -this._peripheral.tiltY;
        case BoostTiltDirection.DOWN:
          return this._peripheral.tiltY > 90
            ? this._peripheral.tiltY - 256
            : this._peripheral.tiltY;
        case BoostTiltDirection.LEFT:
          return this._peripheral.tiltX > 90
            ? this._peripheral.tiltX - 256
            : this._peripheral.tiltX;
        case BoostTiltDirection.RIGHT:
          return this._peripheral.tiltX > 90
            ? 256 - this._peripheral.tiltX
            : -this._peripheral.tiltX;
        default:
          return 0;
      }
    }

    whenColor(args) {
      if (args.COLOR === BoostColor.ANY || args.COLOR === "any color") {
        return (
          this._peripheral.color !== BoostColor.NONE &&
          this._peripheral.color !== this._peripheral.previousColor
        );
      }
      return args.COLOR === this._peripheral.color;
    }

    seeingColor(args) {
      if (args.COLOR === BoostColor.ANY || args.COLOR === "any color") {
        return this._peripheral.color !== BoostColor.NONE;
      }
      return args.COLOR === this._peripheral.color;
    }

    whenDistance(args) {
      const threshold = Cast.toNumber(args.THRESHOLD);
      if (this._peripheral.distance === null) {
        return false;
      } else if (args.OPERATOR === BoostOperator.LESS) {
        return this._peripheral.distance < threshold;
      } else if (args.OPERATOR === BoostOperator.GREATER) {
        return this._peripheral.distance > threshold;
      } else if (args.OPERATOR === BoostOperator.EQUAL) {
        return this._peripheral.distance === threshold;
      }
      return false;
    }

    getDistance() {
      return this._peripheral.distance;
    }

    setLightHue(args) {
      let inputHue = Cast.toNumber(args.HUE);
      inputHue = MathUtil.wrapClamp(inputHue, 0, 100);
      const hue = (inputHue * 360) / 100;
      const rgbObject = color.hsvToRgb({ h: hue, s: 1, v: 1 });
      const rgbDecimal = color.rgbToDecimal(rgbObject);
      this._peripheral._led = inputHue;
      this._peripheral.setLED(rgbDecimal);
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }

    _getStatus() {
      console.log("[BOOST Extension] _getStatus() called");
      if (!this._peripheral) {
        console.log("[BOOST Extension] No peripheral");
        return { status: 1, msg: "No peripheral" };
      }

      const connected = this._peripheral.isConnected();
      console.log("[BOOST Extension] Connected:", connected);

      return {
        status: connected ? 2 : 1,
        msg: connected ? "Connected" : "Disconnected",
      };
    }

    setLightBrightness(args) {
      const portName = Cast.toString(args.PORT_ID);
      const portID = BoostPort[portName];
      if (
        typeof portID === "undefined" ||
        this._peripheral._ports[portID] !== BoostIO.LIGHT
      ) {
        return;
      }
      const brightness = MathUtil.clamp(Cast.toNumber(args.BRIGHTNESS), 0, 100);
      const cmd = this._peripheral.generateOutputCommand(
        portID,
        BoostOutputExecution.EXECUTE_IMMEDIATELY,
        BoostOutputSubCommand.WRITE_DIRECT_MODE_DATA,
        [0, brightness],
      );
      this._peripheral.send(BoostBLE.characteristic, cmd);
      return new Promise((resolve) => {
        setTimeout(resolve, BoostBLE.sendInterval);
      });
    }
  }

  Scratch.extensions.register(new BoostExtension());
})(Scratch);
