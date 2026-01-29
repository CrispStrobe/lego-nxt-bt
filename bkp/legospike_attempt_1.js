(function (Scratch) {
  "use strict";

  // ============================================================================
  // PYTHON TRANSPILER FOR SPIKE PRIME
  // ============================================================================

  class SpikePrimeTranspiler {
    constructor() {
      this.pythonCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.broadcastHandlers = new Map();
      this.usedImports = new Set();
      this.errors = [];
      this.warnings = [];
      this.debugLog = [];
    }

    log(message, data = null, level = "INFO") {
      const timestamp = new Date().toISOString();
      const logEntry = { timestamp, level, message, data };
      this.debugLog.push(logEntry);

      if (level === "ERROR") {
        console.error(`[SPIKE-${level}] ${message}`, data || "");
        this.errors.push({ timestamp, message, data });
      } else if (level === "WARN") {
        console.warn(`[SPIKE-${level}] ${message}`, data || "");
        this.warnings.push({ timestamp, message, data });
      } else {
        console.log(`[SPIKE-${level}] ${message}`, data || "");
      }
    }

    indent() {
      return "    ".repeat(this.indentLevel);
    }

    addLine(code) {
      this.pythonCode += this.indent() + code + "\n";
    }

    addComment(comment) {
      this.addLine(`# ${comment}`);
    }

    transpile() {
      this.log("=== Starting Python Transpilation ===");
      this.reset();

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        this.log("Found targets", { count: targets.length });

        // Generate Python header
        this.generateHeader();

        // Process each sprite/stage
        for (const target of targets) {
          this.log(`Processing ${target.isStage ? "stage" : "sprite"}`, {
            name: target.sprite.name,
          });
          this.processTarget(target);
        }

        // Generate main function
        this.generateMainFunction();

        // Add program end
        this.addLine("");
        this.addLine("# Run the program");
        this.addLine("runloop.run(main())");

        this.log("=== Python Transpilation Complete ===", {
          codeLength: this.pythonCode.length,
          lines: this.pythonCode.split("\n").length,
          errors: this.errors.length,
          warnings: this.warnings.length,
        });

        console.log("=== GENERATED PYTHON CODE ===\n" + this.pythonCode);

        return this.pythonCode;
      } catch (error) {
        this.log("CRITICAL ERROR during transpilation", {
          error: error.message,
          stack: error.stack,
        }, "ERROR");
        throw error;
      }
    }

    reset() {
      this.pythonCode = "";
      this.indentLevel = 0;
      this.variableCounter = 0;
      this.broadcastHandlers.clear();
      this.usedImports.clear();
      this.errors = [];
      this.warnings = [];
      this.debugLog = [];
    }

    generateHeader() {
      this.addComment("Generated Python code for SPIKE Prime Essential");
      this.addComment("by TurboWarp SPIKE Essential Extension");
      this.addComment(`Generated: ${new Date().toISOString()}`);
      this.addLine("");

      // Always import basic modules
      this.addLine("from hub import light_matrix, button, sound, motion_sensor, port");
      this.addLine("import motor");
      this.addLine("import runloop");
      this.addLine("import sys");
      this.addLine("");
    }

    generateMainFunction() {
      this.addLine("");
      this.addLine("async def main():");
      this.indentLevel++;
      
      if (this.mainCode) {
        this.pythonCode += this.mainCode;
      } else {
        this.addLine("pass");
      }
      
      this.indentLevel--;
    }

    processTarget(target) {
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      const blockKeys = Object.keys(blockArray);

      // Find hat blocks
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

      if (opcode === "event_whenflagclicked") {
        this.addComment("When green flag clicked");
        this.mainCode = "";
        const prevCode = this.pythonCode;
        this.pythonCode = "";
        
        this.processBlockChain(hatBlock.next, blocks);
        
        this.mainCode = this.pythonCode;
        this.pythonCode = prevCode;
      }
    }

    processBlockChain(blockId, blocks) {
      let currentId = blockId;
      let chainLength = 0;
      const maxChainLength = 10000;

      while (currentId) {
        const block = blocks._blocks[currentId];
        if (!block) {
          this.log("Block not found, ending chain", { blockId: currentId }, "WARN");
          break;
        }

        chainLength++;
        if (chainLength > maxChainLength) {
          this.log("WARNING: Block chain too long", { chainLength }, "WARN");
          break;
        }

        this.processBlock(block, blocks);
        currentId = block.next;
      }
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.log(`Processing block: ${opcode}`, { block: block.id });

      try {
        // Motor blocks
        if (opcode === "spikeessential_motorPWM") {
          this.transpileMotorPWM(block, blocks);
        } else if (opcode === "spikeessential_motorStop") {
          this.transpileMotorStop(block, blocks);
        } else if (opcode === "spikeessential_motorRunFor") {
          this.transpileMotorRunFor(block, blocks);
        } else if (opcode === "spikeessential_motorStart") {
          this.transpileMotorStart(block, blocks);
        } else if (opcode === "spikeessential_motorSetSpeed") {
          this.transpileMotorSetSpeed(block, blocks);
        }

        // Display blocks
        else if (opcode === "spikeessential_setMatrixImage") {
          this.transpileSetMatrixImage(block, blocks);
        } else if (opcode === "spikeessential_setMatrixPixel") {
          this.transpileSetMatrixPixel(block, blocks);
        } else if (opcode === "spikeessential_clearMatrix") {
          this.transpileClearMatrix(block, blocks);
        }

        // Sound blocks
        else if (opcode === "spikeessential_playTone") {
          this.transpilePlayTone(block, blocks);
        } else if (opcode === "spikeessential_stopSound") {
          this.transpileStopSound(block, blocks);
        }

        // LED blocks
        else if (opcode === "spikeessential_setHubLEDColor") {
          this.transpileSetHubLED(block, blocks);
        }

        // Sensor blocks
        else if (opcode === "spikeessential_getColor") {
          this.transpileGetColor(block, blocks);
        } else if (opcode === "spikeessential_getDistance") {
          this.transpileGetDistance(block, blocks);
        } else if (opcode === "spikeessential_getHubTilt") {
          this.transpileGetHubTilt(block, blocks);
        }

        // Control blocks
        else if (opcode === "control_wait") {
          this.transpileWait(block, blocks);
        } else if (opcode === "control_repeat") {
          this.transpileRepeat(block, blocks);
        } else if (opcode === "control_forever") {
          this.transpileForever(block, blocks);
        } else if (opcode === "control_if") {
          this.transpileIf(block, blocks);
        } else if (opcode === "control_if_else") {
          this.transpileIfElse(block, blocks);
        }

        // Default
        else {
          this.addComment(`TODO: Unsupported block: ${opcode}`);
          this.log(`WARNING: Unsupported block: ${opcode}`, null, "WARN");
        }
      } catch (error) {
        this.log(`ERROR processing block ${opcode}`, {
          error: error.message,
          stack: error.stack,
        }, "ERROR");
        this.addComment(`ERROR: ${opcode} - ${error.message}`);
      }
    }

    // ============================================================================
    // MOTOR TRANSPILERS
    // ============================================================================

    transpileMotorPWM(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const power = this.getInputValue(block, "POWER", blocks);

      this.addComment(`Motor ${port} run at ${power}% power`);
      this.addLine(`await motor.run(port.${port}, ${power})`);
    }

    transpileMotorStop(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);

      this.addComment(`Motor ${port} stop`);
      this.addLine(`motor.stop(port.${port})`);
    }

    transpileMotorRunFor(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const direction = this.getInputValue(block, "DIRECTION", blocks);
      const value = this.getInputValue(block, "VALUE", blocks);
      const unit = this.getInputValue(block, "UNIT", blocks);

      this.addComment(`Motor ${port} run ${direction} for ${value} ${unit}`);

      let speedValue = `${direction} * 500`;  // Default speed

      if (unit === "rotations" || unit === "'rotations'") {
        const degrees = `${value} * 360`;
        this.addLine(`await motor.run_for_degrees(port.${port}, ${degrees}, ${speedValue})`);
      } else if (unit === "degrees" || unit === "'degrees'") {
        this.addLine(`await motor.run_for_degrees(port.${port}, ${value}, ${speedValue})`);
      } else if (unit === "seconds" || unit === "'seconds'") {
        const milliseconds = `${value} * 1000`;
        this.addLine(`await motor.run_for_time(port.${port}, ${milliseconds}, ${speedValue})`);
      }
    }

    transpileMotorStart(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const direction = this.getInputValue(block, "DIRECTION", blocks);

      this.addComment(`Motor ${port} start ${direction}`);
      this.addLine(`await motor.run(port.${port}, ${direction} * 500)`);
    }

    transpileMotorSetSpeed(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);
      const speed = this.getInputValue(block, "SPEED", blocks);

      this.addComment(`Set motor ${port} speed to ${speed}%`);
      this.addComment("Note: Speed setting stored for next motor command");
      this.addLine(`# Speed will be applied in next motor command`);
    }

    // ============================================================================
    // DISPLAY TRANSPILERS
    // ============================================================================

    transpileSetMatrixImage(block, blocks) {
      const image = this.getInputValue(block, "IMAGE", blocks);
      
      this.addComment(`Display ${image} on matrix`);
      
      // Map image names to SPIKE Prime patterns
      const imageMap = {
        "HAPPY": "HAPPY",
        "SAD": "SAD",
        "HEART": "HEART",
        "ARROW_UP": "ARROW_N",
        "ARROW_DOWN": "ARROW_S",
        "ARROW_LEFT": "ARROW_W",
        "ARROW_RIGHT": "ARROW_E",
        "CHECK": "YES",
        "X": "NO",
        "BLANK": "HEART"  // Use HEART then clear as workaround
      };

      const mappedImage = imageMap[image.replace(/'/g, "")] || "HAPPY";
      this.addLine(`await light_matrix.write("${mappedImage}")`);
    }

    transpileSetMatrixPixel(block, blocks) {
      const x = this.getInputValue(block, "X", blocks);
      const y = this.getInputValue(block, "Y", blocks);
      const brightness = this.getInputValue(block, "BRIGHTNESS", blocks);

      this.addComment(`Set matrix pixel (${x}, ${y}) to ${brightness}%`);
      this.addLine(`light_matrix.set_pixel(${x}, ${y}, ${brightness})`);
    }

    transpileClearMatrix(block, blocks) {
      this.addComment("Clear matrix");
      this.addLine(`light_matrix.clear()`);
    }

    // ============================================================================
    // SOUND TRANSPILERS
    // ============================================================================

    transpilePlayTone(block, blocks) {
      const frequency = this.getInputValue(block, "FREQUENCY", blocks);
      const duration = this.getInputValue(block, "DURATION", blocks);

      this.addComment(`Play tone ${frequency} Hz for ${duration}s`);
      const durationMs = `int(${duration} * 1000)`;
      this.addLine(`await sound.beep(${frequency}, ${durationMs}, 100)`);
    }

    transpileStopSound(block, blocks) {
      this.addComment("Stop sound");
      this.addLine(`sound.stop()`);
    }

    // ============================================================================
    // LED TRANSPILERS
    // ============================================================================

    transpileSetHubLED(block, blocks) {
      const color = this.getInputValue(block, "COLOR", blocks);

      this.addComment(`Set hub LED to color ${color}`);
      
      // Map color values to SPIKE Prime constants
      const colorValue = color.replace(/'/g, "");
      this.addLine(`await light_matrix.write(" ")  # Clear`);
      this.addComment(`TODO: Set LED color to ${colorValue}`);
    }

    // ============================================================================
    // SENSOR TRANSPILERS
    // ============================================================================

    transpileGetColor(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);

      this.addComment(`Read color sensor on port ${port}`);
      this.addLine(`color_sensor.color(port.${port})`);
    }

    transpileGetDistance(block, blocks) {
      const port = this.getInputValue(block, "PORT", blocks);

      this.addComment(`Read distance sensor on port ${port}`);
      this.addLine(`distance_sensor.distance(port.${port})`);
    }

    transpileGetHubTilt(block, blocks) {
      const axis = this.getInputValue(block, "XYZ", blocks);

      this.addComment(`Read hub tilt ${axis}`);
      const axisMap = {
        "'x'": "pitch",
        "'y'": "roll",
        "'z'": "yaw",
        "x": "pitch",
        "y": "roll",
        "z": "yaw"
      };
      const spikeAxis = axisMap[axis] || "pitch";
      this.addLine(`motion_sensor.tilt_angles()[${axis === "'z'" || axis === "z" ? 2 : (axis === "'y'" || axis === "y" ? 1 : 0)}]`);
    }

    // ============================================================================
    // CONTROL TRANSPILERS
    // ============================================================================

    transpileWait(block, blocks) {
      const duration = this.getInputValue(block, "DURATION", blocks);

      this.addComment(`Wait ${duration} seconds`);
      const durationMs = `int(${duration} * 1000)`;
      this.addLine(`await runloop.sleep_ms(${durationMs})`);
    }

    transpileRepeat(block, blocks) {
      const times = this.getInputValue(block, "TIMES", blocks);

      this.addComment(`Repeat ${times} times`);
      this.addLine(`for _ in range(${times}):`);
      this.indentLevel++;

      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      } else {
        this.addLine("pass");
      }

      this.indentLevel--;
    }

    transpileForever(block, blocks) {
      this.addComment("Forever loop");
      this.addLine("while True:");
      this.indentLevel++;

      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      } else {
        this.addLine("pass");
      }

      this.indentLevel--;
    }

    transpileIf(block, blocks) {
      const condition = this.evaluateCondition(block, "CONDITION", blocks);

      this.addComment("If condition");
      this.addLine(`if ${condition}:`);
      this.indentLevel++;

      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      } else {
        this.addLine("pass");
      }

      this.indentLevel--;
    }

    transpileIfElse(block, blocks) {
      const condition = this.evaluateCondition(block, "CONDITION", blocks);

      this.addComment("If-else condition");
      this.addLine(`if ${condition}:`);
      this.indentLevel++;

      const substackId = this.getSubstackId(block, "SUBSTACK");
      if (substackId) {
        this.processBlockChain(substackId, blocks);
      } else {
        this.addLine("pass");
      }

      this.indentLevel--;
      this.addLine("else:");
      this.indentLevel++;

      const substack2Id = this.getSubstackId(block, "SUBSTACK2");
      if (substack2Id) {
        this.processBlockChain(substack2Id, blocks);
      } else {
        this.addLine("pass");
      }

      this.indentLevel--;
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
            return `"${primitiveValue}"`;
          }
        } else if (typeof inputData === "string") {
          const refBlock = blocks._blocks[inputData];
          if (refBlock) return this.evaluateBlock(refBlock, blocks);
        }
      }

      return "0";
    }

    evaluateBlock(block, blocks) {
      const opcode = block.opcode;

      if (opcode === "math_number") {
        return this.getFieldValue(block, "NUM") || "0";
      } else if (opcode === "text") {
        const text = this.getFieldValue(block, "TEXT");
        return `"${text || ""}"`;
      }

      return "0";
    }

    evaluateCondition(block, inputName, blocks) {
      return "True";  // Simplified
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
  }

  // ============================================================================
  // MAIN EXTENSION CLASS WITH BLE FILE UPLOAD
  // ============================================================================

  class SpikeEssentialExtension {
    constructor() {
      this.hubIP = null;
      this.pythonCode = "";
      this.transpiler = new SpikePrimeTranspiler();
      
      // BLE connection (same as before)
      this._ble = null;
      this._characteristic = null;
      
      this.log("Extension initialized");
    }

    log(message, data = null) {
      console.log(`[SPIKE-EXT] ${message}`, data || "");
    }

    getInfo() {
      return {
        id: "spikeessential",
        name: "SPIKE Essential (Transpiler)",
        blocks: [
          // Transpilation
          {
            blockType: Scratch.BlockType.LABEL,
            text: "Code Generation",
          },
          {
            opcode: "transpileToPython",
            blockType: Scratch.BlockType.COMMAND,
            text: "generate Python code",
          },
          {
            opcode: "showPythonCode",
            blockType: Scratch.BlockType.COMMAND,
            text: "show generated Python",
          },
          {
            opcode: "downloadPython",
            blockType: Scratch.BlockType.COMMAND,
            text: "download as .py file",
          },
          {
            opcode: "uploadAndRun",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload to hub slot [SLOT] and run",
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },

          "---",

          // Motors (same as before)
          {
            blockType: Scratch.BlockType.LABEL,
            text: "Motors",
          },
          {
            opcode: "motorPWM",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] start motor at [POWER] % power",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MULTIPLE_PORT", defaultValue: "A" },
              POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "motorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: "[PORT] stop motor",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "MULTIPLE_PORT", defaultValue: "A" },
            },
          },
          // ... (keep other motor blocks)
        ],
        menus: {
          PORT: { acceptReporters: true, items: ["A", "B"] },
          MULTIPLE_PORT: { acceptReporters: true, items: ["A", "B", "A+B"] },
        },
      };
    }

    // ============================================================================
    // TRANSPILATION BLOCKS
    // ============================================================================

    transpileToPython() {
      try {
        this.pythonCode = this.transpiler.transpile();
        alert("✅ Python code generated!\n\n" + 
              `Errors: ${this.transpiler.errors.length}\n` +
              `Warnings: ${this.transpiler.warnings.length}`);
      } catch (error) {
        alert("❌ Transpilation failed:\n" + error.message);
      }
    }

    showPythonCode() {
      if (!this.pythonCode) {
        alert("No code generated yet!");
        return;
      }

      this.showModal("Generated Python Code", this.pythonCode);
    }

    downloadPython() {
      if (!this.pythonCode) {
        alert("Generate Python code first!");
        return;
      }

      this.downloadFile("spike_program.py", this.pythonCode, "text/plain");
    }

    async uploadAndRun(args) {
      if (!this.pythonCode) {
        alert("Generate Python code first!");
        return;
      }

      const slot = Math.floor(args.SLOT) % 20;  // 0-19
      
      try {
        // Upload via BLE (implementation would go here)
        alert(`TODO: Upload to slot ${slot} and run\n\nFor now, download the .py file and upload via SPIKE app.`);
      } catch (error) {
        alert("Upload failed: " + error.message);
      }
    }

    // ============================================================================
    // UTILITIES
    // ============================================================================

    showModal(title, content) {
      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 20px; border: 2px solid #7C3A9A;
        max-width: 80%; max-height: 80%; overflow: auto; z-index: 10000;
      `;

      const pre = document.createElement("pre");
      pre.textContent = content;
      pre.style.cssText = "background: #f5f5f5; padding: 10px; overflow: auto;";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(document.createElement("h3")).textContent = title;
      modal.appendChild(pre);
      modal.appendChild(closeBtn);

      document.body.appendChild(modal);
    }

    downloadFile(filename, content, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Stub methods for block compatibility
    motorPWM(args) {}
    motorStop(args) {}
  }

  Scratch.extensions.register(new SpikeEssentialExtension());
})(Scratch);