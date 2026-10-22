import Button from "@/components/Button";
import { festivalDateLines, festivalHref } from "@/util/festival";
import type { FestivalArchiveItem } from "@/sanity/queries";

export function FestivalYearTitle({
  festival,
}: {
  festival: FestivalArchiveItem;
}) {
  const textSize = "text-[48px]";
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-8">
      <span
        className={`font-schoolbook ${textSize} leading-none whitespace-nowrap`}
      >
        {festival.year}
      </span>
      <span
        className={`font-new-edge font-semibold ${textSize} tracking-[-0.04em] leading-none`}
      >
        {festival.title}
      </span>
    </div>
  );
}

export function FestivalDateLines({
  festival,
}: {
  festival: FestivalArchiveItem;
}) {
  const lines = festivalDateLines(festival.locations ?? []);
  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((line) => (
        <p
          key={line}
          className="font-schoolbook-condensed text-xl leading-[1.2]"
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export function FestivalActions({
  festival,
}: {
  festival: FestivalArchiveItem;
}) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-4">
      {festival.links?.map((link) => (
        <Button
          key={link._key}
          variant="ticket"
          href={link.url}
          openNewTab
          textClassName="font-new-edge"
          textWeightClassName="font-semibold"
        >
          {link.shortLabel ?? link.label}
        </Button>
      ))}
      <Button
        variant="ticket"
        href={festivalHref(festival.slug)}
        textClassName="font-new-edge"
        textWeightClassName="font-semibold"
      >
        Visit Festival
      </Button>
    </div>
  );
}
