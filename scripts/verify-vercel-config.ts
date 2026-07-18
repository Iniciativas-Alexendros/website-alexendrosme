/**
 * verify-vercel-config.ts
 *
 * Checks that the build/install commands in vercel.json are consistent with:
 *  1. package.json scripts (local sanity)
 *  2. Vercel project dashboard settings (via CLI, only if VERCEL_TOKEN is set)
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — local mismatch (vercel.json vs package.json)
 *   2 — remote mismatch (vercel.json vs Vercel dashboard)
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

interface VercelJson {
  buildCommand?: string;
  installCommand?: string;
}

interface PackageJson {
  scripts?: Record<string, string>;
}

// ── Load configs ────────────────────────────────────────────────
const vercel: VercelJson = JSON.parse(readFileSync("vercel.json", "utf-8"));
const pkg: PackageJson = JSON.parse(readFileSync("package.json", "utf-8"));

const buildCmd = vercel.buildCommand;
const installCmd = vercel.installCommand;
const pkgBuild = pkg.scripts?.build;

let exitCode = 0;

// ── 1. Local consistency: vercel.json buildCommand vs package.json ──
if (!buildCmd) {
  console.error("❌ vercel.json: missing 'buildCommand'");
  exitCode = 1;
} else if (pkgBuild && buildCmd !== "npm run build" && buildCmd !== pkgBuild) {
  console.error(
    `❌ vercel.json buildCommand ("${buildCmd}") does not match package.json scripts.build ("${pkgBuild}")`,
  );
  exitCode = 1;
}

// ── 2. Local consistency: vercel.json installCommand vs package.json ──
const validInstallCommands = ["npm ci", "npm install", "pnpm install --frozen-lockfile", "yarn install --frozen-lockfile"];
if (!installCmd) {
  console.error("❌ vercel.json: missing 'installCommand'");
  exitCode = 1;
} else if (!validInstallCommands.includes(installCmd)) {
  console.error(
    `❌ vercel.json installCommand ("${installCmd}") is not a recognized command`,
  );
  exitCode = 1;
}

// ── 3. Remote consistency: vercel.json vs Vercel dashboard ──
// Only runs if VERCEL_TOKEN is set (CI or local with token)
const vercelToken = process.env.VERCEL_TOKEN;
const vercelOrgId = process.env.VERCEL_ORG_ID;
const vercelProjectId = process.env.VERCEL_PROJECT_ID;

if (vercelToken && vercelOrgId && vercelProjectId) {
  try {
    const out = execSync(
      `npx vercel project inspect --token "${vercelToken}" --scope alexendros-team 2>&1`,
      { encoding: "utf-8", timeout: 15_000 },
    );

    // Parse the CLI output for build/install commands
    const remoteBuild = extractValue(out, "Build Command");
    const remoteInstall = extractValue(out, "Install Command");

    let remoteExit = 0;

    if (remoteBuild && remoteBuild !== buildCmd) {
      console.error(
        `❌ Remote Build Command ("${remoteBuild}") ≠ vercel.json ("${buildCmd}")`,
      );
      remoteExit = 2;
    } else if (remoteBuild) {
      console.log(`✅ Remote Build Command matches: "${remoteBuild}"`);
    }

    if (remoteInstall && remoteInstall !== installCmd) {
      console.error(
        `❌ Remote Install Command ("${remoteInstall}") ≠ vercel.json ("${installCmd}")`,
      );
      remoteExit = 2;
    } else if (remoteInstall) {
      console.log(`✅ Remote Install Command matches: "${remoteInstall}"`);
    }

    if (remoteExit !== 0) {
      exitCode = remoteExit;
    }
  } catch (err) {
    console.warn(
      `⚠️  Could not verify remote config: ${err instanceof Error ? err.message : String(err)}`,
    );
    console.warn("   Skipping remote check (local checks still apply).");
  }
} else {
  console.log(
    "ℹ️  VERCEL_TOKEN not set — skipping remote Vercel dashboard check.",
  );
  console.log(
    "   Set VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID to enable.",
  );
}

// ── Summary ──
if (exitCode === 0) {
  console.log("\n✅ All vercel.json config checks passed.");
} else {
  console.error(`\n❌ Config check failed with exit code ${exitCode}.`);
}

process.exit(exitCode);

// ── Helpers ──
function extractValue(output: string, label: string): string | null {
  // "Build Command\t\tnpm run build"  or  "Build Command\tnpm run build"
  const re = new RegExp(`${label}[\\t\\s]+([^\\n]+)`);
  const match = re.exec(output);
  return match?.[1]?.trim() ?? null;
}
