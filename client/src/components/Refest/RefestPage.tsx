import ProgramHeader from "@/components/ProgramPage/ProgramHeader";
import FestivalArchive from "@/components/Refest/FestivalArchive";
import FestivalFeature from "@/components/Refest/FestivalFeature";
import SectionHeading from "@/components/shared/SectionHeading";
import type { RefestPageData } from "@/sanity/queries";

export default function RefestPage({ data }: { data: RefestPageData }) {
  return (
    <main className="min-h-screen">
      <h1 className="sr-only">{data.title}</h1>
      <ProgramHeader
        program={data}
        hasArtists={false}
        descriptionClassName="font-brook font-normal"
      />
      {data.currentFestival && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading title="Current" className="mb-9" />
          <FestivalFeature festival={data.currentFestival} />
        </section>
      )}
      {(data.archive?.length ?? 0) > 0 && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading title="Festival Archive" className="mb-9" />
          <FestivalArchive festivals={data.archive ?? []} />
        </section>
      )}
    </main>
  );
}
