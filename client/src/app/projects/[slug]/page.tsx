import { PortableText, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import Link from "next/link";
import { urlFor } from "@/sanity/url";

const PROJECT_QUERY = `*[_type == "project" && slug.current == $slug][0]`;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = await client.fetch<SanityDocument>(
    PROJECT_QUERY,
    await params,
    options,
  );
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
        <p>Published: {new Date(project.publishedAt).toLocaleDateString()}</p>
        {Array.isArray(project.description) && (
          <PortableText value={project.description} />
        )}
      </div>
    </main>
  );
}
