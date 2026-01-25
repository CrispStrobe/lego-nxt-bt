(function (Scratch) {
  "use strict";

  // ============================================================================
  // CONSTANTS & CONFIGURATION
  // ============================================================================

  const SERVICE_UUID = "0000fd02-0000-1000-8000-00805f9b34fb";
  const RX_UUID = "0000fd02-0001-1000-8000-00805f9b34fb"; // Write to hub
  const TX_UUID = "0000fd02-0002-1000-8000-00805f9b34fb"; // Read from hub

  const MSG = {
    InfoRequest: 0x00,
    InfoResponse: 0x01,
    ClearSlotRequest: 0x46,
    ClearSlotResponse: 0x47,
    StartFileUploadRequest: 0x0c,
    StartFileUploadResponse: 0x0d,
    TransferChunkRequest: 0x10,
    TransferChunkResponse: 0x11,
    ProgramFlowRequest: 0x1e,
    ProgramFlowResponse: 0x1f,
    ProgramFlowNotification: 0x20,
    ConsoleNotification: 0x21,
    DeviceNotificationRequest: 0x28,
    DeviceNotificationResponse: 0x29,
    DeviceNotification: 0x3c,
    GetHubNameRequest: 0x18,
    GetHubNameResponse: 0x19,
    SetHubNameRequest: 0x16,
    SetHubNameResponse: 0x17,
  };

  const COLORS = {
    0: "black",
    1: "pink",
    3: "blue",
    4: "azure",
    5: "green",
    7: "yellow",
    9: "red",
    10: "white",
  };

  // ============================================================================
  // UTILITY CLASSES
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
  }

  // ============================================================================
  // COBS ENCODING/DECODING
  // ============================================================================

  const COBS = {
    DELIMITER: 0x02,
    NO_DELIMITER: 0xff,
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
        if (code === 0xff) {
          return { value: null, block: this.MAX_BLOCK_SIZE + 1 };
        }
        let value = Math.floor(
          (code - this.COBS_CODE_OFFSET) / this.MAX_BLOCK_SIZE,
        );
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
    },
  };

  // ============================================================================
  // CRC32 (with 4-byte alignment)
  // ============================================================================

  const CRC32 = {
    table: null,

    init() {
      this.table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
          crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
        }
        this.table[i] = crc;
      }
    },

    calculate(data, seed = 0, align = 4) {
      if (!this.table) this.init();

      // Pad to alignment
      const remainder = data.length % align;
      let paddedData = data;
      if (remainder) {
        paddedData = new Uint8Array(data.length + align - remainder);
        paddedData.set(data);
      }

      let crc = seed ^ 0xffffffff;
      for (let i = 0; i < paddedData.length; i++) {
        crc = this.table[(crc ^ paddedData[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    },
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

    startNotifications(
      serviceId,
      characteristicId,
      onCharacteristicChanged = null,
    ) {
      const params = {
        serviceId,
        characteristicId,
      };
      this._characteristicDidChangeCallback = onCharacteristicChanged;
      return this.sendRemoteRequest("startNotifications", params).catch((e) => {
        this.handleDisconnectError(e);
      });
    }

    read(
      serviceId,
      characteristicId,
      optStartNotifications = false,
      onCharacteristicChanged = null,
    ) {
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

    write(
      serviceId,
      characteristicId,
      message,
      encoding = null,
      withResponse = null,
    ) {
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
  // SPIKE HUB PERIPHERAL CLASS
  // ============================================================================

  class SpikeHub {
    constructor(runtime, extensionId) {
      this._runtime = runtime;
      this._extensionId = extensionId;
      this._ble = null;

      this.maxPacketSize = 20;
      this.maxMessageSize = 100;
      this.maxChunkSize = 84;

      this.pendingResponses = new Map();
      this.receiveBuffer = [];

      this.sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: {
          yaw: 0,
          pitch: 0,
          roll: 0,
          accelX: 0,
          accelY: 0,
          accelZ: 0,
        },
        matrix: new Array(25).fill(0),
      };

      this.hubName = "";
      this.consoleOutput = [];
      this.connectedModel = "";

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);
    }

    scan() {
      if (this._ble) {
        this._ble.disconnect();
      }

      const bleConfig = {
        filters: [
          {
            services: [SERVICE_UUID],
            manufacturerData: {
              0x0397: {
                dataPrefix: [0x00],
                mask: [0xff],
              },
            },
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
      this.pendingResponses.clear();
      this.receiveBuffer = [];
      this.sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: {
          yaw: 0,
          pitch: 0,
          roll: 0,
          accelX: 0,
          accelY: 0,
          accelZ: 0,
        },
        matrix: new Array(25).fill(0),
      };
      this.hubName = "";
      this.consoleOutput = [];
      this.connectedModel = "";
    }

    isConnected() {
      return this._ble ? this._ble.isConnected() : false;
    }

    _onConnect() {
      console.log("[SPIKE] Connected!");

      this._ble.startNotifications(SERVICE_UUID, TX_UUID, this._onMessage);

      // Handshake
      setTimeout(async () => {
        try {
          const info = await this.sendRequest(
            MSG.InfoRequest,
            [],
            MSG.InfoResponse,
          );
          this.maxPacketSize = Message.parseUInt16LE(info, 9);
          this.maxMessageSize = Message.parseUInt16LE(info, 11);
          this.maxChunkSize = Message.parseUInt16LE(info, 13);

          console.log(`Max packet: ${this.maxPacketSize}, Max chunk: ${this.maxChunkSize}`);

          // Get hub name
          const nameResp = await this.sendRequest(
            MSG.GetHubNameRequest,
            [],
            MSG.GetHubNameResponse,
          );
          const decoder = new TextDecoder();
          this.hubName = decoder
            .decode(nameResp.slice(1))
            .replace(/\0/g, "");

          // Detect model
          this._detectHubModel();

          console.log(`Connected to: ${this.connectedModel || "SPIKE Hub"}`);
        } catch (error) {
          console.error("Handshake failed:", error);
        }
      }, 500);
    }

    _detectHubModel() {
      // Try to detect based on hub name or other characteristics
      if (
        this.hubName.toLowerCase().includes("prime") ||
        this.hubName.toLowerCase().includes("spike-l")
      ) {
        this.connectedModel = "SPIKE Prime";
      } else if (
        this.hubName.toLowerCase().includes("essential") ||
        this.hubName.toLowerCase().includes("spike-e")
      ) {
        this.connectedModel = "SPIKE Essential";
      } else if (this.hubName.toLowerCase().includes("inventor")) {
        this.connectedModel = "Robot Inventor";
      } else {
        this.connectedModel = "SPIKE Hub";
      }
    }

    _onMessage(base64) {
      const data = Base64Util.base64ToUint8Array(base64);

      // Buffer until we see delimiter
      for (let i = 0; i < data.length; i++) {
        this.receiveBuffer.push(data[i]);

        if (data[i] === COBS.DELIMITER) {
          // Complete message
          const frame = new Uint8Array(this.receiveBuffer);
          this.receiveBuffer = [];

          try {
            const decoded = COBS.unpack(frame);
            this._handleMessage(decoded);
          } catch (error) {
            console.error("Failed to decode message:", error);
          }
        }
      }
    }

    _handleMessage(data) {
      const messageType = data[0];

      // Check for pending request
      if (this.pendingResponses.has(messageType)) {
        const resolve = this.pendingResponses.get(messageType);
        this.pendingResponses.delete(messageType);
        resolve(data);
        return;
      }

      // Handle notifications
      switch (messageType) {
        case MSG.ConsoleNotification:
          const decoder = new TextDecoder();
          const text = decoder.decode(data.slice(1)).replace(/\0/g, "");
          this.consoleOutput.push(text);
          console.log("[SPIKE]", text);
          break;

        case MSG.DeviceNotification:
          this._parseDeviceNotification(data);
          break;

        case MSG.ProgramFlowNotification:
          const action = data[1];
          console.log(`Program ${action === 1 ? "stopped" : "started"}`);
          break;
      }
    }

    _parseDeviceNotification(data) {
      const size = Message.parseUInt16LE(data, 1);
      let offset = 3;

      while (offset < data.length) {
        const deviceType = data[offset];

        switch (deviceType) {
          case 0x00: // Battery
            this.sensorData.battery = data[offset + 1];
            offset += 2;
            break;

          case 0x01: // IMU
            {
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this.sensorData.imu = {
                faceUp: data[offset + 1],
                yawFace: data[offset + 2],
                yaw: view.getInt16(3, true),
                pitch: view.getInt16(5, true),
                roll: view.getInt16(7, true),
                accelX: view.getInt16(9, true),
                accelY: view.getInt16(11, true),
                accelZ: view.getInt16(13, true),
              };
              offset += 15;
            }
            break;

          case 0x02: // 5x5 Matrix
            for (let i = 0; i < 25; i++) {
              this.sensorData.matrix[i] = data[offset + 1 + i];
            }
            offset += 26;
            break;

          case 0x0a: // Motor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this.sensorData.motors[port] = {
                type: data[offset + 2],
                absPosition: view.getInt16(3, true),
                power: view.getInt16(5, true),
                speed: view.getInt8(7),
                position: view.getInt32(8, true),
              };
              offset += 12;
            }
            break;

          case 0x0b: // Force Sensor
            {
              const port = data[offset + 1];
              this.sensorData.forceSensors[port] = {
                value: data[offset + 2],
                pressed: data[offset + 3] === 0x01,
              };
              offset += 4;
            }
            break;

          case 0x0c: // Color Sensor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this.sensorData.colorSensors[port] = {
                color: view.getInt8(2),
                red: view.getUint16(3, true),
                green: view.getUint16(5, true),
                blue: view.getUint16(7, true),
              };
              offset += 9;
            }
            break;

          case 0x0d: // Distance Sensor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this.sensorData.distanceSensors[port] = {
                distance: view.getInt16(2, true),
              };
              offset += 4;
            }
            break;

          default:
            console.warn(`Unknown device type: 0x${deviceType.toString(16)}`);
            return; // Stop parsing
        }
      }
    }

    async sendMessage(messageType, payload) {
      const message = Message.concat(Message.writeUInt8(messageType), payload);
      const frame = COBS.pack(message);
      const base64 = Base64Util.uint8ArrayToBase64(frame);

      return this._ble.write(SERVICE_UUID, RX_UUID, base64, "base64", false);
    }

    async sendRequest(
      messageType,
      payload,
      expectedResponse,
      timeoutMs = 5000,
    ) {
      return new Promise(async (resolve, reject) => {
        const timer = setTimeout(() => {
          this.pendingResponses.delete(expectedResponse);
          reject(
            new Error(
              `Timeout waiting for response 0x${expectedResponse.toString(16)}`,
            ),
          );
        }, timeoutMs);

        this.pendingResponses.set(expectedResponse, (data) => {
          clearTimeout(timer);
          resolve(data);
        });

        try {
          await this.sendMessage(messageType, payload);
        } catch (error) {
          clearTimeout(timer);
          this.pendingResponses.delete(expectedResponse);
          reject(error);
        }
      });
    }

    async uploadProgram(filename, pythonCode, slot = 0) {
      if (!this.isConnected()) {
        throw new Error("Not connected to hub");
      }

      // Ensure .py extension
      if (!filename.endsWith(".py")) {
        filename += ".py";
      }

      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(pythonCode);
      const crc = CRC32.calculate(codeBytes);

      console.log(
        `Uploading ${filename} (${codeBytes.length} bytes) to slot ${slot}`,
      );

      // Clear slot first
      try {
        const clearPayload = Message.writeUInt8(slot);
        await this.sendRequest(
          MSG.ClearSlotRequest,
          clearPayload,
          MSG.ClearSlotResponse,
        );
      } catch (error) {
        console.warn("Clear slot failed (may be empty):", error.message);
      }

      // Start upload
      const nameBytes = Message.writeString(filename, 32);
      const slotByte = Message.writeUInt8(slot);
      const crcBytes = Message.writeUInt32LE(crc);
      const startPayload = Message.concat(nameBytes, slotByte, crcBytes);

      await this.sendRequest(
        MSG.StartFileUploadRequest,
        startPayload,
        MSG.StartFileUploadResponse,
      );

      // Send chunks
      let runningCRC = 0;
      for (let i = 0; i < codeBytes.length; i += this.maxChunkSize) {
        const chunk = codeBytes.slice(i, i + this.maxChunkSize);
        runningCRC = CRC32.calculate(chunk, runningCRC);

        const chunkPayload = Message.concat(
          Message.writeUInt32LE(runningCRC),
          Message.writeUInt16LE(chunk.length),
          chunk,
        );

        await this.sendRequest(
          MSG.TransferChunkRequest,
          chunkPayload,
          MSG.TransferChunkResponse,
        );

        console.log(
          `Uploaded ${Math.min(i + this.maxChunkSize, codeBytes.length)}/${codeBytes.length} bytes`,
        );
      }

      console.log("Upload complete!");
    }

    async runProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x00), // Action: Start
        Message.writeUInt8(slot),
      );
      await this.sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async stopProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x01), // Action: Stop
        Message.writeUInt8(slot),
      );
      await this.sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async deleteProgram(slot) {
      const payload = Message.writeUInt8(slot);
      await this.sendRequest(
        MSG.ClearSlotRequest,
        payload,
        MSG.ClearSlotResponse,
      );
    }

    async enableDeviceNotifications(intervalMs = 100) {
      const payload = Message.writeUInt16LE(intervalMs);
      await this.sendRequest(
        MSG.DeviceNotificationRequest,
        payload,
        MSG.DeviceNotificationResponse,
      );
    }

    async disableDeviceNotifications() {
      const payload = Message.writeUInt16LE(0);
      await this.sendRequest(
        MSG.DeviceNotificationRequest,
        payload,
        MSG.DeviceNotificationResponse,
      );
    }

    async setHubName(name) {
      const payload = Message.writeString(name, 30);
      await this.sendRequest(
        MSG.SetHubNameRequest,
        payload,
        MSG.SetHubNameResponse,
      );
      this.hubName = name;
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================

  class SpikeExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this._peripheral = new SpikeHub(runtime, "spike");
      this._pythonCode = "";

      // Register as peripheral extension
      this.runtime.registerPeripheralExtension("spike", this);

      // Reset on stop
      this.runtime.on("PROJECT_STOP_ALL", () => {
        // Don't disconnect, just stop any running programs
      });
    }

    getInfo() {
      return {
        id: "spike",
        name: "SPIKE Prime",
        color1: "#FF661A",
        color2: "#E64D00",
        color3: "#CC4400",
        showStatusButton: true,
        blocks: [
          // ============ CONNECTION ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "🔌 Connection",
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "hub connected?",
          },
          {
            opcode: "hubModel",
            blockType: Scratch.BlockType.REPORTER,
            text: "hub model",
          },

          "---",

          // ============ MOTORS ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "🔧 Motors",
          },
          {
            opcode: "motorRun",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] run at [SPEED] %",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "motorRunFor",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] run [SPEED] % for [DEG] degrees",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              DEG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] stop",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },
          {
            opcode: "motorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: "motor [PORT] position",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },
          {
            opcode: "motorSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: "motor [PORT] speed",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },

          "---",

          // ============ COLOR SENSOR ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "🎨 Color Sensor",
          },
          {
            opcode: "colorSensorColor",
            blockType: Scratch.BlockType.REPORTER,
            text: "color sensor [PORT] color",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },
          {
            opcode: "colorSensorRGB",
            blockType: Scratch.BlockType.REPORTER,
            text: "color sensor [PORT] [RGB]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
              RGB: { type: Scratch.ArgumentType.STRING, menu: "rgb" },
            },
          },

          "---",

          // ============ DISTANCE SENSOR ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "📏 Distance Sensor",
          },
          {
            opcode: "distanceSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: "distance sensor [PORT] mm",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },

          "---",

          // ============ FORCE SENSOR ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "💪 Force Sensor",
          },
          {
            opcode: "forceSensorValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "force sensor [PORT] value",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },
          {
            opcode: "forceSensorPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "force sensor [PORT] pressed?",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "ports" },
            },
          },

          "---",

          // ============ HUB IMU ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "🌀 Hub Motion",
          },
          {
            opcode: "imuValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "hub [IMU]",
            arguments: {
              IMU: { type: Scratch.ArgumentType.STRING, menu: "imu" },
            },
          },

          "---",

          // ============ SENSORS ENABLE ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "⚙️ Sensor Settings",
          },
          {
            opcode: "enableSensors",
            blockType: Scratch.BlockType.COMMAND,
            text: "enable sensors every [MS] ms",
            arguments: {
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "disableSensors",
            blockType: Scratch.BlockType.COMMAND,
            text: "disable sensors",
          },
          {
            opcode: "batteryLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: "battery %",
          },

          "---",

          // ============ PROGRAM UPLOAD ============
          {
            blockType: Scratch.BlockType.LABEL,
            text: "📦 Program Upload",
          },
          {
            opcode: "transpile",
            blockType: Scratch.BlockType.COMMAND,
            text: "transpile project",
          },
          {
            opcode: "uploadToSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload to slot [SLOT]",
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, menu: "slots" },
            },
          },
          {
            opcode: "runSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: "run slot [SLOT]",
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, menu: "slots" },
            },
          },
          {
            opcode: "stopSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop slot [SLOT]",
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, menu: "slots" },
            },
          },
        ],
        menus: {
          ports: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "E", "F"],
          },
          rgb: {
            items: ["red", "green", "blue"],
          },
          imu: {
            items: ["yaw", "pitch", "roll", "accel X", "accel Y", "accel Z"],
          },
          slots: {
            acceptReporters: true,
            items: Array.from({ length: 20 }, (_, i) => String(i)),
          },
        },
      };
    }

    // Peripheral protocol methods
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

    hubModel() {
      return this._peripheral.connectedModel || "Unknown";
    }

    // Motor blocks
    motorRun(args) {
      const code = `
import motor
motor.run(port.${args.PORT}, ${this._clamp(args.SPEED, -100, 100)})
      `;
      return this._sendMicroPython(code);
    }

    async motorRunFor(args) {
      const code = `
import motor, runloop
async def run():
    await motor.run_for_degrees(port.${args.PORT}, ${args.DEG}, ${this._clamp(args.SPEED, -100, 100)})
runloop.run(run())
      `;
      return this._sendMicroPython(code);
    }

    motorStop(args) {
      const code = `
import motor
motor.stop(port.${args.PORT})
      `;
      return this._sendMicroPython(code);
    }

    motorPosition(args) {
      const portId = this._getPortId(args.PORT);
      const motor = this._peripheral.sensorData.motors[portId];
      return motor ? motor.position : 0;
    }

    motorSpeed(args) {
      const portId = this._getPortId(args.PORT);
      const motor = this._peripheral.sensorData.motors[portId];
      return motor ? motor.speed : 0;
    }

    // Color sensor blocks
    colorSensorColor(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._peripheral.sensorData.colorSensors[portId];
      if (!sensor) return "none";
      return COLORS[sensor.color] || "unknown";
    }

    colorSensorRGB(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._peripheral.sensorData.colorSensors[portId];
      if (!sensor) return 0;
      return sensor[args.RGB.toLowerCase()] || 0;
    }

    // Distance sensor
    distanceSensor(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._peripheral.sensorData.distanceSensors[portId];
      return sensor ? sensor.distance : -1;
    }

    // Force sensor
    forceSensorValue(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._peripheral.sensorData.forceSensors[portId];
      return sensor ? sensor.value : 0;
    }

    forceSensorPressed(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._peripheral.sensorData.forceSensors[portId];
      return sensor ? sensor.pressed : false;
    }

    // IMU
    imuValue(args) {
      const imu = this._peripheral.sensorData.imu;
      switch (args.IMU) {
        case "yaw":
          return imu.yaw;
        case "pitch":
          return imu.pitch;
        case "roll":
          return imu.roll;
        case "accel X":
          return imu.accelX;
        case "accel Y":
          return imu.accelY;
        case "accel Z":
          return imu.accelZ;
        default:
          return 0;
      }
    }

    // Sensor management
    async enableSensors(args) {
      await this._peripheral.enableDeviceNotifications(
        Math.max(50, parseInt(args.MS)),
      );
    }

    async disableSensors() {
      await this._peripheral.disableDeviceNotifications();
    }

    batteryLevel() {
      return this._peripheral.sensorData.battery;
    }

    // Program upload
    transpile() {
      this._pythonCode = this._generateBasicProgram();
      console.log("Transpiled:", this._pythonCode);
    }

    async uploadToSlot(args) {
      if (!this._pythonCode) {
        this._pythonCode = this._generateBasicProgram();
      }
      const slot = this._clamp(parseInt(args.SLOT), 0, 19);
      await this._peripheral.uploadProgram("program.py", this._pythonCode, slot);
    }

    async runSlot(args) {
      const slot = this._clamp(parseInt(args.SLOT), 0, 19);
      await this._peripheral.runProgram(slot);
    }

    async stopSlot(args) {
      const slot = this._clamp(parseInt(args.SLOT), 0, 19);
      await this._peripheral.stopProgram(slot);
    }

    // Utilities
    _getPortId(port) {
      const portMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
      return portMap[port] || 0;
    }

    _clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    async _sendMicroPython(code) {
      if (!this._peripheral.isConnected()) return;
      await this._peripheral.uploadProgram("temp.py", code, 19);
      await this._peripheral.runProgram(19);
    }

    _generateBasicProgram() {
      return `# Generated from Scratch
import runloop
from hub import light_matrix

async def main():
    await light_matrix.write("Hi!")

runloop.run(main())
`;
    }
  }

  Scratch.extensions.register(new SpikeExtension());
})(Scratch);