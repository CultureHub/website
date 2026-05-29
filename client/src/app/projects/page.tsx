import Link from "next/link";
import { getProjects } from "@/sanity/queries";
import Featured from "@/components/Featured";

export default async function ProjectsIndexPage() {
  const projects = await getProjects();
  return (
    <main className="min-h-screen flex flex-col gap-10 py-8">
      <Featured />
      <div className="container mx-auto px-4 md:px-8 flex flex-col gap-10">
        <h1 className="text-4xl font-bold">Projects</h1>
        <ul className="flex flex-col gap-y-4">
          {projects.map((project) => (
            <li className="hover:underline" key={project._id}>
              <Link href={`/projects/${project.slug.current}`}>
                <h2 className="text-xl font-semibold">{project.title}</h2>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
