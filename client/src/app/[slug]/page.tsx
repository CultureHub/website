import { notFound } from "next/navigation";
import { getProgramBySlug, getResidentArtists } from "@/sanity/queries";
import ProgramHeader from "@/components/ProgramPage/ProgramHeader";
import ResidentArtistGrid from "@/components/ProgramPage/ResidentArtistGrid";
import OpenCallSection from "@/components/ProgramPage/OpenCallSection";
import LocationTabs from "@/components/ProgramPage/LocationTabs";
import FeaturedProjects from "@/components/ProgramPage/FeaturedProjects";
import FeaturedArtists from "@/components/ProgramPage/FeaturedArtists";
import { UpcomingEvents } from "@/components/UpcomingEvents";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) notFound();

  const residentArtists =
    slug === "residency" ? await getResidentArtists(program._id) : null;

  return (
    <main className="min-h-screen">
      <ProgramHeader program={program} />
      {slug === "residency" &&
        residentArtists &&
        residentArtists.length > 0 && (
          <ResidentArtistGrid artists={residentArtists} />
        )}
      {program.openCallTitle && (
        <OpenCallSection
          title={program.openCallTitle}
          image={program.openCallImage}
          timeline={program.openCallTimeline}
          where={program.openCallWhere}
          benefits={program.openCallBenefits}
          description={program.openCallDescription}
        />
      )}
      {program.locationContent && program.locationContent.length > 0 && (
        <LocationTabs locations={program.locationContent} />
      )}
      {program.featuredProjects && program.featuredProjects.length > 0 && (
        <FeaturedProjects
          title="Recent Projects"
          projects={program.featuredProjects}
        />
      )}
      {program.featuredArtists && program.featuredArtists.length > 0 && (
        <FeaturedArtists
          title="Featured Artists"
          subtitle={program.shortLabel}
          artists={program.featuredArtists}
          columns={3}
        />
      )}
      <UpcomingEvents programSlug={slug} />
    </main>
  );
}
