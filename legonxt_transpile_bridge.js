(function (Scratch) {
  "use strict";

  const Cast = Scratch.Cast;

  // ==================== CONSTANTS ====================

  const NXT_OPCODE = {
    DIRECT_CMD: 0x00,
    DIRECT_CMD_NO_REPLY: 0x80,
    SYSTEM_CMD: 0x01,
    REPLY: 0x02,

    PLAY_TONE: 0x03,
    SET_OUT_STATE: 0x04,
    SET_IN_MODE: 0x05,
    GET_OUT_STATE: 0x06,
    GET_IN_VALS: 0x07,
    RESET_POSITION: 0x0a,
    GET_BATT_LVL: 0x0b,
    LS_GET_STATUS: 0x0e,
    LS_WRITE: 0x0f,
    LS_READ: 0x10,
    READ_IO_MAP: 0x94,
    WRITE_IO_MAP: 0x95,
    OPENWRITE: 0x81,
    WRITE: 0x83,
    CLOSE: 0x84,
  };

  const SENSOR_TYPE = {
    SWITCH: 0x01,
    LIGHT_ACTIVE: 0x05,
    LIGHT_INACTIVE: 0x06,
    SOUND_DB: 0x07,
    SOUND_DBA: 0x08,
    LOW_SPEED_9V: 0x0b,
  };

  const SENSOR_MODE = {
    RAW: 0x00,
    BOOL: 0x20,
    TRANSITION_CNT: 0x40,
    PERIOD_COUNTER: 0x60,
    PCT_FULL_SCALE: 0x80,
    CELSIUS: 0xa0,
    FAHRENHEIT: 0xc0,
    ANGLE_STEPS: 0xe0,
  };

  const MOTOR_MODE = {
    IDLE: 0x00,
    ON: 0x01,
    BRAKE: 0x02,
    REGULATED: 0x04,
  };

  const MODULE_DISPLAY = 0xa0001;
  const DISPLAY_OFFSET = 119;
  const DISPLAY_WIDTH = 100;
  const DISPLAY_HEIGHT = 64;

  // ==================== HELPERS ====================

  function base64ToBytes(b64) {
    const str = atob(b64);
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  // Simple 5x7 bitmap font for screen text
  const FONT_5X7 = {
    " ": [0x00, 0x00, 0x00, 0x00, 0x00],
    A: [0x7c, 0x12, 0x11, 0x12, 0x7c],
    B: [0x7f, 0x49, 0x49, 0x49, 0x36],
    C: [0x3e, 0x41, 0x41, 0x41, 0x22],
    D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
    E: [0x7f, 0x49, 0x49, 0x49, 0x41],
    F: [0x7f, 0x09, 0x09, 0x09, 0x01],
    G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
    H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
    I: [0x00, 0x41, 0x7f, 0x41, 0x00],
    J: [0x20, 0x40, 0x41, 0x3f, 0x01],
    K: [0x7f, 0x08, 0x14, 0x22, 0x41],
    L: [0x7f, 0x40, 0x40, 0x40, 0x40],
    M: [0x7f, 0x02, 0x0c, 0x02, 0x7f],
    N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
    O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
    P: [0x7f, 0x09, 0x09, 0x09, 0x06],
    Q: [0x3e, 0x41, 0x51, 0x21, 0x5e],
    R: [0x7f, 0x09, 0x19, 0x29, 0x46],
    S: [0x46, 0x49, 0x49, 0x49, 0x31],
    T: [0x01, 0x01, 0x7f, 0x01, 0x01],
    U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
    V: [0x1f, 0x20, 0x40, 0x20, 0x1f],
    W: [0x3f, 0x40, 0x38, 0x40, 0x3f],
    X: [0x63, 0x14, 0x08, 0x14, 0x63],
    Y: [0x07, 0x08, 0x70, 0x08, 0x07],
    Z: [0x61, 0x51, 0x49, 0x45, 0x43],
    0: [0x3e, 0x51, 0x49, 0x45, 0x3e],
    1: [0x00, 0x42, 0x7f, 0x40, 0x00],
    2: [0x42, 0x61, 0x51, 0x49, 0x46],
    3: [0x21, 0x41, 0x45, 0x4b, 0x31],
    4: [0x18, 0x14, 0x12, 0x7f, 0x10],
    5: [0x27, 0x45, 0x45, 0x45, 0x39],
    6: [0x3c, 0x4a, 0x49, 0x49, 0x30],
    7: [0x01, 0x71, 0x09, 0x05, 0x03],
    8: [0x36, 0x49, 0x49, 0x49, 0x36],
    9: [0x06, 0x49, 0x49, 0x29, 0x1e],
    "!": [0x00, 0x00, 0x5f, 0x00, 0x00],
    "?": [0x02, 0x01, 0x51, 0x09, 0x06],
    ".": [0x00, 0x60, 0x60, 0x00, 0x00],
    ",": [0x00, 0x80, 0x60, 0x00, 0x00],
    ":": [0x00, 0x36, 0x36, 0x00, 0x00],
    "-": [0x08, 0x08, 0x08, 0x08, 0x08],
    "+": [0x08, 0x08, 0x3e, 0x08, 0x08],
    "=": [0x14, 0x14, 0x14, 0x14, 0x14],
  };

  // ==================== NXC TRANSPILER ====================

  class NXCTranspiler {
    constructor() {
      this.code = [];
      this.indent = 0;
      this.variables = new Map();
      this.broadcasts = [];
      this.scriptCounter = 1;
      this.mainScripts = [];
      this.sensorSetup = new Set();
    }

    reset() {
      console.log("🔄 [TRANSPILER] Resetting transpiler state");
      this.code = [];
      this.indent = 0;
      this.variables.clear();
      this.broadcasts = [];
      this.scriptCounter = 1;
      this.mainScripts = [];
      this.sensorSetup.clear();
    }

    addLine(line) {
      const spaces = "    ".repeat(this.indent);
      this.code.push(spaces + line);
    }

    increaseIndent() {
      this.indent++;
    }

    decreaseIndent() {
      this.indent = Math.max(0, this.indent - 1);
    }

    getCode() {
      return this.code.join("\n");
    }

    sanitizeName(name) {
      if (!name) return "unnamed";
      return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }

    isNumeric(value) {
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        return !isNaN(value) && !isNaN(parseFloat(value));
      }
      return false;
    }

    getFieldValue(block, fieldName) {
      if (block.fields && block.fields[fieldName]) {
        const field = block.fields[fieldName];
        return field.value || field.id || field.name;
      }
      return null;
    }

    getSubstackId(block, substackName) {
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

    getInputValue(block, inputName, blocks) {
      const input = block.inputs[inputName];
      if (!input) return "0";

      if (typeof input === "object" && !Array.isArray(input)) {
        if (input.block) {
          const refBlock = blocks._blocks[input.block];
          if (refBlock) return this.evaluateBlock(refBlock, blocks);
        }
        if (input.shadow) {
          const shadowBlock = blocks._blocks[input.shadow];
          if (shadowBlock) return this.evaluateBlock(shadowBlock, blocks);
        }
        return "0";
      }

      if (!Array.isArray(input)) return "0";

      const inputType = input[0];
      const inputData = input[1];

      if (inputType === 1 || inputType === 2 || inputType === 3) {
        if (Array.isArray(inputData)) {
          const primitiveType = inputData[0];
          const primitiveValue = inputData[1];

          if (
            primitiveType === 4 ||
            primitiveType === 5 ||
            primitiveType === 6 ||
            primitiveType === 7
          ) {
            return String(primitiveValue);
          } else if (primitiveType === 10) {
            if (this.isNumeric(primitiveValue)) {
              return String(primitiveValue);
            }
            return '"' + primitiveValue + '"';
          }
        } else if (typeof inputData === "string") {
          const refBlock = blocks._blocks[inputData];
          if (refBlock) return this.evaluateBlock(refBlock, blocks);
        }

        if (
          inputType === 3 &&
          Array.isArray(inputData) &&
          inputData.length >= 2
        ) {
          if (typeof inputData[0] === "string") {
            const refBlock = blocks._blocks[inputData[0]];
            if (refBlock) return this.evaluateBlock(refBlock, blocks);
          }

          const shadowData = inputData[1];
          if (Array.isArray(shadowData)) {
            const primitiveType = shadowData[0];
            const primitiveValue = shadowData[1];

            if (
              primitiveType === 4 ||
              primitiveType === 5 ||
              primitiveType === 6 ||
              primitiveType === 7
            ) {
              return String(primitiveValue);
            } else if (primitiveType === 10) {
              if (this.isNumeric(primitiveValue)) {
                return String(primitiveValue);
              }
              return '"' + primitiveValue + '"';
            }
          }
        }
      }

      return "0";
    }

    evaluateBlock(block, blocks) {
      console.log(`📊 [TRANSPILER] Evaluating block: ${block.opcode}`);

      // Numbers
      if (
        block.opcode === "math_number" ||
        block.opcode === "math_whole_number" ||
        block.opcode === "math_positive_number" ||
        block.opcode === "math_integer"
      ) {
        const num = this.getFieldValue(block, "NUM");
        return num || "0";
      }
      // Text
      else if (block.opcode === "text") {
        const text = this.getFieldValue(block, "TEXT");
        if (this.isNumeric(text)) return String(text);
        return '"' + (text || "").replace(/"/g, '\\"') + '"';
      }
      // Variables
      else if (block.opcode === "data_variable") {
        const varName = this.getFieldValue(block, "VARIABLE");
        return this.sanitizeName(varName);
      }
      // NXT Sensor reporters
      else if (block.opcode === "motorPosition") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return `MotorRotationCount(OUT_${port})`;
      } else if (block.opcode === "touchPressed") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`touch_${port}`);
        return `(SENSOR_${sensorNum} == 1)`;
      } else if (block.opcode === "lightValue") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`light_${port}`);
        return `Sensor(IN_${sensorNum})`;
      } else if (block.opcode === "soundValue") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`sound_${port}`);
        return `Sensor(IN_${sensorNum})`;
      } else if (block.opcode === "ultrasonicDist") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`ultrasonic_${port}`);
        return `SensorUS(IN_${sensorNum})`;
      } else if (block.opcode === "battery") {
        return "BatteryLevel()";
      }
      // Operators
      else if (block.opcode === "operator_gt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} > ${op2})`;
      } else if (block.opcode === "operator_lt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} < ${op2})`;
      } else if (block.opcode === "operator_equals") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} == ${op2})`;
      } else if (block.opcode === "operator_and") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} && ${op2})`;
      } else if (block.opcode === "operator_or") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} || ${op2})`;
      } else if (block.opcode === "operator_not") {
        const op = this.getInputValue(block, "OPERAND", blocks);
        return `!(${op})`;
      } else if (block.opcode === "operator_add") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} + ${num2})`;
      } else if (block.opcode === "operator_subtract") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} - ${num2})`;
      } else if (block.opcode === "operator_multiply") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} * ${num2})`;
      } else if (block.opcode === "operator_divide") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} / ${num2})`;
      } else if (block.opcode === "operator_random") {
        const from = this.getInputValue(block, "FROM", blocks);
        const to = this.getInputValue(block, "TO", blocks);
        return `Random(${to} - ${from}) + ${from}`;
      } else if (block.opcode === "operator_mod") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} % ${num2})`;
      } else if (block.opcode === "operator_round") {
        const num = this.getInputValue(block, "NUM", blocks);
        return `round(${num})`;
      } else if (block.opcode === "operator_mathop") {
        const operator = this.getFieldValue(block, "OPERATOR");
        const num = this.getInputValue(block, "NUM", blocks);

        const mathOps = {
          abs: `abs(${num})`,
          floor: `floor(${num})`,
          ceiling: `ceil(${num})`,
          sqrt: `sqrt(${num})`,
          sin: `sin(${num})`,
          cos: `cos(${num})`,
          tan: `tan(${num})`,
          asin: `asin(${num})`,
          acos: `acos(${num})`,
          atan: `atan(${num})`,
          ln: `log(${num})`,
          log: `log10(${num})`,
          "e ^": `exp(${num})`,
          "10 ^": `pow(10, ${num})`,
        };

        return mathOps[operator] || `(${num})`;
      }

      return "0";
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      console.log(`🔨 [TRANSPILER] Processing block: ${opcode}`);

      // NXT Motor blocks
      if (opcode === "motorOn") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const power = this.getInputValue(block, "POWER", blocks);
        this.addLine(`if (${power} > 0) {`);
        this.increaseIndent();
        this.addLine(`OnFwd(OUT_${port}, ${power});`);
        this.decreaseIndent();
        this.addLine(`} else {`);
        this.increaseIndent();
        this.addLine(`OnRev(OUT_${port}, -${power});`);
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "motorDegrees") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const power = this.getInputValue(block, "POWER", blocks);
        const degrees = this.getInputValue(block, "DEG", blocks);
        this.addLine(`RotateMotor(OUT_${port}, ${power}, ${degrees});`);
      } else if (opcode === "motorRotations") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const power = this.getInputValue(block, "POWER", blocks);
        const rotations = this.getInputValue(block, "ROT", blocks);
        this.addLine(
          `RotateMotor(OUT_${port}, ${power}, (${rotations}) * 360);`,
        );
      } else if (opcode === "motorStop") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const action = this.getInputValue(block, "ACTION", blocks).replace(
          /"/g,
          "",
        );
        if (action === "brake") {
          this.addLine(`Off(OUT_${port});`);
        } else {
          this.addLine(`Float(OUT_${port});`);
        }
      } else if (opcode === "resetMotor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        this.addLine(`ResetRotationCount(OUT_${port});`);
      }

      // Sensor setup blocks
      else if (opcode === "setupTouch") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorTouch(IN_${sensorNum});`);
        this.sensorSetup.add(`touch_${port}`);
      } else if (opcode === "setupLight") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const led = this.getInputValue(block, "LED", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        if (led === "on") {
          this.addLine(`SetSensorLight(IN_${sensorNum});`);
        } else {
          this.addLine(`SetSensorLowspeed(IN_${sensorNum});`);
        }
        this.sensorSetup.add(`light_${port}`);
      } else if (opcode === "setupSound") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorSound(IN_${sensorNum});`);
        this.sensorSetup.add(`sound_${port}`);
      } else if (opcode === "setupUltrasonic") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorLowspeed(IN_${sensorNum});`);
        this.sensorSetup.add(`ultrasonic_${port}`);
      }

      // Sound blocks
      else if (opcode === "playTone") {
        const freq = this.getInputValue(block, "FREQ", blocks);
        const ms = this.getInputValue(block, "MS", blocks);
        this.addLine(`PlayTone(${freq}, ${ms});`);
      } else if (opcode === "playNote") {
        const note = this.getInputValue(block, "NOTE", blocks).replace(
          /"/g,
          "",
        );
        const beats = this.getInputValue(block, "BEATS", blocks);
        const noteFreqs = {
          C4: 262,
          "C#4": 277,
          D4: 294,
          "D#4": 311,
          E4: 330,
          F4: 349,
          "F#4": 370,
          G4: 392,
          "G#4": 415,
          A4: 440,
          "A#4": 466,
          B4: 494,
          C5: 523,
          "C#5": 554,
          D5: 587,
          "D#5": 622,
          E5: 659,
          F5: 698,
          "F#5": 740,
          G5: 784,
          "G#5": 831,
          A5: 880,
          "A#5": 932,
          B5: 988,
        };
        const freq = noteFreqs[note] || 440;
        this.addLine(`PlayTone(${freq}, (${beats}) * 500);`);
      }

      // Screen blocks
      else if (opcode === "clearScreen") {
        this.addLine(`ClearScreen();`);
      } else if (opcode === "drawText") {
        const text = this.getInputValue(block, "TEXT", blocks);
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine(`TextOut(${x}, LCD_LINE1 + ${y}, ${text});`);
      } else if (opcode === "drawPixel") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const state = this.getInputValue(block, "STATE", blocks).replace(
          /"/g,
          "",
        );
        if (state === "on") {
          this.addLine(`PointOut(${x}, ${y});`);
        }
      } else if (opcode === "drawLine") {
        const x1 = this.getInputValue(block, "X1", blocks);
        const y1 = this.getInputValue(block, "Y1", blocks);
        const x2 = this.getInputValue(block, "X2", blocks);
        const y2 = this.getInputValue(block, "Y2", blocks);
        this.addLine(`LineOut(${x1}, ${y1}, ${x2}, ${y2});`);
      } else if (opcode === "drawRect") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const w = this.getInputValue(block, "W", blocks);
        const h = this.getInputValue(block, "H", blocks);
        const fill = this.getInputValue(block, "FILL", blocks).replace(
          /"/g,
          "",
        );
        if (fill === "filled") {
          this.addLine(`RectOut(${x}, ${y}, ${w}, ${h}, DRAW_OPT_FILL_SHAPE);`);
        } else {
          this.addLine(`RectOut(${x}, ${y}, ${w}, ${h});`);
        }
      }

      // Standard Scratch blocks
      else if (opcode === "motion_movesteps") {
        const steps = this.getInputValue(block, "STEPS", blocks);
        this.addLine(`// Move ${steps} steps (using motors B+C)`);
        this.addLine(`OnFwd(OUT_BC, 75);`);
        this.addLine(`Wait((${steps}) * 10);`);
        this.addLine(`Off(OUT_BC);`);
      } else if (opcode === "motion_turnright") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(`// Turn right ${degrees} degrees`);
        this.addLine(`OnFwd(OUT_B, 50); OnRev(OUT_C, 50);`);
        this.addLine(`Wait((${degrees}) * 5);`);
        this.addLine(`Off(OUT_BC);`);
      } else if (opcode === "motion_turnleft") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(`// Turn left ${degrees} degrees`);
        this.addLine(`OnFwd(OUT_C, 50); OnRev(OUT_B, 50);`);
        this.addLine(`Wait((${degrees}) * 5);`);
        this.addLine(`Off(OUT_BC);`);
      }

      // Control blocks
      else if (opcode === "control_wait") {
        const duration = this.getInputValue(block, "DURATION", blocks);
        this.addLine(`Wait((${duration}) * 1000);`);
      } else if (opcode === "control_repeat") {
        const times = this.getInputValue(block, "TIMES", blocks);
        this.addLine(`repeat(${times}) {`);
        this.increaseIndent();

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_forever") {
        this.addLine(`while(true) {`);
        this.increaseIndent();

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_if") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`if (${condition}) {`);
        this.increaseIndent();

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_if_else") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`if (${condition}) {`);
        this.increaseIndent();

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }

        this.decreaseIndent();
        this.addLine(`} else {`);
        this.increaseIndent();

        const substack2Id = this.getSubstackId(block, "SUBSTACK2");
        if (substack2Id) {
          this.processBlockChain(substack2Id, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_repeat_until") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`until (${condition}) {`);
        this.increaseIndent();

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      } else if (opcode === "control_stop") {
        const stopOption = this.getFieldValue(block, "STOP_OPTION") || "all";
        if (stopOption === "all") {
          this.addLine(`Stop(true);`);
        } else {
          this.addLine(`return;`);
        }
      }

      // Data blocks
      else if (opcode === "data_setvariableto") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        const sanitized = this.sanitizeName(varName);
        this.variables.set(varName, sanitized);
        this.addLine(`${sanitized} = ${value};`);
      } else if (opcode === "data_changevariableby") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        const sanitized = this.sanitizeName(varName);
        this.variables.set(varName, sanitized);
        this.addLine(`${sanitized} += ${value};`);
      }

      // Looks blocks
      else if (opcode === "looks_say" || opcode === "looks_sayforsecs") {
        const message = this.getInputValue(block, "MESSAGE", blocks);
        this.addLine(`TextOut(0, LCD_LINE1, ${message});`);
        if (opcode === "looks_sayforsecs") {
          const secs = this.getInputValue(block, "SECS", blocks);
          this.addLine(`Wait((${secs}) * 1000);`);
        }
      }
    }

    processBlockChain(blockId, blocks) {
      let currentId = blockId;
      let chainLength = 0;

      while (currentId) {
        const block = blocks._blocks[currentId];
        if (!block) break;

        chainLength++;
        if (chainLength > 1000) {
          console.warn("⚠️ [TRANSPILER] Chain length exceeded 1000, breaking");
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }
    }

    processHatBlock(hatBlock, blocks) {
      const opcode = hatBlock.opcode;
      console.log(`🎩 [TRANSPILER] Processing hat block: ${opcode}`);

      if (opcode === "event_whenflagclicked") {
        let currentBlockId = hatBlock.next;
        while (currentBlockId) {
          const block = blocks._blocks[currentBlockId];
          if (!block) break;
          this.processBlock(block, blocks);
          currentBlockId = block.next;
        }
      }
    }

    processTarget(target) {
      console.log(`🎯 [TRANSPILER] Processing target: ${target.getName()}`);
      const blocks = target.blocks;
      const blockArray = blocks._blocks;

      // Find green flag blocks
      for (const blockId in blockArray) {
        const block = blockArray[blockId];
        if (block.opcode === "event_whenflagclicked") {
          this.processHatBlock(block, blocks);
        }
      }
    }

    generateHeader() {
      this.addLine("// Generated from Scratch by LEGO NXT Extension");
      this.addLine(`// Generated: ${new Date().toISOString()}`);
      this.addLine("");
    }

    generateVariables() {
      if (this.variables.size > 0) {
        console.log(
          `📦 [TRANSPILER] Generating ${this.variables.size} variables`,
        );
        this.addLine("// Variables");
        for (const [original, sanitized] of this.variables) {
          this.addLine(`int ${sanitized} = 0;`);
        }
        this.addLine("");
      }
    }

    generateSensorSetup() {
      if (this.sensorSetup.size > 0) {
        console.log(
          `🔧 [TRANSPILER] Generating sensor setup for ${this.sensorSetup.size} sensors`,
        );
        this.addLine("// Initialize sensors");
        this.addLine("sub InitSensors() {");
        this.increaseIndent();

        for (const sensor of this.sensorSetup) {
          const [type, port] = sensor.split("_");
          const sensorNum = port.replace("S", "");

          if (type === "touch") {
            this.addLine(`SetSensorTouch(IN_${sensorNum});`);
          } else if (type === "light") {
            this.addLine(`SetSensorLight(IN_${sensorNum});`);
          } else if (type === "sound") {
            this.addLine(`SetSensorSound(IN_${sensorNum});`);
          } else if (type === "ultrasonic") {
            this.addLine(`SetSensorLowspeed(IN_${sensorNum});`);
          }
        }

        this.decreaseIndent();
        this.addLine("}");
        this.addLine("");
      }
    }

    transpileProject() {
      console.log("=== 🚀 STARTING NXC TRANSPILATION ===");
      this.reset();

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        console.log(`📊 [TRANSPILER] Found ${targets.length} targets`);

        // First pass: collect all info
        const tempCode = this.code;
        this.code = [];

        // Process all targets to collect variables and sensor setup
        for (const target of targets) {
          this.processTarget(target);
        }

        const bodyCode = this.code.join("\n");
        console.log(
          `📝 [TRANSPILER] Generated ${bodyCode.split("\n").length} lines of body code`,
        );

        // Second pass: generate final code
        this.code = [];

        this.generateHeader();
        this.generateVariables();
        this.generateSensorSetup();

        // Main task
        this.addLine("task main() {");
        this.increaseIndent();

        // Call sensor initialization if needed
        if (this.sensorSetup.size > 0) {
          this.addLine("InitSensors();");
          this.addLine("");
        }

        // Add the body
        const bodyLines = bodyCode.split("\n");
        for (const line of bodyLines) {
          this.code.push(line);
        }

        this.decreaseIndent();
        this.addLine("}");

        const finalCode = this.getCode();

        console.log("=== ✅ NXC TRANSPILATION COMPLETE ===");
        console.log(`📄 Total lines: ${finalCode.split("\n").length}`);

        return finalCode;
      } catch (error) {
        console.error("❌ [TRANSPILER] ERROR during transpilation:", error);
        throw error;
      }
    }
  }

  // ==================== PERIPHERAL ====================

  class NXTPeripheral {
    constructor() {
      this.ws = null;
      this.connected = false;
      this.readBuffer = new Uint8Array(0);

      // State
      this.battery = 0;
      this.sensors = { S1: 0, S2: 0, S3: 0, S4: 0 };
      this.motors = { A: 0, B: 0, C: 0 };
      this.screenBuffer = new Array(64)
        .fill(0)
        .map(() => new Array(100).fill(0));

      // Request tracking
      this.requests = new Map();
      this.nextId = 0;
    }

    async connect(url) {
      return new Promise((resolve, reject) => {
        const wsUrl = url.startsWith("ws://") ? url : `ws://${url}`;
        console.log(`🔌 [NXT] Connecting to ${wsUrl}...`);

        this.ws = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
          this.ws.close();
          reject(new Error("Connection timeout"));
        }, 5000);

        this.ws.onopen = async () => {
          clearTimeout(timeout);
          this.connected = true;
          console.log("✅ [NXT] Connected!");

          try {
            await this.getBattery();
            resolve();
          } catch (e) {
            this.disconnect();
            reject(e);
          }
        };

        this.ws.onmessage = (e) => {
          const bytes = base64ToBytes(e.data);
          this.handleData(bytes);
        };

        this.ws.onerror = () => reject(new Error("WebSocket error"));
        this.ws.onclose = () => {
          this.connected = false;
          console.log("❌ [NXT] Disconnected");
        };
      });
    }

    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.connected = false;
    }

    async send(opcode, payload = [], needsReply = false, isSystemCmd = false) {
      if (!this.connected) {
        console.warn("⚠️ [NXT] Not connected, skipping send");
        return null;
      }

      let cmd;
      if (isSystemCmd) {
        cmd = needsReply ? NXT_OPCODE.SYSTEM_CMD : NXT_OPCODE.SYSTEM_CMD;
      } else {
        cmd = needsReply
          ? NXT_OPCODE.DIRECT_CMD
          : NXT_OPCODE.DIRECT_CMD_NO_REPLY;
      }

      const telegram = new Uint8Array([cmd, opcode, ...payload]);

      const packet = new Uint8Array(telegram.length + 2);
      packet[0] = telegram.length & 0xff;
      packet[1] = (telegram.length >> 8) & 0xff;
      packet.set(telegram, 2);

      console.log(
        `📤 [NXT] Sending opcode ${opcode.toString(16)}, needsReply=${needsReply}`,
      );

      if (needsReply) {
        const id = this.nextId++;
        const promise = new Promise((resolve, reject) => {
          this.requests.set(id, { opcode, resolve, reject });
          setTimeout(() => {
            if (this.requests.has(id)) {
              this.requests.delete(id);
              console.warn(`⏱️ [NXT] Timeout for request ${id}`);
              reject(new Error("Timeout"));
            }
          }, 3000);
        });

        this.ws.send(bytesToBase64(packet));
        return await promise;
      } else {
        this.ws.send(bytesToBase64(packet));
        return null;
      }
    }

    handleData(data) {
      const combined = new Uint8Array(this.readBuffer.length + data.length);
      combined.set(this.readBuffer);
      combined.set(data, this.readBuffer.length);
      this.readBuffer = combined;

      while (this.readBuffer.length >= 2) {
        const len = this.readBuffer[0] | (this.readBuffer[1] << 8);
        if (this.readBuffer.length < len + 2) break;

        const packet = this.readBuffer.slice(2, len + 2);
        this.readBuffer = this.readBuffer.slice(len + 2);
        this.parseReply(packet);
      }
    }

    parseReply(data) {
      if (data.length < 3) return;
      if (data[0] !== NXT_OPCODE.REPLY) return;

      const opcode = data[1];
      const status = data[2];

      console.log(
        `📥 [NXT] Reply: opcode=${opcode.toString(16)}, status=${status.toString(16)}`,
      );

      if (status !== 0x00) {
        console.warn(
          `⚠️ [NXT] Error: ${status.toString(16)} for opcode ${opcode.toString(16)}`,
        );
        this.resolveRequest(opcode, null);
        return;
      }

      switch (opcode) {
        case NXT_OPCODE.GET_BATT_LVL:
          if (data.length >= 5) {
            this.battery = data[3] | (data[4] << 8);
            console.log(`🔋 [NXT] Battery: ${this.battery}mV`);
            this.resolveRequest(opcode, this.battery);
          }
          break;

        case NXT_OPCODE.GET_IN_VALS:
          if (data.length >= 16) {
            const port = ["S1", "S2", "S3", "S4"][data[3]];
            const valid = data[4] === 1;
            if (valid) {
              const val = data[14] | (data[15] << 8);
              this.sensors[port] = val > 32767 ? val - 65536 : val;
              console.log(`📡 [NXT] Sensor ${port}: ${this.sensors[port]}`);
              this.resolveRequest(opcode, this.sensors[port]);
            }
          }
          break;

        case NXT_OPCODE.GET_OUT_STATE:
          if (data.length >= 25) {
            const port = ["A", "B", "C"][data[3]];
            const rot = this.toSigned32(data[23], data[24], data[25], data[26]);
            this.motors[port] = ((rot % 360) + 360) % 360;
            console.log(`⚙️ [NXT] Motor ${port}: ${this.motors[port]}°`);
            this.resolveRequest(opcode, this.motors[port]);
          }
          break;

        case NXT_OPCODE.LS_READ:
          if (data.length >= 5) {
            const bytes = Array.from(data.slice(4, 4 + data[3]));
            console.log(`📊 [NXT] LS Read: ${bytes.length} bytes`);
            this.resolveRequest(opcode, bytes);
          }
          break;

        case NXT_OPCODE.READ_IO_MAP:
          if (data.length >= 7) {
            const bytesRead = data[3] | (data[4] << 8);
            const ioData = Array.from(data.slice(5, 5 + bytesRead));
            console.log(`💾 [NXT] IO Map Read: ${bytesRead} bytes`);
            this.resolveRequest(opcode, ioData);
          }
          break;

        case NXT_OPCODE.WRITE_IO_MAP:
          if (data.length >= 7) {
            const bytesWritten = data[5] | (data[6] << 8);
            console.log(`💾 [NXT] IO Map Written: ${bytesWritten} bytes`);
            this.resolveRequest(opcode, bytesWritten);
          }
          break;

        case NXT_OPCODE.OPENWRITE:
          if (data.length >= 4) {
            const handle = data[3];
            console.log(`📂 [NXT] File opened: handle=${handle}`);
            this.resolveRequest(opcode, handle);
          }
          break;

        case NXT_OPCODE.WRITE:
          if (data.length >= 6) {
            const bytesWritten = data[4] | (data[5] << 8);
            console.log(`📝 [NXT] File written: ${bytesWritten} bytes`);
            this.resolveRequest(opcode, bytesWritten);
          }
          break;

        case NXT_OPCODE.CLOSE:
          console.log(`📂 [NXT] File closed`);
          this.resolveRequest(opcode, true);
          break;
      }
    }

    resolveRequest(opcode, value) {
      for (const [id, req] of this.requests) {
        if (req.opcode === opcode) {
          req.resolve(value);
          this.requests.delete(id);
          break;
        }
      }
    }

    toSigned8(byte) {
      return byte > 127 ? byte - 256 : byte;
    }

    toSigned32(b0, b1, b2, b3) {
      const val = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);
      return val > 2147483647 ? val - 4294967296 : val;
    }

    // ==================== MOTOR COMMANDS ====================

    async setMotor(port, power, brake = true) {
      const ports = { A: 0, B: 1, C: 2 };
      const p = ports[port];

      let pwr = Cast.toNumber(power);
      pwr = Math.max(-100, Math.min(100, Math.round(pwr)));
      const pwrByte = pwr < 0 ? 256 + pwr : pwr;

      const mode =
        pwr === 0
          ? brake
            ? MOTOR_MODE.ON | MOTOR_MODE.BRAKE | MOTOR_MODE.REGULATED
            : MOTOR_MODE.IDLE
          : MOTOR_MODE.ON | MOTOR_MODE.REGULATED;

      await this.send(NXT_OPCODE.SET_OUT_STATE, [
        p,
        pwrByte,
        mode,
        0x01,
        0,
        0x20,
        0,
        0,
        0,
        0,
      ]);
    }

    async motorForDegrees(port, power, degrees) {
      const ports = { A: 0, B: 1, C: 2 };
      let pwr = Cast.toNumber(power);
      pwr = Math.max(-100, Math.min(100, Math.round(pwr)));
      const pwrByte = pwr < 0 ? 256 + pwr : pwr;

      const deg = Math.abs(Cast.toNumber(degrees));

      await this.send(NXT_OPCODE.SET_OUT_STATE, [
        ports[port],
        pwrByte,
        MOTOR_MODE.ON | MOTOR_MODE.BRAKE | MOTOR_MODE.REGULATED,
        0x01,
        0,
        0x20,
        deg & 0xff,
        (deg >> 8) & 0xff,
        (deg >> 16) & 0xff,
        (deg >> 24) & 0xff,
      ]);

      const estimatedTime = Math.abs(deg / Math.abs(pwr)) * 1000 + 200;
      await this.sleep(estimatedTime);
    }

    async getMotorPos(port) {
      const ports = { A: 0, B: 1, C: 2 };
      return await this.send(NXT_OPCODE.GET_OUT_STATE, [ports[port]], true);
    }

    async resetMotorPos(port) {
      const ports = { A: 0, B: 1, C: 2 };
      await this.send(NXT_OPCODE.RESET_POSITION, [ports[port], 0]);
    }

    // ==================== SENSOR COMMANDS ====================

    async setupTouch(port) {
      const p = parseInt(port.replace("S", "")) - 1;
      await this.send(NXT_OPCODE.SET_IN_MODE, [
        p,
        SENSOR_TYPE.SWITCH,
        SENSOR_MODE.BOOL,
      ]);
      await this.sleep(100);
    }

    async setupLight(port, led = true) {
      const p = parseInt(port.replace("S", "")) - 1;
      const type = led ? SENSOR_TYPE.LIGHT_ACTIVE : SENSOR_TYPE.LIGHT_INACTIVE;
      await this.send(NXT_OPCODE.SET_IN_MODE, [p, type, SENSOR_MODE.RAW]);
      await this.sleep(100);
    }

    async setupSound(port, dBA = true) {
      const p = parseInt(port.replace("S", "")) - 1;
      const type = dBA ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
      await this.send(NXT_OPCODE.SET_IN_MODE, [
        p,
        type,
        SENSOR_MODE.PCT_FULL_SCALE,
      ]);
      await this.sleep(100);
    }

    async setupUltrasonic(port) {
      const p = parseInt(port.replace("S", "")) - 1;
      await this.send(NXT_OPCODE.SET_IN_MODE, [
        p,
        SENSOR_TYPE.LOW_SPEED_9V,
        SENSOR_MODE.RAW,
      ]);
      await this.sleep(200);
    }

    async getSensor(port) {
      const p = parseInt(port.replace("S", "")) - 1;
      return await this.send(NXT_OPCODE.GET_IN_VALS, [p], true);
    }

    async getUltrasonic(port) {
      const p = parseInt(port.replace("S", "")) - 1;

      await this.send(NXT_OPCODE.LS_WRITE, [p, 2, 1, 0x02, 0x42]);
      await this.sleep(50);

      const data = await this.send(NXT_OPCODE.LS_READ, [p], true);
      return data && data.length > 0 ? data[0] : 0;
    }

    // ==================== SCREEN COMMANDS ====================

    async readIOMap(moduleId, offset, bytesToRead) {
      const payload = [
        moduleId & 0xff,
        (moduleId >> 8) & 0xff,
        (moduleId >> 16) & 0xff,
        (moduleId >> 24) & 0xff,
        offset & 0xff,
        (offset >> 8) & 0xff,
        bytesToRead & 0xff,
        (bytesToRead >> 8) & 0xff,
      ];

      return await this.send(NXT_OPCODE.READ_IO_MAP, payload, true, true);
    }

    async writeIOMap(moduleId, offset, data) {
      const payload = [
        moduleId & 0xff,
        (moduleId >> 8) & 0xff,
        (moduleId >> 16) & 0xff,
        (moduleId >> 24) & 0xff,
        offset & 0xff,
        (offset >> 8) & 0xff,
        data.length & 0xff,
        (data.length >> 8) & 0xff,
        ...data,
      ];

      return await this.send(NXT_OPCODE.WRITE_IO_MAP, payload, true, true);
    }

    async readScreen() {
      console.log("📸 [NXT] Reading screen...");
      const allData = [];

      for (let i = 0; i < 20; i++) {
        const offset = DISPLAY_OFFSET + i * 40;
        const chunk = await this.readIOMap(MODULE_DISPLAY, offset, 40);
        if (chunk) {
          allData.push(...chunk);
        } else {
          console.error(`❌ [NXT] Failed to read screen chunk ${i}`);
          return null;
        }
        await this.sleep(10);
      }

      if (allData.length !== 800) {
        console.error(
          `❌ [NXT] Incomplete screen data: ${allData.length} bytes`,
        );
        return null;
      }

      const pixels = [];
      for (let row = 0; row < 8; row++) {
        for (let x = 0; x < 100; x++) {
          const byte = allData[row * 100 + x];
          for (let bit = 0; bit < 8; bit++) {
            const y = row * 8 + bit;
            if (!pixels[y]) pixels[y] = [];
            pixels[y][x] = (byte >> bit) & 1;
          }
        }
      }

      this.screenBuffer = pixels;
      console.log("✅ [NXT] Screen captured");
      return this.createScreenDataURI(pixels);
    }

    async writeScreen(pixels) {
      console.log("✍️ [NXT] Writing screen...");
      const bytes = new Array(800).fill(0);

      for (let row = 0; row < 8; row++) {
        for (let x = 0; x < 100; x++) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
            const y = row * 8 + bit;
            if (pixels[y] && pixels[y][x]) {
              byte |= 1 << bit;
            }
          }
          bytes[row * 100 + x] = byte;
        }
      }

      for (let i = 0; i < bytes.length; i += 32) {
        const chunk = bytes.slice(i, Math.min(i + 32, bytes.length));
        const offset = DISPLAY_OFFSET + i;
        await this.writeIOMap(MODULE_DISPLAY, offset, chunk);
        await this.sleep(10);
      }

      this.screenBuffer = pixels;
      console.log("✅ [NXT] Screen written");
    }

    async clearScreen() {
      const pixels = new Array(64).fill(0).map(() => new Array(100).fill(0));
      await this.writeScreen(pixels);
    }

    async updateDisplay() {
      await this.writeScreen(this.screenBuffer);
    }

    async drawPixel(x, y, on = true) {
      x = Math.floor(Cast.toNumber(x));
      y = Math.floor(Cast.toNumber(y));

      if (x < 0 || x >= 100 || y < 0 || y >= 64) return;

      this.screenBuffer[y][x] = on ? 1 : 0;
    }

    async drawLine(x1, y1, x2, y2, on = true) {
      x1 = Math.floor(Cast.toNumber(x1));
      y1 = Math.floor(Cast.toNumber(y1));
      x2 = Math.floor(Cast.toNumber(x2));
      y2 = Math.floor(Cast.toNumber(y2));

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? 1 : -1;
      const sy = y1 < y2 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        if (x1 >= 0 && x1 < 100 && y1 >= 0 && y1 < 64) {
          this.screenBuffer[y1][x1] = on ? 1 : 0;
        }

        if (x1 === x2 && y1 === y2) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x1 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y1 += sy;
        }
      }
    }

    async drawRect(x, y, w, h, filled = false, on = true) {
      x = Math.floor(Cast.toNumber(x));
      y = Math.floor(Cast.toNumber(y));
      w = Math.floor(Cast.toNumber(w));
      h = Math.floor(Cast.toNumber(h));

      if (filled) {
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < 100 && py >= 0 && py < 64) {
              this.screenBuffer[py][px] = on ? 1 : 0;
            }
          }
        }
      } else {
        for (let dx = 0; dx < w; dx++) {
          if (x + dx >= 0 && x + dx < 100) {
            if (y >= 0 && y < 64) this.screenBuffer[y][x + dx] = on ? 1 : 0;
            if (y + h - 1 >= 0 && y + h - 1 < 64)
              this.screenBuffer[y + h - 1][x + dx] = on ? 1 : 0;
          }
        }
        for (let dy = 0; dy < h; dy++) {
          if (y + dy >= 0 && y + dy < 64) {
            if (x >= 0 && x < 100) this.screenBuffer[y + dy][x] = on ? 1 : 0;
            if (x + w - 1 >= 0 && x + w - 1 < 100)
              this.screenBuffer[y + dy][x + w - 1] = on ? 1 : 0;
          }
        }
      }
    }

    async drawText(text, x, y, on = true) {
      x = Math.floor(Cast.toNumber(x));
      y = Math.floor(Cast.toNumber(y));
      const str = Cast.toString(text).toUpperCase();

      let cursorX = x;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const glyph = FONT_5X7[char] || FONT_5X7[" "];

        for (let col = 0; col < 5; col++) {
          const byte = glyph[col];
          for (let row = 0; row < 7; row++) {
            const px = cursorX + col;
            const py = y + row;
            if (px >= 0 && px < 100 && py >= 0 && py < 64) {
              const pixelOn = (byte >> row) & 1;
              this.screenBuffer[py][px] = pixelOn ? (on ? 1 : 0) : 0;
            }
          }
        }

        cursorX += 6;
        if (cursorX >= 100) break;
      }
    }

    async drawPattern(pattern) {
      const patterns = {
        checkerboard: () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 100; x++) {
              pixels[y][x] = (x + y) % 2 ? 1 : 0;
            }
          }
          return pixels;
        },
        "stripes-h": () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let y = 0; y < 64; y++) {
            const fill = y % 4 < 2 ? 1 : 0;
            for (let x = 0; x < 100; x++) {
              pixels[y][x] = fill;
            }
          }
          return pixels;
        },
        "stripes-v": () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 100; x++) {
              pixels[y][x] = x % 4 < 2 ? 1 : 0;
            }
          }
          return pixels;
        },
        grid: () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 100; x++) {
              pixels[y][x] = x % 8 === 0 || y % 8 === 0 ? 1 : 0;
            }
          }
          return pixels;
        },
        dots: () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let y = 0; y < 64; y += 4) {
            for (let x = 0; x < 100; x += 4) {
              pixels[y][x] = 1;
            }
          }
          return pixels;
        },
        border: () => {
          const pixels = new Array(64)
            .fill(0)
            .map(() => new Array(100).fill(0));
          for (let x = 0; x < 100; x++) {
            pixels[0][x] = 1;
            pixels[63][x] = 1;
          }
          for (let y = 0; y < 64; y++) {
            pixels[y][0] = 1;
            pixels[y][99] = 1;
          }
          return pixels;
        },
      };

      const pixels = patterns[pattern]
        ? patterns[pattern]()
        : patterns["checkerboard"]();
      await this.writeScreen(pixels);
    }

    createScreenDataURI(pixels) {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");

      const imageData = ctx.createImageData(100, 64);
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 100; x++) {
          const i = (y * 100 + x) * 4;
          const color = pixels[y][x] === 0 ? 176 : 0;
          imageData.data[i] = color;
          imageData.data[i + 1] = color;
          imageData.data[i + 2] = color;
          imageData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      return canvas.toDataURL();
    }

    // ==================== OTHER COMMANDS ====================

    async playTone(freq, ms) {
      const f = Math.max(200, Math.min(14000, Cast.toNumber(freq)));
      const d = Math.max(0, Math.min(65535, Cast.toNumber(ms)));

      await this.send(NXT_OPCODE.PLAY_TONE, [
        f & 0xff,
        (f >> 8) & 0xff,
        d & 0xff,
        (d >> 8) & 0xff,
      ]);
    }

    async getBattery() {
      return await this.send(NXT_OPCODE.GET_BATT_LVL, [], true);
    }

    sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }
  }

  // ==================== EXTENSION ====================

  class LegoNXTExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.nxt = new NXTPeripheral();
      this.transpiler = new NXCTranspiler();
      this.nxcCode = null;
      this.rxeBase64 = null;
      this.compilerUrl = "https://lego-compiler.vercel.app";
    }

    getInfo() {
      return {
        id: "legonxt",
        name: "LEGO NXT",
        color1: "#FF6B00",
        color2: "#CC5500",
        blockIconURI:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjAwIiByeD0iNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OWFQ8L3RleHQ+PC9zdmc+",
        blocks: [
          {
            opcode: "connect",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔌 connect to [URL]",
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "localhost:8080",
              },
            },
          },
          {
            opcode: "disconnect",
            blockType: Scratch.BlockType.COMMAND,
            text: "disconnect",
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "connected?",
          },

          "---",
          "🔧 MOTORS",

          {
            opcode: "motorOn",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER] %",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "motorDegrees",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER] % for [DEG] °",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              DEG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
            },
          },
          {
            opcode: "motorRotations",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER] % for [ROT] rotations",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              ROT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] [ACTION]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
              ACTION: {
                type: Scratch.ArgumentType.STRING,
                menu: "STOP_ACTION",
                defaultValue: "brake",
              },
            },
          },
          {
            opcode: "motorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: "motor [PORT] position",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },
          {
            opcode: "resetMotor",
            blockType: Scratch.BlockType.COMMAND,
            text: "reset motor [PORT]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "MOTOR_PORT",
                defaultValue: "A",
              },
            },
          },

          "---",
          "👆 TOUCH SENSOR",

          {
            opcode: "setupTouch",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup touch sensor [PORT]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },
          {
            opcode: "touchPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "touch [PORT] pressed?",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          "💡 LIGHT SENSOR",

          {
            opcode: "setupLight",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup light sensor [PORT] LED [LED]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
              LED: {
                type: Scratch.ArgumentType.STRING,
                menu: "LED_STATE",
                defaultValue: "on",
              },
            },
          },
          {
            opcode: "lightValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "light [PORT] brightness",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          "🔊 SOUND SENSOR",

          {
            opcode: "setupSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup sound sensor [PORT] mode [MODE]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "SOUND_MODE",
                defaultValue: "dBA",
              },
            },
          },
          {
            opcode: "soundValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "sound [PORT] loudness %",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S1",
              },
            },
          },

          "---",
          "📏 ULTRASONIC SENSOR",

          {
            opcode: "setupUltrasonic",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup ultrasonic [PORT]",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S4",
              },
            },
          },
          {
            opcode: "ultrasonicDist",
            blockType: Scratch.BlockType.REPORTER,
            text: "ultrasonic [PORT] distance (cm)",
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "SENSOR_PORT",
                defaultValue: "S4",
              },
            },
          },

          "---",
          "🔔 SOUND",

          {
            opcode: "playTone",
            blockType: Scratch.BlockType.COMMAND,
            text: "play tone [FREQ] Hz for [MS] ms",
            arguments: {
              FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 440 },
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 },
            },
          },
          {
            opcode: "playNote",
            blockType: Scratch.BlockType.COMMAND,
            text: "play note [NOTE] for [BEATS] beats",
            arguments: {
              NOTE: {
                type: Scratch.ArgumentType.STRING,
                menu: "NOTE",
                defaultValue: "C4",
              },
              BEATS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
            },
          },

          "---",
          "🖥️ SCREEN",

          {
            opcode: "captureScreen",
            blockType: Scratch.BlockType.REPORTER,
            text: "capture NXT screen",
          },
          {
            opcode: "clearScreen",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear screen",
          },
          {
            opcode: "updateDisplay",
            blockType: Scratch.BlockType.COMMAND,
            text: "🖥️ update display",
          },
          {
            opcode: "drawText",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw text [TEXT] at x:[X] y:[Y]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "HELLO",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
            },
          },
          {
            opcode: "drawPixel",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw pixel at x:[X] y:[Y] [STATE]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "PIXEL_STATE",
                defaultValue: "on",
              },
            },
          },
          {
            opcode: "drawLine",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw line from x:[X1] y:[Y1] to x:[X2] y:[Y2]",
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 54 },
            },
          },
          {
            opcode: "drawRect",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw [FILL] rectangle x:[X] y:[Y] w:[W] h:[H]",
            arguments: {
              FILL: {
                type: Scratch.ArgumentType.STRING,
                menu: "RECT_FILL",
                defaultValue: "outline",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 44 },
            },
          },
          {
            opcode: "drawPattern",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw pattern [PATTERN]",
            arguments: {
              PATTERN: {
                type: Scratch.ArgumentType.STRING,
                menu: "PATTERN",
                defaultValue: "checkerboard",
              },
            },
          },

          "---",
          "💾 CODE GENERATION",

          {
            opcode: "transpileProject",
            blockType: Scratch.BlockType.COMMAND,
            text: "📝 transpile project to NXC",
          },
          {
            opcode: "showNXCCode",
            blockType: Scratch.BlockType.COMMAND,
            text: "👀 show generated NXC code",
          },
          {
            opcode: "downloadNXC",
            blockType: Scratch.BlockType.COMMAND,
            text: "⬇️ download as .nxc file",
          },
          {
            opcode: "compileToRXE",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔧 compile NXC to .rxe",
          },
          {
            opcode: "uploadToNXT",
            blockType: Scratch.BlockType.COMMAND,
            text: "📤 upload program to NXT",
          },

          "---",
          "📊 STATUS",

          {
            opcode: "battery",
            blockType: Scratch.BlockType.REPORTER,
            text: "battery (mV)",
          },
        ],
        menus: {
          MOTOR_PORT: { acceptReporters: true, items: ["A", "B", "C"] },
          SENSOR_PORT: {
            acceptReporters: true,
            items: ["S1", "S2", "S3", "S4"],
          },
          STOP_ACTION: { acceptReporters: false, items: ["brake", "coast"] },
          LED_STATE: { acceptReporters: false, items: ["on", "off"] },
          SOUND_MODE: { acceptReporters: false, items: ["dBA", "dB"] },
          PIXEL_STATE: { acceptReporters: false, items: ["on", "off"] },
          RECT_FILL: { acceptReporters: false, items: ["outline", "filled"] },
          PATTERN: {
            acceptReporters: false,
            items: [
              "checkerboard",
              "stripes-h",
              "stripes-v",
              "grid",
              "dots",
              "border",
            ],
          },
          NOTE: {
            acceptReporters: false,
            items: [
              "C4",
              "C#4",
              "D4",
              "D#4",
              "E4",
              "F4",
              "F#4",
              "G4",
              "G#4",
              "A4",
              "A#4",
              "B4",
              "C5",
              "C#5",
              "D5",
              "D#5",
              "E5",
              "F5",
              "F#5",
              "G5",
              "G#5",
              "A5",
              "A#5",
              "B5",
            ],
          },
        },
      };
    }

    // ========================================================================
    // TRANSPILATION METHODS
    // ========================================================================

    transpileProject() {
      try {
        console.log("🚀 [EXT] Starting transpilation...");
        this.nxcCode = this.transpiler.transpileProject();
        console.log("✅ [EXT] Transpilation complete!");
        alert("✅ Project transpiled to NXC!\n\nCheck console for details.");
      } catch (error) {
        console.error("❌ [EXT] Transpilation failed:", error);
        alert(`❌ Transpilation failed:\n\n${error.message}`);
      }
    }

    showNXCCode() {
      if (!this.nxcCode) {
        alert("❌ Generate NXC code first!");
        return;
      }

      console.log("👀 [EXT] Showing NXC code");

      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 2px solid #FF6B00;
        border-radius: 8px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;

      const title = document.createElement("h3");
      title.textContent = "Generated NXC Code";
      title.style.color = "#333";

      const pre = document.createElement("pre");
      pre.style.cssText = `
        background: #f5f5f5;
        padding: 10px;
        overflow: auto;
        max-height: 500px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        border-radius: 4px;
        color: #000;
        white-space: pre-wrap;
        word-wrap: break-word;
      `;
      pre.textContent = this.nxcCode;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = `
        margin-top: 10px;
        padding: 8px 16px;
        background: #FF6B00;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      `;
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(title);
      modal.appendChild(pre);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
    }

    downloadNXC() {
      if (!this.nxcCode) {
        alert("❌ Generate NXC code first!");
        return;
      }

      console.log("⬇️ [EXT] Downloading NXC file");

      const blob = new Blob([this.nxcCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nxt_program.nxc";
      a.click();
      URL.revokeObjectURL(url);
      alert("✅ Downloaded: nxt_program.nxc");
    }

    async compileToRXE() {
      if (!this.nxcCode) {
        alert("❌ Generate NXC code first!");
        return;
      }

      try {
        console.log("🔧 [EXT] Starting NXC compilation...");
        console.log(`📍 [EXT] Compiler URL: ${this.compilerUrl}/compile`);

        const response = await fetch(`${this.compilerUrl}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compiler: "nxc", code: this.nxcCode }),
        });

        console.log(`📡 [EXT] Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [EXT] HTTP error: ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("📦 [EXT] Compilation response:", result);

        if (result.success) {
          this.rxeBase64 = result.base64;

          let message = "✅ Compilation successful!";
          if (result.message) {
            message += "\n\n" + result.message;
          }
          console.log("✅ [EXT] Compilation successful!");
          alert(message);
        } else {
          console.error("❌ [EXT] Compilation failed:", result.error);
          throw new Error(result.error || "Unknown compilation error");
        }
      } catch (error) {
        console.error("❌ [EXT] Compilation error:", error);
        alert(`❌ Compilation failed:\n\n${error.message}`);
      }
    }

    async uploadToNXT() {
      if (!this.rxeBase64) {
        alert("❌ Compile to .rxe first!");
        return;
      }

      if (!this.nxt.connected) {
        alert("❌ Connect to NXT first!");
        return;
      }

      try {
        console.log("📤 [EXT] Uploading program to NXT...");

        // Decode base64 to bytes
        const binaryString = atob(this.rxeBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log(`📊 [EXT] File size: ${bytes.length} bytes`);

        // NXT file upload protocol
        const filename = "program.rxe";
        const filenameBytes = new Array(20).fill(0);
        for (let i = 0; i < Math.min(filename.length, 19); i++) {
          filenameBytes[i] = filename.charCodeAt(i);
        }

        // Open write
        console.log("📂 [EXT] Opening file for write...");
        const openCmd = [
          ...filenameBytes,
          bytes.length & 0xff,
          (bytes.length >> 8) & 0xff,
          (bytes.length >> 16) & 0xff,
          (bytes.length >> 24) & 0xff,
        ];

        const handleResult = await this.nxt.send(
          NXT_OPCODE.OPENWRITE,
          openCmd,
          true,
          true,
        );
        const handle = handleResult !== null ? handleResult : 0;
        console.log(`📂 [EXT] File opened with handle: ${handle}`);

        // Write in chunks of 59 bytes (NXT max is 59 for WRITE command)
        const chunkSize = 59;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          const writeCmd = [handle, ...Array.from(chunk)];
          await this.nxt.send(NXT_OPCODE.WRITE, writeCmd, true, true);
          await this.nxt.sleep(20);

          if (i % (chunkSize * 10) === 0) {
            const progress = Math.round((i / bytes.length) * 100);
            console.log(`📤 [EXT] Upload progress: ${progress}%`);
          }
        }

        // Close file
        console.log("📂 [EXT] Closing file...");
        await this.nxt.send(NXT_OPCODE.CLOSE, [handle], true, true);

        console.log("✅ [EXT] Upload complete!");
        alert(
          "✅ Program uploaded to NXT!\n\nYou can now run 'program.rxe' from the NXT menu.",
        );
      } catch (error) {
        console.error("❌ [EXT] Upload error:", error);
        alert(`❌ Upload failed:\n\n${error.message}`);
      }
    }

    // ========================================================================
    // EXISTING METHODS
    // ========================================================================

    // Connection
    connect(args) {
      return this.nxt.connect(args.URL);
    }
    disconnect() {
      return this.nxt.disconnect();
    }
    isConnected() {
      return this.nxt.connected;
    }

    // Motors
    motorOn(args) {
      return this.nxt.setMotor(args.PORT, args.POWER);
    }
    motorDegrees(args) {
      return this.nxt.motorForDegrees(args.PORT, args.POWER, args.DEG);
    }
    motorRotations(args) {
      return this.nxt.motorForDegrees(args.PORT, args.POWER, args.ROT * 360);
    }
    motorStop(args) {
      return this.nxt.setMotor(args.PORT, 0, args.ACTION === "brake");
    }
    motorPosition(args) {
      return this.nxt.getMotorPos(args.PORT);
    }
    resetMotor(args) {
      return this.nxt.resetMotorPos(args.PORT);
    }

    // Sensors
    setupTouch(args) {
      return this.nxt.setupTouch(args.PORT);
    }
    async touchPressed(args) {
      const val = await this.nxt.getSensor(args.PORT);
      return val === 1;
    }
    setupLight(args) {
      return this.nxt.setupLight(args.PORT, args.LED === "on");
    }
    lightValue(args) {
      return this.nxt.getSensor(args.PORT);
    }
    setupSound(args) {
      return this.nxt.setupSound(args.PORT, args.MODE === "dBA");
    }
    soundValue(args) {
      return this.nxt.getSensor(args.PORT);
    }
    setupUltrasonic(args) {
      return this.nxt.setupUltrasonic(args.PORT);
    }
    ultrasonicDist(args) {
      return this.nxt.getUltrasonic(args.PORT);
    }

    // Sound
    playTone(args) {
      return this.nxt.playTone(args.FREQ, args.MS);
    }
    playNote(args) {
      const notes = {
        C4: 262,
        "C#4": 277,
        D4: 294,
        "D#4": 311,
        E4: 330,
        F4: 349,
        "F#4": 370,
        G4: 392,
        "G#4": 415,
        A4: 440,
        "A#4": 466,
        B4: 494,
        C5: 523,
        "C#5": 554,
        D5: 587,
        "D#5": 622,
        E5: 659,
        F5: 698,
        "F#5": 740,
        G5: 784,
        "G#5": 831,
        A5: 880,
        "A#5": 932,
        B5: 988,
      };
      return this.nxt.playTone(notes[args.NOTE] || 440, args.BEATS * 500);
    }

    // Screen
    captureScreen() {
      return this.nxt.readScreen();
    }
    clearScreen() {
      return this.nxt.clearScreen();
    }
    updateDisplay() {
      return this.nxt.updateDisplay();
    }
    drawText(args) {
      return this.nxt.drawText(args.TEXT, args.X, args.Y);
    }
    drawPixel(args) {
      return this.nxt.drawPixel(args.X, args.Y, args.STATE === "on");
    }
    drawLine(args) {
      return this.nxt.drawLine(args.X1, args.Y1, args.X2, args.Y2);
    }
    drawRect(args) {
      return this.nxt.drawRect(
        args.X,
        args.Y,
        args.W,
        args.H,
        args.FILL === "filled",
      );
    }
    drawPattern(args) {
      return this.nxt.drawPattern(args.PATTERN);
    }

    // Status
    battery() {
      return this.nxt.getBattery();
    }
  }

  Scratch.extensions.register(new LegoNXTExtension());
  console.log(
    "🎉 LEGO NXT Extension Loaded! (Full Screen + Transpilation Support)",
  );
})(Scratch);
