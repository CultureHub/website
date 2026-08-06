import type { ReactNode } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type FeaturedArtist = NonNullable<
  NonNullable<GetProgramBySlugQueryResult>["featuredArtists"]
>[number];

interface FeaturedArtistsProps {
  id?: string;
  title: string;
  subtitle?: ReactNode;
  artists: FeaturedArtist[];
  accentColor?: string;
}

export default function FeaturedArtists({
  id,
  title,
  subtitle,
  artists,
  accentColor = "#B5FD8B",
}: FeaturedArtistsProps) {
  return (
    <section id={id} className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {artists.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px]"
            style={{ backgroundColor: accentColor }}
          >
            {artist.image && (
              <SanityImage
                image={artist.image}
                className="w-full aspect-square object-cover rounded-[10px] border border-ch-midnite"
              />
            )}
            <div className="flex flex-row justify-between">
              {subtitle && (
                <span className="font-brook italic text-base">{subtitle}</span>
              )}
              <span className="font-brook text-base uppercase whitespace-nowrap">
                {artist.locations?.[0] || ""}
              </span>
            </div>
            <span className="font-milling text-xl">{artist.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
