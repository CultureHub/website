# Re-Fest Page & Festival Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Re-Fest program page with a current-festival feature and hover archive, a festival detail template at `/re-fest/[slug]`, a `festival` Sanity document type, and an idempotent import of Figma + live festival content.

**Architecture:** Re-Fest stays a `program` document. A new `festival` document references the program and holds hero/about/locations/schedules/artworks/videos/partners. The existing `/[slug]` program route branches to a `RefestPage` server component; `/re-fest/[slug]` renders the festival template. The archive mirrors the events page's stacked-panel hover pattern. A one-off `sanity exec` import script uploads images and seeds festivals by deterministic id.

**Tech Stack:** Sanity v5 (`defineType`/`defineField`/`defineArrayMember`), GROQ, Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-21-refest-festival-design.md`

## Global Constraints

- Re-Fest is a `program`; do not create a second top-level Re-Fest page type.
- Festival route is `/re-fest/[slug]`; slug is the festival year (`2025`).
- The current festival is `program.currentFestival`; the archive is every other festival for that program ordered by `year desc`.
- All template sections are conditional; never render an empty heading or a section with no data.
- Use the actual design fonts on festival pages: `font-new-edge` (local `NewEdge666-SemiboldRounded.otf`) for NewEdge666 roles, and `font-schoolbook` / `font-schoolbook-condensed` (Adobe Fonts kit `qwz8mrs`) for SchoolBook roles. Milling/Brook remain the site-wide fonts for non-festival pages.
- Use the Re-Fest palette tokens in spec §5.4. Do not hard-code colors in components.
- `imageField` requires alt text. Every imported image must have a non-empty `alt`.
- Participant and partner names are strings, not artist references.
- The video section is a stub: no `<video>`, no player, no modal.
- Every new client component that uses hooks starts with `"use client"`.
- Run `pnpm -C sanity typegen` after schema changes.
- Before completion run: `pnpm -C client typecheck`, `pnpm -C client lint`, `pnpm -C client test`, `pnpm -C client build`, `pnpm -C sanity build`.

---

## Testing & QA Strategy

Testing happens at four levels. Every task includes its own automated tests; Tasks 10 and 11 are the integration and visual gates.

### 1. Automated unit tests

Pure logic in `client/src/util/festival.ts`: anchor generation, location-summary derivation, date lines, nav items, and festival hrefs. These run in Jest and do not need a browser or Sanity.

### 2. Automated component and page tests

Jest + Testing Library with `SanityImage` and `PortableText` mocked:

- Archive rows, default preview, hover/focus switching, selected row state.
- Current-festival feature content and “Visit Festival” link.
- Jump-menu anchors for two-location, single-location, and virtual-only festivals.
- Schedule rows, times, descriptions, and links.
- Location artist lists and conditional omission.
- Artwork cards and conditional omission.
- Video stub cards and the absence of a play control.
- Refest page section visibility when current/archive data is missing.
- Festival route `notFound()` behavior for an unknown slug.

### 3. Manual end-to-end verification

Run the app against the imported Sanity data and verify real navigation and data flow, not just rendered fixtures:

1. `/re-fest` loads; Current and Festival Archive headings are visible.
2. The first archive festival is previewed by default.
3. Hovering and keyboard-focusing another archive row switches the right-hand panel and highlights the row.
4. Clicking an archive row navigates to `/re-fest/<year>`.
5. The festival page jump menu scrolls to About and each location; the sticky bar stays under the global menu.
6. `/re-fest/2026` renders only its available sections; no empty headings.
7. `/re-fest/2025` renders both locations, schedules, artwork columns, and partners.
8. `/re-fest/2023` renders three locations including Virtual, the video stub, and partners.
9. Unknown `/re-fest/not-a-real-year` returns 404.
10. Mobile archive rows navigate directly and do not render a preview panel.

### 4. Visual QA

Compare the running site to the Figma frames at two viewports: desktop **1440px** and mobile **375px** (the design is 440px wide; 375px is the narrowest supported target). For each page, take a screenshot and check:

- Typography roles: NewEdge666 (`font-new-edge`) for display/headings, SchoolBook (`font-schoolbook`) and SchoolBook Condensed (`font-schoolbook-condensed`) for body/copy on festival pages.
- Re-Fest palette values: Metal `#15252B`, Cream `#FCF8E0`, Highlighter `#EDFD8B`, Ocher `#FFDE3E`, Pool `#7AB8B1`, Midnight `#5858BC`, Blue Smoke `#ACCEDB`.
- 1px CH Midnite borders on list rows, headings, and the archive seam.
- Current feature image/details proportions (637×606 desktop; stacked mobile).
- Archive list/preview split (671/641 desktop) and 132×125 mobile row images.
- Template hero heights (840px desktop, 348px mobile).
- Sticky jump bar clears the 61px global menu and anchor targets clear the 165px combined sticky offset.
- No horizontal overflow at 375px, especially artist lists, partner lists, and long artwork descriptions.
- No empty sections, broken images, or missing alt text.
- Hover/focus states are visible and the selected archive row uses RF Highlighter.

Use the Playwright browser tools to navigate, resize, hover, click, snapshot, and screenshot. Save screenshots under `/tmp/opencode/refest-visual-qa/` for comparison; do not commit them.

### 5. Definition of done

- All automated tests pass.
- Typecheck, lint, client build, and Sanity build pass.
- Every manual E2E scenario passes.
- Visual QA has been performed at 1440px and 375px, with any intentional deviations from Figma listed in the final report.
- No console errors or hydration warnings on the Re-Fest or festival pages.

---

## Review Focus

- A festival with only identity fields (archive stub) must render a template without crashing, without empty headings, and without a broken image.
- A single-location festival (2026) and a virtual-only festival must produce correct jump-menu anchors and omit absent sections.
- Missing images (archive stub without hero, artwork placeholder, video without thumbnail) must render nothing rather than a broken `next/image`.
- The archive must never show a blank preview: initial state is the first item, and hover/focus must switch it.
- Long artist, partner, and artwork-description content must wrap inside its column on mobile and desktop; no horizontal overflow.

---

## File Structure

```
sanity/
├── schemaTypes/
│   ├── festivalType.ts              # CREATE
│   ├── programType.ts               # MODIFY: currentFestival
│   └── index.ts                     # MODIFY: register festival
├── structure/
│   └── index.ts                     # MODIFY: Festivals list item
├── .gitignore                       # MODIFY: ignore import cache
└── scripts/
    └── import-refest/
        ├── README.md                # CREATE
        ├── import.ts                # CREATE
        ├── images.ts                # CREATE
        ├── build.ts                 # CREATE
        └── manifests/
            ├── 2023.ts              # CREATE
            ├── 2025.ts              # CREATE
            ├── 2026.ts              # CREATE
            └── archive.ts           # CREATE

client/src/
├── app/
│   ├── [slug]/page.tsx              # MODIFY: re-fest branch
│   ├── re-fest/[slug]/page.tsx      # CREATE: festival template route
│   └── globals.css                  # MODIFY: Re-Fest palette tokens
├── components/
│   ├── shared/
│   │   ├── SectionHeading.tsx       # CREATE
│   │   └── DetailSummary.tsx        # CREATE
│   ├── Events/
│   │   └── EventSummary.tsx         # MODIFY: use DetailSummary
│   ├── ProgramPage/
│   │   ├── ProgramHeader.tsx        # MODIFY: descriptionClassName
│   │   ├── FeaturedArtists.tsx      # MODIFY: use SectionHeading
│   │   └── FeaturedProjects.tsx     # MODIFY: use SectionHeading
│   ├── UpcomingEvents.tsx           # MODIFY: use SectionHeading
│   ├── Menu.tsx                     # MODIFY: Re-Fest href
│   ├── Refest/
│   │   ├── RefestPage.tsx           # CREATE
│   │   ├── FestivalFeature.tsx      # CREATE
│   │   ├── FestivalArchive.tsx      # CREATE
│   │   ├── FestivalArchiveRow.tsx   # CREATE
│   │   └── FestivalSummary.tsx      # CREATE
│   └── Festival/
│       ├── FestivalMeta.tsx         # CREATE
│       ├── FestivalJumpTo.tsx       # CREATE
│       ├── FestivalAbout.tsx        # CREATE
│       ├── FestivalLocationSection.tsx # CREATE
│       ├── FestivalSchedule.tsx     # CREATE
│       ├── FestivalFeaturedArtworks.tsx # CREATE
│       ├── FestivalVideos.tsx       # CREATE
│       └── FestivalPartners.tsx     # CREATE
├── sanity/queries.ts                # MODIFY
├── util/festival.ts                  # CREATE
└── sanity/types.ts                   # REGENERATED

client/__tests__/
├── util/festival.test.ts
├── components/shared/SectionHeading.test.tsx
├── components/shared/DetailSummary.test.tsx
├── components/Events/EventSummary.test.tsx
├── components/Refest/FestivalArchive.test.tsx
├── components/Refest/FestivalFeature.test.tsx
├── components/Refest/RefestPage.test.tsx
├── components/Festival/FestivalJumpTo.test.tsx
├── components/Festival/FestivalSchedule.test.tsx
├── components/Festival/FestivalLocationSection.test.tsx
├── components/Festival/FestivalFeaturedArtworks.test.tsx
├── components/Festival/FestivalVideos.test.tsx
└── app/refest/FestivalPage.test.tsx
```

---

### Task 1: Festival schema, program reference, palette, Studio list

**Files:**
- Create: `sanity/schemaTypes/festivalType.ts`
- Modify: `sanity/schemaTypes/programType.ts`
- Modify: `sanity/schemaTypes/index.ts`
- Modify: `sanity/structure/index.ts`
- Modify: `client/src/app/globals.css`

**Interfaces:**
- Produces: Sanity type `festival` with the fields in spec §5.2.
- Produces: `program.currentFestival` reference.
- Produces: Tailwind classes `bg-rf-metal`, `bg-rf-cream`, `bg-rf-highlighter`, `bg-rf-ocher`, `bg-rf-pool`, `bg-rf-midnight`, `bg-rf-blue-smoke`, and matching `text-*`/`border-*`.

- [ ] **Step 1: Create the festival schema**

Create `sanity/schemaTypes/festivalType.ts`. Use the existing helpers:

```ts
import {defineArrayMember, defineField, defineType, Rule} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons'

import {imageField} from '@/util/image'
import {linkField, linksField} from '@/util/link'
import {programField} from '@/util/program'
```

Field names and types must match the spec exactly:

```ts
export const festivalType = defineType({
  name: 'festival',
  title: 'Festival',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r: Rule) => r.required()}),
    defineField({
      name: 'year', type: 'number',
      validation: (r: Rule) => r.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: 'slug', type: 'slug',
      options: {source: 'year'},
      validation: (r: Rule) => r.required(),
    }),
    defineField({
      ...programField({title: 'Program', name: 'program'}),
      options: {filter: 'slug.current == "re-fest"'},
      validation: (r: Rule) => r.required(),
    }),
    defineField({name: 'startDate', title: 'Start Date', type: 'date'}),
    defineField({name: 'endDate', title: 'End Date', type: 'date'}),
    defineField({name: 'summary', type: 'text', rows: 3}),
    defineField({name: 'about', type: 'array', of: [{type: 'block'}]}),
    defineField(imageField({title: 'Hero Image', name: 'heroImage'})),
    defineField(imageField({title: 'Logo', name: 'logo'}, false)),
    defineField({
      name: 'locationSummary', title: 'Location Summary', type: 'string',
      description: 'Archive label override, e.g. "New York & Los Angeles", "Worldwide", "Online". Derived from locations when empty.',
    }),
    defineField(linksField({title: 'Festival Links', name: 'links'})),
    // locations, partnerGroups, videos defined below
  ],
})
```

Add:

- `locations`: array of object `festivalLocation` with `name` (required string), `kind` (select: `in-person`, `virtual`; initial `in-person`), `colorVariant` (select: `highlighter`, `pool`, `midnight`, `ocher`, `cream`, `metal`; initial `highlighter`), `dateLabel`, `venueName`, `address` (text), `details` (text), `links` (array of `linkField()`), `participatingArtists` (array of string), `schedule` (object), `featuredArtworks` (array of object).
- `schedule`: object with `days` array of object `festivalScheduleDay` with `dateLabel` (required string) and `items` array of object `festivalScheduleItem` with `time` (string), `description` (text), `links` (array of `linkField()`).
- `featuredArtworks`: object `festivalArtwork` with `title` (required string), `artist` (required string), `description` (text), `image` (`imageField`), `link` (url).
- `partnerGroups`: array of object `festivalPartnerGroup` with `title` (required string) and `names` (array of string).
- `videos`: array of object `festivalVideo` with `title` (required string), `artist` (string), `thumbnail` (`imageField(..., false)`), `url` (url).

Set previews:

```ts
preview: {
  select: {title: 'title', subtitle: 'year', media: 'heroImage'},
  prepare: ({title, subtitle, media}) => ({
    title: title || 'Untitled Festival',
    subtitle: subtitle ? String(subtitle) : '',
    media,
  }),
}
```

- [ ] **Step 2: Add `currentFestival` to the program schema**

In `sanity/schemaTypes/programType.ts`, add after `featuredProjects`:

```ts
defineField({
  title: 'Current Festival',
  name: 'currentFestival',
  type: 'reference',
  to: [{ type: 'festival' }],
  description:
    'Shown in the Current block on the Re-Fest page and excluded from the Festival Archive.',
}),
```

- [ ] **Step 3: Register the schema and Studio list**

In `sanity/schemaTypes/index.ts`, import `festivalType` and add it to `schemaTypes`.

In `sanity/structure/index.ts`, add before the divider:

```ts
S.listItem()
  .title('Festivals')
  .child(S.documentTypeList('festival').title('Festivals')),
```

- [ ] **Step 4: Add the palette tokens**

In `client/src/app/globals.css`, replace the unused `--color-re-fest-highlighter` line with:

```css
--color-rf-metal: #15252b;
--color-rf-cream: #fcf8e0;
--color-rf-highlighter: #edfd8b;
--color-rf-ocher: #ffde3e;
--color-rf-pool: #7ab8b1;
--color-rf-midnight: #5858bc;
--color-rf-blue-smoke: #accbdb;
```

- [ ] **Step 5: Generate types and verify the schema compiles**

Run: `pnpm -C sanity typegen`
Expected: command exits 0; `client/src/sanity/types.ts` contains `Festival` and `CurrentFestival`.

Run: `pnpm -C sanity build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add sanity/schemaTypes/festivalType.ts sanity/schemaTypes/programType.ts \
  sanity/schemaTypes/index.ts sanity/structure/index.ts \
  client/src/app/globals.css client/src/sanity/types.ts sanity/schema.json
git commit -m "feat: add festival schema and re-fest palette"
```

---

### Task 2: Festival queries and pure helpers

**Files:**
- Modify: `client/src/sanity/queries.ts`
- Create: `client/src/util/festival.ts`
- Test: `client/__tests__/util/festival.test.ts`

**Interfaces:**
- Produces: `getRefestPage(programSlug: string): Promise<RefestPageData | null>`
- Produces: `getFestivalBySlug(programSlug: string, slug: string): Promise<FestivalTemplateData | null>`
- Produces: `festivalAnchor(name: string): string`
- Produces: `festivalLocationSummary(locations: {name: string}[], override?: string | null): string`
- Produces: `festivalDateLines(locations: {name: string; kind?: string | null; dateLabel?: string | null}[]): string[]`
- Produces: `festivalNavItems(locations: {name: string}[]): {label: string; anchor: string}[]`
- Produces: `festivalHref(slug: string): string`

- [ ] **Step 1: Write the failing helper tests**

Create `client/__tests__/util/festival.test.ts`:

```ts
import {
  festivalAnchor,
  festivalDateLines,
  festivalHref,
  festivalLocationSummary,
  festivalNavItems,
} from "@/util/festival";

describe("festival helpers", () => {
  it("makes URL-safe anchors", () => {
    expect(festivalAnchor("New York")).toBe("new-york");
    expect(festivalAnchor("Virtual Gallery")).toBe("virtual-gallery");
    expect(festivalAnchor("Re–Fest & LA")).toBe("re-fest-la");
  });

  it("derives the archive location summary", () => {
    expect(festivalLocationSummary([{ name: "New York" }])).toBe("New York");
    expect(
      festivalLocationSummary([{ name: "New York" }, { name: "Los Angeles" }]),
    ).toBe("New York & Los Angeles");
    expect(
      festivalLocationSummary(
        [{ name: "New York" }, { name: "Los Angeles" }],
        "Worldwide",
      ),
    ).toBe("Worldwide");
  });

  it("formats date lines for the feature and preview", () => {
    expect(
      festivalDateLines([
        { name: "New York", kind: "in-person", dateLabel: "March 6-9th" },
        { name: "Los Angeles", kind: "in-person", dateLabel: "March 14-15th" },
        { name: "Virtual", kind: "virtual", dateLabel: "March 6-15th" },
      ]),
    ).toEqual([
      "March 6-9th in New York",
      "March 14-15th in Los Angeles",
      "March 6-15th",
    ]);
  });

  it("builds nav items with About first", () => {
    expect(
      festivalNavItems([
        { name: "New York" },
        { name: "Los Angeles" },
        { name: "Virtual Gallery" },
      ]),
    ).toEqual([
      { label: "About", anchor: "about" },
      { label: "New York", anchor: "new-york" },
      { label: "Los Angeles", anchor: "los-angeles" },
      { label: "Virtual Gallery", anchor: "virtual-gallery" },
    ]);
  });

  it("builds festival hrefs", () => {
    expect(festivalHref("2025")).toBe("/re-fest/2025");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm -C client test --watchAll=false __tests__/util/festival.test.ts`
Expected: FAIL with "Cannot find module '@/util/festival'".

- [ ] **Step 3: Implement the helpers**

Create `client/src/util/festival.ts`:

- `festivalAnchor`: lowercase, replace `&` with space, replace any run of non `[a-z0-9]+` with `-`, trim leading/trailing `-`.
- `festivalLocationSummary`: return trimmed override if non-empty; return `""` for no names; single name as-is; otherwise join with `, ` and ` & ` before the last.
- `festivalDateLines`: for each location with a `dateLabel`, return `kind === "virtual" ? dateLabel : \`${dateLabel} in ${name}\``.
- `festivalNavItems`: `[{label: "About", anchor: "about"}, ...locations.map(...)]`.
- `festivalHref`: `/re-fest/${slug}`.

Run the test again. Expected: PASS.

- [ ] **Step 4: Add the queries**

In `client/src/sanity/queries.ts`, add:

```ts
export async function getRefestPage(programSlug: string) {
  const query = defineQuery(`*[_type == "program" && slug.current == $programSlug][0]{
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
  }`);
  return client.fetch(query, { programSlug }, options);
}

export async function getFestivalBySlug(programSlug: string, slug: string) {
  const query = defineQuery(`*[
    _type == "festival"
    && slug.current == $slug
    && program->slug.current == $programSlug
  ][0]{
    _id, title, year, "slug": slug.current, summary, about,
    startDate, endDate, locationSummary,
    heroImage { asset, hotspot, crop, alt, credits },
    logo { asset, hotspot, crop, alt, credits },
    links[] { label, shortLabel, url },
    locations[] {
      _key, name, kind, colorVariant, dateLabel, venueName, address, details,
      links[] { label, shortLabel, url },
      participatingArtists,
      schedule {
        days[] {
          _key, dateLabel,
          items[] { _key, time, description, links[] { label, shortLabel, url } }
        }
      },
      featuredArtworks[] {
        _key, title, artist, description, link,
        image { asset, hotspot, crop, alt, credits }
      }
    },
    videos[] { _key, title, artist, url, thumbnail { asset, hotspot, crop, alt, credits } },
    partnerGroups[] { _key, title, names },
    "program": program->{ _id, title, "slug": slug.current, shortLabel, accentColor }
  }`);
  return client.fetch(query, { programSlug, slug }, options);
}

export type RefestPageData = NonNullable<Awaited<ReturnType<typeof getRefestPage>>>;
export type FestivalArchiveItem = RefestPageData["archive"][number];
export type FestivalTemplateData = NonNullable<Awaited<ReturnType<typeof getFestivalBySlug>>>;
export type FestivalLocation = FestivalTemplateData["locations"][number];
export type FestivalScheduleDay = NonNullable<NonNullable<FestivalLocation["schedule"]>["days"]>[number];
export type FestivalArtwork = NonNullable<FestivalLocation["featuredArtworks"]>[number];
export type FestivalVideo = FestivalTemplateData["videos"][number];
```

If typegen produces optional arrays (`locations?: ...`), add `NonNullable` in the type aliases rather than changing the query.

- [ ] **Step 5: Regenerate types and typecheck**

Run: `pnpm -C sanity typegen`
Expected: command exits 0 and `client/src/sanity/types.ts` includes the new query result types.

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/util/festival.ts client/__tests__/util/festival.test.ts \
  client/src/sanity/queries.ts client/src/sanity/types.ts
git commit -m "feat: add festival queries and helpers"
```

---

### Task 3: Extract `SectionHeading` and `DetailSummary`

**Files:**
- Create: `client/src/components/shared/SectionHeading.tsx`
- Create: `client/src/components/shared/DetailSummary.tsx`
- Modify: `client/src/components/Events/EventSummary.tsx`
- Modify: `client/src/components/ProgramPage/FeaturedArtists.tsx`
- Modify: `client/src/components/ProgramPage/FeaturedProjects.tsx`
- Modify: `client/src/components/UpcomingEvents.tsx`
- Test: `client/__tests__/components/shared/SectionHeading.test.tsx`
- Test: `client/__tests__/components/shared/DetailSummary.test.tsx`
- Test: `client/__tests__/components/Events/EventSummary.test.tsx`

**Interfaces:**
- Produces: `SectionHeading({ title, className? }: { title: string; className?: string })`
- Produces: `DetailSummary({ image?, imageClassName?, title, meta?, description?, actions?, contentClassName? })`

- [ ] **Step 1: Write the failing tests**

`SectionHeading.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import SectionHeading from "@/components/shared/SectionHeading";

it("renders the heading text", () => {
  render(<SectionHeading title="Festival Archive" />);
  expect(
    screen.getByRole("heading", { name: "Festival Archive" }),
  ).toBeInTheDocument();
});
```

`DetailSummary.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import DetailSummary from "@/components/shared/DetailSummary";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

it("renders title, meta, description, and actions", () => {
  render(
    <DetailSummary
      title={<h2>Re–Collect</h2>}
      meta={<span>March 6-9th in New York</span>}
      description={<p>A theme description.</p>}
      actions={<a href="/re-fest/2025">Visit Festival</a>}
    />,
  );
  expect(screen.getByRole("heading", { name: "Re–Collect" })).toBeInTheDocument();
  expect(screen.getByText("March 6-9th in New York")).toBeInTheDocument();
  expect(screen.getByText("A theme description.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Visit Festival" })).toBeInTheDocument();
});

it("omits the image when none is provided", () => {
  render(<DetailSummary title={<h2>No image</h2>} />);
  expect(screen.queryByTestId("sanity-image")).not.toBeInTheDocument();
});
```

`EventSummary.test.tsx`: mock `SanityImage` and `next-sanity` PortableText, then assert the event title, location, and link still render. Use an `EventListItem` fixture with `dateTimes` as in `EventsExplorer.test.tsx`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm -C client test --watchAll=false __tests__/components/shared`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement `SectionHeading`**

```tsx
export default function SectionHeading({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`border-t border-b border-ch-midnite py-6 ${className}`}>
      <h2 className="font-milling font-bold text-[28px]">{title}</h2>
    </div>
  );
}
```

- [ ] **Step 4: Implement `DetailSummary`**

```tsx
import type { ReactNode } from "react";
import SanityImage from "@/components/SanityImage";
import type { SanityImageSource } from "@sanity/image-url";

interface DetailSummaryProps {
  image?: SanityImageSource | null;
  imageClassName?: string;
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
}

export default function DetailSummary({
  image,
  imageClassName = "w-full h-[381px] object-cover",
  title,
  meta,
  description,
  actions,
  contentClassName = "gap-8",
}: DetailSummaryProps) {
  return (
    <div className="flex flex-col items-center gap-[18px]">
      {image && <SanityImage image={image} className={imageClassName} />}
      <div
        className={`flex flex-col px-6 pb-6 w-full max-w-[604px] ${contentClassName}`}
      >
        {title}
        {meta}
        {description}
        {actions}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Refactor `EventSummary`**

Replace its wrapper/image/title/meta/description/buttons with:

```tsx
<DetailSummary
  image={event.heroImage}
  title={
    <h2 className="font-milling font-bold text-5xl text-left text-ch-midnite">
      {event.title}
    </h2>
  }
  meta={
    <div className="flex flex-col gap-2.5 w-[478px] max-w-full">
      {/* existing location + dates markup */}
    </div>
  }
  description={
    event.description ? (
      <div className="font-milling font-light text-2xl text-ch-midnite">
        <PortableText value={event.description} />
      </div>
    ) : null
  }
  actions={
    <div className="flex flex-row flex-wrap items-center gap-4">
      {/* existing Button markup */}
    </div>
  }
/>
```

- [ ] **Step 6: Use `SectionHeading` in the three existing components**

In `FeaturedArtists.tsx`, `FeaturedProjects.tsx`, and `UpcomingEvents.tsx`, replace the duplicated:

```tsx
<div className="border-t border-b border-ch-midnite py-6 mb-9">
  <h2 className="font-milling font-bold text-[28px]">{title}</h2>
</div>
```

with `<SectionHeading title={title} className="mb-9" />`.

- [ ] **Step 7: Run the shared and event tests**

Run: `pnpm -C client test --watchAll=false __tests__/components/shared __tests__/components/Events`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/shared client/src/components/Events/EventSummary.tsx \
  client/src/components/ProgramPage/FeaturedArtists.tsx \
  client/src/components/ProgramPage/FeaturedProjects.tsx \
  client/src/components/UpcomingEvents.tsx client/__tests__/components/shared \
  client/__tests__/components/Events/EventSummary.test.tsx
git commit -m "refactor: extract section heading and detail summary"
```

---

### Task 4: Import infrastructure + 2026 current + archive stubs

**Files:**
- Create: `sanity/scripts/import-refest/README.md`
- Create: `sanity/scripts/import-refest/import.ts`
- Create: `sanity/scripts/import-refest/images.ts`
- Create: `sanity/scripts/import-refest/build.ts`
- Create: `sanity/scripts/import-refest/manifests/2026.ts`
- Create: `sanity/scripts/import-refest/manifests/archive.ts`
- Modify: `sanity/.gitignore`

**Interfaces:**
- Produces: `FestivalSeed`, `ImageSource`, `resolveImage`, `buildFestivalDocument`, `collectImageSources`, `imageKey`.
- Consumes: schema from Task 1.

- [ ] **Step 1: Define the manifest types**

In `build.ts`:

```ts
export type ImageSource =
  | { figmaNode: string; alt: string; filename: string }
  | { url: string; alt: string; filename: string }
  | { assetId: string; alt: string };

export interface FestivalSeed {
  id: string;                 // "festival-2026"
  title: string;
  year: number;
  slug: string;               // "2026"
  summary?: string;
  about?: string[];           // paragraphs
  heroImage: ImageSource;
  logo?: ImageSource;
  locationSummary?: string;
  links?: { label: string; shortLabel?: string; url: string }[];
  locations?: Array<{
    name: string;
    kind: "in-person" | "virtual";
    colorVariant: "highlighter" | "pool" | "midnight" | "ocher" | "cream" | "metal";
    dateLabel?: string;
    venueName?: string;
    address?: string;
    details?: string;
    links?: { label: string; shortLabel?: string; url: string }[];
    participatingArtists?: string[];
    schedule?: {
      days: Array<{
        dateLabel: string;
        items: Array<{
          time?: string;
          description?: string;
          links?: { label: string; shortLabel?: string; url: string }[];
        }>;
      }>;
    };
    featuredArtworks?: Array<{
      title: string;
      artist: string;
      description?: string;
      image: ImageSource;
      link?: string;
    }>;
  }>;
  partnerGroups?: Array<{ title: string; names: string[] }>;
  videos?: Array<{
    title: string;
    artist?: string;
    thumbnail?: ImageSource;
    url?: string;
  }>;
}
```

- [ ] **Step 2: Implement deterministic build**

In `build.ts`:

```ts
export function buildFestivalDocument(seed: FestivalSeed, images: Record<string, unknown>) {
  // Validate: title, year, slug, heroImage are present.
  // Throw an Error naming the festival and the missing field.
  // Return:
  // {
  //   _id: seed.id,
  //   _type: "festival",
  //   title: seed.title,
  //   year: seed.year,
  //   slug: { _type: "slug", current: seed.slug },
  //   program: { _type: "reference", _ref: PROGRAM_ID },
  //   summary: seed.summary,
  //   about: paragraphsToBlocks(seed.about),
  //   heroImage: images[seed.heroImage.filename],
  //   ...
  // }
}
```

Use `imageKey(source)` when reading resolved images:

```ts
export function imageKey(source: ImageSource): string {
  return "filename" in source ? source.filename : source.assetId;
}

export function collectImageSources(seed: FestivalSeed): ImageSource[] {
  // Walk heroImage, logo, every artwork image, and every video thumbnail.
  // Return unique sources keyed by imageKey.
}
```

`buildFestivalDocument` reads `images[imageKey(seed.heroImage)]`, not `images[seed.heroImage.filename]`.

`paragraphsToBlocks` maps each paragraph to a Sanity block:

```ts
{
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", marks: [], text: paragraph }],
}
```

Give every block/span a stable `_key` derived from the festival id, field name, and index (e.g. `2026-about-1`).

Every array member also needs a stable `_key`. Use the festival id plus the path and indices:

```ts
key(seed.id, "loc", i)                    // locations[i]
key(seed.id, "loc", i, "day", j)          // schedule.days[j]
key(seed.id, "loc", i, "day", j, "item", k)
key(seed.id, "loc", i, "art", k)          // featuredArtworks[k]
key(seed.id, "link", path)                // links
key(seed.id, "partner", i)                // partnerGroups[i]
key(seed.id, "video", i)                  // videos[i]
```

This is required for Sanity array validation and makes re-imports stable.

- [ ] **Step 3: Implement image resolution**

In `images.ts`:

```ts
import {getCliClient} from 'sanity/cli'

const FIGMA_FILE_KEY = 'erOB5ZYdcXZ27cukPYrfZr'
const client = getCliClient({apiVersion: '2024-01-01'})

export async function resolveImage(source: ImageSource) {
  // {assetId} -> {_type: "image", asset: {_type: "reference", _ref: assetId}, alt}
  // else check *[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id
  // else fetch bytes (Figma export or URL) and client.assets.upload("image", buffer, {filename})
}
```

Figma export:

```ts
const res = await fetch(
  `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(source.figmaNode)}&format=png&scale=2`,
  { headers: { "X-Figma-Token": process.env.CAM_FIGMA_API_KEY ?? "" } },
);
const { images } = await res.json();
const imageUrl = images[source.figmaNode];
```

Then `fetch(imageUrl)` and upload. Throw a clear error if the key or URL is missing.

- [ ] **Step 4: Implement the CLI**

In `import.ts`:

```ts
const isWrite = process.argv.includes("--write");
const isDryRun = process.argv.includes("--dry-run") || !isWrite;

const seeds = [...refest2026, ...archiveSeeds];
const images = {};
for (const seed of seeds) {
  for (const source of collectImageSources(seed)) {
    images[source.filename ?? source.assetId] = await resolveImage(source);
  }
}

for (const seed of seeds) {
  const doc = buildFestivalDocument(seed, images);
  if (isDryRun) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    await client.createOrReplace(doc);
  }
}
```

At the end, when writing, patch the Re-Fest program:

```ts
await client
  .patch(PROGRAM_ID)
  .set({
    currentFestival: { _type: "reference", _ref: "festival-2026" },
    hasPage: true,
    pageDescription: paragraphsToBlocks([
      "Re–Fest is an annual festival of exhibitions, performances, and conversations. Presented in collaboration with organizations working in art, creative technology, science, and social justice. Re–Fest is presented in an interactive format where ideas can intersect to shape a more just future.",
    ]),
  })
  .commit();
```

Resolve the program by slug instead of hard-coding an id:

```ts
const program = await client.fetch(
  `*[_type == "program" && slug.current == "re-fest"][0]{_id}`,
);
if (!program?._id) throw new Error("Re-Fest program document not found");
```

Use `PROGRAM_ID = program._id` for the patch and for every festival's `program` reference.

- [ ] **Step 5: Write the 2026 manifest**

`manifests/2026.ts` uses live `/re-fest-2026` content:

- `id: "festival-2026"`, `title: "Re–Mapping"`, `year: 2026`, `slug: "2026"`.
- `summary`: “Our 2026 festival introduces the theme Re–Mapping, which gestures toward experiences of re-telling, re-seeing, and re-learning.”
- `about`: three paragraphs from the live 2026 About section (the theme paragraph, the NEA funding paragraph, and the two-year exploration paragraph).
- `heroImage`: `{ assetId: "image-21bac27217a3e5e94df6e6f7aa4641b700c064a8-1358x1340-png", alt: "Re–Fest Re–Mapping, Graphic by Tee Topor, 2026" }` (the existing program hero).
- `locationSummary: "New York"`.
- `locations`: one `New York` / `in-person` / `highlighter` location, `dateLabel: "March 20th-27th"`, `venueName: "CultureHub NYC"`, `address: "47 Great Jones, Floor 3"`.
- No schedule, artworks, videos, or partners in the first pass.

- [ ] **Step 6: Write the archive stubs**

`manifests/archive.ts` contains 2024, 2022, 2021, 2020, 2019:

| Year | Title | Location summary | Figma hero node |
|---|---|---|---|
| 2024 | Re–Source | Worldwide | `2214:7062` |
| 2022 | Re–Unification | Online | `2231:7154` |
| 2021 | Re–Circulation | Online | `2231:7162` |
| 2020 | Re–Generation | New York & Los Angeles | `2231:7172` |
| 2019 | Re–Fest | New York & Los Angeles | `2231:7180` |

Each seed uses `id: "festival-<year>"`, `slug: "<year>"`, `heroImage: { figmaNode, alt: "Re–Fest <year> archive image", filename: "refest-<year>-hero.png" }`, and no `about`/`locations`.

- [ ] **Step 7: Add the cache to `.gitignore` and document usage**

Add `scripts/import-refest/.cache` to `sanity/.gitignore`.

`README.md` documents:

```bash
# Dry run (no writes)
pnpm -C sanity exec scripts/import-refest/import.ts --with-user-token -- --dry-run

# Write
pnpm -C sanity exec scripts/import-refest/import.ts --with-user-token -- --write
```

and the required `CAM_FIGMA_API_KEY` env var.

- [ ] **Step 8: Dry-run and write**

Run: `pnpm -C sanity exec scripts/import-refest/import.ts --with-user-token -- --dry-run`
Expected: JSON for `festival-2026` and five archive festivals; no missing-field errors.

Run with `--write`.
Expected: `createOrReplace` succeeds for six documents; program patch succeeds.

Verify with Sanity:

```bash
curl -sG "https://2r5hg86f.api.sanity.io/v2024-01-01/data/query/production" \
  --data-urlencode 'query=*[_type=="festival"]{title,year,slug}' \
  -H "Authorization: Bearer $CULTUREHUB_SANITY_TOKEN"
```

Expected: six festivals, 2019–2026 except 2023 and 2025 (added in later tasks).

- [ ] **Step 9: Commit**

```bash
git add sanity/scripts/import-refest sanity/.gitignore
git commit -m "feat: add festival import pipeline and re-fest 2026 seed"
```

---

### Task 5: Import 2025 Re–Collect

**Files:**
- Create: `sanity/scripts/import-refest/manifests/2025.ts`
- Modify: `sanity/scripts/import-refest/import.ts`

**Interfaces:**
- Consumes: `FestivalSeed` and image pipeline from Task 4.

- [ ] **Step 1: Build the 2025 seed from the live page**

Use https://www.culturehub.org/re-fest-2025 and the extracted image URLs.

Identity:

- `id: "festival-2025"`, `title: "Re–Collect"`, `year: 2025`, `slug: "2025"`.
- `locationSummary: "New York & Los Angeles"`.
- `summary`: “The theme, Re–Collect, centers recollection equally with collecting as a practice. What mark do our collections make on the world? What gaps are left by those that are missing? Where can collections be restored, created, or dismantled to create a more just future?”
- `about`: the four About paragraphs from the live page.
- `heroImage`: `https://images.squarespace-cdn.com/content/v1/5b2bb6b44611a0340651820a/1741716511641-KZCBSIWDNCMYL9L9T18M/square-space+banner2.jpg` with alt “Re–Fest 2025 banner”.

Locations:

| Location | kind | colorVariant | dateLabel | venueName | address |
|---|---|---|---|---|---|
| New York | in-person | highlighter | March 6-9th | La MaMa | 74a E 4th Street |
| Los Angeles | in-person | pool | March 14 & 15th | The Reef | 1933 S Broadway, Suite 1268 |

Add the 29 NYC and 13 LA participating artist names as string arrays (from the live page).

Schedules:

- NYC: four days — Thursday, March 6th; Friday, March 7th; Saturday, March 8th; Sunday, March 9th. Import every time/description and RSVP link from the live page.
- LA: two days — Friday, March 14th; Saturday, March 15th. Import every time/description and RSVP link.

Featured artworks:

- Import all 21 NYC and 12 LA artworks from the live page.
- Each artwork has `title`, `artist`, `description`, and the live Squarespace `image` URL with alt set to the artwork title.
- Use the live page order.
- Do not invent descriptions for works that have none.

Partners:

- `Creative Partners`: Relative Arts NYC, NYU ITP, La MaMa Archive, The W.O.W. Project, Youth Digital Group, SUPERCOLLIDER, Cal Arts.
- `Outreach Partners`: The Africa Center, Artifice, The Fire This Time Festival, Frigid, Onassis ONX.

- [ ] **Step 2: Add the seed to the import list**

In `import.ts`, import `refest2025` and include it in `seeds`.

- [ ] **Step 3: Dry-run, then write**

Run dry-run. Expected: one festival document with 2 locations, 33 artworks total, 2 partner groups, 6 schedule days.

Run `--write`.

Verify:

```bash
curl -sG "https://2r5hg86f.api.sanity.io/v2024-01-01/data/query/production" \
  --data-urlencode 'query=*[_type=="festival" && year==2025][0]{"locations": count(locations), "artworks": count(locations[].featuredArtworks[]), "partners": count(partnerGroups)}' \
  -H "Authorization: Bearer $CULTUREHUB_SANITY_TOKEN"
```

Expected: `locations: 2`, `artworks: 33`, `partners: 2`.

- [ ] **Step 4: Commit**

```bash
git add sanity/scripts/import-refest/manifests/2025.ts sanity/scripts/import-refest/import.ts
git commit -m "feat: import re-fest 2025 content"
```

---

### Task 6: Import 2023 Re–New (Figma demo)

**Files:**
- Create: `sanity/scripts/import-refest/manifests/2023.ts`
- Modify: `sanity/scripts/import-refest/import.ts`

**Interfaces:**
- Consumes: `FestivalSeed` and image pipeline from Task 4.

- [ ] **Step 1: Build the 2023 identity and about**

- `id: "festival-2023"`, `title: "Re–New"`, `year: 2023`, `slug: "2023"`.
- `locationSummary: "New York & Los Angeles"`.
- `summary`: “The theme for Re–Fest 2023 is Re-New, which critically examines our culture’s obsession with newness.”
- `about`: the full theme paragraph from Figma node `3027:3571` / live `/re-fest-2023`.
- `heroImage`: Figma `3024:3540` (full-bleed hero), alt “Re–Fest 2023 hero”.
- `logo`: Figma `3027:3556`, alt “Re–New festival mark”.

- [ ] **Step 2: Build the three locations**

| Location | kind | colorVariant | dateLabel | venueName | address | Figma section |
|---|---|---|---|---|---|---|
| New York | in-person | highlighter | April 20-29, 2023 | La MaMa Galleria | 47 Great Jones Street | `3027:3576` |
| Los Angeles | in-person | pool | April 28–29, 2023 | Hot Shot Muffler | 5507 York Boulevard | `3039:600` |
| Virtual Gallery | virtual | midnight | April 20–29, 2023 | — | — | `3048:4307` |

For each location:

- `links`: use the Figma “View Exhibition Guide” / “Access Audio Descriptions” / “Enter Lobby” URLs.
- `participatingArtists`: use the Figma lists (NYC node `3058:8054`, LA node `3052:4439`, Virtual node `3052:4432`). Split names into string items.
- `schedule.days`: use the Figma schedule blocks (`3048:4299` NYC, `3048:4300` LA, `3052:4419` Virtual). Each block’s date label becomes `dateLabel`; each row’s time and copy become `time` and `description`; RSVP links go in `links`.
- `details`: use the date/time/access lines (e.g. “Thursday - Sunday, 1-7pm ET”).

- [ ] **Step 3: Build featured artworks**

NYC and LA each get the 9 artwork items shown in the Figma template:

NYC section `3058:8055`, artwork nodes: `3054:7966`, `3054:7972`, `3054:7978`, `3057:8004`, `3057:8013`, `3057:8020`, `3057:8027`, `3057:8034`, `3057:8041`.

LA section `3058:8058`, artwork nodes: `3058:8062`, `3058:8068`, `3058:8074`, `3058:8080`, `3058:8086`, `3058:8092`, `3058:8098`, `3058:8104`, `3058:8110`.

For each artwork:

- `title`, `artist`, `description` from Figma.
- `image`: use the live 2023 page image for that artwork (Figma images are grey placeholders). The mapping is by title:
  - Ancient Futures → `.../1680821250132-J667EKQNBLUH6RYAAGWD/L1090919-min.jpg`
  - Archive of Digital Portraits Cast in Concrete → `.../1681153079654-40TLY7Z0T3CNHUD2L2XJ/DSC_7006.JPG`
  - Biota → `.../1680821638572-DM0O8C3MNPIAN1B7927C/220520_SVA_Bioart_Show_155.jpg`
  - CAD → `.../1681402457280-LG0YQKNIYBVS6WQKYF6K/CAD+Still+03.jpg`
  - Dance Permit (Denied) → `.../1681404886537-HTYLSR4MAP67GN8TFT3J/DPD+2.png`
  - Conversations With My Deepfake Dad → `.../1680823281561-N26Z0EESZ723FUV6GQIR/sweeney_small.jpg`
  - Food From Upper Bogota River → `.../1681328927624-6AV77ELEGND7TYTC2EOC/Screen+Shot+2023-04-12+at+3.47.44+PM.png`
  - Impetus: Arrancado → `.../1680815894366-4KNOB368JSR8GQ0H5C54/Arrancado.jpeg`
  - Living Taxidermy → `.../1680816237846-BM76D2H8J9T96Z6A949P/kombuchacat+closeup1.jpg`
  - Use the same live image URLs for the LA copies where the work appears in both locations.

- [ ] **Step 4: Add videos and partners**

Videos (stub data from Figma):

| Title | Artist | Figma thumbnail |
|---|---|---|
| Dyad: Two Bodies in Close Proximity | NUUM Collective | `3094:7440` |
| Every Day is Different | Heidi Duckler Dance & Jeonghyeon Joo | `3094:7441` |

Partners: one group titled “Partners” with the names from Figma node `3064:8180`:

Arium, High Desert Soundings, Hot Shot Muffler, Hyphen Hub, La MaMa Galleria, Seoul Institute of the Arts, SUPERCOLLIDER, SVA Bio Art Lab, UCLA Art|Sci Center, Línea de Arte, Ciencia y Tecnología - Idartes.

- [ ] **Step 5: Add to import list, dry-run, write, verify**

Add `refest2023` to `seeds`.

Run dry-run. Expected: 3 locations, 18 artworks, 2 videos, 1 partner group.

Run `--write`.

Verify:

```bash
curl -sG "https://2r5hg86f.api.sanity.io/v2024-01-01/data/query/production" \
  --data-urlencode 'query=*[_type=="festival" && year==2023][0]{"locations": count(locations), "artworks": count(locations[].featuredArtworks[]), "videos": count(videos), "partners": count(partnerGroups)}' \
  -H "Authorization: Bearer $CULTUREHUB_SANITY_TOKEN"
```

Expected: `locations: 3`, `artworks: 18`, `videos: 2`, `partners: 1`.

- [ ] **Step 6: Commit**

```bash
git add sanity/scripts/import-refest/manifests/2023.ts sanity/scripts/import-refest/import.ts
git commit -m "feat: import re-fest 2023 design content"
```

---

### Task 7: Re-Fest page — feature, archive, and program route branch

**Files:**
- Create: `client/src/components/Festival/FestivalMeta.tsx`
- Create: `client/src/components/Refest/RefestPage.tsx`
- Create: `client/src/components/Refest/FestivalFeature.tsx`
- Create: `client/src/components/Refest/FestivalArchive.tsx`
- Create: `client/src/components/Refest/FestivalArchiveRow.tsx`
- Create: `client/src/components/Refest/FestivalSummary.tsx`
- Modify: `client/src/app/[slug]/page.tsx`
- Modify: `client/src/components/ProgramPage/ProgramHeader.tsx`
- Modify: `client/src/components/Menu.tsx`
- Test: `client/__tests__/components/Refest/RefestPage.test.tsx`
- Test: `client/__tests__/components/Refest/FestivalArchive.test.tsx`
- Test: `client/__tests__/components/Refest/FestivalFeature.test.tsx`

**Interfaces:**
- Consumes: `getRefestPage`, `RefestPageData`, `FestivalArchiveItem`, `festivalAnchor`, `festivalDateLines`, `festivalLocationSummary`, `festivalHref`.
- Produces: `RefestPage({ data }: { data: RefestPageData })`
- Produces: `FestivalFeature({ festival }: { festival: FestivalArchiveItem })`
- Produces: `FestivalArchive({ festivals }: { festivals: FestivalArchiveItem[] })`
- Produces: `FestivalArchiveRow({ festival, selected, onHover })`
- Produces: `FestivalSummary({ festival })`
- Produces: `FestivalYearTitle({ festival, size })`, `FestivalDateLines({ festival })`, `FestivalActions({ festival })` from `FestivalMeta.tsx`.

- [ ] **Step 1: Add `descriptionClassName` to `ProgramHeader`**

Add the prop:

```ts
interface ProgramHeaderProps {
  program: Program;
  hasArtists?: boolean;
  descriptionClassName?: string;
}
```

Use it on the page description wrapper:

```tsx
<div className={`max-w-[614px] text-2xl font-light ${descriptionClassName ?? "font-milling"}`}>
```

Re-Fest passes `descriptionClassName="font-brook font-normal"` so the body copy is Brook 24px.

- [ ] **Step 2: Build the shared festival detail pieces**

`FestivalMeta.tsx` exports three server-safe components (no hooks):

```tsx
export function FestivalYearTitle({
  festival,
  size,
}: {
  festival: FestivalArchiveItem;
  size: "feature" | "summary";
}) {
  const textSize = size === "feature" ? "text-[48px]" : "text-[32px]";
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-8">
      <span className={`font-brook ${textSize} leading-none`}>{festival.year}</span>
      <span className={`font-milling font-semibold ${textSize} tracking-[-0.04em] leading-none`}>
        {festival.title}
      </span>
    </div>
  );
}

export function FestivalDateLines({ festival }: { festival: FestivalArchiveItem }) {
  const lines = festivalDateLines(festival.locations ?? []);
  if (lines.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((line) => (
        <p key={line} className="font-brook text-xl">{line}</p>
      ))}
    </div>
  );
}

export function FestivalActions({ festival }: { festival: FestivalArchiveItem }) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-4">
      {festival.links?.map((link) => (
        <Button key={link._key} variant="ticket" href={link.url} openNewTab>
          {link.shortLabel ?? link.label}
        </Button>
      ))}
      <Button variant="ticket" href={festivalHref(festival.slug)}>
        Visit Festival
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Build `FestivalFeature`**

Layout:

```tsx
<div className="flex flex-col md:flex-row md:justify-center md:items-center gap-9 md:gap-[55px]">
  <SanityImage
    image={festival.heroImage}
    className="w-full md:w-[637px] h-[576px] md:h-[606px] object-cover border border-ch-midnite"
  />
  <div className="flex flex-col justify-center gap-7 md:w-[604px]">
    <FestivalYearTitle festival={festival} size="feature" />
    <FestivalDateLines festival={festival} />
    {festival.summary && (
      <p className="font-brook text-2xl text-ch-midnite">{festival.summary}</p>
    )}
    <FestivalActions festival={festival} />
  </div>
</div>
```

- [ ] **Step 4: Build `FestivalArchiveRow`**

Props:

```ts
{
  festival: FestivalArchiveItem;
  selected: boolean;
  onHover: () => void;
}
```

Desktop row (`hidden md:grid`):

```tsx
<Link
  href={festivalHref(festival.slug)}
  onMouseEnter={onHover}
  onFocus={onHover}
  className={`grid grid-cols-[1fr_2fr] grid-rows-[1fr_3fr] gap-x-9 gap-y-[18px] p-[18px] border-b border-r border-ch-midnite ${
    selected ? "bg-rf-highlighter" : "bg-ch-lite"
  }`}
>
  <span className="font-brook text-xs">
    {festivalLocationSummary(festival.locations ?? [], festival.locationSummary)}
  </span>
  <span className="font-brook italic text-xs">Re–Fest</span>
  <span className="font-brook text-[32px] uppercase leading-none">{festival.year}</span>
  <span className="font-milling font-semibold text-[28px] tracking-[-0.04em] leading-tight">{festival.title}</span>
</Link>
```

Mobile row (`md:hidden`):

```tsx
<Link href={...} className="flex flex-row items-center border-b border-r border-ch-midnite">
  <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch gap-2 p-[18px]">
    <span className="font-brook text-xs">
      {festivalLocationSummary(festival.locations ?? [], festival.locationSummary)}
    </span>
    <span className="font-brook text-2xl uppercase">{festival.year}</span>
    <span className="font-milling font-semibold text-[28px] tracking-[-0.04em]">{festival.title}</span>
  </div>
  {festival.heroImage ? (
    <SanityImage
      image={festival.heroImage}
      className="w-[132px] h-[125px] shrink-0 object-cover"
    />
  ) : (
    <div className="w-[132px] h-[125px] shrink-0" />
  )}
</Link>
```

The info column is `flex-1 min-w-0` so it shrinks on 375px screens instead of forcing horizontal overflow.

- [ ] **Step 5: Build `FestivalSummary`**

Use `DetailSummary`:

```tsx
<DetailSummary
  image={festival.heroImage}
  imageClassName="w-full h-[374px] object-cover"
  contentClassName="gap-7"
  title={<FestivalYearTitle festival={festival} size="summary" />}
  meta={<FestivalDateLines festival={festival} />}
  description={
    festival.summary ? (
      <p className="font-brook text-2xl text-ch-midnite">{festival.summary}</p>
    ) : null
  }
  actions={<FestivalActions festival={festival} />}
/>
```

- [ ] **Step 6: Build `FestivalArchive`**

`"use client"`. State:

```ts
const [hoveredId, setHoveredId] = useState<string | null>(null);
const preview = festivals.find((f) => f._id === hoveredId) ?? festivals[0] ?? null;
```

Desktop layout:

```tsx
<div className="flex flex-col border-l border-ch-midnite md:grid md:grid-cols-[671fr_641fr]">
  <div className="flex min-w-0 flex-col">
    {festivals.map((f) => (
      <FestivalArchiveRow
        key={f._id}
        festival={f}
        selected={f._id === preview?._id}
        onHover={() => setHoveredId(f._id)}
      />
    ))}
  </div>
  <div className="hidden md:grid min-w-0 border-l border-ch-midnite">
    {festivals.map((f) => (
      <div
        key={f._id}
        className={`col-start-1 row-start-1 ${
          f._id === preview?._id ? "" : "invisible"
        }`}
      >
        <FestivalSummary festival={f} />
      </div>
    ))}
  </div>
</div>
```

Mobile rows are inside `FestivalArchiveRow` (`md:hidden`), so the list container renders both responsive row variants. The grid uses the Figma 671/641 split on desktop.

- [ ] **Step 7: Build `RefestPage`**

```tsx
import ProgramHeader from "@/components/ProgramPage/ProgramHeader";
import SectionHeading from "@/components/shared/SectionHeading";
import FestivalFeature from "@/components/Refest/FestivalFeature";
import FestivalArchive from "@/components/Refest/FestivalArchive";
import type { RefestPageData } from "@/sanity/queries";

export default function RefestPage({ data }: { data: RefestPageData }) {
  return (
    <main className="min-h-screen">
      <ProgramHeader
        program={data}
        hasArtists={false}
        descriptionClassName="font-brook font-normal"
      />
      {data.currentFestival && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading title="Current" className="mb-9" />
          <FestivalFeature festival={data.currentFestival} />
        </section>
      )}
      {(data.archive?.length ?? 0) > 0 && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading title="Festival Archive" className="mb-9" />
          <FestivalArchive festivals={data.archive ?? []} />
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 8: Branch the program route**

In `client/src/app/[slug]/page.tsx`, add at the top of the component, after resolving `slug`:

```tsx
if (slug === "re-fest") {
  const data = await getRefestPage(slug);
  if (!data) notFound();
  return <RefestPage data={data} />;
}
```

Keep the existing generic program path unchanged. Import `getRefestPage` and `RefestPage`.

- [ ] **Step 9: Fix the menu link**

In `client/src/components/Menu.tsx`, add `href="/re-fest"` to the Re-Fest `MenuButton`.

- [ ] **Step 10: Write component tests**

`FestivalFeature.test.tsx`: render with a festival fixture; assert year, theme, “March 6-9th in New York”, summary, and link href `/re-fest/2025`.

`FestivalArchive.test.tsx`: render two festivals; assert both years/themes; assert the first festival’s summary is visible by default; `await userEvent.hover(screen.getAllByText("Re–Collect")[0])`; assert the second festival’s summary is visible. Mock `SanityImage`. Use `getAllByText` because the theme appears in both the row and the preview panel.

`RefestPage.test.tsx`: render with `currentFestival` + archive; assert “Current”, “Festival Archive”, current theme, archive theme. Render without archive and assert no “Festival Archive” heading.

- [ ] **Step 11: Run tests and typecheck**

Run: `pnpm -C client test --watchAll=false __tests__/components/Refest`
Expected: PASS.

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add client/src/components/Festival/FestivalMeta.tsx client/src/components/Refest \
  client/src/app/[slug]/page.tsx client/src/components/ProgramPage/ProgramHeader.tsx \
  client/src/components/Menu.tsx client/__tests__/components/Refest
git commit -m "feat: add re-fest page with current festival and archive"
```

---

### Task 8: Festival template route and sections

**Files:**
- Create: `client/src/app/re-fest/[slug]/page.tsx`
- Create: `client/src/components/Festival/FestivalJumpTo.tsx`
- Create: `client/src/components/Festival/FestivalAbout.tsx`
- Create: `client/src/components/Festival/FestivalLocationSection.tsx`
- Create: `client/src/components/Festival/FestivalSchedule.tsx`
- Create: `client/src/components/Festival/FestivalFeaturedArtworks.tsx`
- Create: `client/src/components/Festival/FestivalPartners.tsx`
- Test: `client/__tests__/components/Festival/FestivalJumpTo.test.tsx`
- Test: `client/__tests__/components/Festival/FestivalSchedule.test.tsx`
- Test: `client/__tests__/components/Festival/FestivalLocationSection.test.tsx`
- Test: `client/__tests__/components/Festival/FestivalFeaturedArtworks.test.tsx`
- Test: `client/__tests__/app/refest/FestivalPage.test.tsx`

**Interfaces:**
- Consumes: `getFestivalBySlug`, `FestivalTemplateData`, `festivalNavItems`, `festivalAnchor`.
- Produces: `FestivalJumpTo({ festival })`, `FestivalAbout({ festival })`, `FestivalLocationSection({ location })`, `FestivalSchedule({ schedule })`, `FestivalFeaturedArtworks({ artworks })`, `FestivalPartners({ groups })`.

- [ ] **Step 1: Build `FestivalJumpTo`**

`"use client"` is not required; it uses anchor links only. Render:

```tsx
<nav className="sticky top-[61px] z-40 bg-ch-lite border-b border-ch-midnite">
  <div className="px-6 md:px-16 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div className="flex items-baseline gap-2.5">
      <span className="font-brook text-[38px] leading-none text-rf-metal">{festival.year}</span>
      <span className="font-milling font-semibold text-4xl tracking-[-0.02em] text-rf-metal">{festival.title}</span>
    </div>
    <div className="flex flex-wrap gap-4">
      {festivalNavItems(festival.locations ?? []).map((item) => (
        <a
          key={item.anchor}
          href={`#${item.anchor}`}
          className="inline-flex h-[34px] w-[172px] items-center justify-center rounded-[5px] border border-rf-metal bg-rf-blue-smoke px-2.5 pt-[5px] font-milling text-xl uppercase text-rf-metal"
        >
          {item.label}
        </a>
      ))}
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Build `FestivalAbout`**

Metal background, `scroll-mt-[165px]`, `id="about"`.

Desktop: `md:flex-row md:justify-between p-16`, left `w-[482px]`, right `w-[777px]`.
Mobile: `flex-col gap-[72px] px-6 py-16`.

Left column:

- `logo` image if present.
- Theme title always rendered below the logo: `font-milling font-semibold text-[60px] uppercase text-rf-ocher` (e.g. “RE–NEW”).
- For each location: name (Ocher), dateLabel (Cream), venueName + address (Cream). Use `font-brook text-2xl` and `whitespace-pre-line`.
- Link rows use `font-brook text-xl underline`.

Right column: `about` PortableText in `font-brook text-[27px] text-rf-cream`.

- [ ] **Step 3: Build `FestivalLocationSection`**

Props: `{ location: FestivalLocation }`. `id={festivalAnchor(location.name)}` and `scroll-mt-[165px]`.

Background by `location.colorVariant`:

```ts
const variantClass = {
  highlighter: "bg-rf-highlighter text-ch-midnite",
  pool: "bg-rf-pool text-rf-metal",
  midnight: "bg-rf-midnight text-rf-blue-smoke",
  ocher: "bg-rf-ocher text-rf-metal",
  cream: "bg-rf-cream text-rf-metal",
  metal: "bg-rf-metal text-rf-cream",
}[location.colorVariant ?? "highlighter"];
```

Desktop: `md:flex-row md:justify-between px-6 py-8 md:px-16`. Mobile: `flex-col gap-16`.

Details:

- `h2` name in `font-brook italic text-[40px]`.
- `dateLabel`, `venueName`, `address`, `details` in `font-brook text-2xl whitespace-pre-line`.
- `links` rendered as underlined `font-brook text-xl` anchors (open new tab).
- Artist list: heading “Participating Artists” in `font-brook italic text-[40px]`, then each name as a block in `font-milling font-semibold text-2xl`.
- Omit the artist block if `participatingArtists` is empty.

- [ ] **Step 4: Build `FestivalSchedule`**

Props: `{ schedule: NonNullable<FestivalLocation["schedule"]> }`. Cream background.

Render `schedule.days` as a seamless two-column grid matching Figma node `3048:4299`. There are no gaps. The grid container owns the left/top 2px ocher border; each day cell owns its right/bottom 2px border. A day cell is `h-full flex flex-col` so it stretches to the row height, and a `flex-1` cream filler preserves the grid when the adjacent day is taller. The last content row inside each cell uses `last:border-b-0`; the cell's single bottom border closes it, so content touching the cell bottom does not produce a double border. When the number of days is odd, append a hidden-on-mobile blank filler cell for the second column. The section uses `md:px-9` (36px) to match the Figma 1368px grid.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 border-l-2 border-t-2 border-rf-ocher">
  {schedule.days.map((day) => (
    <div
      key={day._key}
      className="flex h-full flex-col border-r-2 border-b-2 border-rf-ocher bg-rf-cream"
    >
      <div className="border-b-2 border-rf-ocher bg-rf-highlighter px-6 py-8 text-center">
        <h3 className="font-milling font-semibold text-4xl uppercase text-rf-ocher">
          {day.dateLabel}
        </h3>
      </div>
      <div className="flex flex-col">
        {day.items.map((item) => (
          <div
            key={item._key}
            className="flex flex-col md:flex-row md:justify-between gap-2 border-b-2 border-rf-ocher px-6 py-2.5 last:border-b-0"
          >
            {item.time && (
              <span className="font-milling font-semibold text-[32px] text-rf-ocher shrink-0 whitespace-nowrap">
                {item.time}
              </span>
            )}
            <div className="font-brook text-2xl text-rf-metal whitespace-pre-line">
              {item.description}
              {item.links?.map((link) => (
                <a key={link._key} href={link.url} className="ml-2 underline" target="_blank" rel="noopener noreferrer">
                  {link.shortLabel ?? link.label} →
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-rf-cream" aria-hidden />
    </div>
  ))}
  {schedule.days.length % 2 === 1 && (
    <div aria-hidden className="hidden md:block border-r-2 border-b-2 border-rf-ocher bg-rf-cream" />
  )}
</div>
```

If `schedule.days` is empty, return `null`.

- [ ] **Step 5: Build `FestivalFeaturedArtworks`**

Ocher background; centered heading “Featured Artworks” in `font-brook italic text-[40px] text-rf-metal`.

Use a three-column CSS grid. Cards stretch to the tallest card in their own row; rows size independently. No page-wide height manager is needed.

```tsx
<div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-6">
  {artworks.map((artwork) => (
    <article
      key={artwork._key}
      className="flex h-full flex-col break-inside-avoid"
    >
      {artwork.image && (
        <SanityImage image={artwork.image} className="w-full h-auto object-cover" />
      )}
      <h3 className="mt-6 font-milling font-semibold text-[32px] leading-tight text-rf-metal">{artwork.title}</h3>
      <p className="mt-3 font-brook italic text-2xl text-rf-metal">{artwork.artist}</p>
      {artwork.description && (
        <p className="mt-3 font-brook text-2xl text-rf-metal whitespace-pre-line">{artwork.description}</p>
      )}
    </article>
  ))}
</div>
```

If `artworks` is empty, return `null`.

- [ ] **Step 6: Build `FestivalPartners`**

Highlighter background; heading “Partners” in `font-brook italic text-[40px] text-rf-metal`; each group title in `font-brook text-2xl text-rf-metal` and names as block lines in `font-milling font-semibold text-2xl text-rf-metal`. Omit empty groups and the whole section if no groups.

- [ ] **Step 7: Build the page**

`client/src/app/re-fest/[slug]/page.tsx`:

```tsx
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { getFestivalBySlug } from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import { FestivalJumpTo } from "@/components/Festival/FestivalJumpTo";
import { FestivalAbout } from "@/components/Festival/FestivalAbout";
import { FestivalLocationSection } from "@/components/Festival/FestivalLocationSection";
import { FestivalSchedule } from "@/components/Festival/FestivalSchedule";
import { FestivalFeaturedArtworks } from "@/components/Festival/FestivalFeaturedArtworks";
import { FestivalPartners } from "@/components/Festival/FestivalPartners";

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const festival = await getFestivalBySlug("re-fest", slug);
  if (!festival) notFound();

  return (
    <main className="min-h-screen">
      <FestivalJumpTo festival={festival} />
      {festival.heroImage && (
        <SanityImage
          image={festival.heroImage}
          className="w-full h-[348px] md:h-[840px] object-cover border-b border-ch-midnite"
        />
      )}
      <FestivalAbout festival={festival} />
      {festival.locations?.map((location) => (
        <Fragment key={location._key}>
          <FestivalLocationSection location={location} />
          {location.schedule && <FestivalSchedule schedule={location.schedule} />}
          {location.featuredArtworks && location.featuredArtworks.length > 0 && (
            <FestivalFeaturedArtworks artworks={location.featuredArtworks} />
          )}
        </Fragment>
      ))}
      <FestivalPartners groups={festival.partnerGroups} />
    </main>
  );
}
```

Do not add `FestivalVideos` in this task; Task 9 creates the component and inserts it before `FestivalPartners`.

Optional `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const festival = await getFestivalBySlug("re-fest", slug);
  if (!festival) return {};
  return {
    title: `${festival.title} — Re–Fest ${festival.year}`,
    description: festival.summary ?? undefined,
  };
}
```

- [ ] **Step 8: Write tests**

- `FestivalJumpTo`: year/theme; About + location anchors; single location; virtual-only.
- `FestivalSchedule`: day label, time, description, link href; empty returns null.
- `FestivalLocationSection`: name, date, venue, artists; no artist heading when list empty.
- `FestivalFeaturedArtworks`: title, artist, description; no heading when empty.
- `FestivalPage`: mock `getFestivalBySlug`, render, assert hero/About/location/schedule/partners; null throws.

Mock `SanityImage` and `PortableText` in page tests.

- [ ] **Step 9: Run tests and typecheck**

Run: `pnpm -C client test --watchAll=false __tests__/components/Festival __tests__/app/refest`
Expected: PASS.

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add client/src/app/re-fest client/src/components/Festival \
  client/__tests__/components/Festival client/__tests__/app/refest
git commit -m "feat: add festival template"
```

---

### Task 9: Video stub

**Files:**
- Create: `client/src/components/Festival/FestivalVideos.tsx`
- Modify: `client/src/app/re-fest/[slug]/page.tsx`
- Test: `client/__tests__/components/Festival/FestivalVideos.test.tsx`

**Interfaces:**
- Consumes: `FestivalVideo`.
- Produces: `FestivalVideos({ videos }: { videos: FestivalVideo[] | null | undefined })`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { FestivalVideos } from "@/components/Festival/FestivalVideos";
import type { FestivalVideo } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

it("renders video cards without a play control", () => {
  render(
    <FestivalVideos
      videos={[
        { _key: "v1", title: "Dyad", artist: "NUUM Collective" } as FestivalVideo,
      ]}
    />,
  );
  expect(screen.getByText("Videos")).toBeInTheDocument();
  expect(screen.getByText("Dyad")).toBeInTheDocument();
  expect(screen.getByText("NUUM Collective")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /play/i })).not.toBeInTheDocument();
});

it("renders nothing without videos", () => {
  const { container } = render(<FestivalVideos videos={[]} />);
  expect(container).toBeEmptyDOMElement();
});
```

- [ ] **Step 2: Implement the stub**

Metal background, heading “Videos” in `font-brook italic text-[40px] text-rf-ocher`, horizontal flex row of cards. Each card: optional thumbnail (635×423), title in `font-milling font-semibold text-[32px] text-rf-ocher`, artist in `font-brook italic text-2xl text-rf-ocher`. No link, no button.

Add:

```tsx
// TODO(videos-ticket): replace these cards with the shared video player/card
// once the videos ticket lands. Do not add playback behavior here.
```

- [ ] **Step 3: Add to the page**

In `client/src/app/re-fest/[slug]/page.tsx`, import and render:

```tsx
<FestivalVideos videos={festival.videos} />
```

before `FestivalPartners`.

- [ ] **Step 4: Run tests**

Run: `pnpm -C client test --watchAll=false __tests__/components/Festival/FestivalVideos.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Festival/FestivalVideos.tsx \
  client/src/app/re-fest/[slug]/page.tsx \
  client/__tests__/components/Festival/FestivalVideos.test.tsx
git commit -m "feat: add festival video section stub"
```

---

### Task 10: Automated verification, data checks, and builds

**Files:** none (verification only).

- [ ] **Step 1: Run the full test and type suite**

```bash
pnpm -C sanity typegen
pnpm -C client typecheck
pnpm -C client lint
pnpm -C client test
```

Expected: all pass. Capture the test count in the final report.

- [ ] **Step 2: Run production builds**

```bash
pnpm -C client build
pnpm -C sanity build
```

Expected: both succeed.

- [ ] **Step 3: Verify imported data counts**

```bash
curl -sG "https://2r5hg86f.api.sanity.io/v2024-01-01/data/query/production" \
  --data-urlencode 'query=*[_type=="festival"] | order(year desc){title,year,"locations":count(locations),"artworks":count(locations[].featuredArtworks[]),"videos":count(videos),"partners":count(partnerGroups)}' \
  -H "Authorization: Bearer $CULTUREHUB_SANITY_TOKEN"
```

Expected: 8 festivals (2019–2026). 2025 has 2 locations, 33 artworks, 2 partner groups; 2023 has 3 locations, 18 artworks, 2 videos, 1 partner group; 2026 has 1 location and 0 artworks/videos/partners; 2019–2022/2024 are stubs with 0 locations or only summary fields.

- [ ] **Step 4: Verify the program pointer**

```bash
curl -sG "https://2r5hg86f.api.sanity.io/v2024-01-01/data/query/production" \
  --data-urlencode 'query=*[_type=="program" && slug.current=="re-fest"][0]{title,hasPage,"current":currentFestival->{"title":title,year},"archives":count(*[_type=="festival" && references(^._id)])}' \
  -H "Authorization: Bearer $CULTUREHUB_SANITY_TOKEN"
```

Expected: `hasPage: true`, current festival `Re–Mapping` 2026, and 8 linked festivals.

- [ ] **Step 5: Commit verification fixes**

If any step required a fix, commit it:

```bash
git add -A
git commit -m "fix: re-fest automated verification fixes"
```

If no fixes, no commit is needed.

---

### Task 11: Manual E2E and visual QA

**Files:** none (verification only). Screenshots go to `/tmp/opencode/refest-visual-qa/`.

**Tooling:** Use the Playwright browser tools:

- `browser_navigate`
- `browser_resize`
- `browser_snapshot`
- `browser_find`
- `browser_hover`
- `browser_click`
- `browser_press_key`
- `browser_take_screenshot`
- `browser_console_messages`
- `browser_wait_for`

Start the dev server first: `pnpm -C client dev` (background), confirm it is serving `http://localhost:3000`.

- [ ] **Step 1: Desktop E2E — Re-Fest landing page**

1. `browser_resize({width: 1440, height: 1000})`.
2. `browser_navigate({url: "http://localhost:3000/re-fest"})`.
3. `browser_snapshot()`.
4. Assert:
   - Heading “Re-Fest” is present.
   - The Re-Fest header description is present.
   - “Current” and “Festival Archive” headings are present.
   - The 2026 current feature shows “2026” and “Re–Mapping”.
   - The first archive row is previewed (2025 “Re–Collect” or the highest non-current year).
5. `browser_take_screenshot({fullPage: true, filename: "refest-desktop.png", scale: "css"})`.
6. `browser_console_messages({level: "error"})`; expect no errors or hydration warnings.

- [ ] **Step 2: Desktop E2E — archive hover and keyboard focus**

1. On `/re-fest`, locate the 2024 archive row (“Re–Source”).
2. `browser_hover` the row.
3. `browser_snapshot()` and assert the right panel now contains “Re–Source”, its year, and its location summary.
4. Assert the hovered row has the RF Highlighter background (check the snapshot’s selected row or use `browser_evaluate` to inspect `getComputedStyle`).
5. Press `Tab` until an archive row receives focus; assert the preview switches to that row.
6. Click the 2025 row; assert navigation to `/re-fest/2025`.
7. `browser_console_messages({level: "error"})`; expect no errors.

- [ ] **Step 3: Desktop E2E — 2026 sparse template**

1. `browser_navigate({url: "http://localhost:3000/re-fest/2026"})`.
2. `browser_snapshot()`.
3. Assert:
   - Sticky jump bar shows `2026` and `Re–Mapping`.
   - Jump buttons are `About` and `New York` only.
   - Hero image and About section render.
   - No “Featured Artworks”, “Videos”, or “Partners” headings.
   - No empty schedule heading.
4. Click `New York`; assert the page scrolls to the New York section and the section top is below the fixed menu + jump bar (use `browser_evaluate` to compare `getBoundingClientRect().top` to 165).
5. `browser_take_screenshot({fullPage: true, filename: "refest-2026-desktop.png", scale: "css"})`.

- [ ] **Step 4: Desktop E2E — 2025 full template**

1. `browser_navigate({url: "http://localhost:3000/re-fest/2025"})`.
2. Assert:
   - Jump buttons: About, New York, Los Angeles.
   - New York and Los Angeles location sections render.
   - Both schedules render with day blocks.
   - Featured Artworks headings render for both locations.
   - Partners section renders with Creative Partners and Outreach Partners.
   - No Videos heading.
3. `browser_take_screenshot({fullPage: true, filename: "refest-2025-desktop.png", scale: "css"})`.

- [ ] **Step 5: Desktop E2E — 2023 Figma template**

1. `browser_navigate({url: "http://localhost:3000/re-fest/2023"})`.
2. Assert:
   - Jump buttons: About, New York, Los Angeles, Virtual Gallery.
   - New York uses RF Highlighter, Los Angeles uses RF Pool, Virtual Gallery uses RF Midnight.
   - Videos section renders two cards, with no play button.
   - Partners section renders.
3. `browser_take_screenshot({fullPage: true, filename: "refest-2023-desktop.png", scale: "css"})`.

- [ ] **Step 6: 404 behavior**

1. `browser_navigate({url: "http://localhost:3000/re-fest/not-a-real-year"})`.
2. Assert the 404 page/not-found UI appears.
3. `browser_navigate({url: "http://localhost:3000/re-fest/9999"})`; assert 404.

- [ ] **Step 7: Mobile E2E — 375px**

1. `browser_resize({width: 375, height: 812})`.
2. `browser_navigate({url: "http://localhost:3000/re-fest"})`.
3. Assert:
   - Re-Fest header stacks.
   - Current feature stacks image above details.
   - Archive rows show `132×125` images and link directly.
   - No right-hand preview panel is visible.
   - No horizontal scrolling (`document.documentElement.scrollWidth <= window.innerWidth`).
4. `browser_take_screenshot({fullPage: true, filename: "refest-mobile.png", scale: "css"})`.
5. Repeat on `/re-fest/2025` and `/re-fest/2023`; assert no horizontal overflow and schedules/artworks stack to one column.
6. `browser_take_screenshot({fullPage: true, filename: "refest-2025-mobile.png", scale: "css"})`.

- [ ] **Step 8: Visual QA comparison**

For each screenshot, compare against the corresponding Figma frame:

- Re-Fest page: node `2038:3352` (desktop) and `2396:3544` (mobile).
- Festival template: node `2916:2707` (desktop) and `3111:7481` (mobile).

Check the visual checklist in the “Testing & QA Strategy” section:

- Type sizes/roles, palette values, 1px borders, image proportions, archive split, hero heights, sticky offsets, and hover/selected states.
- No empty sections, broken images, missing alt text, or overflow.
- Featured Artworks cards match the tallest card in their own row at 1440px; rows have independent heights.
- The schedule is a continuous two-column grid with 2px ocher cell borders, no gaps, and blank filler cells for uneven columns.
- Mobile: no preview panel; rows use small images; all sections single-column; artwork equal-height minimums are cleared and the schedule is one column.

Record intentional deviations in the final report. Featured artwork cards stretch only within their own row rather than Figma’s variable masonry heights. The schedule intentionally follows Figma’s seamless two-column grid rather than spaced cards.

- [ ] **Step 9: Accessibility and keyboard QA**

1. On `/re-fest`, press `Tab` repeatedly; confirm focus is visible on archive rows and that focused rows update the preview.
2. On `/re-fest/2025`, press `Tab` through the jump menu; confirm each anchor receives focus and Enter activates it.
3. Use `browser_snapshot()` to confirm headings are in order (h1 on Re-Fest, h2 section headings, h3 card/day headings).
4. Confirm every rendered image has non-empty alt text (inspect via `browser_evaluate`).
5. Confirm no link has an empty accessible name.

- [ ] **Step 10: Final report and commit**

Summarize:

- Automated test count and pass/fail.
- Build results.
- Each manual E2E scenario and result.
- Screenshot paths.
- Visual deviations from Figma, if any.
- Console errors, if any.

If visual QA required fixes, commit them:

```bash
git add -A
git commit -m "fix: re-fest visual QA fixes"
```

---

### Task 12: Re-Fest list page typography, spacing, and border audit

**Files:**
- Modify: `client/src/components/shared/SectionHeading.tsx`
- Modify: `client/src/components/Refest/RefestPage.tsx`
- Modify: `client/src/components/Refest/FestivalArchiveRow.tsx`
- Modify: `client/src/components/Refest/FestivalArchive.tsx`
- Modify: `client/src/components/Refest/FestivalSummary.tsx`
- Modify: `client/src/components/Festival/FestivalMeta.tsx`

**Interfaces:** no new interfaces; visual and type-level corrections only.

- [ ] **Step 1: Tighten section heading line-height**

Set the `SectionHeading` h2 to `text-[28px] leading-[1.2]`. This brings the 92px rendered heading down to 84px, matching the Figma 83px heading.

- [ ] **Step 2: Remove the archive heading gap**

In `RefestPage`, render the “Festival Archive” heading without `mb-9`. The list rows start directly under the heading, and the heading bottom border is the list’s top border.

- [ ] **Step 3: Restore archive row height and program label**

Add `min-h-[125px]` to both the desktop and mobile archive rows. Change the “Re–Fest” program label from `font-brook italic` to `font-brook` (SchoolBook regular), matching Figma.

- [ ] **Step 4: Fix archive preview borders**

In `FestivalArchive`, the preview panel gets `border-r border-b` and no `border-l`; the list rows’ right border provides the seam. In `FestivalSummary`, add a 1px CH Midnite border to the preview image.

- [ ] **Step 5: Fix archive preview title and line-height**

`FestivalYearTitle` is 48px for both the current feature and archive preview (Brook year + Milling theme). Set `FestivalDateLines` and the preview summary to `leading-[1.2]`. This aligns the preview and the seven 125px rows at 875px.

- [ ] **Step 6: Tighten the Re-Fest header description**

Pass `leading-[1.2]` through `ProgramHeader`’s `descriptionClassName` for Re-Fest.

- [ ] **Step 7: Verify measurements**

At 1440px on `/re-fest`:

- section heading height ≈ 84px
- archive rows all 125px
- list total 875px
- preview panel 875px
- preview title 48px
- preview panel borders: left 0, right 1, bottom 1
- first row top equals archive heading bottom

- [ ] **Step 8: Run checks and commit**

```bash
pnpm -C client test
pnpm -C client typecheck
pnpm -C client lint
pnpm -C client build
```

Commit the typography/spacing/border fixes.

---

### Task 13: Use the actual SchoolBook and NewEdge666 fonts

**Files:**
- Modify: `client/src/atoms/text.ts`
- Modify: `client/src/app/layout.tsx`
- Modify: `client/src/app/globals.css`
- Modify: `client/src/components/Button.tsx`
- Modify: `client/src/components/shared/SectionHeading.tsx`
- Modify: `client/src/components/ProgramPage/ProgramHeader.tsx`
- Modify: all `client/src/components/Festival/*` and `client/src/components/Refest/*` components
- Modify: `sanity/scripts/import-refest/manifests/2023.ts`

**Interfaces:**
- Produces: `font-new-edge`, `font-schoolbook`, `font-schoolbook-condensed` utilities.
- Produces: `Button` `textClassName` / `textWeightClassName`; `SectionHeading` `fontClassName` / `fontWeightClassName`; `ProgramHeader` `titleClassName` / `titleWeightClassName`.

- [ ] **Step 1: Load NewEdge666 locally**

Add `NewEdgeFont` in `client/src/atoms/text.ts`:

```ts
export const NewEdgeFont = localFont({
  src: [
    {
      path: "/../../public/fonts/NewEdge666/NewEdge666-SemiboldRounded.otf",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-new-edge",
  preload: false,
});
```

Add `NewEdgeFont.variable` to the body className in `layout.tsx`.

- [ ] **Step 2: Expose the font utilities**

In `globals.css` `@theme`:

```css
--font-new-edge: var(--font-new-edge);
--font-schoolbook: "schoolbook", serif;
--font-schoolbook-condensed: "schoolbook-condensed", serif;
```

The Adobe Fonts kit is already imported at the top of `globals.css`. Verify `document.fonts.check("24px schoolbook")` is true in the browser.

- [ ] **Step 3: Add font overrides to shared components**

- `Button`: `textClassName` replaces the default family; `textWeightClassName` replaces the ticket weight. Festival ticket buttons use `font-new-edge` + `font-semibold`.
- `SectionHeading`: `fontClassName` and `fontWeightClassName` default to `font-milling` / `font-bold`; Re-Fest passes `font-new-edge` / `font-semibold`.
- `ProgramHeader`: `titleClassName` / `titleWeightClassName` default to `font-milling` / `font-bold`; Re-Fest passes `font-new-edge` / `font-semibold`.

- [ ] **Step 4: Replace festival/Re-Fest font classes**

- NewEdge roles → `font-new-edge` (600).
- SchoolBook body/description → `font-schoolbook`.
- SchoolBook Condensed dates/details/schedule copy/archive labels → `font-schoolbook-condensed`.
- SchoolBook italic headings/credits → `font-schoolbook italic`.

- [ ] **Step 5: Fix the 2023 logo duplication**

Export the mark-only Figma node `3024:3543` as `refest-2023-mark.png` instead of the group `3027:3556` that includes the “RE–NEW” wordmark. In `FestivalAbout`, render the theme title only when there is no logo.

- [ ] **Step 6: Verify fonts and layout**

In the browser:
- About body computed family is `schoolbook, serif`.
- Participating artist, schedule time/date, artwork title, video title, partner names, and theme titles compute to `NewEdgeFont` at weight 600.
- Archive row location/program is `schoolbook-condensed, serif`; year is `schoolbook, serif`; theme is `NewEdgeFont`.
- `document.fonts.check("24px schoolbook")` is true.
- The Re-Fest header height is ~238px, archive rows 125px, list/preview 875px.
- No duplicate “RE–NEW” in the 2023 About section.

- [ ] **Step 7: Run checks and commit**

```bash
pnpm -C client test
pnpm -C client typecheck
pnpm -C client lint
pnpm -C client build
```

Commit the font loading, component font classes, and the 2023 logo import fix.

---

### Task 14: Date-line overrides, jump-button active state, and archive hover accent

**Files:**
- Modify: `sanity/schemaTypes/festivalType.ts`
- Modify: `client/src/sanity/queries.ts`
- Modify: `client/src/util/festival.ts`
- Modify: `client/src/components/Festival/FestivalMeta.tsx`
- Modify: `client/src/components/Festival/FestivalJumpTo.tsx`
- Modify: `client/src/components/Refest/RefestPage.tsx`
- Modify: `client/src/components/Refest/FestivalArchive.tsx`
- Modify: `client/src/components/Refest/FestivalSummary.tsx`
- Modify: `client/src/components/Button.tsx`
- Modify: `sanity/scripts/import-refest/types.ts`, `build.ts`, `manifests/2023.ts`, `2025.ts`, `2026.ts`

- [ ] **Step 1: Add `festival.dateLines`**

Add an optional `dateLines` array of strings to the festival schema and project it in the `getRefestPage` current/archive queries. `FestivalDateLines` uses the override when present; otherwise it derives lines from non-virtual locations. Virtual locations are excluded.

- [ ] **Step 2: Set the display overrides**

- 2026 and 2025: `["March 6-9, 2025 in New York", "March 14-15, 2025 in Los Angeles"]`.
- 2023: `["April 20-29, 2023 in New York", "April 28-29, 2023 in Los Angeles"]`.

Re-run `pnpm -C sanity import:refest -- --write`.

- [ ] **Step 3: Remove the Current top border**

Render the Re-Fest `Current` section heading with `borderTop={false}`. The header’s bottom border remains the only line above it.

- [ ] **Step 4: Implement jump-button active state**

Make `FestivalJumpTo` a client component. Track the active anchor with `useState`; set it on click and update it on scroll by finding the last section whose top is at or above 166px. Apply `aria-current="page"` and the Figma active style: RF Midnight background, RF Blue Smoke border/text. Default remains RF Blue Smoke background, RF Metal border/text.

- [ ] **Step 5: Use the Re-Fest highlighter for archive button hover**

Add `hoverClassName` to `Button` (replacing the default `hover:bg-ch-bb`). Pass `hover:bg-rf-highlighter` from `FestivalArchive` through `FestivalSummary`/`FestivalActions`.

- [ ] **Step 6: Verify**

- `/re-fest` current and 2025 preview show the 2025 date lines with full years and hyphens.
- 2023 preview shows only New York and Los Angeles lines.
- Current heading has no top border.
- Clicking a jump button turns it Midnight/Blue Smoke; scrolling updates the active item.
- Archive “Visit Festival” hover is `#EDFD8B`.
- Tests, typecheck, lint, and build pass.
