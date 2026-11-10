# Editorial implementation acceptance

Started: 2026-11-10.
Status: **Implementation paused at the approved plugin compatibility gate.**

- [x] Native execution authorized; user chose an isolated worktree.
- [x] Existing dependencies installed without changing application manifests/lockfiles.
- [x] Baseline: 85 frontend tests, both linters/builds, frontend typecheck.
- [x] Before-change desktop/mobile snapshots of Projects, Community, and existing article detail.
- [x] Figma sliding-navigation and leftward thumbstrip geometry reconfirmed.
- [x] Requested plugin examined against the exact original Studio lockfile; incompatible peers documented.
- [ ] User approves the proposed local plugin compatibility port/fork.
- [ ] Task 2: shared content validation/extraction, RED → GREEN.
- [ ] Task 3: Sanity schemas, selection workflow, plugin registration, generated types.
- [ ] Task 4: published queries, normalized DTOs, safe media helpers.
- [ ] Task 5: characterization tests before opt-in shared-filter changes.
- [ ] Tasks 6–7: Read layout/year filter and deterministic cursor-following hover.
- [ ] Task 8: animated switch, links, scoped chrome.
- [ ] Tasks 9–10: synchronized leftward strip, controls, thumbnail precedence/fallback.
- [ ] Task 11: accessible modal/autoplay request and iframe teardown.
- [ ] Task 12: routes, full regression and responsive/browser acceptance.
- [ ] Restricted API key and approved nonproduction dataset for live editor checks.
- [ ] Final independent review and any test-first important fixes.

No product code or shared UI has been changed. No content writes, deployment, or production configuration changes were performed.

## Figma geometry/timing evidence

Re-read component sets `4259:7310` and `4062:2134`. Navigation is a 232×35px clipped track, with 100px cells, 16px gaps, and variant translation 0 → -116px. Video thumbnails are 248×164px at the reference size, with a fixed 4px-wide playhead at x=102px and first strip translation 0 → -248px. The visible component data does not expose verified prototype timing/easing, so 300ms ease-in-out navigation and 6000ms per thumbnail linear progression remain documented fallback values, not claimed Figma timings. The synchronized `4311:9308` states were already recorded in research; no completed research was discarded after the restart.

See the adjacent baseline/plugin records for evidence, warnings, and the pending compatibility proposal.
