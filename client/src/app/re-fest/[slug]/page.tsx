import { cache, Fragment } from "react";
import { notFound } from "next/navigation";
import SanityImage from "@/components/SanityImage";
import { FestivalAbout } from "@/components/Festival/FestivalAbout";
import { FestivalFeaturedArtworks } from "@/components/Festival/FestivalFeaturedArtworks";
import { FestivalJumpTo } from "@/components/Festival/FestivalJumpTo";
import { FestivalLocationSection } from "@/components/Festival/FestivalLocationSection";
import { FestivalPartners } from "@/components/Festival/FestivalPartners";
import { FestivalSchedule } from "@/components/Festival/FestivalSchedule";
import { FestivalVideos } from "@/components/Festival/FestivalVideos";
import { getFestivalBySlug } from "@/sanity/queries";

interface FestivalPageProps {
  params: Promise<{ slug: string }>;
}

const getFestival = cache((slug: string) => getFestivalBySlug("re-fest", slug));

export async function generateMetadata({ params }: FestivalPageProps) {
  const { slug } = await params;
  const festival = await getFestival(slug);
  if (!festival) return {};
  return {
    title: `${festival.title} — Re–Fest ${festival.year}`,
    description: festival.summary ?? undefined,
  };
}

export default async function FestivalPage({ params }: FestivalPageProps) {
  const { slug } = await params;
  const festival = await getFestival(slug);
  if (!festival) notFound();

  return (
    <main className="min-h-screen">
      <h1 className="sr-only">
        {festival.title} — Re–Fest {festival.year}
      </h1>
      <FestivalJumpTo festival={festival} />

      {festival.heroImage && (
        <SanityImage
          image={festival.heroImage}
          className="w-full h-[348px] md:h-[840px] object-cover border-b border-ch-midnite"
        />
      )}

      <FestivalAbout festival={festival} />

      {(festival.locations ?? []).map((location) => (
        <Fragment key={location._key}>
          <FestivalLocationSection location={location} />
          {location.schedule && (
            <FestivalSchedule schedule={location.schedule} />
          )}
          {location.featuredArtworks &&
            location.featuredArtworks.length > 0 && (
              <FestivalFeaturedArtworks artworks={location.featuredArtworks} />
            )}
        </Fragment>
      ))}

      <FestivalVideos videos={festival.videos} />
      <FestivalPartners groups={festival.partnerGroups} />
    </main>
  );
}
