"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FilterMenu from "@/components/Filter/FilterMenu";
import type { GetArtistDirectoryQueryResult } from "@/sanity/types";

type ArtistRow = GetArtistDirectoryQueryResult[number];
type DirCategory = "letter" | "program" | "place";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CATEGORIES: { key: DirCategory; label: string }[] = [
  { key: "letter", label: "Letter" },
  { key: "program", label: "Program" },
  { key: "place", label: "Place" },
];

type Filters = Record<DirCategory, string | null>;

const EMPTY_FILTERS: Filters = { letter: null, program: null, place: null };

function letterOf(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function programLabels(artist: ArtistRow): string[] {
  return (artist.programs ?? [])
    .filter((p): p is { _id: string; shortLabel: string } =>
      Boolean(p?.shortLabel),
    )
    .map((p) => p.shortLabel);
}

function matches(artist: ArtistRow, filters: Filters): boolean {
  if (filters.letter && letterOf(artist.name) !== filters.letter) return false;
  if (filters.program && !programLabels(artist).includes(filters.program)) {
    return false;
  }
  if (filters.place && !(artist.locations ?? []).includes(filters.place)) {
    return false;
  }
  return true;
}

export default function ArtistDirectory({
  title,
  artists,
}: {
  title: string | null;
  artists: ArtistRow[];
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [activeCategory, setActiveCategory] = useState<DirCategory | null>(
    null,
  );

  const programOptions = useMemo(
    () =>
      Array.from(new Set(artists.flatMap((a) => programLabels(a)))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [artists],
  );

  const placeOptions = useMemo(
    () =>
      Array.from(new Set(artists.flatMap((a) => a.locations ?? []))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [artists],
  );

  function isLetterAvailable(letter: string): boolean {
    return artists.some(
      (a) =>
        letterOf(a.name) === letter && matches(a, { ...filters, letter: null }),
    );
  }

  function isProgramAvailable(program: string): boolean {
    return artists.some(
      (a) =>
        programLabels(a).includes(program) &&
        matches(a, { ...filters, program: null }),
    );
  }

  function isPlaceAvailable(place: string): boolean {
    return artists.some(
      (a) =>
        (a.locations ?? []).includes(place) &&
        matches(a, { ...filters, place: null }),
    );
  }

  const filtered = useMemo(
    () => artists.filter((a) => matches(a, filters)),
    [artists, filters],
  );

  const sections = useMemo(() => {
    const groups = new Map<string, ArtistRow[]>();
    for (const artist of filtered) {
      const letter = letterOf(artist.name);
      const existing = groups.get(letter);
      if (existing) existing.push(artist);
      else groups.set(letter, [artist]);
    }
    return ALPHABET.filter((l) => groups.has(l)).map((letter) => ({
      letter,
      artists: groups.get(letter)!,
    }));
  }, [filtered]);

  function showingLabel(): string {
    const parts = [filters.letter, filters.program, filters.place].filter(
      Boolean,
    ) as string[];
    if (parts.length === 0) return `Showing: All (${filtered.length})`;
    return `Showing: ${parts.join(", ")} (${filtered.length})`;
  }

  function getItems(category: DirCategory): {
    value: string;
    display: string;
    available: boolean;
  }[] {
    if (category === "letter") {
      return ALPHABET.map((l) => ({
        value: l,
        display: l,
        available: isLetterAvailable(l),
      }));
    }
    if (category === "program") {
      return programOptions.map((p) => ({
        value: p,
        display: p,
        available: isProgramAvailable(p),
      }));
    }
    return placeOptions.map((pl) => ({
      value: pl,
      display: pl,
      available: isPlaceAvailable(pl),
    }));
  }

  const handleToggleCategory = (key: DirCategory) => {
    setActiveCategory((prev) => (prev === key ? null : key));
  };

  const handleCloseCategories = () => setActiveCategory(null);

  const handleSelectItem = (category: DirCategory, value: string) => {
    setFilters((prev) => ({ ...prev, [category]: value }));
  };

  const handleRemoveFilter = (category: DirCategory) => {
    setFilters((prev) => ({ ...prev, [category]: null }));
  };

  const activeTags = CATEGORIES.filter((c) => filters[c.key]).map((c) => ({
    category: c.key,
    label: filters[c.key] as string,
  }));

  const renderItems = (category: DirCategory, mobile: boolean) => {
    return getItems(category).map((opt) => {
      const isSelected = filters[category] === opt.value;
      return (
        <button
          key={opt.value}
          disabled={!opt.available}
          onClick={() => opt.available && handleSelectItem(category, opt.value)}
          className={`text-left ${
            mobile ? "font-sans text-base" : "font-sans text-xl"
          } ${isSelected ? "font-bold tracking-[-0.02em]" : "font-thin"} ${
            opt.available
              ? "text-ch-midnite cursor-pointer"
              : mobile
                ? "text-[#989898] cursor-not-allowed"
                : "text-neutral-400 cursor-not-allowed"
          }`}
        >
          {opt.display}
        </button>
      );
    });
  };

  const scrollToLetter = (letter: string) => {
    document
      .getElementById(`directory-letter-${letter}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="artists" className="py-8">
      <div className="border-t border-ch-midnite pt-6">
        <FilterMenu<DirCategory>
          title={title || "Artist Directory"}
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onToggleCategory={handleToggleCategory}
          onClose={handleCloseCategories}
          showingLabel={showingLabel()}
          hideBottomBorder
          showBottomBorderWhenClosed={activeTags.length > 0}
          renderTags={(variant) =>
            variant === "desktop"
              ? activeTags.length > 0 && (
                  <div className="flex flex-col gap-[7px]">
                    {activeTags.map((tag) => (
                      <span
                        key={tag.category}
                        onClick={() => handleRemoveFilter(tag.category)}
                        className="inline-flex flex-row items-center gap-[5px] border border-ch-midnite px-[2px] py-[5px] self-start cursor-pointer"
                      >
                        <span className="font-sans font-thin text-[13px] leading-[13px] text-ch-midnite">
                          {tag.label}
                        </span>
                        <span className="font-sans font-thin text-[8px] text-ch-midnite w-[5px] h-[10px] flex items-center justify-center pointer-events-none">
                          x
                        </span>
                      </span>
                    ))}
                  </div>
                )
              : activeTags.length > 0 && (
                  <div className="flex flex-row flex-wrap gap-1.5 ml-auto">
                    {activeTags.map((tag) => (
                      <span
                        key={tag.category}
                        onClick={() => handleRemoveFilter(tag.category)}
                        className="inline-flex flex-row items-center gap-1 border-[0.5px] border-black px-1.5 py-0.5 cursor-pointer"
                      >
                        <span className="font-sans font-thin text-xs text-ch-midnite whitespace-pre-line">
                          {tag.label}
                        </span>
                        <span className="font-sans font-thin text-[10px] text-ch-midnite flex items-center justify-center pointer-events-none">
                          x
                        </span>
                      </span>
                    ))}
                  </div>
                )
          }
          renderDesktopItems={(category, hideBottomBorder) => (
            <div
              className={`flex flex-row flex-wrap gap-x-6 gap-y-0 py-4 border-t border-ch-midnite ${
                hideBottomBorder ? "" : "border-b"
              }`}
            >
              {renderItems(category, false)}
            </div>
          )}
          renderMobileItems={(category, hideBottomBorder) => (
            <div
              className={`flex flex-row flex-wrap px-6 py-4 border-black gap-x-6 gap-y-1 ${
                hideBottomBorder ? "" : "border-b"
              }`}
            >
              {renderItems(category, true)}
            </div>
          )}
        />
      </div>

      {/* Column header */}
      <div className="hidden md:flex flex-row border-b border-t border-black bg-ch-lite">
        <div className="w-[55px] shrink-0 h-[38px] flex items-center justify-center border-r border-black">
          <span className="font-sans font-thin text-sm">A-Z</span>
        </div>
        <div className="flex-1 grid grid-cols-[427px_453px_1fr]">
          <div className="h-[38px] flex items-center px-[10px] border-r border-black">
            <span className="font-sans font-thin text-sm">Person</span>
          </div>
          <div className="h-[38px] flex items-center px-[10px] border-r border-black">
            <span className="font-sans font-thin text-sm">Program</span>
          </div>
          <div className="h-[38px] flex items-center px-[10px]">
            <span className="font-sans font-thin text-sm">Location</span>
          </div>
        </div>
      </div>

      {/* Letter sections (internal scroll) */}
      <div className="overflow-y-auto max-h-[70vh] border-b border-black">
        {sections.map(({ letter, artists: rows }, sectionIdx) => (
          <div
            key={letter}
            id={`directory-letter-${letter}`}
            className="flex flex-row"
          >
            <button
              onClick={() => scrollToLetter(letter)}
              className="sticky top-0 self-start z-10 w-[55px] h-[61px] shrink-0 flex items-center justify-center bg-ch-lite border-b border-t border-black font-milling font-bold text-2xl"
            >
              {letter}
            </button>

            <div className="flex-1 min-w-0">
              {rows.map((artist, rowIdx) => {
                const isFirstRow = sectionIdx === 0 && rowIdx === 0;
                return (
                  <Link
                    key={artist._id}
                    href={`/artists/${artist.slug.current}`}
                    className={`grid h-[60px] grid-cols-[427px_453px_1fr] border-l border-black ${
                      isFirstRow ? "" : "border-t"
                    }`}
                  >
                    <div className="px-[10px] py-[10px] self-center">
                      <span className="font-sans font-normal text-xl tracking-[-0.02em]">
                        {artist.name}
                      </span>
                    </div>
                    <div className="px-[10px] py-[10px] self-center">
                      <span className="font-brook italic text-base leading-[14px]">
                        {programLabels(artist).join(", ")}
                      </span>
                    </div>
                    <div className="px-[10px] py-[10px] self-center">
                      <span className="font-brook italic text-base leading-[14px]">
                        {(artist.locations ?? []).join(", ")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        {filtered.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col gap-1 py-3 border-b border-black"
          >
            <span className="font-sans font-normal text-xl">{artist.name}</span>
            <span className="font-brook italic text-base text-ch-midnite/70">
              {[
                programLabels(artist).join(", "),
                (artist.locations ?? []).join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
