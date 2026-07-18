# Run doc — preview server for thread `thmrme7j7qvya8`

> **Procedures only.** No secrets. No URLs with tokens. No `.env.local` values.

## State of the world (validated 2026-07-17)

- **Primary checkout** (where source + dependencies live):
  `/home/alexendros/projects/website-alexendrosme`
  - Git repo, branch `main` at `4c169d4 feat(scripts): add hydration-warning-audit standalone Playwright tool`.
  - Has `package.json` + `node_modules/` (✓ ready, no install needed).
  - Has uncommitted modifications + ~8 untracked new files (lib/theme-_.ts, adr/0003/0004, **tests**/lib/theme-_.test.ts). These are real working-tree changes from prior interrupted work — `next dev` builds over them fine; do **not** auto-clean.
- **Worktree subdir intended by Freebuff** (`/home/alexendros/projects/website-alexendrosme/.freebuff/worktrees/thmrme7j7qvya8`):
  - **NOT a real `git worktree`** — it is an empty subdirectory inside the primary checkout's working tree, containing only a leftover `.next/` cache from a prior run. `git worktree add` cannot register it as a new worktree because the path is already inside primary's tree.
  - Git commands executed from inside this path resolve to primary's HEAD, not a worktree-specific one. Do **not** try `git restore`/`git checkout -- .` from inside it — they will fail with "ruta no concuerda con ningún archivo".
  - **Cleanup option** (out of scope of just running the preview):
    `git -C /home/alexendros/projects/website-alexendrosme worktree prune` doesn't apply since this path was never registered. To repurpose, `rm -rf .freebuff/worktrees/thmrme7j7qvya8/ && git worktree add .freebuff/worktrees/thmrme7j7qvya8 <branch>` from primary — but only do this if you actually want a separate worktree.

## How to reproduce the artifacts a fresh checkout needs

| Step                                                                                       | Command                                                                                           | Notes                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Identify primary checkout                                                               | `ls -la /home/alexendros/projects/website-alexendrosme/package.json`                              | This thread's CWD-as-worktree is a stale orphan; the actual server root is primary.                                                                                                          |
| 2. Verify deps                                                                             | `test -d /home/alexendros/projects/website-alexendrosme/node_modules`                             | If absent: `cd /home/alexendros/projects/website-alexendrosme && npm install` (~30 s).                                                                                                       |
| 3. Verify Node + npm versions                                                              | `node --version` (≥ 22 required by `engines.node`) and `npm --version` (10 per `packageManager`). |                                                                                                                                                                                              |
| 4. Pick a free port                                                                        | `for p in 3000 3001 3002; do lsof -i:$p 2>/dev/null && echo "$p taken"                            |                                                                                                                                                                                              | echo "$p free"; done` | Other workspaces can already occupy `:3000` and `:3001`; the convention in this repo is to escalate to the next free port. **Never assume `:3000` is free.** |
| 5. (Optional) Copy `.env.local` from primary if your worktree hosted the server separately | `cp /home/alexendros/projects/website-alexendrosme/.env.local /path/to/worktree/.env.local`       | **Never symlink.** Values such as ports may need adapting per worktree. As of 2026-07-17 neither primary nor any worktree has `.env.local` — Vercel Analytics env (if any) is set elsewhere. |

## How to run the server (DETACHED)

From the directory that actually has `package.json` + `node_modules/' (primary in the current state):

```bash
PRIMARY=/home/alexendros/projects/website-alexendrosme
LOG=/home/alexendros/projects/website-alexendrosme/.freebuff/preview-thmrme7j7qvya8.log
PORT=3002           # pick the first free port from step 4 above

cd "$PRIMARY"
( nohup npm run dev -- -p "$PORT" > "$LOG" 2>&1 & echo $! )
```

Then poll until `200`. The script does ~45 probes × 2 s = 90 s ceiling.

```bash
for i in $(seq 1 45); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:$PORT/")
  if [ "$CODE" = "200" ]; then echo "READY after $i probes"; break; fi
  sleep 2
done
```

Finally, register the preview from outside the script (in the parent Freebuff tool surface), passing the printed PID and `http://localhost:$PORT/`.

## Live state (mid-2026-07-17)

- Active server: `npm run dev -- -p 3002` running under PID `326737`
  (`test -d /proc/326737` confirms alive at the time of writing).
- URL: `http://localhost:3002/`
- Log file: `/home/alexendros/projects/website-alexendrosme/.freebuff/preview-thmrme7j7qvya8.log`
- Turbopack reports `✓ Ready in 519ms`; first GET `/` served in 754 ms.

## Notes specific to this thread's quirks

- **Why port 3000 was skipped**: `lsof -i :3000` returned `node 275923 alexendros ... TCP *:3000 (LISTEN)` at the time of the preview restart. That process is unrelated to this thread (the previous preview at PID 171093 has exited per Freebuff's preview_state). Do not `kill 275923` without confirming intent — it could belong to another running task.
- **Why port 3001 was also skipped**: another `node 2670 alexendros ... TCP localhost:3001 (LISTEN)`. Same caveat.
- **Why the worktree path is unused for source**: the intent of `.freebuff/worktrees/<thread-id>/` in Freebuff is presumably a per-thread scratch dir. In this corpus the path is an empty subdir; git commands inside it resolve to primary. If you want a real separate worktree, prune and re-add as documented in "State of the world" above.
- **The dev server is rooted at primary by design**: it serves whatever HEAD has, including the uncommitted modifications and untracked files. Do not commit or revert them from inside the server lifecycle.
