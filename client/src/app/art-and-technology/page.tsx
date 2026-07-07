import {
  getProjects,
  getProjectFilterOptions,
  getArtAndTechnologyPage,
  getPrograms,
  extractYears,
} from "@/sanity/queries";
import { notFound } from "next/navigation";
import Featured from "@/components/Featured";
import ProjectsList from "@/components/ProjectsList";

export const PROJECTS_PAGE_SIZE = 20;

export default async function ArtAndTechnologyPage() {
  const pageData = await getArtAndTechnologyPage();
  if (!pageData) notFound();

  const initialData = await getProjects({}, PROJECTS_PAGE_SIZE, 0);
  const filterOptions = await getProjectFilterOptions();
  const allYears = extractYears(filterOptions.dates);
  const featuredPrograms = pageData.featuredPrograms?.length
    ? pageData.featuredPrograms
    : await getPrograms();

  return (
    <main className="min-h-screen">
      <section className="flex flex-col md:flex-row justify-between gap-9 mx-6 md:mx-16 my-9 md:my-12 pb-9 md:pb-12 border-b border-black">
        <h1 className="font-milling font-bold text-[40px] leading-tight text-ch-midnite">
          {pageData.heading}
        </h1>
        <p className="font-milling font-thin text-[28px] leading-snug text-ch-midnite md:max-w-[683px]">
          {pageData.introText}
        </p>
      </section>
      <Featured programs={featuredPrograms} />
      <div className="flex flex-col gap-10 py-8">
        <ProjectsList
          initialData={initialData}
          allPrograms={filterOptions.programs}
          allPlaces={filterOptions.places}
          allYears={allYears}
          pageSize={PROJECTS_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
