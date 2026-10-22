import SanityImage from "@/components/SanityImage";
import type { FestivalArtwork } from "@/sanity/queries";

export function FestivalFeaturedArtworks({
  artworks,
}: {
  artworks: FestivalArtwork[];
}) {
  if (artworks.length === 0) return null;

  return (
    <section className="bg-rf-ocher px-6 py-16 md:px-9">
      <div className="flex justify-center px-7">
        <h2 className="font-brook italic text-[40px] text-rf-metal">
          Featured Artworks
        </h2>
      </div>
      <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-fr">
        {artworks.map((artwork) => (
          <article
            key={artwork._key}
            data-equal-height-group="artwork"
            className="flex h-full flex-col break-inside-avoid"
          >
            {artwork.image && (
              <SanityImage
                image={artwork.image}
                className="w-full h-auto object-cover"
              />
            )}
            <h3 className="mt-6 font-milling font-semibold text-[32px] leading-tight text-rf-metal">
              {artwork.title}
            </h3>
            <p className="mt-3 font-brook italic text-2xl text-rf-metal">
              {artwork.artist}
            </p>
            {artwork.description && (
              <p className="mt-3 font-brook text-2xl text-rf-metal whitespace-pre-line">
                {artwork.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
