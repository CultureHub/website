# Event Page Implementation Design

## Context

Three Figma event page designs (Castle Door, Pool Party, At this table) share a common structure with variations. The event schema is already deployed in Sanity. This design covers the frontend implementation to render event pages.

## Page Structure

The event detail page follows this layout, matching all three designs:

```
<main>
  1. Hero Image (full-width)
  2. Photo credit line (right-aligned, italic, gray)
  3. Information header:
     - Breadcrumb: "Events" > program.shortLabel
     - Location pin + location text (right-aligned)
     - Title (48px)
     - Ticket/RSVP link button(s)
  4. Main content row:
     - Details sidebar (right border): When, Where, Cost, Access
     - Description (PortableText) + any in-body link buttons
  5. Optional sections (rendered only when populated):
     - About the Artists (featuredArtists)
     - Artworks on View (artworks)
     - About the Program (aboutProgram)
     - Schedule (schedule)
     - Credits (credits)
  6. Upcoming Events carousel (hidden when getUpcomingEvents returns empty)
</main>
```

Global layout (Menu, Footer) is inherited from the root layout.

## Component Decisions

### Reuse As-Is
- `Breadcrumbs` — already supports pill-variant items with program shortLabel
- `LocationPin` — takes `locations: string[]`, receive `[event.location]`
- `SanityImage` — hero images, artist images, artwork images
- `Button` — ticket/RSVP links, variant `rounded`
- `PortableText` — all block content fields
- `CreditSection` — already handles the existing credit hierarchy for all three design cases

### Refactored
- `RelatedCarousel` splits into:
  - **`Carousel`** — generic carousel accepting `items: CarouselItem[]` where each item has `title`, `image`, optional `href`, `type` (for MediaTagIcon), and `subtitle` (ReactNode)
  - **`RelatedCarousel`** — thin wrapper that maps `project.related[]` to `CarouselItem[]` (backward compatible)

### New
- **`UpcomingEvents`** — server component calling `getUpcomingEvents()`, mapping results to `CarouselItem[]` with date formatting + location as subtitle, `href="/events/${slug}"`, `type="event"`
- **`formatEventDates` utility** — `client/src/util/event-date.ts`, see below
- **Event page** — `client/src/app/events/[slug]/page.tsx`

## Date Formatting Utility

### `client/src/util/event-date.ts`

```ts
interface FormattedEventDates {
  dateRange: string;       // "April 9–11, 2026" or "Wednesday, June 3, 2026"
  timeDescription: string; // "6–8PM" or "2pm and 7pm ET" or "Thursday & Friday at 7pm ET, Saturday at 4pm & 7:30pm ET"
}

function formatEventDates(dateTimes: { start: string; end: string }[]): FormattedEventDates | null;
```

Returns `null` for empty arrays.

### Test Cases

| # | Scenario | Expected dateRange | Expected timeDescription |
|---|----------|-------------------|-------------------------|
| 1 | Single day, single range (6-8PM) | "Wednesday, June 3, 2026" | "6–8PM" |
| 2 | Single day, two time slots | "Thursday, May 28, 2026" | "2pm and 7pm ET" |
| 3 | Two days, same time each | "April 9–10, 2026" | "Thursday & Friday at 7pm ET" |
| 4 | Three days, varied times | "April 9–11, 2026" | "Thursday & Friday at 7pm ET, Saturday at 4pm & 7:30pm ET" |
| 5 | Multi-month range | "May 28 – June 3, 2026" | "times vary" (or per-day) |
| 6 | All-day event (start/end differ by full day, times are midnight) | "July 6–10, 2026" | "All day" |
| 7 | Empty array | null | null |
| 8 | Same month, consecutive days | "April 9–11, 2026" | grouped time string |
| 9 | Single entry with no end time (start only) | "Wednesday, June 3, 2026" | time from start |
| 10 | Cross-year range | "December 31, 2026 – January 2, 2027" | yearly context |

## Files

| File | Action |
|------|--------|
| `client/src/util/event-date.ts` | Create |
| `client/src/components/Carousel.tsx` | Adapt from RelatedCarousel |
| `client/src/components/RelatedCarousel.tsx` | Rewrite as Carousel wrapper |
| `client/src/components/UpcomingEvents.tsx` | Create |
| `client/src/app/events/[slug]/page.tsx` | Create |
| `client/__tests__/util/event-date.test.ts` | Create |
| `client/__tests__/components/Carousel.test.tsx` | Create |
| `client/__tests__/components/UpcomingEvents.test.tsx` | Create |
| `client/__tests__/app/events/[slug]/page.test.tsx` | Create |

## What's Not Included

- Events listing/index page — out of scope
- Navigation menu link to events section — separate task
- Real image uploads to Sanity — placeholder references for initial data
