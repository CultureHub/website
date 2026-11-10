# Editorial baseline

Captured: 2026-11-10, before product changes.
Plan: `docs/superpowers/plans/2026-11-05-editorial-read-watch.md`.
Base: `b34a57aecfaf4dcd60039cfe0895d2bf53e35c56`.
Workspace: `/home/cameron/.local/share/opencode/worktree/16b3de/editorial-read-watch` (native-managed detached HEAD).

## Automated results

| Command | Result |
| --- | --- |
| `pnpm -C client test --runInBand` | PASS: 13 suites, 85 tests. |
| `pnpm -C client lint` | PASS, exit 0. |
| `pnpm -C client typecheck` | PASS, exit 0; regenerated schema and types without tracked diffs. |
| `pnpm -C client build` | PASS, exit 0; existing App Router routes generated. |
| `pnpm -C sanity lint` | PASS, exit 0 (finished before restart; not repeated). |
| `pnpm -C sanity build` | PASS, exit 0. |
| `git diff --check` | PASS; no product changes. |

Dependency installation used each application's existing frozen lockfile with lifecycle scripts ignored. Actual locked Studio versions are Sanity 5.31.1 / React and React DOM 19.2.3. No new product dependencies were installed.

The server restarted during the first parallel baseline run. Its incomplete test log contains an Events test timeout and no suite completion; the resumed full test run passed all 85 unchanged tests. No test timeout was increased and no product fix was applied. Completed dependency installs and Studio lint were retained, not repeated. Other interrupted commands were rerun to obtain complete results.

Existing warning: `baseline-browser-mapping` data is over two months old. It does not fail these commands and was not updated as unrelated work.

Full command logs live in `.superpowers/sdd/2026-11-05-editorial-read-watch/baseline-*.log` (ignored execution workspace).

## Browser baselines

Server: the unchanged production build at `http://localhost:3000`.
Desktop viewport: 1440 × 1000, DPR 1.
Mobile viewport: 440 × 956, DPR 1, mobile/touch emulation.
Screenshots/snapshots: `/tmp/opencode/editorial-baseline/` (local evidence, not production assets).

| Surface/state | Screenshot files | Observed result |
| --- | --- | --- |
| Project index default | `projects-desktop-default.png`, `projects-mobile-default.png` | `Showing: All (99)`. |
| Project index Year → 2025 | `projects-desktop-2025.png`, `projects-mobile-2025.png` | `Showing: 2025 (13)`; filtering observed on both widths. |
| Community directory default | `community-desktop-default.png`, `community-mobile-default.png` | `Showing: All (105)`. |
| Community Letter → A | `community-desktop-A.png`, `community-mobile-A.png` | `Showing: A (17)`; filtering observed on both widths. |
| Existing article | `article-desktop.png`, `article-mobile.png` | `/read/quadrophonic-landscapes`, title and current article layout preserved. |

Corresponding accessibility snapshots are saved alongside the images. Use these viewport/content states for after-change comparisons, acknowledging that live content may change. Full-page images alone are not proof of deterministic pixel equivalence.

### Existing local-environment behavior

- A first browser run on port 3011 exposed Sanity CORS rejection for project filter requests. Repeating the same interaction on standard origin `http://localhost:3000` worked. No CORS settings or app code were changed; use port 3000 for subsequent browser checks.
- Some image requests returned 500 errors in the initial browser session; do not attribute pre-existing image-loading failures to future editorial changes without reproducing and comparing the exact request.
- The mobile filter closes on scroll as currently implemented. The browser's automatic scroll-to-control can close a newly opened menu; reopen once the viewport settles. This behavior must not be silently redesigned in the shared filter task.
- The first mobile filtered-state wait exceeded 10 seconds, but the following snapshot confirmed `Showing: 2025 (13)`; no repeated selection or source change was needed.

No Sanity documents were created, edited, or published. Reading public content for the baseline did not change the dataset.
