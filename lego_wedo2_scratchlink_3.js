(function (Scratch) {
  "use strict";

  // ============================================================================
  // HIGH-VERBOSITY LOGGER
  // ============================================================================
  class WeDoLogger {
    constructor() {
      this.enabled = true;
      this.styleHub = "color: #ffffff; font-weight: bold; background: #005595; padding: 2px 5px; border-radius: 3px;";
      this.styleIO = "color: #009688; font-weight: bold; border-left: 3px solid #009688; padding-left: 5px;";
    }
    info(msg, data = "") { 
      if (this.enabled) console.log("%c[WeDo 2.0 PRO]", this.styleHub, msg, data); 
    }
    trace(msg, bytes) {
      if (this.enabled && bytes) {
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`%c[IO] (${hex}) ${msg}`, this.styleIO);
      }
    }
    error(msg, err) { console.error("%c[WeDo 2.0 ERROR]", "color: red; font-weight: bold;", msg, err); }
  }
  const logger = new WeDoLogger();

  // ============================================================================
  // CONSTANTS & PROTOCOL
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

  const DeviceType = { MOTOR: 1, VOLTAGE: 20, CURRENT: 21, PIEZO: 22, LED: 23, TILT: 34, MOTION: 35 };
  
  const Modes = {
    TILT: { ANGLE: 0, DIRECTION: 1, IMPACT: 2 },
    MOTION: { DISTANCE: 0, COUNT: 1, REFLECT: 3, AMBIENT: 4 }
  };

  // ============================================================================
  // ADAPTERS
  // ============================================================================
  class BaseAdapter {
    constructor() { 
      this.onMsg = null; 
      this.lastWrite = 0; 
    }
    async throttle() {
      const now = Date.now();
      const wait = 50 - (now - this.lastWrite);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      this.lastWrite = Date.now();
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
          const u = c.uuid.toLowerCase();
          this.chars.set(u, c);
          if (u.includes('1527') || u.includes('1560') || u.includes('1526')) {
            await c.startNotifications();
            c.addEventListener('characteristicvaluechanged', (e) => onMsg(u, new Uint8Array(e.target.value.buffer)));
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
            for (const c of [CHARS.PORT_INFO, CHARS.SENSOR_VALUE, CHARS.BUTTON]) {
              await this._req("startNotifications", { 
                serviceId: c.includes('156') ? SERVICES.IO : SERVICES.ADVERTISEMENT, 
                characteristicId: c 
              });
            }
            this.connected = true; res(true);
          } catch (e) { rej(e); }
        };
        this.ws.onmessage = (e) => {
          const m = JSON.parse(e.data);
          if (m.method === "characteristicDidChange") {
            const d = Uint8Array.from(atob(m.params.message), c => c.charCodeAt(0));
            onMsg(m.params.characteristicId.toLowerCase(), d);
          }
        };
      });
    }
    async _req(method, params) {
      const id = ++this._id;
      this.ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
      return new Promise(resolve => {
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
      await this._req("write", { serviceId: sID, characteristicId: uuid, message: btoa(String.fromCharCode.apply(null, data)), encoding: "base64" });
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
    constructor(adapter) {
      this.adapter = adapter;
      this.ports = { 1: null, 2: null, 3: 21, 4: 20, 5: 22, 6: 23 };
      this.modes = { 1: 0, 2: 0 };
      this.sensors = { distance: 0, count: 0, tiltX: 0, tiltY: 0, tiltDir: 0, impact: 0, button: false, battery: 100, voltage: 0, current: 0, light: 0 };
    }

    async init() {
      await this.adapter.connect(this._parse.bind(this));
      setInterval(() => this._heartbeat(), 10000);
      await this.setLED(0, 255, 0); 
      logger.info("Hub Ready.");
    }

    _parse(uuid, data) {
      const u = uuid.toLowerCase();
      if (u.includes('1527')) { // Port Discovery
        const port = data[0], type = data[1] === 0 ? null : data[3];
        this.ports[port] = type;
        logger.info(`Port ${port} detected: ${type}`);
        if (type && port <= 2) this.setSensorMode(port, 0);
      } 
      else if (u.includes('1560')) { // Value Update
        const port = data[1], type = this.ports[port], mode = this.modes[port];
        if (type === DeviceType.MOTION) {
          if (mode === Modes.MOTION.DISTANCE) this.sensors.distance = data[2];
          else if (mode === Modes.MOTION.COUNT) this.sensors.count = (data[2] | data[3] << 8);
          else this.sensors.light = data[2];
        } 
        else if (type === DeviceType.TILT) {
          if (mode === Modes.TILT.ANGLE) {
            this.sensors.tiltX = data[2] > 45 ? data[2] - 256 : data[2];
            this.sensors.tiltY = data[3] > 45 ? data[3] - 256 : data[3];
          } else if (mode === Modes.TILT.DIRECTION) this.sensors.tiltDir = data[2];
          else if (mode === Modes.TILT.IMPACT) this.sensors.impact = data[2];
        }
        else if (type === DeviceType.VOLTAGE) this.sensors.voltage = (data[2] | data[3] << 8) / 100;
        else if (type === DeviceType.CURRENT) this.sensors.current = (data[2] | data[3] << 8) / 1000;
      }
      else if (u.includes('1526')) this.sensors.button = data[0] === 1;
    }

    async setSensorMode(port, mode) {
      const type = this.ports[port];
      if (!type) return;
      this.modes[port] = mode;
      await this.adapter.write(CHARS.INPUT_CMD, [1, 2, port, type, mode, 1, 0, 0, 0, 0, 1]);
    }

    async setMotor(port, power) {
      let p = 0;
      if (power !== 0) p = Math.floor(30 + (0.7 * Math.min(Math.abs(power), 100))) * (power < 0 ? -1 : 1);
      await this.adapter.write(CHARS.OUTPUT_CMD, [port, 1, 1, p & 0xFF]);
    }

    async stopMotor(port, style) {
      await this.adapter.write(CHARS.OUTPUT_CMD, [port, 1, 1, style === 'brake' ? 127 : 0]);
    }

    async setLED(r, g, b) { await this.adapter.write(CHARS.OUTPUT_CMD, [6, 4, 3, r, g, b]); }

    async playTone(freq, ms) {
      const f = new Uint16Array([freq]), d = new Uint16Array([ms]);
      await this.adapter.write(CHARS.OUTPUT_CMD, [5, 2, 4, f[0]&0xFF, (f[0]>>8)&0xFF, d[0]&0xFF, (d[0]>>8)&0xFF]);
    }

    async _heartbeat() {
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
        if (this.hub) [1, 2].forEach(p => { if(this.hub.ports[p] === 1) this.hub.stopMotor(p, 'coast'); });
      });
    }

    getInfo() {
      return {
        id: 'wedo2pro',
        name: 'LEGO WeDo 2.0 PRO',
        color1: '#005595',
        blocks: [
          { opcode: 'setConn', blockType: "command", text: 'connection: [TYPE]', arguments: { TYPE: { type: "string", menu: 'connMenu', defaultValue: 'ble' } } },
          { opcode: 'connect', blockType: "command", text: 'Connect Hub' },
          '---',
          { opcode: 'motorOn', blockType: "command", text: 'turn [PORT] on at [PWR]%', arguments: { PORT: { type: "string", menu: 'portMenu', defaultValue: 'all' }, PWR: { type: "number", defaultValue: 100 } } },
          { opcode: 'motorStop', blockType: "command", text: 'stop [PORT] ([STYLE])', arguments: { PORT: { type: "string", menu: 'portMenu', defaultValue: 'all' }, STYLE: { type: "string", menu: 'brakeMenu', defaultValue: 'brake' } } },
          '---',
          { opcode: 'setTiltMode', blockType: "command", text: 'tilt sensor: mode [MODE]', arguments: { MODE: { type: "string", menu: 'tiltMenu', defaultValue: 'ANGLE' } } },
          { opcode: 'getTilt', blockType: "reporter", text: 'tilt [AXIS]', arguments: { AXIS: { type: "string", menu: 'axisMenu', defaultValue: 'X' } } },
          { opcode: 'getImpact', blockType: "reporter", text: 'impact count' },
          '---',
          { opcode: 'setDistMode', blockType: "command", text: 'motion sensor: mode [MODE]', arguments: { MODE: { type: "string", menu: 'distMenu', defaultValue: 'DISTANCE' } } },
          { opcode: 'getDist', blockType: "reporter", text: 'distance' },
          { opcode: 'getLight', blockType: "reporter", text: 'light [LTYPE]', arguments: { LTYPE: { type: "string", menu: 'lightMenu', defaultValue: 'REFLECT' } } },
          '---',
          { opcode: 'ledColor', blockType: "command", text: 'set LED to [COLOR]', arguments: { COLOR: { type: "color" } } },
          { opcode: 'beep', blockType: "command", text: 'play note [NOTE] for [MS] ms', arguments: { NOTE: { type: "number", defaultValue: 60 }, MS: { type: "number", defaultValue: 500 } } },
          '---',
          { opcode: 'getStat', blockType: "reporter", text: 'hub [STAT]', arguments: { STAT: { type: "string", menu: 'statMenu', defaultValue: 'battery' } } },
          { opcode: 'isPressed', blockType: "boolean", text: 'button pressed?' },
          { opcode: 'shutdown', blockType: "command", text: 'Power Down' }
        ],
        menus: {
          connMenu: { items: [{text: 'Web Bluetooth', value: 'ble'}, {text: 'Scratch Link', value: 'link'}] },
          portMenu: { items: [{text: 'Port A', value: '1'}, {text: 'Port B', value: '2'}, {text: 'Both', value: 'all'}] },
          brakeMenu: { items: ['brake', 'coast'] },
          tiltMenu: { items: ['ANGLE', 'DIRECTION', 'IMPACT'] },
          distMenu: { items: ['DISTANCE', 'COUNT', 'REFLECT', 'AMBIENT'] },
          lightMenu: { items: ['REFLECT', 'AMBIENT'] },
          statMenu: { items: ['battery', 'voltage', 'current'] },
          axisMenu: { items: ['X', 'Y'] }
        }
      };
    }

    setConn(args) { this.connType = args.TYPE; }
    async connect() {
      const adapter = this.connType === 'ble' ? new BLEAdapter() : new ScratchLinkAdapter();
      this.hub = new WeDo2Hub(adapter);
      await this.hub.init();
    }

    async motorOn(args) {
      const ps = args.PORT === 'all' ? [1, 2] : [parseInt(args.PORT)];
      for(let p of ps) if(this.hub?.ports[p] === 1) await this.hub.setMotor(p, args.PWR);
    }

    async motorStop(args) {
      const ps = args.PORT === 'all' ? [1, 2] : [parseInt(args.PORT)];
      for(let p of ps) if(this.hub?.ports[p] === 1) await this.hub.stopMotor(p, args.STYLE);
    }

    async setTiltMode(args) { 
      const p = [1, 2].find(i => this.hub?.ports[i] === 34);
      if(p) await this.hub.setSensorMode(p, Modes.TILT[args.MODE]);
    }

    async setDistMode(args) {
      const p = [1, 2].find(i => this.hub?.ports[i] === 35);
      if(p) await this.hub.setSensorMode(p, Modes.MOTION[args.MODE]);
    }

    getTilt(args) { return this.hub ? (args.AXIS === 'X' ? this.hub.sensors.tiltX : this.hub.sensors.tiltY) : 0; }
    getImpact() { return this.hub?.sensors.impact || 0; }
    getDist() { return this.hub?.sensors.distance || 0; }
    getLight() { return this.hub?.sensors.light || 0; }
    isPressed() { return this.hub?.sensors.button || false; }
    getStat(args) { return this.hub?.sensors[args.STAT] || 0; }

    async ledColor(args) {
      const r = parseInt(args.COLOR.slice(1,3), 16), g = parseInt(args.COLOR.slice(3,5), 16), b = parseInt(args.COLOR.slice(5,7), 16);
      if(this.hub) await this.hub.setLED(r, g, b);
    }

    async beep(args) {
      const freq = Math.round(440 * Math.pow(2, (args.NOTE - 69) / 12));
      if(this.hub) await this.hub.playTone(freq, args.MS);
    }

    async shutdown() { if(this.hub) await this.hub.shutdown(); }
  }

  Scratch.extensions.register(new WeDo2Pro(Scratch.runtime));
})(Scratch);