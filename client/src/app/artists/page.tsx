"use client";

import React, {useState, useEffect} from "react";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const ARTIST_QUERY = (filters: string[]) => `*[
  _type == "artist"
  ${filters.length > 0 ? ' && ' + filters.join("&&") : ''}
  && defined(slug.current)
][0...12]`;

const options = { next: { revalidate: 30 } };

const MEDIUM_QUERY = `
array::unique(*[_type == "artist"].medium[])
`

export default function ArtistsIndexPage() {
  const [mediumFilter, setMediumFilter] = useState<string[]>([]);
  const [mediumOptions, setMediumOptions] = useState<string[] | null>(null);
  useEffect(() => {
    client.fetch(
      MEDIUM_QUERY,
      {},
      options,
    ).then(setMediumOptions);
  }, []);

  const [artists, setArtists] = useState<SanityDocument[] | null>(null);
  useEffect(() => {
    const filters = mediumFilter.length > 0 ? [`count(medium[@ in $mediums]) > 0`] : [];
    const query = ARTIST_QUERY(filters)
    client.fetch<SanityDocument[]>(
      query,
      { mediums: mediumFilter },
      options,
    ).then(setArtists);
  }, [mediumFilter]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setMediumFilter(values);
  };

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Artists</h1>
      { mediumOptions && 
        <select multiple={true} value={mediumFilter} onChange={handleChange} id="mediumSelect">
          {mediumOptions.map((medium: string) => (
            <option key={medium} value={medium}>
              {medium}
            </option>
          ))}
        </select>
      }
      <ul className="flex flex-col gap-y-4">
        {artists !== null ? artists.map((artist) => (
          <li className="hover:underline" key={artist._id}>
            <Link href={`/artists/${artist.slug.current}`}>
              <h2 className="text-xl font-semibold">{artist.name}</h2>
            </Link>
          </li>
        )) : <li>Loading...</li>}
      </ul>
    </main>
  );
}
