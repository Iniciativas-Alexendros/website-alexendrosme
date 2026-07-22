#!/usr/bin/env node

/**
 * Full site audit via Playwright.
 * Measures: FCP, LCP, CLS, Resources, a11y (axe-core), SEO, Best Practices.
 * Saves JSON report per route.
 *
 * Usage: node scripts/perf-audit.mjs
 */

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = 4335;
const OUT_DIR = new URL("../out", import.meta.url).pathname;
const BASE = `http://localhost:${PORT}`;
const REPORT_DIR = new URL("../perf-reports", import.meta.url).pathname;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};

function start() {
  return new Promise((r) => {
    const s = createServer((q, res) => {
      let p = decodeURIComponent(q.url.split("?")[0]);
      let fp = join(OUT_DIR, p === "/" ? "index.html" : p);

      // Try direct, +.html, /index.html, root index, 404
      const candidates = [
        fp,
        fp + ".html",
        join(fp, "index.html"),
        join(OUT_DIR, "index.html"),
        join(OUT_DIR, "404.html"),
      ];
      for (const t of candidates) {
        if (existsSync(t) && statSync(t).isFile()) {
          const c = readFileSync(t);
          const ext = "." + t.split(".").pop().toLowerCase();
          res.writeHead(200, { "Content-Type": MIME[ext] ?? "octet-stream" });
          res.end(c);
          return;
        }
      }
      const fallback = join(OUT_DIR, "404.html");
      if (existsSync(fallback)) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(readFileSync(fallback));
      } else {
        res.writeHead(404);
        res.end("");
      }
    }).listen(PORT, () => {
      console.log(`Server:${BASE}`);
      r(s);
    });
  });
}

const ROUTES = [
  { n: "home", p: "/" },
  { n: "espensar", p: "/espensar" },
  { n: "article:critica-tecnologica", p: "/espensar/critica-tecnologica" },
  { n: "article:manifiesto", p: "/espensar/manifiesto-eligete-a-ti" },
  { n: "article:soberania-digital", p: "/espensar/soberania-digital" },
  { n: "esposible", p: "/esposible" },
  { n: "article:escape-feudo", p: "/esposible/escape-del-feudo-algoritmico" },
  { n: "article:protocolos", p: "/esposible/protocolos-vs-plataformas" },
  { n: "now", p: "/now" },
  { n: "tags", p: "/tags" },
  { n: "tag:Alexendros", p: "/tags/Alexendros" },
  { n: "legal:aviso-legal", p: "/legal/aviso-legal" },
  { n: "legal:privacidad", p: "/legal/privacidad" },
  { n: "legal:cookies", p: "/legal/cookies" },
  { n: "legal:seguridad", p: "/legal/seguridad" },
  { n: "404", p: "/nonexistent" },
];

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.error("Build out/ not found. Run 'npm run build'");
    process.exit(1);
  }
  mkdirSync(REPORT_DIR, { recursive: true });
  const server = await start();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const allResults = [];

  for (const route of ROUTES) {
    process.stdout.write(`  ${route.n.padEnd(30)}`);
    const page = await context.newPage();
    const report = {
      route: route.n,
      url: route.p,
      fcp: null,
      lcp: null,
      cls: 0,
      resources: {},
      a11yViolations: null,
      a11yPasses: 0,
      consoleErrors: [],
      seo: {},
    };

    // Capture console errors (Best Practices)
    page.on("console", (msg) => {
      if (msg.type() === "error") report.consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      report.consoleErrors.push(err.message);
    });

    try {
      await page.goto(`${BASE}${route.p}`, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(1000);

      // Web Vitals
      const vitals = await page.evaluate(
        () =>
          new Promise((resolve) => {
            let fcp = null,
              lcp = null,
              cls = 0;
            let clsSession = 0;
            let resolved = false;

            const finish = () => {
              if (!resolved) {
                resolved = true;
                resolve({ fcp, lcp, cls });
              }
            };

            const po = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
                  fcp = entry.startTime;
                }
                if (entry.entryType === "largest-contentful-paint") {
                  lcp = entry.startTime;
                }
                if (entry.entryType === "layout-shift") {
                  if (!(/** @type {any} */ (entry).hadRecentInput)) {
                    clsSession += /** @type {any} */ (entry).value;
                  }
                }
              }
            });

            try {
              po.observe({ type: "paint", buffered: true });
              po.observe({ type: "largest-contentful-paint", buffered: true });
              po.observe({ type: "layout-shift", buffered: true });
            } catch {}

            // Timeout after 3s for all metrics
            setTimeout(finish, 3000);
          }),
      );

      report.fcp = vitals.fcp;
      report.lcp = vitals.lcp;
      report.cls = vitals.cls;

      // Resources
      const resources = await page.evaluate(() => {
        const all = performance.getEntriesByType("resource");
        const totalSize = all.reduce((s, r) => s + (r.transferSize ?? 0), 0);
        return {
          count: all.length,
          totalKb: Math.round(totalSize / 1024),
          jsKb: Math.round(
            all
              .filter((r) => r.initiatorType === "script")
              .reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024,
          ),
          cssKb: Math.round(
            all
              .filter((r) => r.initiatorType === "css")
              .reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024,
          ),
        };
      });
      report.resources = resources;

      // Axe-core a11y
      try {
        const a = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        report.a11yViolations = a.violations.length;
        report.a11yPasses = a.passes.length;
      } catch {
        report.a11yViolations = -1;
      }

      // SEO
      report.seo = await page.evaluate(() => ({
        title: document.title || null,
        desc: document.querySelector("meta[name=description]")?.getAttribute("content") || null,
        h1: document.querySelectorAll("h1").length,
        lang: document.documentElement.lang,
        canonical: document.querySelector("link[rel=canonical]")?.getAttribute("href"),
        viewport: document.querySelector("meta[name=viewport]")?.getAttribute("content"),
        ogTitle: document.querySelector("meta[property='og:title']")?.getAttribute("content"),
        ogDesc: document.querySelector("meta[property='og:description']")?.getAttribute("content"),
        imgNoAlt: [...document.querySelectorAll("img:not([alt])")].length,
        hasH1: document.querySelector("h1") !== null,
      }));
    } catch (e) {
      report.error = e.message;
    }

    allResults.push(report);
    await page.close();

    // Print line
    const fcp = report.fcp !== null ? `${Math.round(report.fcp)}ms`.padEnd(8) : "N/A".padEnd(8);
    const lcp = report.lcp !== null ? `${Math.round(report.lcp)}ms`.padEnd(8) : "N/A".padEnd(8);
    const cls = report.cls !== null ? report.cls.toFixed(3).padEnd(8) : "N/A".padEnd(8);
    const a11y = report.a11yViolations !== null ? `${report.a11yViolations}v` : "ERR";
    const err = report.error ? ` ⚠️${report.error.slice(0, 50)}` : "";
    console.log(
      `FCP:${fcp} LCP:${lcp} CLS:${cls} A11y:${a11y} Res:${report.resources.count || 0} ${err}`,
    );
  }

  await browser.close();
  server.close();

  // Save report
  const reportPath = join(REPORT_DIR, "audit-summary.json");
  writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  writeFileSync(join(REPORT_DIR, "audit-summary.txt"), formatSummary(allResults));

  // Print summary
  console.log(formatSummary(allResults));
  console.log(`\nReport saved: ${reportPath}`);
}

function formatSummary(results) {
  const lines = [];
  lines.push("=".repeat(80));
  lines.push("SITE AUDIT SUMMARY — Web Vitals + a11y + SEO + Best Practices");
  lines.push("=".repeat(80));
  lines.push(`${"Route".padEnd(28)} FCP      LCP      CLS      A11y  Resources`);

  let valid = results.filter((r) => !r.error);
  let accFcp = [],
    accLcp = [],
    accCls = [],
    a11yTotal = 0;

  for (const r of results) {
    const name = r.route.padEnd(28);
    const fcp = r.fcp !== null ? `${Math.round(r.fcp)}ms`.padEnd(8) : "N/A".padEnd(8);
    const lcp = r.lcp !== null ? `${Math.round(r.lcp)}ms`.padEnd(8) : "N/A".padEnd(8);
    const cls = r.cls !== null ? r.cls.toFixed(3).padEnd(8) : "N/A".padEnd(8);
    const a11y = r.a11yViolations !== null ? `${r.a11yViolations} viol`.padEnd(8) : "ERR".padEnd(8);
    const res = r.resources.count
      ? `${r.resources.count} req / ${r.resources.totalKb} kb`.padEnd(16)
      : "N/A".padEnd(16);
    const err = r.error ? ` ERROR: ${r.error}` : "";
    const seoWarn = r.seo?.imgNoAlt > 0 ? ` [${r.seo.imgNoAlt} img w/o alt]` : "";
    lines.push(`${name} ${fcp} ${lcp} ${cls} ${a11y}${res}${err}${seoWarn}`);
    if (!r.error) {
      if (r.fcp !== null) accFcp.push(r.fcp);
      if (r.lcp !== null) accLcp.push(r.lcp);
      if (r.cls !== null) accCls.push(r.cls);
      a11yTotal += r.a11yViolations ?? 0;
    }
  }

  lines.push("-".repeat(80));
  if (accFcp.length) {
    const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
    lines.push(
      `AVERAGE (${valid.length} routes, no errors): FCP ${avg(accFcp)}ms | LCP ${avg(accLcp)}ms | CLS ${avg(accCls).toFixed(3)} | A11y ${Math.round(a11yTotal / valid.length)}v/r`,
    );
  }

  const p75 = (a) => {
    const s = [...a].sort((x, y) => x - y);
    return s[Math.floor(s.length * 0.75)];
  };
  if (accLcp.length) {
    lines.push(
      `p75 LCP: ${Math.round(p75(accLcp))}ms | Max LCP: ${Math.round(Math.max(...accLcp))}ms`,
    );
  }

  const consoleErrors = results.reduce((s, r) => s + r.consoleErrors.length, 0);
  const imagesNoAlt = results.reduce((s, r) => s + (r.seo?.imgNoAlt ?? 0), 0);
  const routesWithTitle = results.filter((r) => r.seo?.title).length;

  lines.push(`\nBest Practices: ${consoleErrors} console errors across all routes`);
  lines.push(
    `SEO: ${routesWithTitle}/${results.length} routes have <title> | ${imagesNoAlt} <img> without alt`,
  );
  lines.push(`All routes have <h1>: ${results.every((r) => r.seo?.hasH1)}`);
  lines.push(`All routes have lang: ${results.every((r) => r.seo?.lang)}`);

  const allClean = results.every(
    (r) => !r.error && (r.a11yViolations ?? 0) === 0 && r.seo?.title && r.seo?.imgNoAlt === 0,
  );
  lines.push(`\nOverall: ${allClean ? "✅ PASS" : "⚠️  Needs attention"}`);

  return lines.join("\n");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
