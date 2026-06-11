"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Queries from "@/sanity/queries";
import type { ProjectFilters } from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import type {
  GetProjectsQueryResult,
  GetProjectFilterOptionsQueryResult,
  GetProjectFacetsQueryResult,
} from "@/sanity/types";

type ProgramOption = GetProjectFilterOptionsQueryResult["programs"][number];

export type ProjectRow = GetProjectsQueryResult["projects"][number];

type ProjectsListProps = {
  initialData: GetProjectsQueryResult;
  allPrograms: ProgramOption[];
  allPlaces: string[];
  allYears: string[];
  pageSize?: number;
};

type Facets = Omit<GetProjectFacetsQueryResult, "programSlugs"> & {
  programSlugs: string[];
};

function formatDate(dateStr: string, endDateStr?: string | null): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(2);

  if (endDateStr && endDateStr !== dateStr) {
    const ed = new Date(endDateStr + "T00:00:00Z");
    const emm = String(ed.getUTCMonth() + 1).padStart(2, "0");
    const edd = String(ed.getUTCDate()).padStart(2, "0");
    const eyy = String(ed.getUTCFullYear()).slice(2);
    return `${mm}.${dd}.${yy} -\n${emm}.${edd}.${eyy}`;
  }
  return `${mm}.${dd}.${yy}`;
}

const FILTER_CATEGORIES = ["program", "place", "year"] as const;
type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export default function ProjectsList({
  initialData,
  allPrograms,
  allPlaces,
  allYears,
  pageSize = 20,
}: ProjectsListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [projects, setProjects] = useState<ProjectRow[]>(initialData.projects);
  const [total, setTotal] = useState<number>(initialData.total);
  const [offset, setOffset] = useState(pageSize);
  const [hasMore, setHasMore] = useState(initialData.total > pageSize);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(
    null,
  );
  const [rowState, setRowState] = useState<{
    id: string;
    type: "hover" | "pressed";
  } | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const loadingRef = useRef(false);
  loadingRef.current = loading;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchActiveRef = useRef(0);

  const loadProjects = useCallback(
    async (newFilters: ProjectFilters, reset: boolean) => {
      const id = ++fetchActiveRef.current;
      setLoading(true);

      try {
        const currentOffset = reset ? 0 : offsetRef.current;
        const result = await Queries.getProjects(
          newFilters,
          pageSize,
          currentOffset,
        );
        if (id !== fetchActiveRef.current) return;

        setProjects((prev) =>
          reset ? result.projects : [...prev, ...result.projects],
        );
        setTotal(result.total);
        const newOffset = currentOffset + pageSize;
        setOffset(newOffset);
        setHasMore(newOffset < result.total);
        setFilters(newFilters);
      } finally {
        if (id === fetchActiveRef.current) {
          setLoading(false);
        }
      }
    },
    [pageSize],
  );

  const loadFacets = useCallback(async (f: ProjectFilters) => {
    const hasActiveFilter = f.program || f.place || f.year;
    if (!hasActiveFilter) {
      setFacets(null);
      return;
    }
    const result = await Queries.getProjectFacets(f);
    setFacets(result);
  }, []);

  useEffect(() => {
    if (filters.program || filters.place || filters.year) {
      loadFacets(filters);
    } else {
      setFacets(null);
    }
  }, [filters, loadFacets]);

  const handleFilterChange = useCallback(
    (category: keyof ProjectFilters, value: string) => {
      const newFilters = { ...filters, [category]: value || undefined };
      setOffset(0);
      setHasMore(true);
      loadProjects(newFilters, true);
    },
    [filters, loadProjects],
  );

  const handleRemoveFilter = useCallback(
    (category: keyof ProjectFilters) => {
      const newFilters = { ...filters, [category]: undefined };
      setOffset(0);
      setHasMore(true);
      loadProjects(newFilters, true);
    },
    [filters, loadProjects],
  );

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadProjects(filtersRef.current, false);
  }, [loadProjects]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      ) {
        setActiveCategory(null);
      }
    }
    if (activeCategory) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCategory]);

  function isOptionAvailable(category: string, value: string): boolean {
    if (!facets) return true;
    if (category === "program") return facets.programSlugs.includes(value);
    if (category === "place") return facets.places.includes(value);
    if (category === "year")
      return facets.dates.some((d) => d.slice(0, 4) === value);
    return true;
  }

  function getFilterDisplayValue(
    category: keyof ProjectFilters,
  ): string | null {
    const val = filters[category];
    if (!val) return null;
    if (category === "program") {
      const prog = allPrograms.find((p) => p.slug.current === val);
      return prog?.shortLabel || val;
    }
    return val;
  }

  function getShowingLabel(): string {
    const parts: string[] = [];
    if (filters.program) {
      parts.push(getFilterDisplayValue("program")!);
    }
    if (filters.place) {
      if (parts.length > 0) parts.push("in");
      parts.push(filters.place);
    }
    if (filters.year) {
      if (parts.length > 0) parts.push("in");
      parts.push(filters.year);
    }
    if (parts.length === 0) {
      return `Showing: All (${total})`;
    }
    return `Showing: ${parts.join(" ")} (${total})`;
  }

  function getActiveTag(): { category: keyof ProjectFilters; label: string }[] {
    const tags: { category: keyof ProjectFilters; label: string }[] = [];
    for (const cat of FILTER_CATEGORIES) {
      const val = getFilterDisplayValue(cat);
      if (val) {
        tags.push({ category: cat, label: val });
      }
    }
    return tags;
  }

  const filterOptions: {
    key: FilterCategory;
    label: string;
    options: { value: string; display: string }[];
  }[] = [
    {
      key: "program",
      label: "Program",
      options: allPrograms.map((p) => ({
        value: p.slug.current,
        display: p.shortLabel,
      })),
    },
    {
      key: "place",
      label: "Place",
      options: allPlaces.map((p) => ({ value: p, display: p })),
    },
    {
      key: "year",
      label: "Year",
      options: allYears.map((y) => ({ value: y, display: y })),
    },
  ];

  const activeFilterOptions = filterOptions.find(
    (f) => f.key === activeCategory,
  );

  const handleRowClick = useCallback(
    (slug: string) => {
      router.push(`/projects/${slug}`);
    },
    [router],
  );

  const activeTags = getActiveTag();

  return (
    <div>
      <div ref={filterBarRef} className="flex flex-row justify-between px-3">
        <div className="flex flex-col gap-4 w-[210px]">
          <span className="font-sans font-thin text-xl text-ch-midnite">
            Work Index
          </span>
          <span className="font-sans font-thin text-base text-neutral-400">
            Filter by
          </span>
          {activeTags.length > 0 && (
            <div className="flex flex-row flex-wrap gap-[7px]">
              {activeTags.map((tag) => (
                <span
                  key={tag.category}
                  className="inline-flex flex-row items-center gap-[5px] border border-ch-midnite px-[2px] py-[5px]"
                >
                  <span className="font-sans font-thin text-[13px] leading-[13px] text-ch-midnite">
                    {tag.label}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(tag.category)}
                    className="font-sans font-thin text-[8px] text-ch-midnite w-[5px] h-[10px] flex items-center justify-center"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col pt-[42px] flex-1">
          <div
            className={`flex flex-row justify-between items-center ${
              activeCategory ? "" : "border-b border-ch-midnite"
            }`}
          >
            <div className="flex flex-row items-center">
              {filterOptions.map(({ key, label }, idx) => {
                const isFirst = idx === 0;
                const isLast = key === "year";
                const rightPad = isFirst
                  ? "pr-[50px]"
                  : isLast
                    ? "pr-[87px]"
                    : "pr-[81px]";
                const leftPad = isFirst ? "pl-[10px]" : "pl-3";
                return (
                  <button
                    key={key}
                    onClick={() =>
                      setActiveCategory(activeCategory === key ? null : key)
                    }
                    className={`font-sans font-thin text-xl ${leftPad} ${rightPad} py-[10px] border-t border-ch-midnite border-l ${
                      isLast ? "border-r" : ""
                    } ${
                      activeCategory === key
                        ? "bg-ch-midnite text-ch-lite"
                        : "bg-transparent text-ch-midnite"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <span className="font-sans font-thin text-base text-neutral-400">
              {getShowingLabel()}
            </span>
          </div>

          {activeCategory && activeFilterOptions && (
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-0 py-4 border-t border-b border-ch-midnite">
              {activeFilterOptions.options.map((opt) => {
                const isSelected = filters[activeCategory] === opt.value;
                const available = isOptionAvailable(activeCategory, opt.value);
                return (
                  <button
                    key={opt.value}
                    className={`${
                      isSelected
                        ? "font-sans font-bold text-xl tracking-[-0.02em]"
                        : "font-sans font-thin text-xl"
                    } ${
                      available
                        ? "text-ch-midnite hover:text-ch-midnite/70"
                        : "text-neutral-400 cursor-not-allowed"
                    }`}
                    disabled={!available}
                    onClick={() =>
                      available && handleFilterChange(activeCategory, opt.value)
                    }
                  >
                    {opt.display}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto px-3">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[210px]" />
            <col className="w-[112px]" />
            <col className="w-[198px]" />
            <col className="w-[109px]" />
            <col />
            <col className="w-[290px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ch-midnite bg-ch-lite">
              <th className="border-r border-ch-midnite" />
              <th className="border-r border-ch-midnite px-2 py-1.5 text-left font-sans font-thin text-sm text-ch-midnite">
                Date
              </th>
              <th className="border-r border-ch-midnite px-2 py-1.5 text-left font-sans font-thin text-sm text-ch-midnite">
                Program
              </th>
              <th className="border-r border-ch-midnite px-2 py-1.5 text-left font-sans font-thin text-sm text-ch-midnite">
                Place
              </th>
              <th className="border-r border-ch-midnite px-2 py-1.5 text-left font-sans font-thin text-sm text-ch-midnite">
                Project
              </th>
              <th className="px-2 py-1.5 text-left font-sans font-thin text-sm text-ch-midnite">
                People
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isHovered =
                rowState?.id === project._id && rowState?.type === "hover";
              const isPressed =
                rowState?.id === project._id && rowState?.type === "pressed";
              const accentColor = project.program.accentColor;

              return (
                <tr
                  key={project._id}
                  onClick={() => handleRowClick(project.slug.current)}
                  onMouseEnter={() =>
                    setRowState({ id: project._id, type: "hover" })
                  }
                  onMouseLeave={() => setRowState(null)}
                  onMouseDown={() =>
                    setRowState({ id: project._id, type: "pressed" })
                  }
                  onMouseUp={() =>
                    setRowState({ id: project._id, type: "hover" })
                  }
                  style={
                    {
                      backgroundColor: isPressed
                        ? "#0A0018"
                        : isHovered
                          ? accentColor
                          : undefined,
                      borderBottomColor: isPressed ? accentColor : undefined,
                      "--row-accent": accentColor,
                      "--row-text": isPressed ? accentColor : "#0A0018",
                    } as React.CSSProperties
                  }
                  className="border-b border-ch-midnite cursor-pointer group"
                >
                  <td className="px-0">
                    <div className="w-[210px] h-[116px] relative overflow-hidden">
                      {project.heroImage ? (
                        <SanityImage
                          image={project.heroImage}
                          className="object-cover"
                          width={210}
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: accentColor,
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 align-top">
                    <span
                      className="font-mono text-xs leading-tight whitespace-pre-line"
                      style={{ color: "var(--row-text)" }}
                    >
                      {formatDate(project.date, project.endDate)}
                    </span>
                  </td>
                  <td className="px-4 align-top">
                    <span
                      className="font-mono italic text-xs"
                      style={{ color: "var(--row-text)" }}
                    >
                      {project.program.shortLabel}
                    </span>
                  </td>
                  <td className="px-4 align-top">
                    <span
                      className="font-mono text-xs uppercase"
                      style={{ color: "var(--row-text)" }}
                    >
                      {project.locations?.[0] || ""}
                    </span>
                  </td>
                  <td className="px-4">
                    <p
                      className="font-sans font-normal text-2xl leading-tight tracking-[-0.04em] group-hover:underline underline-offset-10"
                      style={{ color: "var(--row-text)" }}
                    >
                      {project.title}
                    </p>
                  </td>
                  <td className="px-4">
                    <span
                      className="font-sans font-thin text-base tracking-[-0.02em]"
                      style={{ color: "var(--row-text)" }}
                    >
                      {project.artists?.map((a) => a.name).join(", ") || ""}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="text-center py-4 text-neutral-400 text-sm">
          Loading...
        </div>
      )}
      {projects.length === 0 && !loading && (
        <div className="text-center py-8 text-neutral-400 text-sm">
          No projects found.
        </div>
      )}
    </div>
  );
}
