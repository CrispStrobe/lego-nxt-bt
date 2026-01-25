(function (Scratch) {
  "use strict";

  // ============================================================================
  // UTILITIES (from BOOST extension)
  // ============================================================================

  const MathUtil = {
    clamp: (val, min, max) => Math.max(min, Math.min(val, max)),
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
      
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= this.XOR;
      }
      
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

      const unframed = new Uint8Array(frame.length - start - 1);
      for (let i = 0; i < unframed.length; i++) {
        unframed[i] = frame[start + i] ^ this.XOR;
      }

      return this.decode(unframed);
    }
  };

  // ============================================================================
  // CRC32
  // ============================================================================

  const CRC32 = {
    table: null,

    init() {
      this.table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
          crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
        }
        this.table[i] = crc;
      }
    },

    calculate(data, seed = 0, align = 4) {
      if (!this.table) this.init();

      const remainder = data.length % align;
      let paddedData = data;
      if (remainder) {
        paddedData = new Uint8Array(data.length + align - remainder);
        paddedData.set(data);
      }

      let crc = seed ^ 0xFFFFFFFF;
      for (let i = 0; i < paddedData.length; i++) {
        crc = this.table[(crc ^ paddedData[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }
  };

  // ============================================================================
  // MESSAGE SERIALIZATION
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

  const MSG = {
    InfoRequest: 0x00,
    InfoResponse: 0x01,
    ClearSlotRequest: 0x46,
    ClearSlotResponse: 0x47,
    StartFileUploadRequest: 0x0C,
    StartFileUploadResponse: 0x0D,
    TransferChunkRequest: 0x10,
    TransferChunkResponse: 0x11,
    ProgramFlowRequest: 0x1E,
    ProgramFlowResponse: 0x1F,
    ProgramFlowNotification: 0x20,
    ConsoleNotification: 0x21,
    DeviceNotificationRequest: 0x28,
    DeviceNotificationResponse: 0x29,
    DeviceNotification: 0x3C,
    GetHubNameRequest: 0x18,
    GetHubNameResponse: 0x19,
    SetHubNameRequest: 0x16,
    SetHubNameResponse: 0x17,
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

  // ============================================================================
  // BLE CLASS (adapted from scratch-vm)
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

      this._ble = null;
      this._maxPacketSize = 20;
      this._maxMessageSize = 100;
      this._maxChunkSize = 84;

      this._pendingResponses = new Map();
      this._receiveBuffer = [];

      this._sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: { yaw: 0, pitch: 0, roll: 0, accelX: 0, accelY: 0, accelZ: 0 },
        matrix: new Array(25).fill(0),
      };

      this._hubName = "";
      this._consoleOutput = [];

      this.reset = this.reset.bind(this);
      this._onConnect = this._onConnect.bind(this);
      this._onMessage = this._onMessage.bind(this);

      this._runtime.registerPeripheralExtension(extensionId, this);
    }

    get sensorData() {
      return this._sensorData;
    }

    get hubName() {
      return this._hubName;
    }

    scan() {
      if (this._ble) {
        this._ble.disconnect();
      }

      // SPIKE App 3 Protocol UUIDs
      const bleConfig = {
        filters: [
          {
            services: ["0000fd02-0000-1000-8000-00805f9b34fb"],
            manufacturerData: {
              0x0397: {}, // LEGO manufacturer ID
            },
          },
        ],
        optionalServices: ["0000fd02-0000-1000-8000-00805f9b34fb"],
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
      this._sensorData = {
        battery: 0,
        motors: {},
        colorSensors: {},
        distanceSensors: {},
        forceSensors: {},
        imu: { yaw: 0, pitch: 0, roll: 0, accelX: 0, accelY: 0, accelZ: 0 },
        matrix: new Array(25).fill(0),
      };
      this._hubName = "";
      this._consoleOutput = [];
      this._receiveBuffer = [];
      this._pendingResponses.clear();
    }

    isConnected() {
      return this._ble ? this._ble.isConnected() : false;
    }

    _onConnect() {
      // Start notifications
      this._ble.startNotifications(
        "0000fd02-0000-1000-8000-00805f9b34fb",
        "0000fd02-0002-1000-8000-00805f9b34fb", // TX characteristic
        this._onMessage,
      );

      // Send InfoRequest
      setTimeout(() => {
        this._sendInfoRequest();
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
            console.error("Failed to decode message:", error);
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
        case MSG.InfoResponse:
          this._maxPacketSize = Message.parseUInt16LE(data, 9);
          this._maxMessageSize = Message.parseUInt16LE(data, 11);
          this._maxChunkSize = Message.parseUInt16LE(data, 13);
          console.log(`Max packet: ${this._maxPacketSize}, Max chunk: ${this._maxChunkSize}`);
          
          // Get hub name
          this._sendRequest(MSG.GetHubNameRequest, [], MSG.GetHubNameResponse).then((nameResp) => {
            const decoder = new TextDecoder();
            this._hubName = decoder.decode(nameResp.slice(1)).replace(/\0/g, '');
          });
          break;

        case MSG.ConsoleNotification:
          const decoder = new TextDecoder();
          const text = decoder.decode(data.slice(1)).replace(/\0/g, '');
          this._consoleOutput.push(text);
          console.log("[SPIKE]", text);
          break;

        case MSG.DeviceNotification:
          this._parseDeviceNotification(data);
          break;

        case MSG.ProgramFlowNotification:
          console.log(`Program ${data[1] === 1 ? 'stopped' : 'started'}`);
          break;
      }
    }

    _parseDeviceNotification(data) {
      let offset = 3;

      while (offset < data.length) {
        const deviceType = data[offset];

        switch (deviceType) {
          case 0x00: // Battery
            this._sensorData.battery = data[offset + 1];
            offset += 2;
            break;

          case 0x01: // IMU
            {
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this._sensorData.imu = {
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
              this._sensorData.matrix[i] = data[offset + 1 + i];
            }
            offset += 26;
            break;

          case 0x0A: // Motor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this._sensorData.motors[port] = {
                type: data[offset + 2],
                absPosition: view.getInt16(3, true),
                power: view.getInt16(5, true),
                speed: view.getInt8(7),
                position: view.getInt32(8, true),
              };
              offset += 12;
            }
            break;

          case 0x0B: // Force Sensor
            {
              const port = data[offset + 1];
              this._sensorData.forceSensors[port] = {
                value: data[offset + 2],
                pressed: data[offset + 3] === 0x01,
              };
              offset += 4;
            }
            break;

          case 0x0C: // Color Sensor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this._sensorData.colorSensors[port] = {
                color: view.getInt8(2),
                red: view.getUint16(3, true),
                green: view.getUint16(5, true),
                blue: view.getUint16(7, true),
              };
              offset += 9;
            }
            break;

          case 0x0D: // Distance Sensor
            {
              const port = data[offset + 1];
              const view = new DataView(data.buffer, data.byteOffset + offset);
              this._sensorData.distanceSensors[port] = {
                distance: view.getInt16(2, true),
              };
              offset += 4;
            }
            break;

          default:
            console.warn(`Unknown device type: 0x${deviceType.toString(16)}`);
            return;
        }
      }
    }

    _sendMessage(messageType, payload) {
      if (!this.isConnected()) {
        return Promise.reject(new Error("Not connected"));
      }

      const message = Message.concat(Message.writeUInt8(messageType), payload);
      const frame = COBS.pack(message);

      // Send in packets via Scratch Link
      const promises = [];
      for (let i = 0; i < frame.length; i += this._maxPacketSize) {
        const packet = frame.slice(i, i + this._maxPacketSize);
        const base64 = Base64Util.uint8ArrayToBase64(packet);
        
        const promise = this._ble.write(
          "0000fd02-0000-1000-8000-00805f9b34fb",
          "0000fd02-0001-1000-8000-00805f9b34fb", // RX characteristic
          base64,
          "base64",
          false, // withoutResponse
        );
        promises.push(promise);
      }

      return Promise.all(promises);
    }

    _sendRequest(messageType, payload, expectedResponse, timeoutMs = 5000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this._pendingResponses.delete(expectedResponse);
          reject(new Error(`Timeout waiting for 0x${expectedResponse.toString(16)}`));
        }, timeoutMs);

        this._pendingResponses.set(expectedResponse, (data) => {
          clearTimeout(timer);
          resolve(data);
        });

        this._sendMessage(messageType, payload).catch((error) => {
          clearTimeout(timer);
          this._pendingResponses.delete(expectedResponse);
          reject(error);
        });
      });
    }

    _sendInfoRequest() {
      return this._sendRequest(MSG.InfoRequest, [], MSG.InfoResponse);
    }

    async uploadProgram(filename, pythonCode, slot = 0) {
      if (!filename.endsWith('.py')) {
        filename += '.py';
      }

      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(pythonCode);
      const crc = CRC32.calculate(codeBytes);

      console.log(`Uploading ${filename} (${codeBytes.length} bytes) to slot ${slot}`);

      // Clear slot
      try {
        const clearPayload = Message.writeUInt8(slot);
        await this._sendRequest(MSG.ClearSlotRequest, clearPayload, MSG.ClearSlotResponse);
      } catch (error) {
        console.warn("Clear slot failed:", error.message);
      }

      // Start upload
      const nameBytes = Message.writeString(filename, 32);
      const slotByte = Message.writeUInt8(slot);
      const crcBytes = Message.writeUInt32LE(crc);
      const startPayload = Message.concat(nameBytes, slotByte, crcBytes);

      await this._sendRequest(MSG.StartFileUploadRequest, startPayload, MSG.StartFileUploadResponse);

      // Send chunks
      let runningCRC = 0;
      for (let i = 0; i < codeBytes.length; i += this._maxChunkSize) {
        const chunk = codeBytes.slice(i, i + this._maxChunkSize);
        runningCRC = CRC32.calculate(chunk, runningCRC);

        const chunkPayload = Message.concat(
          Message.writeUInt32LE(runningCRC),
          Message.writeUInt16LE(chunk.length),
          chunk
        );

        await this._sendRequest(MSG.TransferChunkRequest, chunkPayload, MSG.TransferChunkResponse);
        
        console.log(`Uploaded ${Math.min(i + this._maxChunkSize, codeBytes.length)}/${codeBytes.length} bytes`);
      }

      console.log("Upload complete!");
    }

    async runProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x00),
        Message.writeUInt8(slot)
      );
      await this._sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async stopProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x01),
        Message.writeUInt8(slot)
      );
      await this._sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async deleteProgram(slot) {
      const payload = Message.writeUInt8(slot);
      await this._sendRequest(MSG.ClearSlotRequest, payload, MSG.ClearSlotResponse);
    }

    async enableDeviceNotifications(intervalMs = 100) {
      const payload = Message.writeUInt16LE(intervalMs);
      await this._sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }

    async disableDeviceNotifications() {
      const payload = Message.writeUInt16LE(0);
      await this._sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }
  }

  // ============================================================================
  // EXTENSION
  // ============================================================================

  class SpikePrimeExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this._peripheral = new SpikePrime(runtime, "spikeprime");
      this._pythonCode = "";
    }

    getInfo() {
      return {
        id: "spikeprime",
        name: "SPIKE Prime",
        showStatusButton: true, // CRITICAL for Scratch Link!
        blocks: [
          {
            opcode: "transpileProject",
            blockType: Scratch.BlockType.COMMAND,
            text: "transpile project to Python",
          },
          {
            opcode: "uploadToSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload to slot [SLOT]",
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "runSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: "run slot [SLOT]",
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "enableSensors",
            blockType: Scratch.BlockType.COMMAND,
            text: "enable sensors [MS] ms",
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "getBattery",
            blockType: Scratch.BlockType.REPORTER,
            text: "battery %",
          },
        ],
      };
    }

    transpileProject() {
      // Basic transpilation
      this._pythonCode = `
import runloop
from hub import light_matrix

async def main():
    await light_matrix.write("Hi!")

runloop.run(main())
`;
      console.log("Transpiled!");
    }

    async uploadToSlot(args) {
      const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
      await this._peripheral.uploadProgram("program.py", this._pythonCode, slot);
    }

    async runSlot(args) {
      const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
      await this._peripheral.runProgram(slot);
    }

    async enableSensors(args) {
      await this._peripheral.enableDeviceNotifications(parseInt(args.MS));
    }

    getBattery() {
      return this._peripheral.sensorData.battery;
    }
  }

  Scratch.extensions.register(new SpikePrimeExtension());
})(Scratch);