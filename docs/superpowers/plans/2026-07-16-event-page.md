# Event Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the event detail page, date formatting utility, generic carousel component, and upcoming events wrapper per the Figma designs.

**Architecture:** Server-rendered Next.js App Router page at `/events/[slug]`. Reuses `Breadcrumbs`, `LocationPin`, `SanityImage`, `Button`, `PortableText`, `CreditSection`. Refactors `RelatedCarousel` into a generic `Carousel` with `RelatedCarousel` and `UpcomingEvents` wrappers. New `formatEventDates` utility with thorough tests.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TailwindCSS v4, Jest + @testing-library/react, next-sanity

## Global Constraints

- Server components where possible, client components only when needed
- Follow existing page patterns from `projects/[slug]/page.tsx` and `artists/[slug]/page.tsx`
- `defineQuery` from `next-sanity` for GROQ queries
- `PortableText` from `next-sanity` for block content
- Jest + @testing-library/react for tests, run from `client/` directory with `pnpm test`
- File paths use `@/` alias for `client/src/`
- Tailwind classes matching existing component patterns

---

### Task 1: Date formatting utility (TDD)

**Files:**
- Create: `client/src/util/event-date.ts`
- Create: `client/__tests__/util/event-date.test.ts`

**Interfaces:**
- Produces: `formatEventDates(dateTimes)` — returns `{ dateRange: string, timeDescription: string } | null`

- [ ] **Step 1: Write the failing test file**

Create `client/__tests__/util/event-date.test.ts`:

```typescript
import { formatEventDates } from "@/util/event-date";

describe("formatEventDates", () => {
  it("returns null for empty array", () => {
    expect(formatEventDates([])).toBeNull();
  });

  it("formats a single day with single time range", () => {
    const result = formatEventDates([
      { start: "2026-06-03T18:00:00-04:00", end: "2026-06-03T20:00:00-04:00" },
    ]);
    expect(result).toEqual({
      dateRange: "Wednesday, June 3, 2026",
      timeDescription: "6\u20138PM",
    });
  });

  it("formats a single day with two time slots", () => {
    const result = formatEventDates([
      { start: "2026-05-28T14:00:00-04:00", end: "2026-05-28T16:00:00-04:00" },
      { start: "2026-05-28T19:00:00-04:00", end: "2026-05-28T21:00:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("Thursday, May 28, 2026");
    expect(result?.timeDescription).toContain("2");
    expect(result?.timeDescription).toContain("7");
  });

  it("formats multi-day with same time each day", () => {
    const result = formatEventDates([
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201310, 2026");
    expect(result?.timeDescription).toContain("Thursday");
    expect(result?.timeDescription).toContain("Friday");
    expect(result?.timeDescription).toMatch(/7.*PM/);
  });

  it("formats three-day run with varied times per day", () => {
    const result = formatEventDates([
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
      { start: "2026-04-11T16:00:00-04:00", end: "2026-04-11T17:30:00-04:00" },
      { start: "2026-04-11T19:30:00-04:00", end: "2026-04-11T21:00:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201311, 2026");
    expect(result?.timeDescription).toContain("Thursday");
    expect(result?.timeDescription).toContain("Friday");
    expect(result?.timeDescription).toContain("Saturday");
  });

  it("handles multi-month range", () => {
    const result = formatEventDates([
      { start: "2026-05-28T14:00:00-04:00", end: "2026-05-28T16:00:00-04:00" },
      { start: "2026-06-03T18:00:00-04:00", end: "2026-06-03T20:00:00-04:00" },
    ]);
    expect(result?.dateRange).toMatch("May");
    expect(result?.dateRange).toMatch("June");
  });

  it("handles unsorted entries", () => {
    const result = formatEventDates([
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201310, 2026");
  });

  it("handles midnight boundary", () => {
    const result = formatEventDates([
      { start: "2026-07-06T00:00:00-04:00", end: "2026-07-06T23:59:00-04:00" },
    ]);
    expect(result).not.toBeNull();
    expect(result!.dateRange).toContain("Monday");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd client && pnpm test -- --testPathPattern="event-date"
```

Expected: All 8 tests fail with module not found.

- [ ] **Step 3: Implement `client/src/util/event-date.ts`**

```typescript
interface DateTimeRange {
  start: string;
  end: string;
}

interface FormattedEventDates {
  dateRange: string;
  timeDescription: string;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  if (minutes === 0) return `${h}${period}`;
  return `${h}:${String(minutes).padStart(2, "0")}${period}`;
}

function formatDateRange(first: Date, last: Date): string {
  const sameDay =
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth() &&
    first.getDate() === last.getDate();

  if (sameDay) {
    return `${WEEKDAYS[first.getDay()]}, ${MONTHS[first.getMonth()]} ${first.getDate()}, ${first.getFullYear()}`;
  }

  const sameMonth =
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth();

  const sameYear = first.getFullYear() === last.getFullYear();

  if (sameMonth) {
    return `${MONTHS[first.getMonth()]} ${first.getDate()}\u2013${last.getDate()}, ${first.getFullYear()}`;
  }

  if (sameYear) {
    return `${MONTHS[first.getMonth()]} ${first.getDate()} \u2013 ${MONTHS[last.getMonth()]} ${last.getDate()}, ${first.getFullYear()}`;
  }

  return `${MONTHS[first.getMonth()]} ${first.getDate()}, ${first.getFullYear()} \u2013 ${MONTHS[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
}

function formatTimeDescription(
  dayMap: Map<string, { start: Date; end: Date }[]>,
  sortedDayKeys: string[],
): string {
  // Group consecutive days with identical time patterns
  interface DayGroup {
    dayNames: string[];
    entries: { start: Date; end: Date }[];
  }

  const groups: DayGroup[] = [];
  for (const dayKey of sortedDayKeys) {
    const entries = dayMap.get(dayKey)!;
    const day = entries[0].start;
    const dayName = WEEKDAYS[day.getDay()];

    const lastGroup = groups[groups.length - 1];
    if (lastGroup) {
      const lastEntries = lastGroup.entries;
      const sameTimes =
        lastEntries.length === entries.length &&
        lastEntries.every((le, i) => {
          const e = entries[i];
          return (
            le.start.getHours() === e.start.getHours() &&
            le.start.getMinutes() === e.start.getMinutes() &&
            le.end.getHours() === e.end.getHours() &&
            le.end.getMinutes() === e.end.getMinutes()
          );
        });

      if (sameTimes) {
        lastGroup.dayNames.push(dayName);
        continue;
      }
    }

    groups.push({ dayNames: [dayName], entries });
  }

  const parts = groups.map((group) => {
    const dayPart = group.dayNames.join(" & ");
    const times = group.entries
      .map((e) => `${formatTime(e.start)}\u2013${formatTime(e.end)}`)
      .join(" & ");
    return `${dayPart} at ${times}`;
  });

  return parts.join(", ");
}

export function formatEventDates(dateTimes: DateTimeRange[]): FormattedEventDates | null {
  if (!dateTimes || dateTimes.length === 0) return null;

  const entries = dateTimes
    .map((dt) => ({
      start: new Date(dt.start),
      end: new Date(dt.end),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const firstStart = entries[0].start;
  const lastEnd = entries[entries.length - 1].end;

  const dateRange = formatDateRange(firstStart, lastEnd);

  const dayMap = new Map<string, { start: Date; end: Date }[]>();
  for (const entry of entries) {
    const dayKey = entry.start.toLocaleDateString("en-US");
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, []);
    dayMap.get(dayKey)!.push(entry);
  }

  const sortedDayKeys = Array.from(dayMap.keys()).sort();
  const timeDescription = formatTimeDescription(dayMap, sortedDayKeys);

  return { dateRange, timeDescription };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd client && pnpm test -- --testPathPattern="event-date"
```

Expected: 8/8 passing.

- [ ] **Step 5: Commit**

```bash
git add client/src/util/event-date.ts client/__tests__/util/event-date.test.ts
git commit -m "feat: add event date formatting utility with tests"
```

---

### Task 2: Generic Carousel component

**Files:**
- Create: `client/src/components/Carousel.tsx`
- Modify: `client/src/components/RelatedCarousel.tsx`

**Interfaces:**
- Produces: `<Carousel items={CarouselItem[]} />` — generic scrollable carousel
- Modifies: `<RelatedCarousel related={...} />` — thin wrapper mapping related items to CarouselItems

- [ ] **Step 1: Create the Carousel component**

Create `client/src/components/Carousel.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { SanityImage } from "@/components/SanityImage";
import { MediaTagIcon } from "@/components/MediaTagIcon";
import type { MediaTagType } from "@/components/MediaTagIcon";

export interface CarouselItem {
  _key?: string;
  title: string;
  image: any;
  href?: string;
  type?: MediaTagType;
  subtitle?: ReactNode;
}

interface CarouselProps {
  items: CarouselItem[];
}

export function Carousel({ items }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const gap = 40;

  useEffect(() => {
    const el = scrollRef.current?.children[0] as HTMLElement | undefined;
    if (el) setItemWidth(el.offsetWidth + gap);
  }, [items.length, gap]);

  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current || itemWidth === 0) return;
      const el = scrollRef.current;
      const idx = Math.round(el.scrollLeft / itemWidth);
      const max = items.length - 1;
      let next = direction === "right" ? idx + 1 : idx - 1;
      if (next < 0) next = max;
      if (next > max) next = 0;
      el.scrollTo({ left: next * itemWidth, behavior: "smooth" });
    },
    [itemWidth, items.length]
  );

  const content = (
    <div
      ref={scrollRef}
      className="flex flex-col md:flex-row gap-10 overflow-x-auto no-scrollbar md:snap-x"
    >
      {items.map((item) => {
        const inner = (
          <div className="flex-shrink-0 w-full md:w-[635px] flex flex-col gap-[18px]">
            {item.type && (
              <div className="flex items-center gap-[18px]">
                <MediaTagIcon type={item.type} />
                <span className="font-brook text-base uppercase">{item.type}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <h3 className="font-milling text-2xl">{item.title}</h3>
              {item.subtitle && (
                <div className="font-brook text-base uppercase text-right text-ch-midnite/60">
                  {item.subtitle}
                </div>
              )}
            </div>
            <SanityImage
              image={item.image}
              className="w-full h-[423px] object-cover rounded-[20px] border border-ch-midnite/10"
            />
          </div>
        );

        if (item.href) {
          return (
            <Link
              key={item._key ?? item.title}
              href={item.href}
              className="flex-shrink-0 w-full md:w-[635px]"
            >
              <div className="flex flex-col gap-[18px]">
                {item.type && (
                  <div className="flex items-center gap-[18px]">
                    <MediaTagIcon type={item.type} />
                    <span className="font-brook text-base uppercase">{item.type}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <h3 className="font-milling text-2xl">{item.title}</h3>
                  {item.subtitle && (
                    <div className="font-brook text-base uppercase text-right text-ch-midnite/60">
                      {item.subtitle}
                    </div>
                  )}
                </div>
                <SanityImage
                  image={item.image}
                  className="w-full h-[423px] object-cover rounded-[20px] border border-ch-midnite/10"
                />
              </div>
            </Link>
          );
        }

        return inner;
      })}
    </div>
  );

  return (
    <div className="relative">
      {content}
      <button
        onClick={() => scrollTo("left")}
        className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
        aria-label="Scroll left"
      >
        <LeftArrow />
      </button>
      <button
        onClick={() => scrollTo("right")}
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
        aria-label="Scroll right"
      >
        <RightArrow />
      </button>
    </div>
  );
}

function LeftArrow() {
  return (
    <svg className="w-[19px] h-[37px]" viewBox="0 0 19 37" fill="none">
      <polygon
        points="18,0.5 18,36.5 0.5,18.5"
        fill="#020721"
        stroke="#000"
        strokeWidth="1"
      />
    </svg>
  );
}

function RightArrow() {
  return (
    <svg className="w-[19px] h-[37px]" viewBox="0 0 19 37" fill="none">
      <polygon
        points="1,0.5 1,36.5 18.5,18.5"
        fill="#020721"
        stroke="#000"
        strokeWidth="1"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Rewrite RelatedCarousel as a thin wrapper**

Rewrite `client/src/components/RelatedCarousel.tsx`:

```tsx
import { Carousel, type CarouselItem } from "@/components/Carousel";
import type { GetProjectBySlugQueryResult } from "@/sanity/types";

interface RelatedCarouselProps {
  related: NonNullable<GetProjectBySlugQueryResult>["related"];
}

export function RelatedCarousel({ related }: RelatedCarouselProps) {
  if (!related || related.length === 0) return null;

  const items: CarouselItem[] = related.map((item) => ({
    _key: item._id,
    title: item.title ?? "",
    image: item.image,
    type: item._type as CarouselItem["type"],
    href: item._type === "project"
      ? `/projects/${(item as any).slug?.current ?? ""}`
      : item._type === "artist"
        ? `/artists/${(item as any).slug?.current ?? ""}`
        : item._type === "event"
          ? `/events/${(item as any).slug?.current ?? ""}`
          : undefined,
  })).filter((item) => item.title);

  return (
    <section>
      <div className="border-t border-b border-ch-midnite py-6">
        <h3 className="font-milling font-bold text-2xl">Related</h3>
      </div>
      <Carousel items={items} />
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit --project client/tsconfig.json
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Carousel.tsx client/src/components/RelatedCarousel.tsx
git commit -m "refactor: extract generic Carousel from RelatedCarousel"
```

---

### Task 3: UpcomingEvents wrapper

**Files:**
- Create: `client/src/components/UpcomingEvents.tsx`

**Interfaces:**
- Consumes: `getUpcomingEvents` from `@/sanity/queries`, `formatEventDates` from `@/util/event-date`, `Carousel` from `@/components/Carousel`
- Produces: `<UpcomingEvents />` server component

- [ ] **Step 1: Create the component**

Create `client/src/components/UpcomingEvents.tsx`:

```tsx
import { Carousel } from "@/components/Carousel";
import { getUpcomingEvents } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(10);

  if (!events || events.length === 0) return null;

  const items = events.map((event) => {
    const dates = formatEventDates(event.dateTimes);
    return {
      _key: event._id,
      title: event.title,
      image: event.heroImage,
      href: `/events/${event.slug}`,
      type: "event" as const,
      subtitle: dates ? (
        <span>
          {dates.dateRange}
          <br />
          {event.location}
        </span>
      ) : (
        event.location
      ),
    };
  });

  return (
    <section>
      <div className="border-t border-b border-ch-midnite py-6">
        <h3 className="font-milling font-bold text-2xl">Upcoming Events</h3>
      </div>
      <Carousel items={items} />
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --project client/tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/UpcomingEvents.tsx
git commit -m "feat: add UpcomingEvents carousel component"
```

---

### Task 4: Event detail page

**Files:**
- Create: `client/src/app/events/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getEventBySlug` from `@/sanity/queries`, `formatEventDates` from `@/util/event-date`, existing components
- Produces: Full event detail page at `/events/[slug]`

- [ ] **Step 1: Create the page**

Create `client/src/app/events/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { CreditSection } from "@/components/credits";
import { LocationPin } from "@/components/LocationPin";
import { SanityImage } from "@/components/SanityImage";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { getEventBySlug } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const dates = formatEventDates(event.dateTimes ?? []);

  return (
    <main className="min-h-screen">
      {/* Hero Image */}
      <SanityImage image={event.heroImage} className="w-full h-[676px] object-cover" />

      {/* Photo credit */}
      {event.heroImage?.credits && (
        <div className="flex justify-end px-16 py-9">
          <p className="font-brook italic text-sm text-[#ACACAC]">
            {event.heroImage.credits}
          </p>
        </div>
      )}

      {/* Information Header */}
      <div className="px-16 py-9 flex flex-col items-center gap-5">
        <div className="flex justify-between w-full">
          {/* Breadcrumb */}
          <div className="flex flex-col gap-6">
            <Breadcrumbs
              buttons={[
                { label: "Events", href: "/events" },
                ...(event.program
                  ? [{ label: event.program.shortLabel!, children: event.program.displayTitle }]
                  : []),
              ]}
            />
          </div>

          {/* Location pin */}
          {event.location && (
            <div className="flex flex-col items-end">
              <LocationPin locations={[event.location]} />
            </div>
          )}
        </div>

        {/* Title and links */}
        <div className="flex justify-between items-center w-full max-w-[1312px]">
          <h1 className="font-milling font-bold text-5xl text-ch-midnite">
            {event.title}
          </h1>
          {event.links && event.links.length > 0 && (
            <div className="flex gap-2.5">
              {event.links.map((link) => (
                <Button
                  key={link._key}
                  variant="rounded"
                  href={link.url}
                  openNewTab
                >
                  {link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Row */}
      <div className="px-16 py-9 flex justify-between">
        {/* Details Sidebar */}
        <div className="w-[449px] pr-8 border-r border-ch-midnite flex flex-col gap-5">
          {dates && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">When</h3>
              <p className="font-milling text-xl text-ch-midnite">
                {dates.dateRange}
                <br />
                {dates.timeDescription}
              </p>
            </div>
          )}

          {event.location && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Where</h3>
              <p className="font-milling text-xl text-ch-midnite whitespace-pre-line">
                {event.location}
              </p>
            </div>
          )}

          {event.cost && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Cost</h3>
              <p className="font-milling text-xl text-ch-midnite">{event.cost}</p>
            </div>
          )}

          {event.accessInfo && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Access</h3>
              <p className="font-milling text-xl text-ch-midnite whitespace-pre-line">
                {event.accessInfo}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="w-[816px] flex flex-col gap-[46px]">
          {event.description && (
            <div className="max-w-[788px] font-milling text-2xl font-light">
              <PortableText value={event.description} />
            </div>
          )}

          {event.links && event.links.length > 0 && (
            <div className="flex gap-2.5">
              {event.links.map((link) => (
                <Button
                  key={link._key}
                  variant="rounded"
                  href={link.url}
                  openNewTab
                >
                  {link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* About the Artists */}
      {event.featuredArtists && event.featuredArtists.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">About the Artists</h3>
          </div>
          {event.featuredArtists.map((artist) => (
            <div key={artist._key} className="flex justify-between items-center">
              {artist.image && (
                <SanityImage
                  image={artist.image}
                  className="w-[297px] h-[267px] object-cover border border-ch-midnite"
                />
              )}
              <div className="max-w-[660px] font-milling text-2xl font-light">
                {artist.bio && <PortableText value={artist.bio} />}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Artworks on View */}
      {event.artworks && event.artworks.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">Artworks on View</h3>
          </div>
          {event.artworks.map((artwork) => (
            <div key={artwork._key} className="flex justify-between items-center">
              <SanityImage
                image={artwork.image}
                className="w-[421px] h-[379px] object-cover"
              />
              <div className="max-w-[660px] font-milling text-xl font-light">
                {artwork.description && <PortableText value={artwork.description} />}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* About the Program */}
      {event.aboutProgram && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">About the Program</h3>
          </div>
          <div className="max-w-[1034px] font-milling text-2xl font-light">
            <PortableText value={event.aboutProgram} />
          </div>
        </section>
      )}

      {/* Schedule */}
      {event.schedule?.items && event.schedule.items.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">Schedule</h3>
          </div>
          {event.schedule.description && (
            <div className="max-w-[788px] font-milling text-2xl font-light">
              <PortableText value={event.schedule.description} />
            </div>
          )}
          <div className="flex flex-col gap-6">
            {event.schedule.items.map((item) => (
              <div key={item._key} className="flex gap-6">
                {item.time && (
                  <span className="font-brook text-xl uppercase w-32 shrink-0">
                    {item.time}
                  </span>
                )}
                <div>
                  <h4 className="font-milling font-bold text-xl">{item.title}</h4>
                  {item.description && (
                    <div className="font-milling text-xl font-light mt-2">
                      <PortableText value={item.description} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Credits */}
      {event.credits && <CreditSection credits={event.credits} />}

      {/* Upcoming Events */}
      <UpcomingEvents />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit --project client/tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add client/src/app/events/[slug]/page.tsx
git commit -m "feat: add event detail page"
```

---

### Task 5: Sanity data input

This task uses the Sanity MCP tools to create three event documents. Project ID: `2r5hg86f`, Dataset: `production`, Workspace: `default`.

Before creating events, query the existing programs to resolve their `_id` values:

```groq
*[_type == "program"]{ _id, title, shortLabel }
```

Map: "Experiments in Digital Storytelling" → program `_id`, "CoLab" → program `_id`, "Community" → program `_id`.

- [ ] **Step 1: Create Castle Door event**

Use `create_documents`:

```json
{
  "_id": "castle-door",
  "_type": "event",
  "title": "Castle Door",
  "slug": { "_type": "slug", "current": "castle-door" },
  "program": { "_type": "reference", "_ref": "<EDS program _id>" },
  "dateTimes": [
    { "_key": "a", "start": "2026-04-09T19:00:00-04:00", "end": "2026-04-09T20:30:00-04:00" },
    { "_key": "b", "start": "2026-04-10T19:00:00-04:00", "end": "2026-04-10T20:30:00-04:00" },
    { "_key": "c", "start": "2026-04-11T16:00:00-04:00", "end": "2026-04-11T17:30:00-04:00" },
    { "_key": "d", "start": "2026-04-11T19:30:00-04:00", "end": "2026-04-11T21:00:00-04:00" }
  ],
  "cost": "$15",
  "location": "CultureHub\n47 Great Jones Street\nFloor 3\nNew York, NY 10012\n\nOnline",
  "accessInfo": "CultureHub NYC is on the 3rd floor and accessible by elevator.",
  "links": [
    { "_key": "ticket", "label": "Tickets", "url": "https://ci.ovationtix.com/" }
  ],
  "featuredArtists": [
    {
      "_key": "fa-walker",
      "name": "Walker Caplan",
      "bio": [
        {
          "_key": "b1",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Walker Caplan is a writer and editor based in New York." }]
        }
      ]
    },
    {
      "_key": "fa-matt",
      "name": "Matt Romein",
      "bio": [
        {
          "_key": "b2",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Matt Romein is an artist and performer based in Brooklyn NY." }]
        }
      ]
    }
  ],
  "credits": {
    "locations": [{
      "_key": "nyc",
      "name": "New York",
      "groups": [
        {
          "_key": "creative",
          "name": "Creative Team",
          "items": [
            { "_key": "c1", "role": "Written and Performed by", "people": "Walker Caplan and Matt Romein" },
            { "_key": "c2", "role": "Lighting Design", "people": "Yung Hung Sung" },
            { "_key": "c3", "role": "Creative Consultant", "people": "Patrick Foley" },
            { "_key": "c4", "role": "Produced by", "people": "CultureHub, Max & Jessie" }
          ]
        },
        {
          "_key": "ch",
          "name": "CultureHub Team",
          "items": [
            { "_key": "ch1", "role": "Artistic Director", "people": "Billy Clark" },
            { "_key": "ch2", "role": "Technical Director", "people": "DeAndra Anthony" },
            { "_key": "ch3", "role": "Emerging Media Director", "people": "Sangmin Chae" },
            { "_key": "ch4", "role": "Producing Director", "people": "Mattie Barber-Bockelman" },
            { "_key": "ch5", "role": "Design & Communication", "people": "Tee Topor" },
            { "_key": "ch6", "role": "Development Director", "people": "Blair Johnson" }
          ]
        }
      ]
    }]
  },
  "aboutProgram": [
    {
      "_key": "ap1",
      "_type": "block",
      "style": "normal",
      "children": [{ "_type": "span", "text": "Castle Door was created during CultureHub's New Works program, an initiative that pairs writers with creative technologists to produce a work of experimental theater." }]
    }
  ]
}
```

- [ ] **Step 2: Create Pool Party event**

Use `create_documents`:

```json
{
  "_id": "culturehub-pool-party",
  "_type": "event",
  "title": "CultureHub Pool Party",
  "slug": { "_type": "slug", "current": "culturehub-pool-party" },
  "program": { "_type": "reference", "_ref": "<Community program _id>" },
  "dateTimes": [
    { "_key": "a", "start": "2026-06-03T18:00:00-04:00", "end": "2026-06-03T20:00:00-04:00" }
  ],
  "cost": "$25-$100",
  "location": "CultureHub NYC",
  "accessInfo": "CultureHub NYC is on the 3rd floor and accessible by elevator.\nThis performance will also be livestreamed with captions on the CultureHub Broadcaster",
  "links": [
    { "_key": "ticket", "label": "Tickets", "url": "https://ci.ovationtix.com/" }
  ],
  "artworks": [
    {
      "_key": "aw1",
      "description": [
        {
          "_key": "awb1",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Fishin' for Average Caucasian Boyfriends (2024) by Jackie Liu is a semi-autobiographical Game Boy game (playable on a real Game Boy device!) about expectations, queerness, and the possibility of dreaming bigger." }]
        }
      ]
    },
    {
      "_key": "aw2",
      "description": [
        {
          "_key": "awb2",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Exit Sign<3 (2024) by Dahlia Bloomstone walks through a long, damask and gold chandeliered hallway." }]
        }
      ]
    },
    {
      "_key": "aw3",
      "description": [
        {
          "_key": "awb3",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Water Portals ASMR (2025) by Rachel Stein is part of a series uncovering strangely satisfying moments through hypnotic sounds, textures, and visuals." }]
        }
      ]
    },
    {
      "_key": "aw4",
      "description": [
        {
          "_key": "awb4",
          "_type": "block",
          "style": "normal",
          "children": [{ "_type": "span", "text": "Abyss Embrace (2023) by Ella Barnes is a unique cyanotype on silk created with sunlight." }]
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Create At this table event**

Use `create_documents`:

```json
{
  "_id": "at-this-table",
  "_type": "event",
  "title": "At this table...",
  "slug": { "_type": "slug", "current": "at-this-table" },
  "program": { "_type": "reference", "_ref": "<EDS program _id>" },
  "dateTimes": [
    { "_key": "a", "start": "2026-05-28T14:00:00-04:00", "end": "2026-05-28T16:00:00-04:00" },
    { "_key": "b", "start": "2026-05-28T19:00:00-04:00", "end": "2026-05-28T21:00:00-04:00" }
  ],
  "cost": "Free",
  "location": "La MaMa\nCommunity Arts Space\n74A E 4th Street\nNew York, NY 10003\n\nOnline",
  "accessInfo": "CultureHub NYC is on the 3rd floor and accessible by elevator.\nThis performance will also be livestreamed with captions on the CultureHub Broadcaster",
  "links": [
    { "_key": "inperson", "label": "In Person Tickets", "url": "https://ci.ovationtix.com/" },
    { "_key": "online", "label": "Online Tickets", "url": "https://culturehub-broadcaster.example.com/" }
  ],
  "credits": {
    "locations": [{
      "_key": "nyc",
      "name": "New York",
      "groups": [
        {
          "_key": "production",
          "name": "Production Team",
          "items": [
            { "_key": "p1", "role": "Presented by", "people": "CultureHub\nPerformance Project\nUniversity Settlement\nWellness Together Home Based Care\nLa MaMa" },
            { "_key": "p2", "role": "Directed by", "people": "Rita Liu\nC Meranda Flachs-Surmanek" },
            { "_key": "p3", "role": "Creative Coding", "people": "Jay Reiner" },
            { "_key": "p4", "role": "Created and Performed by", "people": "Breaking the Walls Ensemble: Alicia Justiniano, Areerata Sudhasirikul, Edeliz Pagan, Ed Woodham, Elisa de la Roche, Elizabeth Haak, Francis Del Duca, Kendra Meisler, Linda Berg, Maryann DeLeo, Nandan Baruah, Reverend Rhythm (Chas Fristachi), Tina Hansen, Valerie Kerr" }
          ]
        },
        {
          "_key": "ch",
          "name": "CultureHub Team",
          "items": [
            { "_key": "ch1", "role": "Artistic Director", "people": "Billy Clark" },
            { "_key": "ch2", "role": "Producing Director", "people": "Mattie Barber-Bockelman" },
            { "_key": "ch3", "role": "Technical Director", "people": "DeAndra Anthony" },
            { "_key": "ch4", "role": "Emerging Media Director", "people": "Sangmin Chae" }
          ]
        },
        {
          "_key": "wtt",
          "name": "Wellness Together Team",
          "items": [
            { "_key": "w1", "role": "Director", "people": "Penelope Hernandez Gonzalez" },
            { "_key": "w2", "role": "Program Coordinator", "people": "Zhuohao Charles Wu" },
            { "_key": "w3", "role": "Team", "people": "Jia Xin Huang\nJeannie Chan\nHuiying Yang\nMassiel Franco" }
          ]
        },
        {
          "_key": "broadcaster",
          "name": "Broadcaster Team",
          "items": [
            { "_key": "b1", "role": "Lead Developer/Concept", "people": "Aidan Nelson" },
            { "_key": "b2", "role": "Producer/Senior Advisor/Concept", "people": "Shawn Van Every" },
            { "_key": "b3", "role": "Concept/Creative Producer", "people": "DeAndra Anthony\nSangmin Chae\nBilly Clark" },
            { "_key": "b4", "role": "Project Manager", "people": "DeAndra Anthony" }
          ]
        }
      ]
    }]
  },
  "aboutProgram": [
    {
      "_key": "ap1",
      "_type": "block",
      "style": "normal",
      "children": [{ "_type": "span", "text": "At this table... is the culminating performance of the Wellness Together Arts Fellowship, a partnership between Wellness Together and The Performance Project at University Settlement, CultureHub, and La MaMa." }]
    }
  ]
}
```

- [ ] **Step 4: Publish all three**

Use `publish_documents` for IDs `["castle-door", "culturehub-pool-party", "at-this-table"]`.

---

### Task 6: Event page tests

**Files:**
- Create: `client/__tests__/app/events/page.test.tsx`

- [ ] **Step 1: Write the test**

Create `client/__tests__/app/events/page.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import EventPage from "@/app/events/[slug]/page";

jest.mock("@/sanity/queries", () => ({
  getEventBySlug: jest.fn(),
  getUpcomingEvents: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/components/UpcomingEvents", () => ({
  UpcomingEvents: () => null,
}));

jest.mock("next-sanity", () => ({
  PortableText: ({ value }: any) => <div data-testid="portable-text">{JSON.stringify(value)}</div>,
}));

jest.mock("@/components/SanityImage", () => ({
  SanityImage: ({ className }: any) => <div data-testid="sanity-image" className={className} />,
}));

const { getEventBySlug } = require("@/sanity/queries");

const mockEvent = {
  title: "Test Event",
  heroImage: { asset: { _ref: "img-1" }, alt: "hero" },
  program: { shortLabel: "EDS", displayTitle: "Experiments in Digital Storytelling" },
  location: "CultureHub NYC",
  dateTimes: [
    { _key: "a", start: "2026-06-03T18:00:00-04:00", end: "2026-06-03T20:00:00-04:00" },
  ],
  cost: "$15",
  accessInfo: "Elevator available",
  links: [{ _key: "t1", label: "Tickets", url: "https://example.com" }],
  description: [{ _key: "b1", _type: "block", children: [{ _type: "span", text: "Event description" }] }],
  featuredArtists: [
    {
      _key: "fa1",
      name: "Artist One",
      bio: [{ _key: "b2", _type: "block", children: [{ _type: "span", text: "Bio text" }] }],
      image: { asset: { _ref: "img-2" }, alt: "artist" },
    },
  ],
  artworks: [
    {
      _key: "aw1",
      image: { asset: { _ref: "img-3" }, alt: "artwork" },
      description: [{ _key: "b3", _type: "block", children: [{ _type: "span", text: "Artwork desc" }] }],
    },
  ],
  aboutProgram: [{ _key: "b4", _type: "block", children: [{ _type: "span", text: "Program info" }] }],
  schedule: {
    description: [{ _key: "b5", _type: "block", children: [{ _type: "span", text: "Schedule intro" }] }],
    items: [
      { _key: "s1", title: "Workshop A", time: "10:00 AM", description: null },
    ],
  },
  credits: {
    locations: [{
      _key: "loc1",
      groups: [{
        _key: "g1",
        name: "Creative Team",
        items: [{ _key: "c1", role: "Director", people: "Jane Doe" }],
      }],
    }],
  },
};

describe("EventPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders event title and description", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
    });
  });

  it("renders detail sidebar fields", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("$15")).toBeInTheDocument();
      expect(screen.getByText("CultureHub NYC")).toBeInTheDocument();
      expect(screen.getByText("Elevator available")).toBeInTheDocument();
    });
  });

  it("renders ticket links", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Tickets")).toBeInTheDocument();
    });
  });

  it("renders optional sections when present", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("About the Artists")).toBeInTheDocument();
      expect(screen.getByText("Artworks on View")).toBeInTheDocument();
      expect(screen.getByText("About the Program")).toBeInTheDocument();
      expect(screen.getByText("Schedule")).toBeInTheDocument();
      expect(screen.getByText("Credits")).toBeInTheDocument();
    });
  });

  it("hides optional sections when not present", async () => {
    const minimalEvent = {
      ...mockEvent,
      featuredArtists: null,
      artworks: null,
      aboutProgram: null,
      schedule: null,
      credits: null,
    };
    getEventBySlug.mockResolvedValue(minimalEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("About the Artists")).not.toBeInTheDocument();
      expect(screen.queryByText("Artworks on View")).not.toBeInTheDocument();
      expect(screen.queryByText("About the Program")).not.toBeInTheDocument();
      expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
      expect(screen.queryByText("Credits")).not.toBeInTheDocument();
    });
  });

  it("calls notFound when event is null", async () => {
    getEventBySlug.mockResolvedValue(null);

    await expect(
      EventPage({ params: Promise.resolve({ slug: "nonexistent" }) })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd client && pnpm test -- --testPathPattern="events/page"
```

Expected: All 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add client/__tests__/app/events/
git commit -m "test: add event page tests"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run all tests**

```bash
cd client && pnpm test
```

Expected: All tests pass (including existing ProjectsList, ArtistsList tests).

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --project client/tsconfig.json
npx tsc --noEmit --project sanity/tsconfig.json
```

Expected: Both compile without errors.

- [ ] **Step 3: Verify git status is clean**

```bash
git status
```
