import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const ARTIST_QUERY = `*[
  _type == "artist"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 30 } };

export default async function ProjectsIndexPage() {
  const artists = await client.fetch<SanityDocument[]>(
    ARTIST_QUERY,
    {},
    options,
  );

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <Link href="/artists">
        <h1 className="text-4xl font-bold mb-8">Artist</h1>
      </Link>
      <Link href="/projects">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>
      </Link>
    </main>
  );
}
