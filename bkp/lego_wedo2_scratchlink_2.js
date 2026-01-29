(function (Scratch) {
  "use strict";

  // ============================================================================
  // HIGH-VERBOSITY DEBUGGER & UTILS
  // ============================================================================
  class WeDoLogger {
    constructor() {
      this.enabled = true;
      this.prefix = "%c[WeDo 2.0 PRO]";
      this.style = "color: #ffffff; font-weight: bold; background: #005595; padding: 2px 5px; border-radius: 3px;";
    }
    info(msg, data = "") { if (this.enabled) console.log(this.prefix, this.style, msg, data); }
    trace(msg, bytes) {
      if (this.enabled && bytes) {
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`%c[WeDo 2.0 IO]`, "color: #009688; font-weight: bold;", `(${hex}) ${msg}`);
      }
    }
    error(msg, err) { console.error("[WeDo 2.0 PRO] ❌ " + msg, err); }
  }
  const logger = new WeDoLogger();

  // ============================================================================
  // CONSTANTS & PROTOCOL SPEC
  // ============================================================================
  const SERVICES = {
    ADVERTISEMENT: '00001523-1212-efde-1523-785feabcd123',
    IO: '00004f0e-1212-efde-1523-785feabcd123',
    BATTERY: '0000180f-0000-1000-8000-00805f9b34fb'
  };

  const CHARS = {
    PORT_INFO:     '00001527-1212-efde-1523-785feabcd123',
    SENSOR_VALUE:  '00001560-1212-efde-1523-785feabcd123',
    INPUT_CMD:     '00001563-1212-efde-1523-785feabcd123',
    OUTPUT_CMD:    '00001565-1212-efde-1523-785feabcd123',
    BUTTON:        '00001526-1212-efde-1523-785feabcd123',
    BATTERY:       '00002a19-0000-1000-8000-00805f9b34fb',
    DISCONNECT:    '0000152e-1212-efde-1523-785feabcd123'
  };

  const DeviceType = { MOTOR: 1, PIEZO: 22, LED: 23, TILT: 34, DISTANCE: 35 };

  // ============================================================================
  // ADAPTERS (BLE + Scratch Link)
  // ============================================================================

  class BaseAdapter {
    constructor() { 
      this.onMsg = null;
      this.lastWriteTime = 0;
      this.minWriteInterval = 50; // 20Hz Rate Limiting
    }
    async throttle() {
      const now = Date.now();
      const wait = this.minWriteInterval - (now - this.lastWriteTime);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      this.lastWriteTime = Date.now();
    }
  }

  class BLEAdapter extends BaseAdapter {
    constructor() { super(); this.device = null; this.chars = new Map(); }
    async connect(onMsg) {
      this.onMsg = onMsg;
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICES.ADVERTISEMENT] }],
        optionalServices: [SERVICES.IO, SERVICES.BATTERY]
      });
      const server = await this.device.gatt.connect();
      const services = await server.getPrimaryServices();
      for (const s of services) {
        const characteristics = await s.getCharacteristics();
        for (const c of characteristics) {
          const uuid = c.uuid.toLowerCase();
          this.chars.set(uuid, c);
          if (uuid.includes('1527') || uuid.includes('1560') || uuid.includes('1526')) {
            await c.startNotifications();
            c.addEventListener('characteristicvaluechanged', (e) => {
              this.onMsg(uuid, new Uint8Array(e.target.value.buffer));
            });
          }
        }
      }
      return true;
    }
    async write(uuid, data) {
      await this.throttle();
      const c = this.chars.get(uuid.toLowerCase());
      if (c) await c.writeValue(new Uint8Array(data));
    }
    async read(uuid) {
      const c = this.chars.get(uuid.toLowerCase());
      return c ? new Uint8Array((await c.readValue()).buffer) : null;
    }
    isConnected() { return this.device && this.device.gatt.connected; }
  }

  class ScratchLinkAdapter extends BaseAdapter {
    constructor() { super(); this.ws = null; this._id = 0; this.connected = false; }
    async connect(onMsg) {
      this.onMsg = onMsg;
      return new Promise((res, rej) => {
        this.ws = new WebSocket("wss://device-manager.scratch.mit.edu:20110/scratch/ble");
        this.ws.onopen = async () => {
          try {
            const search = await this._req("discover", { filters: [{ services: [SERVICES.ADVERTISEMENT] }] });
            await this._req("connect", { peripheralId: search.peripheralId });
            const subs = [
              { s: SERVICES.ADVERTISEMENT, c: CHARS.PORT_INFO },
              { s: SERVICES.IO, c: CHARS.SENSOR_VALUE },
              { s: SERVICES.ADVERTISEMENT, c: CHARS.BUTTON }
            ];
            for (const sub of subs) await this._req("startNotifications", { serviceId: sub.s, characteristicId: sub.c });
            this.connected = true;
            res(true);
          } catch (e) { rej(e); }
        };
        this.ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.method === "characteristicDidChange") {
            const data = Uint8Array.from(atob(msg.params.message), c => c.charCodeAt(0));
            this.onMsg(msg.params.characteristicId.toLowerCase(), data);
          }
        };
      });
    }
    async _req(method, params) {
      const id = ++this._id;
      this.ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
      return new Promise((resolve) => {
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === id) { this.ws.removeEventListener('message', h); resolve(m.result); }
        };
        this.ws.addEventListener('message', h);
      });
    }
    async write(uuid, data) {
      await this.throttle();
      const sID = uuid.includes('156') ? SERVICES.IO : SERVICES.ADVERTISEMENT;
      await this._req("write", {
        serviceId: sID, characteristicId: uuid,
        message: btoa(String.fromCharCode.apply(null, data)), encoding: "base64"
      });
    }
    async read(uuid) {
      const sID = uuid.includes('2a19') ? 'battery_service' : SERVICES.ADVERTISEMENT;
      const res = await this._req("read", { serviceId: sID, characteristicId: uuid });
      return Uint8Array.from(atob(res.message), c => c.charCodeAt(0));
    }
    isConnected() { return this.connected && this.ws.readyState === WebSocket.OPEN; }
  }

  // ============================================================================
  // HUB MANAGER
  // ============================================================================

  class WeDo2Hub {
    constructor(runtime, adapter) {
      this.runtime = runtime;
      this.adapter = adapter;
      this.ports = { 1: null, 2: null };
      this.sensors = { distance: 0, tiltX: 0, tiltY: 0, button: false, battery: 100 };
      this.brakeTimeouts = { 1: null, 2: null };
    }

    async init() {
      await this.adapter.connect(this._handleData.bind(this));
      setInterval(() => this._doHeartbeat(), 10000);
      await this.setLED(0, 255, 0); // Solid Green on Init
    }

    _handleData(uuid, data) {
      const u = uuid.toLowerCase();
      // Port Detection
      if (u.includes('1527')) {
        const port = data[0];
        const type = data[1] === 0 ? null : data[3];
        this.ports[port] = type;
        logger.info(`Port ${port} detected as: ${type}`);
        if (type) this._configSensor(port, type);
      } 
      // Sensor Data
      else if (u.includes('1560')) {
        const port = data[1];
        const type = this.ports[port];
        if (type === DeviceType.DISTANCE) this.sensors.distance = data[2];
        if (type === DeviceType.TILT) {
          // Official Scratch Axis Translation
          this.sensors.tiltX = data[2] > 45 ? data[2] - 256 : data[2];
          this.sensors.tiltY = data[3] > 45 ? data[3] - 256 : data[3];
        }
      }
      else if (u.includes('1526')) {
        this.sensors.button = data[0] === 1;
      }
    }

    async _configSensor(port, type) {
      if (![DeviceType.TILT, DeviceType.DISTANCE].includes(type)) return;
      const unit = (type === DeviceType.DISTANCE) ? 1 : 0;
      const cmd = [1, 2, port, type, 0, 1, 0, 0, 0, unit, 1];
      await this.adapter.write(CHARS.INPUT_CMD, cmd);
    }

    async setMotor(port, power) {
      this._clearBrake(port);
      let p = 0;
      if (power !== 0) {
        // Map 1-100 to WeDo effective 30-100 range
        p = Math.floor(30 + (0.7 * Math.min(Math.abs(power), 100))) * (power < 0 ? -1 : 1);
      }
      await this.adapter.write(CHARS.OUTPUT_CMD, [port, 1, 1, p & 0xFF]);
    }

    async stopMotor(port) {
      this._clearBrake(port);
      await this.adapter.write(CHARS.OUTPUT_CMD, [port, 1, 1, 127]); // Brake
      this.brakeTimeouts[port] = setTimeout(() => {
        this.adapter.write(CHARS.OUTPUT_CMD, [port, 1, 1, 0]); // Float
      }, 1000);
    }

    _clearBrake(port) { if (this.brakeTimeouts[port]) clearTimeout(this.brakeTimeouts[port]); }

    async setLED(r, g, b) { await this.adapter.write(CHARS.OUTPUT_CMD, [6, 4, 3, r, g, b]); }

    async playTone(freq, ms) {
      const f = new Uint16Array([freq]);
      const d = new Uint16Array([ms]);
      const cmd = [5, 2, 4, f[0]&0xFF, (f[0]>>8)&0xFF, d[0]&0xFF, (d[0]>>8)&0xFF];
      await this.adapter.write(CHARS.OUTPUT_CMD, cmd);
    }

    async _doHeartbeat() {
      if (this.adapter.isConnected()) {
        try {
          const b = await this.adapter.read(CHARS.BATTERY);
          if (b) this.sensors.battery = b[0];
        } catch(e) {}
      }
    }

    async shutdown() { await this.adapter.write(CHARS.DISCONNECT, [1]); }
  }

  // ============================================================================
  // EXTENSION INTERFACE
  // ============================================================================

  class WeDo2Pro {
    constructor(runtime) {
      this.runtime = runtime;
      this.hub = null;
      this.connType = 'ble';
      this.runtime.on('PROJECT_STOP_ALL', () => {
        if (this.hub) {
          [1, 2].forEach(p => { if(this.hub.ports[p] === DeviceType.MOTOR) this.hub.setMotor(p, 0); });
        }
      });
    }

    getInfo() {
      return {
        id: 'wedo2pro',
        name: 'LEGO WeDo 2.0 Pro',
        color1: '#005595',
        blocks: [
          { opcode: 'setConn', blockType: "command", text: 'use [TYPE] connection', arguments: { TYPE: { type: "string", menu: 'connMenu', defaultValue: 'ble' } } },
          { opcode: 'connect', blockType: "command", text: 'connect hub' },
          '---',
          { opcode: 'motorOn', blockType: "command", text: 'turn [PORT] on at [PWR]%', arguments: { PORT: { type: "string", menu: 'portMenu', defaultValue: 'all' }, PWR: { type: "number", defaultValue: 100 } } },
          { opcode: 'motorOff', blockType: "command", text: 'stop [PORT]', arguments: { PORT: { type: "string", menu: 'portMenu', defaultValue: 'all' } } },
          '---',
          { opcode: 'getDist', blockType: "reporter", text: 'distance' },
          { opcode: 'getTilt', blockType: "reporter", text: 'tilt [AXIS]', arguments: { AXIS: { type: "string", menu: 'axisMenu', defaultValue: 'up' } } },
          { opcode: 'isPressed', blockType: "boolean", text: 'button pressed?' },
          '---',
          { opcode: 'ledColor', blockType: "command", text: 'set light to [COLOR]', arguments: { COLOR: { type: "color" } } },
          { opcode: 'beep', blockType: "command", text: 'play note [NOTE] for [MS] ms', arguments: { NOTE: { type: "number", defaultValue: 60 }, MS: { type: "number", defaultValue: 500 } } },
          '---',
          { opcode: 'getBattery', blockType: "reporter", text: 'battery' },
          { opcode: 'shutdown', blockType: "command", text: 'power down' }
        ],
        menus: {
          connMenu: { items: [{text: 'Web Bluetooth', value: 'ble'}, {text: 'Scratch Link', value: 'link'}] },
          portMenu: { items: [{text: 'Motor A', value: '1'}, {text: 'Motor B', value: '2'}, {text: 'Both Motors', value: 'all'}] },
          axisMenu: { items: ['up', 'down', 'left', 'right'] }
        }
      };
    }

    setConn(args) { this.connType = args.TYPE; }
    async connect() {
      const adapter = this.connType === 'ble' ? new BLEAdapter() : new ScratchLinkAdapter();
      this.hub = new WeDo2Hub(this.runtime, adapter);
      await this.hub.init();
    }

    async _runOnPorts(portArg, action) {
      if (!this.hub) return;
      const targets = portArg === 'all' ? [1, 2] : [parseInt(portArg)];
      for (const p of targets) if (this.hub.ports[p] === DeviceType.MOTOR) await action(p);
    }

    async motorOn(args) { await this._runOnPorts(args.PORT, (p) => this.hub.setMotor(p, args.PWR)); }
    async motorOff(args) { await this._runOnPorts(args.PORT, (p) => this.hub.stopMotor(p)); }

    getDist() { return this.hub ? this.hub.sensors.distance : 0; }
    getTilt(args) {
      if (!this.hub) return 0;
      switch(args.AXIS) {
        case 'up': return -this.hub.sensors.tiltY;
        case 'down': return this.hub.sensors.tiltY;
        case 'left': return -this.hub.sensors.tiltX;
        case 'right': return this.hub.sensors.tiltX;
        default: return 0;
      }
    }
    isPressed() { return this.hub ? this.hub.sensors.button : false; }
    getBattery() { return this.hub ? this.hub.sensors.battery : 0; }

    async ledColor(args) {
      if (!this.hub) return;
      const r = parseInt(args.COLOR.slice(1,3), 16);
      const g = parseInt(args.COLOR.slice(3,5), 16);
      const b = parseInt(args.COLOR.slice(5,7), 16);
      await this.hub.setLED(r, g, b);
    }

    async beep(args) {
      if (!this.hub) return;
      const freq = Math.round(440 * Math.pow(2, (args.NOTE - 69) / 12));
      await this.hub.playTone(freq, args.MS);
    }
    async shutdown() { if(this.hub) await this.hub.shutdown(); }
  }

  Scratch.extensions.register(new WeDo2Pro());
})(Scratch);