#!/usr/bin/env node
/**
 * Smoke del export estático: sirve `out/` y comprueba rutas canónicas.
 * Requiere `out/` (npm run build) o el artefacto `static-export` de CI.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const PORT = Number(process.env.SMOKE_PORT ?? 4173);
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTES = ["/", "/proyectos", "/opinion", "/en"];
const READY_ATTEMPTS = 30;

if (!existsSync("out")) {
  console.error("smoke: falta el directorio out/. Ejecuta `npm run build` antes.");
  process.exit(1);
}

const serve = spawn("npx", ["serve", "out", "-l", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});

let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  serve.kill("SIGTERM");
  process.exit(code);
}

serve.on("error", (err) => {
  console.error("smoke: no se pudo arrancar serve:", err);
  shutdown(1);
});

async function waitReady() {
  for (let i = 0; i < READY_ATTEMPTS; i++) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: "manual" });
      if (res.status === 200) return;
    } catch {
      // still booting
    }
    await delay(1000);
  }
  throw new Error(`serve no respondió en ${BASE} tras ${READY_ATTEMPTS}s`);
}

async function check(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  console.log(`${path} -> ${res.status}`);
  if (res.status !== 200) {
    throw new Error(`smoke: ${path} devolvió ${res.status}`);
  }
}

try {
  await waitReady();
  for (const path of ROUTES) {
    await check(path);
  }
  console.log("smoke: ok");
  shutdown(0);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  shutdown(1);
}
