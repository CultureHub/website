# Program Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dedicated landing pages for Residency and Experiments in Digital Storytelling (EDS) by extending the `program` document type with page-level fields and replacing the `artist.program` reference with a `programs[]` membership array.

**Architecture:** Extend existing Sanity document types (avoiding new document types), add a dynamic Next.js route at `/[slug]` that renders program pages from the extended `program` schema, and migrate existing queries to the new `artist.programs[]` array.

**Tech Stack:** Sanity v5 (defineType/defineField/defineArrayMember), Next.js 16 App Router (React 19, TypeScript, Tailwind CSS 4), next-sanity, GROQ

## Global Constraints

- No new document types — extend existing `program` and `artist` documents
- All new program fields are optional — programs without them render minimally or 404
- `artist.programs` requires `min(1)` after migration (replaces old required `program`)
- Old `artist.program` field follows Sanity deprecation pattern: `readOnly`, `hidden` when undefined, `initialValue: undefined`
- Re-Fest is out of scope — no page fields added, `/[slug]` returns 404 for it until later
- Routes must not collide with existing static routes (`/artists`, `/projects`, `/events`, `/art-and-technology`)
- Tailwind CSS v4 class naming conventions (no @apply, utility-first)

---

## File Structure

```
sanity/
├── schemaTypes/
│   ├── artistType.ts          # MODIFY: programs[] replaces program
│   ├── programType.ts         # MODIFY: add page-level fields
│   └── index.ts               # MODIFY: ensure exports unchanged
├── util/
│   └── program.ts             # UNCHANGED (still used by project/event)
└── structure/
    └── index.ts               # UNCHANGED

client/src/
├── sanity/
│   ├── queries.ts             # MODIFY: add program page queries, update artist queries
│   └── types.ts               # REGENERATED via typegen
├── app/
│   ├── [slug]/
│   │   └── page.tsx           # CREATE: dynamic program landing page
│   ├── artists/
│   │   ├── page.tsx           # UNCHANGED (uses getArtists, no program refs)
│   │   └── [slug]/
│   │       └── page.tsx       # MODIFY: artist.program -> artist.programs[0].program
├── components/
│   ├── ProgramPage/
│   │   ├── ProgramHeader.tsx        # CREATE
│   │   ├── ResidentArtistGrid.tsx   # CREATE
│   │   ├── OpenCallSection.tsx      # CREATE
│   │   ├── LocationTabs.tsx         # CREATE
│   │   ├── FeaturedProjects.tsx     # CREATE
│   │   └── FeaturedArtists.tsx      # CREATE
│   └── UpcomingEvents.tsx     # MODIFY: accept optional programSlug param
```

---

### Task 1: Add `programs[]` Array to Artist Schema + Deprecate Old Field

**Files:**
- Modify: `sanity/schemaTypes/artistType.ts`

**Interfaces:**
- Produces: `Artist.programs: Array<{program: Reference, yearStart: number, yearEnd: number, location?: string}>`
- Produces: `Artist.program` (deprecated, readOnly, hidden when undefined)

- [ ] **Step 1: Update artist schema**

Add the new `programs` array field and deprecate the existing `program` field.

```typescript
// File: sanity/schemaTypes/artistType.ts
// Replace the program field section (lines ~45-48) with:

import {defineArrayMember, defineField, defineType} from 'sanity'
// ... keep existing imports ...

    defineField({
      title: 'Program Memberships',
      name: 'programs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'programMembership',
          title: 'Program Membership',
          fields: [
            defineField({
              title: 'Program',
              name: 'program',
              type: 'reference',
              to: [{ type: 'program' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Year Start',
              name: 'yearStart',
              type: 'number',
              validation: (rule) => rule.required().integer().min(2000).max(2100),
            }),
            defineField({
              title: 'Year End',
              name: 'yearEnd',
              type: 'number',
              validation: (rule) => rule.required().integer().min(2000).max(2100),
            }),
            defineField({
              title: 'Location',
              name: 'location',
              type: 'string',
              description: 'e.g. "Los Angeles", "New York \u2192 Berlin"',
            }),
          ],
          preview: {
            select: {
              programTitle: 'program.title',
              yearStart: 'yearStart',
            },
            prepare: ({ programTitle, yearStart }) => ({
              title: programTitle || 'Untitled Program',
              subtitle: yearStart ? `${yearStart}` : '',
            }),
          },
        }),
      ],
      validation: (rule) => rule.min(1).warning('Each artist should belong to at least one program.'),
    }),

    // Deprecate old program field
    defineField({
      ...programField({
        title: 'Program (Deprecated)',
        name: 'program',
      }),
      deprecated: {
        reason: 'Use "Program Memberships" instead. This field will be removed in the next migration phase.',
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
```

Remove the old required validation from the utility by spreading programField first, then overriding.

- [ ] **Step 2: Verify schema builds**

```bash
cd sanity && npx sanity schema validate
```

- [ ] **Step 3: Commit**

```bash
git add sanity/schemaTypes/artistType.ts
git commit -m "feat: add programs[] membership array to artist, deprecate program field"
```

---

### Task 2: Add Page-Level Fields to Program Schema

**Files:**
- Modify: `sanity/schemaTypes/programType.ts`

**Interfaces:**
- Produces: Program with optional `pageDescription`, `jumpToButtons`, `openCallTitle`, `openCallImage`, `openCallTimeline`, `openCallWhere`, `openCallBenefits`, `openCallDescription`, `locationContent`, `featuredArtists`, `featuredProjects`

- [ ] **Step 1: Add new fields to program schema**

```typescript
// File: sanity/schemaTypes/programType.ts
// After the existing thumbnails field (line ~66), before the closing bracket of fields array:

    defineField({
      title: 'Page Description',
      name: 'pageDescription',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text shown in the program page header. Leave empty to omit the header description.',
    }),
    defineField({
      title: 'Jump To Buttons',
      name: 'jumpToButtons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'jumpToButton',
          fields: [
            defineField({
              title: 'Label',
              name: 'label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Anchor',
              name: 'anchor',
              type: 'string',
              description: 'CSS ID to scroll to (e.g. "#projects")',
            }),
          ],
        }),
      ],
    }),
    defineField({
      title: 'Open Call Title',
      name: 'openCallTitle',
      type: 'string',
    }),
    defineField(imageField({
      title: 'Open Call Image',
      name: 'openCallImage',
    })),
    defineField({
      title: 'Open Call Timeline',
      name: 'openCallTimeline',
      type: 'text',
      description: 'Displayed under "Timeline" in the open call section',
    }),
    defineField({
      title: 'Open Call Where',
      name: 'openCallWhere',
      type: 'text',
      description: 'Displayed under "Where" in the open call section',
    }),
    defineField({
      title: 'Open Call Benefits',
      name: 'openCallBenefits',
      type: 'text',
      description: 'Displayed under "Benefits" in the open call section',
    }),
    defineField({
      title: 'Open Call Description',
      name: 'openCallDescription',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rendered in two columns below the open call info grid',
    }),
    defineField({
      title: 'Location Content',
      name: 'locationContent',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'locationTab',
          fields: [
            defineField({
              title: 'Location',
              name: 'location',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Display Title',
              name: 'displayTitle',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Description',
              name: 'description',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              title: 'Accent Color',
              name: 'accentColor',
              type: 'string',
              description: 'Hex color for tab styling',
            }),
          ],
          preview: {
            select: { title: 'location', subtitle: 'displayTitle' },
            prepare: ({ title, subtitle }) => ({
              title: title || 'Location',
              subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'Featured Artists',
      name: 'featuredArtists',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artist' }] }],
    }),
    defineField({
      title: 'Featured Projects',
      name: 'featuredProjects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
```

Don't forget to add the import for `defineArrayMember` at the top.

- [ ] **Step 2: Verify schema builds**

```bash
cd sanity && npx sanity schema validate
```

- [ ] **Step 3: Commit**

```bash
git add sanity/schemaTypes/programType.ts
git commit -m "feat: add page-level fields to program schema"
```

---

### Task 3: Add GROQ Queries for Program Landing Pages

**Files:**
- Modify: `client/src/sanity/queries.ts`

**Interfaces:**
- Produces: `getProgramBySlug(slug: string)` → `Program | null` with expanded page fields
- Produces: `getResidentArtists(programId: string)` → `Array<{name, slug, image, membership: {yearStart, yearEnd, location}}>`
- Produces: `getUpcomingEventsByProgram(programSlug: string, limit?: number)` → `Array<Event>`

- [ ] **Step 1: Add program page queries**

Add the following after the existing `getPrograms` function:

```typescript
export async function getProgramBySlug(slug: string) {
  return client.fetch(
    defineQuery(
      `*[_type == "program" && slug.current == $slug][0]{
        _id, title, displayTitle, slug, shortLabel, accentColor,
        heroImage {
          asset->{_id, url},
          alt, credits
        },
        pageDescription,
        jumpToButtons,
        openCallTitle,
        openCallImage {
          asset->{_id, url},
          alt, credits
        },
        openCallTimeline,
        openCallWhere,
        openCallBenefits,
        openCallDescription,
        locationContent[]{
          _key,
          location, displayTitle, description,
          accentColor
        },
        featuredArtists[]->{
          _id, name, slug,
          image {
            asset->{_id, url},
            alt
          }
        },
        featuredProjects[]->{
          _id, title, slug,
          heroImage {
            asset->{_id, url},
            alt
          },
          people
        }
      }`,
    ),
    { slug },
  )
}

export async function getResidentArtists(programId: string) {
  const query = defineQuery(
    `*[_type == "artist" && $programId in programs[].program._ref]{
      _id, name, slug,
      image {
        asset->{_id, url},
        alt
      },
      locations,
      "membership": programs[program._ref == $programId][0]{
        yearStart, yearEnd, location
      }
    } | order(membership.yearStart desc)`,
  )
  return client.fetch(query, { programId })
}

export async function getUpcomingEventsByProgram(
  programSlug: string,
  limit: number = 5,
) {
  return client.fetch(
    defineQuery(
      `*[_type == "event" && program->slug.current == $programSlug && dateTimes[0].start > now()] | order(dateTimes[0].start asc)[0...$limit]{
        ${UPCOMING_EVENTS_FRAGMENT}
      }`,
    ),
    { programSlug, limit },
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/sanity/queries.ts
git commit -m "feat: add program page GROQ queries"
```

---

### Task 4: Create Program Page Route

**Files:**
- Create: `client/src/app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProgramBySlug`, `getResidentArtists`, `getUpcomingEventsByProgram`
- Produces: Program landing page with conditional sections

- [ ] **Step 1: Create the page**

```tsx
// File: client/src/app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProgramBySlug, getResidentArtists, getUpcomingEventsByProgram } from "@/sanity/queries";
import ProgramHeader from "@/components/ProgramPage/ProgramHeader";
import ResidentArtistGrid from "@/components/ProgramPage/ResidentArtistGrid";
import OpenCallSection from "@/components/ProgramPage/OpenCallSection";
import LocationTabs from "@/components/ProgramPage/LocationTabs";
import FeaturedProjects from "@/components/ProgramPage/FeaturedProjects";
import FeaturedArtists from "@/components/ProgramPage/FeaturedArtists";
import { UpcomingEvents } from "@/components/UpcomingEvents";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) notFound();

  const residentArtists =
    slug === "residency" ? await getResidentArtists(program._id) : null;

  return (
    <main className="min-h-screen">
      <ProgramHeader program={program} />
      {slug === "residency" && residentArtists && residentArtists.length > 0 && (
        <ResidentArtistGrid artists={residentArtists} />
      )}
      {program.openCallTitle && (
        <OpenCallSection
          title={program.openCallTitle}
          image={program.openCallImage}
          timeline={program.openCallTimeline}
          where={program.openCallWhere}
          benefits={program.openCallBenefits}
          description={program.openCallDescription}
        />
      )}
      {program.locationContent && program.locationContent.length > 0 && (
        <LocationTabs
          locations={program.locationContent}
        />
      )}
      {program.featuredProjects && program.featuredProjects.length > 0 && (
        <FeaturedProjects
          title="Recent Projects"
          projects={program.featuredProjects}
        />
      )}
      {program.featuredArtists && program.featuredArtists.length > 0 && (
        <FeaturedArtists
          title="Featured Artists"
          artists={program.featuredArtists}
          columns={3}
        />
      )}
      <UpcomingEvents programSlug={slug} />
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/[slug]/page.tsx
git commit -m "feat: create program landing page route at /[slug]"
```

---

### Task 5: Create ProgramHeader Component

**Files:**
- Create: `client/src/components/ProgramPage/ProgramHeader.tsx`

**Interfaces:**
- Consumes: `Program` document with `pageDescription`, `jumpToButtons`, `heroImage`, `displayTitle`, `title`, `slug`, `shortLabel`
- Produces: Page header with title, breadcrumbs, description, optional jump-to buttons

- [ ] **Step 1: Create the component**

```tsx
// File: client/src/components/ProgramPage/ProgramHeader.tsx
import { PortableText } from "next-sanity";
import Breadcrumbs from "@/components/Breadcrumbs";
import SanityImage from "@/components/SanityImage";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type Program = NonNullable<GetProgramBySlugQueryResult>;

interface ProgramHeaderProps {
  program: Program;
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  return (
    <section className="px-6 md:px-16 py-9">
      <Breadcrumbs
        buttons={[
          { label: "Art & Technology", href: "/art-and-technology" },
          { label: program.shortLabel, children: program.title },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
        <div className="flex flex-col gap-6 max-w-[500px]">
          <h1 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
            {program.title}
          </h1>
          {program.pageDescription && (
            <div className="font-milling text-2xl font-light">
              <PortableText value={program.pageDescription} />
            </div>
          )}
        </div>

        {program.jumpToButtons && program.jumpToButtons.length > 0 && (
          <div className="flex flex-row items-center gap-4">
            {program.jumpToButtons.map((btn) => (
              <a
                key={btn._key}
                href={btn.anchor ? `#${btn.anchor.replace(/^#/, "")}` : undefined}
                className="inline-flex px-[10px] py-[5px] border border-ch-midnite rounded-[20px] bg-ch-lite font-milling text-xl"
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {program.heroImage && (
        <div className="mt-9">
          <SanityImage
            image={program.heroImage}
            className="w-full rounded-[20px] border border-ch-midnite"
          />
          {program.heroImage.credits && (
            <p className="text-right font-brook italic text-sm text-[#ACACAC] mt-2">
              {program.heroImage.credits}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p client/src/components/ProgramPage
git add client/src/components/ProgramPage/ProgramHeader.tsx
git commit -m "feat: add ProgramHeader component"
```

---

### Task 6: Create ResidentArtistGrid Component

**Files:**
- Create: `client/src/components/ProgramPage/ResidentArtistGrid.tsx`

**Interfaces:**
- Consumes: `Array<{name, slug, image, membership: {yearStart, yearEnd, location}, locations}>`
- Produces: Client component with Current/Past toggle, year filter chips, 2-column artist card grid

- [ ] **Step 1: Create the component**

```tsx
// File: client/src/components/ProgramPage/ResidentArtistGrid.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";

interface ResidentArtist {
  _id: string;
  name: string | null;
  slug: { current: string };
  image: {
    asset?: { _id: string; url: string } | null;
    alt?: string | null;
  } | null;
  locations?: string[] | null;
  membership: {
    yearStart: number;
    yearEnd: number;
    location?: string | null;
  } | null;
}

interface ResidentArtistGridProps {
  artists: ResidentArtist[];
}

export default function ResidentArtistGrid({ artists }: ResidentArtistGridProps) {
  const [showPast, setShowPast] = useState(false);

  const yearOptions = useMemo(() => {
    const years = new Set(
      artists
        .filter((a) => a.membership?.yearStart)
        .map((a) => `${a.membership!.yearStart}-${a.membership!.yearEnd}`)
    );
    return Array.from(years);
  }, [artists]);

  const maxYear = Math.max(
    ...artists
      .filter((a) => a.membership?.yearStart)
      .map((a) => a.membership!.yearStart)
  );

  const [selectedYear, setSelectedYear] = useState<string | null>(
    showPast ? null : `${maxYear}-${maxYear + 1}`
  );

  const currentYearKey = `${maxYear}-${maxYear + 1}`;

  const filtered = artists.filter((a) => {
    if (!a.membership) return false;
    const yearKey = `${a.membership.yearStart}-${a.membership.yearEnd}`;
    if (showPast) {
      return selectedYear ? yearKey === selectedYear : yearKey !== currentYearKey;
    }
    return yearKey === currentYearKey;
  });

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="border-t border-b border-ch-midnite py-6">
            <h2 className="font-milling font-bold text-[28px]">Resident Artists</h2>
          </div>
          <div className="flex flex-row gap-4">
            <button
              onClick={() => {
                setShowPast(false);
                setSelectedYear(currentYearKey);
              }}
              className={`font-milling text-xl px-[50px] py-[10px] border ${
                !showPast
                  ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                  : "bg-ch-lite text-ch-midnite border-ch-midnite"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => {
                setShowPast(true);
                setSelectedYear(null);
              }}
              className={`font-milling text-xl px-[87px] py-[10px] border ${
                showPast
                  ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                  : "bg-ch-lite text-ch-midnite border-ch-midnite"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {showPast && (
          <div className="flex flex-row flex-wrap gap-3">
            {yearOptions.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr === selectedYear ? null : yr)}
                className={`px-[10px] py-2 border font-milling text-xl ${
                  yr === selectedYear
                    ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                    : "bg-transparent text-ch-midnite border-ch-midnite"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((artist) => (
            <Link
              key={artist._id}
              href={`/artists/${artist.slug.current}`}
              className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-ch-blue"
            >
              <SanityImage
                image={artist.image}
                className="w-full aspect-[3/2] object-cover rounded-[10px] border border-ch-midnite"
              />
              <div className="flex flex-row justify-between">
                <span className="font-brook text-2xl uppercase">
                  {artist.membership?.yearStart}-{artist.membership?.yearEnd}
                </span>
                <span className="font-brook text-2xl uppercase">
                  {artist.membership?.location ||
                    artist.locations?.[0] ||
                    ""}
                </span>
              </div>
              <span className="font-milling text-[32px] leading-tight">
                {artist.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/ProgramPage/ResidentArtistGrid.tsx
git commit -m "feat: add ResidentArtistGrid component"
```

---

### Task 7: Create OpenCallSection Component

**Files:**
- Create: `client/src/components/ProgramPage/OpenCallSection.tsx`

**Interfaces:**
- Consumes: `title`, `image`, `timeline`, `where`, `benefits`, `description` (all optional)
- Produces: Open call section with heading, hero image, info grid, two-column description

- [ ] **Step 1: Create the component**

```tsx
// File: client/src/components/ProgramPage/OpenCallSection.tsx
import { PortableText } from "next-sanity";
import SanityImage from "@/components/SanityImage";
import type { SanityImageSource } from "@sanity/image-url";
import type { TypedObject } from "next-sanity";

interface OpenCallSectionProps {
  title: string | null;
  image: SanityImageSource | null;
  timeline: string | null;
  where: string | null;
  benefits: string | null;
  description: TypedObject[] | null;
}

export default function OpenCallSection({
  title,
  image,
  timeline,
  where,
  benefits,
  description,
}: OpenCallSectionProps) {
  const infoItems = [
    { label: "Timeline", value: timeline },
    { label: "Where", value: where },
    { label: "Benefits", value: benefits },
  ].filter((item) => item.value);

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">Open Call</h2>
      </div>

      <div className="flex flex-col gap-9">
        {image && (
          <SanityImage
            image={image}
            className="w-full border border-ch-midnite"
          />
        )}

        <h3 className="font-milling font-bold text-[40px]">{title}</h3>

        {infoItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            <div className="flex flex-col gap-6 border-r border-ch-midnite pr-8">
              {infoItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <h4 className="font-brook text-xl uppercase">{item.label}</h4>
                  <p className="font-milling text-xl whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              {description && (
                <div className="font-milling text-xl">
                  <PortableText value={description} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/ProgramPage/OpenCallSection.tsx
git commit -m "feat: add OpenCallSection component"
```

---

### Task 8: Create LocationTabs Component

**Files:**
- Create: `client/src/components/ProgramPage/LocationTabs.tsx`

**Interfaces:**
- Consumes: `locations: Array<{_key, location, displayTitle, description, accentColor}>`
- Produces: Tabbed interface with one tab per location, each rendering rich text content

- [ ] **Step 1: Create the component**

```tsx
// File: client/src/components/ProgramPage/LocationTabs.tsx
"use client";

import { useState } from "react";
import { PortableText } from "next-sanity";
import type { TypedObject } from "next-sanity";

interface LocationTab {
  _key?: string;
  location: string;
  displayTitle: string;
  description: TypedObject[] | null;
  accentColor?: string | null;
}

interface LocationTabsProps {
  locations: LocationTab[];
}

export default function LocationTabs({ locations }: LocationTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = locations[activeIndex];

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="flex flex-row">
        {locations.map((tab, i) => (
          <button
            key={tab._key ?? i}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-6 font-brook text-[28px] uppercase border border-ch-midnite rounded-t-[20px] ${
              i === activeIndex
                ? "border-b-0"
                : "border-b"
            }`}
            style={{
              backgroundColor:
                i === activeIndex
                  ? tab.accentColor || "#B5FD8B"
                  : "#F2FBFD",
            }}
          >
            {tab.displayTitle}
          </button>
        ))}
        <div className="flex-1 border-b border-ch-midnite" />
      </div>

      {active && (
        <div
          className="p-9 border border-t-0 border-ch-midnite"
          style={{ backgroundColor: active.accentColor || "#B5FD8B" }}
        >
          <div className="max-w-[975px] flex flex-col gap-8">
            {active.description && (
              <div className="font-milling text-xl">
                <PortableText value={active.description} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/ProgramPage/LocationTabs.tsx
git commit -m "feat: add LocationTabs component"
```

---

### Task 9: Create FeaturedProjects and FeaturedArtists Components

**Files:**
- Create: `client/src/components/ProgramPage/FeaturedProjects.tsx`
- Create: `client/src/components/ProgramPage/FeaturedArtists.tsx`

**Interfaces:**
- FeaturedProjects consumes: `title: string`, `projects: Array<{_id, title, slug, heroImage, people}>`
- FeaturedArtists consumes: `title: string`, `artists: Array<{_id, name, slug, image}>, columns?: number`

- [ ] **Step 1: Create FeaturedProjects component**

```tsx
// File: client/src/components/ProgramPage/FeaturedProjects.tsx
import { Carousel, type CarouselItem } from "@/components/Carousel";

interface FeaturedProjectsProps {
  title: string;
  projects: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    heroImage: {
      asset?: { _id: string; url: string } | null;
      alt?: string | null;
    } | null;
    people?: string | null;
  }>;
}

export default function FeaturedProjects({
  title,
  projects,
}: FeaturedProjectsProps) {
  const items: CarouselItem[] = projects.map((p) => ({
    _key: p._id,
    title: p.title,
    image: p.heroImage as CarouselItem["image"],
    href: `/projects/${p.slug.current}`,
    subtitle: p.people || undefined,
  }));

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>
      <Carousel items={items} />
    </section>
  );
}
```

- [ ] **Step 2: Create FeaturedArtists component**

```tsx
// File: client/src/components/ProgramPage/FeaturedArtists.tsx
import Link from "next/link";
import SanityImage from "@/components/SanityImage";

interface FeaturedArtist {
  _id: string;
  name: string | null;
  slug: { current: string };
  image: {
    asset?: { _id: string; url: string } | null;
    alt?: string | null;
  } | null;
}

interface FeaturedArtistsProps {
  title: string;
  artists: FeaturedArtist[];
  columns?: number;
}

export default function FeaturedArtists({
  title,
  artists,
  columns = 3,
}: FeaturedArtistsProps) {
  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {artists.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-[#B5FD8B]"
          >
            <SanityImage
              image={artist.image}
              className="w-full aspect-[3/2] object-cover rounded-[10px] border border-ch-midnite"
            />
            <div className="flex flex-row justify-between">
              <span className="font-brook italic text-base">
                Experiments in Digital Storytelling
              </span>
            </div>
            <span className="font-milling text-xl">{artist.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ProgramPage/FeaturedProjects.tsx client/src/components/ProgramPage/FeaturedArtists.tsx
git commit -m "feat: add FeaturedProjects and FeaturedArtists components"
```

---

### Task 10: Update UpcomingEvents to Support Program Filter

**Files:**
- Modify: `client/src/components/UpcomingEvents.tsx`

**Interfaces:**
- Consumes: optional `programSlug?: string` prop
- Produces: Same carousel, but optionally filtered by program

- [ ] **Step 1: Update UpcomingEvents**

```typescript
// File: client/src/components/UpcomingEvents.tsx
// Replace the existing component:

import { Carousel, type CarouselItem } from "@/components/Carousel";
import { getUpcomingEvents, getUpcomingEventsByProgram } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

interface UpcomingEventsProps {
  programSlug?: string;
}

export async function UpcomingEvents({ programSlug }: UpcomingEventsProps) {
  const events = programSlug
    ? await getUpcomingEventsByProgram(programSlug)
    : await getUpcomingEvents(5);

  if (!events || events.length === 0) return null;

  const items: CarouselItem[] = events
    .filter((event) => event.title)
    .map((event) => {
      const dates = formatEventDates(
        event.dateTimes ?? [],
        event.timezoneLabel ?? undefined,
      );
      return {
        _key: event._id,
        title: event.title,
        image: event.heroImage as CarouselItem["image"],
        href: `/events/${event.slug.current}`,
        type: event.program?.shortLabel ?? undefined,
        subtitle: dates ? (
          <span>
            {dates.dateRange}
            {event.locationShort && <span>{"\n"}{event.locationShort}</span>}
          </span>
        ) : (
          event.locationShort
        ),
      };
    });

  if (items.length === 0) return null;

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">Upcoming Events</h2>
      </div>
      <Carousel items={items} />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/UpcomingEvents.tsx
git commit -m "feat: add programSlug filter to UpcomingEvents"
```

---

### Task 11: Update Existing Artist Queries

**Files:**
- Modify: `client/src/sanity/queries.ts`
- Modify: `client/src/app/artists/[slug]/page.tsx`

**Interfaces:**
- Changes `artist.program->` references to `artist.programs[0].program->`

- [ ] **Step 1: Update getArtistsBySlug query**

Replace the `program` projection in the existing query:

```typescript
// In getArtistsBySlug, replace:
//   "program": program->{ _id, title, slug, shortLabel }
// with:
//   "program": programs[0].program->{ _id, title, slug, shortLabel }
```

- [ ] **Step 2: Update artist page to handle transitional state**

In `client/src/app/artists/[slug]/page.tsx`, update how program is accessed. The page currently uses `artist.program` which will become undefined on new documents. Support both:

```tsx
// Replace:
//   { label: artist.program.shortLabel, children: artist.program.title }
// With:
//   { label: artist.program?.shortLabel, children: artist.program?.title }
```

Since `getArtistsBySlug` now only projects `programs[0].program`, the query result `program` field will be the first membership's program. Make it optional with `?` to handle edge cases.

- [ ] **Step 3: Commit**

```bash
git add client/src/sanity/queries.ts client/src/app/artists/[slug]/page.tsx
git commit -m "fix: update artist queries for programs[] array"
```

---

### Task 12: Regenerate TypeScript Types

**Files:**
- Regenerate: `client/src/sanity/types.ts`

- [ ] **Step 1: Run typegen**

```bash
pnpm -C sanity typegen
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm -C client typecheck
```

- [ ] **Step 3: Fix any type errors**

Check the typecheck output. The `artist` page may need `?.` optional chaining for `program` since it's now deprecated.

- [ ] **Step 4: Commit**

```bash
git add client/src/sanity/types.ts
git commit -m "chore: regenerate types after schema changes"
```

---

### Task 13: Verification

- [ ] **Step 1: Full typecheck**

```bash
pnpm -C client typecheck
```

Expected: PASS with no errors.

- [ ] **Step 2: Lint**

```bash
pnpm -C client lint
```

Expected: PASS with no errors.

- [ ] **Step 3: Build**

```bash
pnpm -C client build
```

Expected: Successful Next.js build with no errors.

- [ ] **Step 4: Review all changed files**

```bash
git diff --stat main
```

Expected: Only the files listed in this plan are modified or created.
