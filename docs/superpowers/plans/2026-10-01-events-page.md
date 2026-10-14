# Events Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/events` page — a calendar + main–detail events hub with upcoming/past tabs.

**Architecture:** A server component (`app/events/page.tsx`) fetches all upcoming events and renders a client `EventsExplorer`. `EventsExplorer` owns tab/hover/calendar/filter state; past events are fetched lazily on first "Past" tab visit via a server action. Pure date/filter logic lives in testable `util/` modules.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Sanity (`next-sanity`), Jest + Testing Library.

## Global Constraints

- Reuse the existing `event` Sanity schema — no new schema types.
- No pagination / infinite scroll.
- The calendar reflects **upcoming events only**.
- The empty-state newsletter form is **static** (no backend).
- Colors: CH Midnite `#0A0018`, CH Lite `#F2FBFD`.
- Fonts: `font-milling` (Milling Trial), `font-brook` (Brook) via `@/atoms/text`.
- Refer to the event detail page with `main–detail` terminology (not "master–detail").
- All client components that use React hooks MUST begin with `"use client"`.
- Run `pnpm -C client typecheck`, `pnpm -C client lint`, `pnpm -C client test` before completion.

---

### Task 1: Calendar date helpers

**Files:**
- Create: `client/src/util/events-calendar.ts`
- Test: `client/__tests__/util/events-calendar.test.ts`

**Interfaces:**
- Produces: `CalendarEventRef`, `WEEKDAY_LABELS`, `MONTH_LABELS`, `toDayKey`, `isSameDay`, `eventStartDayKey`, `getEventsForDay`, `getEventsForDayKey`, `countEventsInCurrentWeek`, `buildMonthGrid`, `formatToday`, `formatDayHoverLine`.

- [ ] **Step 1: Write the failing test**

Create `client/__tests__/util/events-calendar.test.ts`:

```ts
import {
  buildMonthGrid,
  countEventsInCurrentWeek,
  formatDayHoverLine,
  formatToday,
  getEventsForDay,
  getEventsForDayKey,
  MONTH_LABELS,
  toDayKey,
} from "@/util/events-calendar";

const event = (id: string, starts: string[]) => ({
  _id: id,
  title: id,
  slug: id,
  timezoneLabel: null,
  dateTimes: starts.map((s) => ({ start: s, end: s })),
});

describe("events-calendar", () => {
  it("formats a day key", () => {
    expect(toDayKey(new Date(2026, 3, 6))).toBe("2026-04-06");
  });

  it("builds a 42-cell month grid anchored to Sunday", () => {
    const grid = buildMonthGrid(2026, 3); // April 2026
    expect(grid).toHaveLength(42);
    expect(toDayKey(grid[0])).toBe("2026-03-29"); // Sunday before April 1
    expect(grid[0].getDay()).toBe(0);
  });

  it("groups events by start day", () => {
    const events = [
      event("a", ["2026-04-06T18:00:00-04:00"]),
      event("b", ["2026-04-06T10:00:00-04:00"]),
      event("c", ["2026-04-07T18:00:00-04:00"]),
    ];
    const day = new Date(2026, 3, 6);
    expect(getEventsForDay(events, day).map((e) => e._id)).toEqual(["a", "b"]);
    expect(getEventsForDayKey(events, "2026-04-07").map((e) => e._id)).toEqual([
      "c",
    ]);
  });

  it("counts events in the current week", () => {
    const today = new Date(2026, 3, 6); // Monday April 6 2026
    const events = [
      event("in-week", ["2026-04-08T18:00:00-04:00"]),
      event("out-week", ["2026-04-13T18:00:00-04:00"]),
      event("before-week", ["2026-04-04T18:00:00-04:00"]),
    ];
    expect(countEventsInCurrentWeek(events, today)).toBe(1);
  });

  it("formats today's date with ordinal", () => {
    expect(formatToday(new Date(2026, 3, 6))).toBe(
      "Today is Monday, April 6th, 2026",
    );
    expect(formatToday(new Date(2026, 3, 2))).toBe(
      "Today is Thursday, April 2nd, 2026",
    );
  });

  it("formats the day hover line", () => {
    const events = [
      {
        _id: "a",
        title: "Castle Door",
        slug: "castle-door",
        timezoneLabel: "ET",
        dateTimes: [
          { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
        ],
      },
    ];
    expect(formatDayHoverLine(events)).toBe("Castle Door, 7pm ET");
  });

  it("exposes month labels", () => {
    expect(MONTH_LABELS[0]).toBe("JAN");
    expect(MONTH_LABELS[11]).toBe("DEC");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C client test --watchAll=false __tests__/util/events-calendar.test.ts`
Expected: FAIL with "Cannot find module '@/util/events-calendar'".

- [ ] **Step 3: Export a start-time formatter from event-date**

Make `parseDate` public and append `formatEventStartTime` to `client/src/util/event-date.ts` (both reuse the existing timezone-safe `parseDate`/`formatTime`, lowercase `am`/`pm`):

```ts
// change `function parseDate(iso: string): Date {` to:
export function parseDate(iso: string): Date {
```

Then append:

```ts
export function formatEventStartTime(
  dateTime: { start: string },
  timezoneLabel?: string,
): string {
  const start = parseDate(dateTime.start);
  const tz = timezoneLabel ? ` ${timezoneLabel}` : "";
  return `${formatTime(start)}${tz}`;
}
```

- [ ] **Step 4: Write the implementation**

Create `client/src/util/events-calendar.ts`:

```ts
import { formatEventStartTime, parseDate } from "@/util/event-date";

export interface CalendarEventDate {
  start: string;
  end: string;
}

export interface CalendarEventRef {
  _id: string;
  title: string;
  slug: string;
  dateTimes?: CalendarEventDate[] | null;
  timezoneLabel?: string | null;
}

export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDayKey(a) === toDayKey(b);
}

export function eventStartDayKey(event: CalendarEventRef): string | null {
  const times = event.dateTimes ?? [];
  if (times.length === 0) return null;
  const starts = times
    .map((t) => parseDate(t.start))
    .sort((a, b) => a.getTime() - b.getTime());
  return toDayKey(starts[0]);
}

export function getEventsForDayKey<T extends CalendarEventRef>(
  events: T[],
  key: string,
): T[] {
  return events.filter((e) => eventStartDayKey(e) === key);
}

export function getEventsForDay<T extends CalendarEventRef>(
  events: T[],
  day: Date,
): T[] {
  return getEventsForDayKey(events, toDayKey(day));
}

export function countEventsInCurrentWeek<T extends CalendarEventRef>(
  events: T[],
  today: Date = new Date(),
): number {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return events.filter((e) => {
    const key = eventStartDayKey(e);
    if (!key) return false;
    const d = new Date(`${key}T00:00:00`);
    return d >= weekStart && d < weekEnd;
  }).length;
}

export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(
      new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i),
    );
  }
  return days;
}

export function formatToday(date: Date = new Date()): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `Today is ${weekday}, ${month} ${day}${ordinal}, ${date.getFullYear()}`;
}

export function formatDayHoverLine<T extends CalendarEventRef>(events: T[]): string {
  return events
    .map((e) => {
      const first = e.dateTimes?.[0];
      if (!first) return e.title;
      return `${e.title}, ${formatEventStartTime(first, e.timezoneLabel ?? undefined)}`;
    })
    .join("\n");
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm -C client test --watchAll=false __tests__/util/events-calendar.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 6: Commit**

```bash
git add client/src/util/event-date.ts client/src/util/events-calendar.ts client/__tests__/util/events-calendar.test.ts
git commit -m "feat(events): add calendar date helpers"
```

---

### Task 2: Past-event filter helpers

**Files:**
- Create: `client/src/util/events-filter.ts`
- Test: `client/__tests__/util/events-filter.test.ts`

**Interfaces:**
- Consumes: `CalendarEventRef` from `@/util/events-calendar`.
- Produces: `PastEventRef`, `eventYear`, `eventMonthIndex`, `deriveYears`, `deriveMonths`, `filterPastEvents`.

- [ ] **Step 1: Write the failing test**

Create `client/__tests__/util/events-filter.test.ts`:

```ts
import {
  deriveMonths,
  deriveYears,
  eventMonthIndex,
  eventYear,
  filterPastEvents,
} from "@/util/events-filter";

const event = (id: string, start: string) => ({
  _id: id,
  title: id,
  slug: id,
  dateTimes: [{ start, end: start }],
});

describe("events-filter", () => {
  it("derives years descending", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2024-05-01T10:00:00-04:00"),
      event("c", "2025-01-01T10:00:00-05:00"),
    ];
    expect(deriveYears(events)).toEqual([2026, 2025, 2024]);
  });

  it("derives months within a year descending", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2026-01-01T10:00:00-05:00"),
      event("c", "2025-12-01T10:00:00-05:00"),
    ];
    expect(deriveMonths(events, 2026)).toEqual([2, 0]); // Mar, Jan
  });

  it("reads year and month index", () => {
    expect(eventYear(event("a", "2026-03-15T10:00:00-04:00"))).toBe(2026);
    expect(eventMonthIndex(event("a", "2026-03-15T10:00:00-04:00"))).toBe(2);
  });

  it("filters by year and month", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2026-01-01T10:00:00-05:00"),
      event("c", "2025-03-01T10:00:00-05:00"),
    ];
    expect(filterPastEvents(events, 2026, null).map((e) => e._id)).toEqual([
      "a",
      "b",
    ]);
    expect(filterPastEvents(events, 2026, 2).map((e) => e._id)).toEqual(["a"]);
    expect(filterPastEvents(events, null, null).map((e) => e._id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C client test --watchAll=false __tests__/util/events-filter.test.ts`
Expected: FAIL with "Cannot find module '@/util/events-filter'".

- [ ] **Step 3: Write the implementation**

Create `client/src/util/events-filter.ts`:

```ts
import { parseDate } from "@/util/event-date";
import type { CalendarEventRef } from "@/util/events-calendar";

export type PastEventRef = CalendarEventRef;

function earliestStart(event: PastEventRef): Date | null {
  const times = event.dateTimes ?? [];
  if (times.length === 0) return null;
  const starts = times
    .map((t) => parseDate(t.start))
    .sort((a, b) => a.getTime() - b.getTime());
  const first = starts[0];
  return first && !Number.isNaN(first.getTime()) ? first : null;
}

export function eventYear(event: PastEventRef): number | null {
  const first = earliestStart(event);
  if (!first) return null;
  return first.getFullYear();
}

export function eventMonthIndex(event: PastEventRef): number | null {
  const first = earliestStart(event);
  if (!first) return null;
  return first.getMonth();
}

export function deriveYears<T extends PastEventRef>(events: T[]): number[] {
  const years = new Set<number>();
  for (const e of events) {
    const y = eventYear(e);
    if (y != null) years.add(y);
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function deriveMonths<T extends PastEventRef>(
  events: T[],
  year: number,
): number[] {
  const months = new Set<number>();
  for (const e of events) {
    if (eventYear(e) === year) {
      const m = eventMonthIndex(e);
      if (m != null) months.add(m);
    }
  }
  return Array.from(months).sort((a, b) => b - a);
}

export function filterPastEvents<T extends PastEventRef>(
  events: T[],
  year: number | null,
  month: number | null,
): T[] {
  return events.filter((e) => {
    if (year != null && eventYear(e) !== year) return false;
    if (month != null && eventMonthIndex(e) !== month) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm -C client test --watchAll=false __tests__/util/events-filter.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/util/events-filter.ts client/__tests__/util/events-filter.test.ts
git commit -m "feat(events): add past-event filter helpers"
```

---

### Task 3: Event queries and server action

**Files:**
- Modify: `client/src/sanity/queries.ts` (append functions)
- Create: `client/src/app/events/actions.ts`

**Interfaces:**
- Consumes: `client` from `@/sanity/client`, `defineQuery` from `next-sanity`.
- Produces: `EventListItem` type, `getAllUpcomingEvents(): Promise<EventListItem[]>`, `getPastEvents(): Promise<EventListItem[]>`, `getPastEventsAction(): Promise<EventListItem[]>`.

- [ ] **Step 1: Add the shared fragment and query functions**

Append to `client/src/sanity/queries.ts` (before the final `getUpcomingEvents` function is fine — append at end of file):

```ts
const EVENT_LIST_FRAGMENT = `{
  _id,
  title,
  "slug": slug.current,
  dateTimes,
  location,
  locationShort,
  timezoneLabel,
  description,
  links,
  "program": program->{
    _id, title, slug, shortLabel, displayTitle
  },
  heroImage {
    asset,
    hotspot,
    crop,
    alt
  }
}`;

export async function getAllUpcomingEvents() {
  const getAllUpcomingEventsQuery = defineQuery(
    `*[
      _type == "event"
      && defined(slug.current)
      && count(dateTimes) > 0
      && dateTimes[-1].end >= $now
    ] | order(dateTimes[0].start asc)
      ${EVENT_LIST_FRAGMENT}`,
  );
  return client.fetch(
    getAllUpcomingEventsQuery,
    { now: new Date().toISOString() },
    options,
  );
}

export async function getPastEvents() {
  const getPastEventsQuery = defineQuery(
    `*[
      _type == "event"
      && defined(slug.current)
      && count(dateTimes) > 0
      && dateTimes[-1].end < $now
    ] | order(dateTimes[0].start desc)
      ${EVENT_LIST_FRAGMENT}`,
  );
  return client.fetch(getPastEventsQuery, { now: new Date().toISOString() }, options);
}

export type EventListItem = Awaited<ReturnType<typeof getAllUpcomingEvents>>[number];
```

- [ ] **Step 2: Regenerate Sanity types**

Run: `pnpm -C ../sanity typegen` (from `client/`) — this regenerates `client/src/sanity/types.ts` with `GetAllUpcomingEventsQueryResult` and `GetPastEventsQueryResult`.
Expected: command completes; `types.ts` gains the two new result types.

- [ ] **Step 3: Create the server action**

Create `client/src/app/events/actions.ts`:

```ts
"use server";

import { getPastEvents } from "@/sanity/queries";
import type { EventListItem } from "@/sanity/queries";

export async function getPastEventsAction(): Promise<EventListItem[]> {
  return getPastEvents();
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm -C client typecheck`
Expected: PASS (no type errors; `EventListItem` resolves).

- [ ] **Step 5: Commit**

```bash
git add client/src/sanity/queries.ts client/src/sanity/types.ts client/src/app/events/actions.ts
git commit -m "feat(events): add upcoming/past event queries and server action"
```

---

### Task 4: EventRow and EventSummary components

**Files:**
- Create: `client/src/components/Events/EventRow.tsx`
- Create: `client/src/components/Events/EventSummary.tsx`

**Interfaces:**
- Consumes: `EventListItem` from `@/sanity/queries`; `formatEventDates` from `@/util/event-date`; `PortableText`, `SanityImage`, `Button`.
- Produces: `EventRow` (default export), `EventSummary` (default export).

- [ ] **Step 1: Create EventRow**

Create `client/src/components/Events/EventRow.tsx`:

```tsx
import Link from "next/link";
import { PortableText } from "@/components/PortableText";
import { formatEventDates } from "@/util/event-date";
import type { EventListItem } from "@/sanity/queries";

export default function EventRow({
  event,
  onHover,
}: {
  event: EventListItem;
  onHover?: () => void;
}) {
  const dates = formatEventDates(
    event.dateTimes ?? [],
    event.timezoneLabel ?? undefined,
  );
  const program = event.program;

  return (
    <Link
      href={`/events/${event.slug}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      className="grid grid-cols-[1fr_2fr] grid-rows-2 gap-y-4 gap-x-9 px-4 py-4 border-b border-ch-midnite hover:bg-ch-lite"
    >
      <span className="font-brook text-xs uppercase text-ch-midnite">
        {event.locationShort}
      </span>
      <span className="font-brook italic text-xs text-ch-midnite">
        {program?.displayTitle ? (
          <PortableText value={program.displayTitle} />
        ) : (
          program?.shortLabel
        )}
      </span>
      <span className="font-brook text-base uppercase text-ch-midnite">
        {dates?.dateRange}
      </span>
      <span className="font-milling text-[28px] leading-tight tracking-[-0.04em] text-ch-midnite">
        {event.title}
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Create EventSummary**

Create `client/src/components/Events/EventSummary.tsx`:

```tsx
import { PortableText } from "@/components/PortableText";
import SanityImage from "@/components/SanityImage";
import Button from "@/components/Button";
import { formatEventDates } from "@/util/event-date";
import type { EventListItem } from "@/sanity/queries";

export default function EventSummary({ event }: { event: EventListItem | null }) {
  if (!event) return null;

  const dates = formatEventDates(
    event.dateTimes ?? [],
    event.timezoneLabel ?? undefined,
  );

  return (
    <div className="md:w-[641px] shrink-0 flex flex-col items-center gap-[18px] border border-ch-midnite">
      {event.heroImage && (
        <SanityImage
          image={event.heroImage}
          className="w-full h-[381px] object-cover"
        />
      )}
      <div className="flex flex-col gap-8 px-6 pb-6 w-full max-w-[604px]">
        <h2 className="font-milling font-bold text-5xl text-center text-ch-midnite">
          {event.title}
        </h2>
        <div className="flex flex-col gap-2.5 w-[478px] max-w-full">
          <span className="font-brook text-base uppercase text-ch-midnite">
            {event.locationShort}
          </span>
          {dates && (
            <>
              <span className="font-brook text-xl text-ch-midnite">
                {dates.dateRange}
              </span>
              <span className="font-brook text-xl text-ch-midnite">
                {dates.timeDescription}
              </span>
            </>
          )}
        </div>
        {event.description && (
          <div className="font-milling font-light text-2xl text-ch-midnite">
            <PortableText value={event.description} />
          </div>
        )}
        <div className="flex flex-row flex-wrap items-center gap-4">
          {event.links?.map((link) => (
            <Button key={link._key} variant="ticket" href={link.url} openNewTab>
              {link.shortLabel ?? link.label}
            </Button>
          ))}
          <Button variant="ticket" href={`/events/${event.slug}`}>
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Events/EventRow.tsx client/src/components/Events/EventSummary.tsx
git commit -m "feat(events): add EventRow and EventSummary components"
```

---

### Task 5: EventsCalendar component

**Files:**
- Create: `client/src/components/Events/EventsCalendar.tsx`

**Interfaces:**
- Consumes: `buildMonthGrid`, `countEventsInCurrentWeek`, `formatDayHoverLine`, `getEventsForDay`, `getEventsForDayKey`, `isSameDay`, `toDayKey`, `WEEKDAY_LABELS`, `MONTH_LABELS` from `@/util/events-calendar`; `EventListItem`.
- Produces: `EventsCalendar` (default export). Props: `events`, `hoveredDayKey`, `onDayClick(day: Date, dayEvents: EventListItem[])`, `onDayHover(key: string | null)`.

- [ ] **Step 1: Create the component**

Create `client/src/components/Events/EventsCalendar.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildMonthGrid,
  countEventsInCurrentWeek,
  formatDayHoverLine,
  getEventsForDay,
  getEventsForDayKey,
  isSameDay,
  toDayKey,
} from "@/util/events-calendar";
import type { EventListItem } from "@/sanity/queries";

export default function EventsCalendar({
  events,
  hoveredDayKey,
  onDayClick,
  onDayHover,
}: {
  events: EventListItem[];
  hoveredDayKey: string | null;
  onDayClick: (day: Date, dayEvents: EventListItem[]) => void;
  onDayHover: (key: string | null) => void;
}) {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const days = buildMonthGrid(view.year, view.month);
  const weekCount = countEventsInCurrentWeek(events, today);
  const hoverEvents = hoveredDayKey
    ? getEventsForDayKey(events, hoveredDayKey)
    : [];
  const statusLine = hoveredDayKey
    ? formatDayHoverLine(hoverEvents)
    : `There ${weekCount === 1 ? "is" : "are"} ${weekCount} event${
        weekCount === 1 ? "" : "s"
      } this week.`;

  const prevMonth = () =>
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: v.month - 1 },
    );
  const nextMonth = () =>
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: v.month + 1 },
    );

  return (
    <div className="flex flex-col items-center gap-[13px] w-[329px] bg-ch-lite py-[3px]">
      <span className="font-brook text-base uppercase text-ch-midnite">
        {MONTH_LABELS[view.month]} {view.year}
      </span>

      <div className="flex flex-row items-center gap-[15px]">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-3 h-6 text-ch-midnite"
        >
          &lsaquo;
        </button>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((d) => (
            <span
              key={d}
              className="font-brook text-base text-ch-midnite w-[29px] text-center"
            >
              {d}
            </span>
          ))}
        </div>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-3 h-6 text-ch-midnite"
        >
          &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = toDayKey(day);
          const inMonth =
            day.getMonth() === view.month && day.getFullYear() === view.year;
          const dayEvents = getEventsForDay(events, day);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={key}
              onClick={() => onDayClick(day, dayEvents)}
              onMouseEnter={() => onDayHover(dayEvents.length ? key : null)}
              onMouseLeave={() => onDayHover(null)}
              className={`flex flex-col items-center justify-center w-[29px] h-[20px] rounded-full ${
                isToday
                  ? "bg-ch-midnite text-ch-lite"
                  : inMonth
                    ? "text-ch-midnite"
                    : "text-neutral-400"
              }`}
            >
              <span className="font-milling text-base leading-none">
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && !isToday && (
                <span className="block w-1 h-1 rounded-full bg-ch-midnite" />
              )}
            </button>
          );
        })}
      </div>

      <span className="font-brook text-base text-ch-midnite text-center whitespace-pre-line">
        {statusLine}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Events/EventsCalendar.tsx
git commit -m "feat(events): add EventsCalendar component"
```

---

### Task 6: EventsEmptyState and PastEvents components

**Files:**
- Create: `client/src/components/Events/EventsEmptyState.tsx`
- Create: `client/src/components/Events/PastEvents.tsx`
- Asset (already downloaded): `client/public/c-pattern.svg` — the decorative "C" pattern used in the empty-state detail panel (Figma node `3015-2231`, 641×1045).

**Interfaces:**
- Consumes: `EventRow`, `deriveYears`/`deriveMonths`/`filterPastEvents` from `@/util/events-filter`, `MONTH_LABELS` from `@/util/events-calendar`, `EventListItem`.
- Produces: `EventsEmptyState` (default export, no props), `PastEvents` (default export, prop `events: EventListItem[] | null`).

- [ ] **Step 1: Create EventsEmptyState**

Create `client/src/components/Events/EventsEmptyState.tsx`:

```tsx
import Image from "next/image";

export default function EventsEmptyState() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-[671px] px-6 py-6 flex flex-col gap-6 border-b md:border-b-0 border-ch-midnite">
        <p className="font-brook italic text-xl text-ch-midnite whitespace-pre-line">
          There are no upcoming events scheduled at this time.{"\n\n"}
          To be the first to hear about future opportunities, you can sign up
          for the CultureHub Newsletter.
        </p>
        <div className="flex flex-row items-center gap-4">
          <input
            aria-label="Your Email"
            placeholder="Your Email"
            className="w-[309px] h-[33px] px-2 rounded-lg border border-ch-midnite placeholder-neutral-400"
          />
          <button
            aria-label="Submit"
            className="w-[59px] h-[33px] flex items-center justify-center rounded-lg border border-ch-midnite text-ch-midnite"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="md:w-[641px] shrink-0 border border-ch-midnite bg-ch-lite overflow-hidden">
        <Image
          src="/c-pattern.svg"
          alt=""
          width={641}
          height={1045}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create PastEvents**

Create `client/src/components/Events/PastEvents.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import EventRow from "@/components/Events/EventRow";
import EventSummary from "@/components/Events/EventSummary";
import { MONTH_LABELS } from "@/util/events-calendar";
import {
  deriveMonths,
  deriveYears,
  filterPastEvents,
} from "@/util/events-filter";
import type { EventListItem } from "@/sanity/queries";

export default function PastEvents({ events }: { events: EventListItem[] | null }) {
  const years = useMemo(() => (events ? deriveYears(events) : []), [events]);
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<EventListItem | null>(null);

  const activeYear = year ?? years[0] ?? null;
  const months = useMemo(
    () => (events && activeYear != null ? deriveMonths(events, activeYear) : []),
    [events, activeYear],
  );
  const filtered = useMemo(
    () => (events ? filterPastEvents(events, activeYear, month) : []),
    [events, activeYear, month],
  );

  if (!events) {
    return <div className="py-8 text-neutral-400 text-sm">Loading…</div>;
  }
  if (years.length === 0) {
    return <div className="py-8 text-neutral-400 text-sm">No past events.</div>;
  }

  const handleYearChange = (y: number) => {
    setYear(y);
    setMonth(null);
  };

  return (
    <div>
      <div className="flex flex-row items-center border-t border-b border-ch-midnite">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => handleYearChange(y)}
            className={`px-[5px] py-[5px] w-[150px] h-[61px] font-milling text-xl border-r border-ch-midnite ${
              y === activeYear ? "bg-ch-midnite text-ch-lite" : "text-ch-midnite"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-[671px] flex flex-row">
          <div className="flex flex-col w-[97px] shrink-0 border-r border-ch-midnite">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setMonth((prev) => (prev === m ? null : m))}
                className={`w-[97px] h-[65px] font-brook text-xl uppercase ${
                  m === month ? "bg-ch-midnite text-ch-lite" : "text-ch-midnite"
                }`}
              >
                {MONTH_LABELS[m]}
              </button>
            ))}
          </div>
          <div
            className="flex flex-col flex-1 min-w-0"
            onMouseLeave={() => setHoveredEvent(null)}
          >
            {filtered.map((e) => (
              <EventRow
                key={e._id}
                event={e}
                onHover={() => setHoveredEvent(e)}
              />
            ))}
          </div>
        </div>
        <EventSummary event={hoveredEvent ?? filtered[0] ?? null} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Events/EventsEmptyState.tsx client/src/components/Events/PastEvents.tsx
git commit -m "feat(events): add empty state and past events components"
```

---

### Task 7: EventsExplorer, page, and component test

**Files:**
- Create: `client/src/components/Events/EventsExplorer.tsx`
- Create: `client/src/app/events/page.tsx`
- Test: `client/__tests__/components/Events/EventsExplorer.test.tsx`

**Interfaces:**
- Consumes: all Tasks 1–6 outputs; `getPastEventsAction`; `formatToday` from `@/util/events-calendar`; `useRouter` from `next/navigation`.
- Produces: `EventsExplorer` (named export), default `EventsPage`.

- [ ] **Step 1: Create EventsExplorer**

Create `client/src/components/Events/EventsExplorer.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPastEventsAction } from "@/app/events/actions";
import EventsCalendar from "@/components/Events/EventsCalendar";
import EventsEmptyState from "@/components/Events/EventsEmptyState";
import EventRow from "@/components/Events/EventRow";
import EventSummary from "@/components/Events/EventSummary";
import PastEvents from "@/components/Events/PastEvents";
import { eventStartDayKey, formatToday, toDayKey } from "@/util/events-calendar";
import type { EventListItem } from "@/sanity/queries";

type Tab = "upcoming" | "past";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-[10px] py-[18px] w-[150px] font-milling text-xl ${
        active
          ? "bg-ch-midnite text-ch-lite"
          : "text-ch-midnite border border-ch-midnite"
      }`}
    >
      {children}
    </button>
  );
}

export function EventsExplorer({
  upcomingEvents,
}: {
  upcomingEvents: EventListItem[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [hoveredEvent, setHoveredEvent] = useState<EventListItem | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
  const [pastEvents, setPastEvents] = useState<EventListItem[] | null>(null);

  useEffect(() => {
    if (tab === "past" && pastEvents === null) {
      getPastEventsAction().then(setPastEvents);
    }
  }, [tab, pastEvents]);

  const filteredUpcoming = useMemo(() => {
    if (!selectedDayKey) return upcomingEvents;
    return upcomingEvents.filter(
      (e) => eventStartDayKey(e) === selectedDayKey,
    );
  }, [upcomingEvents, selectedDayKey]);

  const previewEvent = hoveredEvent ?? filteredUpcoming[0] ?? null;

  const handleDayClick = useCallback(
    (day: Date, dayEvents: EventListItem[]) => {
      if (dayEvents.length === 1) {
        router.push(`/events/${dayEvents[0].slug}`);
        return;
      }
      if (dayEvents.length === 0) {
        return;
      }
      const key = toDayKey(day);
      setSelectedDayKey((prev) => (prev === key ? null : key));
    },
    [router],
  );

  return (
    <div className="px-6 md:px-16">
      <div className="py-9 flex flex-col gap-6">
        <h1 className="font-milling font-bold text-[40px] text-ch-midnite">Events</h1>
        <p className="font-brook text-base text-ch-midnite">{formatToday()}</p>
      </div>

      <div className="flex flex-col gap-9">
        <EventsCalendar
          events={upcomingEvents}
          hoveredDayKey={hoveredDayKey}
          onDayClick={handleDayClick}
          onDayHover={setHoveredDayKey}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-row border-b border-ch-midnite">
            <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
              Upcoming
            </TabButton>
            <TabButton active={tab === "past"} onClick={() => setTab("past")}>
              Past
            </TabButton>
          </div>

          {tab === "upcoming" ? (
            upcomingEvents.length === 0 ? (
              <EventsEmptyState />
            ) : (
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[671px] flex flex-col">
                  {filteredUpcoming.map((e) => (
                    <EventRow
                      key={e._id}
                      event={e}
                      onHover={() => setHoveredEvent(e)}
                    />
                  ))}
                </div>
                <EventSummary event={previewEvent} />
              </div>
            )
          ) : (
            <PastEvents events={pastEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the page**

Create `client/src/app/events/page.tsx`:

```tsx
import { EventsExplorer } from "@/components/Events/EventsExplorer";
import { getAllUpcomingEvents } from "@/sanity/queries";

export default async function EventsPage() {
  const upcomingEvents = await getAllUpcomingEvents();

  return (
    <main className="min-h-screen">
      <EventsExplorer upcomingEvents={upcomingEvents ?? []} />
    </main>
  );
}
```

- [ ] **Step 3: Write the component test**

Create `client/__tests__/components/Events/EventsExplorer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsExplorer } from "@/components/Events/EventsExplorer";
import type { EventListItem } from "@/sanity/queries";

jest.mock("@/app/events/actions", () => ({
  getPastEventsAction: jest.fn().mockResolvedValue([]),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/components/SanityImage", () => {
  return function MockSanityImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("next/image", () => {
  return function MockNextImage({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="next-image" />;
  };
});

jest.mock("next-sanity", () => ({
  PortableText: ({ value }: { value: unknown }) => (
    <span data-testid="portable-text">{JSON.stringify(value)}</span>
  ),
}));

const upcoming: EventListItem[] = [
  {
    _id: "e1",
    title: "Castle Door",
    slug: "castle-door",
    dateTimes: [
      {
        _key: "dt1",
        _type: "dateTimeRange",
        start: "2030-04-09T19:00:00-04:00",
        end: "2030-04-09T20:30:00-04:00",
      },
    ],
    location: null,
    locationShort: "NEW YORK",
    timezoneLabel: "ET",
    description: null,
    links: null,
    program: {
      _id: "p1",
      title: "Experiments in Digital Storytelling",
      slug: { _type: "slug", current: "eds" },
      shortLabel: "EDS",
      displayTitle: null,
    },
    heroImage: { asset: null, hotspot: null, crop: null, alt: "" },
  },
];

describe("EventsExplorer", () => {
  it("renders the header and upcoming event title", () => {
    render(<EventsExplorer upcomingEvents={upcoming} />);
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
    expect(screen.getAllByText("Castle Door")[0]).toBeInTheDocument();
  });

  it("renders the empty state when there are no upcoming events", () => {
    render(<EventsExplorer upcomingEvents={[]} />);
    expect(
      screen.getByText(/There are no upcoming events scheduled at this time/),
    ).toBeInTheDocument();
  });

  it("loads past events when the Past tab is selected", async () => {
    render(<EventsExplorer upcomingEvents={upcoming} />);
    await userEvent.click(screen.getByRole("button", { name: "Past" }));
    expect(
      await screen.findByText("No past events."),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm -C client test --watchAll=false __tests__/components/Events/EventsExplorer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm -C client typecheck`
Run: `pnpm -C client lint`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/Events/EventsExplorer.tsx client/src/app/events/page.tsx client/__tests__/components/Events/EventsExplorer.test.tsx
git commit -m "feat(events): wire events page with explorer"
```

---

### Task 8: Navigation links

**Files:**
- Modify: `client/src/components/Menu.tsx:129-138`

**Interfaces:**
- Consumes: existing `MenuButton` component.

- [ ] **Step 1: Add hrefs to the Events menu items**

In `client/src/components/Menu.tsx`, change the Events column so both items link to `/events`:

```tsx
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
                href="/events"
              >
                Events
              </MenuButton>
              <MenuButton
                variant="square-dashed"
                onClick={close}
                href="/events"
              >
                Upcoming
              </MenuButton>
            </div>
```

- [ ] **Step 2: Lint**

Run: `pnpm -C client lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Menu.tsx
git commit -m "feat(events): link Events and Upcoming menu items"
```

---

### Task 9: Full verification

- [ ] **Step 1: Typecheck**

Run: `pnpm -C client typecheck`
Expected: PASS.

- [ ] **Step 2: Lint**

Run: `pnpm -C client lint`
Expected: PASS.

- [ ] **Step 3: Full test suite**

Run: `pnpm -C client test --watchAll=false`
Expected: PASS (all existing + new tests green).

- [ ] **Step 4: Manual smoke check (optional)**

Run `pnpm -C client dev`, visit `http://localhost:3000/events`, confirm: header, calendar, Upcoming list with hover preview, Past tab lazy-load, empty state (when no upcoming events), and menu "Events"/"Upcoming" links.
