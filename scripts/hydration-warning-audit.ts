#!/usr/bin/env node
/**
 * scripts/hydration-warning-audit.ts
 *
 * Standalone Playwright audit: opens chromium, navigates configured routes
 * with strict console capture, dumps everything (warnings, errors,
 * pageerrors, hydration-class markers) to a JSON artifact. Two use
 * cases:
 *
 *   (a) Pre/post audit before large tech migrations — Next.js minor,
 *       React minor, Tailwind v5, Radix major. Diff the totals/
 *       per-route counts between two runs.
 *   (b) CI gate — `npm run audit:hydration -- --fail-on-warning` exits
 *       non-zero when hydration-class warnings are detected, so a PR
 *       that quietly adds a hydration mismatch can't merge.
 *
 * Pairs with any dev server reachable on BASE_URL (default
 * http://localhost:3000): `next dev`, `npx serve out -l 3000`, etc.
 * The script does NOT spawn a webServer itself — it expects the caller
 * to have one ready (mirrors the role of the audit in the migration
 * workflow).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type ConsoleMessage, type Page } from "@playwright/test";

const DEFAULT_ROUTES = [
  "/",
  "/espensar",
  "/esposible",
  "/legal/cookies",
  "/legal/seguridad",
  "/legal/aviso-legal",
  "/legal/privacidad",
] as const;

// Same regex as tests/no-hydration-warning.spec.ts so the bar for
// "hydration-class warnings" stays consistent across the suite.
const HYDRATION_REGEX = /(hydration|hydrat|did not match|Text content does not match|server HTML)/i;

const SCRIPT_VERSION = "1.0.0";

interface CliArgs {
  readonly baseUrl: string;
  readonly out: string;
  readonly failOnWarning: boolean;
  readonly routes: ReadonlyArray<string>;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly navTimeoutMs: number;
  readonly idleGutterMs: number;
}

interface ConsoleEntry {
  readonly type: string;
  readonly text: string;
  readonly location: { readonly url: string | null; readonly lineNumber: number | null };
  readonly isHydrationRelated: boolean;
}

interface PageErrorEntry {
  readonly message: string;
  readonly stack: string | null;
}

interface RouteReport {
  readonly url: string;
  readonly durationMs: number;
  readonly status: "ok" | "failed";
  readonly navigationError: string | null;
  readonly console: ReadonlyArray<ConsoleEntry>;
  readonly pageErrors: ReadonlyArray<PageErrorEntry>;
}

interface AuditTotals {
  readonly routes: number;
  readonly routesOk: number;
  readonly routesFailed: number;
  readonly warnings: number;
  readonly errors: number;
  readonly pageErrors: number;
  readonly hydrationWarnings: number;
  readonly durationMs: number;
}

interface AuditReport {
  readonly metadata: {
    readonly generatedAt: string;
    readonly tool: string;
    readonly version: string;
    readonly baseUrl: string;
    readonly viewport: { readonly width: number; readonly height: number };
    readonly navTimeoutMs: number;
    readonly idleGutterMs: number;
    readonly routes: ReadonlyArray<string>;
    readonly userAgent: string;
  };
  readonly totals: AuditTotals;
  readonly routes: ReadonlyArray<RouteReport>;
}

function printHelp(): void {
  process.stdout.write(
    [
      `hydration-warning-audit v${SCRIPT_VERSION}`,
      ``,
      `Usage: tsx scripts/hydration-warning-audit.ts [flags]`,
      ``,
      `Flags:`,
      `  --base-url <url>         Target origin. Defaults to $BASE_URL or http://localhost:3000.`,
      `  --out <path>             Output JSON path (relative to cwd). Default: artifacts/hydration-report.json.`,
      `  --include <route>        Add a route to the default audit set. Repeatable.`,
      `  --exclude <route>        Drop a route from the default audit set. Repeatable.`,
      `  --routes <a,b,c>         Replace the default route set with a comma-separated list.`,
      `  --viewport <W>x<H>       Viewport for chromium (default 1440x900).`,
      `  --nav-timeout <ms>       Per-route navigation timeout (default 30000).`,
      `  --idle-gutter <ms>       Wait AFTER networkidle to flush deferred console msgs (default 1500).`,
      `  --fail-on-warning        Hydration-CLASS only: exit 1 if any console msg matches the hydration regex.`,
      `  --help, -h               Print this message.`,
      ``,
      `Default routes:`,
      ...DEFAULT_ROUTES.map((r) => `  ${r}`),
      ``,
    ].join("\n"),
  );
}

function parseArgs(argv: ReadonlyArray<string>): CliArgs {
  let baseUrl = process.env["BASE_URL"] ?? "http://localhost:3000";
  let out = "artifacts/hydration-report.json";
  let failOnWarning = false;
  let viewport = { width: 1440, height: 900 };
  let navTimeoutMs = 30_000;
  let idleGutterMs = 1_500;
  let routes: ReadonlyArray<string> = [...DEFAULT_ROUTES];

  const consumeValue = (key: string): string | undefined => {
    const eqPrefix = `${key}=`;
    const cur = argv[i];
    if (cur === undefined) return undefined;
    if (cur === key) {
      const next = argv[++i];
      return next;
    }
    if (cur.startsWith(eqPrefix)) {
      return cur.slice(eqPrefix.length);
    }
    return undefined;
  };

  let i = 0;
  for (; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) break;

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--fail-on-warning") {
      failOnWarning = true;
      continue;
    }

    const baseUrlV = consumeValue("--base-url");
    if (baseUrlV !== undefined) {
      baseUrl = baseUrlV;
      continue;
    }
    const outV = consumeValue("--out");
    if (outV !== undefined) {
      out = outV;
      continue;
    }
    const viewportV = consumeValue("--viewport");
    if (viewportV !== undefined) {
      const [wStr, hStr] = viewportV.split("x");
      const w = Number.parseInt(wStr ?? "", 10);
      const h = Number.parseInt(hStr ?? "", 10);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        viewport = { width: w, height: h };
      } else {
        process.stderr.write(`Invalid --viewport (expected WxH): ${viewportV}\n`);
        process.exit(2);
      }
      continue;
    }

    if (arg === "--include") {
      const next = argv[++i];
      if (next === undefined) {
        process.stderr.write(`--include requires a route argument\n`);
        process.exit(2);
      }
      routes = [...routes, next];
      continue;
    }
    const includeV = consumeValue("--include");
    if (includeV !== undefined) {
      routes = [...routes, includeV];
      continue;
    }

    if (arg === "--exclude") {
      const next = argv[++i];
      if (next === undefined) {
        process.stderr.write(`--exclude requires a route argument\n`);
        process.exit(2);
      }
      routes = routes.filter((r) => r !== next);
      continue;
    }
    const excludeV = consumeValue("--exclude");
    if (excludeV !== undefined) {
      routes = routes.filter((r) => r !== excludeV);
      continue;
    }

    if (arg === "--routes") {
      const next = argv[++i];
      if (next === undefined) {
        process.stderr.write(`--routes requires a comma-separated list\n`);
        process.exit(2);
      }
      routes = next
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      continue;
    }
    const routesV = consumeValue("--routes");
    if (routesV !== undefined) {
      routes = routesV
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      continue;
    }

    const navTimeoutV = consumeValue("--nav-timeout");
    if (navTimeoutV !== undefined) {
      const n = Number.parseInt(navTimeoutV, 10);
      if (Number.isFinite(n) && n > 0) navTimeoutMs = n;
      continue;
    }
    const idleGutterV = consumeValue("--idle-gutter");
    if (idleGutterV !== undefined) {
      const n = Number.parseInt(idleGutterV, 10);
      if (Number.isFinite(n) && n >= 0) idleGutterMs = n;
      continue;
    }

    process.stderr.write(`Unknown flag: ${arg}\n`);
    process.exit(2);
  }

  return { baseUrl, out, failOnWarning, routes, viewport, navTimeoutMs, idleGutterMs };
}

async function auditRoute(
  page: Page,
  baseUrl: string,
  route: string,
  navTimeoutMs: number,
  idleGutterMs: number,
): Promise<RouteReport> {
  const consoleEntries: ConsoleEntry[] = [];
  const pageErrors: PageErrorEntry[] = [];
  let navigationError: string | null = null;
  let status: "ok" | "failed" = "ok";

  const consoleHandler = (msg: ConsoleMessage): void => {
    const type = msg.type();
    if (type !== "warning" && type !== "error") return;
    const loc = msg.location();
    consoleEntries.push({
      type,
      text: msg.text(),
      location: {
        url: loc.url ?? null,
        lineNumber: Number.isFinite(loc.lineNumber) ? loc.lineNumber : null,
      },
      isHydrationRelated: HYDRATION_REGEX.test(msg.text()),
    });
  };
  const pageErrorHandler = (err: Error): void => {
    pageErrors.push({ message: err.message, stack: err.stack ?? null });
  };

  page.on("console", consoleHandler);
  page.on("pageerror", pageErrorHandler);

  const startMs = Date.now();
  try {
    const url = new URL(route, baseUrl).toString();
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: navTimeoutMs,
    });
    if (!response) {
      status = "failed";
      navigationError = "no-response";
    } else if (!response.ok()) {
      status = "failed";
      navigationError = `HTTP ${response.status()}`;
    }
    await page.waitForLoadState("networkidle", { timeout: navTimeoutMs }).catch(() => undefined);
    if (idleGutterMs > 0) {
      await page.waitForTimeout(idleGutterMs);
    }
  } catch (err) {
    status = "failed";
    navigationError = err instanceof Error ? err.message : String(err);
  } finally {
    page.off("console", consoleHandler);
    page.off("pageerror", pageErrorHandler);
  }

  return {
    url: route,
    durationMs: Date.now() - startMs,
    status,
    navigationError,
    console: consoleEntries,
    pageErrors,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: args.viewport });
  const page = await context.newPage();

  const userAgent = await page.evaluate(() => navigator.userAgent);
  const generatedAt = new Date().toISOString();
  const startedMs = Date.now();
  const reports: RouteReport[] = [];

  for (const route of args.routes) {
    const report = await auditRoute(
      page,
      args.baseUrl,
      route,
      args.navTimeoutMs,
      args.idleGutterMs,
    );
    reports.push(report);
    const hydrationInRoute = report.console.filter((c) => c.isHydrationRelated).length;
    const statusGlyph = report.status === "ok" ? "✓" : "✗";
    process.stdout.write(
      `${statusGlyph} ${route} — ${report.console.length} console (${hydrationInRoute} hydration-class), ${report.pageErrors.length} pageErrors, ${report.durationMs}ms\n`,
    );
  }

  await context.close();
  await browser.close();

  const totals: AuditTotals = {
    routes: reports.length,
    routesOk: reports.filter((r) => r.status === "ok").length,
    routesFailed: reports.filter((r) => r.status === "failed").length,
    warnings: reports.reduce((s, r) => s + r.console.filter((c) => c.type === "warning").length, 0),
    errors: reports.reduce((s, r) => s + r.console.filter((c) => c.type === "error").length, 0),
    pageErrors: reports.reduce((s, r) => s + r.pageErrors.length, 0),
    hydrationWarnings: reports.reduce(
      (s, r) => s + r.console.filter((c) => c.isHydrationRelated).length,
      0,
    ),
    durationMs: Date.now() - startedMs,
  };

  const audit: AuditReport = {
    metadata: {
      generatedAt,
      tool: "hydration-warning-audit",
      version: SCRIPT_VERSION,
      baseUrl: args.baseUrl,
      viewport: args.viewport,
      navTimeoutMs: args.navTimeoutMs,
      idleGutterMs: args.idleGutterMs,
      routes: args.routes,
      userAgent,
    },
    totals,
    routes: reports,
  };

  const outPath = path.resolve(process.cwd(), args.out);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(audit, null, 2)}\n`, "utf-8");

  process.stdout.write(`\nWrote ${outPath}\n`);
  process.stdout.write(
    `  ${totals.routes} routes · ${totals.warnings} warnings · ${totals.errors} errors · ${totals.pageErrors} pageErrors · ${totals.hydrationWarnings} hydration-class\n`,
  );

  if (args.failOnWarning && totals.hydrationWarnings > 0) {
    process.stderr.write(
      `\nFAIL: ${totals.hydrationWarnings} hydration-class warning(s) detected. See ${outPath}\n`,
    );
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? `${err.stack ?? err.message}` : String(err);
  process.stderr.write(`${msg}\n`);
  process.exit(1);
});
