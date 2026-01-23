(function (Scratch) {
  "use strict";

  // ============================================================================
  // INTERNATIONALIZATION (i18n)
  // ============================================================================

  const translations = {
    en: {
      extensionName: "EV3 LMS Compiler",
      
      // Connection & Compilation
      connection: "LMS Compilation Service",
      setLMSApiUrl: "set LMS API to [URL]:[PORT]",
      testConnection: "test LMS API connection",
      
      // Transpilation & Compilation
      transpilation: "Code Generation & Compilation",
      transpileToLMS: "generate LMS assembly code",
      showLMSCode: "show generated LMS code",
      downloadLMSCode: "download as .lms file",
      compileToRBF: "compile to RBF bytecode",
      showRBFCode: "show RBF bytecode (base64)",
      downloadRBF: "download as .rbf file",
      uploadToEV3: "upload RBF to EV3 and run",
      
      // Motors
      motors: "EV3 Motors",
      motorRun: "motor [PORT] run at [POWER]%",
      motorRunFor: "motor [PORT] run for [TIME] seconds at [POWER]%",
      motorStop: "motor [PORT] stop",
      
      // Sensors
      sensors: "EV3 Sensors",
      touchSensor: "touch sensor [PORT] pressed?",
      
      // Display & Sound
      displaySound: "Display & Sound",
      playTone: "play tone [FREQ] Hz for [DURATION] ms",
      
      // Control
      control: "Control",
      wait: "wait [TIME] seconds",
      
      // Messages
      noCodeGenerated: "No code generated yet!",
      generateFirst: "Generate LMS code first!",
      compileFirst: "Compile to RBF first!",
      downloaded: "Downloaded",
      connected: "Connected",
      notConnected: "Not connected",
      compilationSuccess: "✅ Compilation successful!",
      compilationFailed: "❌ Compilation failed",
    },
    
    de: {
      extensionName: "EV3 LMS Compiler",
      
      // Connection & Compilation
      connection: "LMS Kompilierungsdienst",
      setLMSApiUrl: "setze LMS API auf [URL]:[PORT]",
      testConnection: "teste LMS API Verbindung",
      
      // Transpilation & Compilation
      transpilation: "Code-Generierung & Kompilierung",
      transpileToLMS: "generiere LMS Assembly Code",
      showLMSCode: "zeige generierten LMS Code",
      downloadLMSCode: "als .lms Datei herunterladen",
      compileToRBF: "zu RBF Bytecode kompilieren",
      showRBFCode: "zeige RBF Bytecode (base64)",
      downloadRBF: "als .rbf Datei herunterladen",
      uploadToEV3: "RBF zu EV3 hochladen und ausführen",
      
      // Motors
      motors: "EV3 Motoren",
      motorRun: "Motor [PORT] läuft mit [POWER]%",
      motorRunFor: "Motor [PORT] läuft für [TIME] Sekunden mit [POWER]%",
      motorStop: "Motor [PORT] stopp",
      
      // Sensors
      sensors: "EV3 Sensoren",
      touchSensor: "Berührungssensor [PORT] gedrückt?",
      
      // Display & Sound
      displaySound: "Anzeige & Sound",
      playTone: "spiele Ton [FREQ] Hz für [DURATION] ms",
      
      // Control
      control: "Steuerung",
      wait: "warte [TIME] Sekunden",
      
      // Messages
      noCodeGenerated: "Noch kein Code generiert!",
      generateFirst: "Generiere zuerst LMS Code!",
      compileFirst: "Kompiliere zuerst zu RBF!",
      downloaded: "Heruntergeladen",
      connected: "Verbunden",
      notConnected: "Nicht verbunden",
      compilationSuccess: "✅ Kompilierung erfolgreich!",
      compilationFailed: "❌ Kompilierung fehlgeschlagen",
    },
  };

  // Language detection (same as before)
  function detectLanguage() {
    let finalLanguage = "en";
    
    try {
      if (window.ReduxStore && window.ReduxStore.getState) {
        const state = window.ReduxStore.getState();
        const reduxLocale = state.locales?.locale;
        if (reduxLocale && typeof reduxLocale === "string") {
          finalLanguage = reduxLocale.toLowerCase().startsWith("de") ? "de" : "en";
          return finalLanguage;
        }
      }
    } catch (e) {}
    
    try {
      const twSettings = localStorage.getItem("tw:language");
      if (twSettings) {
        finalLanguage = twSettings.toLowerCase().startsWith("de") ? "de" : "en";
        return finalLanguage;
      }
    } catch (e) {}
    
    try {
      const navLang = navigator.language;
      if (navLang) {
        finalLanguage = navLang.toLowerCase().startsWith("de") ? "de" : "en";
      }
    } catch (e) {}
    
    return finalLanguage;
  }

  let currentLang = detectLanguage();

  function t(key) {
    return translations[currentLang][key] || translations["en"][key] || key;
  }

  // ============================================================================
  // LMS TRANSPILER CLASS
  // ============================================================================

  class LMSTranspiler {
    constructor() {
      this.lmsCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.labelCounter = 0;
      this.variables = new Map(); // Maps Scratch variable names to LMS variable names
      this.timerVars = []; // Track timer variables
      this.debugLog = [];
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
    }

    allocateVariable(type, name = null) {
      const varName = name || `VAR${this.variableCounter++}`;
      this.addLine(`${type} ${varName}`);
      return varName;
    }

    allocateTimer() {
      const timerVar = this.allocateVariable("DATA32", `Timer${this.timerVars.length}`);
      this.timerVars.push(timerVar);
      return timerVar;
    }

    generateLabel() {
      return `LABEL${this.labelCounter++}`;
    }

    transpile() {
      this.log("=== Starting LMS Transpilation ===");
      this.lmsCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.labelCounter = 0;
      this.variables.clear();
      this.timerVars = [];

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        this.log("Found targets", { count: targets.length });

        // Generate LMS header
        this.generateHeader();

        // Process each sprite/stage
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          this.log(`Processing ${target.isStage ? "stage" : "sprite"}`, {
            name: target.sprite.name,
          });
          this.processTarget(target);
        }

        // Close main thread
        this.addLine("}");

        this.log("=== LMS Transpilation Complete ===", {
          codeLength: this.lmsCode.length,
          lines: this.lmsCode.split("\n").length,
        });

        console.log("=== GENERATED LMS CODE ===\n" + this.lmsCode);
      } catch (error) {
        this.log("ERROR during transpilation", {
          error: error.message,
          stack: error.stack,
        });
        console.error(error);
      }
    }

    generateHeader() {
      this.addLine("// Generated LMS Assembly from Scratch");
      this.addLine("// by TurboWarp EV3 LMS Extension");
      this.addLine(`// Language: ${currentLang}`);
      this.addLine("");
      this.addLine("vmthread MAIN");
      this.addLine("{");
      this.indentLevel++;
      
      // Declare common variables
      this.addLine("// Common variables");
      this.addLine("DATA8 Layer");
      this.addLine("DATA8 Port");
      this.addLine("DATA8 Power");
      this.addLine("DATA32 Time");
      this.addLine("DATA32 TimeMs");
      this.addLine("DATA16 Frequency");
      this.addLine("DATA16 Duration");
      this.addLine("");
      
      // Initialize layer to 0
      this.addLine("// Initialize layer");
      this.addLine("MOVE8_8(0, Layer)");
      this.addLine("");
    }

    processTarget(target) {
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      const blockKeys = Object.keys(blockArray);

      // Find hat blocks (entry points)
      const hatBlocks = [];
      for (let i = 0; i < blockKeys.length; i++) {
        const block = blockArray[blockKeys[i]];
        if (block.opcode && block.opcode.startsWith("event_when")) {
          hatBlocks.push(block);
        }
      }

      this.log("Found hat blocks", { count: hatBlocks.length });

      // For now, process only "when green flag clicked"
      for (let i = 0; i < hatBlocks.length; i++) {
        const block = hatBlocks[i];
        if (block.opcode === "event_whenflagclicked") {
          this.addLine(`// Event: ${block.opcode}`);
          this.processBlockChain(block.next, blocks);
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
          this.log("WARNING: Block chain too long, stopping", { chainLength });
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.log("Processing block", { opcode });

      // Motor blocks
      if (opcode === "ev3lms_motorRun") {
        const port = this.getPortMask(this.getInputValue(block, "PORT", blocks));
        const power = this.getInputValue(block, "POWER", blocks);
        
        this.addLine(`// Motor run at power`);
        this.addLine(`MOVE8_8(${port}, Port)`);
        this.addLine(`MOVE8_8(${power}, Power)`);
        this.addLine(`OUTPUT_POWER(Layer, Port, Power)`);
        this.addLine(`OUTPUT_START(Layer, Port)`);
      } 
      else if (opcode === "ev3lms_motorRunFor") {
        const port = this.getPortMask(this.getInputValue(block, "PORT", blocks));
        const time = this.getInputValue(block, "TIME", blocks);
        const power = this.getInputValue(block, "POWER", blocks);
        
        // Convert seconds to milliseconds
        const timeMs = `(${time} * 1000)`;
        
        this.addLine(`// Motor run for time`);
        this.addLine(`MOVE8_8(${port}, Port)`);
        this.addLine(`MOVE8_8(${power}, Power)`);
        this.addLine(`MOVE32_32(${timeMs}, TimeMs)`);
        this.addLine(`OUTPUT_TIME_POWER(Layer, Port, Power, 0, TimeMs, 0, 1)`);
      }
      else if (opcode === "ev3lms_motorStop") {
        const port = this.getPortMask(this.getInputValue(block, "PORT", blocks));
        
        this.addLine(`// Motor stop`);
        this.addLine(`MOVE8_8(${port}, Port)`);
        this.addLine(`OUTPUT_STOP(Layer, Port, 1)`); // 1 = brake
      }

      // Sound blocks
      else if (opcode === "ev3lms_playTone") {
        const freq = this.getInputValue(block, "FREQ", blocks);
        const duration = this.getInputValue(block, "DURATION", blocks);
        
        this.addLine(`// Play tone`);
        this.addLine(`MOVE16_16(${freq}, Frequency)`);
        this.addLine(`MOVE16_16(${duration}, Duration)`);
        this.addLine(`SOUND(TONE, 100, Frequency, Duration)`);
        
        // Wait for sound to finish
        const timerVar = this.allocateTimer();
        this.addLine(`TIMER_WAIT(Duration, ${timerVar})`);
        this.addLine(`TIMER_READY(${timerVar})`);
      }

      // Control blocks
      else if (opcode === "control_wait") {
        const duration = this.getInputValue(block, "DURATION", blocks);
        const durationMs = `(${duration} * 1000)`;
        
        this.addLine(`// Wait`);
        this.addLine(`MOVE32_32(${durationMs}, TimeMs)`);
        const timerVar = this.allocateTimer();
        this.addLine(`TIMER_WAIT(TimeMs, ${timerVar})`);
        this.addLine(`TIMER_READY(${timerVar})`);
      }
      else if (opcode === "control_repeat") {
        const times = this.getInputValue(block, "TIMES", blocks);
        const loopVar = this.allocateVariable("DATA32", "LoopCounter");
        const loopStart = this.generateLabel();
        const loopEnd = this.generateLabel();
        
        this.addLine(`// Repeat ${times} times`);
        this.addLine(`MOVE32_32(0, ${loopVar})`);
        this.addLine(`${loopStart}:`);
        this.indentLevel++;
        
        // Process substack
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        
        // Increment and check
        this.addLine(`ADD32(${loopVar}, 1, ${loopVar})`);
        this.addLine(`JR_LT32(${loopVar}, ${times}, ${loopStart})`);
        this.indentLevel--;
        this.addLine(`${loopEnd}:`);
      }
      else if (opcode === "control_if") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        const ifLabel = this.generateLabel();
        const endLabel = this.generateLabel();
        
        this.addLine(`// If condition`);
        this.addLine(`JR_FALSE(${condition}, ${endLabel})`);
        this.indentLevel++;
        
        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        }
        
        this.indentLevel--;
        this.addLine(`${endLabel}:`);
      }

      // Motion blocks (simplified - just move motors)
      else if (opcode === "motion_movesteps") {
        const steps = this.getInputValue(block, "STEPS", blocks);
        
        this.addLine(`// Move steps (using motor B & C)`);
        this.addLine(`MOVE8_8(0x06, Port)`); // B+C = 0x02 + 0x04
        this.addLine(`MOVE8_8(50, Power)`);
        this.addLine(`MOVE32_32(${steps} * 10, TimeMs)`); // Scale steps
        this.addLine(`OUTPUT_TIME_POWER(Layer, Port, Power, 0, TimeMs, 0, 1)`);
      }

      // Data blocks
      else if (opcode === "data_setvariableto") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        
        let lmsVar = this.variables.get(varName);
        if (!lmsVar) {
          lmsVar = this.allocateVariable("DATA32", this.sanitizeVarName(varName));
          this.variables.set(varName, lmsVar);
        }
        
        this.addLine(`// Set variable: ${varName}`);
        this.addLine(`MOVE32_32(${value}, ${lmsVar})`);
      }

      // Default
      else {
        this.addLine(`// TODO: ${opcode}`);
      }
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

          if (primitiveType === 4 || primitiveType === 5 || 
              primitiveType === 6 || primitiveType === 7) {
            return String(primitiveValue);
          } else if (primitiveType === 10) {
            return String(primitiveValue);
          }
        } else if (typeof inputData === "string") {
          const refBlock = blocks._blocks[inputData];
          if (refBlock) return this.evaluateBlock(refBlock, blocks);
        }
      }

      return "0";
    }

    evaluateBlock(block, blocks) {
      if (block.opcode === "math_number" ||
          block.opcode === "math_whole_number" ||
          block.opcode === "math_positive_number" ||
          block.opcode === "math_integer") {
        const num = this.getFieldValue(block, "NUM");
        return num || "0";
      }
      else if (block.opcode === "data_variable") {
        const varName = this.getFieldValue(block, "VARIABLE");
        let lmsVar = this.variables.get(varName);
        if (!lmsVar) {
          lmsVar = this.allocateVariable("DATA32", this.sanitizeVarName(varName));
          this.variables.set(varName, lmsVar);
        }
        return lmsVar;
      }
      else if (block.opcode === "operator_add") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        const resultVar = this.allocateVariable("DATA32");
        this.addLine(`ADD32(${num1}, ${num2}, ${resultVar})`);
        return resultVar;
      }
      else if (block.opcode === "operator_subtract") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        const resultVar = this.allocateVariable("DATA32");
        this.addLine(`SUB32(${num1}, ${num2}, ${resultVar})`);
        return resultVar;
      }
      else if (block.opcode === "operator_multiply") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        const resultVar = this.allocateVariable("DATA32");
        this.addLine(`MUL32(${num1}, ${num2}, ${resultVar})`);
        return resultVar;
      }
      else if (block.opcode === "operator_divide") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        const resultVar = this.allocateVariable("DATA32");
        this.addLine(`DIV32(${num1}, ${num2}, ${resultVar})`);
        return resultVar;
      }

      return "0";
    }

    getFieldValue(block, fieldName) {
      if (block.fields && block.fields[fieldName]) {
        const field = block.fields[fieldName];
        const value = field.value || field.id || field.name;
        return value;
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
      // Convert "A", "B", "C", "D" to bit mask
      const portMap = {
        "A": "0x01",
        "B": "0x02",
        "C": "0x04",
        "D": "0x08",
      };
      
      // Remove quotes if present
      const cleanPort = port.replace(/"/g, "");
      return portMap[cleanPort] || "0x01";
    }

    sanitizeVarName(name) {
      // Convert Scratch variable names to valid LMS identifiers
      return name.replace(/[^a-zA-Z0-9_]/g, "_");
    }
  }

  // ============================================================================
  // MAIN EXTENSION CLASS
  // ============================================================================

  class EV3LMSExtension {
    constructor() {
      this.lmsApiUrl = "http://127.0.0.1";
      this.lmsApiPort = 7860;
      this.lmsCode = "";
      this.rbfBase64 = "";
      this.transpiler = new LMSTranspiler();

      this.log("Extension initialized", {
        lang: currentLang,
        version: "1.0.0",
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
            opcode: "testConnection",
            blockType: Scratch.BlockType.REPORTER,
            text: t("testConnection"),
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
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
              POWER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          {
            opcode: "motorRunFor",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRunFor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
              TIME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              POWER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorStop"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
            },
          },

          "---",

          // Display & Sound
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("displaySound"),
          },
          {
            opcode: "playTone",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playTone"),
            arguments: {
              FREQ: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 440,
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 500,
              },
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
        },
      };
    }

    // ============================================================================
    // CONNECTION
    // ============================================================================

    setLMSApiUrl(args) {
      this.lmsApiUrl = args.URL;
      this.lmsApiPort = args.PORT;
      this.log("LMS API configured", {
        url: this.lmsApiUrl,
        port: this.lmsApiPort,
      });
    }

    async testConnection() {
      try {
        const url = `${this.lmsApiUrl}:${this.lmsApiPort}/`;
        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
        });

        if (response.ok) {
          this.log("Connection test successful");
          return t("connected");
        } else {
          this.log("Connection test failed", { status: response.status });
          return t("notConnected");
        }
      } catch (error) {
        this.log("Connection test error", { error: error.message });
        return t("notConnected") + ": " + error.message;
      }
    }

    // ============================================================================
    // TRANSPILATION
    // ============================================================================

    transpileToLMS() {
      this.transpiler.transpile();
      this.lmsCode = this.transpiler.lmsCode;
      this.log("LMS transpilation complete", {
        length: this.lmsCode.length,
      });
    }

    showLMSCode() {
      if (!this.lmsCode) {
        alert(t("noCodeGenerated"));
        return;
      }

      this.showModal(
        "Generated LMS Assembly Code",
        this.lmsCode,
        "lms"
      );
    }

    downloadLMSCode() {
      if (!this.lmsCode) {
        alert(t("generateFirst"));
        return;
      }

      this.downloadFile("program.lms", this.lmsCode, "text/plain");
      alert(t("downloaded") + " program.lms");
    }

    // ============================================================================
    // COMPILATION
    // ============================================================================

    async compileToRBF() {
      if (!this.lmsCode) {
        alert(t("generateFirst"));
        return;
      }

      try {
        // NEW ENDPOINT: Directly calling our custom FastAPI route
        const url = `${this.lmsApiUrl}:${this.lmsApiPort}/compile`;
        
        this.log("Sending compilation request", { url });

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // NEW BODY FORMAT: Simple JSON
          body: JSON.stringify({
            code: this.lmsCode
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        this.log("Compilation response received", { result });

        if (result.success) {
            this.rbfBase64 = result.base64;
            alert(t("compilationSuccess") + "\n\n" + result.message);
        } else {
            throw new Error(result.error || "Unknown error");
        }

      } catch (error) {
        this.log("Compilation error", { error: error.message });
        alert(t("compilationFailed") + ":\n" + error.message);
      }
    }

    showRBFCode() {
      if (!this.rbfBase64) {
        alert(t("compileFirst"));
        return;
      }

      this.showModal(
        "RBF Bytecode (Base64)",
        this.rbfBase64,
        "text"
      );
    }

    downloadRBF() {
      if (!this.rbfBase64) {
        alert(t("compileFirst"));
        return;
      }

      // Convert base64 to binary
      const binaryString = atob(this.rbfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      this.downloadFile("program.rbf", bytes, "application/octet-stream");
      alert(t("downloaded") + " program.rbf");
    }

    // ============================================================================
    // BLOCK IMPLEMENTATIONS (Runtime - these do nothing in streaming mode)
    // ============================================================================

    motorRun(args) {
      // These blocks are just for visual programming
      // Actual execution happens via transpiled LMS code
    }

    motorRunFor(args) {
      // No-op
    }

    motorStop(args) {
      // No-op
    }

    playTone(args) {
      // No-op
    }

    // ============================================================================
    // UI HELPERS
    // ============================================================================

    showModal(title, content, type = "text") {
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
        color: black; /* Force black text for the container */
      `;

      const titleEl = document.createElement("h3");
      titleEl.textContent = title;
      titleEl.style.cssText = "margin-top: 0; color: #7C3A9A;";

      const pre = document.createElement("pre");
      // ADDED: color: black and border
      pre.style.cssText =
        "background: #f5f5f5; color: black; border: 1px solid #ccc; padding: 10px; overflow: auto; max-height: 500px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;";
      pre.textContent = content;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = t("close") || "Close";
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