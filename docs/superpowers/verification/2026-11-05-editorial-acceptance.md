# Editorial implementation acceptance

Started: 2026-11-10.
Status: **Read implementation verified; independent review pending. Watch deferred by user decision.**

- [x] Native execution authorized; user chose an isolated worktree.
- [x] Baseline dependencies installed without changing application manifests/lockfiles; Read later added Studio test tooling only.
- [x] Baseline: 85 frontend tests, both linters/builds, frontend typecheck.
- [x] Before-change desktop/mobile snapshots of Projects, Community, and existing article detail.
- [x] Figma sliding-navigation and leftward thumbstrip geometry reconfirmed.
- [x] Requested plugin examined against the exact original Studio lockfile; incompatible peers documented.
- [x] User selected **Read implementation first**; no compatibility port was authorized.
- [x] Task 2: shared content validation/extraction, RED → GREEN.
- [x] Task 3 Read slice: singleton, ordered three-feature selection, preview validation, optional article type, generated types.
- [x] Task 4 Read slice: published queries and normalized summaries; only rendered features excluded from archive.
- [x] Task 5: characterization tests before opt-in shared-filter changes.
- [x] Tasks 6–7: Read layout/year filter and deterministic cursor-following hover.
- [x] Task 8 Read slice: header, Editorial/Read menu links, article Read breadcrumb.
- [x] Task 12 Read slice: route, regression and responsive/browser acceptance.
- [ ] Deferred: plugin adoption, Watch/video schemas/queries, animated cross-route switch/provider, Watch chrome, Tasks 9–11 and Watch route.
- [ ] Blocked: live editor save/reorder/publish/revalidation checks need an authorized nonproduction dataset. Fixtures do not prove launch content readiness.
- [ ] Deferred Watch validation additionally requires a restricted API key and compatible input decision.
- [ ] Final independent review and any test-first important fixes.

No content writes, deployment, or production configuration changes were performed. `/read/[slug]` remains in its original location; its existing content query and detail layout were not replaced.

## Final automated verification (Read slice)

All commands below completed with exit 0 on 2026-11-10:

| Command | Evidence |
| --- | --- |
| `pnpm -C sanity test` | 12 tests passed. |
| `pnpm -C sanity typegen` | 20 queries / 34 schema types; no new generated diffs. |
| `pnpm -C sanity lint` | No errors. |
| `pnpm -C sanity exec tsc --noEmit` | No errors. |
| `pnpm -C sanity build` | Studio built successfully. |
| `pnpm -C client test --runInBand` | 21 suites / 114 tests passed, including original regression suites. |
| `pnpm -C client lint` | No errors. |
| `pnpm -C client typecheck` | TypeGen and TypeScript passed. |
| `pnpm -C client build` | `/read` prerendered with 30-second revalidation; detail route retained; no fixture/Watch route shipped. |
| `git diff --check` | No whitespace errors. |

Logs: `.superpowers/sdd/2026-11-05-editorial-read-watch/final-*.log` (local execution workspace). Existing nonblocking baseline-browser-mapping age warning remains unchanged.

## Browser and regression evidence

Server: `http://localhost:3000`. Evidence directory: `/tmp/opencode/editorial-acceptance/`.

- Live `/read` at 1440/768/440/375px: correct title and heading, 232px nav, unavailable Watch label, one global footer, no horizontal overflow (`read-live-<width>.png`).
- Desktop actual year selection: 2026 → 2025 yielded Quadrophonic Landscapes; activating the article opened its existing detail with title/body/hero/author/related content. Activating its Read breadcrumb returned to `/read` with one footer.
- Actual keyboard Enter on the 2021 year button selected it and showed An Introduction to Feedback. Mobile/touch emulation at 440px selected 2025, retained the exact article URL, and mounted no floating image (`read-live-mobile-2025.png` / `.txt`).
- No published Read singleton is currently authored: the actual public response has zero features and three archive summaries (2026/2025/2021). The page intentionally does not invent features. Three-feature layout/preview checks used local typed fixtures without content writes.
- Temporary development-only fixture routes were removed before commits. Fixture images show 584px desktop cards and 392×323px mobile cards; 1440/768/440/375px widths had no horizontal overflow. Both opening-text and loaded hero-image focus previews were inspected (`read-fixtures-*.png`). One/two/three/zero entries are covered by component tests.
- Fine-pointer preview at 1440/768px: x follows pointer, top remains row-anchored, stable ID-derived tilt, rotated bounds remain within 16px viewport margins; scroll dismisses. Coarse-pointer 440/375px shows no portal; reduced motion centers the preview with zero rotation (`read-hover-right-edge.png`). Unit tests cover blur, year change, refreshed records, and animation cleanup.
- Existing Projects default/year2025 remained 99→13 and Community default/letterA remained 105→17 at 1440/440px after the shared filter change (`art-and-technology-*`, `community-*`). Default consumer JSX/source behavior remains unchanged; automated filter selection/removal regressions pass.
- Existing article desktop/mobile baseline screenshots remain under `/tmp/opencode/editorial-baseline/`; the completed real navigation check confirms that route still resolves. These are behavioral/visual checks, not a claim of pixel-identical live content.

## Decisions and limitations

- Read-only slices are not full completion of original Tasks 3/4/8/12. Watch animation, thumbnails, player/modal and editor checks have not run and are not implemented.
- Watch is visibly unavailable instead of linking to an unfinished route. Global Footer/root layout remain unchanged.
- Miller Text still uses the existing Georgia fallback until licensed fonts are supplied.
- Turbopack source root includes the repository so both applications can consume `shared/editorial`; a runtime HTTP500 before that correction became HTTP200 afterward.
- Studio tests added `tsx`, Node types, and compatible `@types/react-dom@19.2.3`; no YouTube dependency, downgrade, or forced peers were adopted. Inert `__tests__/fixtures` files are excluded from Jest suite discovery.

## Figma geometry/timing evidence

Re-read component sets `4259:7310` and `4062:2134`. Navigation is a 232×35px clipped track, with 100px cells, 16px gaps, and variant translation 0 → -116px. Video thumbnails are 248×164px at the reference size, with a fixed 4px-wide playhead at x=102px and first strip translation 0 → -248px. The visible component data does not expose verified prototype timing/easing, so 300ms ease-in-out navigation and 6000ms per thumbnail linear progression remain documented fallback values, not claimed Figma timings. The synchronized `4311:9308` states were already recorded in research; no completed research was discarded after the restart.

The geometry/timing above concerns deferred Watch work; no cross-route animation is claimed for Read-only delivery. See adjacent baseline/plugin records for the unsupported plugin peer graph and unapproved compatibility proposal.
