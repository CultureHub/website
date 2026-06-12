import {
  getProjects,
  getProjectFilterOptions,
  getArtAndTechnologyPage,
  extractYears,
} from "@/sanity/queries";
import Featured from "@/components/Featured";
import ProjectsList from "@/components/ProjectsList";

export const PROJECTS_PAGE_SIZE = 20;

const DEFAULT_HEADING = "Art & Technology";
const DEFAULT_INTRO =
  "Artists at CultureHub explore the convergence of art and technology. Through residencies, an annual festival, and our digital storytelling lab, we present work that crosses genres, cultures, and media.";

export default async function ArtAndTechnologyPage() {
  const initialData = await getProjects({}, PROJECTS_PAGE_SIZE, 0);
  const filterOptions = await getProjectFilterOptions();
  const allYears = extractYears(filterOptions.dates);
  const pageData = await getArtAndTechnologyPage();

  const heading = pageData?.heading || DEFAULT_HEADING;
  const introText = pageData?.introText || DEFAULT_INTRO;

  return (
    <main className="min-h-screen">
      <section className="flex flex-col md:flex-row justify-between gap-9 mx-6 md:mx-8 my-9 md:my-12">
        <h1 className="font-milling font-bold text-[40px] leading-tight text-ch-midnite">
          {heading}
        </h1>
        <p className="font-milling font-thin text-[28px] leading-snug text-ch-midnite md:max-w-[683px]">
          {introText}
        </p>
      </section>
      <Featured />
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
