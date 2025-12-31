import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const ARTIST_QUERY = `*[
  _type == "artist"
  && defined(slug.current)
][0...12]{_id, name, slug}`;

const options = { next: { revalidate: 30 } };

export default async function ArtistsIndexPage() {
  const artists = await client.fetch<SanityDocument[]>(
    ARTIST_QUERY,
    {},
    options,
  );

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Artists</h1>
      <ul className="flex flex-col gap-y-4">
        {artists.map((artist) => (
          <li className="hover:underline" key={artist._id}>
            <Link href={`/artists/${artist.slug.current}`}>
              <h2 className="text-xl font-semibold">{artist.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
