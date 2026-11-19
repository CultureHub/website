import { PortableText } from "@/components/PortableText";
import Button from "@/components/Button";
import DetailSummary from "@/components/shared/DetailSummary";
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
    <DetailSummary
      image={event.heroImage}
      title={
        <h2 className="font-milling font-bold text-5xl text-left text-ch-midnite">
          {event.title}
        </h2>
      }
      meta={
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
      }
      description={
        event.description ? (
          <div className="font-milling font-light text-2xl text-ch-midnite">
            <PortableText value={event.description} />
          </div>
        ) : null
      }
      actions={
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
      }
    />
  );
}
