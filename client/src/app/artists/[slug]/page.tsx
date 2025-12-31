import { PortableText, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import Link from "next/link";
import { urlFor } from "@/sanity/url";

const ARTIST_QUERY = `*[_type == "artist" && slug.current == $slug]{
  ...,
  projects[]->{
    title,
    slug, }
}[0]`;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const artist = await client.fetch<SanityDocument>(
    ARTIST_QUERY,
    await params,
    options,
  );
  const artistImageUrl = artist.image
    ? urlFor(artist.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/artists" className="hover:underline">
        ← Back to Artists
      </Link>
      {artistImageUrl && (
        <img
          src={artistImageUrl}
          alt={artist.name}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{artist.name}</h1>
      <div className="prose">
        {Array.isArray(artist.bio) && (
          <PortableText value={artist.bio} />
        )}
      </div>

      {artist.projects?.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold mb-8">Projects</h2>
            <ul className="flex flex-col gap-y-4">
              {artist.projects.map((project: SanityDocument) => (
                <li className="hover:underline" key={project._id}>
                  <Link href={`/projects/${project.slug.current}`}>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      }
    </main>
  );
}
