"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";

interface ResidentArtist {
  _id: string;
  name: string | null;
  slug: { current: string };
  image: {
    asset?: { _id: string; url: string } | null;
    alt?: string | null;
  } | null;
  locations?: string[] | null;
  membership: {
    yearStart: number;
    yearEnd: number;
    location?: string | null;
  } | null;
}

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

  const maxYear = Math.max(
    ...artists
      .filter((a) => a.membership?.yearStart)
      .map((a) => a.membership!.yearStart),
  );

  const [selectedYear, setSelectedYear] = useState<string | null>(
    showPast ? null : `${maxYear}-${maxYear + 1}`,
  );

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="border-t border-b border-ch-midnite py-6">
            <h2 className="font-milling font-bold text-[28px]">
              Resident Artists
            </h2>
          </div>
          <div className="flex flex-row gap-4">
            <button
              onClick={() => {
                setShowPast(false);
                setSelectedYear(currentYearKey);
              }}
              className={`font-milling text-xl px-[50px] py-[10px] border ${
                !showPast
                  ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                  : "bg-ch-lite text-ch-midnite border-ch-midnite"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => {
                setShowPast(true);
                setSelectedYear(null);
              }}
              className={`font-milling text-xl px-[87px] py-[10px] border ${
                showPast
                  ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                  : "bg-ch-lite text-ch-midnite border-ch-midnite"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {showPast && (
          <div className="flex flex-row flex-wrap gap-3">
            {yearOptions.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr === selectedYear ? null : yr)}
                className={`px-[10px] py-2 border font-milling text-xl ${
                  yr === selectedYear
                    ? "bg-ch-midnite text-ch-lite border-ch-midnite"
                    : "bg-transparent text-ch-midnite border-ch-midnite"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((artist) => (
            <Link
              key={artist._id}
              href={`/artists/${artist.slug.current}`}
              className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-ch-blue"
            >
              <SanityImage
                image={artist.image}
                className="w-full aspect-[3/2] object-cover rounded-[10px] border border-ch-midnite"
              />
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
      </div>
    </section>
  );
}
