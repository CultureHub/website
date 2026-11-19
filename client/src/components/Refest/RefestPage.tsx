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
        descriptionClassName="font-schoolbook font-normal leading-[1.2]"
        titleClassName="font-new-edge"
        titleWeightClassName="font-semibold"
      />
      {data.currentFestival && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading
            title="Current"
            className="mb-9"
            borderTop={false}
            fontClassName="font-new-edge"
            fontWeightClassName="font-semibold"
          />
          <FestivalFeature festival={data.currentFestival} />
        </section>
      )}
      {(data.archive?.length ?? 0) > 0 && (
        <section className="px-6 md:px-16 pb-6 md:pb-9">
          <SectionHeading
            title="Festival Archive"
            fontClassName="font-new-edge"
            fontWeightClassName="font-semibold"
          />
          <FestivalArchive festivals={data.archive ?? []} />
        </section>
      )}
    </main>
  );
}
