# Editorial Read / Watch — Design

Date: 2026-11-05
Status: Approved for implementation planning on 2026-11-05. The user corrected thumbstrip direction to follow Figma: leftward beneath the fixed playhead. Product execution awaits implementation-plan review.
Research: [Repository, Figma, plugin, and baseline findings](2026-11-05-editorial-research.md)

## Design checklist

- [x] Research Figma, repository reuse, existing tests, and requested plugin.
- [x] Confirm Read feature count and curated Watch selection with the user.
- [x] Write the proposed content model and interaction/compatibility contracts.
- [x] Run a fresh builder review and incorporate its setup/empty-state questions.
- [x] User approval of the full design, with thumbstrip direction corrected to Figma.
- [x] Detailed implementation plan after approval: [plan](../plans/2026-11-05-editorial-read-watch.md).

## Intent

Give CultureHub visitors two editorial entry points: Read for discovering published writing, and Watch for discovering a curated selection of YouTube videos. Editors should manage both in Sanity without duplicating article/video content or requiring developer intervention for every update.

This work uses the existing Next.js 16 / React 19 frontend and Sanity 5 Studio. Sanity modeling and data contracts precede frontend implementation. No product code, dependencies, live content, or shared components have been changed during this design pass.

## Confirmed requirements

- Implement the supplied Figma Editorial canvas (`3662:6490`), including desktop/mobile designs and component interaction examples.
- Editors select three featured articles. All remaining eligible articles appear in a year-filterable index.
- Featured articles can reveal their hero image or configurable opening text on hover.
- Index-row hover reveals an article image with an article-ID-derived tilt, following the cursor horizontally.
- Animate the Read / Watch switch using the design's sliding-strip states.
- Watch contains a **selectable list of video documents**, not every video automatically.
- Follow Figma: move the Watch thumbstrip left beneath the fixed playhead and synchronize video selection with thumbnail boundaries.
- Play opens the selected YouTube video in a modal and requests autoplay.
- Prefer YouTube thumbnails; allow a Sanity thumbnail override.
- Reuse existing index UI where appropriate, but inspect and regression-protect existing consumers before changing it.

## Goals, non-goals, and failure conditions

Success means editors can select content, change a featured preview mode/length, reorder the selected videos, publish, and see the corresponding layouts without code changes. Published articles and current index pages continue to work.

Out of scope: redesigning article details, replacing existing lists with a generic framework, YouTube channel/playlist synchronization, video detail routes, search/category filters, livestream scheduling, custom video hosting, new analytics, and production content imports. Exploratory livestream notes in Figma are not additional requirements.

Failures include a correct-looking page with hardcoded content; a shared filter change that alters Projects or Community; a hover-only navigation trap on touch/keyboard; animation drifting from video selection; playing audio after closing the modal; or downgrading Sanity/React to accommodate an old plugin.

## Design sources and constraints

| Surface | Figma node |
| --- | --- |
| Desktop Read / Watch | `3662:6583` / `3869:2241` |
| Mobile Read / Watch | `4442:7342` / `4533:6096` |
| Featured article / index hover | `3797:3265` / `3689:9355` |
| Current sliding navigation component | `4259:7310` |
| Thumbnail strip / synchronized video states | `4062:2134` / `4311:9308` |
| Playback overlays | `4297:9112`, `3931:3852` |

Use the current page instances and `4259:7310`, not the earlier separate-pill alternative `4094:6264`. Read uses the existing light/lilac colors and serif article typography; Watch uses the dark surface with teal/light-blue accents. Keep the global Menu and a single Footer.

Exact animation duration/easing is not available in the extracted Figma data. Inspect the prototype before implementation; if it remains unavailable, use the proposed timings below and label them as implementation defaults. Miller Text currently falls back to Georgia: exact serif fidelity requires the licensed webfont, not a silent claim that the fallback matches.

## Content model

All fields below are additive. Existing article fields and article-detail query contracts remain valid. Use Sanity references for relationships, generated IDs for ordinary documents, `defineType` / `defineField` / `defineArrayMember`, and icons/previews appropriate to each new type.

### `readPage` singleton

Use an explicitly identified Studio singleton, following `sanity/structure/index.ts`.

| Field | Type | Behavior |
| --- | --- | --- |
| `heading` | string | Default `Editorial`. |
| `articleIndexTitle` | string | Default `Article Index`. |
| `featuredArticles` | array of `featuredArticle` objects | Required; exactly three entries. Order determines lead, secondary-left, secondary-right. |

Each `featuredArticle` contains:

- `article`: required reference to `article`.
- `previewMode`: required string radio, `image` or `text`; proposed initial value `text` so image-less writing remains selectable.
- `previewWordCount`: integer, 10–150, default 80, shown/required only for text mode.

Validate unique article `_ref` values across objects, not just object equality. Validate that image mode resolves to an article with a hero asset and text mode has opening text. Keep normal draft authoring possible; validation errors block publishing an incomplete selection. References are strong.

On the public site, resolve only usable published references; never render a draft-only reference as a broken card. If an old or incomplete singleton has fewer than three usable features, show the valid subset without inventing replacement features. Exclude only the features actually rendered from the index, so an invalid configuration cannot make an otherwise eligible article disappear from discovery.

For a partial selection, preserve relative order and promote the first usable item to the full-width lead slot. One remaining secondary card spans the secondary row rather than leaving an empty half. With no usable features omit the featured section and retain the index of all eligible articles. These are defensive states, not permission to publish a new invalid selection.

### Existing `article`

Preserve `title`, `slug`, `publishDate`, `deck`, `byline`, `heroImage`, inline `author`, content blocks, and `readMore`.

Add optional `articleType`, a string list with Review / Reflection / Interview. This fulfills the designed desktop type column and the previous article spec's explicit deferral of that field to index work. Existing articles without a type show an empty type cell; no migration is required. It does not change detail-page behavior.

Derive year from `publishDate`; do not store a second year field. Author display uses `author.name`, then existing `byline`, then no author text. Do not strip words such as “Written by” from stored legacy bylines heuristically.

### `video` document

| Field | Type | Behavior |
| --- | --- | --- |
| `youtube` | plugin `youtubeVideo` object | Required valid ID; metadata enrichment and Studio preview from the requested plugin, subject to compatibility gate. |
| `titleOverride` | string | Optional editorial title; otherwise use imported title. |
| `descriptionOverride` | text | Optional editorial description; otherwise use imported description. |
| `thumbnailOverride` | image | Optional; use existing image helper, alt/credits, and enable hotspot locally on this new field. |
| `durationSeconds` | integer | Optional, minimum 0; manually entered for this scope because the plugin does not fetch duration. |

Use Sanity-generated video document IDs, independent of YouTube IDs. No slug or standalone route is necessary. Studio labels and previews use resolved title/media. Validate a usable title from override or imported metadata and a valid 11-character video ID. An absent description/duration must not prevent the video from being selected.

The imported object stores `id`, `title`, `description`, `publishedAt`, and `thumbnails`. The last field contains available size keys, **not URLs**. Public rendering uses saved metadata and does not call the YouTube Data API.

### `watchPage` singleton

| Field | Type | Behavior |
| --- | --- | --- |
| `heading` | string | Default `Editorial`. |
| `videos` | array of references to `video` | Editors select the videos to include. Propose Studio drag order as presentation/advance order; unique references. |

Unselected video documents must never appear. Allow an empty selection, rendered as a designed “No videos available” state. Skip invalid/unpublished references defensively while preserving the remaining order. No `featured` flag on every video and no automatic fill from the full video collection.

Add both page singletons to the Studio navigation; remove duplicate singleton creation templates/actions for these new types without changing existing document workflows.

## Plugin compatibility and operational gate

Research found `sanity-plugin-youtube-input@0.2.0` declares peers `sanity: ^3`, `react: ^18`; this repository uses Sanity 5 / React 19. This is a real integration risk, not proof that the plugin fails at runtime.

The first implementation activity is an isolated, throwaway compatibility check against the repository's actual versions. Check dependency resolution, Studio build, schema extraction/TypeGen, editing/importing a URL, metadata preview, invalid/private/deleted IDs, quota errors, and saving/reopening a document. Do not force unsupported peers into the main installation or downgrade the app.

If direct use is not safely supportable, stop that integration and bring back the smallest compatible fork/local-input proposal for approval. Preserve the proposed content shape, but do not silently substitute another editor experience. Frontend work may use typed fixtures while this gate is open; production Watch publishing is blocked until the chosen input is validated.

Use a Studio environment key restricted to the YouTube Data API and the deployed/local Studio origins, with quota controls. The key is visible in Studio's browser bundle; do not treat an environment variable as making it secret. Do not commit credentials or expose a Sanity write token. Document setup and plugin errors for editors. The plugin itself rejects some videos with missing snippet fields, so the compatibility check must explicitly test those cases.

An available key and safe authoring dataset are external prerequisites, not established facts. Until they are available, run dependency/build/schema checks and mocked metadata/error tests only and mark the live import/save/reopen check blocked. The current Studio configuration points to `production`; do not create a dataset, alter that configuration, author production drafts, or create/publish singleton/video documents without explicit permission. Plan live editor validation against an approved nonproduction test dataset; its creation and any test content are a separate authorization gate. Ask the user to configure credentials locally rather than paste them into chat.

No duration API extension is planned initially; manual `durationSeconds` keeps this bounded. If omitted, hide the duration rather than fabricate it. Format known values as `m:ss` or `h:mm:ss`, with no leading zero hour.

## Data contracts and routes

- `/read`: new article index; `/watch`: new curated video index.
- `/read/[slug]`: keep the existing article route and renderer. Add a working `/read` breadcrumb link now that the index exists, without restyling the detail page.
- Add real Menu links for Editorial/Read/Watch; use `/read` as the Editorial landing destination. Do not create a separate `/editorial` route unless separately requested.
- Define new GROQ queries in `client/src/sanity/queries.ts`, use explicit projections and `defineQuery`, regenerate `sanity/schema.json` and `client/src/sanity/types.ts` via the existing commands. Keep the existing API version and 30-second revalidation convention.
- Fetch with the published perspective; eligible index articles need a nonempty slug, title, and valid publication date. No new scheduling semantics are inferred from a future publication date.
- Fetch Read singleton/features first, compute the rendered-feature IDs, then fetch remaining article summary records excluding those IDs. Derive filter years from those remaining records. Order descending by `publishDate`, with `_id` ascending as tie-breaker.
- Fetch raw body text only for the three features, extract/truncate server-side, and pass only preview text and summary fields to client components. Never ship every article body to filter the index.
- Watch dereferences `watchPage.videos` in array order and projects the saved metadata and overrides. There is no query that falls back to all videos.
- Page server components own fetching; small client components own hover, filtering, navigation motion, thumbstrip state, image fallback, and playback.
- Missing page singletons render sensible headings and empty content, not errors or content selected by arbitrary defaults.

## Read interactions

Desktop has one full-width feature over two half-width features; mobile stacks all three. Default cards display date, title, and author. Hover/focus reveals the chosen image or opening excerpt with the appropriate Figma state, including lilac where shown. Keep an accessible article name and normal link behavior even when visible title text is replaced.

For excerpts, walk content in document order: `articleText.text` and `imageText.text`, including Q&A question then answer paragraphs. Ignore image-only blocks, credits, and duplicate pull quotes. Collapse whitespace and truncate by words with an ellipsis only when text was removed. Do not silently replace an empty body with the subtitle. If stale published content lacks the chosen preview, retain the metadata card rather than render a blank state.

The desktop index uses date/title/author/type columns, while mobile follows the compact date/title/author layout from Figma. Initial year is the newest available **nonfeatured** article year, matching the active-year design. Show only years with eligible remaining articles; selecting a year does not alter the feature selection. No extra “All” filter is proposed initially. Load summary metadata for the archive and filter locally; no pagination in this first slice. If archive measurement reveals impractical payloads, bring that constraint back before changing the interaction.

When there are no remaining eligible articles, retain the Article Index heading, hide year controls and empty table headers, and show “No additional articles available.” Do not duplicate features just to populate the list. When the entire corpus is empty this appears beneath the page heading without feature cards. If selected-year results disappear after a data refresh, return to the latest remaining year. The implementation acceptance uses non-destructive fixtures with three features plus additional articles across years, regardless of the current live corpus; commissioning/importing launch content is not included.

Fine-pointer row hover shows one decorative hero-image overlay. The angle is derived from the canonical article ID (strip a `drafts.` prefix), stable across rendering/order/filter changes, with a bounded roughly ±8° range. A hash-derived angle is not guaranteed mathematically collision-free; the goal is varied stable tilts, not a different asset-wide angle registry.

Track horizontal cursor movement only; keep vertical placement anchored to the active row. Clamp within the viewport, update via a ref/requestAnimationFrame rather than full-list React renders per pointer event, and set `pointer-events: none` / `aria-hidden`. Place the overlay outside clipping table containers. Clear on leave, scroll, blur, filter changes, and navigation. On keyboard focus show a stationary preview; on coarse pointers omit the hover overlay and preserve immediate link navigation. Missing images leave the row usable.

## Read / Watch switch

Reproduce the clipped 232px-wide strip with 100px label cells and 16px gaps from `4259:7310`, adapting dimensions for responsive constraints. Current states differ by a 116px horizontal translation; Read is lilac, Watch teal, with the inset track and active-cell shadow.

Use real links with `aria-current`, visible keyboard focus, working modifier-click/new-tab behavior, and hidden visual duplicates that are not extra focus targets. Animate track translation and active styling on state/hover/focus according to the component states, not merely a color change on two unrelated buttons. Propose 300ms ease-in-out if prototype timing cannot be retrieved; reduced motion switches instantly. Verify both destination entry and return navigation; if animation needs persistent state, use a small shared navigation host rather than moving the existing article-detail route solely for animation.

## Watch interactions

Use the selected videos in Sanity array order for logical advancement. Show thumbnails/playhead, current title, duration when known, description, and a large thumbnail preview on the dark surface. Both the strip and large preview use the same thumbnail resolver.

### Figma movement and synchronization

The Figma strip states translate from `x: 0` to `x: -248` under a fixed playhead at `x: 102`. The user explicitly corrected the earlier rightward request to follow these Figma designs. **Move left under a stationary playhead**, retaining the designed glow/selected states.

Arrange the visual track in the Studio's selected order so the next selected video approaches the playhead from the right. Move the track left continuously; switch active ID/title/description/large thumbnail exactly when the next thumbnail's leading edge reaches the playhead. Initialize progress so the first thumbnail's leading edge is at the playhead (102px at the reference desktop size), giving every selected video one full pitch interval. Do not reverse the selected order. Visually repeated copies are decorative; expose one keyboard-selectable control per real video.

Use one progress source for track position and active index, including direct selection. Proposed cadence is one thumbnail pitch per 6 seconds with linear motion, independent of actual video duration; derive pitch from measured responsive thumbnail dimensions, not a hardcoded desktop width. Loop seamlessly from last back to first using repeated items with no extra React state timer that can drift. Discard hidden-tab elapsed time on resume. Recalculate on resize while preserving selected ID and fractional progress.

Thumbnail click or keyboard activation selects that video immediately, updates the preview and play action, and resets its progression to the start of its interval. Next/previous controls provide a nonanimated alternative. Drag/swipe advances by thumbnail and synchronizes the same selected state. With one video there is no progression/loop; with none, no controls/player are mounted.

Provide a visible pause/resume control. Pause progression while hovered, focus is inside the switcher, the document is hidden, or a modal is open; resume only after all temporary pause conditions clear and the user has not explicitly paused. Reduced motion disables automatic progression by default and uses direct selection/controls; an explicit opt-in to play the strip may enable progression without decorative smooth transitions.

### Thumbnail resolution

1. Sanity `thumbnailOverride` asset, respecting crop/hotspot and alt/credits.
2. Best **available** saved YouTube size: `maxres` → `standard` → `high` → `medium` → `default`.
3. A neutral fallback when image loading fails or metadata is incomplete.

Map size names to known `i.ytimg.com/vi/<validated-id>/...` filenames, not arbitrary remote URLs. If an advertised size fails, retry lower candidates without an infinite loop. Permit only the required HTTPS host/path in Next image configuration; use responsive sizes and reserve aspect ratios to avoid layout shifts. Override alt text comes from the image field; thumbnails in already-labeled selection buttons can be decorative. Do not download or re-upload YouTube thumbnails into Sanity automatically.

### Modal playback

Play freezes the selected video, pauses the strip, opens an accessible modal, and only then mounts the iframe. Use a validated-ID YouTube privacy-enhanced embed with `autoplay=1`, `playsinline=1`, visible native controls, autoplay permission, and fullscreen support. Autoplay is requested, not guaranteed; expose the player's Play control and an external YouTube link if blocked/unavailable.

Use native dialog behavior or an equivalent tested focus-contained implementation, accessible title, visible Close button, Escape/backdrop dismissal, background inertness, scroll lock, and focus restoration to the triggering Play control. Keep the overlay above the fixed Menu. On every close, route departure, or unmount, destroy the iframe to stop audio/video. A strip advance must never replace the video in an open modal. Do not implement fake player controls from static Figma chrome on top of YouTube controls.

## Reuse and backward compatibility

`FilterMenu` is shared by `ProjectsList` and `ArtistDirectory`; those list renderers are domain-specific and should remain so. Reuse `FilterMenu` render slots and existing image/date/typography helpers, adding a narrowly scoped optional editorial layout only where required. Existing layout/props remain the defaults. Add article rows and hover behavior under an Editorial component namespace rather than add article fetching/tilt logic to `ProjectsList`.

Before any shared edit, capture current desktop/mobile Projects and Community screens and exercise their filtering. Extend characterization tests for filter categories, tags, borders, close-on-outside-click/mobile-scroll, and render slots. Afterward compare the same states/screens. The existing baseline is 13 suites / 85 passing tests, not a visual guarantee.

Do not change `Carousel.tsx` for Watch. Reuse `SanityImage` for CMS assets and use a bounded YouTube image path separately. Scope new CSS/keyframes to editorial components; do not change global theme variables merely to darken Watch.

For Watch's light-blue footer, add a default-preserving Footer variant selected by a small route-aware shell for exact `/watch`; keep the light Menu and dark default footer elsewhere, including `/read/[slug]`. No duplicate Footer and no root-route restructuring for theming. Test navigation away from Watch resets the treatment.

Do not run the existing `seed:articles` script; it deletes article documents. Use inert typed fixtures for tests/browser development. Any real content creation or publishing needs explicit authorization.

## Verification and delivery sequence

The implementation plan should follow these dependent slices, with tests before product changes:

1. Baselines and isolated plugin compatibility check; record any blocked decisions.
2. Sanity types, validation, singleton navigation, plugin configuration/setup documentation, and manual editor validation.
3. GROQ queries, regenerated types, summary/preview/thumbnail/date helpers, and deterministic fixtures.
4. Protected filter reuse plus Read layout, featured previews, year filtering, and row hover.
5. Animated navigation, curated Watch layout/strip, thumbnail fallback, and synchronized direct controls.
6. Modal playback, route-aware footer variant, Menu/breadcrumb links, accessibility/responsive polish.
7. Full regressions, Figma comparisons, and editor-to-site acceptance checks.

Acceptance coverage must include: three unique selected features and their order; unfeatured-only year options/results; both preview modes and word limits including Q&A; stable pointer tilts; empty/missing references; only selected videos in exact order; thumbnail override precedence and fallback; 0/1/many videos; movement boundary/loop/resize/pause/direct-control synchronization; reduced motion; dialog focus/dismissal/teardown; and unchanged existing filter pages/article details.

Use Jest/Testing Library for deterministic behavior and a real browser for pointer geometry, Figma comparisons, touch layout, native dialog focus, and actual YouTube playback. A test DOM cannot prove cross-origin autoplay. Check at the supplied 1440px desktop and 440px mobile widths, plus a narrow phone width and an intermediate tablet width.

Run frontend tests, lint, typecheck, and build; Studio lint/build and schema extraction/TypeGen; manual plugin editing tests with a restricted key. Record existing failures separately. Fresh verification evidence is required before completion claims. Do not deploy Studio, publish production content, or run production migrations as part of planning.

## Accepted planning defaults

These implementation recommendations were accepted for planning when the user said “Proceed,” with the direction correction recorded above; they were not requirements in the initial request:

- Drag ordering for selected Watch videos and selected featured articles.
- Per-feature image/text mode with 80-word default and a 10–150-word control.
- Optional Review / Reflection / Interview article-type field; no legacy migration.
- Initially select the latest nonfeatured year; no All-years button or pagination initially.
- Figma's leftward Watch movement under a fixed playhead; 6-second thumbnail cadence only if prototype timing is unavailable.
- Manual optional duration, not a new metadata-enrichment backend.
- Route-aware light-blue Watch footer with unchanged defaults everywhere else.
- Stop for approval if the requested plugin needs a compatible fork/local replacement; do not force-install or downgrade.

The detailed, file-by-file [implementation plan](../plans/2026-11-05-editorial-read-watch.md) is ready for review before product execution.

## Builder-review disposition

A fresh reviewer raised launch-content availability, API-key availability, the configured production dataset, and partial/empty Read states. No extra content creation was authorized or added to scope. The design now specifies fixture-based acceptance, explicit credential/nonproduction-authoring prerequisites, and deterministic empty/partial layouts. A follow-up review found nothing important left. The user subsequently approved planning, correcting strip direction to match Figma. Do not infer launch readiness from unit fixtures or assume credentials exist.
