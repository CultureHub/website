import Link from "next/link";
import { PortableText } from "@/components/PortableText";
import SanityImage from "@/components/SanityImage";
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
  const accentColor = program?.accentColor ?? "#0A0018";

  const programLabel = program?.displayTitle ? (
    <PortableText value={program.displayTitle} />
  ) : (
    program?.shortLabel
  );

  return (
    <Link
      href={`/events/${event.slug}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      style={{ "--row-accent": accentColor } as React.CSSProperties}
      className="block border-b border-ch-midnite hover:bg-[var(--row-accent)]"
    >
      {/* Mobile card */}
      <div className="md:hidden">
        {event.heroImage && (
          <SanityImage
            image={event.heroImage}
            className="w-full h-[147px] object-cover border-b border-ch-midnite"
          />
        )}
        <div className="px-[18px] py-[18px] flex flex-col gap-[18px]">
          <div className="flex justify-between items-center gap-4">
            <span className="font-brook text-xs uppercase text-ch-midnite">
              {event.locationShort}
            </span>
            <div className="font-brook italic text-xs text-ch-midnite text-right">
              {programLabel}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-brook text-base uppercase text-ch-midnite">
              {dates?.dateRange}
            </span>
            <span className="font-milling text-[28px] leading-tight tracking-[-0.04em] text-ch-midnite">
              {event.title}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop row */}
      <div className="hidden md:grid grid-cols-[1fr_2fr] grid-rows-2 gap-y-4 gap-x-9 px-4 py-4">
        <span className="font-brook text-xs uppercase text-ch-midnite">
          {event.locationShort}
        </span>
        <div className="font-brook italic text-xs text-ch-midnite">
          {programLabel}
        </div>
        <span className="font-brook text-base uppercase text-ch-midnite">
          {dates?.dateRange}
        </span>
        <span className="font-milling text-[28px] leading-tight tracking-[-0.04em] text-ch-midnite">
          {event.title}
        </span>
      </div>
    </Link>
  );
}
