(function (Scratch) {
  "use strict";

  // ============================================================================
  // INTERNATIONALIZATION
  // ============================================================================

  const translations = {
    en: {
      extensionName: "SPIKE Prime",
      
      // Connection
      connection: "Connection",
      connectHub: "connect to SPIKE Prime",
      disconnectHub: "disconnect SPIKE Prime",
      isConnected: "hub connected?",
      
      // Program Management
      programs: "Program Management",
      transpileProject: "transpile project to SPIKE Prime Python",
      showCode: "show generated code",
      downloadCode: "download as .py file",
      uploadToSlot: "upload program to slot [SLOT]",
      uploadAndRun: "upload and run in slot [SLOT]",
      runSlot: "run program in slot [SLOT]",
      stopSlot: "stop program in slot [SLOT]",
      deleteSlot: "delete program in slot [SLOT]",
      
      // Sensors
      sensors: "Sensors & Motors",
      enableSensors: "enable sensor updates every [MS] ms",
      disableSensors: "disable sensor updates",
      getMotorPosition: "motor [PORT] position",
      getMotorSpeed: "motor [PORT] speed",
      getColorSensor: "color sensor [PORT] [MODE]",
      getDistanceSensor: "distance sensor [PORT] mm",
      getForceSensor: "force sensor [PORT] [MODE]",
      getIMU: "hub [IMU] value",
      getBattery: "battery level %",
      
      // Hub
      hub: "Hub Control",
      hubName: "hub name",
      setHubName: "set hub name to [NAME]",
      
      // Messages
      noCodeGenerated: "No code generated yet!",
      generateFirst: "Generate code first!",
      uploaded: "Uploaded to slot",
      uploadFailed: "Upload failed",
      notConnected: "Not connected to hub",
    },
    
    de: {
      extensionName: "SPIKE Prime",
      
      connection: "Verbindung",
      connectHub: "mit SPIKE Prime verbinden",
      disconnectHub: "SPIKE Prime trennen",
      isConnected: "Hub verbunden?",
      
      programs: "Programm-Verwaltung",
      transpileProject: "Projekt zu SPIKE Prime Python transpilieren",
      showCode: "generierten Code anzeigen",
      downloadCode: "als .py Datei herunterladen",
      uploadToSlot: "Programm in Slot [SLOT] hochladen",
      uploadAndRun: "hochladen und in Slot [SLOT] ausführen",
      runSlot: "Programm in Slot [SLOT] starten",
      stopSlot: "Programm in Slot [SLOT] stoppen",
      deleteSlot: "Programm in Slot [SLOT] löschen",
      
      sensors: "Sensoren & Motoren",
      enableSensors: "Sensor-Updates alle [MS] ms aktivieren",
      disableSensors: "Sensor-Updates deaktivieren",
      getMotorPosition: "Motor [PORT] Position",
      getMotorSpeed: "Motor [PORT] Geschwindigkeit",
      getColorSensor: "Farbsensor [PORT] [MODE]",
      getDistanceSensor: "Abstandssensor [PORT] mm",
      getForceSensor: "Kraftsensor [PORT] [MODE]",
      getIMU: "Hub [IMU] Wert",
      getBattery: "Batteriestand %",
      
      hub: "Hub-Steuerung",
      hubName: "Hub-Name",
      setHubName: "setze Hub-Name auf [NAME]",
      
      noCodeGenerated: "Noch kein Code generiert!",
      generateFirst: "Generiere zuerst Code!",
      uploaded: "Hochgeladen in Slot",
      uploadFailed: "Upload fehlgeschlagen",
      notConnected: "Nicht mit Hub verbunden",
    }
  };

  let currentLang = "en";
  try {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith("de")) {
      currentLang = "de";
    }
  } catch (e) {}

  function t(key) {
    return translations[currentLang][key] || translations["en"][key] || key;
  }

  // ============================================================================
  // COBS ENCODING/DECODING (from SPIKE Prime docs)
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
  // CRC32 (with alignment as per SPIKE Prime spec)
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

      // Pad to alignment
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

  // Message types
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
  // SPIKE PRIME HUB (BLE Connection + Protocol)
  // ============================================================================

  class SpikePrimeHub {
    constructor() {
      this.SERVICE_UUID = "0000fd02-0000-1000-8000-00805f9b34fb";
      this.RX_UUID = "0000fd02-0001-1000-8000-00805f9b34fb"; // Write to hub
      this.TX_UUID = "0000fd02-0002-1000-8000-00805f9b34fb"; // Read from hub

      this.device = null;
      this.server = null;
      this.rxChar = null;
      this.txChar = null;

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
        imu: { yaw: 0, pitch: 0, roll: 0, accelX: 0, accelY: 0, accelZ: 0 },
        matrix: new Array(25).fill(0),
      };

      this.hubName = "";
      this.consoleOutput = [];

      this._onDisconnect = this._onDisconnect.bind(this);
      this._onNotification = this._onNotification.bind(this);
    }

    async connect() {
      try {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: [this.SERVICE_UUID] },
            { manufacturerData: [{ companyIdentifier: 0x0397 }] }
          ],
          optionalServices: [this.SERVICE_UUID]
        });

        this.server = await this.device.gatt.connect();
        this.device.addEventListener('gattserverdisconnected', this._onDisconnect);

        const service = await this.server.getPrimaryService(this.SERVICE_UUID);
        this.rxChar = await service.getCharacteristic(this.RX_UUID);
        this.txChar = await service.getCharacteristic(this.TX_UUID);

        await this.txChar.startNotifications();
        this.txChar.addEventListener('characteristicvaluechanged', this._onNotification);

        // Handshake
        const info = await this.sendRequest(MSG.InfoRequest, [], MSG.InfoResponse);
        this.maxPacketSize = Message.parseUInt16LE(info, 9);
        this.maxMessageSize = Message.parseUInt16LE(info, 11);
        this.maxChunkSize = Message.parseUInt16LE(info, 13);

        console.log(`Connected! Max packet: ${this.maxPacketSize}, Max chunk: ${this.maxChunkSize}`);

        // Get hub name
        const nameResp = await this.sendRequest(MSG.GetHubNameRequest, [], MSG.GetHubNameResponse);
        const decoder = new TextDecoder();
        this.hubName = decoder.decode(nameResp.slice(1)).replace(/\0/g, '');

        return true;
      } catch (error) {
        console.error("Connection failed:", error);
        this.disconnect();
        return false;
      }
    }

    disconnect() {
      if (this.device && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
      this._onDisconnect();
    }

    _onDisconnect() {
      this.device = null;
      this.server = null;
      this.rxChar = null;
      this.txChar = null;
      console.log("Disconnected from SPIKE Prime");
    }

    isConnected() {
      return this.device && this.device.gatt && this.device.gatt.connected;
    }

    _onNotification(event) {
      const data = new Uint8Array(event.target.value.buffer);
      
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
          const text = decoder.decode(data.slice(1)).replace(/\0/g, '');
          this.consoleOutput.push(text);
          console.log("[SPIKE]", text);
          break;

        case MSG.DeviceNotification:
          this._parseDeviceNotification(data);
          break;

        case MSG.ProgramFlowNotification:
          const action = data[1];
          console.log(`Program ${action === 1 ? 'stopped' : 'started'}`);
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

          case 0x0A: // Motor
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

          case 0x0B: // Force Sensor
            {
              const port = data[offset + 1];
              this.sensorData.forceSensors[port] = {
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
              this.sensorData.colorSensors[port] = {
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

      // Send in packets
      for (let i = 0; i < frame.length; i += this.maxPacketSize) {
        const packet = frame.slice(i, i + this.maxPacketSize);
        await this.rxChar.writeValueWithoutResponse(packet);
      }
    }

    async sendRequest(messageType, payload, expectedResponse, timeoutMs = 5000) {
      return new Promise(async (resolve, reject) => {
        const timer = setTimeout(() => {
          this.pendingResponses.delete(expectedResponse);
          reject(new Error(`Timeout waiting for response 0x${expectedResponse.toString(16)}`));
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
      if (!filename.endsWith('.py')) {
        filename += '.py';
      }

      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(pythonCode);
      const crc = CRC32.calculate(codeBytes);

      console.log(`Uploading ${filename} (${codeBytes.length} bytes) to slot ${slot}`);

      // Clear slot first
      try {
        const clearPayload = Message.writeUInt8(slot);
        await this.sendRequest(MSG.ClearSlotRequest, clearPayload, MSG.ClearSlotResponse);
      } catch (error) {
        console.warn("Clear slot failed (may be empty):", error.message);
      }

      // Start upload
      const nameBytes = Message.writeString(filename, 32);
      const slotByte = Message.writeUInt8(slot);
      const crcBytes = Message.writeUInt32LE(crc);
      const startPayload = Message.concat(nameBytes, slotByte, crcBytes);

      await this.sendRequest(MSG.StartFileUploadRequest, startPayload, MSG.StartFileUploadResponse);

      // Send chunks
      let runningCRC = 0;
      for (let i = 0; i < codeBytes.length; i += this.maxChunkSize) {
        const chunk = codeBytes.slice(i, i + this.maxChunkSize);
        runningCRC = CRC32.calculate(chunk, runningCRC);

        const chunkPayload = Message.concat(
          Message.writeUInt32LE(runningCRC),
          Message.writeUInt16LE(chunk.length),
          chunk
        );

        await this.sendRequest(MSG.TransferChunkRequest, chunkPayload, MSG.TransferChunkResponse);
        
        console.log(`Uploaded ${Math.min(i + this.maxChunkSize, codeBytes.length)}/${codeBytes.length} bytes`);
      }

      console.log("Upload complete!");
    }

    async runProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x00), // Action: Start
        Message.writeUInt8(slot)
      );
      await this.sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async stopProgram(slot = 0) {
      const payload = Message.concat(
        Message.writeUInt8(0x01), // Action: Stop
        Message.writeUInt8(slot)
      );
      await this.sendRequest(MSG.ProgramFlowRequest, payload, MSG.ProgramFlowResponse);
    }

    async deleteProgram(slot) {
      const payload = Message.writeUInt8(slot);
      await this.sendRequest(MSG.ClearSlotRequest, payload, MSG.ClearSlotResponse);
    }

    async enableDeviceNotifications(intervalMs = 100) {
      const payload = Message.writeUInt16LE(intervalMs);
      await this.sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }

    async disableDeviceNotifications() {
      const payload = Message.writeUInt16LE(0);
      await this.sendRequest(MSG.DeviceNotificationRequest, payload, MSG.DeviceNotificationResponse);
    }

    async setHubName(name) {
      const payload = Message.writeString(name, 30);
      await this.sendRequest(MSG.SetHubNameRequest, payload, MSG.SetHubNameResponse);
      this.hubName = name;
    }
  }

  // ============================================================================
  // EXTENSION CLASS
  // ============================================================================

  class SpikePrimeExtension {
    constructor() {
      this._hub = new SpikePrimeHub();
      
      // Transpiler state
      this._pythonCode = "";
      this._indentLevel = 0;
      this._scriptCounter = 1;
      this._mainScripts = [];
      this._broadcastHandlers = [];
    }

    getInfo() {
      return {
        id: "spikeprime",
        name: t("extensionName"),
        color1: "#FF661A",
        color2: "#E64D00",
        color3: "#CC4400",
        blocks: [
          // Connection
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("connection"),
          },
          {
            opcode: "connectHub",
            blockType: Scratch.BlockType.COMMAND,
            text: t("connectHub"),
          },
          {
            opcode: "disconnectHub",
            blockType: Scratch.BlockType.COMMAND,
            text: t("disconnectHub"),
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: t("isConnected"),
          },

          "---",

          // Program Management
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("programs"),
          },
          {
            opcode: "transpileProject",
            blockType: Scratch.BlockType.COMMAND,
            text: t("transpileProject"),
          },
          {
            opcode: "showCode",
            blockType: Scratch.BlockType.COMMAND,
            text: t("showCode"),
          },
          {
            opcode: "downloadCode",
            blockType: Scratch.BlockType.COMMAND,
            text: t("downloadCode"),
          },
          {
            opcode: "uploadToSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: t("uploadToSlot"),
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
                menu: "slots",
              },
            },
          },
          {
            opcode: "uploadAndRun",
            blockType: Scratch.BlockType.COMMAND,
            text: t("uploadAndRun"),
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
                menu: "slots",
              },
            },
          },
          {
            opcode: "runSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: t("runSlot"),
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
                menu: "slots",
              },
            },
          },
          {
            opcode: "stopSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: t("stopSlot"),
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
                menu: "slots",
              },
            },
          },
          {
            opcode: "deleteSlot",
            blockType: Scratch.BlockType.COMMAND,
            text: t("deleteSlot"),
            arguments: {
              SLOT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
                menu: "slots",
              },
            },
          },

          "---",

          // Sensors & Motors
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("sensors"),
          },
          {
            opcode: "enableSensors",
            blockType: Scratch.BlockType.COMMAND,
            text: t("enableSensors"),
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "disableSensors",
            blockType: Scratch.BlockType.COMMAND,
            text: t("disableSensors"),
          },
          {
            opcode: "getMotorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getMotorPosition"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getMotorSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getMotorSpeed"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getColorSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getColorSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "colorMode",
                defaultValue: "color",
              },
            },
          },
          {
            opcode: "getDistanceSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getDistanceSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getForceSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getForceSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "ports",
                defaultValue: "A",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "forceMode",
                defaultValue: "value",
              },
            },
          },
          {
            opcode: "getIMU",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getIMU"),
            arguments: {
              IMU: {
                type: Scratch.ArgumentType.STRING,
                menu: "imuMode",
                defaultValue: "yaw",
              },
            },
          },
          {
            opcode: "getBattery",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getBattery"),
          },

          "---",

          // Hub
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("hub"),
          },
          {
            opcode: "hubName",
            blockType: Scratch.BlockType.REPORTER,
            text: t("hubName"),
          },
          {
            opcode: "setHubName",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setHubName"),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "SPIKE",
              },
            },
          },
        ],
        menus: {
          ports: {
            acceptReporters: true,
            items: ["A", "B", "C", "D", "E", "F"],
          },
          slots: {
            acceptReporters: true,
            items: Array.from({ length: 20 }, (_, i) => String(i)),
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

    // ============================================================================
    // CONNECTION BLOCKS
    // ============================================================================

    async connectHub() {
      await this._hub.connect();
    }

    async disconnectHub() {
      this._hub.disconnect();
    }

    isConnected() {
      return this._hub.isConnected();
    }

    // ============================================================================
    // PROGRAM MANAGEMENT BLOCKS
    // ============================================================================

    transpileProject() {
      console.log("=== Starting Transpilation ===");
      this._pythonCode = "";
      this._indentLevel = 0;
      this._scriptCounter = 1;
      this._mainScripts = [];
      this._broadcastHandlers = [];

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        this._generateHeader();
        this._generateHelpers();

        for (let i = 0; i < targets.length; i++) {
          this._processTarget(targets[i]);
        }

        this._generateMainExecution();

        console.log("=== Transpilation Complete ===");
        console.log(this._pythonCode);
      } catch (error) {
        console.error("Transpilation error:", error);
      }
    }

    _generateHeader() {
      this._addLine("# Generated from Scratch by TurboWarp SPIKE Prime Extension");
      this._addLine("# SPIKE Prime MicroPython");
      this._addLine("");
      this._addLine("import runloop");
      this._addLine("from hub import light_matrix, motion_sensor, sound");
      this._addLine("from hub import port");
      this._addLine("import motor");
      this._addLine("import motor_pair");
      this._addLine("import color_sensor");
      this._addLine("import distance_sensor");
      this._addLine("import force_sensor");
      this._addLine("import color");
      this._addLine("");
      this._addLine("# Variables");
      this._addLine("variables = {}");
      this._addLine("broadcasts = {}");
      this._addLine("");
    }

    _generateHelpers() {
      this._addLine("async def trigger_broadcast(message):");
      this._indentLevel++;
      this._addLine("if message in broadcasts:");
      this._indentLevel++;
      this._addLine("for handler in broadcasts[message]:");
      this._indentLevel++;
      this._addLine("await handler()");
      this._indentLevel--;
      this._indentLevel--;
      this._indentLevel--;
      this._addLine("");
    }

    _generateMainExecution() {
      if (this._mainScripts.length > 0) {
        this._addLine("async def main():");
        this._indentLevel++;
        this._addLine("tasks = []");
        for (let i = 0; i < this._mainScripts.length; i++) {
          this._addLine(`tasks.append(${this._mainScripts[i]}())`);
        }
        this._addLine("await runloop.gather(*tasks)");
        this._indentLevel--;
        this._addLine("");
        this._addLine("runloop.run(main())");
      }
    }

    _processTarget(target) {
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      const blockKeys = Object.keys(blockArray);

      const hatBlocks = [];
      for (let i = 0; i < blockKeys.length; i++) {
        const block = blockArray[blockKeys[i]];
        if (block.opcode && block.opcode.startsWith("event_when")) {
          hatBlocks.push(block);
        }
      }

      for (let i = 0; i < hatBlocks.length; i++) {
        this._processHatBlock(hatBlocks[i], blocks);
      }
    }

    _processHatBlock(hatBlock, blocks) {
      const opcode = hatBlock.opcode;
      let funcName = "";

      if (opcode === "event_whenflagclicked") {
        funcName = "on_start_" + this._scriptCounter;
      } else if (opcode === "event_whenbroadcastreceived") {
        const broadcastName = this._getFieldValue(hatBlock, "BROADCAST_OPTION");
        funcName = "on_broadcast_" + this._sanitizeName(broadcastName) + "_" + this._scriptCounter;
      } else {
        funcName = "on_event_" + this._scriptCounter;
      }

      this._scriptCounter++;

      this._addLine("async def " + funcName + "():");
      this._indentLevel++;

      let currentBlockId = hatBlock.next;
      let blockCount = 0;

      while (currentBlockId) {
        const block = blocks._blocks[currentBlockId];
        if (!block) break;
        blockCount++;
        this._processBlock(block, blocks);
        currentBlockId = block.next;
      }

      if (blockCount === 0) {
        this._addLine("pass");
      }

      this._indentLevel--;
      this._addLine("");

      if (opcode === "event_whenflagclicked") {
        this._mainScripts.push(funcName);
      } else if (opcode === "event_whenbroadcastreceived") {
        const broadcastName = this._getFieldValue(hatBlock, "BROADCAST_OPTION");
        if (!this._broadcastHandlers.includes(broadcastName)) {
          this._broadcastHandlers.push(broadcastName);
          this._addLine('broadcasts["' + broadcastName + '"] = []');
        }
        this._addLine('broadcasts["' + broadcastName + '"].append(' + funcName + ")");
        this._addLine("");
      }
    }

    _processBlock(block, blocks) {
      const opcode = block.opcode;

      // SPIKE Prime specific blocks would go here
      // For now, handle basic Scratch blocks

      if (opcode === "control_wait") {
        const duration = this._getInputValue(block, "DURATION", blocks);
        this._addLine("await runloop.sleep_ms(int(" + duration + " * 1000))");
      } else if (opcode === "control_repeat") {
        const times = this._getInputValue(block, "TIMES", blocks);
        this._addLine("for i in range(int(" + times + ")):");
        this._indentLevel++;
        const substackId = this._getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this._processBlockChain(substackId, blocks);
        } else {
          this._addLine("pass");
        }
        this._indentLevel--;
      } else if (opcode === "control_forever") {
        this._addLine("while True:");
        this._indentLevel++;
        const substackId = this._getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this._processBlockChain(substackId, blocks);
        } else {
          this._addLine("pass");
        }
        this._indentLevel--;
      } else if (opcode === "control_if") {
        const condition = this._getInputValue(block, "CONDITION", blocks);
        this._addLine("if " + condition + ":");
        this._indentLevel++;
        const substackId = this._getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this._processBlockChain(substackId, blocks);
        } else {
          this._addLine("pass");
        }
        this._indentLevel--;
      } else if (opcode === "event_broadcast") {
        const msg = this._getInputValue(block, "BROADCAST_INPUT", blocks);
        this._addLine("await trigger_broadcast(" + msg + ")");
      } else if (opcode === "looks_say") {
        const msg = this._getInputValue(block, "MESSAGE", blocks);
        this._addLine("await light_matrix.write(" + msg + ")");
      } else if (opcode === "data_setvariableto") {
        const varName = this._getFieldValue(block, "VARIABLE");
        const value = this._getInputValue(block, "VALUE", blocks);
        this._addLine('variables["' + varName + '"] = ' + value);
      } else {
        this._addLine("# TODO: " + opcode);
      }
    }

    _processBlockChain(blockId, blocks) {
      let currentId = blockId;
      while (currentId) {
        const block = blocks._blocks[currentId];
        if (!block) break;
        this._processBlock(block, blocks);
        currentId = block.next;
      }
    }

    _getInputValue(block, inputName, blocks) {
      const input = block.inputs[inputName];
      if (!input) return "0";

      if (typeof input === "object" && !Array.isArray(input)) {
        if (input.block) {
          const refBlock = blocks._blocks[input.block];
          if (refBlock) return this._evaluateBlock(refBlock, blocks);
        }
        return "0";
      }

      if (!Array.isArray(input)) return "0";

      const inputData = input[1];
      if (Array.isArray(inputData)) {
        return String(inputData[1]);
      } else if (typeof inputData === "string") {
        const refBlock = blocks._blocks[inputData];
        if (refBlock) return this._evaluateBlock(refBlock, blocks);
      }

      return "0";
    }

    _evaluateBlock(block, blocks) {
      if (block.opcode === "math_number") {
        return this._getFieldValue(block, "NUM") || "0";
      } else if (block.opcode === "text") {
        const text = this._getFieldValue(block, "TEXT");
        return '"' + (text || "") + '"';
      } else if (block.opcode === "data_variable") {
        const varName = this._getFieldValue(block, "VARIABLE");
        return 'variables.get("' + varName + '", 0)';
      } else if (block.opcode === "operator_add") {
        const num1 = this._getInputValue(block, "NUM1", blocks);
        const num2 = this._getInputValue(block, "NUM2", blocks);
        return "(" + num1 + " + " + num2 + ")";
      } else if (block.opcode === "operator_gt") {
        const op1 = this._getInputValue(block, "OPERAND1", blocks);
        const op2 = this._getInputValue(block, "OPERAND2", blocks);
        return op1 + " > " + op2;
      } else if (block.opcode === "operator_equals") {
        const op1 = this._getInputValue(block, "OPERAND1", blocks);
        const op2 = this._getInputValue(block, "OPERAND2", blocks);
        return op1 + " == " + op2;
      }
      return "0";
    }

    _getFieldValue(block, fieldName) {
      if (block.fields && block.fields[fieldName]) {
        const field = block.fields[fieldName];
        return field.value || field.id || field.name;
      }
      return null;
    }

    _getSubstackId(block, substackName) {
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

    _addLine(code) {
      this._pythonCode += "    ".repeat(this._indentLevel) + code + "\n";
    }

    _sanitizeName(name) {
      if (!name) return "unnamed";
      return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }

    showCode() {
      if (!this._pythonCode) {
        alert(t("noCodeGenerated"));
        return;
      }

      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 20px; border: 2px solid #FF661A;
        border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto;
        z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;

      const title = document.createElement("h3");
      title.textContent = "Generated SPIKE Prime MicroPython";
      title.style.cssText = "margin-top: 0;";

      const pre = document.createElement("pre");
      pre.style.cssText = "background: #f5f5f5; padding: 10px; overflow: auto; max-height: 500px; font-family: monospace; font-size: 12px;";
      pre.textContent = this._pythonCode;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = "margin-top: 10px; padding: 8px 16px; background: #FF661A; color: white; border: none; border-radius: 4px; cursor: pointer;";
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(title);
      modal.appendChild(pre);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
    }

    downloadCode() {
      if (!this._pythonCode) {
        alert(t("generateFirst"));
        return;
      }

      const blob = new Blob([this._pythonCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spike_prime_program.py";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    async uploadToSlot(args) {
      if (!this._pythonCode) {
        alert(t("generateFirst"));
        return;
      }

      try {
        const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
        await this._hub.uploadProgram("program.py", this._pythonCode, slot);
        alert(`${t("uploaded")} ${slot}`);
      } catch (error) {
        alert(`${t("uploadFailed")}: ${error.message}`);
      }
    }

    async uploadAndRun(args) {
      if (!this._pythonCode) {
        alert(t("generateFirst"));
        return;
      }

      try {
        const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
        await this._hub.uploadProgram("program.py", this._pythonCode, slot);
        await this._hub.runProgram(slot);
        alert(`${t("uploaded")} ${slot}`);
      } catch (error) {
        alert(`${t("uploadFailed")}: ${error.message}`);
      }
    }

    async runSlot(args) {
      const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
      await this._hub.runProgram(slot);
    }

    async stopSlot(args) {
      const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
      await this._hub.stopProgram(slot);
    }

    async deleteSlot(args) {
      const slot = Math.max(0, Math.min(19, parseInt(args.SLOT)));
      await this._hub.deleteProgram(slot);
    }

    // ============================================================================
    // SENSOR BLOCKS
    // ============================================================================

    async enableSensors(args) {
      const ms = Math.max(50, parseInt(args.MS));
      await this._hub.enableDeviceNotifications(ms);
    }

    async disableSensors() {
      await this._hub.disableDeviceNotifications();
    }

    getMotorPosition(args) {
      const portId = this._getPortId(args.PORT);
      const motor = this._hub.sensorData.motors[portId];
      return motor ? motor.position : 0;
    }

    getMotorSpeed(args) {
      const portId = this._getPortId(args.PORT);
      const motor = this._hub.sensorData.motors[portId];
      return motor ? motor.speed : 0;
    }

    getColorSensor(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._hub.sensorData.colorSensors[portId];
      if (!sensor) return 0;

      switch (args.MODE) {
        case "color": return sensor.color;
        case "red": return sensor.red;
        case "green": return sensor.green;
        case "blue": return sensor.blue;
        default: return 0;
      }
    }

    getDistanceSensor(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._hub.sensorData.distanceSensors[portId];
      return sensor ? sensor.distance : -1;
    }

    getForceSensor(args) {
      const portId = this._getPortId(args.PORT);
      const sensor = this._hub.sensorData.forceSensors[portId];
      if (!sensor) return 0;

      return args.MODE === "pressed" ? (sensor.pressed ? 1 : 0) : sensor.value;
    }

    getIMU(args) {
      const imu = this._hub.sensorData.imu;
      switch (args.IMU) {
        case "yaw": return imu.yaw;
        case "pitch": return imu.pitch;
        case "roll": return imu.roll;
        case "accelX": return imu.accelX;
        case "accelY": return imu.accelY;
        case "accelZ": return imu.accelZ;
        default: return 0;
      }
    }

    getBattery() {
      return this._hub.sensorData.battery;
    }

    // ============================================================================
    // HUB BLOCKS
    // ============================================================================

    hubName() {
      return this._hub.hubName;
    }

    async setHubName(args) {
      await this._hub.setHubName(args.NAME);
    }

    // ============================================================================
    // UTILITIES
    // ============================================================================

    _getPortId(port) {
      const portMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
      return portMap[port] || 0;
    }
  }

  Scratch.extensions.register(new SpikePrimeExtension());
})(Scratch);