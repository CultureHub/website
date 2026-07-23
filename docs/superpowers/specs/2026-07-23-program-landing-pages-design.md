# Program Landing Pages — Schema & Frontend Design

**Date:** 2026-07-23
**Scope:** Update the Sanity `program` and `artist` document types to support dedicated landing pages for Residency and Experiments in Digital Storytelling (EDS), plus frontend routing and page components.

---

## 1. Context

CultureHub has three programs: Residency, Experiments in Digital Storytelling (EDS), and Re-Fest. Currently, programs are used as a taxonomy — a required `reference` on `artist`, `project`, and `event` documents. Programs are surfaced only through the Featured carousel on the Art & Technology page and as filter tags in the Projects list. There are no dedicated program landing pages.

New Figma designs (file: `erOB5ZYdcXZ27cukPYrfZr`) define full landing pages for Residency (node 1745:5655) and EDS (node 1750:6902). Re-Fest is out of scope for this pass — its page will have a significantly different design (festival archive, etc.) and will be addressed later. The schema must be designed to accommodate Re-Fest additions in the future without breaking existing programs.

### Design References

- **Residency Page:** https://www.figma.com/design/erOB5ZYdcXZ27cukPYrfZr/CultureHub-Web-Design-2026?node-id=1745-5655
- **EDS Page:** https://www.figma.com/design/erOB5ZYdcXZ27cukPYrfZr/CultureHub-Web-Design-2026?node-id=1750-6902

---

## 2. Design Decision: Extend `program`, Not Page Builder

A page builder approach was considered but rejected. With only 3 programs, each having well-defined, stable layouts, a structured approach is simpler and provides a better editor experience. The program document's optional page-level fields act as a "build your own page" but without the drag-and-drop complexity. If a future program needs a completely different layout, a `pageBuilder` block array can be added to `program` later without impacting existing programs.

**Principle:** Content type should always be optional and specific to each program. No program is forced to have fields it doesn't use.

---

## 3. Schema Changes

### 3.1 Artist — Replace `program` Reference with `programs` Array

**Current state:** `artist.program` is a single required `reference` to `program`.

**Problem:** An artist can participate in a residency multiple times (different years, different locations), or belong to multiple programs. The single reference can't capture this history.

**Solution:** Replace the `program` reference with a `programs` array of membership objects. Each membership records which program, which cohort year range, and which location.

```typescript
defineField({
  name: 'programs',
  title: 'Program Memberships',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'programMembership',
      title: 'Program Membership',
      fields: [
        defineField({
          name: 'program',
          type: 'reference',
          to: [{ type: 'program' }],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'yearStart',
          type: 'number',
          validation: (rule) => rule.required().integer(),
        }),
        defineField({
          name: 'yearEnd',
          type: 'number',
          validation: (rule) => rule.required().integer(),
        }),
        defineField({
          name: 'location',
          type: 'string',
          description: 'e.g. "Los Angeles", "New York → Berlin"',
        }),
      ],
      preview: {
        select: {
          title: 'program.title',
          subtitle: 'yearStart',
        },
        prepare: ({ title, subtitle }) => ({
          title: title || 'Untitled Program',
          subtitle: subtitle ? `${subtitle}` : '',
        }),
      },
    }),
  ],
})
```

**Deprecation of old `program` field:**

The existing `program` field on `artist` will be deprecated (not deleted) following the Sanity deprecation pattern: `readOnly: true`, `hidden: ({value}) => value === undefined`, `initialValue: undefined`. A migration script copies the old `program` value into `programs[0]` for all existing artists. The old field is deleted in a follow-up after the migration completes.

**Validation note:** The `artist` document previously required `program`. After migration, `programs` should require at least one membership (`validation: rule => rule.min(1)`). This ensures backward compatibility — all artists must still belong to at least one program.

### 3.2 Program — New Page-Level Fields

All new fields are **optional** — they only appear when an editor needs them for a specific program's landing page.

| Field | Type | Used By | Description |
|---|---|---|---|
| `pageDescription` | `array` of `block` | Residency, EDS | Full description for the page header area |
| `jumpToButtons` | `array` of `{label, anchor}` | EDS | In-page navigation buttons (e.g. "Projects", "Artists") |
| `openCallTitle` | `string` | Residency | Heading for the Open Call section |
| `openCallImage` | `image` | Residency | Hero image for the open call |
| `openCallTimeline` | `text` | Residency | Timeline info (e.g. "Applications Open: April 24…") |
| `openCallWhere` | `text` | Residency | Locations for the opportunity |
| `openCallBenefits` | `text` | Residency | Benefits/stipends description |
| `openCallDescription` | `array` of `block` | Residency | Full open call description (rendered in 2 columns) |
| `locationContent` | `array` of object | Residency | NY/LA tabbed content |
| `featuredArtists` | `array` of reference | EDS | Curated artist grid for EDS page |
| `featuredProjects` | `array` of reference | EDS | Curated project carousel for EDS page |

#### `locationContent` object:

```typescript
{
  location: string,         // "Los Angeles", "New York"
  displayTitle: string,     // "CultureHub Los Angeles Residency"
  description: block[],     // Rich text body
  accentColor: string,      // Hex color for tab styling
}
```

#### `jumpToButtons` object:

```typescript
{
  label: string,            // "Projects", "Artists"
  anchor: string,           // "#projects", "#artists"
}
```

**Re-Fest future-proofing:** When Re-Fest needs a landing page with a festival archive, new fields can be added to `program` (e.g. `festivalArchive: block[]`, `pastFestivals: array of object`) without affecting Residency or EDS. The existing `featuredArtists` and `featuredProjects` fields are already available if needed.

### 3.3 No Schema Changes Needed

- **`project`** — already references `program` correctly. Recent projects can be queried by program slug without new fields.
- **`event`** — already references `program` correctly. Upcoming events filtered by program require no schema changes.
- **`artAndTechnologyPage`** — no changes. The Featured carousel still works with existing programs.

---

## 4. Frontend Architecture

### 4.1 Routing

**Route:** `/[slug]` — a dynamic catch for all program slugs.

Slug resolution logic:
1. Fetch the program document by slug
2. If no program found → return 404
3. If program exists → render the program landing page with its configured sections

Routes in this pass:
- `/residency` → Residency landing page
- `/experiments-in-digital-storytelling` → EDS landing page
- `/re-fest` → 404 for now (no page fields configured, or redirect to Art & Technology page)

### 4.2 Page Component Structure

```
ProgramPage (server component)
├── ProgramHeader
│   ├── Title (from program.title or program.displayTitle)
│   ├── PageDescription (from program.pageDescription, portable text)
│   └── JumpToButtons (from program.jumpToButtons, optional)
│
├── ResidentArtistGrid (only if slug === "residency")
│   ├── Current/Past toggle (derived from max yearStart across artists)
│   ├── Year filter chips (from query grouping by year range)
│   └── Artist card grid (2 columns)
│
├── OpenCallSection (only if program.openCallTitle exists)
│   ├── Section heading
│   ├── Hero image
│   ├── Info grid (Timeline / Where / Benefits)
│   └── Description (2 columns, portable text)
│
├── LocationTabs (only if program.locationContent exists and has items)
│   ├── Tab bar (NY / LA)
│   └── Tab content (portable text + links)
│
├── FeaturedProjects (only if program.featuredProjects exists and has items)
│   ├── "Recent Projects" section heading
│   └── Horizontal scrollable carousel with arrows
│
├── FeaturedArtists (only if program.featuredArtists exists and has items)
│   ├── "Featured Artists" section heading
│   └── Artist card grid (3 columns)
│
└── UpcomingEventsCarousel (always)
    ├── "Upcoming Events" section heading
    └── Horizontal scrollable carousel of event cards
```

### 4.3 Data Fetching

**Program page query (GROQ):**

```groq
*[_type == "program" && slug.current == $slug][0]{
  _id, title, displayTitle, slug, shortLabel, accentColor,
  heroImage { asset->, alt, credit },
  pageDescription,
  jumpToButtons,
  openCallTitle,
  openCallImage { asset->, alt, credit },
  openCallTimeline,
  openCallWhere,
  openCallBenefits,
  openCallDescription,
  locationContent[]{
    location, displayTitle, description,
    accentColor
  },
  featuredArtists[]->{
    _id, name, slug, image { asset->, alt }
  },
  featuredProjects[]->{
    _id, title, slug, heroImage { asset->, alt },
    "artistName": people
  }
}
```

**Resident artists query (separate, only for Residency):**

```groq
*[_type == "artist" && $programId in programs[].program._ref]{
  _id,
  name, slug,
  image { asset->, alt },
  "membership": programs[program._ref == $programId][0]{
    yearStart, yearEnd, location
  }
} | order(membership.yearStart desc)
```

The frontend derives Current/Past from the query results: the highest `yearStart` value = "Current" cohort, all others = "Past."

**Upcoming events query (per page):**

```groq
*[_type == "event" && program->slug.current == $programSlug && dateTimes[0].start > now()] | order(dateTimes[0].start asc)[0...5]{
  title, slug, dateTimes, locationShort,
  "program": program->{ title, slug, shortLabel },
  heroImage { asset->, alt }
}
```

---

## 5. Migration Plan

### Phase 1: Schema Changes
1. Add `programs[]` array field to `artist`
2. Add optional page-level fields to `program`
3. Deprecate `artist.program` (readOnly, hidden when undefined)
4. Deploy schema changes

### Phase 2: Data Migration
1. Run migration script to copy `artist.program` → `artist.programs[0]` for all existing artists
2. For existing Residency artists, populate `yearStart`, `yearEnd`, and `location` where data is available
3. Populate `pageDescription` on both the Residency and EDS program documents
4. Populate open call and location tab content on Residency program
5. Populate featured artists/projects on EDS program

### Phase 3: Frontend
1. Add `getProgramBySlug()` query
2. Add resident artists query (filtered by program ID + year range)
3. Add upcoming events by program query
4. Create `app/[slug]/page.tsx` — program landing page
5. Create section components (ProgramHeader, ResidentArtistGrid, OpenCall, LocationTabs, FeaturedProjects, FeaturedArtists, UpcomingEvents)
6. Update existing queries that reference `artist.program->` to use `artist.programs[].program->`
7. Re-generate TypeScript types via `sanity typegen generate`

### Phase 4: Cleanup
1. Delete deprecated `artist.program` field
2. Deploy

---

## 6. Query Migration Checklist

Existing queries that reference `artist.program->` and need updating:

| File | Query | Change |
|---|---|---|
| `client/src/sanity/queries.ts` `getArtistsBySlug` | `"program": program->{ ... }` | Change to `"programs": programs[]{ program->{ ... }, yearStart, yearEnd, location }` |
| `client/src/sanity/queries.ts` `getArtistFilterOptions` | Uses `program->` | Update to use `programs[].program->` |
| `client/src/app/artists/[slug]/page.tsx` | References `artist.program` | Update to use `artist.programs` |
| `client/src/components/FeaturedComponent.tsx` | Hardcoded program slugs with icons | No query change needed (uses program slugs, not artist queries) |
| `client/src/components/ProjectsList.tsx` | Program filter | No query change needed (uses program documents directly) |

---

## 7. Edge Cases & Constraints

- **Re-Fest slug at `/[slug]`**: Will return 404 until a page is designed and page-level fields are populated on its program document.
- **Slug conflicts**: The `/[slug]` dynamic route must not collide with existing static routes (`/artists`, `/projects`, `/events`, `/art-and-technology`). Next.js resolves static routes before dynamic ones, so this is handled automatically as long as no program slug matches a static route name.
- **Empty sections**: If a program has no `featuredArtists` or `featuredProjects`, those sections simply don't render. The page gracefully degrades to showing only filled sections.
- **Artist without program membership**: The `programs` field requires a minimum of 1 item, enforcing that every artist belongs to at least one program.
- **Multiple residencies**: An artist can appear multiple times in the Resident Artist grid if they have multiple membership entries for the Residency program — once per cohort year. This is correct behavior.
