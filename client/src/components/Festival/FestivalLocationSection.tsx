import { festivalAnchor } from "@/util/festival";
import type { FestivalLocation } from "@/sanity/queries";

const VARIANTS: Record<string, string> = {
  highlighter: "bg-rf-highlighter text-ch-midnite",
  pool: "bg-rf-pool text-rf-metal",
  midnight: "bg-rf-midnight text-rf-blue-smoke",
  ocher: "bg-rf-ocher text-rf-metal",
  cream: "bg-rf-cream text-rf-metal",
  metal: "bg-rf-metal text-rf-cream",
};

export function FestivalLocationSection({
  location,
}: {
  location: FestivalLocation;
}) {
  const variant =
    VARIANTS[location.colorVariant ?? "highlighter"] ?? VARIANTS.highlighter;
  const artists = location.participatingArtists ?? [];

  return (
    <section
      id={festivalAnchor(location.name)}
      className={`scroll-mt-[165px] px-6 py-8 md:px-16 ${variant}`}
    >
      <div className="flex flex-col md:flex-row md:justify-between gap-16">
        <div className="flex flex-col gap-6">
          <h2 className="font-schoolbook italic text-[40px] leading-tight">
            {location.name}
          </h2>
          <div className="flex flex-col gap-2 font-schoolbook-condensed text-2xl whitespace-pre-line">
            {location.dateLabel && <span>{location.dateLabel}</span>}
            {location.venueName && <span>{location.venueName}</span>}
            {location.address && <span>{location.address}</span>}
            {location.details && <span>{location.details}</span>}
          </div>
          {location.links && location.links.length > 0 && (
            <div className="flex flex-col gap-1">
              {location.links.map((link) => (
                <a
                  key={link._key}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-schoolbook-condensed text-xl underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {artists.length > 0 && (
          <div className="flex flex-col gap-6 md:max-w-[736px]">
            <h3 className="font-schoolbook italic text-[40px] leading-tight">
              Participating Artists
            </h3>
            <div
              className={
                location.kind === "virtual"
                  ? "columns-1 md:columns-2 xl:columns-3 gap-8 font-new-edge font-semibold text-2xl leading-tight"
                  : "flex flex-col gap-1 font-new-edge font-semibold text-2xl leading-tight"
              }
            >
              {artists.map((artist, index) => (
                <span
                  key={`${artist}-${index}`}
                  className="block mb-1 break-inside-avoid"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
