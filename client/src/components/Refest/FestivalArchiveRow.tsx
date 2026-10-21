import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { festivalHref, festivalLocationSummary } from "@/util/festival";
import type { FestivalArchiveItem } from "@/sanity/queries";

export default function FestivalArchiveRow({
  festival,
  selected,
  onHover,
}: {
  festival: FestivalArchiveItem;
  selected: boolean;
  onHover: () => void;
}) {
  const locationSummary = festivalLocationSummary(
    festival.locations ?? [],
    festival.locationSummary,
  );

  return (
    <>
      <Link
        href={festivalHref(festival.slug)}
        onMouseEnter={onHover}
        onFocus={onHover}
        className={`hidden md:grid grid-cols-[1fr_2fr] grid-rows-[1fr_3fr] gap-x-9 gap-y-[18px] p-[18px] border-b border-r border-ch-midnite ${
          selected ? "bg-rf-highlighter" : "bg-ch-lite"
        }`}
      >
        <span className="font-brook text-xs text-ch-midnite">
          {locationSummary}
        </span>
        <span className="font-brook italic text-xs text-ch-midnite">
          Re–Fest
        </span>
        <span className="font-brook text-[32px] uppercase leading-none text-ch-midnite">
          {festival.year}
        </span>
        <span className="font-milling font-semibold text-[28px] tracking-[-0.04em] leading-tight text-ch-midnite">
          {festival.title}
        </span>
      </Link>

      <Link
        href={festivalHref(festival.slug)}
        onMouseEnter={onHover}
        onFocus={onHover}
        className="flex md:hidden flex-row items-center border-b border-r border-ch-midnite"
      >
        <div className="flex flex-1 min-w-0 flex-col justify-between self-stretch gap-2 p-[18px]">
          <span className="font-brook text-xs text-ch-midnite">
            {locationSummary}
          </span>
          <span className="font-brook text-2xl uppercase text-ch-midnite">
            {festival.year}
          </span>
          <span className="font-milling font-semibold text-[28px] tracking-[-0.04em] leading-tight text-ch-midnite">
            {festival.title}
          </span>
        </div>
        {festival.heroImage ? (
          <SanityImage
            image={festival.heroImage}
            className="w-[132px] h-[125px] shrink-0 object-cover"
          />
        ) : (
          <div className="w-[132px] h-[125px] shrink-0" />
        )}
      </Link>
    </>
  );
}
