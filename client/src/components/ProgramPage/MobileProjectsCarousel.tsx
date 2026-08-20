"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { getProjectPeopleOrNull } from "@/util/project-people";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type FeaturedProject = NonNullable<
  NonNullable<GetProgramBySlugQueryResult>["featuredProjects"]
>[number];

interface MobileProjectsCarouselProps {
  projects: FeaturedProject[];
}

export default function MobileProjectsCarousel({
  projects,
}: MobileProjectsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, projects.length);
  }, [projects]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current || index < 0 || index >= projects.length) return;
      const el = itemRefs.current[index];
      if (!el) return;
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setCurrentIndex(index);
    },
    [projects.length],
  );

  const handlePrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < projects.length - 1) scrollToIndex(currentIndex + 1);
  };

  return (
    <div
      ref={scrollRef}
      className="flex flex-row gap-10 overflow-x-auto w-full scroll-smooth"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {projects.map((p, index) => {
        const artistNames = getProjectPeopleOrNull(p);
        return (
          <div
            key={p._id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="flex-shrink-0 w-full flex flex-col items-center gap-3"
          >
            <Link
              href={`/projects/${p.slug.current}`}
              className="w-full flex flex-col items-center gap-3"
            >
              <SanityImage
                image={p.heroImage}
                className="w-full aspect-[5/6] object-cover border border-ch-midnite"
              />
            </Link>
            <div className="flex flex-row items-center justify-center gap-[15px] w-full">
              <button
                onClick={handlePrev}
                aria-label="Previous project"
                className="flex-shrink-0"
              >
                <svg
                  width="14"
                  height="27"
                  viewBox="0 0 14 27"
                  className="text-ch-midnite"
                >
                  <polygon
                    points="14,0 0,13.5 14,27"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </button>
              <div className="flex flex-col items-center py-2.5 px-[5px] gap-[5px] rounded-[10px] min-w-0 flex-1">
                <span className="font-milling text-2xl text-center">
                  {p.title}
                </span>
                {artistNames && (
                  <span className="font-milling text-xl text-center">
                    {artistNames}
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                aria-label="Next project"
                className="flex-shrink-0"
              >
                <svg
                  width="14"
                  height="27"
                  viewBox="0 0 14 27"
                  className="text-ch-midnite"
                >
                  <polygon
                    points="0,0 14,13.5 0,27"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
