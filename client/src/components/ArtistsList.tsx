"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { Artist } from "@/sanity/types";
import * as Queries from "@/sanity/queries";

type ArtistsListProps = {
  initialArtists: Artist[];
  locationOptions: string[];
};

export default function ArtistsList({
  initialArtists,
  locationOptions,
}: ArtistsListProps) {
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[] | null>(initialArtists);

  useEffect(() => {
    if (locationFilter.length > 0) {
      Queries.getArtistsByLocations(locationFilter).then(setArtists);
    } else {
      Queries.getArtists().then(setArtists);
    }
  }, [locationFilter]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value,
    );
    setLocationFilter(values);
  };

  return (
    <div>
      {locationOptions && (
        <select
          multiple={true}
          value={locationFilter}
          onChange={handleChange}
          id="locationSelect"
        >
          {locationOptions.map((location: string) => (
            <option key={location} value={location}>
              {location}
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
