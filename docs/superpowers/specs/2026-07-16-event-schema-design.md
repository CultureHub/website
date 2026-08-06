# Event Schema Design

## Context

CultureHub needs an event content type for their Sanity CMS. Three Figma design examples and a notes document define the requirements. The existing codebase has `project`, `artist`, and `program` types with shared utilities that the event type will reuse.

## Decision: Separate Document Type

Events are their own document type (`event`), sharing field utilities with existing types but maintaining a distinct shape. Events have unique needs (multi-slot date/times, dual ticket links, artworks-on-view, schedule) that warrant a separate type rather than extending `project`.

## Schema Design

### Section 1: Core Metadata

| Field | Type | Notes |
|-------|------|-------|
| `title` | `string` | Required |
| `slug` | `slug` | From title |
| `heroImage` | `image` | Reuses `imageField()` from `@/util/image` (includes alt, credits) |
| `program` | `reference` → `program` | Reuses `programField()` from `@/util/program`. Tags event to a program category (e.g., "CoLab", "Experiments in Digital Storytelling", "Community") |
| `description` | `array` of `block` | Rich text event copy |

### Section 2: Event Logistics

| Field | Type | Notes |
|-------|------|-------|
| `dateTimes` | `array` of `{start: datetime, end: datetime}` | Multiple date/time ranges. Frontend handles display formatting: grouping by day, showing varied times per day, collapsing single-day ranges |
| `cost` | `string` | Free text: `"$15"`, `"$25-$100"`, `"Free"` |
| `location` | `text` | Free text, handles single venue, multi-line addresses, and hybrid locations (e.g., "New York, Online") |
| `accessInfo` | `text` | Accessibility details (elevator access, captions, livestream instructions) |
| `links` | `array` of `{text: string, url: url}` | Ticket buttons, RSVPs, livestream links. Covers 0, 1, or 2+ links. Editors provide the display text ("Tickets", "In Person Tickets", "Online Tickets", "Watch Livestream") |

### Section 3: Optional Content Sections

All are top-level fields (not page builder). Each is only rendered on the frontend when populated.

**About the Artists** (`featuredArtists`):

```
array of {
  artist: reference → artist (optional),
  image: image (override, optional),
  name: string (override, optional),
  bio: array of block (override, optional)
}
```

Frontend behavior: when `artist` reference is set, use referenced artist's canonical data as fallback for any override fields left empty. When `artist` reference is omitted, all fields function as inline content.

**Artworks on View** (`artworks`):

```
array of {
  image: image,
  description: array of block
}
```

**About the Program** (`aboutProgram`):

```
array of block
```

Plain rich text. No program reference — the program reference on the event itself (Section 1) handles tagging.

**Schedule / Agenda** (`schedule`):

```
{
  description: array of block (optional),
  items: array of {
    title: string,
    time: string,
    description: array of block (optional)
  }
}
```

The top-level description handles introductory text (e.g., "No prior experience in coding or crochet is required!").

### Section 4: Credits

Reuses the existing `creditFields` shared utility from `@/schemaTypes/shared/creditFields` — same pattern as `projectType` (`...creditFields`).

The existing structure (Location > Credit Groups > role/people entries) supports all three design cases:
- Example 1: 2 teams (Creative Team, CultureHub Team)
- Example 2: no credits shown (field is optional, won't render)
- Example 3: 4 teams in a grid (Production Team, CultureHub Team, Wellness Together Team, Broadcaster Team)

### Section 5: What's Omitted

- **`related` field**: Not included. The Upcoming Events carousel at the bottom of event pages will dynamically query the latest events.
- **`images` gallery field**: Not included. Removed per review — hero image and artwork images within their sections are sufficient.
- **In-person vs online modeling**: Not modeled explicitly. The flexible `location` text field and `links` array handle any combination without requiring structural distinctions.

## Implementation Notes

- **Sanity icon**: Use `CalendarIcon` from `@sanity/icons`
- **Studio structure**: Add `event` to the schema registry in `sanity/schemaTypes/index.ts` and to the studio structure in `sanity/structure/index.ts`
- **TypeGen**: After schema is deployed, `sanity typegen generate` will regenerate `client/src/sanity/types.ts`
- **Frontend queries**: A new `getEvents()` query and `getEventBySlug()` query will be added to `client/src/sanity/queries.ts`
- **Route**: Event pages will live at `/events/[slug]` in the Next.js App Router
- **Upcoming carousel**: The existing `RelatedCarousel` component can be adapted, or a dedicated `UpcomingEvents` component created
