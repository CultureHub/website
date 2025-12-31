import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const PROJECTS_QUERY = `*[
  _type == "project"
  && defined(slug.current)
][0...12]{_id, title, slug}`;

const options = { next: { revalidate: 30 } };

export default async function ProjectsIndexPage() {
  const projects = await client.fetch<SanityDocument[]>(
    PROJECTS_QUERY,
    {},
    options,
  );

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
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
