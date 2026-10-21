import { PortableText } from "@/components/PortableText";
import SanityImage from "@/components/SanityImage";
import type { FestivalTemplateData } from "@/sanity/queries";

export function FestivalAbout({
  festival,
}: {
  festival: FestivalTemplateData;
}) {
  const hasContent =
    !!festival.about ||
    !!festival.logo ||
    (festival.locations?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <section
      id="about"
      className="scroll-mt-[165px] bg-rf-metal text-rf-cream px-6 py-16 md:px-16 md:py-16"
    >
      <div className="flex flex-col md:flex-row md:justify-between gap-[72px]">
        <div className="flex flex-col gap-[72px] md:w-[482px]">
          <div className="flex flex-col gap-5">
            {festival.logo && (
              <SanityImage
                image={festival.logo}
                className="w-[299px] h-auto object-contain"
              />
            )}
            <span className="font-milling font-semibold text-[60px] uppercase leading-none text-rf-ocher">
              {festival.title}
            </span>
          </div>

          <div className="flex flex-col gap-7">
            {(festival.locations ?? []).map((location) => (
              <div key={location._key} className="flex flex-col gap-1">
                <span className="font-brook text-2xl text-rf-ocher">
                  {location.name}
                </span>
                {location.dateLabel && (
                  <span className="font-brook text-2xl text-rf-cream">
                    {location.dateLabel}
                  </span>
                )}
                {(location.venueName || location.address) && (
                  <span className="font-brook text-2xl text-rf-cream whitespace-pre-line">
                    {[location.venueName, location.address]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {location.links?.map((link) => (
                  <a
                    key={link._key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-brook text-xl underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {festival.about && (
          <div className="font-brook text-[27px] text-rf-cream md:w-[777px] [&_p]:mb-5 [&_p:last-child]:mb-0">
            <PortableText value={festival.about} />
          </div>
        )}
      </div>
    </section>
  );
}
