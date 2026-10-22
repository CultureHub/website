# Re-Fest Page & Festival Template — Design

**Date:** 2026-10-21
**Status:** Proposed
**Scope:** Sanity content model for Re-Fest festivals, the Re-Fest program landing page, the festival detail template, and the first content import.

---

## 1. Context

CultureHub already models Residency, Experiments in Digital Storytelling (EDS), and Re-Fest as `program` documents. Residency and EDS have dedicated landing pages rendered by the dynamic program route `client/src/app/[slug]/page.tsx`. Re-Fest currently has a program document (slug `re-fest`) but no page-level content and no festival history.

The 2026 Figma file defines:

- The **Re-Fest page** — program header, a featured “Current” festival, and a “Festival Archive” list with a hover preview panel. Frame `2038:3352`.
- The **festival template** — a full festival page with a sticky jump menu, hero, theme/about section, per-location information, schedules, featured artworks, a virtual gallery block, an optional video section, and partners. Frame `2916:2707`.
- The **archive component** — list rows with hover/selected states and a detail panel. Component set `2214:6759`.

Live content sources used for the first import:

- Re–Fest 2025 (Re–Collect): https://www.culturehub.org/re-fest-2025
- Re–Fest 2026 (Re–Mapping): https://www.culturehub.org/re-fest-2026
- Re–Fest 2023 (Re–New): https://www.culturehub.org/re-fest-2023

### Design references

| Design | Figma node |
|---|---|
| Re-Fest page — desktop | `2038:3352` |
| Re-Fest page — mobile | `2396:3544` |
| Festival template — desktop | `2916:2707` |
| Festival template — mobile | `3111:7481` |
| Festival archive component set | `2214:6759` |
| Re-Fest header/feature | `2201:4634`, `2214:7039` |

---

## 2. Goals

- Make Re-Fest a first-class program page at `/re-fest` with a current-festival feature and a festival archive.
- Add a `festival` Sanity document type that captures everything needed to render the festival template without a page builder.
- Add a festival detail route at `/re-fest/[slug]` (slug = year, e.g. `/re-fest/2025`).
- Make the archive behave like the events page: list on the left, a detail preview on the right, driven by hover/focus, with the first archive item shown initially.
- Import the Figma template content, a full previous festival (2025), and archive records for the remaining years.
- Reuse and, where valuable, extract shared UI primitives instead of duplicating the event page patterns.
- Stub the video section so it can be completed when the videos ticket lands.

## 3. Non-goals

- No page-builder or drag-and-drop layout editing.
- No video player, transcoding, or playlist behavior. The video section is a visual stub.
- No attempt to link every festival participant to an `artist` document. Festival participants are stored as names because many are collectives, families, archives, or artists without records.
- No full historical content authoring for 2019–2024. Those years are archive records (year, theme, location summary, hero image) until content ops fills them in.
- No changes to the Residency/EDS page behavior, beyond extracting shared heading/summary components.
- No newsletter backend for the footer or archive.

---

## 4. Decisions

### 4.1 Re-Fest remains a `program`; festivals are child documents

`program` stays the top-level content type. A new `festival` document references a `program` and holds festival-specific content. This matches how `event` and `project` reference a program and keeps `/re-fest` in the existing program route.

### 4.2 The current festival is explicit

The Re-Fest `program` gets a `currentFestival` reference. The page shows that festival in the “Current” block. The archive is every other festival for the program, ordered by `year` descending. This avoids guessing “latest” and lets editors keep a future festival featured while older years remain archived.

### 4.3 Festival route is `/re-fest/[slug]`, slug = year

`/re-fest/2025` is short, stable, and matches the archive’s year-first presentation. The slug field is generated from `year` and remains editable if a collision ever occurs. The route validates that the festival belongs to the `re-fest` program.

### 4.4 Archive preview starts on the first item

The Figma component has a blank “Selected=None” state, but the events page already establishes “first item until hover” as the site behavior. The archive shows the first festival’s detail panel initially, switches on hover/focus, and highlights the selected row. On mobile there is no preview panel; rows show a small image and link directly to the festival.

### 4.5 Fixed Re-Fest palette, per-location variant

The festival template uses the Re-Fest palette from Figma: Metal, Cream, Highlighter, Ocher, Pool, Midnight, Blue Smoke. These become Tailwind theme tokens. Each location chooses a `colorVariant` for its information block (`highlighter`, `pool`, `midnight`, etc.); schedule and artwork sections use fixed Cream and Ocher backgrounds.

### 4.6 Fonts map to the existing local fonts

The design uses NewEdge666 and SchoolBook. The site already maps those roles to local Milling and Brook fonts:

- NewEdge666 headings → `font-milling`
- SchoolBook body/copy → `font-brook`

No new font files are required.

### 4.7 Artist and partner lists are strings

`participatingArtists` and partner names are arrays of strings, not references. This matches the live content (line-separated names) and keeps imports and editing simple.

### 4.8 Missing sections are omitted, not placeholdered

Every festival template section is conditional on its data. The 2026 festival currently has one location and no artworks, partners, or videos; its template renders hero, about, location information, and any schedule content that exists. Archive stubs render a minimal template rather than broken empty headings.

---

## 5. Content model

### 5.1 `program` additions

Add to `sanity/schemaTypes/programType.ts`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `currentFestival` | reference → `festival` | no | Shown in the Re-Fest “Current” block and excluded from the archive. Only meaningful for `re-fest`. |

The existing `pageDescription` field carries the Re-Fest header copy. The import sets it from the Figma header.

### 5.2 New `festival` document

`sanity/schemaTypes/festivalType.ts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Theme name, e.g. “Re–Collect”, “Re–New”, “Re–Mapping”. |
| `year` | number | yes | Integer 2000–2100. Used for ordering and the slug. |
| `slug` | slug | yes | Source: `year`. Route is `/re-fest/<slug>`. |
| `program` | reference → `program` | yes | Filtered to the `re-fest` program in the Studio. |
| `startDate` | date | no | Optional overall festival start. |
| `endDate` | date | no | Optional overall festival end. |
| `summary` | text | no | Short copy for the current feature and archive preview. |
| `about` | array of block | no | Long theme copy for the template “About” section. |
| `heroImage` | image | yes | Full-bleed template hero and archive image. Alt required. |
| `logo` | image | no | Optional festival mark (e.g. the 2023 Re–NEW logo). Alt required when present. |
| `locationSummary` | string | no | Archive label override, e.g. “New York & Los Angeles”, “Worldwide”, “Online”. Derived from `locations` when empty. |
| `links` | array of link | no | Overall festival links (catalogue, tickets, RSVP). |
| `locations` | array of location object | no | Physical and virtual locations. Drives the jump menu and page sections. |
| `partnerGroups` | array of partner group | no | Grouped partner names. |
| `videos` | array of video object | no | Video stub data. Empty means the section is omitted. |

#### Location object

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | “New York”, “Los Angeles”, “Virtual Gallery”. |
| `kind` | string select | yes | `in-person` or `virtual`. |
| `colorVariant` | string select | yes | `highlighter`, `pool`, `midnight`, `ocher`, `cream`, `metal`. Controls the location info block. Default `highlighter`. |
| `dateLabel` | string | no | e.g. “March 6-9th”, “April 20–29, 2023”. |
| `venueName` | string | no | e.g. “La MaMa Galleria”. |
| `address` | text | no | Multi-line address or location notes. |
| `details` | text | no | Additional time/access notes. |
| `links` | array of link | no | Exhibition guide, audio descriptions, “Enter Lobby”, RSVP. |
| `participatingArtists` | array of string | no | Names, one per item. |
| `schedule` | schedule object | no | Days and items for this location. |
| `featuredArtworks` | array of artwork | no | Artworks for this location. Empty means no artwork section. |

#### Schedule object

```ts
{
  days: Array<{
    dateLabel: string,        // "Thursday, March 6th" or "Performances"
    items: Array<{
      time: string,           // "6-9PM", "6:30PM", or empty
      description: text,      // multi-line copy
      links: link[]            // RSVP / Tickets / More
    }>
  }>
}
```

Using `dateLabel` rather than a real date keeps the design’s handwritten date strings (“Thursday, March 6th”, “Friday, April 28th”) and lets 2026 use program categories (“Performances”, “Workshops”, “Conversations”) without a schema change.

#### Artwork object

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `artist` | string | yes |
| `description` | text | no |
| `image` | image | yes (alt required) |
| `link` | url | no |

#### Video object (stub)

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `artist` | string | no |
| `thumbnail` | image | no |
| `url` | url | no |

The first import populates two 2023 videos from Figma so the stub is visible and testable. No player is rendered; the cards show thumbnail, title, and artist, and the section carries a TODO for the videos ticket.

#### Partner group

```ts
{ title: string, names: string[] }
```

### 5.3 Studio structure

Add a dedicated “Festivals” list item in `sanity/structure/index.ts` so editors do not have to find festivals inside the generic document list. Keep the existing list items.

### 5.4 Palette tokens

Add to `client/src/app/globals.css`:

```css
--color-rf-metal: #15252b;
--color-rf-cream: #fcf8e0;
--color-rf-highlighter: #edfd8b;
--color-rf-ocher: #ffde3e;
--color-rf-pool: #7ab8b1;
--color-rf-midnight: #5858bc;
--color-rf-blue-smoke: #accbdb;
```

Replace the unused `--color-re-fest-highlighter` with `--color-rf-highlighter`.

---

## 6. Routing and page architecture

### 6.1 `/re-fest`

Rendered by the existing program route `client/src/app/[slug]/page.tsx`. The route branches before the generic program layout:

```tsx
if (slug === "re-fest") {
  const data = await getRefestPage(slug);
  if (!data) notFound();
  return <RefestPage data={data} />;
}
```

`RefestPage` composes:

1. `ProgramHeader` — existing component, with Re-Fest body copy in Brook. No jump-to buttons because Re-Fest has no `featuredProjects`, `featuredArtists`, or `openCall`.
2. `SectionHeading` “Current” + `FestivalFeature` for `program.currentFestival`.
3. `SectionHeading` “Festival Archive” + `FestivalArchive` for all other festivals.

No “Upcoming Events” carousel on Re-Fest; the design ends after the archive.

### 6.2 `/re-fest/[slug]`

New route `client/src/app/re-fest/[slug]/page.tsx`:

- Fetch `getFestivalBySlug("re-fest", slug)`.
- `notFound()` if no festival.
- Render the festival template.
- Optional `generateMetadata` using the festival title, year, and summary.

Template order:

```
FestivalJumpTo        sticky under the global menu
hero image            full-bleed
FestivalAbout         Metal background; logo/theme/year + location summaries; long copy
for each location:
  FestivalLocationSection   colored info block; participating artists
  FestivalSchedule          Cream background; day blocks
  FestivalFeaturedArtworks  Ocher background; artwork columns
FestivalVideos        Metal background; stub cards; only if videos exist
FestivalPartners      Highlighter background; grouped names; only if partners exist
```

Each section gets `scroll-mt-[165px]` so anchor jumps clear the 61px fixed menu plus the 104px sticky jump bar.

### 6.3 Empty and partial states

- No `currentFestival`: omit the Current block.
- No archive: omit the Festival Archive block.
- No `locations`: render hero, about (if present), videos, partners.
- Location with no schedule/artworks: render its info block only.
- Location with no artists: omit the artist list.
- No partners/videos: omit those sections.
- Archive record with no summary: preview shows title/year/date/image without a description.

---

## 7. Components and reuse

### 7.1 Reused as-is

| Component | Used by |
|---|---|
| `Button` (`ticket` variant) | “Visit Festival”, archive preview actions, festival links. |
| `PortableText` | Re-Fest header description and festival `about` copy. |
| `SanityImage` | Hero, logo, archive images, artwork images, video thumbnails. |
| `ProgramHeader` | Re-Fest page header. Add an optional `descriptionClassName` prop so Re-Fest can use `font-brook` for the 24px body while Residency/EDS keep the current Milling style. |
| `Menu` | Existing global menu. Fix the Re-Fest link to `/re-fest`. |

### 7.2 Extracted for reuse

**`SectionHeading`** (`client/src/components/shared/SectionHeading.tsx`)

The “Festival Archive”, “Current”, Featured Artists, Featured Projects, and Upcoming Events headings all use the same bordered heading bar. Extract it and update the three existing program-page components to use it.

**`DetailSummary`** (`client/src/components/shared/DetailSummary.tsx`)

`EventSummary` already has the image → title → meta → description → actions panel that the festival preview needs. Extract the layout into a slot-based component and make `EventSummary` its first consumer. `FestivalSummary` is the second.

Props:

```ts
interface DetailSummaryProps {
  image?: SanityImageSource | null;
  imageClassName?: string;
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
}
```

### 7.3 Reused as a pattern, not code

`EventsExplorer` uses a stacked-panel technique (all preview panels occupy the same grid cell; only the selected one is visible) and a `hovered ?? first` preview. `FestivalArchive` uses the same pattern, because the row content and preview layout differ enough that sharing the component would add conditionals without reducing code.

### 7.4 New components

| Component | Responsibility |
|---|---|
| `Refest/RefestPage.tsx` | Server component composing the Re-Fest header, current feature, and archive. |
| `Refest/FestivalFeature.tsx` | Image + year/theme/date/summary/actions for the current festival. |
| `Refest/FestivalArchive.tsx` | Client hover/focus archive with list + stacked preview panels; mobile rows with images. |
| `Refest/FestivalArchiveRow.tsx` | Desktop list row and mobile image row. |
| `Refest/FestivalSummary.tsx` | Archive/current preview using `DetailSummary`. |
| `Festival/FestivalMeta.tsx` | Shared year/title, date lines, and actions components used by both the feature and the archive preview. |
| `Festival/FestivalJumpTo.tsx` | Sticky year/theme bar with About + location anchors. |
| `Festival/FestivalAbout.tsx` | Metal theme block: logo, theme, location summaries, long copy. |
| `Festival/FestivalLocationSection.tsx` | Location info + participating artists, colored by variant. |
| `Festival/FestivalSchedule.tsx` | Day blocks and schedule rows. |
| `Festival/FestivalFeaturedArtworks.tsx` | Uniform-height artwork grid. |
| `Festival/EqualHeightManager.tsx` | Measures the tallest artwork card and tallest schedule day block across the page and applies that height to every card/block at `md` and above; clears on mobile. |
| `Festival/FestivalVideos.tsx` | Stub cards; no player. |
| `Festival/FestivalPartners.tsx` | Grouped partner names. |

### 7.5 Featured artwork heights and the schedule grid

**Featured Artworks** uses a uniform three-column grid at `md` and above.
Every artwork card across all Featured Artworks sections shares the height
of the tallest artwork card on the page. `EqualHeightManager` measures after
mount, after font loading, after each image load, and on resize. Below `md`,
it clears the minimum heights so mobile content flows naturally.

**Schedule** is a seamless two-column grid, not a set of spaced cards. Each
day cell contains a full-width Highlighter date header followed by bordered
content rows. The grid has no gaps; cells share 2px RF Ocher borders, and a
blank cream filler cell appears when one column is shorter than the other.
Day cells stretch to their row height, and the blank filler preserves the
continuous grid. On mobile the schedule becomes a single column and the
filler is hidden.

### 7.6 Not reused, and why

| Component | Why not |
|---|---|
| `EventRow` | Archive rows use a different 2-column info grid (location/program, year/theme), no date formatting, and a mobile image. |
| `FeaturedArtists` | Festival artworks have varying image heights and artist/description text, not square artist cards. |
| `LocationTabs` | Festival locations are stacked sections with schedules/artworks, not tabs. |
| `Carousel` | The design uses a static wrap/masonry artwork grid; the video stub is a simple horizontal row. |
| `CreditGroup` / `CreditItem` | Partner groups are plain string lists, not project credits with roles and people. |

---

## 8. Data fetching

Add to `client/src/sanity/queries.ts`:

### 8.1 `getRefestPage(programSlug)`

Returns the program fields used by `ProgramHeader`, the full current festival, and archive summaries:

```groq
*[_type == "program" && slug.current == $programSlug][0]{
  ...,
  "currentFestival": currentFestival->{
    _id, title, year, "slug": slug.current, summary, locationSummary,
    heroImage { asset, hotspot, crop, alt, credits },
    links[] { _key, label, shortLabel, url },
    locations[] { name, kind, dateLabel }
  },
  "archive": *[_type == "festival"
    && program._ref == ^._id
    && _id != ^.currentFestival._ref
  ] | order(year desc) {
    _id, title, year, "slug": slug.current, summary, locationSummary,
    heroImage { asset, hotspot, crop, alt, credits },
    links[] { _key, label, shortLabel, url },
    locations[] { name, kind, dateLabel }
  }
}
```

`_id != ^.currentFestival._ref` also works when `currentFestival` is null; every festival id is not-null.

### 8.2 `getFestivalBySlug(programSlug, slug)`

Returns the full template document, including:

- identity and hero/logo/links
- `locations[]` with links, artists, schedule days/items/links, featured artworks
- `videos[]`
- `partnerGroups[]`
- `"program": program->{ _id, title, slug, shortLabel, accentColor }`

### 8.3 Types

Export inferred types from the query results:

- `RefestPageData`
- `FestivalArchiveItem`
- `FestivalTemplateData`
- `FestivalLocation`, `FestivalScheduleDay`, `FestivalArtwork`, `FestivalVideo`

### 8.4 Pure helpers

`client/src/util/festival.ts`:

- `festivalAnchor(name: string): string` — URL-safe anchor (`"New York"` → `"new-york"`).
- `festivalLocationSummary(locations, override?): string` — override or `"New York & Los Angeles"`, `"Online"`, etc.
- `festivalDateLines(locations): string[]` — `"March 6-9th in New York"`, virtual locations as `"April 20–29, 2023"`.
- `festivalNavItems(locations): { label: string; anchor: string }[]` — always includes About, then one per location.
- `festivalHref(slug: string): string` — `/re-fest/<slug>`.

---

## 9. Content import

### 9.1 Sources and scope

| Festival | Source | Scope |
|---|---|---|
| 2026 Re–Mapping | Figma `2214:7039` + live `/re-fest-2026` | Current record: title, year, summary, about, hero, one New York location. No artworks/partners/videos. |
| 2025 Re–Collect | Live `/re-fest-2025` | Full: about, New York + Los Angeles, participating artists, both schedules, all 33 artworks, partners. |
| 2023 Re–New | Figma template `2916:2707` + live `/re-fest-2023` images | Full template demo: about, 3 locations (NYC/LA/Virtual), schedules, 9 featured artworks per physical location, 2 video stubs, partners. |
| 2024 Re–Source | Figma archive component | Archive stub: year, theme, location summary, hero image. |
| 2022 Re–Unification | Figma archive component | Archive stub. |
| 2021 Re–Circulation | Figma archive component | Archive stub. |
| 2020 Re–Generation | Figma archive component | Archive stub. |
| 2019 Re–Fest | Figma archive component | Archive stub. |

### 9.2 Import script

`sanity/scripts/import-refest/`:

- `README.md` — source map, env, commands.
- `import.ts` — CLI with `--dry-run` and `--write`; uses `getCliClient({apiVersion})` from `sanity/cli`.
- `images.ts` — resolve an image source to a Sanity image object:
  - `{figmaNode: "..."}` → export via `https://api.figma.com/v1/images/{fileKey}` with `CAM_FIGMA_API_KEY`, then upload.
  - `{url: "..."}` → download, then upload.
  - `{assetId: "..."}` → reference an existing Sanity asset.
- `build.ts` — deterministic document builder and validation.
- `manifests/2026.ts`, `2025.ts`, `2023.ts`, `archive.ts`.

Deterministic document IDs: `festival-2026`, `festival-2025`, etc.

Image handling:

- Check for an existing `sanity.imageAsset` by `originalFilename` before uploading.
- Upload with `client.assets.upload("image", buffer, { filename })`.
- Always set `alt` (imageField requires it).

Idempotency:

- `createOrReplace` for festival documents.
- `patch(programId).set({ currentFestival, pageDescription, hasPage: true })` for Re-Fest.
- `--dry-run` prints the generated docs and asset plan without writing.

### 9.3 Program update

- `pageDescription` = the Figma header copy: “Re–Fest is an annual festival of exhibitions, performances, and conversations. Presented in collaboration with organizations working in art, creative technology, science, and social justice. Re–Fest is presented in an interactive format where ideas can intersect to shape a more just future.”
- `currentFestival` = `festival-2026`.
- `hasPage` = true.

### 9.4 Known content caveats

- The Figma “Current” block uses 2025 dates and 2025 copy as placeholder. The import uses the real 2026 dates and live 2026 copy.
- Figma artwork images are grey placeholders. The 2023 artwork images come from the live 2023 page.
- 2019–2024 archive records have no descriptions; the preview and template omit description blocks.
- The 2023 Figma content is the design's demo content; the live 2023 page is used to fill image URLs and confirm names.

---

## 10. Video stub

- Schema: `festival.videos[]` with title, artist, thumbnail, url.
- Component: `FestivalVideos` renders a Metal section with the “Videos” italic heading and a horizontal set of cards (thumbnail, title, artist).
- No `<video>`, no play button, no modal. The card is not a link until the videos ticket defines behavior.
- Section renders only when `videos.length > 0`.
- The 2023 import includes two videos (“Dyad: Two Bodies in Close Proximity” — NUUM Collective; “Every Day is Different” — Heidi Duckler Dance & Jeonghyeon Joo) so the stub is visible.
- Leave a `TODO(videos-ticket)` comment in `FestivalVideos.tsx`.

---

## 11. Testing

### Unit

- `client/__tests__/util/festival.test.ts` — anchors, location summaries, date lines, nav items, hrefs.
- `client/__tests__/components/shared/SectionHeading.test.tsx`
- `client/__tests__/components/shared/DetailSummary.test.tsx`
- `client/__tests__/components/Events/EventSummary.test.tsx` — regression for the `DetailSummary` refactor.

### Components

- `FestivalArchive` — rows render; first festival is previewed by default; hover and keyboard focus switch the preview; selected row updates.
- `FestivalFeature` — year, theme, date lines, summary, and “Visit Festival” link.
- `FestivalJumpTo` — About + location anchors; single-location and virtual-only cases.
- `FestivalSchedule` — day labels, times, descriptions, links; empty schedule renders nothing.
- `FestivalLocationSection` — artists and links; missing artists omitted.
- `FestivalFeaturedArtworks` — title/artist/description/image.
- `FestivalVideos` — cards render; no play button.
- `RefestPage` — Current and Archive sections; omitted when data is missing.
- `FestivalPage` — route renders a festival; unknown slug throws `notFound`.

### Commands

```bash
pnpm -C sanity typegen
pnpm -C client typecheck
pnpm -C client lint
pnpm -C client test
pnpm -C client build
pnpm -C sanity build
```

### Manual QA

- `/re-fest` desktop: header, Current feature, archive hover/focus, first item preview.
- `/re-fest` mobile: current feature stacks; archive rows show 132×125 images; no preview panel.
- `/re-fest/2026`: hero, about, one location, no empty artwork/partner/video headings.
- `/re-fest/2025`: two locations, schedules, artwork masonry, partners.
- `/re-fest/2023`: three locations including virtual, video stub, partners.
- Anchor jumps clear the fixed menu and sticky jump bar.
- Long artist lists and long artwork descriptions wrap without horizontal overflow.
- At 1440px, all Featured Artworks cards across both locations have the same measured height.
- The schedule is a continuous two-column grid with 2px ocher cell borders, no gaps, and blank filler cells for uneven columns.
- At 375px, artwork equal-height minimums are cleared, the schedule is one column, and content flows naturally.

---

## 12. Assumptions to confirm

1. `/re-fest/[slug]` with a year slug (`/re-fest/2025`) is acceptable; no `/festivals/*` namespace.
2. 2026 remains the “Current” festival even though its template is much lighter than 2025. The archive carries the full previous-year demo.
3. The 2023 content is worth importing in full as the design-accurate template demo, in addition to 2025.
4. The video stub is acceptable with no player until the videos ticket.
5. The archive starts on the first item rather than a blank panel.
