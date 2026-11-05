# Editorial Read / Watch — Research and proposed content model

Date: 2026-11-05
Status: Supporting research for the approved design and [implementation plan](../plans/2026-11-05-editorial-read-watch.md). Earlier proposals below are historical; the linked design/plan govern execution.

Written design: [Editorial Read / Watch](2026-11-05-editorial-read-watch-design.md). That document supersedes the open proposals below where it supplies a decision or explicit default.

## Progress

- [x] Inspect the supplied Editorial Figma canvas and its component examples.
- [x] Inspect existing article schemas, routes, Studio structure, and generated types.
- [x] Audit existing list/filter reuse and their consumers.
- [x] Research the requested YouTube plugin, thumbnail data, and player parameters.
- [x] Run the current frontend test baseline.
- [x] Propose an additive content model.
- [x] Confirm Watch selection with the user; propose drag ordering within that selection.
- [x] Resolve remaining interaction choices and approve a written design; user corrected thumbstrip direction to match Figma.
- [x] Write a file-by-file, test-first implementation plan, schema/data first.

## Confirmed requirements

- Read is the article index. Editors select exactly three featured articles; all remaining articles belong in a year-filterable list.
- Featured articles reveal either the article hero image or configurable opening text on hover.
- Article-list image previews use a stable article-ID-derived angle and follow the cursor horizontally.
- Read / Watch navigation animates according to the Figma component examples.
- The Watch thumbstrip follows Figma's leftward movement under the fixed playhead and changes the displayed video at thumbnail boundaries (user correction after initial research).
- Play opens the selected YouTube video in a modal and requests autoplay.
- Prefer YouTube thumbnails; support an editorial image override in Sanity.
- Watch uses a selected list of videos, not every video document.
- Reuse existing index components where appropriate, auditing and protecting current pages before changing a shared component.
- Model Sanity content first, then implement rendering. This request initially asks for a plan, not immediate product-code changes.

## Repository findings

The frontend is Next.js 16 / React 19 with Tailwind 4. Studio is Sanity 5.

| Area | Evidence | Implication |
| --- | --- | --- |
| Articles already exist | `sanity/schemaTypes/articleType.ts`, `client/src/app/read/[slug]/page.tsx` | Extend the article model; do not replace the detail template or its existing fields. |
| Article metadata | `title`, `slug`, `publishDate`, `deck`, `byline`, optional `heroImage`, inline `author.name`, flexible `content` blocks | Reuse these values. Author display should prefer `author.name`, with `byline` as a legacy fallback rather than requiring migration. |
| Article type label absent | Existing article spec explicitly deferred this to the index | Add an optional article-type field if reproducing the index's Review / Reflection / Interview column; preserve old documents. |
| Index routes absent | No `app/read/page.tsx` or `app/watch/page.tsx` | Add routes alongside, not instead of, `/read/[slug]`. |
| Page singletons | `sanity/structure/index.ts` | Add Read and Watch page singletons following the existing pattern. |
| Shared filter | `client/src/components/Filter/FilterMenu.tsx` | Reuse via existing slots where possible; an optional editorial layout may be needed because Figma places the title above a full-width year selector. Existing layout must remain the default. |
| Filter consumers | `ProjectsList.tsx` on `/art-and-technology`; `Community/ArtistDirectory.tsx` on `/community` | Regression-test both consumers before any shared edits. |
| List renderers | `ProjectsList.tsx`, `Community/ArtistDirectory.tsx`, `Events/PastEvents.tsx` | These contain domain-specific data and interactions, not a reusable generic index. Do not force articles into the project-fetching component. |
| Carousel | `client/src/components/Carousel.tsx` and its consumers | Watch's continuous thumbstrip is a different interaction; avoid changing the shared carousel to implement it. |
| Images | `client/next.config.ts` permits only `cdn.sanity.io` | Add narrowly scoped YouTube thumbnail host/path support if using Next Image. |
| Global chrome | Root layout owns `Menu` and `Footer`; Footer is always dark | Avoid duplicate chrome. Watch's light footer treatment needs a backward-compatible variant or explicitly approved scope adjustment. |
| Fonts | `client/src/app/globals.css` declares Miller Text with Georgia fallback | Exact serif fidelity depends on a licensed Miller Text webfont; do not claim exact font matching with the fallback. |

### Baseline

`pnpm test --runInBand` in `client/`: **13 suites, 85 tests passed**, before any implementation changes. Existing tests cover FilterMenu, ProjectsList, ArtistDirectory, Events, and article-detail components. This is a unit-test baseline, not proof of visual/browser equivalence.

## Figma references

File: `erOB5ZYdcXZ27cukPYrfZr`, supplied canvas `3662:6490`.

| Design | Node |
| --- | --- |
| Desktop Read | `3662:6583` |
| Desktop Watch | `3869:2241` |
| Watch overlay examples | `4297:9112`, `3931:3852` |
| Article index image hover examples | `3689:9355` |
| Featured article states | `3797:3265` |
| Read / Watch switch used in page designs | `4259:7310` |
| Earlier alternate editorial buttons | `4094:6264` |
| Video thumbstrip states | `4062:2134` |
| Synchronized video switcher states | `4311:9308` |
| Mobile Read | `4442:7342` |
| Mobile Watch | `4533:6096` |

Desktop Read uses one full-width featured card followed by two half-width cards. Mobile stacks all three. The desktop index has publish date, title, author, and article type; mobile emphasizes date, title, and author. Watch uses a dark surface, thumbnails and playhead above title/duration/description, followed by a large preview image. Mobile Watch also has a thumbstrip, not a wholly different interaction.

The extracted design data shows component states but does not expose verified prototype durations/easing. Inspect the interactive prototype during the design/implementation planning pass; document any unavailable timing as a proposed default, not a designer-specified value.

Further geometry inspection found the thumbstrip translates from `x: 0` to `x: -248` under a fixed playhead, while the initial request specified rightward movement. The user subsequently corrected this to follow Figma: leftward motion. The current navigation switch translates its inner track by 116px between states.

## YouTube research and compatibility gate

- Requested package: `sanity-plugin-youtube-input`; npm's latest release is `0.2.0`.
- Its declared peers are `sanity: ^3` and `react: ^18`. This does **not** establish compatibility with this repository's Sanity 5 / React 19.
- Do not downgrade the repository or force unsupported peers into the production installation. First verify the package in an isolated compatibility experiment, including Studio input behavior and schema/type extraction. If it cannot work safely, seek approval for a maintained fork or compatible local input preserving its content shape.
- Plugin registration is `youtubeInput({apiKey})`; its field type is `youtubeVideo`.
- Stored shape: `id`, `title`, `description`, `publishedAt`, `thumbnails: string[]`.
- Crucially, `thumbnails` contains available **size keys**, not image URLs or full image objects. Construct URLs from the video ID and known mappings (`default`, `medium`, `high`, `standard`, `maxres`); do not treat these values as URLs or assume `maxres` exists.
- The plugin requests `part=snippet`, so it does not import duration. Either extend compatible metadata fetching with `contentDetails` or provide an optional manual duration field. Do not fetch duration on every public page visit.
- API credentials belong in Studio environment configuration, not committed code. Because this plugin calls Google from Studio's browser, the key is not a secret once bundled: restrict it to the YouTube Data API and approved Studio origins, with quota controls. Never expose a Sanity write token.
- On public pages, use saved metadata; an API quota/network failure should not make the entire Watch page unavailable.
- Request playback only after Play is activated, using a validated video ID and an autoplay-enabled embed. Browsers can still block autoplay; retain usable player controls and an external YouTube link.

Sources checked:

- https://www.sanity.io/plugins/sanity-plugin-youtube-input
- https://registry.npmjs.org/sanity-plugin-youtube-input/latest
- https://github.com/msfragala/sanity-plugin-youtube-input/blob/main/src/index.ts
- https://github.com/msfragala/sanity-plugin-youtube-input/blob/main/src/utils.ts
- https://developers.google.com/youtube/player_parameters

## Proposed additive content model — not yet approved

### `readPage` singleton

- `heading` and `articleIndexTitle`, defaulting to Editorial / Article Index.
- `featuredArticles`: ordered array of three objects, each containing an `article` reference and `previewMode: image | text`.
- Each featured entry can set a bounded `previewWordCount` for text mode (proposed default: 80 words). Derive text from actual opening article content, not the deck. Extraction must handle leading Q&A and image/text blocks, not only the first plain paragraph.
- Validate exactly three unique article references, and verify image-mode choices have a usable hero image. Allow draft authoring but fail publishing validation for incomplete selections.
- Referenced article order determines the lead card and the two secondary cards. Do not add per-article global `featured` flags.
- Exclude featured IDs from list results at query time. Apply year filtering only to the remaining list, not the featured cards. Derive available years from that same eligible list.

### Existing `article` document

- Preserve all current fields and detail-page rendering.
- Proposed optional `articleType` string with initial choices Review / Reflection / Interview for the designed metadata column; missing values render without a broken column.
- No stored year field: derive year from `publishDate`.
- No copied author documents, angle field, or duplicated article body/excerpt needed for the requested behavior.

### `video` document

- Required `youtube` field of plugin type `youtubeVideo`, contingent on compatibility approval.
- Optional `titleOverride`, `descriptionOverride`, and `thumbnailOverride` (existing image helper, including alt/crop/hotspot/credits).
- Optional `durationSeconds` (nonnegative integer) until metadata enrichment is settled. Display duration only when known.
- Studio preview uses the resolved title and thumbnail. Ordinary video documents use Sanity-generated IDs.
- Resolve display values as editorial override → saved YouTube metadata → a safe empty-state value. A thumbnail-loading failure falls back to a lower available size, then a neutral placeholder.
- Do not require a slug unless a standalone video detail route becomes part of the scope; none is requested.

### `watchPage` singleton

- `heading`, defaulting to Editorial.
- `videos`: a selectable array of unique references to reusable video documents. The user confirmed selection rather than automatically including all documents; drag ordering is the proposed default. No automatic YouTube channel synchronization is implied.
- Animation cadence is a frontend concern unless the editor explicitly needs control; avoid storing easing/layout configuration in Sanity.

## Remaining decisions

1. Watch selection is confirmed; drag ordering is a proposed implementation default.
2. Confirm per-feature image/text settings and opening-text length controls rather than one page-wide setting.
3. Direction is resolved: use Figma's leftward strip motion beneath the fixed playhead. Exact prototype timing remains to be inspected, with the written design's fallback cadence if unavailable.
4. Proposed defaults to review: newest available nonfeatured year selected initially; date-descending list order with ID tiebreaker; no article pagination in the initial slice unless archive size demands it; pause automatic Watch motion during focus/hover, hidden-tab state, reduced motion, and modal playback.
5. Explicitly exclude livestream scheduling/channel import mentioned in exploratory Figma notes unless requested. This scope is curated videos and modal playback.

## Safety and acceptance requirements for the eventual plan

- Capture desktop/mobile screenshots and existing filter behaviors on `/art-and-technology` and `/community` **before** shared-component changes. Add characterization tests for existing variants and render-slot behavior first.
- Shared enhancements must be opt-in, default to current output, and be independently regression-checked. Do not change unrelated index queries or migrate all lists to a new abstraction.
- No destructive content seed/import scripts. In particular, do not run the existing `seed:articles` script: it deletes current article documents.
- Use explicit GROQ projections and `defineQuery`, regenerate schema/types, and follow the existing 30-second fetch revalidation convention unless requirements change.
- Featured hover must also work on keyboard focus; touch users can open article links without a hover trap. Missing media must not hide metadata/navigation.
- Stable ID-based tilt must not use random values or change across renders. Pointer previews must not intercept clicks, clip at table overflow, or create horizontal page scroll.
- Watch must remain usable with zero, one, or many videos; direct thumbnail selection must synchronize preview/strip state. Use a single animation progress source so preview changes cannot drift from thumbnail boundaries.
- Modal: focus containment, accessible title/close control, Escape/backdrop dismissal, body scroll lock, focus restoration, and teardown that stops playback. Freeze the selected video while open.
- Respect reduced motion and provide a visible pause control for automatic movement; no player/iframe loads until Play activation.
- Verify Read, Watch, and existing article details at desktop, mobile, keyboard, touch, and reduced-motion settings. Compare old list-page screenshots after any shared changes.
- Run frontend tests/typecheck/lint/build, Studio lint/build, and hands-on plugin validation; distinguish any pre-existing failures from introduced regressions.
