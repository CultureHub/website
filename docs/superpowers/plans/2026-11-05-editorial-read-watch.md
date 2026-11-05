# Editorial Read / Watch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Sanity-managed Read and curated Watch indexes matching the supplied Figma designs without regressing existing indexes or article details.

**Architecture:** Add Read/Watch singletons and reusable video documents, retaining the existing article model. Server routes fetch projected, published content and produce typed display records; focused client components own filters, hover previews, sliding navigation, the synchronized thumbnail strip, and modal playback. Extend shared filter/chrome components only through default-preserving opt-ins.

**Tech Stack:** Next.js 16.0.10, React 19, TypeScript, Tailwind 4, Sanity 5, next-sanity TypeGen, Jest/Testing Library; requested `sanity-plugin-youtube-input` subject to the compatibility gate below.

**Spec:** `docs/superpowers/specs/2026-11-05-editorial-read-watch-design.md` — approved for planning with Figma's **leftward** strip motion under a fixed playhead. Also read `docs/superpowers/specs/2026-11-05-editorial-research.md`.

## Global Constraints

- Keep the existing Next.js 16 / React 19 frontend and Sanity 5 Studio; do not downgrade them or force unsupported plugin peers into the main installation.
- Model Sanity content before rendering it; preserve all existing article fields and `/read/[slug]` behavior except adding the now-working Read breadcrumb link.
- Exactly three unique featured article references; the remaining eligible articles form the year-filterable archive. Watch shows only selected video references, in Studio array order.
- Follow Figma's leftward Watch movement under the stationary playhead; do not implement the superseded rightward/mirrored arrangement.
- Per-feature `image | text`; `previewWordCount` integer 10–150, default 80; optional article types Review / Reflection / Interview.
- Initial index year is the newest nonfeatured year; date descending / `_id` ascending; no All-years button, search, pagination, channel import, livestream scheduling, or video detail route in this slice.
- Prefer saved YouTube metadata and thumbnails; Sanity overrides win. `durationSeconds` is optional manual metadata, not a new enrichment service.
- Keep the existing Sanity API version and 30-second revalidation convention; use a published perspective on the new queries, explicit projections, and generated types.
- Protect Projects and Community with tests and desktop/mobile screenshots **before** shared edits. Do not refactor `ProjectsList`, `ArtistDirectory`, or `Carousel` into a new framework.
- No destructive seed scripts, production writes/drafts, dataset creation, publishing, deployment, or live-data configuration changes without separate authorization. Never run `seed:articles`.
- No credentials in code/chat. A restricted YouTube key and approved nonproduction authoring dataset are prerequisites for live plugin validation, not assumed to exist.
- Native links, keyboard/touch alternatives, reduced-motion support, pause controls, accessible modal focus/dismissal, and player teardown are required.
- No global theme-variable mutation for Watch; one Menu and Footer. Footer's light-blue variant applies only to exact `/watch`; default output elsewhere remains unchanged.
- Use Figma prototype timing when available; otherwise navigation 300ms ease-in-out and strip one thumbnail pitch per 6000ms linear are documented fallback values.

## Review Focus

1. Stale or draft-only feature references must not hide an otherwise published article from the archive — Task 4 tests exclusions against **rendered** feature IDs.
2. A feature beginning with Q&A/image-text or whitespace must produce the real opening text, not an empty preview or subtitle — Task 2 tests traversal/order and schema validation uses the same helper.
3. Missing/unsupported YouTube metadata must not yield guessed max-resolution URLs, unsafe embeds, or an endless fallback loop — Tasks 3, 4, and 10 test ID validation, availability keys, and source changes after load errors.
4. Resize, a hidden-tab interval, user pause, or a changing selected list must not desynchronize the strip and preview or silently resume it — Tasks 9 and 10 test the shared clock and pause-reason composition.
5. Navigating away with an open dialog must stop playback, restore scrolling, and prevent dark/light chrome leaking onto other pages — Tasks 8, 11, and 12 cover route changes and actual browser teardown.

---

## File map and interfaces

Names below are the implementation contract, not suggestions to invent another framework.

| Files | Responsibility |
| --- | --- |
| `shared/editorial/content.ts` | Dependency-free opening-text extraction, word truncation, canonical IDs, and pure content validation shared by Studio and frontend. |
| `sanity/schemaTypes/readPageType.ts`, `videoType.ts`, `watchPageType.ts` | New documents/feature object, previews, field validation. |
| `sanity/schemaTypes/articleType.ts`, `schemaTypes/index.ts`, `structure/index.ts`, `sanity.config.ts` | Add article type; register types/plugin; singleton navigation and duplicate-creation protection. |
| `sanity/package.json`, `sanity/pnpm-lock.yaml`, `sanity/tests/editorial-content.test.ts`, `editorial-schema.test.ts` | Studio test script (`tsx --test tests/*.test.ts`), minimal tooling, pure/schema-contract tests. |
| `sanity/README.md`, `sanity/.env.example` | Restricted-key setup and clearly labeled, authorized nonproduction validation prerequisites. |
| `client/src/sanity/queries.ts`, `editorial-types.ts`, `editorial-data.ts` | Three new queries, narrowed display DTOs, server-only-by-import-location data assembly. Never import `editorial-data.ts` into client components. |
| `sanity/schema.json`, `client/src/sanity/types.ts` | Generated artifacts; never hand-edit. |
| `client/src/util/editorial.ts`, `youtube.ts`, `watch-progress.ts` | Date/year/tilt geometry; safe URLs/duration; deterministic strip progress. |
| `client/src/components/Editorial/FeaturedArticles.tsx`, `ArticleIndex.tsx`, `ArticleHoverPreview.tsx` | Read cards, year-filtered rows, one decorative cursor overlay. |
| `client/src/components/Editorial/EditorialHeader.tsx`, `EditorialNav.tsx`, `EditorialNavigationProvider.tsx`, `editorial.module.css` | Shared header, real sliding links, persistent previous-mode context, scoped animation styles. |
| `client/src/components/Editorial/WatchExplorer.tsx`, `WatchThumbnailStrip.tsx`, `VideoThumbnail.tsx`, `useWatchPlayback.ts` | Curated selection, controls, image fallback, one authoritative progression clock. |
| `client/src/components/Editorial/YouTubeModal.tsx` | User-initiated iframe, modal lifecycle/accessibility and teardown. |
| `client/src/components/Filter/FilterMenu.tsx` | Optional `layout="editorial"` while default `layout="index"` preserves existing markup/classes/behavior. |
| `client/src/components/SiteFooter.tsx`, `Footer.tsx`, `Menu.tsx`, `Article/ArticleHeader.tsx`, `app/layout.tsx` | Narrow chrome/navigation integration. |
| `client/src/app/read/page.tsx`, `client/src/app/watch/page.tsx` | New server entry routes; retain the existing detail file location. |
| `client/__tests__/fixtures/editorial.ts` | Inert factories using real generated/normalized shapes; no Sanity writes or credentials. |
| Temporary, untracked `client/src/app/editorial-preview/page.tsx` | Local development-only fixture host for browser acceptance; delete this task-owned file before commits/builds. No permanent public fixture route. |
| New/extended tests listed under each task | Unit/data/schema/route contracts. |
| `docs/superpowers/verification/2026-11-05-editorial-{baseline,acceptance,plugin}.md` | Recorded evidence, screenshots locations, and blocked checks; not claims based on fixtures. |

### Stable display contracts (Task 4)

In `client/src/sanity/editorial-types.ts`, export:

- `EditorialMode = "read" | "watch"`.
- `EditorialImage = NonNullable<GetArticleIndexQueryResult[number]["heroImage"]>` from generated query types.
- `ArticleSummary`: `{ _id: string; title: string; slug: string; publishDate: string; authorName: string | null; articleType: string | null; heroImage: EditorialImage | null }`.
- `FeaturedArticle extends ArticleSummary`: `{ _key: string; previewMode: "image" | "text"; previewText: string }`.
- `VideoItem`: `{ _key: string; _id: string; youtubeId: string; title: string; description: string; durationSeconds: number | null; thumbnailOverride: EditorialImage | null; thumbnailUrls: string[] }`.
- `ReadData`: `{ heading: string; articleIndexTitle: string; featured: FeaturedArticle[]; articles: ArticleSummary[] }`.
- `WatchData`: `{ heading: string; videos: VideoItem[] }`.

Projection image fields must match in both queries: `asset, hotspot, crop, alt, credits`. Narrow generated nullable values at the assembly boundary; no `as any` fixture escape hatches.

### Dependencies and checkpoints

`1 → 2 → 3 → 4`; `4 → 5 → 6 → 7`; `4 → 8`; `4 → 9 → 10 → 11`; `6,7,8,11 → 12`.

Task 1 must clear the plugin adoption gate before Task 3 registers its schema. If blocked, stop that integration and seek the approval described in the spec; do not bypass it using a fake local `youtubeVideo` definition. Read-only helpers and fixture-driven frontend work can be proposed separately if the user wants progress while that gate remains open.

## Task 1: Record regressions and resolve the plugin adoption gate

**Files:** Create the three verification records named above (acceptance initially a checklist). No product files or main-workspace dependencies change in this task.

**Interfaces:** Consumes the approved spec and Figma nodes. Produces recorded before-change evidence, the chosen measured/fallback animation timings, and a plugin verdict `ADOPT | BLOCKED`; adoption must include supported dependency-resolution evidence, not just a forced successful build.

- [ ] **Step 1: Capture the current baseline before shared changes.** Run `pnpm -C client test --runInBand`, `pnpm -C client lint`, `pnpm -C client typecheck`, `pnpm -C client build`, `pnpm -C sanity lint`, and `pnpm -C sanity build` separately from repository root. Record exact results; the earlier research baseline was 13 suites / 85 passing tests, not a promise that every command passes. Inspect generated diffs from typecheck rather than discard them.
- [ ] **Step 2: Record current browser behavior.** Start `pnpm -C client dev` only if no suitable local server exists. At 1440px and 440px, capture `/art-and-technology` and `/community`, default and filtered states, plus one existing `/read/[slug]` page. Store screenshots under `/tmp/opencode/editorial-baseline/` and record stable content/viewport inputs. Without suitable data, mark the screenshot check blocked rather than changing production to create it.
- [ ] **Step 3: Inspect Figma motion.** Revisit `4259:7310`, `4062:2134`, and `4311:9308`; record any accessible prototype timing/easing. Geometry already established: switch changes by -116px; strip advances by -248px at the reference desktop size beneath a playhead at x=102px. If prototype timing is unavailable, explicitly retain 300ms / 6000ms fallback values.
- [ ] **Step 4: Run the isolated compatibility experiment.** In a disposable directory/worktree, recreate Studio's exact locked Sanity/React versions and try `sanity-plugin-youtube-input@0.2.0` without `--force`, peer overrides, or version downgrades. Check dependency peers, build, schema extraction/TypeGen, and mocked import/error behavior. The published package declares Sanity 3 / React 18 peers, so `BLOCKED` is a valid expected outcome, not a failure to hide.
- [ ] **Step 5: Check real input behavior only when authorized.** With a locally configured restricted key and approved nonproduction dataset, test a normal video, missing description, invalid/private/deleted ID, API quota/network failure, metadata preview, and save/reopen. No available key/dataset means these checks remain blocked. If a fork/local input is needed, return its minimal compatibility proposal for approval before adopting it.
- [ ] **Step 6: Commit evidence only.** `git add docs/superpowers/verification/2026-11-05-editorial-baseline.md docs/superpowers/verification/2026-11-05-editorial-acceptance.md docs/superpowers/verification/2026-11-05-editorial-plugin.md`, then `git commit -m "docs: record editorial baselines and plugin compatibility"`. Do not stage experiment dependencies or credentials.

## Task 2: Add shared content validation and real opening-text extraction

**Files:** Create `shared/editorial/content.ts`, `sanity/tests/editorial-content.test.ts`; modify `sanity/package.json` and its lockfile.

**Interfaces:** Export structural `PreviewBlock` / `PreviewSource` / `FeatureReference` types (only fields needed by these functions), `canonicalId(id: string): string`, `openingText(blocks: readonly PreviewBlock[] | null | undefined): string`, `truncateWords(text: string, limit: number): string`, `validateFeaturedSelection(entries: readonly FeatureReference[] | undefined): true | string`, `validatePreviewSource(mode: "image" | "text", source: PreviewSource | null): true | string`, and `isYoutubeId(value: unknown): value is string`. Keep this module dependency-free and importable from both applications.

- [ ] **Step 1: Add the test runner with this deliverable.** Add Studio dev tooling `tsx@^4.23.15` (matching existing frontend tooling) and `@types/node@^22`, and `"test": "tsx --test tests/*.test.ts"`; do not introduce a second browser-test framework.
- [ ] **Step 2: Write failing content tests.** Use `node:test` / `node:assert/strict`; fixture objects contain only real existing block shapes. Pin these assertions:

```ts
assert.equal(canonicalId('drafts.article-a'), 'article-a')
assert.equal(openingText([
  {_type: 'articleImage'},
  {_type: 'articleText', text: [{_type: 'qa', question: 'Why?', answer: [
    {_type: 'block', children: [{_type: 'span', text: 'Because art matters.'}]},
  ]}]},
  {_type: 'imageText', text: [{_type: 'block', children: [{_type: 'span', text: 'Next.'}]}]},
]), 'Why? Because art matters. Next.')
assert.equal(truncateWords('one  two\nthree four', 3), 'one two three…')
assert.equal(truncateWords('one two three', 3), 'one two three')
assert.notEqual(validateFeaturedSelection([
  {article: {_ref: 'a'}}, {article: {_ref: 'drafts.a'}}, {article: {_ref: 'b'}},
]), true)
assert.equal(isYoutubeId('M7lc1UVf-VE'), true)
assert.equal(isYoutubeId('https://example.com/embed/x'), false)
```

Also test missing/0/2/4 entries, three distinct references, leading whitespace, no spans, null source, no asset in image mode, text mode with Q&A only, image-only content, and ignored pull-quote/credit text. Define exact validation messages in this module and reuse them from schema callbacks.
- [ ] **Step 3: Run the new test red.** `pnpm -C sanity test`; expect the new import/functions missing, not a credential/network failure.
- [ ] **Step 4: Implement the exported helpers.** Walk only `articleText.text` / `imageText.text`, recursively flatten Q&A questions and answer paragraphs in order; collapse whitespace. Reject invalid mode/source and non-integer/nonpositive truncation limits safely; the schema enforces the tighter 10–150 user-facing limit.
- [ ] **Step 5: Run green.** `pnpm -C sanity test` and `pnpm -C sanity exec tsc --noEmit`; record any pre-existing compiler issue separately.
- [ ] **Step 6: Commit the task's exact files.** `git commit -m "feat: add shared editorial content validation"` after staging only those files.

## Task 3: Implement the Sanity editorial model and selected-content workflows

**Files:** Create `sanity/schemaTypes/readPageType.ts`, `videoType.ts`, `watchPageType.ts`, `sanity/tests/editorial-schema.test.ts`, `sanity/.env.example`; modify `sanity/schemaTypes/articleType.ts`, `schemaTypes/index.ts`, `structure/index.ts`, `sanity.config.ts`, `package.json`, `pnpm-lock.yaml`, `README.md`; regenerate `sanity/schema.json` / `client/src/sanity/types.ts`.

**Interfaces:** Produces document schema names `readPage`, `watchPage`, `video`; registered object `featuredArticle` (export from `readPageType.ts`); singleton IDs `readPage`, `watchPage`; field names/types exactly as in the approved spec. The adopted plugin provides `youtubeVideo`; do not reimplement that type behind the user's back.

- [ ] **Step 1: Write failing schema-contract tests.** Import the actual exported schema definitions. Assert field names/type/defaults, optional articleType choices (`review`, `reflection`, `interview` with display labels), ordered reference targets, image hotspot opt-in, and duration integer/minimum rules. Use a minimal recording Rule-chain double to collect/call custom validation callbacks; mocked lookup context returns referenced article source data. Assert duplicate feature references fail even when `_key`/preview settings differ, word counts 9/151 fail while 10/80/150 pass, image-without-asset and text-without-opening-text fail, and absent duration/description do not reject a valid video. Test a lookup rejection yields an actionable validation error, not a thrown Studio render error.
- [ ] **Step 2: Run red.** `pnpm -C sanity test`; expect the new schema imports/contracts to fail.
- [ ] **Step 3: Add schemas and register the proven plugin.** Use the exact fields in the spec and Task 2's helpers; for referenced-feature async validation, fetch `heroImage.asset` and only text-bearing content fields via `context.getClient`, handling missing references and fetch errors. Set text/image conditional validation deliberately, not `hidden` alone. Video `youtube.id` uses `isYoutubeId`; require an effective title. Watch references are unique, strong, and optional/empty-safe. Add only optional `articleType` to old articles. Use `imageField` with `options: {hotspot: true}` locally for `thumbnailOverride`; don't alter the shared helper defaults.
- [ ] **Step 4: Add Studio navigation and setup.** Register both singleton panes and filter their duplicate create templates / `duplicate` action only for the new singleton types. Preserve existing document actions. Always register the adopted plugin type with `youtubeInput({apiKey: process.env.SANITY_STUDIO_YOUTUBE_API_KEY ?? ''})` so schema extraction works without credentials; when the key is absent, make the YouTube import field read-only and describe the missing setup: `Configure SANITY_STUDIO_YOUTUBE_API_KEY to import or refresh a video.` Verify the adopted input honors this read-only state rather than sending unauthenticated imports. Never commit a key value. Pin the adopted dependency/version based on Task 1. Document key restrictions, manual duration, selection/drag ordering, thumbnail override, and live-validation prerequisites in the existing Studio README.
- [ ] **Step 5: Run green and extract.** `pnpm -C sanity test`, `pnpm -C sanity typegen`, `pnpm -C sanity lint`, `pnpm -C sanity build`, `pnpm -C client typecheck`. Required result: all newly added contracts pass; generated schemas include the new names with existing article fields retained, and no forced peer installation. If keys are absent, CLI builds must remain possible without fetching YouTube.
- [ ] **Step 6: Validate the editor workflow in the approved test dataset when available.** Test creating/selecting/reordering exactly three features, switching preview mode/length, publishing validation, selecting only some videos, and save/reopen of overrides. Record a blocked live check if prerequisites are absent; don't publish production just to prove the workflow.
- [ ] **Step 7: Commit only these schema/config/docs/tests/generated files.** `git commit -m "feat: model read and curated watch content in Sanity"`.

## Task 4: Add published queries, display normalization, and safe media helpers

**Files:** Modify `client/src/sanity/queries.ts`, regenerate both TypeGen artifacts; create `client/src/sanity/editorial-types.ts`, `editorial-data.ts`, `client/src/util/editorial.ts`, `youtube.ts`, `client/__tests__/fixtures/editorial.ts`, `client/__tests__/sanity/editorial-data.test.ts`, `client/__tests__/util/editorial.test.ts`, `youtube.test.ts`.

**Interfaces:** The DTOs in the file map; queries `getReadPage()`, `getArticleIndex(excludedIds: string[])`, `getWatchPage()`; assembly `getReadData(): Promise<ReadData>` / `getWatchData(): Promise<WatchData>`; helpers `articleYear(date: string): string | null`, `formatEditorialDate(date: string): string`, `getArticleTilt(id: string): number`, `clampPreviewX(cursorX: number, previewWidth: number, viewportWidth: number, padding?: number): number`, `youtubeThumbnailUrls(id: string, sizes: readonly string[]): string[]`, `youtubeEmbedUrl(id: string): string | null`, `formatVideoDuration(seconds: number | null): string | null`.

- [ ] **Step 1: Write failing data/media tests with mocked `client.fetch`.** Assert query parameters include published perspective, existing revalidation, exclusion IDs, and reference order. Source data has 3 valid features, one stale configured reference, and archive articles across 2024/2025/2026. Assert stale/draft-only refs are skipped and only rendered IDs are excluded; invalid dates/slugs/titles never reach typed output. Empty singleton produces default heading and all eligible archive summaries; Watch never calls an all-video fallback. Preserve `_key` from feature/reference arrays. Blank overrides fall back to saved metadata; invalid video IDs are omitted. Queries/tests must not return article bodies for archive rows.

```ts
expect(youtubeThumbnailUrls('M7lc1UVf-VE', ['medium', 'high'])).toEqual([
  'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
  'https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg',
])
expect(youtubeThumbnailUrls('bad/id', ['maxres'])).toEqual([])
expect(youtubeEmbedUrl('bad/id')).toBeNull()
expect(formatVideoDuration(4205)).toBe('1:10:05')
expect(formatVideoDuration(null)).toBeNull()
expect(getArticleTilt('a')).toBe(getArticleTilt('drafts.a'))
expect(Math.abs(getArticleTilt('a'))).toBeLessThanOrEqual(8)
expect(articleYear('2026-02-30')).toBeNull()
expect(clampPreviewX(1400, 500, 1440, 16)).toBe(924)
```

Also pin zero duration `0:00`, subhour formatting, no thumbnails for unsupported/empty availability keys, unsafe IDs, non-finite/negative durations, deterministic UTC `MM.DD.YY` dates, and different tilts for the fixture IDs (without claiming collision-free hashing).
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/sanity/editorial-data.test.ts __tests__/util/editorial.test.ts __tests__/util/youtube.test.ts`.
- [ ] **Step 3: Implement queries and normalization.** Name each `defineQuery` variable `getReadPageQuery`, `getArticleIndexQuery`, `getWatchPageQuery` so generated result names match the DTO contract. Read projects `_key, previewMode, previewWordCount, article->{...}`; Watch projects `videos[]{_key, "video": @->{...}}`. Use explicit published perspective on these fetches only. Fetch features before archive, exclude canonical IDs of usable rendered records, deduplicate legacy invalid selections defensively, and preserve selected order. Extract/truncate featured opening text on the server using Task 2 helpers (80 if legacy word count is invalid); don't send body blocks to browser props. Keep a usable feature as a metadata card if its preview source has gone stale. Query index ordering is `publishDate desc, _id asc`, and date validation is UTC calendar round-trip, not regex alone.
- [ ] **Step 4: Implement URL/date/tilt helpers and typed fixture factories.** Explicitly map `default→default.jpg`, `medium→mqdefault.jpg`, `high→hqdefault.jpg`, `standard→sddefault.jpg`, `maxres→maxresdefault.jpg`; filter by saved availability and strongest-first order. Embed base is `https://www.youtube-nocookie.com/embed/<id>` with `autoplay=1`, `playsinline=1`, `controls=1`, `fs=1`. Export no arbitrary remote URL builder. Use normalized/generated types in factories; omit unrelated body data.
- [ ] **Step 5: Generate then verify green.** `pnpm -C sanity typegen`; repeat Step 2; run `pnpm -C client typecheck`. Inspect generated diffs for unexpected removals to old query contracts. In an approved read-only dataset check the three GROQ queries and projections; mocked fetch assertions alone don't prove GROQ syntax/content behavior.
- [ ] **Step 6: Commit the task's files and generated artifacts.** `git commit -m "feat: query and normalize editorial index data"`.

## Task 5: Regression-protect shared filtering and add its editorial layout

**Files:** Modify `client/src/components/Filter/FilterMenu.tsx`, `client/__tests__/components/FilterMenu.test.tsx`, `ProjectsList.test.tsx`, `ArtistDirectory.test.tsx`. Existing source consumers remain unchanged.

**Interfaces:** Add optional `layout?: "index" | "editorial"`, default `"index"`; retain every existing prop/render-slot signature. Editorial layout puts the heading above a full-width year panel and preserves mobile behavior; no fetch/data state inside the shared component.

- [ ] **Step 1: Extend characterization tests before touching source.** Assert default consumer classes/layout and default open/closed borders; desktop/mobile slots receive the same category/border arguments; tags render/remove as before; outside click closes; scroll closes only below 768px; open/close cleanup doesn't leave listeners. Include actual ProjectsList/ArtistDirectory fixtures and their filter selection/removal tests. Run `pnpm -C client test --runInBand __tests__/components/FilterMenu.test.tsx __tests__/components/ProjectsList.test.tsx __tests__/components/ArtistDirectory.test.tsx`; these characterization tests must pass on the old component.
- [ ] **Step 2: Add the failing editorial-layout test.** Render `layout="editorial"`, `categories={[{key:"year",label:"Year"}]}`, title `Article Index`, and year buttons through both existing item slots. Assert the heading precedes the full-width filter panel, named year controls/tags work, and default-layout assertions still apply to an instance with no `layout` prop. Add deliberate `data-layout` markers if needed to test structure without brittle screenshots of all utility classes.
- [ ] **Step 3: Run red.** Repeat Step 1's command; only the new opt-in contract should fail.
- [ ] **Step 4: Implement the opt-in branch.** Keep existing default JSX/classes untouched where possible. Factor only duplicated presentation locally; do not change categories/filter semantics for current consumers or add article-specific state to `FilterMenu`.
- [ ] **Step 5: Run green and compare old screens.** Repeat Step 1 and Task 1's Projects/Community browser states at the same viewports/content. Record before/after evidence; if data changed, use equivalent frozen fixtures before asserting visual equivalence.
- [ ] **Step 6: Commit only the four task files.** `git commit -m "feat: add opt-in editorial filter layout without index regressions"`.

## Task 6: Build featured articles and the year-filtered Read index

**Files:** Create `client/src/components/Editorial/FeaturedArticles.tsx`, `ArticleIndex.tsx`, `editorial.module.css`, `client/__tests__/components/Editorial/FeaturedArticles.test.tsx`, `ArticleIndex.test.tsx`.

**Interfaces:** `FeaturedArticles({items}: {items: FeaturedArticle[]})`; `ArticleIndex({title, articles}: {title: string; articles: ArticleSummary[]})`. The latter owns selected year and consumes Task 5's `FilterMenu` with `layout="editorial"`. No Sanity fetch in either component.

- [ ] **Step 1: Write failing card/filter tests.** Three ordered records link to their exact `/read/<slug>` destinations; title remains the accessible link name during image/text reveal; both hover and focus reveal; absent preview media leaves metadata usable. Test full lead/two secondary layout, mobile stack, one remaining secondary spanning its row, first usable item promoted as lead, and 0/1/2/3 input lengths. For archive fixtures, initial year is newest; changing year shows only matching rows, switching an irrelevant featured setting cannot change archive data, null type/author is safe, and after rerender without the selected year selection resets to newest.

```tsx
render(<ArticleIndex title="Article Index" articles={makeArchiveAcrossYears()} />)
expect(screen.getByRole('button', {name: '2026'})).toHaveAttribute('aria-pressed', 'true')
fireEvent.click(screen.getByRole('button', {name: '2025'}))
expect(screen.getByRole('link', {name: '2025 article'})).toHaveAttribute('href', '/read/2025-article')
expect(screen.queryByRole('link', {name: '2026 article'})).not.toBeInTheDocument()
```

Empty input must show `No additional articles available.`, no year controls, and no empty table headers. Keep desktop date/title/author/type columns and compact mobile date/title/author rather than copying the project table.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/components/Editorial/FeaturedArticles.test.tsx __tests__/components/Editorial/ArticleIndex.test.tsx`.
- [ ] **Step 3: Implement cards and archive.** Use Figma nodes `3662:6583`, `4442:7342`, `3797:3265`; real Next links, `SanityImage`, existing typography/colors, focused scoped styles. Use one semantic set of links/rows with responsive CSS rather than duplicated focusable desktop/mobile copies. Keep excerpt text as escaped plain text; no HTML injection. Maintain server summary order, derive only available years, use UTC date helper, and expose selected year accessibly. Preserve stable reference `_key` for features, `_id` for independent archive records.
- [ ] **Step 4: Verify green.** Repeat Step 2, then shared filter regression tests; inspect 1440/440/375/768px layouts with fixtures and both feature modes. For browser work without authoring permission, temporarily host the actual components/data factories at untracked `client/src/app/editorial-preview/page.tsx`, guarded with `notFound()` outside development; this is not an alternative production data source. Remove that task-owned temporary file before commits/builds. Reuse this local-only harness for later visual checks rather than create Sanity content. Explicitly record the Miller Text fallback if no licensed font is provided; do not install a different font globally.
- [ ] **Step 5: Commit the task files.** `git commit -m "feat: render featured articles and year-filtered read index"`.

## Task 7: Add stable, horizontally tracking article image previews

**Files:** Create `client/src/components/Editorial/ArticleHoverPreview.tsx`, `client/__tests__/components/Editorial/ArticleHoverPreview.test.tsx`; modify `ArticleIndex.tsx`, `editorial.module.css`.

**Interfaces:** `ArticleHoverPreview({article, anchor, cursorXRef}: {article: ArticleSummary | null; anchor: {top: number; height: number} | null; cursorXRef: RefObject<number | null>})` renders a single `document.body` portal (client only). ArticleIndex supplies row hover/focus/blur state and writes pointer x to the ref without setting React state per move; the preview owns ref/rAF positioning and cleanup. Task 4's `getArticleTilt` / `clampPreviewX` define geometry.

- [ ] **Step 1: Write failing interaction tests.** Stub fine/coarse-pointer media queries, viewport/row bounds, and rAF. Assert one image at most; canonical ID tilt is stable after filter/reorder/rerender; x follows pointer while y stays row-anchored; x is clamped; overlay is `aria-hidden` and doesn't intercept events; focus yields a stationary centered preview; no hero/no fine pointer yields no floating overlay. Trigger leave, scroll, blur, filter change, and unmount and assert overlay/rAF/listeners clear. Make a row link activation still navigate on the first touch.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/components/Editorial/ArticleHoverPreview.test.tsx`.
- [ ] **Step 3: Implement the portal and row wiring.** Avoid a React state update for every pointer frame: keep geometry/cursor in refs and update the one overlay's transform in rAF. Bound angle to ±8°, anchor vertically to the row and clamp visible placement, use `pointer-events: none`, and bypass clipping/overflow ancestors. Scope transitions to opacity/transform and remove decorative motion under reduced motion.
- [ ] **Step 4: Verify green and real geometry.** Repeat Step 2 and Read component tests; in the browser sweep across first/last rows, left/right viewport edges, scroll, and change year. Confirm no page horizontal scrollbar at 375/440/768/1440px and no touch/keyboard hover trap.
- [ ] **Step 5: Commit the task files.** `git commit -m "feat: add deterministic cursor-following article previews"`.

## Task 8: Build sliding editorial navigation and default-preserving site chrome

**Files:** Create `client/src/components/Editorial/EditorialHeader.tsx`, `EditorialNav.tsx`, `EditorialNavigationProvider.tsx`, `client/src/components/SiteFooter.tsx`, `client/__tests__/components/Editorial/EditorialNav.test.tsx`, `client/__tests__/components/SiteFooter.test.tsx`, `client/__tests__/components/Menu.test.tsx`; modify `editorial.module.css`, `client/src/components/Footer.tsx`, `Menu.tsx`, `Article/ArticleHeader.tsx`, `client/src/app/layout.tsx`, and existing `Article/ArticleHeader.test.tsx`.

**Interfaces:** `EditorialHeader({heading, mode}: {heading: string; mode: EditorialMode})`; `EditorialNav({mode}: {mode: EditorialMode})`; root-persistent `EditorialNavigationProvider({children})` with `useEditorialNavigationHistory(): {previousMode: EditorialMode | null; recordMode(mode: EditorialMode): void}`; `Footer({variant = "default"}: {variant?: "default" | "watch"})`; `SiteFooter()` reads pathname and selects Watch only for exact `/watch`.

- [ ] **Step 1: Write failing navigation/chrome tests.** Exactly two accessible links, `/read` and `/watch`, correct `aria-current`; decorative duplicates aren't focusable. At desktop metrics, active Watch sets `--editorial-nav-offset: -116px` while Read sets `0px` (browser acceptance verifies the resulting transform). Hover/focus and route transitions produce the corresponding strip states, but don't prevent modifier-click or delay link navigation. Render a provider that persists while the nav remounts between modes: animate incoming state from previous mode; initial direct entry starts at the correct state. Reduced motion updates instantly. Assert default Footer matches original classes/links; exact Watch has light-blue variant; `/read`, `/read/some-article`, `/watch-other`, and route departure return default. Menu links and Read breadcrumb have expected hrefs and the menu closes after activation.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/components/Editorial/EditorialNav.test.tsx __tests__/components/SiteFooter.test.tsx __tests__/components/Menu.test.tsx __tests__/components/Article/ArticleHeader.test.tsx`.
- [ ] **Step 3: Implement sliding links and persistent previous-mode state.** Match clipped 232px track, 100px cells, 16px gap, active lilac/teal and inset/active shadows from `4259:7310`; use recovered timing or documented 300ms fallback. Keep semantic links separate from `aria-hidden` duplicated visual labels as necessary; no extra tab stops. Mount the lightweight provider in existing RootLayout around server-rendered children, retaining existing Menu/padding. Record only a mode actually entered; incoming nav can animate from previous mode without postponing navigation. Do not move `/read/[slug]` or create route groups just for animation.
- [ ] **Step 4: Integrate chrome through opt-ins.** Replace root Footer import/use with `SiteFooter`; default Footer output remains identical. Add Editorial `/read`, Read `/read`, Watch `/watch` Menu links. Add href `/read` to the existing article header's Read breadcrumb only. Scope new styling; don't change `--background` or turn the global Menu dark.
- [ ] **Step 5: Verify green and transitions.** Repeat Step 2; browser direct entry, Read→Watch→Read, history back/forward, keyboard focus, modifier-click, and reduced motion. Check one Menu/Footer only and Watch styling does not persist after leaving.
- [ ] **Step 6: Commit only these files.** `git commit -m "feat: add animated editorial navigation and scoped watch chrome"`.

## Task 9: Implement one deterministic leftward thumbstrip clock

**Files:** Create `client/src/util/watch-progress.ts`, `client/src/components/Editorial/useWatchPlayback.ts`, `client/__tests__/util/watch-progress.test.ts`, `client/__tests__/components/Editorial/useWatchPlayback.test.tsx`.

**Interfaces:** `WATCH_INTERVAL_MS` (6000 unless Task 1 records actual prototype cadence); `watchPosition(elapsedMs: number, pitchPx: number, count: number): {index: number; fraction: number; offsetPx: number}`; hook `useWatchPlayback({ids, modalOpen}: {ids: readonly string[]; modalOpen: boolean})` returns `{activeId: string | null; fraction: number; isPaused: boolean; userPaused: boolean; select(id: string): void; next(): void; previous(): void; togglePaused(): void; setHovered(value: boolean): void; setFocused(value: boolean): void}`. The hook uses one rAF clock; changing pitch does not change logical time.

- [ ] **Step 1: Write failing progress/hook tests with controlled rAF/performance time.** For fallback 6000ms cadence:

```ts
expect(watchPosition(0, 248, 3)).toEqual({index: 0, fraction: 0, offsetPx: 0})
expect(watchPosition(3000, 248, 3)).toEqual({index: 0, fraction: 0.5, offsetPx: -124})
expect(watchPosition(6000, 248, 3)).toEqual({index: 1, fraction: 0, offsetPx: -248})
expect(watchPosition(18000, 248, 3)).toEqual({index: 0, fraction: 0, offsetPx: 0})
```

If prototype timing is recovered, replace these elapsed values proportionally and pin that one recorded constant. Also test count 0/1, nonfinite/negative input, changed pitch preserving fraction/ID, manual selection resetting fraction, previous/next wrap, list reorder preserving active ID, removed active ID resetting to first, hidden-tab resume without catch-up, simultaneous hover+focus+modal pauses, explicit user pause surviving temporary reasons, reduced-motion default pause, and cleanup of the only rAF/listeners.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/util/watch-progress.test.ts __tests__/components/Editorial/useWatchPlayback.test.tsx`.
- [ ] **Step 3: Implement the progress function and hook.** Base `index` and fraction on the same accumulated visible/unpaused elapsed time; offset is negative `(index + fraction) * pitch`. Reset only when actual IDs require it, not on a new array identity. Zero/one video has no running clock. Pause reasons compose with OR; resume timestamps reset so hidden/paused wall time is discarded. Reduced-motion listeners update safely at runtime, and explicit resume opts into discrete progression without decorative smooth travel.
- [ ] **Step 4: Verify green.** Repeat Step 2 under fake clocks; assert no outstanding rAF/listeners after unmount. Run frontend typecheck.
- [ ] **Step 5: Commit the task files.** `git commit -m "feat: add synchronized leftward watch progression"`.

## Task 10: Render curated Watch thumbnails, controls, and the large preview

**Files:** Create `client/src/components/Editorial/WatchExplorer.tsx`, `WatchThumbnailStrip.tsx`, `VideoThumbnail.tsx`, `client/__tests__/components/Editorial/WatchExplorer.test.tsx`, `VideoThumbnail.test.tsx`; modify `editorial.module.css`, `client/next.config.ts`.

**Interfaces:** `WatchExplorer({videos}: {videos: VideoItem[]})`; `WatchThumbnailStrip({videos, activeId, fraction, paused, onSelect, onNext, onPrevious, onTogglePaused, onHoverChange, onFocusChange})` uses Task 9's corresponding types; `VideoThumbnail({video, className, sizes, decorative = false}: {video: VideoItem; className?: string; sizes: string; decorative?: boolean})`. Explorer initially leaves its user-initiated Play action for Task 11; never mount a hidden iframe as a preview.

- [ ] **Step 1: Write failing rendering/selection tests.** Only selected records are rendered in their order; a fixture containing another video outside the passed list must never appear. Thumbnail click, Enter/arrow navigation, previous/next and swipe change the same current title/description/duration/preview. Test 0/1/many inputs, hidden unknown duration, visible Pause/Resume, composed pause callbacks, and changing data; browser checks own overflow measurements. Decorative strip copies have no duplicate accessible controls/IDs/tab stops. For images, override asset wins; failed override tries strongest saved YouTube size then lower candidates, each once; after exhaustion show neutral placeholder; switching video or editing its media source resets fallback state even if document ID is unchanged.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/components/Editorial/WatchExplorer.test.tsx __tests__/components/Editorial/VideoThumbnail.test.tsx`.
- [ ] **Step 3: Implement the measured leftward strip.** Arrange previous/current/next repeated visual sequences in logical array order to cover the left-of-playhead area and seamless wrapping. At reference desktop size each thumbnail is 248×164px and playhead x=102px; initialize the current thumbnail's leading edge at the playhead and apply the negative offset from Task 9. Use ResizeObserver to measure actual pitch and preserve logical fraction/ID during resize. Use one roving-tabindex set of real thumbnail controls; clones are decorative. Select changes ID/interval immediately; horizontal swipe exceeding half a measured pitch advances once on release and does not steal vertical page scrolling. Pointer/focus interaction pauses the clock. No second timer for the large preview.
- [ ] **Step 4: Implement safe thumbnails/layout.** Both strip and large preview use `VideoThumbnail`. For Sanity overrides use the existing image URL builder with crop/hotspot and an explicit target aspect/size so the requested crop is applied, with Next Image error handling locally; don't change shared `SanityImage` merely to add fallback. Reserve image dimensions, use responsive sizes, show applicable credits on the large preview, and allow only `{protocol:"https",hostname:"i.ytimg.com",pathname:"/vi/**"}` in addition to the existing Sanity pattern. Use Figma desktop/mobile title/description/preview geometry without hardcoding six videos.
- [ ] **Step 5: Verify green and animation.** Repeat Step 2 and Task 9 tests. In the browser check selection changes exactly at each leading-edge crossing, loop has no blank flash, the playhead stays fixed, one video doesn't auto-advance, responsive resizing stays synchronized, and reduced-motion rendering is stationary/discrete. Test touch scrolling/swiping and actual image-error fallbacks.
- [ ] **Step 6: Commit the task files.** `git commit -m "feat: render curated watch strip and resilient video thumbnails"`.

## Task 11: Add user-initiated accessible YouTube modal playback

**Files:** Create `client/src/components/Editorial/YouTubeModal.tsx`, `client/__tests__/components/Editorial/YouTubeModal.test.tsx`; modify `WatchExplorer.tsx`, `WatchExplorer.test.tsx`, `editorial.module.css`.

**Interfaces:** `YouTubeModal({video, onClose}: {video: VideoItem | null; onClose(): void})`. WatchExplorer owns `modalVideo: VideoItem | null`, passes `modalOpen` to Task 9, and snapshots the clicked selected video rather than deriving modal contents continuously from active ID.

- [ ] **Step 1: Write failing lifecycle tests.** Assert no iframe before Play; clicking Play opens a named dialog and the validated current embed with autoplay/playsinline/control parameters; permission includes autoplay/fullscreen. Strip pauses, changing underlying active selection doesn't replace the modal video, invalid IDs cannot mount arbitrary frames, and visible Close / native Escape / backdrop close remove the iframe. Check scroll lock cleanup, focus restoration, unmount/route-departure cleanup, and a visible external YouTube link even if playback is blocked. Make user pause remain paused after the modal closes. Stub dialog methods only in this test; retain a real-browser check for actual focus containment.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/components/Editorial/YouTubeModal.test.tsx __tests__/components/Editorial/WatchExplorer.test.tsx`.
- [ ] **Step 3: Implement a native modal dialog/portal above the Menu.** Call `showModal()` after user-triggered mounting; use a visible close control, accessible title, body scroll lock restoring its previous value, and backdrop hit testing that doesn't close on content clicks. Use Task 4's embed URL and native YouTube controls/fullscreen; no fake Figma transport overlays. Destroy the iframe on close/unmount; restore focus to the opener if still connected. Listen for pathname changes for defensive cleanup if the component stays mounted. Maintain at least a 200×200px player viewport, with a responsive 16:9 frame where space allows.
- [ ] **Step 4: Verify green and actual playback.** Repeat Step 2. Browser-test real focus containment/inert background, Escape while focus is inside the frame, backdrop, fullscreen, blocked autoplay fallback, and closing/navigating away actually stopping audio. Do not interpret a mocked iframe test as successful YouTube autoplay.
- [ ] **Step 5: Commit the task files.** `git commit -m "feat: play selected YouTube videos in an accessible modal"`.

## Task 12: Connect routes and complete cross-page acceptance

**Files:** Create `client/src/app/read/page.tsx`, `client/src/app/watch/page.tsx`, `client/__tests__/app/read/page.test.tsx`, `client/__tests__/app/watch/page.test.tsx`; finish `docs/superpowers/verification/2026-11-05-editorial-acceptance.md`. Update `client/README.md` only with necessary local/editorial testing instructions.

**Interfaces:** Each server page exports its existing-project-style default async component and route metadata, consumes `getReadData` / `getWatchData`, and renders `EditorialHeader` plus its page components. `/read/[slug]` keeps its original source location and query.

- [ ] **Step 1: Write failing route tests.** Mock only the data assembly boundary; assert Read renders heading/features/archive and Watch renders only curated videos. Verify empty singletons/default headings, malformed references already normalized out, no raw body props passed to client components, and a single global Menu/Footer supplied by root layout rather than duplicated by pages. Route metadata should identify Read/Watch, not invent document SEO fields. Test existing article details/breadcrumbs still resolve and navigate to `/read`.
- [ ] **Step 2: Run red.** `pnpm -C client test --runInBand __tests__/app/read/page.test.tsx __tests__/app/watch/page.test.tsx`.
- [ ] **Step 3: Implement the thin server routes.** `/read` uses `getReadData`, `FeaturedArticles`, `ArticleIndex`; `/watch` uses `getWatchData`, `WatchExplorer`. Keep page-local Watch background scoped to content, and let `SiteFooter` handle the one global footer. There is no new `/editorial` route and no route-folder move.
- [ ] **Step 4: Run complete automated verification.** Separately run `pnpm -C sanity test`, `pnpm -C sanity typegen`, `pnpm -C sanity lint`, `pnpm -C sanity build`, `pnpm -C client test --runInBand`, `pnpm -C client lint`, `pnpm -C client typecheck`, `pnpm -C client build`, and `git diff --check`. Required result: all new tests and checks pass, old tests still pass, and generated files are in sync; enumerate any unrelated pre-existing failure rather than claim an all-green result.
- [ ] **Step 5: Run visual/browser acceptance.** Compare Figma at 1440/440px and inspect 375/768px: three feature layouts, both hover modes, year filtering, image tilt/cursor edges, switch navigation in both directions, Watch boundary/loop/manual selection/resize/pause/reduced motion, thumbnail overrides/fallbacks, modal playback/focus/close/route teardown, one Menu/Footer, and no horizontal page overflow. Recompare Task 1's old Projects/Community states and representative article detail. Store after screenshots under `/tmp/opencode/editorial-acceptance/` and link evidence in the verification record; disclose font/prototype-timing limitations.
- [ ] **Step 6: Complete editor-to-site acceptance only with prerequisites.** In the approved test dataset select/reorder the three features, change mode/word count, select/reorder a subset of videos, set/remove a thumbnail override and optional duration, publish test content when authorized, and confirm the public view after the existing revalidation interval. Verify unselected videos and featured articles don't leak into their respective lists. Mark every unavailable live-key/dataset check blocked; fixtures prove rendering, not launch content readiness.
- [ ] **Step 7: Commit routes, route tests, necessary docs and evidence.** `git commit -m "feat: connect editorial read and watch routes"`. Hand off with actual command results, baseline comparisons, and any explicitly blocked plugin/live-authoring checks. No deployment or production publishing is included.

## Plan self-review and execution handoff

- [x] Spec coverage maps schema/selection to Tasks 2–4; protected reuse to Task 5; Read to Tasks 6–7; switch/chrome to Task 8; Watch synchronization/images to Tasks 9–10; modal to Task 11; routes/editor acceptance to Task 12.
- [x] Tasks define concrete files/interfaces, named assertions, red/green verification and a scoped commit; Task 1 is an evidence/compatibility gate, not an artificial code-writing exercise.
- [x] Cross-task names align with the DTO/query/helper contracts; Figma leftward motion replaces the rejected rightward alternative everywhere normative.
- [x] All five Review Focus conditions have owning tests, plus browser checks where a DOM unit test cannot prove behavior.
- [x] No code bodies are prescribed beyond assertions and small state examples; implementation choices remain bounded by the approved design.
- [ ] User reviews this plan and selects an execution method before implementation.

Recommended execution: **Native**, task-by-task in this session with a final independent branch review. These tasks share generated types, query DTOs, clock state, and staged compatibility gates; keeping those interfaces in one working context should reduce handoff overhead. Subagent-driven execution is also valid if the user prefers a fresh implementer/reviewer per task.
