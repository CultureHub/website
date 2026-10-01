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
      <div className="font-brook italic text-xs text-ch-midnite">
        {program?.displayTitle ? (
          <PortableText value={program.displayTitle} />
        ) : (
          program?.shortLabel
        )}
      </div>
      <span className="font-brook text-base uppercase text-ch-midnite">
        {dates?.dateRange}
      </span>
      <span className="font-milling text-[28px] leading-tight tracking-[-0.04em] text-ch-midnite">
        {event.title}
      </span>
    </Link>
  );
}
