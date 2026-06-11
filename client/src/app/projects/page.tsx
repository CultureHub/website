import {
  getProjects,
  getProjectFilterOptions,
  extractYears,
} from "@/sanity/queries";
import Featured from "@/components/Featured";
import ProjectsList from "@/components/ProjectsList";

export const PROJECTS_PAGE_SIZE = 20;

export default async function ProjectsIndexPage() {
  const initialData = await getProjects({}, PROJECTS_PAGE_SIZE, 0);
  const filterOptions = await getProjectFilterOptions();
  const allYears = extractYears(filterOptions.dates);

  return (
    <main className="min-h-screen">
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
