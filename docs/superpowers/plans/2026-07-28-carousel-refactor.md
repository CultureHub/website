# Carousel Refactor — Three Display Modes Implementation Plan

**Goal:** Refactor the Carousel component to accept `children` instead of a fixed card template, enabling three distinct display modes across UpcomingEvents, FeaturedProjects, and RelatedCarousel.

**Architecture:** Carousel becomes a generic horizontal-scroll container with arrows. Three card components handle mode-specific rendering. Each consumer renders its own cards as children of Carousel.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4

---

## 1. Refactor Carousel Component

**File:** `client/src/components/Carousel.tsx`

Change from `items: CarouselItem[]` to `children: ReactNode` with optional `itemWidth` and `gap` props.

### Current interface:
```tsx
interface CarouselProps { items: CarouselItem[]; }
```

### New interface:
```tsx
interface CarouselProps {
  children: React.ReactNode;
  itemWidth?: "full" | "half" | number; // default "half"
  gap?: number; // default 40
}
```

### Implementation:

```tsx
"use client";

import { useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import Image from "next/image";

export interface CarouselProps {
  children: ReactNode;
  itemWidth?: "full" | "half" | number;
  gap?: number;
}

export function Carousel({ children, itemWidth = "half", gap = 40 }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      const firstItem = itemRefs.current[0];
      if (firstItem) {
        setScrollWidth(firstItem.offsetWidth + gap);
      }
    }
  }, [gap]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const scrollPosition = index * scrollWidth;
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
      setCurrentIndex(index);
    },
    [scrollWidth],
  );

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    scrollToIndex(newIndex);
  };

  const widthClass =
    itemWidth === "full"
      ? "w-full md:flex-shrink-0"
      : itemWidth === "half"
        ? "w-full md:flex-shrink-0 md:w-[calc(50%_-_20px)]"
        : `md:flex-shrink-0 md:w-[${itemWidth}px]`;

  return (
    <div className="flex flex-row items-center">
      <button
        onClick={handlePrev}
        className="absolute left-10 z-10 hidden md:block"
        aria-label="Previous items"
      >
        <Image width="15" height="26" src="/left_arrow.svg" alt="Left arrow" />
      </button>

      <div
        ref={scrollRef}
        className="flex flex-col md:flex-row w-full overflow-hidden scroll-smooth"
        style={{ gap: `${gap}px`, scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            className={widthClass}
          >
            {child}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-10 z-10 hidden md:block"
        aria-label="Next items"
      >
        <Image width="15" height="26" src="/right_arrow.svg" alt="Right arrow" />
      </button>
    </div>
  );
}
```

---

## 2. Update FeaturedProjects

**File:** `client/src/components/ProgramPage/FeaturedProjects.tsx`

Stop producing `CarouselItem[]`. Instead render `FeaturedProjectCard` children inside `<Carousel>`.

```tsx
import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type FeaturedProject = NonNullable<
  NonNullable<GetProgramBySlugQueryResult>["featuredProjects"]
>[number];

interface FeaturedProjectsProps {
  title: string;
  projects: FeaturedProject[];
}

export default function FeaturedProjects({ title, projects }: FeaturedProjectsProps) {
  return (
    <section id="projects" className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>
      <Carousel>
        {projects.map((p) => (
          <Link
            key={p._id}
            href={`/projects/${p.slug.current}`}
            className="flex flex-col gap-4.5"
          >
            <div className="flex justify-between items-center">
              <span className="font-milling text-2xl">{p.title}</span>
              {p.people && (
                <span className="font-brook text-base uppercase opacity-60">
                  {p.people}
                </span>
              )}
            </div>
            <SanityImage
              image={p.heroImage}
              className="w-full h-[423px] object-cover border border-ch-midnite"
            />
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
```

---

## 3. Update UpcomingEvents

**File:** `client/src/components/UpcomingEvents.tsx`

Stop producing `CarouselItem[]`. Instead create inline cards with program badge + date + location + title + image.

```tsx
import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import MediaTagIcon from "@/components/MediaTagIcon";
import { getUpcomingEvents, getUpcomingEventsByProgram } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

interface UpcomingEventsProps {
  programSlug?: string;
}

export async function UpcomingEvents({ programSlug }: UpcomingEventsProps) {
  const events =
    (programSlug
      ? await getUpcomingEventsByProgram(programSlug)
      : await getUpcomingEvents(5)) ?? [];

  const filtered = events.filter((event) => event.title);
  if (filtered.length === 0) return null;

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">Upcoming Events</h2>
      </div>
      <Carousel>
        {filtered.map((event) => {
          const dates = formatEventDates(
            event.dateTimes ?? [],
            event.timezoneLabel ?? undefined,
          );
          return (
            <Link
              key={event._id}
              href={`/events/${event.slug}`}
              className="flex flex-col gap-4.5"
            >
              <div className="flex flex-col gap-[5px]">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-4.5">
                    <MediaTagIcon type={event.program?.shortLabel ?? ""} />
                    <span className="font-brook text-base uppercase">
                      {event.program?.shortLabel}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  {dates?.dateRange && (
                    <span className="font-brook text-base uppercase px-7">{dates.dateRange}</span>
                  )}
                  <span className="font-brook text-base uppercase">
                    {event.locationShort}
                  </span>
                </div>
              </div>
              <span className="font-milling text-2xl">{event.title}</span>
              <SanityImage
                image={event.heroImage}
                className="w-full h-[423px] object-cover border border-ch-midnite"
              />
            </Link>
          );
        })}
      </Carousel>
    </section>
  );
}
```

---

## 4. Update RelatedCarousel

**File:** `client/src/components/RelatedCarousel.tsx`

Renders `RelatedItemCard` children inside `<Carousel>` with content type badge + title + rounded images.

```tsx
import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetProjectBySlugQueryResult } from "@/sanity/types";

type ProjectRelated = NonNullable<
  NonNullable<GetProjectBySlugQueryResult>["related"]
>;

interface RelatedCarouselProps {
  related: ProjectRelated;
}

export default function RelatedCarousel({ related }: RelatedCarouselProps) {
  if (!related || related.length === 0) return null;

  return (
    <Carousel>
      {related.map((item) => (
        <Link
          key={item._id}
          href={
            item._type === "project"
              ? `/projects/${item.slug ?? ""}`
              : `/artists/${item.slug ?? ""}`
          }
          className="flex flex-col gap-4.5"
        >
          <div className="flex flex-row items-center gap-4.5">
            <span className="w-[10px] h-[10px] rounded-full bg-ch-midnite" />
            <span className="font-brook text-base uppercase">
              {item._type === "project" ? "PROJECT" : "ARTIST"}
            </span>
          </div>
          <span className="font-milling text-2xl">{item.title}</span>
          <SanityImage
            image={item.image}
            className="w-full h-[423px] object-cover border border-ch-midnite rounded-[20px]"
          />
        </Link>
      ))}
    </Carousel>
  );
}
```

---

## 5. Cleanup

Remove the now-unused `CarouselItem` type export and `MediaTagIcon` import from Carousel.tsx (no longer renders items internally).

## 6. Verification

- Typecheck: `pnpm -C client typecheck`
- Lint: `pnpm -C client lint`
- Build: `pnpm -C client build`
