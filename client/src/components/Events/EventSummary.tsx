import { PortableText } from "@/components/PortableText";
import SanityImage from "@/components/SanityImage";
import Button from "@/components/Button";
import { formatEventDates } from "@/util/event-date";
import type { EventListItem } from "@/sanity/queries";

export default function EventSummary({
  event,
}: {
  event: EventListItem | null;
}) {
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
