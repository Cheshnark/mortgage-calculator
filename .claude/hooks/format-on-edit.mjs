#!/usr/bin/env node
/**
 * Hook PostToolUse (Write|Edit): formatea con Prettier el fichero que se
 * acaba de tocar.
 *
 * Lee el JSON del hook por stdin, saca `tool_input.file_path` y le pasa
 * Prettier con `--ignore-unknown` (así los ficheros que Prettier no sabe
 * formatear —.png, .env…— no producen error). Nunca hace fallar la
 * herramienta que lo disparó: cualquier problema aquí se traga y se sale
 * con éxito, porque un fallo de formateo no debe bloquear una edición.
 */
import { execFileSync } from "node:child_process";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    const filePath = payload?.tool_input?.file_path;
    if (!filePath) process.exit(0);

    // shell: true es necesario en Windows: execFileSync no resuelve npx.cmd
    // (a diferencia de .exe) sin pasar por el shell.
    execFileSync("npx", ["prettier", "--ignore-unknown", "--write", filePath], {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    // Silencioso a propósito: un fallo de formateo no debe romper la edición.
  }
  process.exit(0);
});
