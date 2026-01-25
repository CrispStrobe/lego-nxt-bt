(function (Scratch) {
  "use strict";

  // ============================================================================
  // INTERNATIONALIZATION (i18n)
  // ============================================================================

  const translations = {
    en: {
      // Extension Info
      extensionName: "EV3 LMS (Original Firmware)",

      // Connection
      connection: "Connection",
      setEV3IP: "set EV3 IP to [IP]",
      setLMSApiUrl: "set LMS compiler API to [URL]:[PORT]",
      enableStreaming: "enable streaming mode",
      disableStreaming: "disable streaming mode",
      testConnection: "test EV3 connection",
      testCompiler: "test LMS compiler connection",

      // Transpilation & Compilation
      transpilation: "Code Generation & Compilation",
      transpileToLMS: "generate LMS assembly code",
      showLMSCode: "show generated LMS code",
      downloadLMSCode: "download as .lms file",
      compileToRBF: "compile to RBF bytecode",
      showRBFCode: "show RBF bytecode (hex)",
      downloadRBF: "download as .rbf file",
      uploadAndRun: "upload RBF to EV3 and run",

      // Script Management
      scriptManagement: "Script Management",
      uploadRBF: "upload RBF as [NAME]",
      runScript: "run script [NAME]",
      stopScript: "stop script [NAME]",
      deleteScript: "delete script [NAME]",
      listScripts: "list of scripts (JSON)",

      // Motors
      motors: "EV3 Motors",
      motorRun: "motor [PORT] run at [POWER]%",
      motorRunTime: "motor [PORT] run for [TIME] seconds at [POWER]%",
      motorRunRotations: "motor [PORT] run [ROTATIONS] rotations at [POWER]%",
      motorRunDegrees: "motor [PORT] run [DEGREES] degrees at [POWER]%",
      motorStop: "motor [PORT] stop [BRAKE]",
      motorReset: "reset motor [PORT]",
      tankDrive: "tank drive L:[LEFT] R:[RIGHT] for [VALUE] [UNIT]",
      steerDrive: "steer [STEERING] speed [SPEED]% for [VALUE] [UNIT]",
      motorPosition: "motor [PORT] position",
      motorSpeed: "motor [PORT] speed",

      // Sensors
      sensors: "EV3 Sensors",
      touchSensor: "touch sensor [PORT] pressed?",
      touchSensorBumped: "touch sensor [PORT] bumped?",
      colorSensor: "color sensor [PORT] [MODE]",
      colorSensorRGB: "color sensor [PORT] RGB [COMPONENT]",
      ultrasonicSensor: "ultrasonic sensor [PORT] distance [UNIT]",
      ultrasonicListen: "ultrasonic sensor [PORT] detect?",
      gyroSensor: "gyro sensor [PORT] [MODE]",
      gyroReset: "reset gyro sensor [PORT]",

      // Infrared
      infrared: "Infrared Sensor",
      irProximity: "infrared [PORT] proximity",
      irBeaconHeading: "infrared [PORT] beacon heading ch[CHANNEL]",
      irBeaconDistance: "infrared [PORT] beacon distance ch[CHANNEL]",
      irRemoteButton: "infrared [PORT] ch[CHANNEL] button [BUTTON] pressed?",

      // Buttons
      buttons: "EV3 Buttons",
      buttonPressed: "button [BUTTON] pressed?",
      waitForButton: "wait for button [BUTTON]",

      // Display
      display: "Display",
      screenClear: "clear screen",
      screenText: "show text [TEXT] at x:[X] y:[Y]",
      screenTextLarge: "show large text [TEXT] at x:[X] y:[Y]",
      drawPixel: "draw pixel at x:[X] y:[Y]",
      drawLine: "draw line from x1:[X1] y1:[Y1] to x2:[X2] y2:[Y2]",
      drawCircle: "draw circle at x:[X] y:[Y] radius:[R] [FILL]",
      drawRectangle: "draw rectangle x:[X] y:[Y] width:[W] height:[H] [FILL]",
      screenUpdate: "update screen",
      screenInvert: "invert screen",

      // Sound
      sound: "Sound",
      playTone: "play tone [FREQ] Hz for [DURATION] ms",
      playNote: "play note [NOTE] for [DURATION] beats",
      playSong: "play song [SONG]",
      beep: "beep",
      setVolume: "set volume to [VOLUME]%",
      getVolume: "volume %",
      stopSound: "stop all sounds",

      // LEDs
      leds: "LEDs",
      setLED: "set LED to [COLOR]",
      setLEDSide: "set LED [SIDE] to [COLOR]",
      ledPattern: "LED pattern [PATTERN] speed [SPEED]",
      ledAllOff: "turn all LEDs off",

      // System
      system: "System",
      batteryLevel: "battery level %",
      batteryCurrent: "battery current mA",
      batteryVoltage: "battery voltage V",
      freeMemory: "free memory KB",

      // Timers
      timers: "Timers",
      resetTimer: "reset timer [TIMER]",
      timerValue: "timer [TIMER]",
      waitSeconds: "wait [TIME] seconds",
      waitMillis: "wait [TIME] milliseconds",

      // Messages
      noCodeGenerated: "No LMS code generated yet!",
      generateFirst: "Generate LMS code first!",
      compileFirst: "Compile to RBF first!",
      downloaded: "Downloaded",
      connected: "Connected",
      notConnected: "Not connected",
      compilationSuccess: "✅ Compilation successful!",
      compilationFailed: "❌ Compilation failed",
      uploadSuccess: "✅ Upload successful!",
      uploadFailed: "❌ Upload failed",

      // Modal
      generatedCode: "Generated LMS Assembly Code",
      rbfBytecode: "RBF Bytecode (Hex)",
      close: "Close",
    },

    de: {
      // Extension Info
      extensionName: "EV3 LMS (Original Firmware)",

      // Connection
      connection: "Verbindung",
      setEV3IP: "setze EV3 IP auf [IP]",
      setLMSApiUrl: "setze LMS Compiler API auf [URL]:[PORT]",
      enableStreaming: "Streaming-Modus aktivieren",
      disableStreaming: "Streaming-Modus deaktivieren",
      testConnection: "EV3 Verbindung testen",
      testCompiler: "LMS Compiler Verbindung testen",

      // Transpilation & Compilation
      transpilation: "Code-Generierung & Kompilierung",
      transpileToLMS: "generiere LMS Assembly Code",
      showLMSCode: "zeige generierten LMS Code",
      downloadLMSCode: "als .lms Datei herunterladen",
      compileToRBF: "zu RBF Bytecode kompilieren",
      showRBFCode: "zeige RBF Bytecode (Hex)",
      downloadRBF: "als .rbf Datei herunterladen",
      uploadAndRun: "RBF zu EV3 hochladen und ausführen",

      // Script Management
      scriptManagement: "Skript-Verwaltung",
      uploadRBF: "RBF hochladen als [NAME]",
      runScript: "Skript ausführen [NAME]",
      stopScript: "Skript stoppen [NAME]",
      deleteScript: "Skript löschen [NAME]",
      listScripts: "Liste der Skripte (JSON)",

      // Motors
      motors: "EV3 Motoren",
      motorRun: "Motor [PORT] läuft mit [POWER]%",
      motorRunTime: "Motor [PORT] läuft für [TIME] Sekunden mit [POWER]%",
      motorRunRotations:
        "Motor [PORT] läuft [ROTATIONS] Umdrehungen mit [POWER]%",
      motorRunDegrees: "Motor [PORT] läuft [DEGREES] Grad mit [POWER]%",
      motorStop: "Motor [PORT] stopp [BRAKE]",
      motorReset: "Motor [PORT] zurücksetzen",
      tankDrive: "Kettenantrieb L:[LEFT] R:[RIGHT] für [VALUE] [UNIT]",
      steerDrive: "Lenken [STEERING] Geschw. [SPEED]% für [VALUE] [UNIT]",
      motorPosition: "Motor [PORT] Position",
      motorSpeed: "Motor [PORT] Geschwindigkeit",

      // Sensors
      sensors: "EV3 Sensoren",
      touchSensor: "Berührungssensor [PORT] gedrückt?",
      touchSensorBumped: "Berührungssensor [PORT] gestoßen?",
      colorSensor: "Farbsensor [PORT] [MODE]",
      colorSensorRGB: "Farbsensor [PORT] RGB [COMPONENT]",
      ultrasonicSensor: "Ultraschallsensor [PORT] Entfernung [UNIT]",
      ultrasonicListen: "Ultraschallsensor [PORT] erkennt?",
      gyroSensor: "Gyrosensor [PORT] [MODE]",
      gyroReset: "Gyrosensor [PORT] zurücksetzen",

      // Infrared
      infrared: "Infrarotsensor",
      irProximity: "Infrarot [PORT] Nähe",
      irBeaconHeading: "Infrarot [PORT] Bake Richtung Kanal[CHANNEL]",
      irBeaconDistance: "Infrarot [PORT] Bake Entfernung Kanal[CHANNEL]",
      irRemoteButton: "Infrarot [PORT] Kanal[CHANNEL] Taste [BUTTON] gedrückt?",

      // Buttons
      buttons: "EV3 Tasten",
      buttonPressed: "Taste [BUTTON] gedrückt?",
      waitForButton: "warte auf Taste [BUTTON]",

      // Display
      display: "Anzeige",
      screenClear: "Bildschirm löschen",
      screenText: "zeige Text [TEXT] bei x:[X] y:[Y]",
      screenTextLarge: "zeige großen Text [TEXT] bei x:[X] y:[Y]",
      drawPixel: "zeichne Pixel bei x:[X] y:[Y]",
      drawLine: "zeichne Linie von x1:[X1] y1:[Y1] zu x2:[X2] y2:[Y2]",
      drawCircle: "zeichne Kreis bei x:[X] y:[Y] Radius:[R] [FILL]",
      drawRectangle: "zeichne Rechteck x:[X] y:[Y] Breite:[W] Höhe:[H] [FILL]",
      screenUpdate: "Bildschirm aktualisieren",
      screenInvert: "Bildschirm invertieren",

      // Sound
      sound: "Sound",
      playTone: "spiele Ton [FREQ] Hz für [DURATION] ms",
      playNote: "spiele Note [NOTE] für [DURATION] Takte",
      playSong: "spiele Lied [SONG]",
      beep: "piep",
      setVolume: "setze Lautstärke auf [VOLUME]%",
      getVolume: "Lautstärke %",
      stopSound: "alle Sounds stoppen",

      // LEDs
      leds: "LEDs",
      setLED: "setze LED auf [COLOR]",
      setLEDSide: "setze LED [SIDE] auf [COLOR]",
      ledPattern: "LED Muster [PATTERN] Geschw. [SPEED]",
      ledAllOff: "alle LEDs ausschalten",

      // System
      system: "System",
      batteryLevel: "Batteriestand %",
      batteryCurrent: "Batteriestrom mA",
      batteryVoltage: "Batteriespannung V",
      freeMemory: "freier Speicher KB",

      // Timers
      timers: "Timer",
      resetTimer: "Timer [TIMER] zurücksetzen",
      timerValue: "Timer [TIMER]",
      waitSeconds: "warte [TIME] Sekunden",
      waitMillis: "warte [TIME] Millisekunden",

      // Messages
      noCodeGenerated: "Noch kein LMS Code generiert!",
      generateFirst: "Generiere zuerst LMS Code!",
      compileFirst: "Kompiliere zuerst zu RBF!",
      downloaded: "Heruntergeladen",
      connected: "Verbunden",
      notConnected: "Nicht verbunden",
      compilationSuccess: "✅ Kompilierung erfolgreich!",
      compilationFailed: "❌ Kompilierung fehlgeschlagen",
      uploadSuccess: "✅ Upload erfolgreich!",
      uploadFailed: "❌ Upload fehlgeschlagen",

      // Modal
      generatedCode: "Generierter LMS Assembly Code",
      rbfBytecode: "RBF Bytecode (Hex)",
      close: "Schließen",
    },
  };

  // Language detection
  function detectLanguage() {
    let finalLanguage = "en";

    try {
      if (window.ReduxStore && window.ReduxStore.getState) {
        const state = window.ReduxStore.getState();
        const reduxLocale = state.locales?.locale;
        if (reduxLocale && typeof reduxLocale === "string") {
          return reduxLocale.toLowerCase().startsWith("de") ? "de" : "en";
        }
      }
    } catch (e) {}

    try {
      const twSettings = localStorage.getItem("tw:language");
      if (twSettings) {
        return twSettings.toLowerCase().startsWith("de") ? "de" : "en";
      }
    } catch (e) {}

    try {
      const navLang = navigator.language;
      if (navLang) {
        return navLang.toLowerCase().startsWith("de") ? "de" : "en";
      }
    } catch (e) {}

    return finalLanguage;
  }

  let currentLang = detectLanguage();

  function t(key) {
    return translations[currentLang][key] || translations["en"][key] || key;
  }

  // ============================================================================
  // LMS ASSEMBLY TRANSPILER
  // ============================================================================

  class LMSTranspiler {
    constructor() {
      this.lmsCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.labelCounter = 0;
      this.threadCounter = 0;
      this.variables = new Map(); // Maps Scratch variable names to LMS variable info
      this.globalVars = []; // Track global variables
      this.localVars = []; // Track local variables in current scope
      this.timerVars = new Map(); // Maps timer IDs to LMS variables
      this.broadcastHandlers = new Map(); // Maps broadcast names to label names
      this.debugLog = [];
      this.currentThread = "MAIN";
      this.spriteStates = {};

      // LMS opcode constants
      this.opcodes = {
        // Motor opcodes
        OUTPUT_POWER: "opOUTPUT_POWER",
        OUTPUT_START: "opOUTPUT_START",
        OUTPUT_STOP: "opOUTPUT_STOP",
        OUTPUT_SPEED: "opOUTPUT_SPEED",
        OUTPUT_TIME_POWER: "opOUTPUT_TIME_POWER",
        OUTPUT_TIME_SPEED: "opOUTPUT_TIME_SPEED",
        OUTPUT_STEP_POWER: "opOUTPUT_STEP_POWER",
        OUTPUT_STEP_SPEED: "opOUTPUT_STEP_SPEED",
        OUTPUT_READ: "opOUTPUT_READ",
        OUTPUT_RESET: "opOUTPUT_RESET",
        OUTPUT_CLR_COUNT: "opOUTPUT_CLR_COUNT",
        OUTPUT_GET_COUNT: "opOUTPUT_GET_COUNT",

        // Sensor opcodes
        INPUT_DEVICE: "opINPUT_DEVICE",
        INPUT_READ: "opINPUT_READ",
        INPUT_READSI: "opINPUT_READSI",
        INPUT_READY: "opINPUT_READY",

        // Display opcodes
        UI_DRAW: "opUI_DRAW",
        UI_WRITE: "opUI_WRITE",

        // Sound opcodes
        SOUND: "opSOUND",
        SOUND_READY: "opSOUND_READY",

        // LED opcodes
        UI_BUTTON: "opUI_BUTTON",

        // Timer opcodes
        TIMER_WAIT: "opTIMER_WAIT",
        TIMER_READY: "opTIMER_READY",
        TIMER_READ: "opTIMER_READ",

        // System opcodes
        UI_READ: "opUI_READ",
        INFO: "opINFO",

        // Program flow
        JR: "JR",
        JR_FALSE: "JR_FALSE",
        JR_TRUE: "JR_TRUE",
        JR_NAN: "JR_NAN",
        CALL: "CALL",
        RETURN: "RETURN",
        OBJECT_END: "OBJECT_END",

        // Math operations
        ADD8: "ADD8",
        ADD16: "ADD16",
        ADD32: "ADD32",
        ADDF: "ADDF",
        SUB8: "SUB8",
        SUB16: "SUB16",
        SUB32: "SUB32",
        SUBF: "SUBF",
        MUL8: "MUL8",
        MUL16: "MUL16",
        MUL32: "MUL32",
        MULF: "MULF",
        DIV8: "DIV8",
        DIV16: "DIV16",
        DIV32: "DIV32",
        DIVF: "DIVF",
        OR8: "OR8",
        OR16: "OR16",
        OR32: "OR32",
        AND8: "AND8",
        AND16: "AND16",
        AND32: "AND32",
        XOR8: "XOR8",
        XOR16: "XOR16",
        XOR32: "XOR32",

        // Comparison
        CP_LT8: "CP_LT8",
        CP_LT16: "CP_LT16",
        CP_LT32: "CP_LT32",
        CP_LTF: "CP_LTF",
        CP_GT8: "CP_GT8",
        CP_GT16: "CP_GT16",
        CP_GT32: "CP_GT32",
        CP_GTF: "CP_GTF",
        CP_EQ8: "CP_EQ8",
        CP_EQ16: "CP_EQ16",
        CP_EQ32: "CP_EQ32",
        CP_EQF: "CP_EQF",
        CP_NEQ8: "CP_NEQ8",
        CP_NEQ16: "CP_NEQ16",
        CP_NEQ32: "CP_NEQ32",
        CP_NEQF: "CP_NEQF",
        CP_LTEQ8: "CP_LTEQ8",
        CP_LTEQ16: "CP_LTEQ16",
        CP_LTEQ32: "CP_LTEQ32",
        CP_LTEQF: "CP_LTEQF",
        CP_GTEQ8: "CP_GTEQ8",
        CP_GTEQ16: "CP_GTEQ16",
        CP_GTEQ32: "CP_GTEQ32",
        CP_GTEQF: "CP_GTEQF",

        // Move operations
        MOVE8_8: "MOVE8_8",
        MOVE8_16: "MOVE8_16",
        MOVE8_32: "MOVE8_32",
        MOVE8_F: "MOVE8_F",
        MOVE16_8: "MOVE16_8",
        MOVE16_16: "MOVE16_16",
        MOVE16_32: "MOVE16_32",
        MOVE16_F: "MOVE16_F",
        MOVE32_8: "MOVE32_8",
        MOVE32_16: "MOVE32_16",
        MOVE32_32: "MOVE32_32",
        MOVE32_F: "MOVE32_F",
        MOVEF_8: "MOVEF_8",
        MOVEF_16: "MOVEF_16",
        MOVEF_32: "MOVEF_32",
        MOVEF_F: "MOVEF_F",
      };

      // UI_DRAW subcodes
      this.UI_DRAW = {
        UPDATE: "UPDATE",
        CLEAN: "CLEAN",
        PIXEL: "PIXEL",
        LINE: "LINE",
        CIRCLE: "CIRCLE",
        TEXT: "TEXT",
        ICON: "ICON",
        PICTURE: "PICTURE",
        VALUE: "VALUE",
        FILLRECT: "FILLRECT",
        RECT: "RECT",
        NOTIFICATION: "NOTIFICATION",
        QUESTION: "QUESTION",
        KEYBOARD: "KEYBOARD",
        BROWSE: "BROWSE",
        VERTBAR: "VERTBAR",
        INVERSERECT: "INVERSERECT",
        SELECT_FONT: "SELECT_FONT",
        TOPLINE: "TOPLINE",
        FILLWINDOW: "FILLWINDOW",
        SCROLL: "SCROLL",
        DOTLINE: "DOTLINE",
        VIEW_VALUE: "VIEW_VALUE",
        VIEW_UNIT: "VIEW_UNIT",
        FILLCIRCLE: "FILLCIRCLE",
        STORE: "STORE",
        RESTORE: "RESTORE",
        ICON_QUESTION: "ICON_QUESTION",
        BMPFILE: "BMPFILE",
        POPUP: "POPUP",
        GRAPH_SETUP: "GRAPH_SETUP",
        GRAPH_DRAW: "GRAPH_DRAW",
        TEXTBOX: "TEXTBOX",
      };

      // SOUND subcodes
      this.SOUND_CMD = {
        BREAK: "BREAK",
        TONE: "TONE",
        PLAY: "PLAY",
        REPEAT: "REPEAT",
        SERVICE: "SERVICE",
      };

      // Port definitions
      this.OUTPUT_PORTS = {
        A: "0x01",
        B: "0x02",
        C: "0x04",
        D: "0x08",
        ALL: "0x0F",
      };

      this.INPUT_PORTS = {
        1: "0",
        2: "1",
        3: "2",
        4: "3",
      };

      // Sensor types
      this.SENSOR_TYPE = {
        NONE: "0",
        TOUCH: "16",
        TEMP: "17",
        LIGHT: "18",
        SOUND: "19",
        COLOR: "29",
        ULTRASONIC: "30",
        GYRO: "32",
        IR: "33",
        EV3_TOUCH: "16",
        EV3_COLOR: "29",
        EV3_ULTRASONIC: "30",
        EV3_GYRO: "32",
        EV3_IR: "33",
        NXT_TOUCH: "1",
        NXT_LIGHT: "2",
        NXT_SOUND: "3",
        NXT_COLOR: "4",
        NXT_ULTRASONIC: "5",
        NXT_TEMP: "6",
      };

      // Sensor modes
      this.SENSOR_MODE = {
        // Touch
        TOUCH: "0",
        // Color
        COLOR_REFLECTED: "0",
        COLOR_AMBIENT: "1",
        COLOR_COLOR: "2",
        COLOR_REFLECTED_RAW: "3",
        COLOR_RGB_RAW: "4",
        COLOR_CALIBRATION: "5",
        // Ultrasonic
        US_DIST_CM: "0",
        US_DIST_IN: "1",
        US_LISTEN: "2",
        // Gyro
        GYRO_ANGLE: "0",
        GYRO_RATE: "1",
        GYRO_FAS: "2",
        GYRO_G_AND_A: "3",
        GYRO_CALIBRATE: "4",
        // IR
        IR_PROX: "0",
        IR_SEEK: "1",
        IR_REMOTE: "2",
      };

      // LED colors
      this.LED_COLOR = {
        OFF: "0",
        GREEN: "1",
        RED: "2",
        ORANGE: "3",
        GREEN_FLASH: "4",
        RED_FLASH: "5",
        ORANGE_FLASH: "6",
        GREEN_PULSE: "7",
        RED_PULSE: "8",
        ORANGE_PULSE: "9",
      };
    }

    log(message, data = null) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [LMS] ${message}`;
      if (data !== null) {
        console.log(logEntry, data);
      } else {
        console.log(logEntry);
      }
      this.debugLog.push({ timestamp, message, data });
    }

    indent() {
      return "  ".repeat(this.indentLevel);
    }

    addLine(code) {
      this.lmsCode += this.indent() + code + "\n";
      this.log(`Added line: ${code}`);
    }

    addComment(comment) {
      this.addLine(`// ${comment}`);
    }

    allocateVariable(type, name = null, isGlobal = false) {
      const varName = name || `var${this.variableCounter++}`;
      const fullType = this.getDataType(type);

      if (isGlobal) {
        this.globalVars.push({ name: varName, type: fullType });
      } else {
        this.localVars.push({ name: varName, type: fullType });
        this.addLine(`${fullType} ${varName}`);
      }

      this.log(`Allocated variable: ${varName} (${fullType})`, { isGlobal });
      return varName;
    }

    getDataType(type) {
      const types = {
        8: "DATA8",
        16: "DATA16",
        32: "DATA32",
        F: "DATAF",
        S: "DATAS",
      };
      return types[type] || "DATA32";
    }

    generateLabel(prefix = "LABEL") {
      const label = `${prefix}_${this.labelCounter++}`;
      this.log(`Generated label: ${label}`);
      return label;
    }

    transpile() {
      this.log("=== Starting LMS Transpilation ===");
      this.reset();

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        this.log("Found targets", { count: targets.length });

        // Collect sprite states
        for (const target of targets) {
          if (!target.isStage) {
            this.spriteStates[target.sprite.name] = {
              x: target.x || 0,
              y: target.y || 0,
              direction: target.direction || 90,
              size: target.size || 100,
              visible: target.visible !== false,
            };
          }
        }

        this.log("Sprite states collected", this.spriteStates);

        // Generate LMS header
        this.generateHeader();

        // Process each sprite/stage
        for (const target of targets) {
          this.log(`Processing ${target.isStage ? "stage" : "sprite"}`, {
            name: target.sprite.name,
          });
          this.processTarget(target);
        }

        // Generate broadcast handlers as subcalls
        this.generateBroadcastSubcalls();

        // Close main thread
        this.addLine("}");

        this.log("=== LMS Transpilation Complete ===", {
          codeLength: this.lmsCode.length,
          lines: this.lmsCode.split("\n").length,
        });

        console.log("=== GENERATED LMS CODE ===\n" + this.lmsCode);

        return this.lmsCode;
      } catch (error) {
        this.log("ERROR during transpilation", {
          error: error.message,
          stack: error.stack,
        });
        console.error(error);
        throw error;
      }
    }

    reset() {
      this.lmsCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.labelCounter = 0;
      this.threadCounter = 0;
      this.variables.clear();
      this.globalVars = [];
      this.localVars = [];
      this.timerVars.clear();
      this.broadcastHandlers.clear();
      this.debugLog = [];
      this.currentThread = "MAIN";
      this.spriteStates = {};
    }

    generateHeader() {
      this.addComment("Generated LMS Assembly from Scratch");
      this.addComment("by TurboWarp EV3 LMS Extension v2.0");
      this.addComment(`Language: ${currentLang}`);
      this.addComment(`Generated: ${new Date().toISOString()}`);
      this.addLine("");

      this.addLine("vmthread MAIN");
      this.addLine("{");
      this.indentLevel++;

      // Declare global variables
      this.addComment("Global variables");
      this.addLine("DATA8 layer");
      this.addLine("DATA8 port");
      this.addLine("DATA8 ports");
      this.addLine("DATA8 power");
      this.addLine("DATA8 brake");
      this.addLine("DATA32 time_ms");
      this.addLine("DATA32 degrees");
      this.addLine("DATA32 rotations");
      this.addLine("DATA16 frequency");
      this.addLine("DATA16 duration");
      this.addLine("DATA8 type");
      this.addLine("DATA8 mode");
      this.addLine("DATA8 sensor_value8");
      this.addLine("DATA16 sensor_value16");
      this.addLine("DATA32 sensor_value32");
      this.addLine("DATAF sensor_valuef");
      this.addLine("DATA8 result8");
      this.addLine("DATA16 result16");
      this.addLine("DATA32 result32");
      this.addLine("DATAF resultf");
      this.addLine("DATA8 temp8");
      this.addLine("DATA16 temp16");
      this.addLine("DATA32 temp32");
      this.addLine("DATAF tempf");
      this.addLine("");

      // Initialize layer to 0
      this.addComment("Initialize layer");
      this.addLine("MOVE8_8(0, layer)");
      this.addLine("");
    }

    processTarget(target) {
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      const blockKeys = Object.keys(blockArray);

      // Find hat blocks (entry points)
      const hatBlocks = [];
      for (const blockKey of blockKeys) {
        const block = blockArray[blockKey];
        if (block.opcode && block.opcode.startsWith("event_when")) {
          hatBlocks.push(block);
        }
      }

      this.log("Found hat blocks", { count: hatBlocks.length });

      // Process hat blocks
      for (const hatBlock of hatBlocks) {
        this.processHatBlock(hatBlock, blocks);
      }
    }

    processHatBlock(hatBlock, blocks) {
      const opcode = hatBlock.opcode;
      this.addComment(`Event: ${opcode}`);

      if (opcode === "event_whenflagclicked") {
        // Process directly in main thread
        this.addComment("When green flag clicked");
        this.processBlockChain(hatBlock.next, blocks);
      } else if (opcode === "event_whenbroadcastreceived") {
        const broadcastName = this.getFieldValue(hatBlock, "BROADCAST_OPTION");
        const labelName = this.generateLabel(
          `ON_${this.sanitizeName(broadcastName)}`,
        );

        this.broadcastHandlers.set(broadcastName, {
          label: labelName,
          startBlock: hatBlock.next,
        });

        this.log(
          `Registered broadcast handler: ${broadcastName} -> ${labelName}`,
        );
      } else if (opcode === "event_whenkeypressed") {
        // Key pressed events not supported in LMS - log warning
        this.addComment("WARNING: Key press events not supported in LMS");
        this.log("WARNING: Key press event not supported in LMS");
      }
    }

    generateBroadcastSubcalls() {
      if (this.broadcastHandlers.size === 0) return;

      this.addLine("");
      this.addComment("Broadcast handler subcalls");

      for (const [broadcastName, handler] of this.broadcastHandlers.entries()) {
        this.addLine("");
        this.addLine(`${handler.label}:`);
        this.indentLevel++;

        if (handler.startBlock) {
          this.processBlockChain(handler.startBlock, this.currentBlocks);
        } else {
          this.addComment("Empty broadcast handler");
        }

        this.addLine("RETURN()");
        this.indentLevel--;
      }
    }

    processBlockChain(blockId, blocks) {
      this.currentBlocks = blocks;
      let currentId = blockId;
      let chainLength = 0;
      const maxChainLength = 10000;

      while (currentId) {
        const block = blocks._blocks[currentId];
        if (!block) {
          this.log("Block not found, ending chain", { blockId: currentId });
          break;
        }

        chainLength++;
        if (chainLength > maxChainLength) {
          this.log("WARNING: Block chain too long, stopping", { chainLength });
          this.addComment(`WARNING: Chain exceeded ${maxChainLength} blocks`);
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }

      this.log(`Processed block chain: ${chainLength} blocks`);
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.log(`Processing block: ${opcode}`, { block: block.id });

      try {
        // Motor blocks
        if (opcode === "ev3lms_motorRun") {
          this.transpileMotorRun(block, blocks);
        } else if (opcode === "ev3lms_motorRunTime") {
          this.transpileMotorRunTime(block, blocks);
        } else if (opcode === "ev3lms_motorRunRotations") {
          this.transpileMotorRunRotations(block, blocks);
        } else if (opcode === "ev3lms_motorRunDegrees") {
          this.transpileMotorRunDegrees(block, blocks);
        } else if (opcode === "ev3lms_motorStop") {
          this.transpileMotorStop(block, blocks);
        } else if (opcode === "ev3lms_motorReset") {
          this.transpileMotorReset(block, blocks);
        } else if (opcode === "ev3lms_tankDrive") {
          this.transpileTankDrive(block, blocks);
        } else if (opcode === "ev3lms_steerDrive") {
          this.transpileSteerDrive(block, blocks);
        }

        // Display blocks
        else if (opcode === "ev3lms_screenClear") {
          this.transpileScreenClear(block, blocks);
        } else if (opcode === "ev3lms_screenText") {
          this.transpileScreenText(block, blocks);
        } else if (opcode === "ev3lms_screenTextLarge") {
          this.transpileScreenTextLarge(block, blocks);
        } else if (opcode === "ev3lms_drawPixel") {
          this.transpileDrawPixel(block, blocks);
        } else if (opcode === "ev3lms_drawLine") {
          this.transpileDrawLine(block, blocks);
        } else if (opcode === "ev3lms_drawCircle") {
          this.transpileDrawCircle(block, blocks);
        } else if (opcode === "ev3lms_drawRectangle") {
          this.transpileDrawRectangle(block, blocks);
        } else if (opcode === "ev3lms_screenUpdate") {
          this.transpileScreenUpdate(block, blocks);
        } else if (opcode === "ev3lms_screenInvert") {
          this.transpileScreenInvert(block, blocks);
        }

        // Sound blocks
        else if (opcode === "ev3lms_playTone") {
          this.transpilePlayTone(block, blocks);
        } else if (opcode === "ev3lms_playNote") {
          this.transpilePlayNote(block, blocks);
        } else if (opcode === "ev3lms_beep") {
          this.transpileBeep(block, blocks);
        } else if (opcode === "ev3lms_setVolume") {
          this.transpileSetVolume(block, blocks);
        } else if (opcode === "ev3lms_stopSound") {
          this.transpileStopSound(block, blocks);
        }

        // LED blocks
        else if (opcode === "ev3lms_setLED") {
          this.transpileSetLED(block, blocks);
        } else if (opcode === "ev3lms_ledAllOff") {
          this.transpileLEDAllOff(block, blocks);
        }

        // Control blocks
        else if (opcode === "control_wait") {
          this.transpileWait(block, blocks);
        } else if (opcode === "ev3lms_waitSeconds") {
          this.transpileWaitSeconds(block, blocks);
        } else if (opcode === "ev3lms_waitMillis") {
          this.transpileWaitMillis(block, blocks);
        } else if (opcode === "control_repeat") {
          this.transpileRepeat(block, blocks);
        } else if (opcode === "control_forever") {
          this.transpileForever(block, blocks);
        } else if (opcode === "control_if") {
          this.transpileIf(block, blocks);
        } else if (opcode === "control_if_else") {
          this.transpileIfElse(block, blocks);
        } else if (opcode === "control_repeat_until") {
          this.transpileRepeatUntil(block, blocks);
        } else if (opcode === "control_stop") {
          this.transpileStop(block, blocks);
        }

        // Event blocks
        else if (opcode === "event_broadcast") {
          this.transpileBroadcast(block, blocks);
        } else if (opcode === "event_broadcastandwait") {
          this.transpileBroadcastAndWait(block, blocks);
        }

        // Motion blocks (simplified for EV3)
        else if (opcode === "motion_movesteps") {
          this.transpileMoveSteps(block, blocks);
        } else if (opcode === "motion_turnright") {
          this.transpileTurnRight(block, blocks);
        } else if (opcode === "motion_turnleft") {
          this.transpileTurnLeft(block, blocks);
        }

        // Data blocks
        else if (opcode === "data_setvariableto") {
          this.transpileSetVariable(block, blocks);
        } else if (opcode === "data_changevariableby") {
          this.transpileChangeVariable(block, blocks);
        }

        // Looks blocks (use display/sound)
        else if (opcode === "looks_say" || opcode === "looks_sayforsecs") {
          this.transpileSay(block, blocks);
        }

        // Sound blocks (play sound)
        else if (opcode === "sound_play" || opcode === "sound_playuntildone") {
          this.transpilePlaySound(block, blocks);
        }

        // Default - unsupported block
        else {
          this.addComment(`TODO: Unsupported block: ${opcode}`);
          this.log(`WARNING: Unsupported block: ${opcode}`);
        }
      } catch (error) {
        this.log(`ERROR processing block ${opcode}`, {
          error: error.message,
          stack: error.stack,
        });
        this.addComment(`ERROR: ${opcode} - ${error.message}`);
      }
    }

    // ============================================================================
    // MOTOR TRANSPILERS
    // ============================================================================

    transpileMotorRun(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const power = this.getInputValue(block, "POWER", blocks);

      this.addComment(`Motor ${port} run at ${power}%`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`MOVE8_8(${power}, power)`);
      this.addLine(`OUTPUT_POWER(layer, port, power)`);
      this.addLine(`OUTPUT_START(layer, port)`);
    }

    transpileMotorRunTime(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const time = this.getInputValue(block, "TIME", blocks);
      const power = this.getInputValue(block, "POWER", blocks);

      this.addComment(`Motor ${port} run for ${time} seconds at ${power}%`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`MOVE8_8(${power}, power)`);
      this.addLine(`MOVE32_32(${time} * 1000, time_ms)`);
      this.addLine(`OUTPUT_TIME_POWER(layer, port, power, 0, time_ms, 0, 1)`);
    }

    transpileMotorRunRotations(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const rotations = this.getInputValue(block, "ROTATIONS", blocks);
      const power = this.getInputValue(block, "POWER", blocks);

      this.addComment(`Motor ${port} run ${rotations} rotations at ${power}%`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`MOVE8_8(${power}, power)`);
      this.addLine(`MOVE32_32(${rotations} * 360, degrees)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, power, 0, degrees, 0, 1)`);
    }

    transpileMotorRunDegrees(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const degrees = this.getInputValue(block, "DEGREES", blocks);
      const power = this.getInputValue(block, "POWER", blocks);

      this.addComment(`Motor ${port} run ${degrees} degrees at ${power}%`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`MOVE8_8(${power}, power)`);
      this.addLine(`MOVE32_32(${degrees}, degrees)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, power, 0, degrees, 0, 1)`);
    }

    transpileMotorStop(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const brake = this.getInputValue(block, "BRAKE", blocks);

      const brakeMode = brake === '"coast"' || brake === "coast" ? "0" : "1";

      this.addComment(`Motor ${port} stop (brake: ${brake})`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`OUTPUT_STOP(layer, port, ${brakeMode})`);
    }

    transpileMotorReset(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);

      this.addComment(`Reset motor ${port}`);
      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`OUTPUT_RESET(layer, port)`);
      this.addLine(`OUTPUT_CLR_COUNT(layer, port)`);
    }

    transpileTankDrive(block, blocks) {
      const left = this.getInputValue(block, "LEFT", blocks);
      const right = this.getInputValue(block, "RIGHT", blocks);
      const value = this.getInputValue(block, "VALUE", blocks);
      const unit = this.getInputValue(block, "UNIT", blocks);

      this.addComment(`Tank drive L:${left} R:${right} for ${value} ${unit}`);

      // Assume B=left, C=right
      const leftPort = this.OUTPUT_PORTS.B;
      const rightPort = this.OUTPUT_PORTS.C;

      if (unit === '"seconds"' || unit === "seconds") {
        // Time-based
        this.addLine(`MOVE32_32(${value} * 1000, time_ms)`);
        this.addLine(`MOVE8_8(${leftPort}, port)`);
        this.addLine(
          `OUTPUT_TIME_POWER(layer, port, ${left}, 0, time_ms, 0, 0)`,
        );
        this.addLine(`MOVE8_8(${rightPort}, port)`);
        this.addLine(
          `OUTPUT_TIME_POWER(layer, port, ${right}, 0, time_ms, 0, 1)`,
        );
      } else if (unit === '"rotations"' || unit === "rotations") {
        // Rotation-based
        this.addLine(`MOVE32_32(${value} * 360, degrees)`);
        this.addLine(`MOVE8_8(${leftPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${left}, 0, degrees, 0, 0)`,
        );
        this.addLine(`MOVE8_8(${rightPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${right}, 0, degrees, 0, 1)`,
        );
      } else {
        // Degrees
        this.addLine(`MOVE32_32(${value}, degrees)`);
        this.addLine(`MOVE8_8(${leftPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${left}, 0, degrees, 0, 0)`,
        );
        this.addLine(`MOVE8_8(${rightPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${right}, 0, degrees, 0, 1)`,
        );
      }
    }

    transpileSteerDrive(block, blocks) {
      const steering = this.getInputValue(block, "STEERING", blocks);
      const speed = this.getInputValue(block, "SPEED", blocks);
      const value = this.getInputValue(block, "VALUE", blocks);
      const unit = this.getInputValue(block, "UNIT", blocks);

      this.addComment(
        `Steer drive steering:${steering} speed:${speed} for ${value} ${unit}`,
      );

      // Calculate left and right power from steering
      // steering: -100 (full left) to 100 (full right)
      // 0 = straight
      const leftVar = this.allocateVariable(8, "steer_left");
      const rightVar = this.allocateVariable(8, "steer_right");

      // Simple steering calculation
      // If steering > 0: reduce right motor
      // If steering < 0: reduce left motor
      this.addLine(`MOVE8_8(${speed}, ${leftVar})`);
      this.addLine(`MOVE8_8(${speed}, ${rightVar})`);

      // This is simplified - proper steering would need more complex math
      // For now, just approximate
      this.addComment("Simplified steering calculation");

      // Apply to motors
      const leftPort = this.OUTPUT_PORTS.B;
      const rightPort = this.OUTPUT_PORTS.C;

      if (unit === '"seconds"' || unit === "seconds") {
        this.addLine(`MOVE32_32(${value} * 1000, time_ms)`);
        this.addLine(`MOVE8_8(${leftPort}, port)`);
        this.addLine(
          `OUTPUT_TIME_POWER(layer, port, ${leftVar}, 0, time_ms, 0, 0)`,
        );
        this.addLine(`MOVE8_8(${rightPort}, port)`);
        this.addLine(
          `OUTPUT_TIME_POWER(layer, port, ${rightVar}, 0, time_ms, 0, 1)`,
        );
      } else {
        this.addLine(`MOVE32_32(${value} * 360, degrees)`);
        this.addLine(`MOVE8_8(${leftPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${leftVar}, 0, degrees, 0, 0)`,
        );
        this.addLine(`MOVE8_8(${rightPort}, port)`);
        this.addLine(
          `OUTPUT_STEP_POWER(layer, port, ${rightVar}, 0, degrees, 0, 1)`,
        );
      }
    }

    // ============================================================================
    // DISPLAY TRANSPILERS
    // ============================================================================

    transpileScreenClear(block, blocks) {
      this.addComment("Clear screen");
      this.addLine(`UI_DRAW(${this.UI_DRAW.CLEAN})`);
    }

    transpileScreenText(block, blocks) {
      const text = this.getInputValue(block, "TEXT", blocks);
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);

      this.addComment(`Display text at (${x}, ${y})`);
      this.addLine(`UI_DRAW(${this.UI_DRAW.TEXT}, 0, ${x}, ${y}, ${text})`);
    }

    transpileScreenTextLarge(block, blocks) {
      const text = this.getInputValue(block, "TEXT", blocks);
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);

      this.addComment(`Display large text at (${x}, ${y})`);
      this.addLine(`UI_DRAW(${this.UI_DRAW.SELECT_FONT}, 1)`); // Large font
      this.addLine(`UI_DRAW(${this.UI_DRAW.TEXT}, 0, ${x}, ${y}, ${text})`);
      this.addLine(`UI_DRAW(${this.UI_DRAW.SELECT_FONT}, 0)`); // Back to normal
    }

    transpileDrawPixel(block, blocks) {
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);

      this.addComment(`Draw pixel at (${x}, ${y})`);
      this.addLine(`UI_DRAW(${this.UI_DRAW.PIXEL}, 0, ${x}, ${y})`);
    }

    transpileDrawLine(block, blocks) {
      const x1 = this.getInputValue(block, "X1", blocks);
      const y1 = this.getInputValue(block, "Y1", blocks);
      const x2 = this.getInputValue(block, "X2", blocks);
      const y2 = this.getInputValue(block, "Y2", blocks);

      this.addComment(`Draw line from (${x1}, ${y1}) to (${x2}, ${y2})`);
      this.addLine(
        `UI_DRAW(${this.UI_DRAW.LINE}, 0, ${x1}, ${y1}, ${x2}, ${y2})`,
      );
    }

    transpileDrawCircle(block, blocks) {
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);
      const r = this.getInputValue(block, "R", blocks);
      const fill = this.getInputValue(block, "FILL", blocks);

      const fillMode = fill === '"filled"' || fill === "filled";
      const drawCmd = fillMode ? this.UI_DRAW.FILLCIRCLE : this.UI_DRAW.CIRCLE;

      this.addComment(`Draw circle at (${x}, ${y}) radius ${r}`);
      this.addLine(`UI_DRAW(${drawCmd}, 0, ${x}, ${y}, ${r})`);
    }

    transpileDrawRectangle(block, blocks) {
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);
      const w = this.getInputValue(block, "W", blocks);
      const h = this.getInputValue(block, "H", blocks);
      const fill = this.getInputValue(block, "FILL", blocks);

      const fillMode = fill === '"filled"' || fill === "filled";
      const drawCmd = fillMode ? this.UI_DRAW.FILLRECT : this.UI_DRAW.RECT;

      this.addComment(`Draw rectangle at (${x}, ${y}) size ${w}x${h}`);
      this.addLine(`UI_DRAW(${drawCmd}, 0, ${x}, ${y}, ${w}, ${h})`);
    }

    transpileScreenUpdate(block, blocks) {
      this.addComment("Update screen");
      this.addLine(`UI_DRAW(${this.UI_DRAW.UPDATE})`);
    }

    transpileScreenInvert(block, blocks) {
      this.addComment("Invert screen");
      this.addLine(`UI_DRAW(${this.UI_DRAW.INVERSERECT}, 0, 0, 0, 178, 128)`);
    }

    // ============================================================================
    // SOUND TRANSPILERS
    // ============================================================================

    transpilePlayTone(block, blocks) {
      const freq = this.getInputValue(block, "FREQ", blocks);
      const duration = this.getInputValue(block, "DURATION", blocks);

      this.addComment(`Play tone ${freq} Hz for ${duration} ms`);
      this.addLine(`MOVE16_16(${freq}, frequency)`);
      this.addLine(`MOVE16_16(${duration}, duration)`);
      this.addLine(`SOUND(${this.SOUND_CMD.TONE}, 100, frequency, duration)`);

      // Wait for sound to finish
      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(duration, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpilePlayNote(block, blocks) {
      const note = this.getInputValue(block, "NOTE", blocks);
      const duration = this.getInputValue(block, "DURATION", blocks);

      this.addComment(`Play note ${note} for ${duration} beats`);

      // Convert note to frequency
      const noteToFreq = {
        '"C4"': 262,
        '"D4"': 294,
        '"E4"': 330,
        '"F4"': 349,
        '"G4"': 392,
        '"A4"': 440,
        '"B4"': 494,
        '"C5"': 523,
      };

      const freq = noteToFreq[note] || 440;
      const timeMs = `(${duration} * 500)`; // Assuming 120 BPM, quarter = 500ms

      this.addLine(`MOVE16_16(${freq}, frequency)`);
      this.addLine(`MOVE32_32(${timeMs}, time_ms)`);
      this.addLine(`MOVE16_32(time_ms, duration)`); // Convert to DATA16
      this.addLine(`SOUND(${this.SOUND_CMD.TONE}, 100, frequency, duration)`);

      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(duration, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpileBeep(block, blocks) {
      this.addComment("Beep");
      this.addLine(`SOUND(${this.SOUND_CMD.TONE}, 100, 1000, 100)`);

      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(100, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpileSetVolume(block, blocks) {
      const volume = this.getInputValue(block, "VOLUME", blocks);

      this.addComment(`Set volume to ${volume}%`);
      // LMS doesn't have direct volume control in all versions
      // This is a placeholder
      this.addComment("NOTE: Volume control may not be available");
    }

    transpileStopSound(block, blocks) {
      this.addComment("Stop all sounds");
      this.addLine(`SOUND(${this.SOUND_CMD.BREAK})`);
    }

    transpilePlaySound(block, blocks) {
      this.addComment("Play sound file");
      this.addComment(
        "NOTE: Sound file playback requires file name - using beep instead",
      );
      this.addLine(`SOUND(${this.SOUND_CMD.TONE}, 100, 1000, 200)`);
    }

    // ============================================================================
    // LED TRANSPILERS
    // ============================================================================

    transpileSetLED(block, blocks) {
      const color = this.getInputValue(block, "COLOR", blocks);

      // Map color names to LED patterns
      const colorMap = {
        '"OFF"': this.LED_COLOR.OFF,
        '"GREEN"': this.LED_COLOR.GREEN,
        '"RED"': this.LED_COLOR.RED,
        '"ORANGE"': this.LED_COLOR.ORANGE,
        OFF: this.LED_COLOR.OFF,
        GREEN: this.LED_COLOR.GREEN,
        RED: this.LED_COLOR.RED,
        ORANGE: this.LED_COLOR.ORANGE,
      };

      const ledColor = colorMap[color] || this.LED_COLOR.GREEN;

      this.addComment(`Set LED to ${color}`);
      this.addLine(`UI_WRITE(LED, ${ledColor})`);
    }

    transpileLEDAllOff(block, blocks) {
      this.addComment("Turn all LEDs off");
      this.addLine(`UI_WRITE(LED, ${this.LED_COLOR.OFF})`);
    }

    // ============================================================================
    // CONTROL TRANSPILERS
    // ============================================================================

    transpileWait(block, blocks) {
      const duration = this.getInputValue(block, "DURATION", blocks);

      this.addComment(`Wait ${duration} seconds`);
      this.addLine(`MOVE32_32(${duration} * 1000, time_ms)`);

      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(time_ms, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpileWaitSeconds(block, blocks) {
      const time = this.getInputValue(block, "TIME", blocks);

      this.addComment(`Wait ${time} seconds`);
      this.addLine(`MOVE32_32(${time} * 1000, time_ms)`);

      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(time_ms, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpileWaitMillis(block, blocks) {
      const time = this.getInputValue(block, "TIME", blocks);

      this.addComment(`Wait ${time} milliseconds`);
      this.addLine(`MOVE32_32(${time}, time_ms)`);

      const timerVar = this.getOrCreateTimer(0);
      this.addLine(`TIMER_WAIT(time_ms, ${timerVar})`);
      this.addLine(`TIMER_READY(${timerVar})`);
    }

    transpileRepeat(block, blocks) {
      const times = this.getInputValue(block, "TIMES", blocks);

      const counterVar = this.allocateVariable(32, "loop_counter");
      const loopStart = this.generateLabel("LOOP_START");
      const loopEnd = this.generateLabel("LOOP_END");

      this.addComment(`Repeat ${times} times`);
      this.addLine(`MOVE32_32(0, ${counterVar})`);
      this.addLine(`${loopStart}:`);
      this.indentLevel++;

      // Check condition
      this.addLine(`JR_GTEQ32(${counterVar}, ${times}, ${loopEnd})`);

      // Process substack
      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      }

      // Increment counter
      this.addLine(`ADD32(${counterVar}, 1, ${counterVar})`);
      this.addLine(`JR(${loopStart})`);

      this.indentLevel--;
      this.addLine(`${loopEnd}:`);
    }

    transpileForever(block, blocks) {
      const loopStart = this.generateLabel("FOREVER_START");

      this.addComment("Forever loop");
      this.addLine(`${loopStart}:`);
      this.indentLevel++;

      // Process substack
      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      }

      this.addLine(`JR(${loopStart})`);
      this.indentLevel--;
    }

    transpileIf(block, blocks) {
      const condition = this.evaluateCondition(block, "CONDITION", blocks);
      const endLabel = this.generateLabel("IF_END");

      this.addComment("If condition");
      this.addLine(`JR_FALSE(${condition}, ${endLabel})`);

      this.indentLevel++;
      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      }
      this.indentLevel--;

      this.addLine(`${endLabel}:`);
    }

    transpileIfElse(block, blocks) {
      const condition = this.evaluateCondition(block, "CONDITION", blocks);
      const elseLabel = this.generateLabel("ELSE");
      const endLabel = this.generateLabel("IF_END");

      this.addComment("If-else condition");
      this.addLine(`JR_FALSE(${condition}, ${elseLabel})`);

      // If branch
      this.indentLevel++;
      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      }
      this.addLine(`JR(${endLabel})`);
      this.indentLevel--;

      // Else branch
      this.addLine(`${elseLabel}:`);
      this.indentLevel++;
      const substack2Id = this.getSubstackId(block, "SUBSTACK2");
      if (substack2Id) {
        this.processBlockChain(substack2Id, blocks);
      }
      this.indentLevel--;

      this.addLine(`${endLabel}:`);
    }

    transpileRepeatUntil(block, blocks) {
      const loopStart = this.generateLabel("UNTIL_START");
      const loopEnd = this.generateLabel("UNTIL_END");

      this.addComment("Repeat until");
      this.addLine(`${loopStart}:`);
      this.indentLevel++;

      // Check condition
      const condition = this.evaluateCondition(block, "CONDITION", blocks);
      this.addLine(`JR_TRUE(${condition}, ${loopEnd})`);

      // Process substack
      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      }

      this.addLine(`JR(${loopStart})`);
      this.indentLevel--;
      this.addLine(`${loopEnd}:`);
    }

    transpileStop(block, blocks) {
      const stopOption = this.getFieldValue(block, "STOP_OPTION") || "all";

      if (stopOption === "all") {
        this.addComment("Stop all");
        this.addLine("OBJECT_END()");
      } else {
        this.addComment("Stop this script");
        this.addLine("RETURN()");
      }
    }

    // ============================================================================
    // EVENT TRANSPILERS
    // ============================================================================

    transpileBroadcast(block, blocks) {
      const broadcastInput = this.getInputValue(
        block,
        "BROADCAST_INPUT",
        blocks,
      );
      const broadcastName = broadcastInput.replace(/"/g, "");

      const handler = this.broadcastHandlers.get(broadcastName);
      if (handler) {
        this.addComment(`Broadcast: ${broadcastName}`);
        // In LMS, we'd need to use CALL for subcalls
        // But since we can't truly thread, we'll just call it
        this.addLine(`CALL(${handler.label})`);
      } else {
        this.addComment(`WARNING: No handler for broadcast: ${broadcastName}`);
      }
    }

    transpileBroadcastAndWait(block, blocks) {
      // Same as broadcast in LMS (no true threading)
      this.transpileBroadcast(block, blocks);
    }

    // ============================================================================
    // MOTION TRANSPILERS (Simplified)
    // ============================================================================

    transpileMoveSteps(block, blocks) {
      const steps = this.getInputValue(block, "STEPS", blocks);

      this.addComment(`Move ${steps} steps`);

      // Use tank drive on B & C
      const ports = `(${this.OUTPUT_PORTS.B} | ${this.OUTPUT_PORTS.C})`;
      this.addLine(`MOVE8_8(${ports}, ports)`);
      this.addLine(`MOVE32_32(${steps} * 10, degrees)`); // Scale steps to degrees
      this.addLine(`OUTPUT_STEP_POWER(layer, ports, 50, 0, degrees, 0, 1)`);
    }

    transpileTurnRight(block, blocks) {
      const degrees = this.getInputValue(block, "DEGREES", blocks);

      this.addComment(`Turn right ${degrees} degrees`);

      // Left motor forward, right motor backward
      this.addLine(`MOVE32_32(${degrees} * 2, degrees)`); // Scale for robot geometry
      this.addLine(`MOVE8_8(${this.OUTPUT_PORTS.B}, port)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, 50, 0, degrees, 0, 0)`);
      this.addLine(`MOVE8_8(${this.OUTPUT_PORTS.C}, port)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, -50, 0, degrees, 0, 1)`);
    }

    transpileTurnLeft(block, blocks) {
      const degrees = this.getInputValue(block, "DEGREES", blocks);

      this.addComment(`Turn left ${degrees} degrees`);

      // Left motor backward, right motor forward
      this.addLine(`MOVE32_32(${degrees} * 2, degrees)`);
      this.addLine(`MOVE8_8(${this.OUTPUT_PORTS.B}, port)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, -50, 0, degrees, 0, 0)`);
      this.addLine(`MOVE8_8(${this.OUTPUT_PORTS.C}, port)`);
      this.addLine(`OUTPUT_STEP_POWER(layer, port, 50, 0, degrees, 0, 1)`);
    }

    // ============================================================================
    // DATA TRANSPILERS
    // ============================================================================

    transpileSetVariable(block, blocks) {
      const varName = this.getFieldValue(block, "VARIABLE");
      const value = this.getInputValue(block, "VALUE", blocks);

      let varInfo = this.variables.get(varName);
      if (!varInfo) {
        const lmsVar = this.allocateVariable(32, this.sanitizeName(varName));
        varInfo = { lmsVar, type: 32 };
        this.variables.set(varName, varInfo);
      }

      this.addComment(`Set ${varName} to ${value}`);
      this.addLine(`MOVE32_32(${value}, ${varInfo.lmsVar})`);
    }

    transpileChangeVariable(block, blocks) {
      const varName = this.getFieldValue(block, "VARIABLE");
      const value = this.getInputValue(block, "VALUE", blocks);

      let varInfo = this.variables.get(varName);
      if (!varInfo) {
        const lmsVar = this.allocateVariable(32, this.sanitizeName(varName));
        varInfo = { lmsVar, type: 32 };
        this.variables.set(varName, varInfo);
        // Initialize to 0
        this.addLine(`MOVE32_32(0, ${lmsVar})`);
      }

      this.addComment(`Change ${varName} by ${value}`);
      this.addLine(`ADD32(${varInfo.lmsVar}, ${value}, ${varInfo.lmsVar})`);
    }

    // ============================================================================
    // LOOKS TRANSPILERS
    // ============================================================================

    transpileSay(block, blocks) {
      const message = this.getInputValue(block, "MESSAGE", blocks);

      this.addComment(`Say: ${message}`);
      // Display on screen
      this.addLine(`UI_DRAW(${this.UI_DRAW.TEXT}, 0, 0, 50, ${message})`);
      this.addLine(`UI_DRAW(${this.UI_DRAW.UPDATE})`);

      if (block.opcode === "looks_sayforsecs") {
        const secs = this.getInputValue(block, "SECS", blocks);
        this.addLine(`MOVE32_32(${secs} * 1000, time_ms)`);
        const timerVar = this.getOrCreateTimer(0);
        this.addLine(`TIMER_WAIT(time_ms, ${timerVar})`);
        this.addLine(`TIMER_READY(${timerVar})`);
      }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

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

          if (primitiveType >= 4 && primitiveType <= 8) {
            return String(primitiveValue);
          } else if (primitiveType === 10) {
            // String value - need to handle specially for LMS
            if (typeof primitiveValue === "number") {
              return String(primitiveValue);
            }
            return `"${primitiveValue}"`;
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

            if (primitiveType >= 4 && primitiveType <= 8) {
              return String(primitiveValue);
            } else if (primitiveType === 10) {
              if (typeof primitiveValue === "number") {
                return String(primitiveValue);
              }
              return `"${primitiveValue}"`;
            }
          }
        }
      }

      return "0";
    }

    evaluateBlock(block, blocks) {
      const opcode = block.opcode;

      // Number blocks
      if (
        opcode === "math_number" ||
        opcode === "math_whole_number" ||
        opcode === "math_positive_number" ||
        opcode === "math_integer"
      ) {
        const num = this.getFieldValue(block, "NUM");
        return num || "0";
      }

      // Text blocks
      else if (opcode === "text") {
        const text = this.getFieldValue(block, "TEXT");
        if (typeof text === "number" || !isNaN(text)) {
          return String(text);
        }
        return `"${text || ""}"`;
      }

      // Variable blocks
      else if (opcode === "data_variable") {
        const varName = this.getFieldValue(block, "VARIABLE");
        let varInfo = this.variables.get(varName);
        if (!varInfo) {
          const lmsVar = this.allocateVariable(32, this.sanitizeName(varName));
          varInfo = { lmsVar, type: 32 };
          this.variables.set(varName, varInfo);
          this.addLine(`MOVE32_32(0, ${lmsVar})`);
        }
        return varInfo.lmsVar;
      }

      // Math operators
      else if (opcode === "operator_add") {
        return this.evaluateBinaryOp(block, blocks, "ADD32");
      } else if (opcode === "operator_subtract") {
        return this.evaluateBinaryOp(block, blocks, "SUB32");
      } else if (opcode === "operator_multiply") {
        return this.evaluateBinaryOp(block, blocks, "MUL32");
      } else if (opcode === "operator_divide") {
        return this.evaluateBinaryOp(block, blocks, "DIV32");
      } else if (opcode === "operator_mod") {
        // LMS doesn't have MOD, use math: a - (a/b)*b
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        const tempDiv = this.allocateVariable(32);
        const tempMul = this.allocateVariable(32);
        const resultVar = this.allocateVariable(32);
        this.addLine(`DIV32(${num1}, ${num2}, ${tempDiv})`);
        this.addLine(`MUL32(${tempDiv}, ${num2}, ${tempMul})`);
        this.addLine(`SUB32(${num1}, ${tempMul}, ${resultVar})`);
        return resultVar;
      } else if (opcode === "operator_round") {
        // Round not directly available, approximate
        const num = this.getInputValue(block, "NUM", blocks);
        return num; // Simplified
      } else if (opcode === "operator_mathop") {
        // Math operations like sqrt, sin, cos, etc.
        // LMS has limited math - we'll return the input for now
        const num = this.getInputValue(block, "NUM", blocks);
        this.addComment("WARNING: Math operation not fully supported");
        return num;
      }

      // String operators
      else if (opcode === "operator_join") {
        // String concatenation not directly supported in LMS
        // Return first string
        const str1 = this.getInputValue(block, "STRING1", blocks);
        this.addComment("WARNING: String join not fully supported");
        return str1;
      } else if (opcode === "operator_letter_of") {
        // String indexing not supported
        this.addComment("WARNING: String indexing not supported");
        return '""';
      } else if (opcode === "operator_length") {
        // String length not supported
        this.addComment("WARNING: String length not supported");
        return "0";
      }

      // Comparison operators - handle in evaluateCondition
      else if (
        opcode === "operator_gt" ||
        opcode === "operator_lt" ||
        opcode === "operator_equals"
      ) {
        return this.evaluateComparison(block, blocks);
      }

      // Sensor reporters
      else if (opcode === "ev3lms_motorPosition") {
        return this.evaluateMotorPosition(block, blocks);
      } else if (opcode === "ev3lms_motorSpeed") {
        return this.evaluateMotorSpeed(block, blocks);
      } else if (opcode === "ev3lms_touchSensor") {
        return this.evaluateTouchSensor(block, blocks);
      }

      // Menu blocks
      else if (opcode.endsWith("_menu")) {
        // Return the field value directly
        const fieldNames = Object.keys(block.fields);
        if (fieldNames.length > 0) {
          const value = this.getFieldValue(block, fieldNames[0]);
          return `"${value}"`;
        }
      }

      // Default
      this.addComment(`WARNING: Unsupported reporter: ${opcode}`);
      return "0";
    }

    evaluateBinaryOp(block, blocks, opcode) {
      const num1 = this.getInputValue(block, "NUM1", blocks);
      const num2 = this.getInputValue(block, "NUM2", blocks);
      const resultVar = this.allocateVariable(32);

      this.addLine(`${opcode}(${num1}, ${num2}, ${resultVar})`);
      return resultVar;
    }

    evaluateComparison(block, blocks) {
      const opcode = block.opcode;
      const op1 = this.getInputValue(block, "OPERAND1", blocks);
      const op2 = this.getInputValue(block, "OPERAND2", blocks);
      const resultVar = this.allocateVariable(8);

      if (opcode === "operator_gt") {
        this.addLine(`CP_GT32(${op1}, ${op2}, ${resultVar})`);
      } else if (opcode === "operator_lt") {
        this.addLine(`CP_LT32(${op1}, ${op2}, ${resultVar})`);
      } else if (opcode === "operator_equals") {
        this.addLine(`CP_EQ32(${op1}, ${op2}, ${resultVar})`);
      }

      return resultVar;
    }

    evaluateCondition(block, inputName, blocks) {
      const input = block.inputs[inputName];
      if (!input) {
        // No condition - return true
        const trueVar = this.allocateVariable(8);
        this.addLine(`MOVE8_8(1, ${trueVar})`);
        return trueVar;
      }

      // Get the condition block
      let conditionBlock = null;
      if (typeof input === "object" && !Array.isArray(input)) {
        if (input.block) {
          conditionBlock = blocks._blocks[input.block];
        }
      } else if (Array.isArray(input) && input.length >= 2) {
        if (typeof input[1] === "string") {
          conditionBlock = blocks._blocks[input[1]];
        }
      }

      if (!conditionBlock) {
        const trueVar = this.allocateVariable(8);
        this.addLine(`MOVE8_8(1, ${trueVar})`);
        return trueVar;
      }

      // Evaluate the condition block
      const opcode = conditionBlock.opcode;

      if (
        opcode === "operator_gt" ||
        opcode === "operator_lt" ||
        opcode === "operator_equals"
      ) {
        return this.evaluateComparison(conditionBlock, blocks);
      } else if (opcode === "operator_and") {
        const cond1 = this.evaluateCondition(
          conditionBlock,
          "OPERAND1",
          blocks,
        );
        const cond2 = this.evaluateCondition(
          conditionBlock,
          "OPERAND2",
          blocks,
        );
        const resultVar = this.allocateVariable(8);
        this.addLine(`AND8(${cond1}, ${cond2}, ${resultVar})`);
        return resultVar;
      } else if (opcode === "operator_or") {
        const cond1 = this.evaluateCondition(
          conditionBlock,
          "OPERAND1",
          blocks,
        );
        const cond2 = this.evaluateCondition(
          conditionBlock,
          "OPERAND2",
          blocks,
        );
        const resultVar = this.allocateVariable(8);
        this.addLine(`OR8(${cond1}, ${cond2}, ${resultVar})`);
        return resultVar;
      } else if (opcode === "operator_not") {
        const cond = this.evaluateCondition(conditionBlock, "OPERAND", blocks);
        const resultVar = this.allocateVariable(8);
        this.addLine(`XOR8(${cond}, 1, ${resultVar})`); // NOT via XOR with 1
        return resultVar;
      } else if (opcode === "ev3lms_touchSensor") {
        return this.evaluateTouchSensor(conditionBlock, blocks);
      } else {
        // Unknown condition - evaluate as boolean
        return this.evaluateBlock(conditionBlock, blocks);
      }
    }

    evaluateMotorPosition(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const resultVar = this.allocateVariable(32, "motor_pos");

      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`OUTPUT_READ(layer, port, OUTPUT_GET_COUNT, ${resultVar})`);

      return resultVar;
    }

    evaluateMotorSpeed(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const resultVar = this.allocateVariable(8, "motor_speed");

      this.addLine(`MOVE8_8(${this.getPortMask(port)}, port)`);
      this.addLine(`OUTPUT_READ(layer, port, OUTPUT_GET_SPEED, ${resultVar})`);

      return resultVar;
    }

    evaluateTouchSensor(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const portNum = this.INPUT_PORTS[port.replace(/"/g, "")] || "0";
      const resultVar = this.allocateVariable(8, "touch_val");

      this.addLine(`MOVE8_8(${portNum}, port)`);
      this.addLine(`MOVE8_8(${this.SENSOR_TYPE.TOUCH}, type)`);
      this.addLine(`MOVE8_8(${this.SENSOR_MODE.TOUCH}, mode)`);
      this.addLine(
        `INPUT_DEVICE(READY_SI, layer, port, type, mode, 1, sensor_value8)`,
      );
      this.addLine(`MOVE8_8(sensor_value8, ${resultVar})`);

      return resultVar;
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

    getPortMask(port) {
      const portStr = String(port).replace(/"/g, "");
      return this.OUTPUT_PORTS[portStr] || this.OUTPUT_PORTS.A;
    }

    getOrCreateTimer(timerId) {
      if (!this.timerVars.has(timerId)) {
        const timerVar = this.allocateVariable(32, `timer${timerId}`);
        this.timerVars.set(timerId, timerVar);
      }
      return this.timerVars.get(timerId);
    }

    sanitizeName(name) {
      if (!name) return "unnamed";
      return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }
  }

  // ============================================================================
  // MAIN EXTENSION CLASS
  // ============================================================================

  class EV3LMSExtension {
    constructor() {
      // Configuration
      this.ev3IP = "192.168.178.50";
      this.ev3Port = 8080;
      this.lmsApiUrl = "http://127.0.0.1";
      this.lmsApiPort = 7860;

      // State
      this.streamingMode = false;
      this.lmsCode = "";
      this.rbfBytecode = null;
      this.rbfBase64 = "";

      // Components
      this.transpiler = new LMSTranspiler();

      // Timeouts
      this.REQUEST_TIMEOUT_MS = 5000;
      this.LONG_TIMEOUT_MS = 60000;
      this.COMPILE_TIMEOUT_MS = 30000;

      this.log("Extension initialized", {
        lang: currentLang,
        version: "2.0.0",
      });
    }

    log(message, data = null) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [EV3-LMS] ${message}`;
      if (data !== null) {
        console.log(logEntry, data);
      } else {
        console.log(logEntry);
      }
    }

    getInfo() {
      return {
        id: "ev3lms",
        name: t("extensionName"),
        color1: "#7C3A9A",
        color2: "#5C2A7A",
        color3: "#4C1A6A",
        blocks: [
          // Connection
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("connection"),
          },
          {
            opcode: "setEV3IP",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setEV3IP"),
            arguments: {
              IP: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "192.168.178.50",
              },
            },
          },
          {
            opcode: "setLMSApiUrl",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setLMSApiUrl"),
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "http://127.0.0.1",
              },
              PORT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 7860,
              },
            },
          },
          {
            opcode: "enableStreaming",
            blockType: Scratch.BlockType.COMMAND,
            text: t("enableStreaming"),
          },
          {
            opcode: "disableStreaming",
            blockType: Scratch.BlockType.COMMAND,
            text: t("disableStreaming"),
          },
          {
            opcode: "testConnection",
            blockType: Scratch.BlockType.REPORTER,
            text: t("testConnection"),
          },
          {
            opcode: "testCompiler",
            blockType: Scratch.BlockType.REPORTER,
            text: t("testCompiler"),
          },

          "---",

          // Transpilation & Compilation
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("transpilation"),
          },
          {
            opcode: "transpileToLMS",
            blockType: Scratch.BlockType.COMMAND,
            text: t("transpileToLMS"),
          },
          {
            opcode: "showLMSCode",
            blockType: Scratch.BlockType.COMMAND,
            text: t("showLMSCode"),
          },
          {
            opcode: "downloadLMSCode",
            blockType: Scratch.BlockType.COMMAND,
            text: t("downloadLMSCode"),
          },
          {
            opcode: "compileToRBF",
            blockType: Scratch.BlockType.COMMAND,
            text: t("compileToRBF"),
          },
          {
            opcode: "showRBFCode",
            blockType: Scratch.BlockType.COMMAND,
            text: t("showRBFCode"),
          },
          {
            opcode: "downloadRBF",
            blockType: Scratch.BlockType.COMMAND,
            text: t("downloadRBF"),
          },

          "---",

          // Motors
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("motors"),
          },
          {
            opcode: "motorRun",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRun"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "motorRunTime",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRunTime"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "motorRunRotations",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRunRotations"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "motorRunDegrees",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRunDegrees"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              DEGREES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorStop"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              BRAKE: { type: Scratch.ArgumentType.STRING, menu: "brakeMode" },
            },
          },
          {
            opcode: "motorReset",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorReset"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
            },
          },
          {
            opcode: "tankDrive",
            blockType: Scratch.BlockType.COMMAND,
            text: t("tankDrive"),
            arguments: {
              LEFT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              RIGHT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              UNIT: { type: Scratch.ArgumentType.STRING, menu: "driveUnit" },
            },
          },
          {
            opcode: "steerDrive",
            blockType: Scratch.BlockType.COMMAND,
            text: t("steerDrive"),
            arguments: {
              STEERING: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              UNIT: { type: Scratch.ArgumentType.STRING, menu: "driveUnit" },
            },
          },
          {
            opcode: "motorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: t("motorPosition"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
            },
          },
          {
            opcode: "motorSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: t("motorSpeed"),
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
            },
          },

          "---",

          // Display
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("display"),
          },
          {
            opcode: "screenClear",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenClear"),
          },
          {
            opcode: "screenText",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenText"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "screenTextLarge",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenTextLarge"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello",
              },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "drawPixel",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawPixel"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "drawLine",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawLine"),
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "drawCircle",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawCircle"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              FILL: { type: Scratch.ArgumentType.STRING, menu: "fillMode" },
            },
          },
          {
            opcode: "drawRectangle",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawRectangle"),
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
              FILL: { type: Scratch.ArgumentType.STRING, menu: "fillMode" },
            },
          },
          {
            opcode: "screenUpdate",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenUpdate"),
          },
          {
            opcode: "screenInvert",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenInvert"),
          },

          "---",

          // Sound
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("sound"),
          },
          {
            opcode: "playTone",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playTone"),
            arguments: {
              FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 440 },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 500,
              },
            },
          },
          {
            opcode: "playNote",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playNote"),
            arguments: {
              NOTE: { type: Scratch.ArgumentType.STRING, menu: "notes" },
              DURATION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "beep",
            blockType: Scratch.BlockType.COMMAND,
            text: t("beep"),
          },
          {
            opcode: "setVolume",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setVolume"),
            arguments: {
              VOLUME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
            },
          },
          {
            opcode: "stopSound",
            blockType: Scratch.BlockType.COMMAND,
            text: t("stopSound"),
          },

          "---",

          // LEDs
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("leds"),
          },
          {
            opcode: "setLED",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setLED"),
            arguments: {
              COLOR: { type: Scratch.ArgumentType.STRING, menu: "ledColors" },
            },
          },
          {
            opcode: "ledAllOff",
            blockType: Scratch.BlockType.COMMAND,
            text: t("ledAllOff"),
          },

          "---",

          // Timers
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("timers"),
          },
          {
            opcode: "waitSeconds",
            blockType: Scratch.BlockType.COMMAND,
            text: t("waitSeconds"),
            arguments: {
              TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "waitMillis",
            blockType: Scratch.BlockType.COMMAND,
            text: t("waitMillis"),
            arguments: {
              TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1000 },
            },
          },
        ],
        menus: {
          motorPorts: {
            acceptReporters: true,
            items: ["A", "B", "C", "D"],
          },
          sensorPorts: {
            acceptReporters: true,
            items: ["1", "2", "3", "4"],
          },
          brakeMode: {
            items: ["brake", "coast"],
          },
          driveUnit: {
            items: ["seconds", "rotations", "degrees"],
          },
          fillMode: {
            items: ["outline", "filled"],
          },
          ledColors: {
            items: ["OFF", "GREEN", "RED", "ORANGE"],
          },
          notes: {
            items: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
          },
        },
      };
    }

    // ============================================================================
    // CONNECTION
    // ============================================================================

    setEV3IP(args) {
      this.ev3IP = args.IP;
      this.log("EV3 IP configured", { ip: this.ev3IP });
    }

    setLMSApiUrl(args) {
      this.lmsApiUrl = args.URL;
      this.lmsApiPort = args.PORT;
      this.log("LMS API configured", {
        url: this.lmsApiUrl,
        port: this.lmsApiPort,
      });
    }

    enableStreaming() {
      this.streamingMode = true;
      this.log("Streaming mode enabled");
    }

    disableStreaming() {
      this.streamingMode = false;
      this.log("Streaming mode disabled");
    }

    async testConnection() {
      try {
        const url = `http://${this.ev3IP}:${this.ev3Port}/`;
        const response = await this.fetchWithTimeout(
          url,
          { method: "GET" },
          2000,
        );

        if (response.ok) {
          this.log("EV3 connection test successful");
          return t("connected");
        } else {
          this.log("EV3 connection test failed", { status: response.status });
          return t("notConnected");
        }
      } catch (error) {
        this.log("EV3 connection test error", { error: error.message });
        return t("notConnected");
      }
    }

    async testCompiler() {
      try {
        const url = `${this.lmsApiUrl}:${this.lmsApiPort}/`;
        const response = await this.fetchWithTimeout(
          url,
          { method: "GET" },
          2000,
        );

        if (response.ok) {
          this.log("Compiler connection test successful");
          return t("connected");
        } else {
          this.log("Compiler connection test failed", {
            status: response.status,
          });
          return t("notConnected");
        }
      } catch (error) {
        this.log("Compiler connection test error", { error: error.message });
        return t("notConnected");
      }
    }

    // ============================================================================
    // TRANSPILATION & COMPILATION
    // ============================================================================

    transpileToLMS() {
      try {
        this.lmsCode = this.transpiler.transpile();
        this.log("LMS transpilation complete", {
          length: this.lmsCode.length,
        });
        alert("✅ " + t("generateFirst").replace("first", "complete"));
      } catch (error) {
        this.log("Transpilation error", {
          error: error.message,
          stack: error.stack,
        });
        alert("❌ Transpilation failed:\n" + error.message);
      }
    }

    showLMSCode() {
      if (!this.lmsCode) {
        alert(t("noCodeGenerated"));
        return;
      }

      this.showModal(t("generatedCode"), this.lmsCode);
    }

    downloadLMSCode() {
      if (!this.lmsCode) {
        alert(t("generateFirst"));
        return;
      }

      this.downloadFile("program.lms", this.lmsCode, "text/plain");
      alert(t("downloaded") + " program.lms");
    }

    async compileToRBF() {
      if (!this.lmsCode) {
        alert(t("generateFirst"));
        return;
      }

      try {
        this.log("Starting RBF compilation");

        const url = `${this.lmsApiUrl}:${this.lmsApiPort}/compile`;

        const response = await this.fetchWithTimeout(
          url,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: this.lmsCode }),
          },
          this.COMPILE_TIMEOUT_MS,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        this.log("Compilation response received", { result });

        if (result.success) {
          this.rbfBase64 = result.base64;

          // Decode base64 to binary
          const binaryString = atob(this.rbfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.rbfBytecode = bytes;

          this.log("RBF bytecode stored", { size: bytes.length });
          alert(t("compilationSuccess") + "\n\n" + result.message);
        } else {
          throw new Error(result.error || "Unknown compilation error");
        }
      } catch (error) {
        this.log("Compilation error", { error: error.message });
        alert(t("compilationFailed") + ":\n" + error.message);
      }
    }

    showRBFCode() {
      if (!this.rbfBytecode) {
        alert(t("compileFirst"));
        return;
      }

      // Convert to hex string
      const hexStr = Array.from(this.rbfBytecode)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");

      this.showModal(t("rbfBytecode"), hexStr);
    }

    downloadRBF() {
      if (!this.rbfBytecode) {
        alert(t("compileFirst"));
        return;
      }

      this.downloadFile(
        "program.rbf",
        this.rbfBytecode,
        "application/octet-stream",
      );
      alert(t("downloaded") + " program.rbf");
    }

    // ============================================================================
    // BLOCK IMPLEMENTATIONS (Streaming Mode - No-ops in transpile mode)
    // ============================================================================

    motorRun(args) {
      // No-op in transpile mode, streaming would send command
    }

    motorRunTime(args) {
      // No-op
    }

    motorRunRotations(args) {
      // No-op
    }

    motorRunDegrees(args) {
      // No-op
    }

    motorStop(args) {
      // No-op
    }

    motorReset(args) {
      // No-op
    }

    tankDrive(args) {
      // No-op
    }

    steerDrive(args) {
      // No-op
    }

    motorPosition(args) {
      return 0; // Placeholder
    }

    motorSpeed(args) {
      return 0; // Placeholder
    }

    screenClear() {
      // No-op
    }

    screenText(args) {
      // No-op
    }

    screenTextLarge(args) {
      // No-op
    }

    drawPixel(args) {
      // No-op
    }

    drawLine(args) {
      // No-op
    }

    drawCircle(args) {
      // No-op
    }

    drawRectangle(args) {
      // No-op
    }

    screenUpdate() {
      // No-op
    }

    screenInvert() {
      // No-op
    }

    playTone(args) {
      // No-op
    }

    playNote(args) {
      // No-op
    }

    beep() {
      // No-op
    }

    setVolume(args) {
      // No-op
    }

    stopSound() {
      // No-op
    }

    setLED(args) {
      // No-op
    }

    ledAllOff() {
      // No-op
    }

    waitSeconds(args) {
      // No-op
    }

    waitMillis(args) {
      // No-op
    }

    // ============================================================================
    // UTILITIES
    // ============================================================================

    async fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw error;
      }
    }

    showModal(title, content) {
      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 2px solid #7C3A9A;
        border-radius: 8px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        color: black;
      `;

      const titleEl = document.createElement("h3");
      titleEl.textContent = title;
      titleEl.style.cssText = "margin-top: 0; color: #7C3A9A;";

      const pre = document.createElement("pre");
      pre.style.cssText =
        "background: #f5f5f5; color: black; border: 1px solid #ccc; padding: 10px; overflow: auto; max-height: 500px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;";
      pre.textContent = content;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = t("close");
      closeBtn.style.cssText =
        "margin-top: 10px; padding: 8px 16px; background: #7C3A9A; color: white; border: none; border-radius: 4px; cursor: pointer;";
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(titleEl);
      modal.appendChild(pre);
      modal.appendChild(closeBtn);

      document.body.appendChild(modal);
    }

    downloadFile(filename, content, mimeType) {
      let blob;
      if (content instanceof Uint8Array) {
        blob = new Blob([content], { type: mimeType });
      } else {
        blob = new Blob([content], { type: mimeType });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  Scratch.extensions.register(new EV3LMSExtension());
})(Scratch);
