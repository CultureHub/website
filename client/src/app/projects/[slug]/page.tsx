import Link from "next/link";
import { notFound } from 'next/navigation';
import { PortableText, type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/url";
import { getProjectBySlug } from '@/sanity/queries';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug);
  if (!project) {
    notFound();
  }
  const projectImageUrl = project.image
    ? urlFor(project.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/projects" className="hover:underline">
        ← Back to Projects
      </Link>
      {projectImageUrl && (
        <img
          src={projectImageUrl}
          alt={project.title}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
      <div className="prose">
        {project.date && <p>Published: {new Date(project.date).toLocaleDateString()}</p>}
        {Array.isArray(project.description) && (
          <PortableText value={project.description} />
        )}
      </div>
    </main>
  );
}
