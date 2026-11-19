import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import SectionHeading from "@/components/shared/SectionHeading";
import MediaTagIcon from "@/components/MediaTagIcon";
import {
  getUpcomingEvents,
  getUpcomingEventsByProgram,
} from "@/sanity/queries";
import type { GetUpcomingEventsQueryResult } from "@/sanity/types";
import { formatEventDates } from "@/util/event-date";

interface UpcomingEventsProps {
  programSlug?: string;
}

export async function UpcomingEvents({ programSlug }: UpcomingEventsProps) {
  const events =
    (programSlug
      ? await getUpcomingEventsByProgram(programSlug)
      : await getUpcomingEvents(5)) ?? [];

  const filtered = events.filter(
    (event: GetUpcomingEventsQueryResult[number]) => event.title,
  );
  if (filtered.length === 0) return null;

  return (
    <section className="px-6 md:px-16 py-6 md:py-9">
      <SectionHeading title="Upcoming Events" className="mb-9" />
      <Carousel>
        {filtered.map((event: GetUpcomingEventsQueryResult[number]) => {
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
                <div className="flex flex-row items-center gap-4.5">
                  <MediaTagIcon
                    type={
                      (event.program?.shortLabel ?? "") as Parameters<
                        typeof MediaTagIcon
                      >[0]["type"]
                    }
                  />
                  <span className="font-brook text-base uppercase">
                    {event.program?.shortLabel}
                  </span>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <span className="font-brook text-base uppercase">
                    {dates?.dateRange}
                  </span>
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
