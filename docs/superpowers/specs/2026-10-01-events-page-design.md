# Events Page Design

## Overview

Implement the `/events` page — a calendar + events hub for the CultureHub website. The
page lets visitors browse upcoming events via a month calendar and a master–detail list,
and browse past events via year/month filters. It complements the existing event detail
page at `/events/[slug]`.

This spec is driven by the Figma designs:

- Main events page: node `1743-2205`
- Upcoming empty state: node `2214-6593`
- Past tab: node `2356-2459`

## Goals

- Provide a browsable calendar of upcoming events.
- Provide an upcoming events list with an inline detail preview (hover) and a link to the
  full detail page.
- Provide a past events list filtered by year and month (derived from data).
- Show a designed empty state when there are no upcoming events.
- Reuse the existing `event` Sanity schema — no new schema types.

## Non-Goals

- No changes to the existing event detail page (`/events/[slug]`).
- No new Sanity schema/content types.
- No pagination or infinite scroll.
- The calendar reflects upcoming events only (past months show no indicators).
- The empty-state newsletter form is static (no backend), matching the existing footer.

## Architecture

- `app/events/page.tsx` (server component) fetches all **upcoming** events once and passes
  them to the client component. It also fetches the list of programs needed for program
  labels.
- `components/Events/EventsExplorer.tsx` (client component) owns all interaction state:
  active tab (upcoming/past), hovered event, calendar month, day selection, and past
  year/month filters.
- **Past events load dynamically**: the client calls a server action
  (`getPastEventsAction`) on first switch to the "Past" tab. Year/month filtering happens
  client-side from that fetched set (derived filters).

### Data flow

```
app/events/page.tsx (server)
  ├─ getUpcomingEvents()         → all upcoming events (full data)
  └─ getPrograms()               → program labels/accents
         │
         ▼
EventsExplorer (client) ──props: upcomingEvents, programs
  ├─ Upcoming tab: render list + preview from props
  ├─ Past tab:     getPastEventsAction() → pastEvents (state), filter by year/month
  └─ Calendar:     derived from upcomingEvents
```

## Components

New components under `client/src/components/Events/`:

- `EventsExplorer.tsx` — client orchestrator; receives `upcomingEvents` + `programs`.
- `EventsCalendar.tsx` — month calendar widget (presentational, controlled).
- `EventList.tsx` — upcoming event rows; reports hover/click to parent.
- `EventRow.tsx` — a single event list row.
- `EventSummary.tsx` — detail preview panel (hero image, title, location, dates, time,
  description, buttons).
- `EventsTabs.tsx` — Upcoming/Past toggle.
- `PastEvents.tsx` — past tab (year pills, month rail, event rows).
- `EventsEmptyState.tsx` — upcoming empty state (text + newsletter field + "C" pattern).

Helpers to reuse: `formatEventDates` from `util/event-date.ts`.

## Page layout

Outer wrapper `px-6 md:px-16` matching existing pages. Content width ~1312px.

1. **Header**: "Events" (Milling Triplex bold, 40px) and below it
   "Today is Monday, April 6th, 2026" (Brook, 16px). The date is computed from the real
   current date.

2. **Calendar** (left column, ~329px): month label (e.g. "APR 2026"), prev/next arrows,
   SUN–SAT headers, day grid. Today is highlighted with a CH Midnite circle and CH Lite
   text. Days with upcoming events show an indicator (colored dot). Below the grid is a
   status line.

   Status line behavior:
   - Default: "There are X events this week." where X = upcoming events in the real
     current week (the week containing today).
   - On day hover: shows that day's event names with time (e.g. "Castle Door, 7pm ET").

   Day click behavior:
   - Day with 0 events → no action.
   - Day with exactly 1 event → navigate to `/events/[slug]`.
   - Day with 2+ events → filter the upcoming list to that day.

3. **Tabs**: "Upcoming" / "Past" (150px pills). Active tab = CH Midnite background, CH Lite
   text; inactive = outline.

4. **Master–detail** (list 671px + detail 641px) shown for Upcoming.

### Event row

2×2 grid, columns `1fr : 2fr`:

```
NEW YORK                    Experiments in Digital Storytelling   ← location (12px) / program (12px italic)
THU. APR 09- SAT. APR 11    Castle Door                          ← date (16px) / title (28px)
```

- `location` = `event.locationShort` (Brook 12px, uppercase).
- `program` = `event.program.displayTitle` (rendered via `PortableText`) falling back to
  `event.program.shortLabel` (Brook italic 12px). This matches how `ProjectsList` renders
  program names.
- `date` = `formatEventDates(event.dateTimes).dateRange` (Brook 16px, uppercase).
- `title` = `event.title` (Milling Duplex 28px).

### Detail preview panel (EventSummary)

- Hero image (381px height).
- Title (Milling Triplex bold, 48px).
- Location, date, time (Brook 20px; location uppercase 16px).
- Description (Milling Simplex 24px).
- Buttons: render `event.links` (label/shortLabel, external URL) plus an always-present
  "Learn More" button linking to `/events/[slug]`.

Hovering a row sets the previewed event; clicking a row or "Learn More" navigates to
`/events/[slug]`. On mobile (no hover) rows navigate directly.

## Past tab

- Year pills row (e.g. 2026 / 2025 / 2024), derived from past events, single-select.
- Listings panel: a months rail (vertical pills, e.g. MAR / FEB / JAN / APR) + event rows
  (same grid as upcoming).
- Same detail preview panel on the right.

Filter semantics:
- Selecting a year shows that year's events, grouped by month; the months rail shows only
  months with events in the selected year.
- Selecting a month filters to that month.
- Filters are single-select and derived from the fetched past events.

## Upcoming empty state

When there are no upcoming events:

- Listings panel shows: "There are no upcoming events scheduled at this time. To be the
  first to hear about future opportunities, you can sign up for the CultureHub
  Newsletter." (Brook Italic 20px) followed by a "Your Email" input + submit button.
- Detail panel shows the decorative "C" pattern.
- The newsletter field is static (no backend).

## Queries

Add to `client/src/sanity/queries.ts`:

- `getAllUpcomingEvents()` — all events whose last `dateTimes` end is `>= now`, ordered
  ascending by `dateTimes[0].start`, no arbitrary limit (reuses the
  `UPCOMING_EVENTS_FRAGMENT` shape). The existing `getUpcomingEvents(limit)` stays as-is
  for the `UpcomingEvents` carousel.
- `getPastEvents()` — all events whose last `dateTimes` end is `< now`, ordered descending
  by `dateTimes[0].start`.
- `getPrograms()` — already exists (for program labels/accents).

Add a server action (e.g. `client/src/app/events/actions.ts`) wrapping `getPastEvents()`.

## Styling

- Colors: CH Midnite `#0A0018`, CH Lite `#F2FBFD`, accent colors from programs.
- Fonts: `font-milling` (Milling Trial), `font-brook` (Brook) — already available via
  `@/atoms/text`.
- Follow existing Tailwind conventions in the codebase.

## Testing

Jest unit tests for:

- Calendar month generation and "events this week" counting.
- Day indicator grouping (which days have events, count per day).
- Past year/month filter derivation (grouping events by year, listing months).
- Empty-state rendering.

Run `pnpm -C client test` (or `pnpm --filter client test`).

## Verification

- `pnpm -C client typecheck`
- `pnpm -C client lint`
- `pnpm -C client test`
