(function (Scratch) {
  "use strict";

  // ============================================================================
  // INTERNATIONALIZATION (i18n)
  // ============================================================================

  const translations = {
    en: {
      // Extension Info
      extensionName: "Scratch to EV3",

      // Connection
      connection: "Connection",
      setEV3IP: "set EV3 IP to [IP]",
      enableStreaming: "enable streaming mode",
      disableStreaming: "disable streaming mode",
      testConnection: "test EV3 connection",

      // Transpilation
      transpilation: "Code Generation",
      transpileProject: "transpile project to EV3 Python",
      showCode: "show generated code",
      downloadCode: "download as .py file",
      downloadUploader: "download upload script",

      // Motors
      motors: "EV3 Motors",
      motorRun: "motor [PORT] run at [SPEED]%",
      motorRunFor: "motor [PORT] run [ROTATIONS] rotations at [SPEED]%",
      motorStop: "motor [PORT] stop [BRAKE]",
      tankDrive: "tank drive L:[LEFT] R:[RIGHT] for [ROTATIONS] rotations",
      motorPosition: "motor [PORT] position",
      motorSpeed: "motor [PORT] speed",
      motorReset: "reset motor [PORT] position",

      // Sensors
      sensors: "EV3 Sensors",
      touchSensor: "touch sensor [PORT] pressed?",
      colorSensor: "color sensor [PORT] [MODE]",
      colorRGB: "color sensor [PORT] RGB [COMPONENT]",
      ultrasonicSensor: "ultrasonic sensor [PORT] distance cm",
      gyroSensor: "gyro sensor [PORT] [MODE]",

      // Infrared
      infrared: "Infrared Sensor",
      irProximity: "infrared [PORT] proximity",
      irBeaconHeading: "infrared [PORT] beacon heading ch[CHANNEL]",
      irBeaconDistance: "infrared [PORT] beacon distance ch[CHANNEL]",
      irRemoteButton: "infrared [PORT] ch[CHANNEL] button [BUTTON] pressed?",

      // Buttons
      buttons: "EV3 Buttons",
      buttonPressed: "button [BUTTON] pressed?",

      // Display & Sound
      displaySound: "Display & Sound",
      screenClear: "clear screen",
      screenText: "show text [TEXT] at x:[X] y:[Y]",
      drawCircle: "draw circle at x:[X] y:[Y] radius:[R]",
      drawRectangle: "draw rectangle x1:[X1] y1:[Y1] x2:[X2] y2:[Y2]",
      drawLine: "draw line from x1:[X1] y1:[Y1] to x2:[X2] y2:[Y2]",
      speak: "speak [TEXT]",
      beep: "beep [FREQUENCY] Hz for [DURATION] ms",
      setLED: "set LED to [COLOR]",
      setVolume: "set volume to [VOLUME]%",
      playTone: "play tone [NOTE] for [DURATION] secs",
      setLEDSide: "set LED [SIDE] to [COLOR]",
      ledAllOff: "turn all LEDs off",
      ledReset: "reset LEDs to default",
      ledAnimate:
        "LED animate [ANIMATION] [COLOR1] [COLOR2] for [DURATION] secs speed [SLEEPTIME]",
      playSong: "play song [SONG] at tempo [TEMPO]",
      playToneSequence: "play tone sequence [SEQUENCE]",
      playFile: "play sound file [FILENAME] volume [VOLUME]%",
      ledStopAnimation: "stop LED animation",
      getVolume: "volume %",

      // System
      system: "System",
      batteryLevel: "battery level %",

      // Sprite State
      spriteState: "Sprite State (Virtual)",
      spriteGetX: "sprite [SPRITE] x position",
      spriteGetY: "sprite [SPRITE] y position",
      spriteGetSize: "sprite [SPRITE] size",
      spriteGetVisible: "sprite [SPRITE] visible?",
      spriteSetPosition: "set sprite [SPRITE] position to x:[X] y:[Y]",
      spriteSetSize: "set sprite [SPRITE] size to [SIZE]",
      spriteSetVisible: "set sprite [SPRITE] visible [VISIBLE]",

      // Messages
      noCodeGenerated: "No code generated yet!",
      generateFirst: "Generate code first!",
      downloaded: "Downloaded",
      connected: "Connected",
      notConnected: "Not connected",
      uploaderInstructions:
        "Make executable: chmod +x upload_to_ev3.sh\nRun: ./upload_to_ev3.sh <ip>",

      // Modal
      generatedCode: "Generated EV3 Python Code",
      close: "Close",
    },

    de: {
      // Extension Info
      extensionName: "Scratch zu EV3",

      // Connection
      connection: "Verbindung",
      setEV3IP: "setze EV3 IP auf [IP]",
      enableStreaming: "Streaming-Modus aktivieren",
      disableStreaming: "Streaming-Modus deaktivieren",
      testConnection: "EV3 Verbindung testen",

      // Transpilation
      transpilation: "Code-Generierung",
      transpileProject: "Projekt zu EV3 Python transpilieren",
      showCode: "generierten Code anzeigen",
      downloadCode: "als .py Datei herunterladen",
      downloadUploader: "Upload-Skript herunterladen",

      // Motors
      motors: "EV3 Motoren",
      motorRun: "Motor [PORT] läuft mit [SPEED]%",
      motorRunFor: "Motor [PORT] läuft [ROTATIONS] Umdrehungen mit [SPEED]%",
      motorStop: "Motor [PORT] stopp [BRAKE]",
      tankDrive: "Kettenantrieb L:[LEFT] R:[RIGHT] für [ROTATIONS] Umdrehungen",
      motorPosition: "Motor [PORT] Position",
      motorSpeed: "Motor [PORT] Geschwindigkeit",
      motorReset: "Motor [PORT] Position zurücksetzen",

      // Sensors
      sensors: "EV3 Sensoren",
      touchSensor: "Berührungssensor [PORT] gedrückt?",
      colorSensor: "Farbsensor [PORT] [MODE]",
      colorRGB: "Farbsensor [PORT] RGB [COMPONENT]",
      ultrasonicSensor: "Ultraschallsensor [PORT] Entfernung cm",
      gyroSensor: "Gyrosensor [PORT] [MODE]",

      // Infrared
      infrared: "Infrarotsensor",
      irProximity: "Infrarot [PORT] Nähe",
      irBeaconHeading: "Infrarot [PORT] Bake Richtung Kanal[CHANNEL]",
      irBeaconDistance: "Infrarot [PORT] Bake Entfernung Kanal[CHANNEL]",
      irRemoteButton: "Infrarot [PORT] Kanal[CHANNEL] Taste [BUTTON] gedrückt?",

      // Buttons
      buttons: "EV3 Tasten",
      buttonPressed: "Taste [BUTTON] gedrückt?",

      // Display & Sound
      displaySound: "Anzeige & Sound",
      screenClear: "Bildschirm löschen",
      screenText: "zeige Text [TEXT] bei x:[X] y:[Y]",
      drawCircle: "zeichne Kreis bei x:[X] y:[Y] Radius:[R]",
      drawRectangle: "zeichne Rechteck x1:[X1] y1:[Y1] x2:[X2] y2:[Y2]",
      drawLine: "zeichne Linie von x1:[X1] y1:[Y1] zu x2:[X2] y2:[Y2]",
      speak: "spreche [TEXT]",
      beep: "piep [FREQUENCY] Hz für [DURATION] ms",
      setLED: "setze LED auf [COLOR]",
      setVolume: "setze Lautstärke auf [VOLUME]%",
      playTone: "spiele Ton [NOTE] für [DURATION] Sek",
      setLEDSide: "setze LED [SIDE] auf [COLOR]",
      ledAllOff: "alle LEDs ausschalten",
      ledReset: "LEDs zurücksetzen",
      ledAnimate:
        "LED Animation [ANIMATION] [COLOR1] [COLOR2] für [DURATION] Sek Geschw. [SLEEPTIME]",
      ledStopAnimation: "LED Animation stoppen",
      getVolume: "Lautstärke %",

      // Sound Blöcke
      playSong: "spiele Lied [SONG] Tempo [TEMPO]",
      playToneSequence: "spiele Tonfolge [SEQUENCE]",
      playFile: "spiele Sounddatei [FILENAME] Lautstärke [VOLUME]%",

      // System
      system: "System",
      batteryLevel: "Batteriestand %",

      // Sprite State
      spriteState: "Sprite-Status (Virtuell)",
      spriteGetX: "Sprite [SPRITE] x Position",
      spriteGetY: "Sprite [SPRITE] y Position",
      spriteGetSize: "Sprite [SPRITE] Größe",
      spriteGetVisible: "Sprite [SPRITE] sichtbar?",
      spriteSetPosition: "setze Sprite [SPRITE] Position auf x:[X] y:[Y]",
      spriteSetSize: "setze Sprite [SPRITE] Größe auf [SIZE]",
      spriteSetVisible: "setze Sprite [SPRITE] sichtbar [VISIBLE]",

      // Messages
      noCodeGenerated: "Noch kein Code generiert!",
      generateFirst: "Generiere zuerst Code!",
      downloaded: "Heruntergeladen",
      connected: "Verbunden",
      notConnected: "Nicht verbunden",
      uploaderInstructions:
        "Ausführbar machen: chmod +x upload_to_ev3.sh\nAusführen: ./upload_to_ev3.sh <ip>",

      // Modal
      generatedCode: "Generierter EV3 Python Code",
      close: "Schließen",
    },
  };

  // Detect browser language
  let currentLang = "en";
  if (navigator.language) {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("de")) {
      currentLang = "de";
    }
  }

  function t(key) {
    return translations[currentLang][key] || translations["en"][key] || key;
  }

  // ============================================================================
  // MAIN EXTENSION CLASS
  // ============================================================================

  class ScratchToEV3 {
    constructor() {
      // Transpiler state
      this.pythonCode = "";
      this.indentLevel = 0;
      this.debugLog = [];
      this.scriptCounter = 1;
      this.broadcastHandlers = [];
      this.mainScripts = [];
      this.soundFiles = [];
      this.usedMotors = new Set();
      this.usedSensors = new Set();
      this.spriteStates = {};

      // Script management state
      this.currentScriptId = null;
      this.availableScripts = [];

      // Streaming mode state
      this.ev3Protocol = "http";
      this.ev3IP = "192.168.178.50";
      this.ev3Port = 8080;
      this.streamingMode = false;

      this.log("Extension initialized", {
        lang: currentLang,
        version: "2.0.0",
      });
    }

    getInfo() {
      return {
        id: "scratchtoev3",
        name: t("extensionName"),
        color1: "#4C97FF",
        color2: "#3373CC",
        color3: "#2E5C8A",
        blocks: [
          // Connection
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("connection"),
          },
          {
            opcode: "setConnectionMode",
            blockType: Scratch.BlockType.COMMAND,
            text: "set connection [MODE] IP [IP] port [PORT]",
            arguments: {
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "connectionModes",
                defaultValue: "http",
              },
              IP: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "192.168.1.100",
              },
              PORT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 8080,
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

          "---",

          // Transpilation
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("transpilation"),
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
            opcode: "downloadUploader",
            blockType: Scratch.BlockType.COMMAND,
            text: t("downloadUploader"),
          },

          "---",

          // Script Management Section
          {
            blockType: Scratch.BlockType.LABEL,
            text: "Script Management",
          },
          {
            opcode: "uploadAndRunScript",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload and run current project as [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "scratch_program.py",
              },
            },
          },
          {
            opcode: "uploadScript",
            blockType: Scratch.BlockType.COMMAND,
            text: "upload current project as [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "scratch_program.py",
              },
            },
          },
          {
            opcode: "runScriptByName",
            blockType: Scratch.BlockType.COMMAND,
            text: "run script [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "scratch_program.py",
              },
            },
          },
          {
            opcode: "stopCurrentScript",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop current script",
          },
          {
            opcode: "stopScriptById",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop script ID [ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "stopAllScripts",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop all running scripts",
          },
          {
            opcode: "deleteScript",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete script [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "scratch_program.py",
              },
            },
          },
          {
            opcode: "refreshScriptList",
            blockType: Scratch.BlockType.COMMAND,
            text: "refresh script list",
          },
          {
            opcode: "getScriptList",
            blockType: Scratch.BlockType.REPORTER,
            text: "available scripts (JSON)",
          },
          {
            opcode: "getRunningScripts",
            blockType: Scratch.BlockType.REPORTER,
            text: "running scripts (JSON)",
          },
          {
            opcode: "getScriptCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "number of available scripts",
          },
          {
            opcode: "isScriptRunning",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "script [NAME] is running?",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "scratch_program.py",
              },
            },
          },
          {
            opcode: "getCurrentScriptId",
            blockType: Scratch.BlockType.REPORTER,
            text: "current script ID",
          },

          "---",

          // Motors
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("motors"),
          },
          {
            opcode: "ev3MotorRun",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRun"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
              SPEED: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          {
            opcode: "ev3MotorRunFor",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorRunFor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
              ROTATIONS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              SPEED: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
            },
          },
          {
            opcode: "ev3MotorStop",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorStop"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
              BRAKE: {
                type: Scratch.ArgumentType.STRING,
                menu: "brakeMode",
                defaultValue: "brake",
              },
            },
          },
          {
            opcode: "ev3TankDrive",
            blockType: Scratch.BlockType.COMMAND,
            text: t("tankDrive"),
            arguments: {
              LEFT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
              RIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
              ROTATIONS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "ev3MotorPosition",
            blockType: Scratch.BlockType.REPORTER,
            text: t("motorPosition"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
            },
          },
          {
            opcode: "ev3MotorSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: t("motorSpeed"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
            },
          },
          {
            opcode: "ev3MotorReset",
            blockType: Scratch.BlockType.COMMAND,
            text: t("motorReset"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "motorPorts",
              },
            },
          },

          // Servo Motor
          {
            opcode: "servoRunToPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: "servo [PORT] move to position [POS] speed [SPEED]%",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "motorPorts" },
              POS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },

          // High-Level Steering
          {
            opcode: "moveSteering",
            blockType: Scratch.BlockType.COMMAND,
            text: "steer [STEERING] speed [SPEED]% for [ROTATIONS] rotations",
            arguments: {
              STEERING: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              ROTATIONS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },

          "---",

          // Sensors
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("sensors"),
          },
          {
            opcode: "ev3TouchSensor",
            blockType: Scratch.BlockType.BOOLEAN,
            text: t("touchSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
            },
          },
          {
            opcode: "ev3ColorSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("colorSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "colorMode",
              },
            },
          },
          {
            opcode: "ev3ColorRGB",
            blockType: Scratch.BlockType.REPORTER,
            text: t("colorRGB"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              COMPONENT: {
                type: Scratch.ArgumentType.STRING,
                menu: "rgbComponent",
              },
            },
          },
          {
            opcode: "ev3UltrasonicSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("ultrasonicSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
            },
          },
          {
            opcode: "ev3GyroSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: t("gyroSensor"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "gyroMode",
              },
            },
          },

          "---",

          // Infrared
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("infrared"),
          },
          {
            opcode: "ev3InfraredProximity",
            blockType: Scratch.BlockType.REPORTER,
            text: t("irProximity"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
            },
          },
          {
            opcode: "ev3InfraredBeaconHeading",
            blockType: Scratch.BlockType.REPORTER,
            text: t("irBeaconHeading"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              CHANNEL: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "ev3InfraredBeaconDistance",
            blockType: Scratch.BlockType.REPORTER,
            text: t("irBeaconDistance"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              CHANNEL: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "ev3InfraredRemoteButton",
            blockType: Scratch.BlockType.BOOLEAN,
            text: t("irRemoteButton"),
            arguments: {
              PORT: {
                type: Scratch.ArgumentType.STRING,
                menu: "sensorPorts",
              },
              CHANNEL: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              BUTTON: {
                type: Scratch.ArgumentType.STRING,
                menu: "irButtons",
              },
            },
          },

          // NXT Sound Sensor
          {
            opcode: "ev3SoundSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: "sound sensor [PORT] [MODE]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "sensorPorts" },
              MODE: { type: Scratch.ArgumentType.STRING, menu: "soundMode" },
            },
          },

          // NXT Light Sensor
          {
            opcode: "ev3LightSensor",
            blockType: Scratch.BlockType.REPORTER,
            text: "light sensor [PORT] [MODE]",
            arguments: {
              PORT: { type: Scratch.ArgumentType.STRING, menu: "sensorPorts" },
              MODE: { type: Scratch.ArgumentType.STRING, menu: "lightMode" },
            },
          },

          "---",

          // Buttons
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("buttons"),
          },
          {
            opcode: "ev3ButtonPressed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: t("buttonPressed"),
            arguments: {
              BUTTON: {
                type: Scratch.ArgumentType.STRING,
                menu: "buttons",
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
            opcode: "ev3ScreenClear",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenClear"),
          },
          {
            opcode: "ev3ScreenText",
            blockType: Scratch.BlockType.COMMAND,
            text: t("screenText"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello",
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "ev3DrawCircle",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawCircle"),
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50,
              },
              R: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 20,
              },
            },
          },
          {
            opcode: "ev3DrawRectangle",
            blockType: Scratch.BlockType.COMMAND,
            text: t("drawRectangle"),
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 },
            },
          },
          {
            opcode: "ev3DrawLine",
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
            opcode: "ev3Speak",
            blockType: Scratch.BlockType.COMMAND,
            text: t("speak"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello",
              },
            },
          },
          {
            opcode: "ev3Beep",
            blockType: Scratch.BlockType.COMMAND,
            text: t("beep"),
            arguments: {
              FREQUENCY: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1000,
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "ev3SetLED",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setLED"),
            arguments: {
              COLOR: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledColors",
              },
            },
          },
          {
            opcode: "ev3SetVolume",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setVolume"),
            arguments: {
              VOLUME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 80,
              },
            },
          },
          {
            opcode: "ev3PlayTone",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playTone"),
            arguments: {
              NOTE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "C4",
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
          {
            opcode: "ev3SetLEDSide",
            blockType: Scratch.BlockType.COMMAND,
            text: t("setLEDSide"),
            arguments: {
              SIDE: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledSides",
              },
              COLOR: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledColors",
              },
            },
          },
          {
            opcode: "ev3LEDAllOff",
            blockType: Scratch.BlockType.COMMAND,
            text: t("ledAllOff"),
          },
          {
            opcode: "ev3LEDReset",
            blockType: Scratch.BlockType.COMMAND,
            text: t("ledReset"),
          },
          {
            opcode: "ev3LEDAnimate",
            blockType: Scratch.BlockType.COMMAND,
            text: t("ledAnimate"),
            arguments: {
              ANIMATION: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledAnimations",
              },
              COLOR1: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledColors",
                defaultValue: "RED",
              },
              COLOR2: {
                type: Scratch.ArgumentType.STRING,
                menu: "ledColors",
                defaultValue: "BLUE",
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
              },
              SLEEPTIME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
          {
            opcode: "ev3PlaySong",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playSong"),
            arguments: {
              SONG: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[["C4","q"],["D4","q"],["E4","q"]]', // Changed from () to []
              },
              TEMPO: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 120,
              },
            },
          },

          {
            opcode: "ev3LEDStopAnimation",
            blockType: Scratch.BlockType.COMMAND,
            text: t("ledStopAnimation"),
          },
          {
            opcode: "ev3GetVolume",
            blockType: Scratch.BlockType.REPORTER,
            text: t("getVolume"),
          },

          {
            opcode: "ev3PlayToneSequence",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playToneSequence"),
            arguments: {
              SEQUENCE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "[[440,500,100],[523,500,100]]", // Changed from () to []
              },
            },
          },
          {
            opcode: "ev3PlayFile",
            blockType: Scratch.BlockType.COMMAND,
            text: t("playFile"),
            arguments: {
              FILENAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello.wav",
              },
              VOLUME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },

          "---",

          // System
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("system"),
          },
          {
            opcode: "ev3BatteryLevel",
            blockType: Scratch.BlockType.REPORTER,
            text: t("batteryLevel"),
          },

          "---",

          // Sprite State
          {
            blockType: Scratch.BlockType.LABEL,
            text: t("spriteState"),
          },
          {
            opcode: "spriteGetX",
            blockType: Scratch.BlockType.REPORTER,
            text: t("spriteGetX"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetY",
            blockType: Scratch.BlockType.REPORTER,
            text: t("spriteGetY"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetSize",
            blockType: Scratch.BlockType.REPORTER,
            text: t("spriteGetSize"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteGetVisible",
            blockType: Scratch.BlockType.BOOLEAN,
            text: t("spriteGetVisible"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
            },
          },
          {
            opcode: "spriteSetPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: t("spriteSetPosition"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "spriteSetSize",
            blockType: Scratch.BlockType.COMMAND,
            text: t("spriteSetSize"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              SIZE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "spriteSetVisible",
            blockType: Scratch.BlockType.COMMAND,
            text: t("spriteSetVisible"),
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Sprite1",
              },
              VISIBLE: {
                type: Scratch.ArgumentType.BOOLEAN,
              },
            },
          },
        ],
        menus: {
          connectionModes: {
            items: ["http", "https"],
          },
          motorPorts: {
            acceptReporters: true,
            items: ["A", "B", "C", "D"],
          },
          sensorPorts: {
            acceptReporters: true,
            items: ["1", "2", "3", "4"],
          },
          brakeMode: {
            items: ["brake", "coast", "hold"],
          },
          colorMode: {
            items: [
              "color",
              "reflected_light_intensity",
              "ambient_light_intensity",
            ],
          },
          rgbComponent: {
            items: ["red", "green", "blue"],
          },
          gyroMode: {
            items: ["angle", "rate"],
          },
          ledColors: {
            items: ["BLACK", "GREEN", "RED", "ORANGE", "AMBER", "YELLOW"],
          },
          ledSides: {
            items: ["LEFT", "RIGHT", "BOTH"],
          },
          ledAnimations: {
            items: ["police", "flash", "rainbow", "cycle"],
          },
          irButtons: {
            items: [
              "top_left",
              "bottom_left",
              "top_right",
              "bottom_right",
              "beacon",
            ],
          },
          buttons: {
            items: ["up", "down", "left", "right", "enter", "backspace"],
          },
          soundMode: { items: ["db", "dba"] },
          lightMode: { items: ["reflect", "ambient"] },
        },
      };
    }

    // ============================================================================
    // LOGGING
    // ============================================================================

    log(message, data = null) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [EV3] ${message}`;
      if (data !== null) {
        console.log(logEntry, data);
      } else {
        console.log(logEntry);
      }
      this.debugLog.push({ timestamp, message, data });
    }

    // ============================================================================
    // CONNECTION & STREAMING MODE
    // ============================================================================

    setConnectionMode(args) {
      this.ev3Protocol = args.MODE;
      this.ev3IP = args.IP;
      this.ev3Port = args.PORT;

      console.log(
        `Connection: ${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}`,
      );
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
      this.log("Testing connection", { ip: this.ev3IP });
      try {
        // FIX: Use configured protocol and port
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;
        const response = await fetch(url, {
          timeout: 2000,
        });
        const data = await response.json();
        this.log("Connection test result", data);
        return data.status === "ev3_bridge_active" ? t("connected") : "Error";
      } catch (e) {
        this.log("Connection test failed", { error: e.message });
        return t("notConnected");
      }
    }

    async sendCommand(cmd, params = {}) {
      if (!this.streamingMode) {
        this.log("Command not sent - streaming disabled", { cmd, params });
        return;
      }

      // FIX: Actually USE the url variable we build!
      const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;
      this.log("Sending command", { cmd, params, url });

      try {
        const response = await fetch(url, {
          // ← USE url HERE!
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cmd, ...params }),
        });
        const result = await response.json();
        this.log("Command response", { cmd, result });
        return result;
      } catch (e) {
        this.log("Command failed", { cmd, error: e.message });
        return null;
      }
    }

    async getSensorData(endpoint) {
      if (!this.streamingMode) {
        this.log("Sensor read skipped - streaming disabled", { endpoint });
        return { value: 0 };
      }

      // FIX: Use configured protocol and port
      const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}${endpoint}`;
      this.log("Reading sensor", { endpoint, url });

      try {
        const response = await fetch(url); // ← USE url HERE!
        const data = await response.json();
        this.log("Sensor data", { endpoint, data });
        return data;
      } catch (e) {
        this.log("Sensor read failed", { endpoint, error: e.message });
        return { value: 0 };
      }
    }

    // ============================================================================
    // SCRIPT MANAGEMENT METHODS
    // ============================================================================

    /**
     * Upload and immediately run the transpiled project
     */
    async uploadAndRunScript(args) {
      const scriptName = args.NAME || "scratch_program.py";

      // First transpile the project
      this.transpileProject();

      if (!this.pythonCode) {
        alert("No code generated! Transpile the project first.");
        return;
      }

      try {
        // Upload script
        await this.uploadScriptCode(scriptName, this.pythonCode);

        // Run script
        await this.runScriptByName({ NAME: scriptName });

        this.log("Upload and run complete", { name: scriptName });
      } catch (error) {
        this.log("Upload and run failed", error.message);
        alert("Failed to upload and run: " + error.message);
      }
    }

    /**
     * Upload the transpiled project without running
     */
    async uploadScript(args) {
      const scriptName = args.NAME || "scratch_program.py";

      // Transpile the project
      this.transpileProject();

      if (!this.pythonCode) {
        alert("No code generated! Transpile the project first.");
        return;
      }

      try {
        await this.uploadScriptCode(scriptName, this.pythonCode);
        this.log("Script uploaded", { name: scriptName });
        alert(`Uploaded: ${scriptName}`);
      } catch (error) {
        this.log("Upload failed", error.message);
        alert("Upload failed: " + error.message);
      }
    }

    /**
     * Internal method to upload script code
     */
    async uploadScriptCode(scriptName, code) {
      const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: "upload_script",
          name: scriptName,
          code: code,
        }),
      });

      const result = await response.json();

      if (result.status !== "ok") {
        throw new Error(result.msg || "Upload failed");
      }

      return result;
    }

    /**
     * Run a script by name
     */
    async runScriptByName(args) {
      const scriptName = args.NAME || "scratch_program.py";

      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cmd: "run_script",
            name: scriptName,
          }),
        });

        const result = await response.json();

        if (result.status === "ok") {
          this.currentScriptId = result.script_id;
          this.log("Script started", {
            name: scriptName,
            id: result.script_id,
          });
          return result.script_id;
        } else {
          throw new Error(result.msg || "Run failed");
        }
      } catch (error) {
        this.log("Run script failed", error.message);
        alert("Failed to run script: " + error.message);
        return null;
      }
    }

    /**
     * Stop the current script (last started)
     */
    async stopCurrentScript() {
      if (this.currentScriptId === null) {
        this.log("No current script to stop");
        return;
      }

      await this.stopScriptById({ ID: this.currentScriptId });
    }

    /**
     * Stop a specific script by ID
     */
    async stopScriptById(args) {
      const scriptId = parseInt(args.ID);

      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cmd: "stop_script",
            script_id: scriptId,
          }),
        });

        const result = await response.json();

        if (result.status === "ok") {
          this.log("Script stopped", { id: scriptId });

          if (this.currentScriptId === scriptId) {
            this.currentScriptId = null;
          }
        } else {
          this.log("Stop script failed", result.msg);
        }
      } catch (error) {
        this.log("Stop script error", error.message);
      }
    }

    /**
     * Stop all running scripts on EV3
     */
    async stopAllScripts() {
      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cmd: "stop_all_scripts",
          }),
        });

        const result = await response.json();

        if (result.status === "ok") {
          this.currentScriptId = null;
          this.log("All scripts stopped");
        }
      } catch (error) {
        this.log("Stop all scripts error", error.message);
      }
    }

    /**
     * Delete a script from EV3
     */
    async deleteScript(args) {
      const scriptName = args.NAME || "scratch_program.py";

      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cmd: "delete_script",
            name: scriptName,
          }),
        });

        const result = await response.json();

        if (result.status === "ok") {
          this.log("Script deleted", { name: scriptName });
          alert(`Deleted: ${scriptName}`);
        } else {
          alert("Delete failed: " + result.msg);
        }
      } catch (error) {
        this.log("Delete script error", error.message);
        alert("Delete failed: " + error.message);
      }
    }

    /**
     * Refresh the list of available scripts
     */
    async refreshScriptList() {
      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === "ok") {
          this.availableScripts = result.scripts;
          this.log("Script list refreshed", {
            count: result.scripts.length,
          });
        }
      } catch (error) {
        this.log("Refresh script list error", error.message);
      }
    }

    /**
     * Get list of available scripts as JSON string
     */
    async getScriptList() {
      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === "ok") {
          this.availableScripts = result.scripts;
          return JSON.stringify(result.scripts);
        }

        return "[]";
      } catch (error) {
        this.log("Get script list error", error.message);
        return "[]";
      }
    }

    /**
     * Get list of running scripts as JSON string
     */
    async getRunningScripts() {
      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === "ok") {
          return JSON.stringify(result.running);
        }

        return "[]";
      } catch (error) {
        this.log("Get running scripts error", error.message);
        return "[]";
      }
    }

    /**
     * Get count of available scripts
     */
    async getScriptCount() {
      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === "ok") {
          return result.scripts.length;
        }

        return 0;
      } catch (error) {
        this.log("Get script count error", error.message);
        return 0;
      }
    }

    /**
     * Check if a specific script is currently running
     */
    async isScriptRunning(args) {
      const scriptName = args.NAME || "scratch_program.py";

      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === "ok") {
          return result.running.some((script) => script.name === scriptName);
        }

        return false;
      } catch (error) {
        this.log("Check script running error", error.message);
        return false;
      }
    }

    /**
     * Get the ID of the current/last started script
     */
    getCurrentScriptId() {
      return this.currentScriptId !== null ? this.currentScriptId : -1;
    }

    // ============================================================================
    // HELPER: SHOW SCRIPT MANAGER UI
    // ============================================================================

    /**
     * Show a modal with script management interface
     */
    showScriptManager() {
      // Create modal
      const modal = document.createElement("div");
      modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border: 2px solid #4C97FF;
      border-radius: 8px;
      max-width: 500px;
      max-height: 600px;
      overflow: auto;
      z-index: 10000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
    `;

      const title = document.createElement("h3");
      title.textContent = "EV3 Script Manager";
      title.style.marginTop = "0";

      const content = document.createElement("div");
      content.id = "script-manager-content";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = `
      margin-top: 10px;
      padding: 8px 16px;
      background: #4C97FF;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(title);
      modal.appendChild(content);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);

      // Load and display scripts
      this.refreshScriptManagerUI(content);
    }

    /**
     * Refresh the script manager UI
     */
    async refreshScriptManagerUI(container) {
      container.innerHTML = "<p>Loading...</p>";

      try {
        const url = `${this.ev3Protocol}://${this.ev3IP}:${this.ev3Port}/scripts`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.status !== "ok") {
          container.innerHTML = "<p>Error loading scripts</p>";
          return;
        }

        // Clear container
        container.innerHTML = "";

        // Available scripts
        const availableSection = document.createElement("div");
        availableSection.innerHTML = `<h4>Available Scripts (${result.scripts.length})</h4>`;

        const scriptList = document.createElement("div");
        scriptList.style.cssText = `
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 15px;
      `;

        if (result.scripts.length === 0) {
          scriptList.innerHTML = "<em>No scripts uploaded yet</em>";
        } else {
          result.scripts.forEach((script) => {
            const scriptItem = document.createElement("div");
            scriptItem.style.cssText = `
            padding: 5px;
            margin: 5px 0;
            background: #f0f0f0;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `;

            const scriptName = document.createElement("span");
            scriptName.textContent = script;

            const actions = document.createElement("div");

            const runBtn = document.createElement("button");
            runBtn.textContent = "Run";
            runBtn.style.cssText = `
            padding: 3px 8px;
            margin-left: 5px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          `;
            runBtn.onclick = async () => {
              await this.runScriptByName({ NAME: script });
              this.refreshScriptManagerUI(container);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.cssText = `
            padding: 3px 8px;
            margin-left: 5px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          `;
            deleteBtn.onclick = async () => {
              if (confirm(`Delete ${script}?`)) {
                await this.deleteScript({ NAME: script });
                this.refreshScriptManagerUI(container);
              }
            };

            actions.appendChild(runBtn);
            actions.appendChild(deleteBtn);

            scriptItem.appendChild(scriptName);
            scriptItem.appendChild(actions);
            scriptList.appendChild(scriptItem);
          });
        }

        availableSection.appendChild(scriptList);
        container.appendChild(availableSection);

        // Running scripts
        const runningSection = document.createElement("div");
        runningSection.innerHTML = `<h4>Running Scripts (${result.running.length})</h4>`;

        const runningList = document.createElement("div");
        runningList.style.cssText = `
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 15px;
      `;

        if (result.running.length === 0) {
          runningList.innerHTML = "<em>No scripts currently running</em>";
        } else {
          result.running.forEach((script) => {
            const scriptItem = document.createElement("div");
            scriptItem.style.cssText = `
            padding: 5px;
            margin: 5px 0;
            background: #e3f2fd;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `;

            const info = document.createElement("span");
            const runtime = Math.floor(script.runtime);
            info.textContent = `${script.name} (${runtime}s)`;

            const stopBtn = document.createElement("button");
            stopBtn.textContent = "Stop";
            stopBtn.style.cssText = `
            padding: 3px 8px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          `;
            stopBtn.onclick = async () => {
              await this.stopScriptById({ ID: script.id });
              this.refreshScriptManagerUI(container);
            };

            scriptItem.appendChild(info);
            scriptItem.appendChild(stopBtn);
            runningList.appendChild(scriptItem);
          });
        }

        runningSection.appendChild(runningList);
        container.appendChild(runningSection);

        // Action buttons
        const actions = document.createElement("div");
        actions.style.marginTop = "15px";

        const uploadBtn = document.createElement("button");
        uploadBtn.textContent = "Upload Current Project";
        uploadBtn.style.cssText = `
        padding: 8px 16px;
        margin-right: 10px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
        uploadBtn.onclick = async () => {
          await this.uploadScript({ NAME: "scratch_program.py" });
          this.refreshScriptManagerUI(container);
        };

        const stopAllBtn = document.createElement("button");
        stopAllBtn.textContent = "Stop All";
        stopAllBtn.style.cssText = `
        padding: 8px 16px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
        stopAllBtn.onclick = async () => {
          await this.stopAllScripts();
          this.refreshScriptManagerUI(container);
        };

        actions.appendChild(uploadBtn);
        actions.appendChild(stopAllBtn);
        container.appendChild(actions);
      } catch (error) {
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      }
    }

    /**
     * Add block to show script manager
     */
    showScriptManagerBlock() {
      this.showScriptManager();
    }

    // ============================================================================
    // STREAMING MODE - RUNTIME IMPLEMENTATIONS
    // ============================================================================

    // Motors
    ev3MotorRun(args) {
      this.sendCommand("motor_run", { port: args.PORT, speed: args.SPEED });
    }

    ev3MotorRunFor(args) {
      this.sendCommand("motor_run_for", {
        port: args.PORT,
        speed: args.SPEED,
        rotations: args.ROTATIONS,
      });
    }

    ev3MotorStop(args) {
      this.sendCommand("motor_stop", { port: args.PORT, brake: args.BRAKE });
    }

    ev3TankDrive(args) {
      this.sendCommand("tank_drive", {
        left: args.LEFT,
        right: args.RIGHT,
        rotations: args.ROTATIONS,
      });
    }

    async ev3MotorPosition(args) {
      const data = await this.getSensorData(`/motor/position/${args.PORT}`);
      return data.value || 0;
    }

    async ev3MotorSpeed(args) {
      const data = await this.getSensorData(`/motor/speed/${args.PORT}`);
      return data.value || 0;
    }

    ev3MotorReset(args) {
      this.sendCommand("motor_reset", { port: args.PORT });
    }

    // Sensors
    async ev3TouchSensor(args) {
      const data = await this.getSensorData(`/sensor/touch/${args.PORT}`);
      return data.value || false;
    }

    async ev3ColorSensor(args) {
      const data = await this.getSensorData(
        `/sensor/color/${args.PORT}/${args.MODE}`,
      );
      return data.value || 0;
    }

    async ev3ColorRGB(args) {
      const data = await this.getSensorData(
        `/sensor/color_rgb/${args.PORT}/${args.COMPONENT}`,
      );
      return data.value || 0;
    }

    async ev3UltrasonicSensor(args) {
      const data = await this.getSensorData(`/sensor/ultrasonic/${args.PORT}`);
      return data.value || 0;
    }

    async ev3GyroSensor(args) {
      const data = await this.getSensorData(
        `/sensor/gyro/${args.PORT}/${args.MODE}`,
      );
      return data.value || 0;
    }

    // Infrared
    async ev3InfraredProximity(args) {
      const data = await this.getSensorData(
        `/sensor/infrared/${args.PORT}/proximity`,
      );
      return data.value || 0;
    }

    async ev3InfraredBeaconHeading(args) {
      const data = await this.getSensorData(
        `/sensor/infrared/${args.PORT}/heading/${args.CHANNEL}`,
      );
      return data.value || 0;
    }

    async ev3InfraredBeaconDistance(args) {
      const data = await this.getSensorData(
        `/sensor/infrared/${args.PORT}/distance/${args.CHANNEL}`,
      );
      return data.value || 0;
    }

    async ev3InfraredRemoteButton(args) {
      const data = await this.getSensorData(
        `/sensor/infrared/${args.PORT}/button/${args.CHANNEL}/${args.BUTTON}`,
      );
      return data.value || false;
    }

    // Buttons
    async ev3ButtonPressed(args) {
      const data = await this.getSensorData(`/button/${args.BUTTON}`);
      return data.value || false;
    }

    // Display & Sound
    ev3ScreenClear() {
      this.sendCommand("screen_clear");
    }

    ev3ScreenText(args) {
      this.sendCommand("screen_text", {
        text: args.TEXT,
        x: args.X,
        y: args.Y,
      });
    }

    ev3DrawCircle(args) {
      this.sendCommand("draw_circle", { x: args.X, y: args.Y, r: args.R });
    }

    ev3DrawRectangle(args) {
      this.sendCommand("draw_rectangle", {
        x1: args.X1,
        y1: args.Y1,
        x2: args.X2,
        y2: args.Y2,
      });
    }

    ev3DrawLine(args) {
      this.sendCommand("draw_line", {
        x1: args.X1,
        y1: args.Y1,
        x2: args.X2,
        y2: args.Y2,
      });
    }

    ev3Speak(args) {
      const text = args.TEXT;
      // Detect if text contains German characters
      const hasUmlauts = /[äöüÄÖÜß]/.test(text);
      const lang = hasUmlauts || currentLang === "de" ? "de" : "en";

      this.sendCommand("speak", { text: text, lang: lang });
    }

    ev3Beep(args) {
      this.sendCommand("beep", { freq: args.FREQUENCY, dur: args.DURATION });
    }

    ev3SetLED(args) {
      this.sendCommand("set_led", { color: args.COLOR });
    }

    ev3SetVolume(args) {
      this.sendCommand("set_volume", { volume: args.VOLUME });
    }

    ev3PlayTone(args) {
      this.sendCommand("play_tone", {
        note: args.NOTE,
        duration: args.DURATION,
      });
    }

    ev3SetLEDSide(args) {
      const color = args.COLOR === "OFF" ? "BLACK" : args.COLOR;
      this.sendCommand("set_led", { color: color, side: args.SIDE });
    }

    ev3LEDAllOff() {
      this.sendCommand("led_off");
    }

    ev3LEDReset() {
      this.sendCommand("led_reset");
    }

    ev3LEDAnimate(args) {
      const animation = args.ANIMATION;
      const color1 = args.COLOR1 === "OFF" ? "BLACK" : args.COLOR1;
      const color2 = args.COLOR2 === "OFF" ? "BLACK" : args.COLOR2;

      if (animation === "police") {
        this.sendCommand("led_animate_police", {
          color1: color1,
          color2: color2,
          sleeptime: args.SLEEPTIME,
          duration: args.DURATION,
        });
      } else if (animation === "flash") {
        this.sendCommand("led_animate_flash", {
          color: color1,
          sleeptime: args.SLEEPTIME,
          duration: args.DURATION,
        });
      } else if (animation === "rainbow") {
        this.sendCommand("led_animate_rainbow", {
          duration: args.DURATION,
          sleeptime: args.SLEEPTIME,
        });
      } else if (animation === "cycle") {
        this.sendCommand("led_animate_cycle", {
          colors: [color1, color2],
          sleeptime: args.SLEEPTIME,
          duration: args.DURATION,
        });
      }
    }

    ev3PlaySong(args) {
      this.sendCommand("play_song", {
        notes: JSON.parse(args.SONG),
        tempo: args.TEMPO,
      });
    }

    ev3PlayToneSequence(args) {
      this.sendCommand("play_tone_sequence", {
        sequence: JSON.parse(args.SEQUENCE),
      });
    }

    ev3PlayFile(args) {
      this.sendCommand("play_file", {
        filename: args.FILENAME,
        volume: args.VOLUME,
      });
    }

    ev3LEDStopAnimation() {
      this.sendCommand("led_stop_animation");
    }

    async ev3GetVolume() {
      const result = await this.sendCommand("get_volume");
      return result ? result.volume : 50;
    }

    // System
    async ev3BatteryLevel() {
      const data = await this.getSensorData("/battery");
      return data.value || 0;
    }

    // Sprite State (Virtual - uses util.target)
    spriteGetX(args, util) {
      return util.target.x;
    }

    spriteGetY(args, util) {
      return util.target.y;
    }

    spriteGetSize(args, util) {
      return util.target.size;
    }

    spriteGetVisible(args, util) {
      return util.target.visible;
    }

    spriteSetPosition(args) {
      // Virtual - transpiler only
    }

    spriteSetSize(args) {
      // Virtual - transpiler only
    }

    spriteSetVisible(args) {
      // Virtual - transpiler only
    }

    // ============================================================================
    // TRANSPILER
    // ============================================================================

    indent() {
      return "    ".repeat(this.indentLevel);
    }

    addLine(code) {
      this.pythonCode += this.indent() + code + "\n";
    }

    isNumeric(value) {
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        return !isNaN(value) && !isNaN(parseFloat(value));
      }
      return false;
    }

    sanitizeSoundName(soundName) {
      return soundName
        .replace(/"/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
    }

    sanitizeName(name) {
      if (!name) return "unnamed";
      return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }

    transpileProject() {
      this.log("=== Starting Transpilation ===");
      this.pythonCode = "";
      this.indentLevel = 0;
      this.debugLog = [];
      this.scriptCounter = 1;
      this.broadcastHandlers = [];
      this.mainScripts = [];
      this.soundFiles = [];
      this.usedMotors = new Set();
      this.usedSensors = new Set();
      this.spriteStates = {};

      try {
        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets;

        this.log("Found targets", { count: targets.length });

        // Collect sprite states
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          if (!target.isStage) {
            this.spriteStates[target.sprite.name] = {
              x: target.x || 0,
              y: target.y || 0,
              size: target.size || 100,
              visible: target.visible !== false,
            };
          }
        }

        this.log("Sprite states collected", this.spriteStates);

        // Generate Python code
        this.generateHeader();
        this.generateStopHandlers();
        this.generateComponentInit();
        this.generateSpriteStateManager();

        // Collect broadcast handlers
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const blocks = target.blocks;
          const blockArray = blocks._blocks;
          const blockKeys = Object.keys(blockArray);

          for (let j = 0; j < blockKeys.length; j++) {
            const block = blockArray[blockKeys[j]];
            if (block.opcode === "event_whenbroadcastreceived") {
              const broadcastName = this.getFieldValue(
                block,
                "BROADCAST_OPTION",
              );
              if (
                broadcastName &&
                !this.broadcastHandlers.includes(broadcastName)
              ) {
                this.broadcastHandlers.push(broadcastName);
              }
            }
          }
        }

        this.log("Broadcast handlers found", this.broadcastHandlers);

        // Initialize broadcast lists
        for (let i = 0; i < this.broadcastHandlers.length; i++) {
          this.addLine('broadcasts["' + this.broadcastHandlers[i] + '"] = []');
        }
        if (this.broadcastHandlers.length > 0) {
          this.addLine("");
        }

        // Process each target
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const targetType = target.isStage ? "stage" : "sprite";
          this.log(`Processing ${targetType}`, { name: target.sprite.name });
          this.processTarget(target);
        }

        // Add helpers
        this.generateBroadcastHelper();
        this.generateBroadcastWaitHelper();
        this.generateMainExecution();

        this.log("=== Transpilation Complete ===", {
          codeLength: this.pythonCode.length,
          soundFiles: this.soundFiles,
          scripts: this.mainScripts.length,
          broadcasts: this.broadcastHandlers.length,
        });

        console.log("=== GENERATED PYTHON CODE ===\n" + this.pythonCode);
      } catch (error) {
        this.log("ERROR during transpilation", {
          error: error.message,
          stack: error.stack,
        });
        console.error(error);
      }
    }

    generateHeader() {
      this.addLine("#!/usr/bin/env python3");
      this.addLine("# Generated from Scratch by TurboWarp EV3 Extension v2.0");
      this.addLine("# Supports both upload and streaming modes");
      this.addLine("# Language: " + currentLang);
      this.addLine("");
      this.addLine("from ev3dev2.motor import LargeMotor, MediumMotor, Motor");
      this.addLine(
        "from ev3dev2.motor import OUTPUT_A, OUTPUT_B, OUTPUT_C, OUTPUT_D, SpeedPercent",
      );
      this.addLine(
        "from ev3dev2.sensor import INPUT_1, INPUT_2, INPUT_3, INPUT_4",
      );
      this.addLine(
        "from ev3dev2.sensor.lego import TouchSensor, ColorSensor, UltrasonicSensor, GyroSensor, InfraredSensor",
      );
      this.addLine("from ev3dev2.display import Display");
      this.addLine("from ev3dev2.led import Leds");
      this.addLine("from ev3dev2.sound import Sound");
      this.addLine("from ev3dev2.button import Button");
      this.addLine("from ev3dev2.power import PowerSupply");
      this.addLine("from time import sleep");
      this.addLine("import sys");
      this.addLine("import math");
      this.addLine("import random");
      this.addLine("import signal");
      this.addLine("import threading");
      this.addLine("import socket");
      this.addLine("import os");
      this.addLine("");
      this.addLine("# Global stop flag");
      this.addLine("stop_all = False");
      this.addLine("script_lock = threading.Lock()");
      this.addLine("");
    }

    generateStopHandlers() {
      this.addLine("def signal_handler(sig, frame):");
      this.indentLevel++;
      this.addLine("global stop_all");
      this.addLine('print("\\nStopping all scripts...")');
      this.addLine("stop_all = True");
      this.addLine("sys.exit(0)");
      this.indentLevel--;
      this.addLine("");
      this.addLine("signal.signal(signal.SIGINT, signal_handler)");
      this.addLine("signal.signal(signal.SIGTERM, signal_handler)");
      this.addLine("");

      this.addLine("def monitor_esc_button():");
      this.indentLevel++;
      this.addLine("global stop_all");
      this.addLine("btn = Button()");
      this.addLine("while not stop_all:");
      this.indentLevel++;
      this.addLine("if btn.backspace:");
      this.indentLevel++;
      this.addLine('print("ESC pressed - stopping")');
      this.addLine("stop_all = True");
      this.addLine("sys.exit(0)");
      this.indentLevel--;
      this.addLine("sleep(0.1)");
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("");
      this.addLine(
        "esc_thread = threading.Thread(target=monitor_esc_button, daemon=True)",
      );
      this.addLine("esc_thread.start()");
      this.addLine("");

      this.addLine("def remote_stop_listener():");
      this.indentLevel++;
      this.addLine("global stop_all");
      this.addLine("try:");
      this.indentLevel++;
      this.addLine("sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)");
      this.addLine('sock.bind(("0.0.0.0", 5555))');
      this.addLine("sock.settimeout(1.0)");
      this.addLine('print("Listening for remote stop on port 5555...")');
      this.addLine("while not stop_all:");
      this.indentLevel++;
      this.addLine("try:");
      this.indentLevel++;
      this.addLine("data, addr = sock.recvfrom(1024)");
      this.addLine('if data.decode().strip() == "STOPSCRIPT":');
      this.indentLevel++;
      this.addLine('print(f"Stop from {addr}")');
      this.addLine("stop_all = True");
      this.addLine("sys.exit(0)");
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("except socket.timeout:");
      this.indentLevel++;
      this.addLine("continue");
      this.indentLevel--;
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("except Exception as e:");
      this.indentLevel++;
      this.addLine('print(f"Remote listener error: {e}")');
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("");
      this.addLine(
        "remote_thread = threading.Thread(target=remote_stop_listener, daemon=True)",
      );
      this.addLine("remote_thread.start()");
      this.addLine("");
    }

    generateComponentInit() {
      this.addLine("# Initialize EV3 components");
      this.addLine("display = Display()");
      this.addLine("sound = Sound()");
      this.addLine("leds = Leds()");
      this.addLine("buttons = Button()");
      this.addLine("power = PowerSupply()");
      this.addLine("");
      this.addLine("# Motor dictionary (initialized on first use)");
      this.addLine("motors = {}");
      this.addLine("");
      this.addLine("def get_motor(port):");
      this.indentLevel++;
      this.addLine('"""Get or create motor on specified port"""');
      this.addLine("if port not in motors:");
      this.indentLevel++;
      this.addLine(
        'port_map = {"A": OUTPUT_A, "B": OUTPUT_B, "C": OUTPUT_C, "D": OUTPUT_D}',
      );
      this.addLine("try:");
      this.indentLevel++;
      this.addLine("motors[port] = LargeMotor(port_map[port])");
      this.addLine('print(f"Initialized motor on port {port}")');
      this.indentLevel--;
      this.addLine("except Exception as e:");
      this.indentLevel++;
      this.addLine(
        'print(f"Warning: Could not initialize motor on port {port}: {e}")',
      );
      this.addLine("motors[port] = None");
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("return motors[port]");
      this.indentLevel--;
      this.addLine("");
      this.addLine("# Sensor dictionary (initialized on first use)");
      this.addLine("sensors = {}");
      this.addLine("");
      this.addLine("def get_sensor(port, sensor_type):");
      this.indentLevel++;
      this.addLine('"""Get or create sensor on specified port"""');
      this.addLine('key = f"{port}_{sensor_type}"');
      this.addLine("if key not in sensors:");
      this.indentLevel++;
      this.addLine(
        'port_map = {"1": INPUT_1, "2": INPUT_2, "3": INPUT_3, "4": INPUT_4}',
      );
      this.addLine("sensor_classes = {");
      this.indentLevel++;
      this.addLine('"touch": TouchSensor,');
      this.addLine('"color": ColorSensor,');
      this.addLine('"ultrasonic": UltrasonicSensor,');
      this.addLine('"gyro": GyroSensor,');
      this.addLine('"infrared": InfraredSensor');
      this.indentLevel--;
      this.addLine("}");
      this.addLine("try:");
      this.indentLevel++;
      this.addLine(
        "sensors[key] = sensor_classes[sensor_type](port_map[port])",
      );
      this.addLine('print(f"Initialized {sensor_type} sensor on port {port}")');
      this.indentLevel--;
      this.addLine("except Exception as e:");
      this.indentLevel++;
      this.addLine(
        'print(f"Warning: Could not initialize {sensor_type} sensor on port {port}: {e}")',
      );
      this.addLine("sensors[key] = None");
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("return sensors[key]");
      this.indentLevel--;
      this.addLine("");
      this.addLine("def play_sound_file(filename):");
      this.indentLevel++;
      this.addLine('"""Play sound file if exists, otherwise beep"""');
      this.addLine('sound_path = os.path.join("/home/robot/sounds", filename)');
      this.addLine("if os.path.exists(sound_path):");
      this.indentLevel++;
      this.addLine("sound.play_file(sound_path)");
      this.indentLevel--;
      this.addLine("else:");
      this.indentLevel++;
      this.addLine('print(f"Sound file not found: {filename}")');
      this.addLine("sound.beep()");
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("");
      this.addLine("# Variables");
      this.addLine("variables = {}");
      this.addLine("broadcasts = {}");
      this.addLine("");
    }

    generateSpriteStateManager() {
      this.addLine("# Sprite state manager (virtual sprites)");
      this.addLine("sprite_states = {");
      this.indentLevel++;
      const spriteNames = Object.keys(this.spriteStates);
      for (let i = 0; i < spriteNames.length; i++) {
        const name = spriteNames[i];
        const state = this.spriteStates[name];
        const comma = i < spriteNames.length - 1 ? "," : "";
        const visiblePy = state.visible ? "True" : "False";
        this.addLine(
          `"${name}": {"x": ${state.x}, "y": ${state.y}, "size": ${state.size}, "visible": ${visiblePy}}${comma}`,
        );
      }
      this.indentLevel--;
      this.addLine("}");
      this.addLine("");
      this.addLine("def get_sprite_state(sprite_name):");
      this.indentLevel++;
      this.addLine('"""Get sprite state, create if not exists"""');
      this.addLine("if sprite_name not in sprite_states:");
      this.indentLevel++;
      this.addLine(
        'sprite_states[sprite_name] = {"x": 0, "y": 0, "size": 100, "visible": True}',
      );
      this.indentLevel--;
      this.addLine("return sprite_states[sprite_name]");
      this.indentLevel--;
      this.addLine("");
    }

    generateBroadcastHelper() {
      this.addLine("running_broadcasts = {}");
      this.addLine("");
      this.addLine("def trigger_broadcast(message):");
      this.indentLevel++;
      this.addLine(
        '"""Trigger all handlers for broadcast (fire-and-forget)"""',
      );
      this.addLine("if message in broadcasts:");
      this.indentLevel++;
      this.addLine("for handler in broadcasts[message]:");
      this.indentLevel++;
      this.addLine("handler_name = handler.__name__");
      this.addLine(
        "if handler_name in running_broadcasts and running_broadcasts[handler_name].is_alive():",
      );
      this.indentLevel++;
      this.addLine("continue");
      this.indentLevel--;
      this.addLine("t = threading.Thread(target=handler, name=handler_name)");
      this.addLine("running_broadcasts[handler_name] = t");
      this.addLine("t.start()");
      this.indentLevel--;
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("");
    }

    generateBroadcastWaitHelper() {
      this.addLine("def trigger_broadcast_wait(message):");
      this.indentLevel++;
      this.addLine('"""Trigger broadcast and wait for completion"""');
      this.addLine("if message in broadcasts:");
      this.indentLevel++;
      this.addLine("threads = []");
      this.addLine("for handler in broadcasts[message]:");
      this.indentLevel++;
      this.addLine("t = threading.Thread(target=handler)");
      this.addLine("t.start()");
      this.addLine("threads.append(t)");
      this.indentLevel--;
      this.addLine("for t in threads:");
      this.indentLevel++;
      this.addLine("t.join()");
      this.indentLevel--;
      this.indentLevel--;
      this.indentLevel--;
      this.addLine("");
    }

    generateMainExecution() {
      if (this.mainScripts.length > 0) {
        this.addLine("# Main execution (threaded for concurrency)");
        this.addLine("if __name__ == '__main__':");
        this.indentLevel++;
        this.addLine("try:");
        this.indentLevel++;
        this.addLine("threads = []");

        for (let i = 0; i < this.mainScripts.length; i++) {
          this.addLine(
            "t" + i + " = threading.Thread(target=" + this.mainScripts[i] + ")",
          );
          this.addLine("threads.append(t" + i + ")");
          this.addLine("t" + i + ".start()");
        }

        this.addLine("for t in threads:");
        this.indentLevel++;
        this.addLine("t.join()");
        this.indentLevel--;

        this.indentLevel--;
        this.addLine("except KeyboardInterrupt:");
        this.indentLevel++;
        this.addLine('print("\\nProgram stopped")');
        this.indentLevel--;
        this.addLine("finally:");
        this.indentLevel++;
        this.addLine('print("Cleaning up...")');
        this.addLine("for motor in motors.values():");
        this.indentLevel++;
        this.addLine("if motor:");
        this.indentLevel++;
        this.addLine("motor.stop()");
        this.indentLevel--;
        this.indentLevel--;
        this.indentLevel--;
        this.indentLevel--;
      }
    }

    processTarget(target) {
      const blocks = target.blocks;
      const blockArray = blocks._blocks;
      const blockKeys = Object.keys(blockArray);

      this.log("Processing target blocks", { count: blockKeys.length });

      const hatBlocks = [];
      for (let i = 0; i < blockKeys.length; i++) {
        const block = blockArray[blockKeys[i]];
        if (block.opcode && block.opcode.startsWith("event_when")) {
          hatBlocks.push(block);
        }
      }

      this.log("Found hat blocks", { count: hatBlocks.length });

      for (let i = 0; i < hatBlocks.length; i++) {
        this.processHatBlock(hatBlocks[i], blocks);
      }
    }

    processHatBlock(hatBlock, blocks) {
      this.addLine("# Event: " + hatBlock.opcode);

      const opcode = hatBlock.opcode;
      let funcName = "";

      if (opcode === "event_whenflagclicked") {
        funcName = "on_green_flag_" + this.scriptCounter;
      } else if (opcode === "event_whenbroadcastreceived") {
        const broadcastName = this.getFieldValue(hatBlock, "BROADCAST_OPTION");
        funcName =
          "on_broadcast_" +
          this.sanitizeName(broadcastName) +
          "_" +
          this.scriptCounter;
      } else if (opcode === "event_whenkeypressed") {
        const key = this.getFieldValue(hatBlock, "KEY_OPTION");
        funcName =
          "on_key_" + this.sanitizeName(key) + "_" + this.scriptCounter;
      } else {
        funcName = "on_event_" + this.scriptCounter;
      }

      this.scriptCounter++;

      this.addLine("def " + funcName + "():");
      this.indentLevel++;

      let currentBlockId = hatBlock.next;
      let blockCount = 0;

      while (currentBlockId) {
        const block = blocks._blocks[currentBlockId];
        if (!block) break;

        blockCount++;
        this.processBlock(block, blocks);
        currentBlockId = block.next;
      }

      if (blockCount === 0) {
        this.addLine("pass");
      }

      this.indentLevel--;
      this.addLine("");

      if (opcode === "event_whenflagclicked") {
        this.mainScripts.push(funcName);
      } else if (opcode === "event_whenbroadcastreceived") {
        const broadcastName = this.getFieldValue(hatBlock, "BROADCAST_OPTION");
        this.addLine(
          'broadcasts["' + broadcastName + '"].append(' + funcName + ")",
        );
        this.addLine("");
      }
    }

    processBlock(block, blocks) {
      const opcode = block.opcode;
      this.log("Processing block", { opcode });

      // EV3-specific motor blocks
      if (opcode === "scratchtoev3_ev3MotorRun") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const speed = this.getInputValue(block, "SPEED", blocks);
        this.addLine(`motor = get_motor("${port}")`);
        this.addLine("if motor:");
        this.indentLevel++;
        this.addLine("motor.on(SpeedPercent(" + speed + "))");
        this.indentLevel--;
      } else if (opcode === "scratchtoev3_ev3MotorRunFor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const rotations = this.getInputValue(block, "ROTATIONS", blocks);
        const speed = this.getInputValue(block, "SPEED", blocks);
        this.addLine(`motor = get_motor("${port}")`);
        this.addLine("if motor:");
        this.indentLevel++;
        this.addLine(
          "motor.on_for_rotations(SpeedPercent(" +
            speed +
            "), " +
            rotations +
            ")",
        );
        this.indentLevel--;
      } else if (opcode === "scratchtoev3_ev3MotorStop") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const brake = this.getInputValue(block, "BRAKE", blocks).replace(
          /"/g,
          "",
        );
        this.addLine(`motor = get_motor("${port}")`);
        this.addLine("if motor:");
        this.indentLevel++;
        this.addLine('motor.stop(stop_action="' + brake + '")');
        this.indentLevel--;
      } else if (opcode === "scratchtoev3_ev3TankDrive") {
        const left = this.getInputValue(block, "LEFT", blocks);
        const right = this.getInputValue(block, "RIGHT", blocks);
        const rotations = this.getInputValue(block, "ROTATIONS", blocks);
        this.addLine('motor_left = get_motor("B")');
        this.addLine('motor_right = get_motor("C")');
        this.addLine("if motor_left and motor_right:");
        this.indentLevel++;
        this.addLine(
          "motor_left.on_for_rotations(SpeedPercent(" +
            left +
            "), " +
            rotations +
            ", block=False)",
        );
        this.addLine(
          "motor_right.on_for_rotations(SpeedPercent(" +
            right +
            "), " +
            rotations +
            ", block=True)",
        );
        this.indentLevel--;
      }

      // EV3 Display blocks
      else if (opcode === "scratchtoev3_ev3ScreenClear") {
        this.addLine("display.clear()");
        this.addLine("display.update()");
      } else if (opcode === "scratchtoev3_ev3ScreenText") {
        const text = this.getInputValue(block, "TEXT", blocks);
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine(
          "display.text_pixels(str(" + text + "), x=" + x + ", y=" + y + ")",
        );
        this.addLine("display.update()");
      } else if (opcode === "scratchtoev3_ev3DrawCircle") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        const r = this.getInputValue(block, "R", blocks);
        this.addLine("from PIL import ImageDraw");
        this.addLine("draw = ImageDraw.Draw(display.image)");
        this.addLine(
          `draw.ellipse((${x}-${r}, ${y}-${r}, ${x}+${r}, ${y}+${r}), outline='black')`,
        );
        this.addLine("display.update()");
      } else if (opcode === "scratchtoev3_ev3DrawRectangle") {
        const x1 = this.getInputValue(block, "X1", blocks);
        const y1 = this.getInputValue(block, "Y1", blocks);
        const x2 = this.getInputValue(block, "X2", blocks);
        const y2 = this.getInputValue(block, "Y2", blocks);
        this.addLine("from PIL import ImageDraw");
        this.addLine("draw = ImageDraw.Draw(display.image)");
        this.addLine(
          `draw.rectangle((${x1}, ${y1}, ${x2}, ${y2}), outline='black')`,
        );
        this.addLine("display.update()");
      } else if (opcode === "scratchtoev3_ev3DrawLine") {
        const x1 = this.getInputValue(block, "X1", blocks);
        const y1 = this.getInputValue(block, "Y1", blocks);
        const x2 = this.getInputValue(block, "X2", blocks);
        const y2 = this.getInputValue(block, "Y2", blocks);
        this.addLine("from PIL import ImageDraw");
        this.addLine("draw = ImageDraw.Draw(display.image)");
        this.addLine(`draw.line((${x1}, ${y1}, ${x2}, ${y2}), fill='black')`);
        this.addLine("display.update()");
      } else if (opcode === "scratchtoev3_ev3Speak") {
        const text = this.getInputValue(block, "TEXT", blocks);
        // Use German voice if extension language is German
        if (currentLang === "de") {
          this.addLine(
            "sound.speak(str(" + text + "), espeak_opts='-v de -a 200 -s 120')",
          );
        } else {
          this.addLine("sound.speak(str(" + text + "))");
        }
      } else if (opcode === "scratchtoev3_ev3Beep") {
        const freq = this.getInputValue(block, "FREQUENCY", blocks);
        const duration = this.getInputValue(block, "DURATION", blocks);
        this.addLine(
          "sound.play_tone(" + freq + ", " + duration + " / 1000.0)",
        );
      } else if (opcode === "scratchtoev3_ev3SetLED") {
        const color = this.getInputValue(block, "COLOR", blocks).replace(
          /"/g,
          "",
        );
        // Map OFF to BLACK (proper ev3dev2 color)
        const ev3Color = color === "OFF" ? "BLACK" : color;
        this.addLine('leds.set_color("LEFT", "' + ev3Color + '")');
        this.addLine('leds.set_color("RIGHT", "' + ev3Color + '")');
      } else if (opcode === "scratchtoev3_ev3SetLEDSide") {
        const side = this.getInputValue(block, "SIDE", blocks).replace(
          /"/g,
          "",
        );
        const color = this.getInputValue(block, "COLOR", blocks).replace(
          /"/g,
          "",
        );
        const ev3Color = color === "OFF" ? "BLACK" : color;
        this.addLine('leds.set_color("' + side + '", "' + ev3Color + '")');
      } else if (opcode === "scratchtoev3_ev3LEDAllOff") {
        this.addLine("leds.all_off()");
      } else if (opcode === "scratchtoev3_ev3LEDReset") {
        this.addLine("leds.reset()");
      } else if (opcode === "scratchtoev3_ev3LEDAnimate") {
        const animation = this.getInputValue(
          block,
          "ANIMATION",
          blocks,
        ).replace(/"/g, "");
        const color1 = this.getInputValue(block, "COLOR1", blocks).replace(
          /"/g,
          "",
        );
        const color2 = this.getInputValue(block, "COLOR2", blocks).replace(
          /"/g,
          "",
        );
        const duration = this.getInputValue(block, "DURATION", blocks);
        const sleeptime = this.getInputValue(block, "SLEEPTIME", blocks);

        const c1 = color1 === "OFF" ? "BLACK" : color1;
        const c2 = color2 === "OFF" ? "BLACK" : color2;

        if (animation === "police") {
          this.addLine(
            'leds.animate_police_lights("' +
              c1 +
              '", "' +
              c2 +
              '", sleeptime=' +
              sleeptime +
              ", duration=" +
              duration +
              ", block=False)",
          );
        } else if (animation === "flash") {
          this.addLine(
            'leds.animate_flash("' +
              c1 +
              '", sleeptime=' +
              sleeptime +
              ", duration=" +
              duration +
              ", block=False)",
          );
        } else if (animation === "rainbow") {
          this.addLine(
            "leds.animate_rainbow(duration=" +
              duration +
              ", sleeptime=" +
              sleeptime +
              ", block=False)",
          );
        } else if (animation === "cycle") {
          this.addLine(
            'leds.animate_cycle(("' +
              c1 +
              '", "' +
              c2 +
              '"), sleeptime=' +
              sleeptime +
              ", duration=" +
              duration +
              ", block=False)",
          );
        }
      } else if (opcode === "scratchtoev3_ev3SetVolume") {
        const volume = this.getInputValue(block, "VOLUME", blocks);
        this.addLine("sound.set_volume(" + volume + ")");
      } else if (opcode === "scratchtoev3_ev3PlayTone") {
        const note = this.getInputValue(block, "NOTE", blocks).replace(
          /"/g,
          "",
        );
        const duration = this.getInputValue(block, "DURATION", blocks);
        this.addLine('sound.play_note("' + note + '", ' + duration + ")");
      } else if (opcode === "scratchtoev3_ev3PlaySong") {
        const song = this.getInputValue(block, "SONG", blocks);
        const tempo = this.getInputValue(block, "TEMPO", blocks);
        this.addLine("sound.play_song(" + song + ", tempo=" + tempo + ")");
      } else if (opcode === "scratchtoev3_ev3PlayToneSequence") {
        const sequence = this.getInputValue(block, "SEQUENCE", blocks);
        this.addLine("sound.tone(" + sequence + ")");
      } else if (opcode === "scratchtoev3_ev3PlayFile") {
        const filename = this.getInputValue(block, "FILENAME", blocks);
        const volume = this.getInputValue(block, "VOLUME", blocks);
        this.addLine(
          'sound.play_file("' +
            filename.replace(/"/g, "") +
            '", volume=' +
            volume +
            ")",
        );
      } else if (opcode === "scratchtoev3_ev3LEDStopAnimation") {
        this.addLine("leds.animate_stop()");
      }

      // Sprite state blocks
      else if (opcode === "scratchtoev3_spriteSetPosition") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine("state = get_sprite_state(" + sprite + ")");
        this.addLine('state["x"] = ' + x);
        this.addLine('state["y"] = ' + y);
      } else if (opcode === "scratchtoev3_spriteSetSize") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        const size = this.getInputValue(block, "SIZE", blocks);
        this.addLine("state = get_sprite_state(" + sprite + ")");
        this.addLine('state["size"] = ' + size);
      } else if (opcode === "scratchtoev3_spriteSetVisible") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        const visible = this.getInputValue(block, "VISIBLE", blocks);
        this.addLine("state = get_sprite_state(" + sprite + ")");
        this.addLine('state["visible"] = ' + visible);
      }

      // Standard Scratch blocks
      else if (opcode === "motion_movesteps") {
        const steps = this.getInputValue(block, "STEPS", blocks);
        this.addLine("# Move " + steps + " steps");
        this.addLine('motor_left = get_motor("B")');
        this.addLine('motor_right = get_motor("C")');
        this.addLine("if motor_left and motor_right:");
        this.indentLevel++;
        this.addLine(
          "motor_left.on_for_rotations(SpeedPercent(50), " +
            steps +
            " / 100, block=False)",
        );
        this.addLine(
          "motor_right.on_for_rotations(SpeedPercent(50), " +
            steps +
            " / 100, block=True)",
        );
        this.indentLevel--;
      } else if (opcode === "motion_turnright") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine("# Turn right " + degrees + " degrees");
        this.addLine('motor_left = get_motor("B")');
        this.addLine('motor_right = get_motor("C")');
        this.addLine("if motor_left and motor_right:");
        this.indentLevel++;
        this.addLine(
          "motor_left.on_for_rotations(SpeedPercent(50), " +
            degrees +
            " / 360, block=False)",
        );
        this.addLine(
          "motor_right.on_for_rotations(SpeedPercent(-50), " +
            degrees +
            " / 360, block=True)",
        );
        this.indentLevel--;
      } else if (opcode === "motion_turnleft") {
        const degrees = this.getInputValue(block, "DEGREES", blocks);
        this.addLine("# Turn left " + degrees + " degrees");
        this.addLine('motor_left = get_motor("B")');
        this.addLine('motor_right = get_motor("C")');
        this.addLine("if motor_left and motor_right:");
        this.indentLevel++;
        this.addLine(
          "motor_left.on_for_rotations(SpeedPercent(-50), " +
            degrees +
            " / 360, block=False)",
        );
        this.addLine(
          "motor_right.on_for_rotations(SpeedPercent(50), " +
            degrees +
            " / 360, block=True)",
        );
        this.indentLevel--;
      } else if (opcode === "motion_gotoxy") {
        const x = this.getInputValue(block, "X", blocks);
        const y = this.getInputValue(block, "Y", blocks);
        this.addLine("# Update virtual sprite position");
        this.addLine('state = get_sprite_state("_current_sprite")');
        this.addLine('state["x"] = ' + x);
        this.addLine('state["y"] = ' + y);
      }

      // Control blocks
      else if (opcode === "control_wait") {
        const duration = this.getInputValue(block, "DURATION", blocks);
        this.addLine("sleep(" + duration + ")");
      } else if (opcode === "control_repeat") {
        const times = this.getInputValue(block, "TIMES", blocks);
        this.addLine("for i in range(int(" + times + ")):");
        this.indentLevel++;
        this.addLine("if stop_all: break");

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        } else {
          this.addLine("pass");
        }
        this.indentLevel--;
      } else if (opcode === "control_forever") {
        this.addLine("while not stop_all:");
        this.indentLevel++;

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        } else {
          this.addLine("pass");
        }
        this.addLine("sleep(0.01)");
        this.indentLevel--;
      } else if (opcode === "control_if") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine("if " + condition + ":");
        this.indentLevel++;

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        } else {
          this.addLine("pass");
        }
        this.indentLevel--;
      } else if (opcode === "control_if_else") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine("if " + condition + ":");
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
      } else if (opcode === "control_repeat_until") {
        const condition = this.getInputValue(block, "CONDITION", blocks);
        this.addLine("while not (" + condition + ") and not stop_all:");
        this.indentLevel++;

        const substackId = this.getSubstackId(block, "SUBSTACK");
        if (substackId) {
          this.processBlockChain(substackId, blocks);
        } else {
          this.addLine("pass");
        }
        this.indentLevel--;
      } else if (opcode === "control_stop") {
        const stopOption = this.getFieldValue(block, "STOP_OPTION") || "all";
        if (stopOption === "all") {
          this.addLine("stop_all = True");
          this.addLine("sys.exit(0)");
        } else {
          this.addLine("return");
        }
      }

      // Event blocks
      else if (opcode === "event_broadcast") {
        const broadcastInput = this.getInputValue(
          block,
          "BROADCAST_INPUT",
          blocks,
        );
        this.addLine("trigger_broadcast(" + broadcastInput + ")");
      } else if (opcode === "event_broadcastandwait") {
        const broadcastInput = this.getInputValue(
          block,
          "BROADCAST_INPUT",
          blocks,
        );
        this.addLine("trigger_broadcast_wait(" + broadcastInput + ")");
      }

      // Looks blocks
      else if (opcode === "looks_say" || opcode === "looks_sayforsecs") {
        const message = this.getInputValue(block, "MESSAGE", blocks);
        this.addLine("sound.speak(str(" + message + "))");
        if (opcode === "looks_sayforsecs") {
          const secs = this.getInputValue(block, "SECS", blocks);
          this.addLine("sleep(" + secs + ")");
        }
      }

      // Sound blocks
      else if (opcode === "sound_play" || opcode === "sound_playuntildone") {
        const soundMenu = this.getInputValue(block, "SOUND_MENU", blocks);
        const soundName = soundMenu.replace(/"/g, "");
        if (soundName && soundName !== "0") {
          const sanitized = this.sanitizeSoundName(soundName);
          this.soundFiles.push(sanitized + ".wav");
          this.addLine('play_sound_file("' + sanitized + '.wav")');
        } else {
          this.addLine("sound.beep()");
        }
      }

      // Data blocks
      else if (opcode === "data_setvariableto") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        this.addLine('variables["' + varName + '"] = ' + value);
      } else if (opcode === "data_changevariableby") {
        const varName = this.getFieldValue(block, "VARIABLE");
        const value = this.getInputValue(block, "VALUE", blocks);
        this.addLine(
          'variables["' +
            varName +
            '"] = variables.get("' +
            varName +
            '", 0) + (' +
            value +
            ")",
        );
      }

      // Default
      else {
        this.addLine("# TODO: " + opcode);
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
      // Number blocks
      if (
        block.opcode === "math_number" ||
        block.opcode === "math_whole_number" ||
        block.opcode === "math_positive_number" ||
        block.opcode === "math_integer"
      ) {
        const num = this.getFieldValue(block, "NUM");
        return num || "0";
      }
      // Text blocks
      else if (block.opcode === "text") {
        const text = this.getFieldValue(block, "TEXT");
        if (this.isNumeric(text)) return String(text);
        return '"' + (text || "") + '"';
      }
      // Menu blocks
      else if (block.opcode === "event_broadcast_menu") {
        const broadcast = this.getFieldValue(block, "BROADCAST_OPTION");
        return '"' + broadcast + '"';
      } else if (block.opcode === "sound_sounds_menu") {
        const sound = this.getFieldValue(block, "SOUND_MENU");
        return '"' + sound + '"';
      }
      // Variables
      else if (block.opcode === "data_variable") {
        const varName = this.getFieldValue(block, "VARIABLE");
        return 'variables.get("' + varName + '", 0)';
      }
      // Sprite state reporters
      else if (block.opcode === "scratchtoev3_spriteGetX") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        return "get_sprite_state(" + sprite + ')["x"]';
      } else if (block.opcode === "scratchtoev3_spriteGetY") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        return "get_sprite_state(" + sprite + ')["y"]';
      } else if (block.opcode === "scratchtoev3_spriteGetSize") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        return "get_sprite_state(" + sprite + ')["size"]';
      } else if (block.opcode === "scratchtoev3_spriteGetVisible") {
        const sprite = this.getInputValue(block, "SPRITE", blocks);
        return "get_sprite_state(" + sprite + ')["visible"]';
      }
      // Sensor reporters
      else if (block.opcode === "scratchtoev3_ev3TouchSensor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_sensor("' +
          port +
          '", "touch").is_pressed if get_sensor("' +
          port +
          '", "touch") else False)'
        );
      } else if (block.opcode === "scratchtoev3_ev3ColorSensor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const mode = this.getInputValue(block, "MODE", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_sensor("' +
          port +
          '", "color").' +
          mode +
          ' if get_sensor("' +
          port +
          '", "color") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3ColorRGB") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const component = this.getInputValue(
          block,
          "COMPONENT",
          blocks,
        ).replace(/"/g, "");
        const idx = { red: 0, green: 1, blue: 2 }[component] || 0;
        return (
          '(get_sensor("' +
          port +
          '", "color").rgb[' +
          idx +
          '] if get_sensor("' +
          port +
          '", "color") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3UltrasonicSensor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_sensor("' +
          port +
          '", "ultrasonic").distance_centimeters if get_sensor("' +
          port +
          '", "ultrasonic") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3GyroSensor") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const mode = this.getInputValue(block, "MODE", blocks).replace(
          /"/g,
          "",
        );
        const prop = mode === "angle" ? "angle" : "rate";
        return (
          '(get_sensor("' +
          port +
          '", "gyro").' +
          prop +
          ' if get_sensor("' +
          port +
          '", "gyro") else 0)'
        );
      }
      // Infrared reporters
      else if (block.opcode === "scratchtoev3_ev3InfraredProximity") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_sensor("' +
          port +
          '", "infrared").proximity if get_sensor("' +
          port +
          '", "infrared") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3InfraredBeaconHeading") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const channel = this.getInputValue(block, "CHANNEL", blocks);
        return (
          '(get_sensor("' +
          port +
          '", "infrared").heading(' +
          channel +
          ') if get_sensor("' +
          port +
          '", "infrared") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3InfraredBeaconDistance") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const channel = this.getInputValue(block, "CHANNEL", blocks);
        return (
          '(get_sensor("' +
          port +
          '", "infrared").distance(' +
          channel +
          ') or 0 if get_sensor("' +
          port +
          '", "infrared") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3InfraredRemoteButton") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        const channel = this.getInputValue(block, "CHANNEL", blocks);
        const button = this.getInputValue(block, "BUTTON", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_sensor("' +
          port +
          '", "infrared").' +
          button +
          "(" +
          channel +
          ') if get_sensor("' +
          port +
          '", "infrared") else False)'
        );
      }
      // Button reporters
      else if (block.opcode === "scratchtoev3_ev3ButtonPressed") {
        const button = this.getInputValue(block, "BUTTON", blocks).replace(
          /"/g,
          "",
        );
        return "buttons." + button;
      }
      // Motor reporters
      else if (block.opcode === "scratchtoev3_ev3MotorPosition") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_motor("' +
          port +
          '").position if get_motor("' +
          port +
          '") else 0)'
        );
      } else if (block.opcode === "scratchtoev3_ev3MotorSpeed") {
        const port = this.getInputValue(block, "PORT", blocks).replace(
          /"/g,
          "",
        );
        return (
          '(get_motor("' +
          port +
          '").speed if get_motor("' +
          port +
          '") else 0)'
        );
      }
      // Battery
      else if (block.opcode === "scratchtoev3_ev3BatteryLevel") {
        return "max(0, min(100, ((power.measured_volts - 7.4) / (9.0 - 7.4)) * 100))";
      }
      // Volume reporter
      else if (block.opcode === "scratchtoev3_ev3GetVolume") {
        return "sound.get_volume()";
      }

      // Operators
      else if (block.opcode === "operator_gt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return op1 + " > " + op2;
      } else if (block.opcode === "operator_lt") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return op1 + " < " + op2;
      } else if (block.opcode === "operator_equals") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return op1 + " == " + op2;
      } else if (block.opcode === "operator_and") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return "(" + op1 + " and " + op2 + ")";
      } else if (block.opcode === "operator_or") {
        const op1 = this.getInputValue(block, "OPERAND1", blocks);
        const op2 = this.getInputValue(block, "OPERAND2", blocks);
        return "(" + op1 + " or " + op2 + ")";
      } else if (block.opcode === "operator_not") {
        const op = this.getInputValue(block, "OPERAND", blocks);
        return "not (" + op + ")";
      } else if (block.opcode === "operator_add") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return "(" + num1 + " + " + num2 + ")";
      } else if (block.opcode === "operator_subtract") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return "(" + num1 + " - " + num2 + ")";
      } else if (block.opcode === "operator_multiply") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return "(" + num1 + " * " + num2 + ")";
      } else if (block.opcode === "operator_divide") {
        const num1 = this.getInputValue(block, "NUM1", blocks);
        const num2 = this.getInputValue(block, "NUM2", blocks);
        return "(" + num1 + " / " + num2 + ")";
      } else if (block.opcode === "operator_random") {
        const from = this.getInputValue(block, "FROM", blocks);
        const to = this.getInputValue(block, "TO", blocks);
        return "random.randint(int(" + from + "), int(" + to + "))";
      } else if (block.opcode === "operator_join") {
        const s1 = this.getInputValue(block, "STRING1", blocks);
        const s2 = this.getInputValue(block, "STRING2", blocks);
        return "str(" + s1 + ") + str(" + s2 + ")";
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

    // ============================================================================
    // UI FUNCTIONS
    // ============================================================================

    showCode() {
      if (!this.pythonCode) {
        alert(t("noCodeGenerated"));
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
        border: 2px solid #4C97FF;
        border-radius: 8px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;

      const title = document.createElement("h3");
      title.textContent = t("generatedCode");
      title.style.cssText = "margin-top: 0;";

      const pre = document.createElement("pre");
      pre.style.cssText =
        "background: #f5f5f5; padding: 10px; overflow: auto; max-height: 500px; font-family: monospace; font-size: 12px;";
      pre.textContent = this.pythonCode;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = t("close");
      closeBtn.style.cssText =
        "margin-top: 10px; padding: 8px 16px; background: #4C97FF; color: white; border: none; border-radius: 4px; cursor: pointer;";
      closeBtn.onclick = () => document.body.removeChild(modal);

      modal.appendChild(title);
      modal.appendChild(pre);
      modal.appendChild(closeBtn);

      document.body.appendChild(modal);
    }

    downloadCode() {
      if (!this.pythonCode) {
        alert(t("generateFirst"));
        return;
      }

      const blob = new Blob([this.pythonCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ev3_program.py";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(t("downloaded") + " ev3_program.py");
    }

    downloadUploader() {
      const uploaderScript = `#!/bin/bash
# EV3 Upload Script
# Generated by TurboWarp EV3 Extension v2.0
# Usage: ./upload_to_ev3.sh <ev3_ip_address>

if [ -z "$1" ]; then
    echo "Usage: $0 <ev3_ip_address>"
    echo "Example: $0 192.168.1.100"
    exit 1
fi

EV3_IP=$1
EV3_USER="robot"
EV3_SOUNDS_DIR="/home/robot/sounds"
EV3_PROGRAM_DIR="/home/robot"

echo "=== EV3 Upload Script ==="
echo "Target: $EV3_USER@$EV3_IP"

# Create directories
ssh $EV3_USER@$EV3_IP "mkdir -p $EV3_SOUNDS_DIR"

# Upload program
echo "Uploading ev3_program.py..."
scp ev3_program.py $EV3_USER@$EV3_IP:$EV3_PROGRAM_DIR/
ssh $EV3_USER@$EV3_IP "chmod +x $EV3_PROGRAM_DIR/ev3_program.py"

# Upload sounds
${
  this.soundFiles.length > 0
    ? `
echo "Uploading sound files..."
${this.soundFiles
  .map(
    (f) => `
if [ -f "${f}" ]; then
    scp "${f}" $EV3_USER@$EV3_IP:$EV3_SOUNDS_DIR/
fi`,
  )
  .join("")}
`
    : "# No sounds"
}

echo ""
echo "=== Complete ==="
echo "Run: ssh $EV3_USER@$EV3_IP 'python3 /home/robot/ev3_program.py'"
echo "Stop: echo 'STOPSCRIPT' | nc -u $EV3_IP 5555"
`;

      const blob = new Blob([uploaderScript], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "upload_to_ev3.sh";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(
        t("downloaded") + " upload_to_ev3.sh\n\n" + t("uploaderInstructions"),
      );
    }
  }

  Scratch.extensions.register(new ScratchToEV3());
})(Scratch);
