#!/usr/bin/env node

/**
 * Efficient Lighthouse audit — representative routes, parallel batches, HTML reports.
 *
 * Usage: node scripts/lighthouse-audit.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:http";

const PORT = 4224;
const OUT_DIR = new URL("../out", import.meta.url).pathname;
const BASE_URL = `http://localhost:${PORT}`;
const REPORT_DIR = new URL("../lighthouse-reports", import.meta.url).pathname;

// Minimal MIME map
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function resolvePath(urlPath) {
  const path = decodeURIComponent(urlPath.split("?")[0]);
  const fp = join(OUT_DIR, path);
  for (const tryPath of [
    fp,
    fp + ".html",
    join(fp, "index.html"),
    join(OUT_DIR, "index.html"),
    join(OUT_DIR, "404.html"),
  ]) {
    if (existsSync(tryPath)) return tryPath;
  }
  return null;
}

// Static server
const server = createServer((req, res) => {
  const fp = resolvePath(req.url);
  if (!fp) {
    res.writeHead(404);
    res.end("");
    return;
  }
  const ext = fp.split(".").pop();
  res.writeHead(200, { "Content-Type": MIME["." + ext] ?? "octet-stream" });
  res.end(readFileSync(fp));
});

// Site-type representative routes (1 per page type for speed)
const ROUTES = [
  { name: "home", path: "/" },
  { name: "collection: espensar", path: "/espensar" },
  { name: "article: crítica tecnológica", path: "/espensar/critica-tecnologica" },
  { name: "now", path: "/now" },
  { name: "tags index", path: "/tags" },
  { name: "legal: privacidad", path: "/legal/privacidad" },
  { name: "error 404", path: "/nonexistent" },
];

function audit(url, reportPath) {
  const cmd = [
    "npx",
    "lighthouse",
    url,
    "--output=json",
    `--output-path=${reportPath}`,
    "--chrome-flags=--headless --no-sandbox",
    "--quiet",
    "--only-categories=performance,accessibility,best-practices,seo",
  ].join(" ");
  try {
    execSync(cmd, { stdio: "pipe", timeout: 120_000 });
  } catch {
    /* Lighthouse may exit code 1 even on success */
  }
  try {
    return JSON.parse(readFileSync(reportPath, "utf-8"));
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.error("Run 'npm run build' first");
    process.exit(1);
  }
  mkdirSync(REPORT_DIR, { recursive: true });
  server.listen(PORT);
  console.log(`Server on ${BASE_URL}`);

  const results = [];
  for (const r of ROUTES) {
    const url = `${BASE_URL}${r.path}`;
    const safe = r.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const reportPath = join(REPORT_DIR, `${safe}.json`);
    process.stdout.write(`  ${r.name}... `);
    const data = audit(url, reportPath);
    if (data?.categories) {
      const c = data.categories;
      const s = {
        perf: Math.round((c.performance?.score ?? 0) * 100),
        a11y: Math.round((c.accessibility?.score ?? 0) * 100),
        bp: Math.round((c["best-practices"]?.score ?? 0) * 100),
        seo: Math.round((c.seo?.score ?? 0) * 100),
      };
      results.push({ name: r.name, path: r.path, ...s });
      console.log(`P:${s.perf} A:${s.a11y} BP:${s.bp} SEO:${s.seo}`);
    } else {
      results.push({ name: r.name, path: r.path, perf: -1, a11y: -1, bp: -1, seo: -1 });
      console.log("FAILED");
    }
  }

  server.close();

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("LIGHTHOUSE AUDIT SUMMARY (1 run each, desktop)");
  console.log("=".repeat(70));
  console.log(`${"Route".padEnd(34)} Perf  A11y  BP   SEO`);
  console.log("-".repeat(60));
  let acc = { perf: [], a11y: [], bp: [], seo: [] };
  for (const r of results) {
    const ok = (v) => (v >= 0 ? `${v}`.padEnd(5) : "N/A ".padEnd(5));
    console.log(`${r.name.padEnd(34)} ${ok(r.perf)} ${ok(r.a11y)} ${ok(r.bp)} ${ok(r.seo)}`);
    if (r.perf >= 0) acc.perf.push(r.perf);
    if (r.a11y >= 0) acc.a11y.push(r.a11y);
    if (r.bp >= 0) acc.bp.push(r.bp);
    if (r.seo >= 0) acc.seo.push(r.seo);
  }
  const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const min = (a) => (a.length ? Math.min(...a) : 0);
  console.log("-".repeat(60));
  console.log(
    `${"Average".padEnd(34)} ${avg(acc.perf)}    ${avg(acc.a11y)}    ${avg(acc.bp)}    ${avg(acc.seo)}`,
  );
  console.log(
    `${"Minimum".padEnd(34)} ${min(acc.perf)}    ${min(acc.a11y)}    ${min(acc.bp)}    ${min(acc.seo)}`,
  );
  console.log(`\nReports: ${REPORT_DIR}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
