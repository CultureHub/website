"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { Artist } from "@/sanity/types";
import * as Queries from "@/sanity/queries";

type ArtistsListProps = {
  initialArtists: Artist[];
  mediumOptions: string[];
};

export default function ArtistsList({
  initialArtists,
  mediumOptions,
}: ArtistsListProps) {
  const [mediumFilter, setMediumFilter] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[] | null>(initialArtists);

  useEffect(() => {
    if (mediumFilter.length > 0) {
      Queries.getArtistsByMediums(mediumFilter).then(setArtists);
    } else {
      Queries.getArtists().then(setArtists);
    }
  }, [mediumFilter]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value,
    );
    setMediumFilter(values);
  };

  return (
    <div>
      {mediumOptions && (
        <select
          multiple={true}
          value={mediumFilter}
          onChange={handleChange}
          id="mediumSelect"
        >
          {mediumOptions.map((medium: string) => (
            <option key={medium} value={medium}>
              {medium}
            </option>
          ))}
        </select>
      )}
      <ul className="flex flex-col gap-y-4">
        {artists !== null ? (
          artists.map((artist) => (
            <li className="hover:underline" key={artist._id}>
              <Link href={`/artists/${artist.slug.current}`}>
                <h2 className="text-xl font-semibold">{artist.name}</h2>
              </Link>
            </li>
          ))
        ) : (
          <li>Loading...</li>
        )}
      </ul>
    </div>
  );
}
