import { notFound } from "next/navigation";
import { PortableText } from "@/components/PortableText";
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
  if (program.hasPage === false) notFound();

  const residentArtists =
    slug === "residency" ? await getResidentArtists(program._id) : null;

  const accentColor = program.accentColor || "#B5FD8B";

  return (
    <main className="min-h-screen">
      <ProgramHeader
        program={program}
        hasArtists={
          !!(residentArtists && residentArtists.length > 0) ||
          !!(program.featuredArtists && program.featuredArtists.length > 0)
        }
      />
      {program.featuredProjects && program.featuredProjects.length > 0 && (
        <FeaturedProjects
          title="Recent Projects"
          projects={program.featuredProjects}
        />
      )}
      {slug === "residency" &&
        residentArtists &&
        residentArtists.length > 0 && (
          <ResidentArtistGrid artists={residentArtists} id="artists" />
        )}
      {program.featuredArtists && program.featuredArtists.length > 0 && (
        <FeaturedArtists
          id="artists"
          title="Featured Artists"
          subtitle={
            program.displayTitle ? (
              <PortableText value={program.displayTitle} />
            ) : (
              program.title
            )
          }
          artists={program.featuredArtists}
          accentColor={accentColor}
        />
      )}
      {program.openCall && (
        <OpenCallSection
          title={program.openCall.title}
          image={program.openCall.heroImage}
          timeline={program.openCall.timeline}
          where={program.openCall.where}
          benefits={program.openCall.benefits}
          description={program.openCall.description}
        />
      )}
      {program.locationContent && program.locationContent.length > 0 && (
        <LocationTabs locations={program.locationContent} />
      )}
      <UpcomingEvents programSlug={slug} />
    </main>
  );
}
