import { PortableText } from "next-sanity";
import Link from "next/link";
import { urlFor } from "@/sanity/url";
import { getArtistsBySlug } from '@/sanity/queries';
import { notFound } from 'next/navigation';

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params
  const artist = await getArtistsBySlug(slug);
  if (!artist) {
    notFound();
  };
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
        {Array.isArray(artist.bio) && <PortableText value={artist.bio} />}
      </div>

      {artist.projects?.length ?? 0 > 0 ? (
        <div>
          <h2 className="text-3xl font-bold mb-8">Projects</h2>
          <ul className="flex flex-col gap-y-4">
            {artist.projects?.map((project) => (
              <li className="hover:underline" key={project._id}>
                <Link href={`/projects/${project.slug?.current}`}>
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
