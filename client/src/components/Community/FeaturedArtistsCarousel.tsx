"use client";

import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { Carousel } from "@/components/Carousel";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type FeaturedArtist = NonNullable<CommunityPage["featuredArtists"]>[number];

export default function FeaturedArtistsCarousel({
  title,
  artists,
}: {
  title: CommunityPage["featuredArtistsTitle"];
  artists: FeaturedArtist[];
}) {
  return (
    <section className="flex flex-col gap-[10px]">
      <div className="w-full px-6 md:px-16">
        <div className="py-6 border-b border-black">
          <h2 className="font-milling font-bold text-[28px]">
            {title || "Featured Artists"}
          </h2>
        </div>
      </div>

      <div className="px-6 md:px-16">
        <Carousel itemsPerView={3}>
          {artists.map((artist) => (
            <Link
              key={artist._id}
              href={`/artists/${artist.slug.current}`}
              className="flex flex-col gap-6"
            >
              <div className="relative aspect-square w-full overflow-hidden border border-black">
                {artist.image && (
                  <SanityImage
                    image={artist.image}
                    fill
                    objectFit="cover"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-brook italic text-base">
                  Resident Artist
                </span>
                <span className="font-sans font-normal text-xl">
                  {artist.name}
                </span>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
