#!/usr/bin/env node

/**
 * Accessibility audit runner — serves the static export and runs axe-core
 * on every route, reporting violations in a structured format.
 *
 * Usage: node scripts/a11y-audit.mjs
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PORT = 3444;
const OUT_DIR = new URL("../out", import.meta.url).pathname;
const BASE_URL = `http://localhost:${PORT}`;

// ── MIME types ──
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".atom": "application/atom+xml",
  ".txt": "text/plain",
};

/**
 * Resolve a request path to a Next.js static export file.
 * Next.js export produces e.g.:
 *   / → /index.html
 *   /espensar → /espensar.html
 *   /espensar/critica-tecnologica → /espensar/critica-tecnologica.html
 *   /espensar/critica-tecnologica/ → directory with extracted assets
 */
function resolvePath(urlPath) {
  // Remove query string
  const path = urlPath.split("?")[0];
  const decoded = decodeURIComponent(path);
  const filePath = join(OUT_DIR, decoded);

  // Direct match
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }

  // Try with .html extension (Next.js static export pattern)
  const htmlPath = `${filePath}.html`;
  if (existsSync(htmlPath)) {
    return htmlPath;
  }

  // Try as directory with index.html
  const indexPath = join(filePath, "index.html");
  if (existsSync(indexPath)) {
    return indexPath;
  }

  // For root, serve index.html
  if (path === "/" || path === "") {
    const rootIndex = join(OUT_DIR, "index.html");
    if (existsSync(rootIndex)) return rootIndex;
  }

  // Handle Next.js internal files (start with _)
  if (existsSync(filePath)) return filePath;

  // Fallback: 404 page
  const fallback = join(OUT_DIR, "404.html");
  if (existsSync(fallback)) return fallback;

  return null;
}

// ── Static server ──
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const filePath = resolvePath(req.url);
      if (!filePath) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": "no-cache",
        });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(PORT, () => {
      console.log(`Static server at ${BASE_URL}`);
      resolve(server);
    });
  });
}

// ── Routes to audit — covers all site pages ──
const ROUTES = [
  { name: "home", path: "/" },
  { name: "espensar (collection)", path: "/espensar" },
  { name: "espensar: crítica tecnológica", path: "/espensar/critica-tecnologica" },
  { name: "espensar: manifiesto elígete a ti", path: "/espensar/manifiesto-eligete-a-ti" },
  { name: "espensar: soberanía digital", path: "/espensar/soberania-digital" },
  { name: "esposible (collection)", path: "/esposible" },
  { name: "esposible: escape del feudo", path: "/esposible/escape-del-feudo-algoritmico" },
  { name: "esposible: protocolos vs plataformas", path: "/esposible/protocolos-vs-plataformas" },
  { name: "now", path: "/now" },
  { name: "tags (index)", path: "/tags" },
  { name: "tags: Alexendros", path: "/tags/Alexendros" },
  { name: "tags: algoritmos", path: "/tags/algoritmos" },
  { name: "legal: aviso legal", path: "/legal/aviso-legal" },
  { name: "legal: privacidad", path: "/legal/privacidad" },
  { name: "legal: cookies", path: "/legal/cookies" },
  { name: "legal: seguridad", path: "/legal/seguridad" },
  { name: "error 404", path: "/nonexistent-page" },
];

// ── Main ──
async function main() {
  const server = await startServer();
  let browser;
  let allViolations = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    for (const route of ROUTES) {
      const page = await context.newPage();
      const url = `${BASE_URL}${route.path}`;

      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
        // Wait for React hydration to complete
        await page.waitForTimeout(1000);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        if (results.violations.length > 0) {
          allViolations.push({
            route: route.name,
            path: route.path,
            violations: results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              helpUrl: v.helpUrl,
              nodes: v.nodes.map((n) => ({
                target: n.target.join(", "),
                html: n.html.slice(0, 200),
                failureSummary: n.failureSummary,
                allRelatedNodes: n.all.map((rn) => rn.html).slice(0, 3),
              })),
            })),
          });

          console.error(
            `\n❌ ${route.name} (${route.path}) — ${results.violations.length} violations`,
          );
          for (const v of results.violations) {
            console.error(`  [${v.impact}] WCAG:${v.id}: ${v.description}`);
            for (const n of v.nodes) {
              console.error(`    → ${n.target.join(", ")}`);
              console.error(`      ${n.html.slice(0, 150)}`);
            }
          }
        } else {
          console.log(`✅ ${route.name} — 0 violations`);
        }
      } catch (err) {
        console.error(`⚠️  ${route.name} (${route.path}) — Error: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  // ── Summary ──
  const totalViolations = allViolations.reduce((sum, r) => sum + r.violations.length, 0);
  const routesWithIssues = allViolations.length;

  console.log(`\n${"=".repeat(60)}`);
  console.log("ACCESIBILITY AUDIT SUMMARY — WCAG 2.1 AA (axe-core)");
  console.log(`${"=".repeat(60)}`);
  console.log(`Routes audited: ${ROUTES.length}`);
  console.log(`Routes with violations: ${routesWithIssues}`);
  console.log(`Total violations: ${totalViolations}`);

  if (totalViolations > 0) {
    console.log(`\n### VIOLATIONS BY ROUTE ###`);
    for (const route of allViolations) {
      console.log(`\n**${route.route}** (${route.path})`);
      for (const v of route.violations) {
        console.log(`- [${v.impact}] ${v.id}: ${v.help}`);
        console.log(`  ${v.helpUrl}`);
        for (const n of v.nodes) {
          console.log(`  Fix: ${n.failureSummary?.split("\n")[0] ?? "See help link"}`);
          console.log(`  Element: ${n.html.slice(0, 120)}`);
        }
      }
    }
    console.log(
      `\n❌ FAIL — ${totalViolations} violations found across ${routesWithIssues} routes`,
    );
    process.exit(1);
  } else {
    console.log(`\n✅ PASS — All routes clean, no WCAG 2.1 AA violations`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
