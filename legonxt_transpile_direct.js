(function (Scratch) {
  "use strict";

  const Cast = Scratch.Cast;

  // ==================== DEBUG LOGGER ====================
  
  class DebugLogger {
    constructor(prefix = "LEGO NXT") {
      this.prefix = prefix;
      this.verbose = true;
    }

    log(message, ...args) {
      if (this.verbose) {
        console.log(`[${this.prefix}] ${message}`, ...args);
      }
    }

    error(message, ...args) {
      console.error(`[${this.prefix}] ❌ ${message}`, ...args);
    }

    success(message, ...args) {
      console.log(`[${this.prefix}] ✅ ${message}`, ...args);
    }

    warn(message, ...args) {
      console.warn(`[${this.prefix}] ⚠️ ${message}`, ...args);
    }

    info(message, ...args) {
      console.info(`[${this.prefix}] ℹ️ ${message}`, ...args);
    }
  }

  const logger = new DebugLogger();

  // ==================== NXT PROTOCOL CONSTANTS ====================

  const NXT_OPCODE = {
    // Direct commands (reply required)
    DIRECT_CMD: 0x00,
    // Direct commands (no reply)
    DIRECT_CMD_NO_REPLY: 0x80,
    // System commands (reply required)
    SYSTEM_CMD: 0x01,
    // System commands (no reply)
    SYSTEM_CMD_NO_REPLY: 0x81,
    // Reply
    REPLY: 0x02,

    // Direct command opcodes
    START_PROGRAM: 0x00,
    STOP_PROGRAM: 0x01,
    PLAY_SOUND_FILE: 0x02,
    PLAY_TONE: 0x03,
    SET_OUT_STATE: 0x04,
    SET_IN_MODE: 0x05,
    GET_OUT_STATE: 0x06,
    GET_IN_VALS: 0x07,
    RESET_IN_VAL: 0x08,
    MESSAGE_WRITE: 0x09,
    RESET_POSITION: 0x0a,
    GET_BATT_LVL: 0x0b,
    STOP_SOUND: 0x0c,
    KEEP_ALIVE: 0x0d,
    LS_GET_STATUS: 0x0e,
    LS_WRITE: 0x0f,
    LS_READ: 0x10,
    GET_CURR_PROGRAM: 0x11,
    MESSAGE_READ: 0x13,

    // System command opcodes
    OPEN_READ: 0x80,
    OPEN_WRITE: 0x81,
    READ: 0x82,
    WRITE: 0x83,
    CLOSE: 0x84,
    DELETE: 0x85,
    FIND_FIRST: 0x86,
    FIND_NEXT: 0x87,
    GET_FIRMWARE_VERSION: 0x88,
    OPEN_WRITE_LINEAR: 0x89,
    OPEN_WRITE_DATA: 0x8b,
    FIND_FIRST_MODULE: 0x90,
    FIND_NEXT_MODULE: 0x91,
    CLOSE_MODULE_HANDLE: 0x92,
    READ_IO_MAP: 0x94,
    WRITE_IO_MAP: 0x95,
    BOOT_CMD: 0x97,
    SET_BRICK_NAME: 0x98,
    GET_DEVICE_INFO: 0x9b,
  };

  // NXT Error Codes
  const NXT_ERROR = {
    0x00: "Success",
    0x20: "Pending communication transaction in progress",
    0x40: "Specified mailbox queue is empty",
    0x81: "No more handles",
    0x82: "No space",
    0x83: "No more files",
    0x84: "End of file expected",
    0x85: "End of file",
    0x86: "Not a linear file",
    0x87: "File not found",
    0x88: "Handle already closed",
    0x89: "No linear space",
    0x8a: "Undefined error",
    0x8b: "File is busy",
    0x8c: "No write buffers",
    0x8d: "Append not possible",
    0x8e: "File is full",
    0x8f: "File exists",
    0x90: "Module not found",
    0x91: "Out of bounds",
    0x92: "Illegal file name",
    0x93: "Illegal handle",
    0xbd: "Request failed (i.e. specified file not found)",
    0xbe: "Unknown command opcode",
    0xbf: "Insane packet",
    0xc0: "Data contains out-of-range values",
    0xdd: "Communication bus error",
    0xde: "No free memory in communication buffer",
    0xdf: "Specified channel/connection is not valid",
    0xe0: "Specified channel/connection not configured or busy",
    0xec: "No active program",
    0xed: "Illegal size specified",
    0xee: "Illegal mailbox queue ID specified",
    0xef: "Attempted to access invalid field of a structure",
    0xf0: "Bad input or output specified",
    0xfb: "Insufficient memory available",
    0xff: "Bad arguments",
  };

  const PORT = {
    A: 0,
    B: 1,
    C: 2,
    S1: 0,
    S2: 1,
    S3: 2,
    S4: 3,
  };

  const MOTOR_MODE = {
    IDLE: 0x00,
    ON: 0x01,
    BRAKE: 0x02,
    REGULATED: 0x04,
    ON_REGULATED: 0x01 | 0x04,
    ON_BRAKE: 0x01 | 0x02,
    ON_BRAKE_REGULATED: 0x01 | 0x02 | 0x04,
  };

  const REGULATION_MODE = {
    IDLE: 0x00,
    SPEED: 0x01,
    SYNC: 0x02,
  };

  const RUN_STATE = {
    IDLE: 0x00,
    RAMP_UP: 0x10,
    RUNNING: 0x20,
    RAMP_DOWN: 0x40,
  };

  const SENSOR_TYPE = {
    NO_SENSOR: 0x00,
    SWITCH: 0x01,
    TEMPERATURE: 0x02,
    REFLECTION: 0x03,
    ANGLE: 0x04,
    LIGHT_ACTIVE: 0x05,
    LIGHT_INACTIVE: 0x06,
    SOUND_DB: 0x07,
    SOUND_DBA: 0x08,
    CUSTOM: 0x09,
    LOW_SPEED: 0x0a,
    LOW_SPEED_9V: 0x0b,
    COLOR_FULL: 0x0d,
    COLOR_RED: 0x0e,
    COLOR_GREEN: 0x0f,
    COLOR_BLUE: 0x10,
    COLOR_NONE: 0x11,
    NO_OF_SENSOR_TYPES: 0x0c,
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
    SLOPE_MASK: 0x1f,
    MODE_MASK: 0xe0,
  };

  const MODULE_DISPLAY = 0xa0001;
  const DISPLAY_OFFSET = 119;
  const DISPLAY_WIDTH = 100;
  const DISPLAY_HEIGHT = 64;
  const DISPLAY_BUFFER_SIZE = 800;

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
    ";": [0x00, 0x80, 0x36, 0x00, 0x00],
    "-": [0x08, 0x08, 0x08, 0x08, 0x08],
    "+": [0x08, 0x08, 0x3e, 0x08, 0x08],
    "=": [0x14, 0x14, 0x14, 0x14, 0x14],
    "/": [0x20, 0x10, 0x08, 0x04, 0x02],
    "\\": [0x02, 0x04, 0x08, 0x10, 0x20],
    "*": [0x14, 0x08, 0x3e, 0x08, 0x14],
    "(": [0x00, 0x1c, 0x22, 0x41, 0x00],
    ")": [0x00, 0x41, 0x22, 0x1c, 0x00],
    "[": [0x00, 0x7f, 0x41, 0x41, 0x00],
    "]": [0x00, 0x41, 0x41, 0x7f, 0x00],
    "{": [0x00, 0x08, 0x36, 0x41, 0x00],
    "}": [0x00, 0x41, 0x36, 0x08, 0x00],
    "#": [0x14, 0x7f, 0x14, 0x7f, 0x14],
    $: [0x24, 0x2a, 0x7f, 0x2a, 0x12],
    "%": [0x23, 0x13, 0x08, 0x64, 0x62],
    "&": [0x36, 0x49, 0x56, 0x20, 0x50],
    "<": [0x08, 0x14, 0x22, 0x41, 0x00],
    ">": [0x00, 0x41, 0x22, 0x14, 0x08],
    "'": [0x00, 0x00, 0x07, 0x00, 0x00],
    '"': [0x00, 0x07, 0x00, 0x07, 0x00],
    "`": [0x00, 0x01, 0x02, 0x00, 0x00],
    "~": [0x04, 0x02, 0x04, 0x08, 0x04],
    _: [0x40, 0x40, 0x40, 0x40, 0x40],
    "|": [0x00, 0x00, 0x7f, 0x00, 0x00],
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
      this.logger = new DebugLogger("Transpiler");
    }

    reset() {
      this.logger.log("Resetting transpiler state");
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

          if (primitiveType === 4 || primitiveType === 5 || primitiveType === 6 || primitiveType === 7) {
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

        if (inputType === 3 && Array.isArray(inputData) && inputData.length >= 2) {
          if (typeof inputData[0] === "string") {
            const refBlock = blocks._blocks[inputData[0]];
            if (refBlock) return this.evaluateBlock(refBlock, blocks);
          }

          const shadowData = inputData[1];
          if (Array.isArray(shadowData)) {
            const primitiveType = shadowData[0];
            const primitiveValue = shadowData[1];

            if (primitiveType === 4 || primitiveType === 5 || primitiveType === 6 || primitiveType === 7) {
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
      // Numbers
      if (block.opcode === "math_number" || block.opcode === "math_whole_number" || 
          block.opcode === "math_positive_number" || block.opcode === "math_integer") {
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
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        return `MotorRotationCount(OUT_${port})`;
      }
      else if (block.opcode === "touchPressed") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`touch_${port}`);
        return `(SENSOR_${sensorNum} == 1)`;
      }
      else if (block.opcode === "lightValue") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`light_${port}`);
        return `Sensor(IN_${sensorNum})`;
      }
      else if (block.opcode === "soundValue") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`sound_${port}`);
        return `Sensor(IN_${sensorNum})`;
      }
      else if (block.opcode === "ultrasonicDist") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.sensorSetup.add(`ultrasonic_${port}`);
        return `SensorUS(IN_${sensorNum})`;
      }
      else if (block.opcode === "battery") {
        return "BatteryLevel()";
      }
      // Operators
      else if (block.opcode === "operator_gt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} > ${op2})`;
      }
      else if (block.opcode === "operator_lt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} < ${op2})`;
      }
      else if (block.opcode === "operator_equals") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} == ${op2})`;
      }
      else if (block.opcode === "operator_and") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} && ${op2})`;
      }
      else if (block.opcode === "operator_or") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return `(${op1} || ${op2})`;
      }
      else if (block.opcode === "operator_not") {
        const op = this.getInputValue(block, "OPERAND", blocks);
        return `!(${op})`;
      }
      else if (block.opcode === "operator_add") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} + ${num2})`;
      }
      else if (block.opcode === "operator_subtract") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} - ${num2})`;
      }
      else if (block.opcode === "operator_multiply") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} * ${num2})`;
      }
      else if (block.opcode === "operator_divide") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} / ${num2})`;
      }
      else if (block.opcode === "operator_random") {
        const from = this.getInputValue(block, "FROM", blocks);
        const to = this.getInputValue(block, "TO", blocks);
        return `Random(${to} - ${from}) + ${from}`;
      }
      else if (block.opcode === "operator_mod") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return `(${num1} % ${num2})`;
      }
      else if (block.opcode === "operator_round") {
        const num = this.getInputValue(block, "NUM", blocks);
        return `round(${num})`;
      }
      else if (block.opcode === "operator_mathop") {
        const operator = this.getFieldValue(block, "OPERATOR");
        const num = this.getInputValue(block, "NUM", blocks);
        
        const mathOps = {
          "abs": `abs(${num})`,
          "floor": `floor(${num})`,
          "ceiling": `ceil(${num})`,
          "sqrt": `sqrt(${num})`,
          "sin": `sin(${num})`,
          "cos": `cos(${num})`,
          "tan": `tan(${num})`,
          "asin": `asin(${num})`,
          "acos": `acos(${num})`,
          "atan": `atan(${num})`,
          "ln": `log(${num})`,
          "log": `log10(${num})`,
          "e ^": `exp(${num})`,
          "10 ^": `pow(10, ${num})`,
        };
        
        return mathOps[operator] || `(${num})`;
      }

      return "0";
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.logger.log(`Processing block: ${opcode}`);

      // NXT Motor blocks
      if (opcode === "motorOn") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
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
      }
      else if (opcode === "motorDegrees") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const power = this.getInputValue(block, "POWER", blocks);
        const degrees = this.getInputValue(block, "DEG", blocks);
        this.addLine(`RotateMotor(OUT_${port}, ${power}, ${degrees});`);
      }
      else if (opcode === "motorRotations") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const power = this.getInputValue(block, "POWER", blocks);
        const rotations = this.getInputValue(block, "ROT", blocks);
        this.addLine(`RotateMotor(OUT_${port}, ${power}, (${rotations}) * 360);`);
      }
      else if (opcode === "motorStop") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const action = this.getInputValue(block, "ACTION", blocks).replace(/"/g, "");
        if (action === "brake") {
          this.addLine(`Off(OUT_${port});`);
        } else {
          this.addLine(`Float(OUT_${port});`);
        }
      }
      else if (opcode === "resetMotor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        this.addLine(`ResetRotationCount(OUT_${port});`);
      }
      
      // Sensor setup blocks
      else if (opcode === "setupTouch") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorTouch(IN_${sensorNum});`);
        this.sensorSetup.add(`touch_${port}`);
      }
      else if (opcode === "setupLight") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const led = this.getInputValue(block, "LED", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        if (led === "on") {
          this.addLine(`SetSensorLight(IN_${sensorNum});`);
        } else {
          this.addLine(`SetSensorLowspeed(IN_${sensorNum});`);
        }
        this.sensorSetup.add(`light_${port}`);
      }
      else if (opcode === "setupSound") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorSound(IN_${sensorNum});`);
        this.sensorSetup.add(`sound_${port}`);
      }
      else if (opcode === "setupUltrasonic") {
        const port = this.getInputValue(block, "PORT", blocks).replace(/"/g, "");
        const sensorNum = port.replace("S", "");
        this.addLine(`SetSensorLowspeed(IN_${sensorNum});`);
        this.sensorSetup.add(`ultrasonic_${port}`);
      }
      
      // Sound blocks
      else if (opcode === "playTone") {
        const freq = this.getInputValue(block, "FREQ", blocks);
        const ms = this.getInputValue(block, "MS", blocks);
        this.addLine(`PlayTone(${freq}, ${ms});`);
      }
      else if (opcode === "playNote") {
        const note = this.getInputValue(block, "NOTE", blocks).replace(/"/g, "");
        const beats = this.getInputValue(block, "BEATS", blocks);
        const noteFreqs = {
          "C4": 262, "C#4": 277, "D4": 294, "D#4": 311, "E4": 330, "F4": 349,
          "F#4": 370, "G4": 392, "G#4": 415, "A4": 440, "A#4": 466, "B4": 494,
          "C5": 523, "C#5": 554, "D5": 587, "D#5": 622, "E5": 659, "F5": 698,
          "F#5": 740, "G5": 784, "G#5": 831, "A5": 880, "A#5": 932, "B5": 988,
        };
        const freq = noteFreqs[note] || 440;
        this.addLine(`PlayTone(${freq}, (${beats}) * 500);`);
      }
      
      // Screen blocks
      else if (opcode === "clearScreen") {
        this.addLine(`ClearScreen();`);
      }
      else if (opcode === "drawText") {
        const text = this.getInputValue(block, "TEXT", blocks);
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine(`TextOut(${x}, LCD_LINE1 + ${y}, ${text});`);
      }
      else if (opcode === "drawPixel") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const state = this.getInputValue(block, "STATE", blocks).replace(/"/g, "");
        if (state === "on") {
          this.addLine(`PointOut(${x}, ${y});`);
        }
      }
      else if (opcode === "drawLine") {
        const x1 = this.getInputValue(block, "X1", blocks);
        const y1 = this.getInputValue(block, "Y1", blocks);
        const x2 = this.getInputValue(block, "X2", blocks);
        const y2 = this.getInputValue(block, "Y2", blocks);
        this.addLine(`LineOut(${x1}, ${y1}, ${x2}, ${y2});`);
      }
      else if (opcode === "drawRect") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const w = this.getInputValue(block, "W", blocks);
        const h = this.getInputValue(block, "H", blocks);
        const fill = this.getInputValue(block, "FILL", blocks).replace(/"/g, "");
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
      }
      else if (opcode === "motion_turnright") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine(`// Turn right ${degrees} degrees`);
        this.addLine(`OnFwd(OUT_B, 50); OnRev(OUT_C, 50);`);
        this.addLine(`Wait((${degrees}) * 5);`);
        this.addLine(`Off(OUT_BC);`);
      }
      else if (opcode === "motion_turnleft") {
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
      }
      else if (opcode === "control_repeat") {
        const times = this.getInputValue(block, "TIMES", blocks);
        this.addLine(`repeat(${times}) {`);
        this.increaseIndent();
        
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      }
      else if (opcode === "control_forever") {
        this.addLine(`while(true) {`);
        this.increaseIndent();
        
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      }
      else if (opcode === "control_if") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`if (${condition}) {`);
        this.increaseIndent();
        
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      }
      else if (opcode === "control_if_else") {
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
      }
      else if (opcode === "control_repeat_until") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine(`until (${condition}) {`);
        this.increaseIndent();
        
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        this.decreaseIndent();
        this.addLine(`}`);
      }
      else if (opcode === "control_stop") {
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
      }
      else if (opcode === "data_changevariableby") {
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
          this.logger.warn("Chain length exceeded 1000 blocks, stopping");
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }
    }

    processHatBlock(hatBlock, blocks) {
      const opcode = hatBlock.opcode;
      this.logger.log(`Processing hat block: ${opcode}`);

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
      this.logger.log(`Processing target: ${target.sprite.name}`);
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      
      for (const blockId in blockArray) {
        const block = blockArray[blockId];
        if (block.opcode === "event_whenflagclicked") {
          this.processHatBlock(block, blocks);
        }
      }
    }

    generateHeader() {
      this.addLine("// ========================================");
      this.addLine("// Generated from Scratch by LEGO NXT Extension");
      this.addLine(`// Generated: ${new Date().toISOString()}`);
      this.addLine("// ========================================");
      this.addLine("");
    }

    generateVariables() {
      if (this.variables.size > 0) {
        this.addLine("// Global Variables");
        for (const [original, sanitized] of this.variables) {
          this.addLine(`int ${sanitized} = 0; // ${original}`);
        }
        this.addLine("");
      }
    }

    generateSensorSetup() {
      if (this.sensorSetup.size > 0) {
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
      this.logger.log("=".repeat(50));
      this.logger.log("Starting NXC Transpilation");
      this.logger.log("=".repeat(50));
      
      this.reset();
      
      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;
        
        this.logger.log(`Found ${targets.length} targets`);
        
        // First pass: collect all info
        const tempCode = this.code;
        this.code = [];
        
        for (const target of targets) {
          this.processTarget(target);
        }
        
        const bodyCode = this.code.join("\n");
        
        // Second pass: generate final code
        this.code = [];
        
        this.generateHeader();
        this.generateVariables();
        this.generateSensorSetup();
        
        // Main task
        this.addLine("task main() {");
        this.increaseIndent();
        
        if (this.sensorSetup.size > 0) {
          this.addLine("InitSensors();");
          this.addLine("");
        }
        
        const bodyLines = bodyCode.split("\n");
        for (const line of bodyLines) {
          this.code.push(line);
        }
        
        this.decreaseIndent();
        this.addLine("}");
        
        const finalCode = this.getCode();
        
        this.logger.success("Transpilation Complete!");
        this.logger.log("=".repeat(50));
        this.logger.log("Generated Code:");
        this.logger.log("=".repeat(50));
        this.logger.log(finalCode);
        this.logger.log("=".repeat(50));
        
        return finalCode;
      } catch (error) {
        this.logger.error("Transpilation failed:", error);
        throw error;
      }
    }
  }

  // ==================== NXT PERIPHERAL CLASS (keep existing) ====================
  // [Keep the entire existing NXTPeripheral class here - lines 252-1747 from the original]
  
  class NXTPeripheral {
    constructor(runtime) {
      this.runtime = runtime;

      this.port = null;
      this.reader = null;
      this.writer = null;
      this.connected = false;

      this.batteryLevel = 0;
      this.motorState = {
        A: { power: 0, tachoCount: 0, position: 0 },
        B: { power: 0, tachoCount: 0, position: 0 },
        C: { power: 0, tachoCount: 0, position: 0 },
      };
      this.sensorState = {
        S1: { type: "none", value: 0, rawValue: 0 },
        S2: { type: "none", value: 0, rawValue: 0 },
        S3: { type: "none", value: 0, rawValue: 0 },
        S4: { type: "none", value: 0, rawValue: 0 },
      };

      this.ultrasonicDistance = { S1: 0, S2: 0, S3: 0, S4: 0 };
      this.screenBuffer = new Uint8Array(DISPLAY_BUFFER_SIZE);
      this.pendingRequests = new Map();
      this.requestId = 0;
      this.readBuffer = new Uint8Array(0);
    }

    async connect() {
      logger.log("Attempting to connect to NXT...");
      try {
        if (!("serial" in navigator)) {
          throw new Error("Web Serial API not supported");
        }

        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" });

        this.reader = this.port.readable.getReader();
        this.writer = this.port.writable.getWriter();
        this.connected = true;

        this.startReading();

        await this.sleep(100);
        const firmware = await this.getFirmwareVersion();
        logger.success(`Connected to NXT! Firmware: ${firmware}`);
        return true;
      } catch (error) {
        logger.error("Connection failed:", error);
        this.connected = false;
        return false;
      }
    }

    async disconnect() {
      logger.log("Disconnecting from NXT...");
      try {
        if (this.reader) {
          await this.reader.cancel();
          this.reader.releaseLock();
          this.reader = null;
        }
        if (this.writer) {
          this.writer.releaseLock();
          this.writer = null;
        }
        if (this.port) {
          await this.port.close();
          this.port = null;
        }
        this.connected = false;
        logger.success("Disconnected");
      } catch (error) {
        logger.error("Disconnection error:", error);
      }
    }

    isConnected() {
      return this.connected;
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    startReading() {
      const readLoop = async () => {
        try {
          while (this.connected && this.reader) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (value && value.length > 0) {
              this.handleIncomingData(value);
            }
          }
        } catch (error) {
          if (this.connected) {
            logger.error("Read error:", error);
          }
        }
      };
      readLoop();
    }

    handleIncomingData(data) {
      const newBuffer = new Uint8Array(this.readBuffer.length + data.length);
      newBuffer.set(this.readBuffer);
      newBuffer.set(data, this.readBuffer.length);
      this.readBuffer = newBuffer;

      while (this.readBuffer.length >= 2) {
        const length = this.readBuffer[0] | (this.readBuffer[1] << 8);
        if (this.readBuffer.length < length + 2) break;

        const telegram = this.readBuffer.slice(2, 2 + length);
        this.readBuffer = this.readBuffer.slice(2 + length);
        this.processTelegram(telegram);
      }
    }

    processTelegram(telegram) {
      if (telegram.length === 0) return;

      const messageType = telegram[0];
      const command = telegram[1];

      if (messageType === NXT_OPCODE.REPLY) {
        const status = telegram[2];
        for (const [id, resolve] of this.pendingRequests.entries()) {
          resolve(telegram);
          this.pendingRequests.delete(id);
          break;
        }
      }
    }

    async sendTelegram(command, payload = [], requireReply = true, isSystemCmd = false) {
      if (!this.connected || !this.writer) {
        throw new Error("NXT not connected");
      }

      const messageType = isSystemCmd
        ? requireReply
          ? NXT_OPCODE.SYSTEM_CMD
          : NXT_OPCODE.SYSTEM_CMD_NO_REPLY
        : requireReply
          ? NXT_OPCODE.DIRECT_CMD
          : NXT_OPCODE.DIRECT_CMD_NO_REPLY;

      const telegram = [messageType, command, ...payload];
      const length = telegram.length;
      const packet = new Uint8Array([length & 0xff, (length >> 8) & 0xff, ...telegram]);

      await this.writer.write(packet);

      if (requireReply) {
        return new Promise((resolve) => {
          const id = this.requestId++;
          this.pendingRequests.set(id, resolve);
          setTimeout(() => {
            if (this.pendingRequests.has(id)) {
              this.pendingRequests.delete(id);
              resolve(null);
            }
          }, 2000);
        });
      }

      return null;
    }

    async getFirmwareVersion() {
      const reply = await this.sendTelegram(NXT_OPCODE.GET_FIRMWARE_VERSION, [], true, true);
      if (reply && reply.length >= 7) {
        const minor = reply[3];
        const major = reply[4];
        return `${major}.${minor}`;
      }
      return "Unknown";
    }

    async setMotorPower(port, power, immediate = true) {
      logger.log(`Setting motor ${port} to power ${power}`);
      const portNum = PORT[port];
      const clampedPower = Math.max(-100, Math.min(100, power));
      const absPower = Math.abs(clampedPower);

      const mode = MOTOR_MODE.ON_BRAKE_REGULATED;
      const regulationMode = REGULATION_MODE.SPEED;
      const turnRatio = 0;
      const runState = RUN_STATE.RUNNING;
      const tachoLimit = 0;

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [
          portNum,
          clampedPower < 0 ? -absPower : absPower,
          mode,
          regulationMode,
          turnRatio,
          runState,
          tachoLimit & 0xff,
          (tachoLimit >> 8) & 0xff,
          (tachoLimit >> 16) & 0xff,
          (tachoLimit >> 24) & 0xff,
        ],
        false,
      );

      this.motorState[port].power = clampedPower;
    }

    async motorRunForDegrees(port, power, degrees) {
      logger.log(`Running motor ${port} for ${degrees}° at power ${power}`);
      const portNum = PORT[port];
      const clampedPower = Math.max(-100, Math.min(100, power));
      const absPower = Math.abs(clampedPower);

      const mode = MOTOR_MODE.ON_BRAKE_REGULATED;
      const regulationMode = REGULATION_MODE.SPEED;
      const turnRatio = 0;
      const runState = RUN_STATE.RUNNING;
      const tachoLimit = Math.abs(degrees);

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [
          portNum,
          clampedPower < 0 ? -absPower : absPower,
          mode,
          regulationMode,
          turnRatio,
          runState,
          tachoLimit & 0xff,
          (tachoLimit >> 8) & 0xff,
          (tachoLimit >> 16) & 0xff,
          (tachoLimit >> 24) & 0xff,
        ],
        false,
      );
    }

    async motorStop(port, brake = true) {
      logger.log(`Stopping motor ${port} (brake: ${brake})`);
      const portNum = PORT[port];
      const mode = brake ? MOTOR_MODE.BRAKE : MOTOR_MODE.IDLE;

      await this.sendTelegram(
        NXT_OPCODE.SET_OUT_STATE,
        [portNum, 0, mode, REGULATION_MODE.IDLE, 0, RUN_STATE.IDLE, 0, 0, 0, 0],
        false,
      );

      this.motorState[port].power = 0;
    }

    async getMotorPosition(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(NXT_OPCODE.GET_OUT_STATE, [portNum], true);
      if (reply && reply.length >= 25) {
        const count =
          reply[21] | (reply[22] << 8) | (reply[23] << 16) | (reply[24] << 24);
        return count;
      }
      return 0;
    }

    async resetMotorPosition(port, relative = false) {
      logger.log(`Resetting motor ${port} position (relative: ${relative})`);
      const portNum = PORT[port];
      await this.sendTelegram(
        NXT_OPCODE.RESET_POSITION,
        [portNum, relative ? 1 : 0],
        false,
      );
    }

    async setupSensor(port, type, mode) {
      logger.log(`Setting up sensor on ${port} (type: ${type}, mode: ${mode})`);
      const portNum = PORT[port];
      await this.sendTelegram(NXT_OPCODE.SET_IN_MODE, [portNum, type, mode], false);
      await this.sendTelegram(NXT_OPCODE.RESET_IN_VAL, [portNum], false);
    }

    async setupTouchNXT(port) {
      await this.setupSensor(port, SENSOR_TYPE.SWITCH, SENSOR_MODE.BOOL);
      this.sensorState[port].type = "touch-nxt";
    }

    async setupLightSensor(port, active = true) {
      const type = active ? SENSOR_TYPE.LIGHT_ACTIVE : SENSOR_TYPE.LIGHT_INACTIVE;
      await this.setupSensor(port, type, SENSOR_MODE.PCT_FULL_SCALE);
      this.sensorState[port].type = "light";
    }

    async setupColorSensor(port, mode = "full") {
      const typeMap = {
        full: SENSOR_TYPE.COLOR_FULL,
        red: SENSOR_TYPE.COLOR_RED,
        green: SENSOR_TYPE.COLOR_GREEN,
        blue: SENSOR_TYPE.COLOR_BLUE,
        none: SENSOR_TYPE.COLOR_NONE,
      };
      await this.setupSensor(port, typeMap[mode], SENSOR_MODE.RAW);
      this.sensorState[port].type = "color";
    }

    async setupSoundSensor(port, adjusted = true) {
      const type = adjusted ? SENSOR_TYPE.SOUND_DBA : SENSOR_TYPE.SOUND_DB;
      await this.setupSensor(port, type, SENSOR_MODE.PCT_FULL_SCALE);
      this.sensorState[port].type = "sound";
    }

    async setupUltrasonicSensor(port) {
      await this.setupSensor(port, SENSOR_TYPE.LOW_SPEED_9V, SENSOR_MODE.RAW);
      this.sensorState[port].type = "ultrasonic";
    }

    async getSensorValue(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(NXT_OPCODE.GET_IN_VALS, [portNum], true);
      if (reply && reply.length >= 13) {
        const scaledValue = reply[8] | (reply[9] << 8);
        this.sensorState[port].value = scaledValue;
        return scaledValue;
      }
      return 0;
    }

    async getRawSensorValue(port) {
      const portNum = PORT[port];
      const reply = await this.sendTelegram(NXT_OPCODE.GET_IN_VALS, [portNum], true);
      if (reply && reply.length >= 13) {
        const rawValue = reply[10] | (reply[11] << 8);
        this.sensorState[port].rawValue = rawValue;
        return rawValue;
      }
      return 0;
    }

    async getUltrasonicDistance(port) {
      const portNum = PORT[port];

      await this.sendTelegram(
        NXT_OPCODE.LS_WRITE,
        [portNum, 2, 1, 0x02, 0x42],
        false,
      );

      await this.sleep(50);

      const reply = await this.sendTelegram(NXT_OPCODE.LS_READ, [portNum], true);

      if (reply && reply.length >= 4) {
        const bytesRead = reply[3];
        if (bytesRead > 0 && reply.length >= 5) {
          const distance = reply[4];
          this.ultrasonicDistance[port] = distance;
          return distance;
        }
      }

      return this.ultrasonicDistance[port] || 0;
    }

    async playTone(freq, ms) {
      logger.log(`Playing tone: ${freq}Hz for ${ms}ms`);
      await this.sendTelegram(
        NXT_OPCODE.PLAY_TONE,
        [
          freq & 0xff,
          (freq >> 8) & 0xff,
          ms & 0xff,
          (ms >> 8) & 0xff,
        ],
        false,
      );
    }

    async getBatteryLevel() {
      const reply = await this.sendTelegram(NXT_OPCODE.GET_BATT_LVL, [], true);
      if (reply && reply.length >= 5) {
        const voltage = reply[3] | (reply[4] << 8);
        this.batteryLevel = voltage;
        return voltage;
      }
      return 0;
    }

    async readScreenBuffer() {
      logger.log("Reading screen buffer from NXT...");
      const reply = await this.sendTelegram(
        NXT_OPCODE.READ_IO_MAP,
        [
          MODULE_DISPLAY & 0xff,
          (MODULE_DISPLAY >> 8) & 0xff,
          (MODULE_DISPLAY >> 16) & 0xff,
          (MODULE_DISPLAY >> 24) & 0xff,
          DISPLAY_OFFSET & 0xff,
          (DISPLAY_OFFSET >> 8) & 0xff,
          DISPLAY_BUFFER_SIZE & 0xff,
          (DISPLAY_BUFFER_SIZE >> 8) & 0xff,
        ],
        true,
        true,
      );

      if (reply && reply.length >= 6 + DISPLAY_BUFFER_SIZE) {
        for (let i = 0; i < DISPLAY_BUFFER_SIZE; i++) {
          this.screenBuffer[i] = reply[6 + i];
        }
      }
    }

    async updateDisplay() {
      logger.log("Updating NXT display...");
      const chunks = Math.ceil(DISPLAY_BUFFER_SIZE / 59);

      for (let i = 0; i < chunks; i++) {
        const offset = DISPLAY_OFFSET + i * 59;
        const chunkSize = Math.min(59, DISPLAY_BUFFER_SIZE - i * 59);
        const chunkData = this.screenBuffer.slice(i * 59, i * 59 + chunkSize);

        await this.sendTelegram(
          NXT_OPCODE.WRITE_IO_MAP,
          [
            MODULE_DISPLAY & 0xff,
            (MODULE_DISPLAY >> 8) & 0xff,
            (MODULE_DISPLAY >> 16) & 0xff,
            (MODULE_DISPLAY >> 24) & 0xff,
            offset & 0xff,
            (offset >> 8) & 0xff,
            chunkSize & 0xff,
            (chunkSize >> 8) & 0xff,
            ...chunkData,
          ],
          false,
          true,
        );

        await this.sleep(20);
      }
    }

    clearScreenBuffer() {
      this.screenBuffer.fill(0);
    }

    setPixel(x, y, on = true) {
      x = Math.floor(x);
      y = Math.floor(y);

      if (x < 0 || x >= DISPLAY_WIDTH || y < 0 || y >= DISPLAY_HEIGHT) {
        return;
      }

      const byteIndex = Math.floor(x) + Math.floor(y / 8) * DISPLAY_WIDTH;
      const bitIndex = y % 8;

      if (on) {
        this.screenBuffer[byteIndex] |= 1 << bitIndex;
      } else {
        this.screenBuffer[byteIndex] &= ~(1 << bitIndex);
      }
    }

    async drawText(text, x, y) {
      logger.log(`Drawing text "${text}" at (${x}, ${y})`);
      const str = String(text);
      let currentX = Math.floor(x);

      for (const char of str) {
        const pattern = FONT_5X7[char.toUpperCase()] || FONT_5X7[" "];

        for (let col = 0; col < 5; col++) {
          const colData = pattern[col];
          for (let row = 0; row < 7; row++) {
            const on = (colData & (1 << row)) !== 0;
            this.setPixel(currentX + col, y + row, on);
          }
        }

        currentX += 6;
        if (currentX >= DISPLAY_WIDTH) break;
      }

      await this.updateDisplay();
    }

    async drawLine(x1, y1, x2, y2) {
      x1 = Math.floor(x1);
      y1 = Math.floor(y1);
      x2 = Math.floor(x2);
      y2 = Math.floor(y2);

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? 1 : -1;
      const sy = y1 < y2 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        this.setPixel(x1, y1, true);

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

      await this.updateDisplay();
    }

    async drawRect(x, y, w, h, filled = false) {
      x = Math.floor(x);
      y = Math.floor(y);
      w = Math.floor(w);
      h = Math.floor(h);

      if (filled) {
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < h; j++) {
            this.setPixel(x + i, y + j, true);
          }
        }
      } else {
        for (let i = 0; i < w; i++) {
          this.setPixel(x + i, y, true);
          this.setPixel(x + i, y + h - 1, true);
        }
        for (let j = 0; j < h; j++) {
          this.setPixel(x, y + j, true);
          this.setPixel(x + w - 1, y + j, true);
        }
      }

      await this.updateDisplay();
    }

    async drawCircle(x, y, r, filled = false) {
      x = Math.floor(x);
      y = Math.floor(y);
      r = Math.floor(r);

      if (filled) {
        for (let i = -r; i <= r; i++) {
          for (let j = -r; j <= r; j++) {
            if (i * i + j * j <= r * r) {
              this.setPixel(x + i, y + j, true);
            }
          }
        }
      } else {
        let px = 0;
        let py = r;
        let d = 1 - r;

        while (px <= py) {
          this.setPixel(x + px, y + py, true);
          this.setPixel(x - px, y + py, true);
          this.setPixel(x + px, y - py, true);
          this.setPixel(x - px, y - py, true);
          this.setPixel(x + py, y + px, true);
          this.setPixel(x - py, y + px, true);
          this.setPixel(x + py, y - px, true);
          this.setPixel(x - py, y - px, true);

          if (d < 0) {
            d += 2 * px + 3;
          } else {
            d += 2 * (px - py) + 5;
            py--;
          }
          px++;
        }
      }

      await this.updateDisplay();
    }

    async drawPattern(pattern) {
      this.clearScreenBuffer();

      switch (pattern) {
        case "checkerboard":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, ((x + y) % 2) === 0);
            }
          }
          break;

        case "stripes-h":
          for (let y = 0; y < DISPLAY_HEIGHT; y++) {
            for (let x = 0; x < DISPLAY_WIDTH; x++) {
              this.setPixel(x, y, (y % 4) < 2);
            }
          }
          break;

        case "stripes-v":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, (x % 4) < 2);
            }
          }
          break;

        case "grid":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            for (let y = 0; y < DISPLAY_HEIGHT; y++) {
              this.setPixel(x, y, (x % 10 === 0 || y % 10 === 0));
            }
          }
          break;

        case "dots":
          for (let x = 0; x < DISPLAY_WIDTH; x += 5) {
            for (let y = 0; y < DISPLAY_HEIGHT; y += 5) {
              this.setPixel(x, y, true);
            }
          }
          break;

        case "border":
          for (let x = 0; x < DISPLAY_WIDTH; x++) {
            this.setPixel(x, 0, true);
            this.setPixel(x, DISPLAY_HEIGHT - 1, true);
          }
          for (let y = 0; y < DISPLAY_HEIGHT; y++) {
            this.setPixel(0, y, true);
            this.setPixel(DISPLAY_WIDTH - 1, y, true);
          }
          break;

        case "smile":
          this.drawCircle(50, 32, 25, false);
          this.setPixel(40, 25, true);
          this.setPixel(60, 25, true);
          for (let x = 35; x <= 65; x++) {
            const y = 35 + Math.floor(Math.sqrt(225 - (x - 50) * (x - 50)) * 0.3);
            this.setPixel(x, y, true);
          }
          break;
      }

      await this.updateDisplay();
    }
  }

  // ==================== LEGO NXT EXTENSION WITH TRANSPILATION ====================

  class LegoNXTExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.peripheral = new NXTPeripheral(runtime);
      this.transpiler = new NXCTranspiler();
      
      // Code generation state
      this.nxcCode = null;
      this.rxeBase64 = null;
      this.compilerUrl = "https://lego-compiler.vercel.app";
      
      logger.log("Extension initialized with transpilation support");
    }

    getInfo() {
      return {
        id: "legonxt",
        name: "LEGO NXT",
        color1: "#FF6B00",
        color2: "#CC5500",
        blockIconURI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjRkY2QjAwIi8+PC9zdmc+",
        blocks: [
          "🔌 CONNECTION",
          {
            opcode: "connect",
            blockType: Scratch.BlockType.COMMAND,
            text: "connect to NXT",
          },
          {
            opcode: "disconnect",
            blockType: Scratch.BlockType.COMMAND,
            text: "disconnect from NXT",
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "connected to NXT?",
          },

          "---",
          "⚙️ MOTORS",
          {
            opcode: "motorOn",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
            },
          },
          {
            opcode: "motorRunDegrees",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER] for [DEGREES]°",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              DEGREES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
            },
          },
          {
            opcode: "motorRunRotations",
            blockType: Scratch.BlockType.COMMAND,
            text: "motor [PORT] power [POWER] for [ROTATIONS] rotations",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 75 },
              ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop motor [PORT] [ACTION]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
              ACTION: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_STOP", defaultValue: "brake" },
            },
          },
          {
            opcode: "getMotorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: "motor [PORT] position",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
            },
          },
          {
            opcode: "resetMotorPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: "reset motor [PORT] position",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MOTOR_PORT", defaultValue: "A" },
            },
          },

          "---",
          "🔘 TOUCH SENSOR",
          {
            opcode: "setupTouchSensorNXT",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup touch sensor on [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },
          {
            opcode: "isTouchPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "touch sensor [PORT] pressed?",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "💡 LIGHT SENSOR",
          {
            opcode: "setupLightSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup light sensor on [PORT] LED [STATE]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
              STATE: { type: Scratch.ArgumentType.STRING, menu: "LED_STATE", defaultValue: "on" },
            },
          },
          {
            opcode: "getLightLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: "light level on [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "🎨 COLOR SENSOR",
          {
            opcode: "setupColorSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup color sensor on [PORT] mode [MODE]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
              MODE: { type: Scratch.ArgumentType.STRING, menu: "COLOR_MODE", defaultValue: "all colors" },
            },
          },
          {
            opcode: "getColor",
            blockType: Scratch.BlockType.REPORTER,
            text: "color detected on [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "🔊 SOUND SENSOR",
          {
            opcode: "setupSoundSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup sound sensor on [PORT] mode [MODE]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
              MODE: { type: Scratch.ArgumentType.STRING, menu: "SOUND_MODE", defaultValue: "dBA" },
            },
          },
          {
            opcode: "getSoundLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: "sound level on [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "📏 ULTRASONIC SENSOR",
          {
            opcode: "setupUltrasonicSensor",
            blockType: Scratch.BlockType.COMMAND,
            text: "setup ultrasonic sensor on [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },
          {
            opcode: "getDistance",
            blockType: Scratch.BlockType.REPORTER,
            text: "distance on [PORT] (cm)",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "🎵 SOUND",
          {
            opcode: "playTone",
            blockType: Scratch.BlockType.COMMAND,
            text: "play tone [FREQ] Hz for [MS] ms",
            arguments: {
              FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 440 },
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1000 },
            },
          },
          {
            opcode: "playNote",
            blockType: Scratch.BlockType.COMMAND,
            text: "play note [NOTE] for [BEATS] beats",
            arguments: {
              NOTE: { type: Scratch.ArgumentType.STRING, menu: "NOTE", defaultValue: "C4" },
              BEATS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },

          "---",
          "🖥️ DISPLAY",
          {
            opcode: "captureScreen",
            blockType: Scratch.BlockType.COMMAND,
            text: "capture screen from NXT",
          },
          {
            opcode: "clearScreen",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear screen",
          },
          {
            opcode: "updateDisplay",
            blockType: Scratch.BlockType.COMMAND,
            text: "update display",
          },
          {
            opcode: "drawText",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw text [TEXT] at x:[X] y:[Y]",
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: "HELLO" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "drawPixel",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw pixel at x:[X] y:[Y] [STATE]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              STATE: { type: Scratch.ArgumentType.STRING, menu: "PIXEL_STATE", defaultValue: "on" },
            },
          },
          {
            opcode: "drawLine",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw line from x1:[X1] y1:[Y1] to x2:[X2] y2:[Y2]",
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 99 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 63 },
            },
          },
          {
            opcode: "drawRect",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw rectangle at x:[X] y:[Y] w:[W] h:[H] [FILL]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 25 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              FILL: { type: Scratch.ArgumentType.STRING, menu: "RECT_FILL", defaultValue: "outline" },
            },
          },
          {
            opcode: "drawCircle",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw circle at x:[X] y:[Y] radius:[R] [FILL]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              FILL: { type: Scratch.ArgumentType.STRING, menu: "RECT_FILL", defaultValue: "outline" },
            },
          },
          {
            opcode: "drawPattern",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw pattern [PATTERN]",
            arguments: {
              PATTERN: { type: Scratch.ArgumentType.STRING, menu: "PATTERN", defaultValue: "checkerboard" },
            },
          },

          "---",
          "📊 STATUS",
          {
            opcode: "getBattery",
            blockType: Scratch.BlockType.REPORTER,
            text: "battery level (mV)",
          },
          {
            opcode: "getRawSensorValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "raw value of sensor [PORT]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "SENSOR_PORT", defaultValue: "S1" },
            },
          },

          "---",
          "💾 CODE GENERATION",
          {
            opcode: "transpileProject",
            blockType: Scratch.BlockType.COMMAND,
            text: "transpile project to NXC",
          },
          {
            opcode: "showNXCCode",
            blockType: Scratch.BlockType.COMMAND,
            text: "show generated NXC code",
          },
          {
            opcode: "downloadNXC",
            blockType: Scratch.BlockType.COMMAND,
            text: "download as .nxc file",
          },
          {
            opcode: "compileToRXE",
            blockType: Scratch.BlockType.COMMAND,
            text: "compile NXC to .rxe",
          },
          {
            opcode: "uploadToNXT",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload program to NXT",
          },
          {
            opcode: "fullWorkflow",
            blockType: Scratch.BlockType.COMMAND,
            text: "🚀 transpile → compile → upload",
          },
        ],
        menus: {
          MOTOR_PORT: { acceptReporters: true, items: ["A", "B", "C"] },
          SENSOR_PORT: { acceptReporters: true, items: ["S1", "S2", "S3", "S4"] },
          SENSOR_TYPE_TOUCH: { acceptReporters: false, items: ["NXT", "EV3"] },
          COLOR_MODE: {
            acceptReporters: false,
            items: ["all colors", "red", "green", "blue", "none"],
          },
          MOTOR_STOP: { acceptReporters: false, items: ["brake", "coast"] },
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
              "smile",
            ],
          },
          NOTE: {
            acceptReporters: false,
            items: [
              "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
              "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
            ],
          },
        },
      };
    }

    // ==================== CONNECTION ====================
    connect() {
      return this.peripheral.connect();
    }
    disconnect() {
      return this.peripheral.disconnect();
    }
    isConnected() {
      return this.peripheral.isConnected();
    }

    // ==================== MOTORS ====================
    motorOn(args) {
      const power = Cast.toNumber(args.POWER);
      return this.peripheral.setMotorPower(args.PORT, power, true);
    }
    motorRunDegrees(args) {
      const power = Cast.toNumber(args.POWER);
      const degrees = Cast.toNumber(args.DEGREES);
      return this.peripheral.motorRunForDegrees(args.PORT, power, degrees);
    }
    motorRunRotations(args) {
      const power = Cast.toNumber(args.POWER);
      const rotations = Cast.toNumber(args.ROTATIONS);
      const degrees = rotations * 360;
      return this.peripheral.motorRunForDegrees(args.PORT, power, degrees);
    }
    motorStop(args) {
      const brake = args.ACTION === "brake";
      return this.peripheral.motorStop(args.PORT, brake);
    }
    getMotorPosition(args) {
      return this.peripheral.getMotorPosition(args.PORT);
    }
    resetMotorPosition(args) {
      return this.peripheral.resetMotorPosition(args.PORT, false);
    }

    // ==================== SENSORS ====================
    setupTouchSensorNXT(args) {
      return this.peripheral.setupTouchNXT(args.PORT);
    }
    async isTouchPressed(args) {
      const raw = await this.peripheral.getRawSensorValue(args.PORT);
      return raw < 500;
    }
    setupLightSensor(args) {
      const active = args.STATE === "on";
      return this.peripheral.setupLightSensor(args.PORT, active);
    }
    getLightLevel(args) {
      return this.peripheral.getSensorValue(args.PORT);
    }
    setupColorSensor(args) {
      const modeMap = {
        "all colors": "full",
        red: "red",
        green: "green",
        blue: "blue",
        none: "none",
      };
      return this.peripheral.setupColorSensor(args.PORT, modeMap[args.MODE]);
    }
    async getColor(args) {
      const portNum = PORT[args.PORT];
      const reply = await this.peripheral.sendTelegram(NXT_OPCODE.GET_IN_VALS, [portNum], true);
      if (reply && reply.length >= 11) {
        const colorIdx = reply[9];
        const colors = ["none", "black", "blue", "green", "yellow", "red", "white"];
        return colors[colorIdx] || "none";
      }
      return "none";
    }
    setupSoundSensor(args) {
      const adjusted = args.MODE === "dBA";
      return this.peripheral.setupSoundSensor(args.PORT, adjusted);
    }
    getSoundLevel(args) {
      return this.peripheral.getSensorValue(args.PORT);
    }
    setupUltrasonicSensor(args) {
      return this.peripheral.setupUltrasonicSensor(args.PORT);
    }
    getDistance(args) {
      return this.peripheral.getUltrasonicDistance(args.PORT);
    }

    // ==================== SOUND ====================
    playTone(args) {
      const freq = Cast.toNumber(args.FREQ);
      const ms = Cast.toNumber(args.MS);
      return this.peripheral.playTone(freq, ms);
    }
    playNote(args) {
      const noteFreqs = {
        C4: 262, "C#4": 277, D4: 294, "D#4": 311, E4: 330, F4: 349,
        "F#4": 370, G4: 392, "G#4": 415, A4: 440, "A#4": 466, B4: 494,
        C5: 523, "C#5": 554, D5: 587, "D#5": 622, E5: 659, F5: 698,
        "F#5": 740, G5: 784, "G#5": 831, A5: 880, "A#5": 932, B5: 988,
      };
      const freq = noteFreqs[args.NOTE] || 440;
      const beats = Cast.toNumber(args.BEATS);
      const ms = beats * 500;
      return this.peripheral.playTone(freq, ms);
    }

    // ==================== DISPLAY ====================
    captureScreen() {
      return this.peripheral.readScreenBuffer();
    }
    clearScreen() {
      return this.peripheral.clearScreenBuffer();
    }
    updateDisplay() {
      return this.peripheral.updateDisplay();
    }
    drawText(args) {
      return this.peripheral.drawText(args.TEXT, args.X, args.Y);
    }
    async drawPixel(args) {
      const on = args.STATE === "on";
      this.peripheral.setPixel(Cast.toNumber(args.X), Cast.toNumber(args.Y), on);
      await this.peripheral.updateDisplay();
    }
    drawLine(args) {
      return this.peripheral.drawLine(args.X1, args.Y1, args.X2, args.Y2);
    }
    drawRect(args) {
      const filled = args.FILL === "filled";
      return this.peripheral.drawRect(args.X, args.Y, args.W, args.H, filled);
    }
    drawCircle(args) {
      const filled = args.FILL === "filled";
      return this.peripheral.drawCircle(args.X, args.Y, args.R, filled);
    }
    drawPattern(args) {
      return this.peripheral.drawPattern(args.PATTERN);
    }

    // ==================== STATUS ====================
    getBattery() {
      return this.peripheral.getBatteryLevel();
    }
    async getRawSensorValue(args) {
      const value = await this.peripheral.getRawSensorValue(args.PORT);
      return value;
    }

    // ==================== TRANSPILATION ====================

    transpileProject() {
      logger.log("=".repeat(60));
      logger.log("TRANSPILE PROJECT TO NXC");
      logger.log("=".repeat(60));
      
      try {
        this.nxcCode = this.transpiler.transpileProject();
        logger.success("✅ Project successfully transpiled to NXC!");
        logger.log(`Generated ${this.nxcCode.split('\n').length} lines of code`);
        alert("✅ Project transpiled to NXC!\n\nCheck console for details.");
      } catch (error) {
        logger.error("Transpilation failed:", error);
        alert(`❌ Transpilation failed:\n\n${error.message}\n\nCheck console for details.`);
      }
    }

    showNXCCode() {
      logger.log("Showing NXC code...");
      
      if (!this.nxcCode) {
        alert("⚠️ Generate NXC code first using 'transpile project to NXC' block!");
        return;
      }

      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 3px solid #FF6B00;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        z-index: 100000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const title = document.createElement("h2");
      title.textContent = "📝 Generated NXC Code";
      title.style.cssText = "color: #FF6B00; margin: 0 0 15px 0; font-size: 24px;";

      const stats = document.createElement("div");
      stats.textContent = `Lines: ${this.nxcCode.split('\n').length} | Characters: ${this.nxcCode.length}`;
      stats.style.cssText = "color: #666; font-size: 14px; margin-bottom: 10px;";

      const pre = document.createElement("pre");
      pre.style.cssText = `
        background: #f5f5f5;
        padding: 15px;
        overflow: auto;
        max-height: 60vh;
        font-family: 'Courier New', Consolas, monospace;
        font-size: 13px;
        border-radius: 6px;
        color: #000;
        white-space: pre;
        line-height: 1.5;
        border: 1px solid #ddd;
      `;
      pre.textContent = this.nxcCode;

      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = "margin-top: 15px; display: flex; gap: 10px;";

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋 Copy to Clipboard";
      copyBtn.style.cssText = `
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
      `;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(this.nxcCode);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => copyBtn.textContent = "📋 Copy to Clipboard", 2000);
      };

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = `
        padding: 10px 20px;
        background: #FF6B00;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
      `;
      closeBtn.onclick = () => document.body.removeChild(modal);

      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(closeBtn);

      modal.appendChild(title);
      modal.appendChild(stats);
      modal.appendChild(pre);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);
      
      logger.success("Code viewer opened");
    }

    downloadNXC() {
      logger.log("Downloading NXC file...");
      
      if (!this.nxcCode) {
        alert("⚠️ Generate NXC code first using 'transpile project to NXC' block!");
        return;
      }

      try {
        const blob = new Blob([this.nxcCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nxt_program.nxc";
        a.click();
        URL.revokeObjectURL(url);
        
        logger.success("✅ Downloaded: nxt_program.nxc");
        alert("✅ Downloaded: nxt_program.nxc");
      } catch (error) {
        logger.error("Download failed:", error);
        alert(`❌ Download failed:\n\n${error.message}`);
      }
    }

    async compileToRXE() {
      logger.log("=".repeat(60));
      logger.log("COMPILE NXC TO RXE BYTECODE");
      logger.log("=".repeat(60));
      
      if (!this.nxcCode) {
        alert("⚠️ Generate NXC code first using 'transpile project to NXC' block!");
        return;
      }

      try {
        logger.log(`Sending request to: ${this.compilerUrl}/compile`);
        logger.log(`Code length: ${this.nxcCode.length} characters`);
        
        const response = await fetch(`${this.compilerUrl}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            compiler: "nxc", 
            code: this.nxcCode 
          }),
        });

        logger.log(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        logger.log("Compilation response:", result);

        if (result.success) {
          this.rxeBase64 = result.base64;
          
          // Decode to get file size
          const binaryString = atob(this.rxeBase64);
          logger.success(`✅ Compilation successful!`);
          logger.log(`RXE file size: ${binaryString.length} bytes`);
          
          let message = "✅ Compilation successful!";
          if (result.message) {
            logger.log("Compiler output:", result.message);
            message += `\n\nCompiler output:\n${result.message}`;
          }
          alert(message);
        } else {
          throw new Error(result.error || "Unknown compilation error");
        }
      } catch (error) {
        logger.error("Compilation failed:", error);
        alert(`❌ Compilation failed:\n\n${error.message}\n\nCheck console for details.`);
      }
    }

    async uploadToNXT() {
      logger.log("=".repeat(60));
      logger.log("UPLOAD RXE TO NXT");
      logger.log("=".repeat(60));
      
      if (!this.rxeBase64) {
        alert("⚠️ Compile to .rxe first using 'compile NXC to .rxe' block!");
        return;
      }

      if (!this.peripheral.connected) {
        alert("⚠️ Connect to NXT first using 'connect to NXT' block!");
        return;
      }

      try {
        logger.log("Decoding base64 RXE data...");
        const binaryString = atob(this.rxeBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        logger.log(`File size: ${bytes.length} bytes`);

        const filename = "program.rxe";
        const filenameBytes = new Array(20).fill(0);
        for (let i = 0; i < Math.min(filename.length, 19); i++) {
          filenameBytes[i] = filename.charCodeAt(i);
        }

        logger.log(`Opening file "${filename}" for writing...`);
        const openCmd = [
          ...filenameBytes,
          bytes.length & 0xff,
          (bytes.length >> 8) & 0xff,
          (bytes.length >> 16) & 0xff,
          (bytes.length >> 24) & 0xff,
        ];

        const openReply = await this.peripheral.sendTelegram(
          NXT_OPCODE.OPEN_WRITE,
          openCmd,
          true,
          true
        );

        if (!openReply || openReply[2] !== 0x00) {
          const errorCode = openReply ? openReply[2] : 0xff;
          throw new Error(`Failed to open file: ${NXT_ERROR[errorCode] || 'Unknown error'}`);
        }

        const handle = openReply[3];
        logger.log(`File opened with handle: ${handle}`);

        const chunkSize = 32;
        const totalChunks = Math.ceil(bytes.length / chunkSize);
        logger.log(`Uploading in ${totalChunks} chunks of ${chunkSize} bytes...`);

        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          const writeCmd = [handle, ...Array.from(chunk)];
          
          const writeReply = await this.peripheral.sendTelegram(
            NXT_OPCODE.WRITE,
            writeCmd,
            true,
            true
          );

          if (!writeReply || writeReply[2] !== 0x00) {
            throw new Error(`Write failed at byte ${i}`);
          }

          await this.peripheral.sleep(20);
          
          if (i % 320 === 0) {
            const progress = Math.round((i / bytes.length) * 100);
            logger.log(`Upload progress: ${progress}%`);
          }
        }

        logger.log("Closing file...");
        await this.peripheral.sendTelegram(NXT_OPCODE.CLOSE, [handle], true, true);

        logger.success("✅ Upload complete!");
        alert(`✅ Program uploaded to NXT!\n\nFile: ${filename}\nSize: ${bytes.length} bytes\n\nYou can now run "${filename}" from the NXT menu.`);
      } catch (error) {
        logger.error("Upload failed:", error);
        alert(`❌ Upload failed:\n\n${error.message}\n\nCheck console for details.`);
      }
    }

    async fullWorkflow() {
      logger.log("=".repeat(60));
      logger.log("FULL WORKFLOW: TRANSPILE → COMPILE → UPLOAD");
      logger.log("=".repeat(60));
      
      try {
        // Step 1: Transpile
        logger.log("\n[1/3] Transpiling project...");
        this.nxcCode = this.transpiler.transpileProject();
        logger.success("✅ Transpilation complete");
        await this.peripheral.sleep(500);
        
        // Step 2: Compile
        logger.log("\n[2/3] Compiling to bytecode...");
        const response = await fetch(`${this.compilerUrl}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compiler: "nxc", code: this.nxcCode }),
        });
        
        if (!response.ok) {
          throw new Error(`Compilation failed: HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Compilation failed");
        }
        
        this.rxeBase64 = result.base64;
        logger.success("✅ Compilation complete");
        await this.peripheral.sleep(500);
        
        // Step 3: Upload
        if (!this.peripheral.connected) {
          throw new Error("NXT not connected! Please connect first.");
        }
        
        logger.log("\n[3/3] Uploading to NXT...");
        const binaryString = atob(this.rxeBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const filename = "program.rxe";
        const filenameBytes = new Array(20).fill(0);
        for (let i = 0; i < Math.min(filename.length, 19); i++) {
          filenameBytes[i] = filename.charCodeAt(i);
        }
        
        const openCmd = [
          ...filenameBytes,
          bytes.length & 0xff,
          (bytes.length >> 8) & 0xff,
          (bytes.length >> 16) & 0xff,
          (bytes.length >> 24) & 0xff,
        ];
        
        const openReply = await this.peripheral.sendTelegram(
          NXT_OPCODE.OPEN_WRITE,
          openCmd,
          true,
          true
        );
        
        if (!openReply || openReply[2] !== 0x00) {
          throw new Error("Failed to open file on NXT");
        }
        
        const handle = openReply[3];
        const chunkSize = 32;
        
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
          const writeCmd = [handle, ...Array.from(chunk)];
          await this.peripheral.sendTelegram(NXT_OPCODE.WRITE, writeCmd, true, true);
          await this.peripheral.sleep(20);
          
          if (i % 320 === 0) {
            logger.log(`Upload: ${Math.round((i / bytes.length) * 100)}%`);
          }
        }
        
        await this.peripheral.sendTelegram(NXT_OPCODE.CLOSE, [handle], true, true);
        
        logger.success("✅ Upload complete!");
        logger.log("=".repeat(60));
        logger.success("🎉 WORKFLOW COMPLETE!");
        logger.log("=".repeat(60));
        
        alert(`🎉 SUCCESS!\n\n✅ Transpiled\n✅ Compiled\n✅ Uploaded\n\nFile: ${filename}\nSize: ${bytes.length} bytes\n\nRun "${filename}" from the NXT menu!`);
      } catch (error) {
        logger.error("Workflow failed:", error);
        alert(`❌ Workflow failed:\n\n${error.message}\n\nCheck console for details.`);
      }
    }
  }

  Scratch.extensions.register(new LegoNXTExtension());
  logger.success("🎉 LEGO NXT Extension loaded with full transpilation support!");
})(Scratch);