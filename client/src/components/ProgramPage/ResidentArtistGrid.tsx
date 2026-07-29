"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetResidentArtistsQueryResult } from "@/sanity/types";

type ResidentArtist = GetResidentArtistsQueryResult[number];

interface ResidentArtistGridProps {
  artists: ResidentArtist[];
}

export default function ResidentArtistGrid({
  artists,
}: ResidentArtistGridProps) {
  const [showPast, setShowPast] = useState(false);

  const yearOptions = useMemo(() => {
    const years = new Set(
      artists
        .filter((a) => a.membership?.yearStart)
        .map((a) => `${a.membership!.yearStart}-${a.membership!.yearEnd}`),
    );
    return Array.from(years);
  }, [artists]);

  const years = artists
    .filter((a) => a.membership?.yearStart)
    .map((a) => a.membership!.yearStart);
  const maxYear = Math.max(...(years.length > 0 ? years : [0]));

  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const currentYearKey = `${maxYear}-${maxYear + 1}`;

  const filtered = artists.filter((a) => {
    if (!a.membership) return false;
    const yearKey = `${a.membership.yearStart}-${a.membership.yearEnd}`;
    if (showPast) {
      return selectedYear
        ? yearKey === selectedYear
        : yearKey !== currentYearKey;
    }
    return yearKey === currentYearKey;
  });

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite px-3 pt-6 pb-9 flex flex-col gap-6">
        <h2 className="font-milling font-bold text-[28px]">Resident Artists</h2>

        <div className="flex flex-row gap-[138px] w-full">
          <button
            onClick={() => {
              setShowPast(false);
              setSelectedYear(null);
            }}
            className={`font-milling text-xl py-[10px] ${
              !showPast
                ? "bg-ch-midnite text-ch-lite w-[136px] border-b border-ch-lite pl-[10px] pr-[50px]"
                : "bg-ch-lite text-ch-midnite flex-1 border-t border-l border-r border-ch-midnite border-b-0 pl-3 pr-[87px]"
            }`}
          >
            Current
          </button>
          <button
            onClick={() => {
              setShowPast(true);
              setSelectedYear(null);
            }}
            className={`font-milling text-xl py-[10px] ${
              showPast
                ? "bg-ch-midnite text-ch-lite w-[136px] border-b border-ch-lite pl-[10px] pr-[50px]"
                : "bg-ch-lite text-ch-midnite flex-1 border-t border-l border-r border-ch-midnite border-b-0 pl-3 pr-[87px]"
            }`}
          >
            Past
          </button>
        </div>

        {showPast && yearOptions.length > 0 && (
          <div className="flex flex-row flex-wrap gap-[10px] border-t border-ch-midnite pt-6">
            {yearOptions.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr === selectedYear ? null : yr)}
                className={`px-[10px] py-2.5 border border-ch-midnite font-milling text-xl ${
                  yr === selectedYear
                    ? "bg-ch-midnite text-ch-lite"
                    : "bg-ch-lite text-ch-midnite"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-9">
        {filtered.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-ch-blue"
          >
            {artist.image && (
              <SanityImage
                image={artist.image}
                className="w-full aspect-[3/2] object-cover rounded-[10px] border border-ch-midnite"
              />
            )}
            <div className="flex flex-row justify-between">
              <span className="font-brook text-2xl uppercase">
                {artist.membership?.yearStart}-{artist.membership?.yearEnd}
              </span>
              <span className="font-brook text-2xl uppercase">
                {artist.membership?.location || artist.locations?.[0] || ""}
              </span>
            </div>
            <span className="font-milling text-[32px] leading-tight">
              {artist.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
