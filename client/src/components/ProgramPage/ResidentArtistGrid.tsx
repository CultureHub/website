"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetResidentArtistsQueryResult } from "@/sanity/types";

type ResidentArtist = GetResidentArtistsQueryResult[number];

interface ResidentArtistGridProps {
  artists: ResidentArtist[];
  id?: string;
}

export default function ResidentArtistGrid({
  artists,
  id,
}: ResidentArtistGridProps) {
  const [showPast, setShowPast] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const years: number[] = [];
  for (const a of artists) {
    if (a.membership?.yearStart) years.push(a.membership.yearStart);
  }
  const maxYear = Math.max(...(years.length > 0 ? years : [0]));
  const currentYearKey = `${maxYear}-${maxYear + 1}`;
  const previousYearKey = maxYear > 0 ? `${maxYear - 1}-${maxYear}` : null;

  const yearOptions = useMemo(() => {
    const yearsSet = new Set<string>();
    for (const a of artists) {
      if (a.membership?.yearStart) {
        yearsSet.add(`${a.membership.yearStart}-${a.membership.yearEnd}`);
      }
    }
    return Array.from(yearsSet).sort((a, b) => {
      const aStart = parseInt(a.split("-")[0], 10);
      const bStart = parseInt(b.split("-")[0], 10);
      return bStart - aStart;
    });
  }, [artists]);

  const pastYearOptions = yearOptions.filter((yr) => yr !== currentYearKey);

  const effectiveSelectedYear = showPast
    ? (selectedYear ?? previousYearKey)
    : currentYearKey;

  const filtered = artists.filter((a) => {
    if (!a.membership) return false;
    const yearKey = `${a.membership.yearStart}-${a.membership.yearEnd}`;
    return yearKey === effectiveSelectedYear;
  });

  return (
    <section id={id} className="px-6 md:px-16 py-6 md:py-9">
      <div className="border-t border-b border-ch-midnite px-0 md:px-3 pt-6 pb-6 flex flex-col gap-6">
        <h2 className="font-milling font-bold text-[28px] text-ch-midnite">
          Resident Artists
        </h2>

        <div>
          <div className="flex flex-row w-full">
            <button
              onClick={() => {
                setShowPast(false);
                setSelectedYear(null);
              }}
              className={`cursor-pointer shrink-0 font-milling text-xl py-[10px] w-[129px] md:w-[136px] ${
                !showPast
                  ? "bg-ch-midnite text-ch-lite border-b border-ch-lite pl-[10px] pr-[50px]"
                  : "bg-ch-lite text-ch-midnite border border-ch-midnite pl-[10px] pr-[50px]"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => {
                setShowPast(true);
                setSelectedYear(null);
              }}
              className={`cursor-pointer font-milling text-xl py-[10px] flex-1 flex items-start pl-3 ${
                showPast
                  ? "bg-ch-midnite text-ch-lite border-b border-ch-lite"
                  : "bg-ch-lite text-ch-midnite border border-ch-midnite"
              }`}
            >
              Past
            </button>
          </div>

          <div className="grid grid-cols-[129px_1fr] md:grid-cols-[136px_1fr] border-ch-midnite">
            <div className="border-ch-midnite border-r border-b md:border-b-0 border-l">
              <button
                onClick={() => {
                  setShowPast(false);
                  setSelectedYear(null);
                }}
                className={`w-full cursor-pointer border-b py-2.5 border-ch-midnite font-milling text-xl whitespace-nowrap ${
                  !showPast
                    ? "bg-ch-midnite text-ch-lite"
                    : "bg-ch-lite text-ch-midnite"
                }`}
              >
                {currentYearKey}
              </button>
            </div>
            <div
              className={`grid grid-cols-2 border-ch-midnite md:flex md:flex-wrap ${showPast ? "border-t" : "border-r border-b"}`}
            >
              {showPast &&
                pastYearOptions.map((yr) => {
                  const isSelected = yr === effectiveSelectedYear;
                  return (
                    <button
                      key={yr}
                      onClick={() => {
                        setShowPast(true);
                        setSelectedYear(yr === selectedYear ? null : yr);
                      }}
                      className={`cursor-pointer px-[10px] py-2.5 font-milling text-xl whitespace-nowrap md:w-[136px] md:shrink-0 border-b border-r border-ch-midnite ${
                        isSelected
                          ? "bg-ch-midnite text-ch-lite"
                          : "bg-ch-lite text-ch-midnite"
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              {showPast && pastYearOptions.length % 2 === 1 && (
                <div aria-hidden className="bg-ch-lite md:hidden" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {showPast && pastYearOptions.length === 0 && (
          <p className="text-ch-midnite font-milling text-xl">
            No past resident artists.
          </p>
        )}
        {filtered.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-ch-blue"
          >
            {artist.image && (
              <SanityImage
                image={artist.image}
                className="w-full aspect-square object-cover rounded-[10px] border border-ch-midnite"
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
