import { Carousel, type CarouselItem } from "@/components/Carousel";
import {
  getUpcomingEvents,
  getUpcomingEventsByProgram,
} from "@/sanity/queries";
import type { GetUpcomingEventsQueryResult } from "@/sanity/types";
import { formatEventDates } from "@/util/event-date";

type EventItem = GetUpcomingEventsQueryResult[number];

interface UpcomingEventsProps {
  programSlug?: string;
}

export async function UpcomingEvents({ programSlug }: UpcomingEventsProps) {
  const events =
    (programSlug
      ? await getUpcomingEventsByProgram(programSlug)
      : await getUpcomingEvents(10)) ?? [];

  if (!events || events.length === 0) return null;

  const items: CarouselItem[] = events.map((event: EventItem) => {
    const dates = formatEventDates(
      event.dateTimes ?? [],
      event.timezoneLabel ?? undefined,
    );
    return {
      _key: event._id,
      title: event.title,
      image: event.heroImage,
      href: `/events/${event.slug}`,
      type: event.program?.shortLabel ?? undefined,
      subtitle: dates ? (
        <span>
          {dates.dateRange}
          <br />
          {event.locationShort || event.location}
        </span>
      ) : (
        event.locationShort || event.location
      ),
    };
  });

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">Upcoming Events</h2>
      </div>
      <Carousel items={items} />
    </section>
  );
}
