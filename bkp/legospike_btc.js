(function (Scratch) {
  "use strict";

  const Cast = Scratch.Cast;

  // SPIKE Prime Protocol Constants
  const HUB_CONSTANTS = {
    // Message types
    MSG_INFO_REQUEST: 0x00,
    MSG_INFO_RESPONSE: 0x01,
    MSG_TUNNEL: 0x32,
    MSG_DEVICE_NOTIFICATION_REQUEST: 0x28,
    MSG_DEVICE_NOTIFICATION_RESPONSE: 0x29,
    MSG_DEVICE_NOTIFICATION: 0x3c,

    // Device types
    DEVICE_BATTERY: 0x00,
    DEVICE_IMU: 0x01,
    DEVICE_MOTOR: 0x0a,
    DEVICE_FORCE_SENSOR: 0x0b,
    DEVICE_COLOR_SENSOR: 0x0c,
    DEVICE_DISTANCE_SENSOR: 0x0d,
    DEVICE_3X3_COLOR_MATRIX: 0x0e,

    // COBS constants
    MAX_BLOCK_SIZE: 84,
    COBS_CODE_OFFSET: 2,
  };

  const SpikePorts = ["A", "B", "C", "D", "E", "F"];
  const PORT_MAP = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  const PORT_ID_TO_NAME = ["A", "B", "C", "D", "E", "F"];

  const SpikeMotorStopMode = {
    float: 0,
    brake: 1,
    hold: 2,
  };

  const DisplayPatterns = {
    heart: "960000960960a60960960000960",
    smile: "760076000078000076000760",
    sad: "760076000087600076000760",
    angry: "970079000087600079000970",
    surprised: "760076000999900076000760",
    arrow_up: "060060060686060606000000",
    arrow_down: "000060606068606060606000",
    check: "000000080000806080000000",
    x: "970000970000090000970000970",
  };

  // Color mapping for sensors
  const ColorNames = [
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

  class SpikePrimeBTC {
    constructor(runtime, extensionId) {
      this.runtime = runtime;
      this.extensionId = extensionId;

      // Web Serial connection
      this.port = null;
      this.reader = null;
      this.writer = null;
      this.connected = false;
      this.readLoop = null;

      // Hub state
      this.remainingData = new Uint8Array(0);
      this.batteryLevel = 100;
      this.pixelBrightness = 100;

      // Port data
      this.portValues = {};
      SpikePorts.forEach((p) => {
        this.portValues[p] = {
          type: "unknown",
          position: 0,
          distance: 0,
          color: 255,
          force: 0,
          pressed: false,
        };
      });

      // IMU data
      this.angle = { yaw: 0, pitch: 0, roll: 0 };
      this.acceleration = { x: 0, y: 0, z: 0 };
      this.gyro = { x: 0, y: 0, z: 0 };
      this.orientation = 1; // front

      // Gestures
      this.gestures = {
        tapped: false,
        doubletapped: false,
        shake: false,
        freefall: false,
      };

      // Buttons
      this.buttons = { left: false, center: false, right: false };

      // Motor settings
      this.motorSettings = {};
      SpikePorts.forEach((p) => {
        this.motorSettings[p] = { speed: 75, stopMode: 1 };
      });

      // Timer
      this.timerStart = Date.now();

      // Python REPL
      this.replOutput = "";
      this.replHistory = [];
      this.pythonAvailable = false;

      // Request tracking
      this.openRequests = {};
      this.requestIdCounter = 0;
    }

    // ==================== CONNECTION ====================

    _forceUserGesture(callback) {
      // Remove any existing buttons first
      const existing = document.getElementById("serial-fix-btn");
      if (existing) existing.remove();

      const btn = document.createElement("button");
      btn.id = "serial-fix-btn";
      btn.innerText = "CLICK HERE TO SELECT SPIKE HUB";
      // High-visibility styling
      Object.assign(btn.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "999999",
        padding: "30px",
        fontSize: "24px",
        fontWeight: "bold",
        backgroundColor: "#FFD700",
        color: "black",
        border: "5px solid black",
        borderRadius: "15px",
        cursor: "pointer",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      });

      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Crucial: Focus the window before requesting port
        window.focus();

        try {
          await callback();
          btn.remove(); // Only remove on success
        } catch (err) {
          console.error("Inner Error:", err);
          // If it still says "No port selected", it means the flag is definitely NOT working
          if (err.name === "SecurityError") {
            alert(
              "SECURITY ERROR: The --enable-unsafe-webserial flag is NOT active.",
            );
          } else {
            alert("Connection Error: " + err.message);
          }
          btn.remove();
        }
      };
      document.body.appendChild(btn);
    }

    async connectHub() {
      console.log("🔍 Checking Web Serial availability...");
      console.log("navigator.serial exists?", !!navigator.serial);

      if (!navigator.serial) {
        alert(
          "Web Serial not found. Run TurboWarp with the --enable-unsafe-webserial flag.",
        );
        return;
      }

      this._forceUserGesture(async () => {
        // We call this directly in the click handler
        // The browser allows 1 requestPort per user gesture
        const port = await navigator.serial.requestPort();
        this.port = port;

        await this.port.open({ baudRate: 115200 });

        this.reader = this.port.readable.getReader();
        this.writer = this.port.writable.getWriter();
        this.connected = true;

        this.startReadLoop();
        await this._initializeHub();
        console.log("✅ Serial Connection Established");
      });
    }

    async disconnectHub() {
      console.log("👋 [SPIKE Prime BTC] Disconnecting...");

      this.connected = false;

      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
      }

      if (this.writer) {
        this.writer.releaseLock();
      }

      if (this.port) {
        await this.port.close();
      }

      this.reset();
    }

    isConnected() {
      return this.connected;
    }

    reset() {
      this.connected = false;
      this.port = null;
      this.reader = null;
      this.writer = null;
      this.remainingData = new Uint8Array(0);
      this.batteryLevel = 100;
      this.portValues = {};
      SpikePorts.forEach((p) => {
        this.portValues[p] = {
          type: "unknown",
          position: 0,
          distance: 0,
          color: 255,
          force: 0,
          pressed: false,
        };
      });
      this.angle = { yaw: 0, pitch: 0, roll: 0 };
      this.pythonAvailable = false;
      this.replOutput = "";
    }

    async _initializeHub() {
      console.log("⚙️  [SPIKE Prime BTC] Initializing hub...");

      // Send Ctrl-C to interrupt any running program
      await this._sendRaw("\x03");

      await this._sleep(250);

      // Test Python REPL
      await this._sendRaw('import hub\r\nprint("PYTHON_AVAILABLE")\r\n');

      await this._sleep(250);

      // Request initial state
      await this._sendJSON({ m: "trigger_current_state", p: {} });

      await this._sleep(200);

      // Start continuous sensor monitoring
      this._startContinuousSensorLoop();
    }

    _startContinuousSensorLoop() {
      const script = `
import hub, utime
def sensor_loop():
    while True:
        try:
            yaw, pitch, roll = hub.motion.position()
            ax, ay, az = hub.motion.accelerometer()
            orient = hub.motion.orientation()
            batt_temp = hub.battery.temperature()
            print(f"SENSORS:{yaw},{pitch},{roll}|{ax},{ay},{az}|{orient}|{batt_temp}")
            
            for port in 'ABCDEF':
                if hasattr(hub.port[port], 'motor'):
                    try:
                        speed, rel, abs_pos, pwm = hub.port[port].motor.get()
                        print(f"MOTOR:{port}:{speed},{rel},{abs_pos},{pwm}")
                    except: pass
            
            for g in ['tapped', 'doubletapped', 'shake', 'freefall']:
                if hub.motion.was_gesture(g):
                    print(f"GESTURE:{g.upper()}")
        except: pass
        utime.sleep_ms(100)
sensor_loop()
`;
      this._sendRaw(script + "\r\n");
    }

    // ==================== SERIAL COMMUNICATION ====================

    async startReadLoop() {
      try {
        while (this.connected && this.reader) {
          const { value, done } = await this.reader.read();
          if (done) break;

          this._handleIncomingData(value);
        }
      } catch (error) {
        if (this.connected) {
          console.error("❌ [SPIKE Prime BTC] Read error:", error);
        }
      }
    }

    _handleIncomingData(data) {
      // Combine with any remaining data
      const combined = new Uint8Array(this.remainingData.length + data.length);
      combined.set(this.remainingData);
      combined.set(data, this.remainingData.length);

      // Convert to text and split by lines
      const text = new TextDecoder().decode(combined);
      const lines = text.split("\r\n");

      // Keep the last incomplete line
      this.remainingData = new TextEncoder().encode(lines.pop());

      // Process complete lines
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Try JSON first
        try {
          const json = JSON.parse(trimmed);
          this._parseJSONResponse(json);
        } catch {
          // Parse as raw data
          this._parseRawData(trimmed);
        }
      }
    }

    _parseJSONResponse(response) {
      if (response.m === 0) {
        // Hub status
        this._parseHubStatus(response);
      } else if (response.m === 2) {
        // Battery
        if (response.p && response.p.length >= 2) {
          this.batteryLevel = Math.round(response.p[1]);
        }
      } else if (response.m === 3) {
        // Button
        if (response.p && response.p.length >= 2) {
          const button = response.p[0];
          const pressed = response.p[1] === 1;
          if (button === "left") this.buttons.left = pressed;
          else if (button === "center") this.buttons.center = pressed;
          else if (button === "right") this.buttons.right = pressed;
        }
      } else if (response.m === 4) {
        // Event (orientation/gesture)
        const gestures = ["tapped", "doubletapped", "shake", "freefall"];
        if (gestures.includes(response.p)) {
          this.gestures[response.p] = true;
          setTimeout(() => {
            this.gestures[response.p] = false;
          }, 100);
        }
      }

      // Handle request responses
      if (response.i && this.openRequests[response.i]) {
        this.openRequests[response.i].resolve();
        delete this.openRequests[response.i];
      }
    }

    _parseHubStatus(response) {
      // Parse port data
      for (let i = 0; i < 6; i++) {
        const port = SpikePorts[i];
        if (!response.p[i]) continue;

        const deviceId = response.p[i][0];
        const values = response.p[i][1];

        switch (deviceId) {
          case 48: // Large motor
          case 49: // Medium motor
            this.portValues[port] = {
              type: "motor",
              speed: values[0] || 0,
              position: ((values[2] || 0) + 360) % 360,
              relativePosition: values[1] || 0,
              absolutePosition: values[2] || 0,
              power: values[3] || 0,
            };
            break;
          case 61: // Color sensor
            this.portValues[port] = {
              type: "color",
              color: values[0] || 255,
              reflection: values[1] || 0,
              ambient: values[2] || 0,
            };
            break;
          case 62: // Distance sensor
            this.portValues[port] = {
              type: "distance",
              distance: values[0] === -1 ? 0 : values[0] || 0,
            };
            break;
          case 63: // Force sensor
            this.portValues[port] = {
              type: "force",
              force: values[0] || 0,
              pressed: (values[1] || 0) > 0,
            };
            break;
        }
      }

      // Parse angle data
      if (response.p[8] && response.p[8].length >= 3) {
        this.angle = {
          yaw: response.p[8][0] || 0,
          pitch: response.p[8][1] || 0,
          roll: response.p[8][2] || 0,
        };
      }
    }

    _parseRawData(text) {
      if (text.startsWith("SENSORS:")) {
        const data = text.substring(8);
        const parts = data.split("|");
        if (parts.length >= 4) {
          const angles = parts[0].split(",").map(parseFloat);
          if (angles.length === 3) {
            this.angle = { yaw: angles[0], pitch: angles[1], roll: angles[2] };
          }

          const accel = parts[1].split(",").map(parseFloat);
          if (accel.length === 3) {
            this.acceleration = { x: accel[0], y: accel[1], z: accel[2] };
          }

          this.orientation = parseInt(parts[2], 10) || 1;
        }
      } else if (text.startsWith("MOTOR:")) {
        const data = text.substring(6);
        const [port, values] = data.split(":");
        if (port && values) {
          const [speed, rel, abs, pwm] = values.split(",").map(parseFloat);
          if (this.portValues[port]) {
            this.portValues[port].speed = speed;
            this.portValues[port].relativePosition = rel;
            this.portValues[port].absolutePosition = abs;
            this.portValues[port].power = pwm;
          }
        }
      } else if (text.startsWith("GESTURE:")) {
        const gesture = text.substring(8).toLowerCase();
        if (this.gestures.hasOwnProperty(gesture)) {
          this.gestures[gesture] = true;
          setTimeout(() => {
            this.gestures[gesture] = false;
          }, 100);
        }
      } else if (text.includes("PYTHON_AVAILABLE")) {
        this.pythonAvailable = true;
        console.log("✅ [SPIKE Prime BTC] Python REPL available");
      } else if (text.startsWith(">>>")) {
        this.replOutput += text + "\n";
        if (this.replOutput.length > 1000) {
          this.replOutput = this.replOutput.substring(
            this.replOutput.length - 1000,
          );
        }
      }
    }

    async _sendJSON(json) {
      const id = `req_${this.requestIdCounter++}`;
      json.i = id;

      const jsonText = JSON.stringify(json) + "\r";

      const promise = new Promise((resolve) => {
        this.openRequests[id] = { resolve };
        setTimeout(() => {
          if (this.openRequests[id]) {
            this.openRequests[id].resolve();
            delete this.openRequests[id];
          }
        }, 5000);
      });

      await this._sendRaw(jsonText);
      return promise;
    }

    async _sendRaw(text) {
      if (!this.connected || !this.writer) return;

      const data = new TextEncoder().encode(text);
      await this.writer.write(data);
    }

    async _sendPythonCommand(code) {
      return this._sendRaw(code + "\r\n");
    }

    _sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ==================== BLOCK IMPLEMENTATIONS ====================

    // Motor control
    async motorRunFor(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const direction = Cast.toNumber(args.DIRECTION);
      const value = Cast.toNumber(args.VALUE);
      const unit = Cast.toString(args.UNIT);

      const speed = this.motorSettings[port].speed * direction;

      if (unit === "rotations") {
        const degrees = Math.floor(value * 360);
        return this._sendPythonCommand(
          `import hub; hub.port.${port}.motor.run_for_degrees(${degrees}, ${speed})`,
        );
      } else if (unit === "degrees") {
        return this._sendPythonCommand(
          `import hub; hub.port.${port}.motor.run_for_degrees(${Math.floor(value)}, ${speed})`,
        );
      } else if (unit === "seconds") {
        const ms = Math.floor(value * 1000);
        return this._sendPythonCommand(
          `import hub; hub.port.${port}.motor.run_for_time(${ms}, ${speed})`,
        );
      }
    }

    async motorStart(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const direction = Cast.toNumber(args.DIRECTION);
      const speed = this.motorSettings[port].speed * direction;

      return this._sendPythonCommand(
        `import hub; hub.port.${port}.motor.pwm(${Math.round(speed)})`,
      );
    }

    async motorStop(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this._sendPythonCommand(
        `import hub; hub.port.${port}.motor.stop()`,
      );
    }

    motorSetSpeed(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const speed = Cast.toNumber(args.SPEED);
      this.motorSettings[port].speed = Math.max(-100, Math.min(100, speed));
    }

    getPosition(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this.portValues[port]?.position || 0;
    }

    // Display control
    async displayText(args) {
      const text = Cast.toString(args.TEXT);
      return this._sendPythonCommand(
        `import hub; hub.display.show("${text.replace(/"/g, '\\"')}")`,
      );
    }

    async displayImage(args) {
      const matrix = Cast.toString(args.MATRIX);
      const symbol = (matrix.replace(/\D/g, "") + "0".repeat(25)).slice(0, 25);
      const image = symbol
        .replace(/1/g, "9")
        .replace(/0/g, "_")
        .match(/.{5}/g)
        .join(":");
      return this._sendPythonCommand(
        `import hub; hub.display.show(hub.Image("${image}"))`,
      );
    }

    async displayPattern(args) {
      const pattern = Cast.toString(args.PATTERN);
      const patternData = DisplayPatterns[pattern];
      if (patternData) {
        return this.displayImage({ MATRIX: patternData });
      }
    }

    async displayClear() {
      return this._sendPythonCommand('import hub; hub.display.show(" ")');
    }

    async setPixel(args) {
      const x = Cast.toNumber(args.X) - 1;
      const y = Cast.toNumber(args.Y) - 1;
      const brightness = Math.round((Cast.toNumber(args.BRIGHTNESS) * 9) / 100);

      if (x < 0 || x > 4 || y < 0 || y > 4) return;

      return this._sendPythonCommand(
        `import hub; hub.display.pixel(${x}, ${y}, ${brightness})`,
      );
    }

    // IMU
    getAngle(args) {
      const axis = Cast.toString(args.AXIS);
      return this.angle[axis] || 0;
    }

    getAcceleration(args) {
      const axis = Cast.toString(args.AXIS);
      return this.acceleration[axis] || 0;
    }

    async resetYaw() {
      return this._sendPythonCommand("import hub; hub.motion.reset_yaw()");
    }

    // Sensors
    getDistance(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this.portValues[port]?.distance || 0;
    }

    getColor(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      const colorId = this.portValues[port]?.color || 255;
      return ColorNames[colorId] || "none";
    }

    getForce(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this.portValues[port]?.force || 0;
    }

    isForceSensorPressed(args) {
      const port = Cast.toString(args.PORT).trim().toUpperCase();
      return this.portValues[port]?.pressed || false;
    }

    // Gestures
    whenGesture(args) {
      const gesture = Cast.toString(args.GESTURE);
      return this.gestures[gesture] || false;
    }

    // Sound
    async playBeep(args) {
      const freq = Cast.toNumber(args.FREQUENCY);
      const duration = Cast.toNumber(args.DURATION);
      return this._sendPythonCommand(
        `import hub; hub.sound.beep(${freq}, ${duration}, hub.sound.SOUND_SIN)`,
      );
    }

    async stopSound() {
      return this._sendPythonCommand("import hub; hub.sound.stop()");
    }

    // Status
    getBatteryLevel() {
      return this.batteryLevel;
    }

    // Timer
    getTimer() {
      return (Date.now() - this.timerStart) / 1000;
    }

    resetTimer() {
      this.timerStart = Date.now();
    }

    // Python REPL
    async runPythonCommand(args) {
      const code = Cast.toString(args.CODE);
      return this._sendPythonCommand(code);
    }

    getReplOutput() {
      return this.replOutput;
    }

    clearReplOutput() {
      this.replOutput = "";
    }
  }

  class SpikePrimeBTCExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.peripheral = new SpikePrimeBTC(runtime, "spikeprimeBTC");
    }

    getInfo() {
      return {
        id: "spikeprimeBTC",
        name: "SPIKE Prime (BTC)",
        color1: "#FFD700",
        color2: "#D4AF37",
        blocks: [
          {
            opcode: "connectHub",
            blockType: Scratch.BlockType.COMMAND,
            text: "connect to SPIKE Prime",
          },
          {
            opcode: "disconnectHub",
            blockType: Scratch.BlockType.COMMAND,
            text: "disconnect",
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "connected?",
          },
          "---",
          {
            opcode: "motorRunFor",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] run [DIRECTION] for [VALUE] [UNIT]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              DIRECTION: {
                type: Scratch.ArgumentType.NUMBER,
                menu: "DIRECTION",
                defaultValue: 1,
              },
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              UNIT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_UNIT",
                defaultValue: "rotations",
              },
            },
          },
          {
            opcode: "motorStart",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] start motor [DIRECTION]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              DIRECTION: {
                type: Scratch.ArgumentType.NUMBER,
                menu: "DIRECTION",
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] stop motor",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "motorSetSpeed",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] set speed to [SPEED] %",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "getPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: "[PORT] position",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "displayText",
            blockType: Scratch.BlockType.COMMAND,
            text: "write [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello",
              },
            },
          },
          {
            opcode: "displayImage",
            blockType: Scratch.BlockType.COMMAND,
            text: "turn on [MATRIX]",
            arguments: {
              MATRIX: {
                type: Scratch.ArgumentType.MATRIX,
                defaultValue: "1101111011000001000101110",
              },
            },
          },
          {
            opcode: "displayPattern",
            blockType: Scratch.BlockType.COMMAND,
            text: "display pattern [PATTERN]",
            arguments: {
              PATTERN: {
                type: Scratch.ArgumentType.STRING,
                menu: "DISPLAY_PATTERN",
                defaultValue: "heart",
              },
            },
          },
          {
            opcode: "displayClear",
            blockType: Scratch.BlockType.COMMAND,
            text: "turn off pixels",
          },
          {
            opcode: "setPixel",
            blockType: Scratch.BlockType.COMMAND,
            text: "set pixel [X] [Y] to [BRIGHTNESS] %",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 },
              BRIGHTNESS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          "---",
          {
            opcode: "getAngle",
            blockType: Scratch.BlockType.REPORTER,
            text: "[AXIS] angle",
            arguments: {
              AXIS: {
                type: Scratch.ArgumentType.STRING,
                menu: "AXIS",
                defaultValue: "pitch",
              },
            },
          },
          {
            opcode: "getAcceleration",
            blockType: Scratch.BlockType.REPORTER,
            text: "acceleration [AXIS]",
            arguments: {
              AXIS: {
                type: Scratch.ArgumentType.STRING,
                menu: "AXIS_XYZ",
                defaultValue: "x",
              },
            },
          },
          {
            opcode: "resetYaw",
            blockType: Scratch.BlockType.COMMAND,
            text: "reset yaw angle",
          },
          "---",
          {
            opcode: "getDistance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[PORT] distance",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getColor",
            blockType: Scratch.BlockType.REPORTER,
            text: "[PORT] color",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "getForce",
            blockType: Scratch.BlockType.REPORTER,
            text: "[PORT] force",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "isForceSensorPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[PORT] force sensor pressed?",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "PORT",
                defaultValue: "A",
              },
            },
          },
          "---",
          {
            opcode: "whenGesture",
            blockType: Scratch.BlockType.HAT,
            text: "when hub [GESTURE]",
            arguments: {
              GESTURE: {
                type: Scratch.ArgumentType.STRING,
                menu: "GESTURE",
                defaultValue: "tapped",
              },
            },
          },
          "---",
          {
            opcode: "playBeep",
            blockType: Scratch.BlockType.COMMAND,
            text: "beep [FREQUENCY] Hz for [DURATION] ms",
            arguments: {
              FREQUENCY: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 440,
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 500,
              },
            },
          },
          {
            opcode: "stopSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop all sounds",
          },
          "---",
          {
            opcode: "getBatteryLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: "battery level %",
          },
          {
            opcode: "getTimer",
            blockType: Scratch.BlockType.REPORTER,
            text: "timer",
          },
          {
            opcode: "resetTimer",
            blockType: Scratch.BlockType.COMMAND,
            text: "reset timer",
          },
          "---",
          {
            opcode: "runPythonCommand",
            blockType: Scratch.BlockType.COMMAND,
            text: "run Python: [CODE]",
            arguments: {
              CODE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'print("Hello")',
              },
            },
          },
          {
            opcode: "getReplOutput",
            blockType: Scratch.BlockType.REPORTER,
            text: "REPL output",
          },
          {
            opcode: "clearReplOutput",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear REPL output",
          },
        ],
        menus: {
          PORT: { acceptReporters: true, items: SpikePorts },
          DIRECTION: {
            acceptReporters: false,
            items: [
              { text: "⬆️", value: "1" },
              { text: "⬇️", value: "-1" },
            ],
          },
          MOTOR_UNIT: {
            acceptReporters: false,
            items: ["rotations", "degrees", "seconds"],
          },
          AXIS: { acceptReporters: false, items: ["pitch", "roll", "yaw"] },
          AXIS_XYZ: { acceptReporters: false, items: ["x", "y", "z"] },
          DISPLAY_PATTERN: {
            acceptReporters: false,
            items: Object.keys(DisplayPatterns),
          },
          GESTURE: {
            acceptReporters: false,
            items: ["tapped", "doubletapped", "shake", "freefall"],
          },
        },
      };
    }

    // Block implementations - delegate to peripheral
    connectHub() {
      return this.peripheral.connectHub();
    }
    disconnectHub() {
      return this.peripheral.disconnectHub();
    }
    isConnected() {
      return this.peripheral.isConnected();
    }
    motorRunFor(args) {
      return this.peripheral.motorRunFor(args);
    }
    motorStart(args) {
      return this.peripheral.motorStart(args);
    }
    motorStop(args) {
      return this.peripheral.motorStop(args);
    }
    motorSetSpeed(args) {
      return this.peripheral.motorSetSpeed(args);
    }
    getPosition(args) {
      return this.peripheral.getPosition(args);
    }
    displayText(args) {
      return this.peripheral.displayText(args);
    }
    displayImage(args) {
      return this.peripheral.displayImage(args);
    }
    displayPattern(args) {
      return this.peripheral.displayPattern(args);
    }
    displayClear() {
      return this.peripheral.displayClear();
    }
    setPixel(args) {
      return this.peripheral.setPixel(args);
    }
    getAngle(args) {
      return this.peripheral.getAngle(args);
    }
    getAcceleration(args) {
      return this.peripheral.getAcceleration(args);
    }
    resetYaw() {
      return this.peripheral.resetYaw();
    }
    getDistance(args) {
      return this.peripheral.getDistance(args);
    }
    getColor(args) {
      return this.peripheral.getColor(args);
    }
    getForce(args) {
      return this.peripheral.getForce(args);
    }
    isForceSensorPressed(args) {
      return this.peripheral.isForceSensorPressed(args);
    }
    whenGesture(args) {
      return this.peripheral.whenGesture(args);
    }
    playBeep(args) {
      return this.peripheral.playBeep(args);
    }
    stopSound() {
      return this.peripheral.stopSound();
    }
    getBatteryLevel() {
      return this.peripheral.getBatteryLevel();
    }
    getTimer() {
      return this.peripheral.getTimer();
    }
    resetTimer() {
      return this.peripheral.resetTimer();
    }
    runPythonCommand(args) {
      return this.peripheral.runPythonCommand(args);
    }
    getReplOutput() {
      return this.peripheral.getReplOutput();
    }
    clearReplOutput() {
      return this.peripheral.clearReplOutput();
    }
  }

  Scratch.extensions.register(new SpikePrimeBTCExtension());
  console.log("🎉 [SPIKE Prime BTC] Extension registered successfully!");
})(Scratch);
