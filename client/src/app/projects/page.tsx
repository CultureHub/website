import Link from "next/link";
import { getProjects } from "@/sanity/queries";
import Featured from "@/components/Featured";

export default async function ProjectsIndexPage() {
  const projects = await getProjects();
  return (
    <main className="container mx-auto min-h-screen p-8 flex flex-col gap-10">
      <Featured />
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <ul className="flex flex-col gap-y-4">
        {projects.map((project) => (
          <li className="hover:underline" key={project._id}>
            <Link href={`/projects/${project.slug.current}`}>
              <h2 className="text-xl font-semibold">{project.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
