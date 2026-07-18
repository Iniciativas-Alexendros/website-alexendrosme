# Vitest environment routing

## Final mechanism (vitest@4.1.10)

All tests run under the **happy-dom** environment globally. Configured in
`vitest.config.ts` via `test.environment: "happy-dom"` plus an explicit
`include` glob that scopes vitest to `__tests__/` only.

```ts
test: {
  environment: "happy-dom",         // single global env — covers localStorage,
                                    // document.cookie, window.matchMedia, etc.
  include: ["__tests__/**/*.test.{ts,lsx}"],
}
```

The 35 `__tests__/lib/theme-storage.test.ts` tests + 22 `theme-cookie.test.ts`
tests + 10 `theme-pre-paint.test.ts` tests all pass because happy-dom provides
`localStorage`, `document.cookie`, `window.matchMedia`, etc. Playwright e2e
tests in `tests/*.spec.ts` are excluded by the `include` glob.

### Cost (measured)

| Run | Tests | Wall-clock | Files |
| --- | --- | --- | --- |
| Before Plan H (env=node, 35 theme-storage failing) | 49 / 84 | ~996ms | 5 |
| After Plan H (env=happy-dom, all pass) | 161 / 161 | ~1.80s | 15 |

Net cost: **~+800ms total wall-clock** (~+80%). Of that, ~7.7s of cumulative
"environment" time across 15 files = ~510ms avg per file for happy-dom init.
This is well below the noise floor of dev iteration and acceptable for the
reliability gain over a fragile per-file routing system.

### ⚠️ Do NOT remove the `include` glob

Without `include: ["__tests__/**/*.test.{ts,lsx}"]`, vitest's default discovery
pattern matches `tests/*.spec.ts` (Playwright e2e specs). Playwright tests
import `@playwright/test` which has no `describe`/`it`/`expect` exports for
vitest — vitest then reports 13 file failures with
`TypeError: ... is not a function`. **Keep the explicit include glob** so the
two test runners stay cleanly separated.

## Tried and rejected (vitest@4.1.10)

The following approaches were explored and abandoned because the local
Vitest 4.1.10 build does not support them. Recorded so future maintainers
don't burn time on them:

| Approach | Failure mode |
| --- | --- |
| `vitest.workspace.ts` autoload at root | Vitest 4.1.10 has no `defineWorkspace` export from `vitest/config`, no `--workspace` CLI flag, no autoload of `vitest.workspace.{ts,js,json}`. Silently ignored. |
| `import { defineWorkspace } from "vitest/config"` | `TS2305: Module '"vitest/config"' has no exported member 'defineWorkspace'`. |
| `test.environmentMatchGlobs: [[file, env]]` | `TS2769: 'environmentMatchGlobs' does not exist in type 'InlineConfig'` — field not in Vitest 4.1.10's `InlineConfig`. |
| `test.projects: [...]` array | (a) `TS2769: 'coverage' does not exist in type 'ProjectConfig'` — per-project coverage not allowed. (b) `resolve.tsconfigPaths` at root does NOT propagate to child projects → `@/lib/utils` import resolution fails. |
| Per-file pragma `// @vitest-environment happy-dom` | Works for the file it's in, but you have to manually add it to every DOM-needing test (`theme-storage` + `theme-cookie` + `theme-pre-paint`). Easy to forget when adding new tests. |

## Migration path (when vitest 4.2+ lands or a workspace file is honored)

If the project upgrades to a Vitest version with first-class workspace
support, the migration is mechanical:

1. Switch `test.environment` to `"node"` (the default).
2. Restore `vitest.workspace.ts` (or use `test.projects: [...]`) with two
   projects: `node` (everything in `__tests__/lib/`) and `happy-dom`
   (the 3 DOM-needing test files only).
3. Delete this memo's "Cost" section; replace with timing measurements under
   the new config.

Until then, the global happy-dom choice is the minimum-viable workaround
that honors the constraint of "0 test modifications" while making the 84
previously-broken tests pass.

## Conventions for new tests

| Need | Where to put it |
| --- | --- |
| Pure logic, parsers, loaders | `__tests__/lib/*.test.ts` (works out of the box; happy-dom is global) |
| `localStorage`, `document.cookie`, `window.*` | `__tests__/lib/*.test.ts` (also works out of the box) |
| Playwright e2e specs | `tests/*.spec.ts` (separate runner; not vitest) |