import { notFound } from "next/navigation";
import { getCommunityPage, getArtistDirectory } from "@/sanity/queries";
import CommunityHeader from "@/components/Community/CommunityHeader";
import FeaturedArtistsCarousel from "@/components/Community/FeaturedArtistsCarousel";
import ArtistDirectory from "@/components/Community/ArtistDirectory";
import OpportunitiesSection from "@/components/Community/OpportunitiesSection";
import SupportSection from "@/components/Community/SupportSection";

export default async function CommunityPage() {
  const pageData = await getCommunityPage();
  if (!pageData) notFound();

  const artists = await getArtistDirectory();

  return (
    <main className="min-h-screen">
      <CommunityHeader
        heading={pageData.heading}
        introText={pageData.introText}
      />

      {pageData.featuredArtists && pageData.featuredArtists.length > 0 && (
        <FeaturedArtistsCarousel
          title={pageData.featuredArtistsTitle}
          artists={pageData.featuredArtists}
        />
      )}

      <ArtistDirectory
        title={pageData.artistDirectoryTitle}
        artists={artists}
      />

      <OpportunitiesSection
        title={pageData.opportunitiesTitle}
        intro={pageData.opportunitiesIntro}
        currentTitle={pageData.currentOpportunitiesTitle}
        opportunities={pageData.opportunities ?? []}
      />

      <SupportSection
        supportTitle={pageData.supportTitle}
        supportImages={pageData.supportImages ?? []}
        supportText={pageData.supportText}
        supportSubtext={pageData.supportSubtext}
        membershipTitle={pageData.membershipTitle}
        membershipIntro={pageData.membershipIntro}
        membershipTiers={pageData.membershipTiers ?? []}
        donationTitle={pageData.donationTitle}
        donationText={pageData.donationText}
        donationMethods={pageData.donationMethods ?? []}
      />
    </main>
  );
}
