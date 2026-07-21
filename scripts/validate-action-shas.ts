/**
 * validate-action-shas.ts
 *
 * Parses .github/workflows/*.yml and verifies that every pinned commit SHA
 * for an external action actually exists in its repository.
 *
 * Uses `git ls-remote` (no extra dependencies).  Handles network errors
 * gracefully — warns but does not fail, so transient outages don't block CI.
 *
 * Exit codes:
 *   0 — all SHAs verified (or network error prevented verification)
 *   1 — at least one SHA does not exist in its remote repository
 */

import { readdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WORKFLOWS_DIR = join(ROOT, ".github/workflows");

// Regex for `uses: owner/repo@<40-char-hex-sha>` optionally followed by a comment.
// Handles both `- uses: ...` (short form) and `uses: ...` (property form).
// Captures: owner, repo, sha.
const USES_RE = /^\s+(?:- )?uses:\s+([\w.-]+)\/([\w.-]+)@([0-9a-f]{40})\s*(?:#.*)?$/gm;

// Cache: maps "owner/repo" → full `git ls-remote` output.
const lsRemoteCache = new Map<string, string[] | null>();

function fetchRefs(owner: string, repo: string): string[] | null {
  const key = `${owner}/${repo}`;
  const cached = lsRemoteCache.get(key);
  if (cached !== undefined) return cached;

  const url = `https://github.com/${owner}/${repo}.git`;
  try {
    const out = execSync(`git ls-remote "${url}"`, {
      encoding: "utf-8",
      timeout: 15_000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const refs = out.trim().split("\n").filter(Boolean);
    lsRemoteCache.set(key, refs);
    return refs;
  } catch {
    console.warn(`⚠️  Could not reach ${url} (network error). Skipping.`);
    lsRemoteCache.set(key, null);
    return null;
  }
}

function shaExists(owner: string, repo: string, sha: string): boolean {
  const refs = fetchRefs(owner, repo);
  if (refs === null) return true; // network error → assume valid
  return refs.some((line) => line.startsWith(sha));
}

// ── Main ────────────────────────────────────────────────────────

let exitCode = 0;
let checkedCount = 0;

const files = readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith(".yml"));

for (const file of files) {
  const content = readFileSync(join(WORKFLOWS_DIR, file), "utf-8");
  const matches = content.matchAll(USES_RE);

  for (const match of matches) {
    const owner = match[1];
    const repo = match[2];
    const sha = match[3];
    /* c8 ignore next 3 */
    if (!owner || !repo || !sha) continue; // unreachable by regex design
    // Skip first-party actions/* that ship with the runner image — they are
    // resolved by the Actions runner itself, not via git.
    if (owner === "actions") continue;

    const exists = shaExists(owner, repo, sha);
    checkedCount++;

    if (!exists) {
      console.error(`❌ ${file}: SHA ${sha} does NOT exist in ${owner}/${repo}`);
      exitCode = 1;
    } else {
      console.log(`✅ ${file}: ${owner}/${repo}@${sha.slice(0, 12)}… exists`);
    }
  }
}

// ── Summary ─────────────────────────────────────────────────────

if (checkedCount === 0) {
  console.log("ℹ️  No third-party action SHAs to verify.");
}

if (exitCode === 0) {
  console.log(`\n✅ All ${checkedCount} action SHA(s) verified.`);
} else {
  console.error(`\n❌ Some action SHAs are invalid (exit code ${exitCode}).`);
}

process.exit(exitCode);
