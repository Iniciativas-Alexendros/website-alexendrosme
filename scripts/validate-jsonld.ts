#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Valida JSON-LD en archivos HTML generados por la build.
 * Busca <script type="application/ld+json"> y verifica estructura mínima.
 * Exit 0 si todo OK, exit 1 si hay errores.
 */
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out");

function findHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  const stack: string[] = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.name.endsWith(".html") || entry.name.endsWith(".htm")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function extractJsonLd(html: string): Array<{ id: string; json: unknown }> {
  const results: Array<{ id: string; json: unknown }> = [];
  const regex = /<script type="application\/ld\+json"[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const id = match[1] ?? "unknown";
    const jsonStr = match[2] ?? "{}";
    try {
      results.push({ id, json: JSON.parse(jsonStr) });
    } catch {
      // JSON parse error — skip malformed block
    }
  }
  return results;
}

function validateJsonLd(blocks: Array<{ id: string; json: unknown }>): string[] {
  const errors: string[] = [];
  for (const { id, json } of blocks) {
    if (typeof json !== "object" || json === null) {
      errors.push(`${id}: JSON inválido (no es objeto)`);
      continue;
    }
    const obj = json as Record<string, unknown>;
    if (!obj["@context"]) {
      errors.push(`${id}: falta @context`);
    }
    if (!obj["@type"]) {
      errors.push(`${id}: falta @type`);
    }
  }
  return errors;
}

const htmlFiles = findHtmlFiles(OUT_DIR);

if (htmlFiles.length === 0) {
  console.error("❌ No se encontraron archivos HTML en out/");
  process.exit(1);
}

let totalBlocks = 0;
let totalErrors = 0;

for (const file of htmlFiles) {
  const rel = path.relative(OUT_DIR, file);
  const html = fs.readFileSync(file, "utf-8");
  const blocks = extractJsonLd(html);

  if (blocks.length === 0) continue;

  const errors = validateJsonLd(blocks);
  totalBlocks += blocks.length;
  totalErrors += errors.length;

  if (errors.length > 0) {
    console.error(`❌ ${rel}: ${errors.join(", ")}`);
  } else {
    console.log(`  ✅ ${rel}: ${blocks.length} bloque(s) OK`);
  }
}

console.log(
  `\n${totalBlocks} bloques JSON-LD, ${totalErrors} error(es) en ${htmlFiles.length} página(s)`,
);

if (totalErrors > 0) {
  process.exit(1);
}
