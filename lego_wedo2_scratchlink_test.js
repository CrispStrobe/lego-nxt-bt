(function (Scratch) {
  "use strict";

  // ============================================================================
  // DEBUG LOGGER (High Verbosity)
  // ============================================================================
  class DebugLogger {
    constructor(prefix = "[WeDo 2.0]", enabled = true) {
      this.prefix = prefix;
      this.enabled = enabled;
      this.logLevel = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4 };
      this.currentLevel = this.logLevel.DEBUG;
    }
    setLevel(level) { this.currentLevel = this.logLevel[level.toUpperCase()] || 3; }
    error(...args) { if (this.enabled && this.currentLevel >= 0) console.error(this.prefix, ...args); }
    warn(...args) { if (this.enabled && this.currentLevel >= 1) console.warn(this.prefix, ...args); }
    info(...args) { if (this.enabled && this.currentLevel >= 2) console.info(this.prefix, ...args); }
    debug(...args) { if (this.enabled && this.currentLevel >= 3) console.log(this.prefix, "[DEBUG]", ...args); }
    trace(...args) { if (this.enabled && this.currentLevel >= 4) console.log(this.prefix, "[TRACE]", ...args); }
  }

  const logger = new DebugLogger();

  // ============================================================================
  // CONSTANTS & UUIDS
  // ============================================================================
  const WEDO2_SERVICES = {
    ADVERTISEMENT: '00001523-1212-efde-1523-785feabcd123',
    IO: '00004f0e-1212-efde-1523-785feabcd123',
    BATTERY: '0000180f-0000-1000-8000-00805f9b34fb'
  };

  const WEDO2_CHARS = {
    ATTACHED_IO: '00001527-1212-efde-1523-785feabcd123',
    INPUT_VALUES: '00001560-1212-efde-1523-785feabcd123',
    INPUT_CMD: '00001563-1212-efde-1523-785feabcd123',
    OUTPUT_CMD: '00001565-1212-efde-1523-785feabcd123',
    BATTERY: '00002a19-0000-1000-8000-00805f9b34fb',
    DISCONNECT: '0000152e-1212-efde-1523-785feabcd123'
  };

  const DeviceType = {
    MOTOR: 1,
    VOLTAGE: 2,
    CURRENT: 3,
    PIEZO: 22,
    RGB_LED: 23,
    TILT: 34,
    DISTANCE: 35
  };

  // Port 1 & 2 are external. 5 is Piezo, 6 is Hub LED.
  const PortID = { A: 1, B: 2, PIEZO: 5, LED: 6 };

  // ============================================================================
  // UTILITIES
  // ============================================================================
  const Cast = Scratch.Cast;
  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;

  const Base64Util = {
    uint8ArrayToBase64: (arr) => btoa(String.fromCharCode.apply(null, arr)),
    base64ToUint8Array: (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  };

  class RateLimiter {
    constructor(maxPerSec) {
      this.interval = 1000 / maxPerSec;
      this.lastSend = 0;
    }
    okay() {
      const now = Date.now();
      if (now - this.lastSend >= this.interval) {
        this.lastSend = now;
        return true;
      }
      return false;
    }
  }

  // ============================================================================
  // CONNECTION ADAPTERS
  // ============================================================================
  class BLEAdapter {
    constructor() { this.device = null; this.server = null; this.chars = new Map(); this.connected = false; }
    async connect(onMsg) {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [WEDO2_SERVICES.ADVERTISEMENT] }],
        optionalServices: [WEDO2_SERVICES.IO, WEDO2_SERVICES.BATTERY]
      });
      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(WEDO2_SERVICES.IO);
      
      const charList = [WEDO2_CHARS.ATTACHED_IO, WEDO2_CHARS.INPUT_VALUES, WEDO2_CHARS.INPUT_CMD, WEDO2_CHARS.OUTPUT_CMD];
      for (const uuid of charList) {
        const c = await service.getCharacteristic(uuid);
        this.chars.set(uuid, c);
        if (uuid === WEDO2_CHARS.ATTACHED_IO || uuid === WEDO2_CHARS.INPUT_VALUES) {
          await c.startNotifications();
          c.addEventListener('characteristicvaluechanged', (e) => onMsg(uuid, new Uint8Array(e.target.value.buffer)));
        }
      }
      this.connected = true;
      return true;
    }
    async write(uuid, data) {
      if (!this.connected) return;
      await this.chars.get(uuid).writeValue(new Uint8Array(data));
    }
  }

  class ScratchLinkAdapter {
    constructor() { this.ws = null; this.connected = false; this.onMsg = null; }
    async connect(onMsg) {
      this.onMsg = onMsg;
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket("wss://device-manager.scratch.mit.edu:20110/scratch/ble");
        this.ws.onopen = async () => {
          const res = await this._req("discover", { filters: [{ services: [WEDO2_SERVICES.ADVERTISEMENT] }] });
          await this._req("connect", { peripheralId: res.peripheralId });
          await this._req("startNotifications", { serviceId: WEDO2_SERVICES.IO, characteristicId: WEDO2_CHARS.ATTACHED_IO });
          await this._req("startNotifications", { serviceId: WEDO2_SERVICES.IO, characteristicId: WEDO2_CHARS.INPUT_VALUES });
          this.connected = true;
          resolve(true);
        };
        this.ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.method === "characteristicDidChange") {
            this.onMsg(msg.params.characteristicId, Base64Util.base64ToUint8Array(msg.params.message));
          }
        };
      });
    }
    async _req(method, params) {
      const id = Math.floor(Math.random() * 1000);
      this.ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
      return new Promise((resolve) => {
        const handler = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === id) { resolve(m.result); this.ws.removeEventListener('message', handler); }
        };
        this.ws.addEventListener('message', handler);
      });
    }
    async write(uuid, data) {
      this.ws.send(JSON.stringify({
        jsonrpc: "2.0", method: "write", params: {
          serviceId: WEDO2_SERVICES.IO, characteristicId: uuid,
          message: Base64Util.uint8ArrayToBase64(data), encoding: "base64"
        }
      }));
    }
  }

  // ============================================================================
  // HUB LOGIC
  // ============================================================================
  class WeDo2Hub {
    constructor(adapterType) {
      this.adapter = adapterType === 'ble' ? new BLEAdapter() : new ScratchLinkAdapter();
      this.limiter = new RateLimiter(20);
      this.ports = { 1: null, 2: null };
      this.sensors = { tiltX: 0, tiltY: 0, distance: 0 };
      this.motorState = { 1: { pwr: 100, dir: 1 }, 2: { pwr: 100, dir: 1 } };
    }

    async connect() {
      logger.info("Connecting to WeDo 2.0...");
      await this.adapter.connect(this._handleMsg.bind(this));
      // Set LED to Blue to indicate connected
      await this.setLED(0x0000FF);
      logger.info("Hub ready.");
    }

    _handleMsg(uuid, data) {
      logger.trace(`Data on ${uuid}:`, Array.from(data));
      if (uuid.toLowerCase() === WEDO2_CHARS.ATTACHED_IO.toLowerCase()) {
        this._parseIO(data);
      } else if (uuid.toLowerCase() === WEDO2_CHARS.INPUT_VALUES.toLowerCase()) {
        this._parseSensor(data);
      }
    }

    _parseIO(data) {
      const port = data[0];
      const type = data[1] === 0 ? null : data[3];
      this.ports[port] = type;
      logger.debug(`Port ${port} is now: ${type || 'Empty'}`);
      if (type === DeviceType.TILT || type === DeviceType.DISTANCE) {
        this._setupSensor(port, type);
      }
    }

    _parseSensor(data) {
      const port = data[1];
      const type = this.ports[port];
      if (type === DeviceType.DISTANCE) {
        this.sensors.distance = data[2];
      } else if (type === DeviceType.TILT) {
        this.sensors.tiltX = data[2] > 127 ? data[2] - 256 : data[2];
        this.sensors.tiltY = data[3] > 127 ? data[3] - 256 : data[3];
      }
    }

    async _setupSensor(port, type) {
      const mode = 0; // Standard mode
      const cmd = [1, 2, port, type, mode, 1, 0, 0, 0, 0, 1];
      logger.debug(`Configuring sensor on port ${port}...`);
      await this.adapter.write(WEDO2_CHARS.INPUT_CMD, cmd);
    }

    async setMotor(port, pwr) {
      if (!this.limiter.okay()) return;
      const cmd = [port, 1, 1, pwr & 0xFF];
      await this.adapter.write(WEDO2_CHARS.OUTPUT_CMD, cmd);
    }

    async setLED(rgb) {
      const r = (rgb >> 16) & 0xFF;
      const g = (rgb >> 8) & 0xFF;
      const b = rgb & 0xFF;
      // WeDo2 LED is Port 6, Cmd 4 (Write RGB)
      await this.adapter.write(WEDO2_CHARS.OUTPUT_CMD, [6, 4, 3, r, g, b]);
    }

    async playTone(freq, dur) {
      const f = new Uint16Array([freq]);
      const d = new Uint16Array([dur]);
      const cmd = [5, 2, 4, f[0] & 0xFF, (f[0] >> 8) & 0xFF, d[0] & 0xFF, (d[0] >> 8) & 0xFF];
      await this.adapter.write(WEDO2_CHARS.OUTPUT_CMD, cmd);
    }
  }

  // ============================================================================
  // EXTENSION DEFINITION
  // ============================================================================
  class WeDo2Extension {
    constructor() {
      this.hub = null;
      this.connType = 'ble';
    }

    getInfo() {
      return {
        id: 'wedo2unified',
        name: 'LEGO WeDo 2.0 High-Verbosity',
        color1: '#005595',
        blocks: [
          { opcode: 'setConn', blockType: BlockType.COMMAND, text: 'use [TYPE] connection', arguments: { TYPE: { type: ArgumentType.STRING, menu: 'connMenu', defaultValue: 'ble' } } },
          { opcode: 'connect', blockType: BlockType.COMMAND, text: 'connect WeDo 2.0' },
          '---',
          { opcode: 'motorOn', blockType: BlockType.COMMAND, text: 'turn [PORT] on', arguments: { PORT: { type: ArgumentType.NUMBER, menu: 'portMenu', defaultValue: 1 } } },
          { opcode: 'motorOff', blockType: BlockType.COMMAND, text: 'turn [PORT] off', arguments: { PORT: { type: ArgumentType.NUMBER, menu: 'portMenu', defaultValue: 1 } } },
          { opcode: 'setMotorPwr', blockType: BlockType.COMMAND, text: 'set [PORT] power to [PWR]', arguments: { PORT: { type: ArgumentType.NUMBER, menu: 'portMenu', defaultValue: 1 }, PWR: { type: ArgumentType.NUMBER, defaultValue: 100 } } },
          '---',
          { opcode: 'getDist', blockType: BlockType.REPORTER, text: 'distance' },
          { opcode: 'getTiltX', blockType: BlockType.REPORTER, text: 'tilt X' },
          { opcode: 'getTiltY', blockType: BlockType.REPORTER, text: 'tilt Y' },
          '---',
          { opcode: 'ledColor', blockType: BlockType.COMMAND, text: 'set light color to [COLOR]', arguments: { COLOR: { type: ArgumentType.COLOR } } },
          { opcode: 'beep', blockType: BlockType.COMMAND, text: 'play note [FREQ] for [DUR] ms', arguments: { FREQ: { type: ArgumentType.NUMBER, defaultValue: 440 }, DUR: { type: ArgumentType.NUMBER, defaultValue: 500 } } }
        ],
        menus: {
          connMenu: { acceptReporters: false, items: [{ text: 'Web Bluetooth', value: 'ble' }, { text: 'Scratch Link', value: 'link' }] },
          portMenu: { acceptReporters: true, items: [{ text: 'Port A', value: 1 }, { text: 'Port B', value: 2 }] }
        }
      };
    }

    setConn(args) { this.connType = args.TYPE; }

    async connect() {
      try {
        this.hub = new WeDo2Hub(this.connType);
        await this.hub.connect();
      } catch (e) {
        logger.error("Connection failed:", e);
      }
    }

    motorOn(args) {
      const p = this.hub.motorState[args.PORT];
      this.hub.setMotor(args.PORT, p.pwr * p.dir);
    }

    motorOff(args) { this.hub.setMotor(args.PORT, 0); }

    setMotorPwr(args) {
      const p = this.hub.motorState[args.PORT];
      p.pwr = Cast.toNumber(args.PWR);
      this.hub.setMotor(args.PORT, p.pwr * p.dir);
    }

    getDist() { return this.hub ? this.hub.sensors.distance : 0; }
    getTiltX() { return this.hub ? this.hub.sensors.tiltX : 0; }
    getTiltY() { return this.hub ? this.hub.sensors.tiltY : 0; }

    ledColor(args) {
      const c = args.COLOR;
      // Convert hex/decimal color to RGB
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      this.hub.setLED((r << 16) | (g << 8) | b);
    }

    beep(args) {
      this.hub.playTone(Cast.toNumber(args.FREQ), Cast.toNumber(args.DUR));
    }
  }

  Scratch.extensions.register(new WeDo2Extension());
})(Scratch);