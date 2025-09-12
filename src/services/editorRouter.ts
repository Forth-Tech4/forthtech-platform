// File: src/services/arduinoRouter.ts

import { Router } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const arduinoRouter = Router();

// Directory to store sketches
const SKETCHES_DIR = path.join(__dirname, "../sketches");
if (!fs.existsSync(SKETCHES_DIR)) fs.mkdirSync(SKETCHES_DIR);
console.log("Sketches directory:", SKETCHES_DIR);

// Arduino CLI path (your version)
const ARDUINO_CLI_PATH = `"C:\\arduino-cli\\arduino-cli_1.3.1_Windows_64bit\\arduino-cli.exe"`;
console.log("Using Arduino CLI path:", ARDUINO_CLI_PATH);

// POST /run-arduino
arduinoRouter.post("/run-arduino", async (req, res) => {
  try {
    const { code, boardFqbn } = req.body;
    console.log("Received code length:", code?.length, "Board FQBN:", boardFqbn);

    if (!code || !boardFqbn) {
      return res.status(400).json({ error: "Code and boardFqbn are required" });
    }

    // Create unique sketch folder
    const sketchName = `sketch_${Date.now()}`;
    const sketchPath = path.join(SKETCHES_DIR, sketchName);
    fs.mkdirSync(sketchPath);

    // Save .ino file
    const inoFile = path.join(sketchPath, `${sketchName}.ino`);
    fs.writeFileSync(inoFile, code);
    console.log("Sketch saved at:", inoFile);

    // Compile the sketch using Arduino CLI
    const compileCmd = `${ARDUINO_CLI_PATH} compile --fqbn ${boardFqbn} "${sketchPath}"`;
    console.log("Running compile command:", compileCmd);

    exec(compileCmd, (err, stdout, stderr) => {
      // Define a cleanup function
      const cleanup = () => {
        try {
          fs.rmSync(sketchPath, { recursive: true, force: true });
          console.log("Deleted sketch folder:", sketchPath);
        } catch (cleanupErr) {
          console.error("Failed to delete sketch folder:", cleanupErr);
        }
      };

      if (err) {
        console.error("Compile failed:");
        console.error("Error object:", err);
        console.error("stderr:", stderr);
        res.status(200).json({
          success: false,
          compileError: stderr || "Unknown compile error",
        });
        cleanup(); // delete even on failure
        return;
      }

      console.log("Compile succeeded:\n", stdout);

      // --- Simulated Execution ---
      let simulatedOutput = "";
      const iterations:any = 1; // how many times loop() runs
      const variables:any = {};
      const pinStates:any = {};
      const pinModes:any = {};

      const varDeclRegex = /(int|float|double|long)\s+(\w+)\s*=\s*(\d+)\s*;/g;
      let match;
      while ((match = varDeclRegex.exec(code)) !== null) {
        variables[match[2]] = parseInt(match[3], 10);
      }

      const serialPrintRegex = /Serial\.print\s*\(\s*["'`]?(.*?)["'`]?\s*\)\s*;/g;
      const serialPrintlnRegex = /Serial\.println\s*\(\s*["'`]?(.*?)["'`]?\s*\)\s*;/g;
      const pinModeRegex = /pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*;/g;
      const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*;/g;

      for (const m of code.matchAll(pinModeRegex)) {
        const pin = m[1];
        const mode = m[2];
        pinModes[pin] = mode;
        simulatedOutput += `${pin} mode set to ${mode}\n`;
      }

      for (let i = 0; i < iterations; i++) {
        for (const m of code.matchAll(serialPrintRegex)) {
          let val = m[1];
          Object.keys(variables).forEach((v) => {
            val = val.replaceAll(v, variables[v]);
          });
          simulatedOutput += val;
        }

        for (const m of code.matchAll(serialPrintlnRegex)) {
          let val = m[1];
          Object.keys(variables).forEach((v) => {
            val = val.replaceAll(v, variables[v]);
          });
          simulatedOutput += val + "\n";
        }

        for (const m of code.matchAll(digitalWriteRegex)) {
          const pin = m[1];
          const value = m[2];
          pinStates[pin] = value;
          simulatedOutput += `${pin} set ${value}\n`;
        }

        const incRegex = /(\w+)\s*\+\+/g;
        for (const m of code.matchAll(incRegex)) {
          const varName = m[1];
          if (variables[varName] !== undefined) variables[varName]++;
        }
      }

      if (!simulatedOutput) simulatedOutput = "No output detected";

      res.json({
        success: true,
        compileOutput: stdout || "Compiled successfully",
        simulatedOutput,
      });

      cleanup(); // delete after success
    });
  } catch (error:any) {
    console.error("Unexpected server error:", error);
    res.status(500).json({ success: false, output: error.message });
  }
});

export default arduinoRouter;