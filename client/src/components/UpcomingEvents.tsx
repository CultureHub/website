import { Carousel, type CarouselItem } from "@/components/Carousel";
import {
  getUpcomingEvents,
  getUpcomingEventsByProgram,
} from "@/sanity/queries";
type UpcomingEventResult = Array<{
  _id: string;
  title: string | null;
  slug: string | null;
  dateTimes: Array<{
    start: string;
    end: string;
  }> | null;
  location: string | null;
  locationShort: string | null;
  timezoneLabel: string | null;
  program: {
    _id: string;
    title: string | null;
    slug: { current: string };
    shortLabel: string | null;
    displayTitle: string | null;
  } | null;
  heroImage: {
    asset: unknown;
    hotspot: unknown;
    crop: unknown;
    alt: string | null;
  } | null;
}>;
import { formatEventDates } from "@/util/event-date";

interface UpcomingEventsProps {
  programSlug?: string;
}

type UpcomingEvent = UpcomingEventResult[number] & {
  timezoneLabel?: string;
  locationShort?: string;
};

export async function UpcomingEvents({ programSlug }: UpcomingEventsProps) {
  const events: UpcomingEvent[] =
    (programSlug
      ? await getUpcomingEventsByProgram(programSlug)
      : await getUpcomingEvents(5)) ?? [];

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
        href: `/events/${event.slug}`,
        type: event.program?.shortLabel ?? undefined,
        subtitle: dates ? (
          <span>
            {dates.dateRange}
            {event.locationShort && (
              <span>
                {"\n"}
                {event.locationShort}
              </span>
            )}
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
