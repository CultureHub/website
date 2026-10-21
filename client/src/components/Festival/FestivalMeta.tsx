import Button from "@/components/Button";
import { festivalDateLines, festivalHref } from "@/util/festival";
import type { FestivalArchiveItem } from "@/sanity/queries";

export function FestivalYearTitle({
  festival,
  size,
}: {
  festival: FestivalArchiveItem;
  size: "feature" | "summary";
}) {
  const textSize = size === "feature" ? "text-[48px]" : "text-[32px]";
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-8">
      <span className={`font-brook ${textSize} leading-none whitespace-nowrap`}>
        {festival.year}
      </span>
      <span
        className={`font-milling font-semibold ${textSize} tracking-[-0.04em] leading-none`}
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
        <p key={line} className="font-brook text-xl">
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
        <Button key={link._key} variant="ticket" href={link.url} openNewTab>
          {link.shortLabel ?? link.label}
        </Button>
      ))}
      <Button variant="ticket" href={festivalHref(festival.slug)}>
        Visit Festival
      </Button>
    </div>
  );
}
