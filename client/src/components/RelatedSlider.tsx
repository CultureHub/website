"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import MediaTagIcon from "@/components/MediaTagIcon";
import SanityImage from "@/components/SanityImage";
import { GetProjectBySlugQueryResult } from "@/sanity/types";

type ProjectRelated = NonNullable<
  NonNullable<GetProjectBySlugQueryResult>["related"]
>;
type RelatedCarouselProps = {
  related: ProjectRelated;
};

export default function RelatedCarousel({ related }: RelatedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, related.length);
  }, [related]);

  // If there are no related items, return null
  if (!related || related.length === 0) {
    return null;
  }

  const scrollToIndex = (index: number) => {
    if (containerRef.current && itemRefs.current[index]) {
      const container = containerRef.current;
      const item = itemRefs.current[index];

      // Calculate scroll position
      const itemWidth = item.offsetWidth;
      const gap = 40; // gap-10 = 2.5rem = 40px
      const scrollPosition = index * (itemWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    console.log(currentIndex);
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      // Loop back to the end, showing the last 2 items
      newIndex = Math.max(0, related.length - 1);
    }
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    let newIndex = currentIndex + 1;
    if (newIndex >= related.length) {
      // Loop back to the beginning
      newIndex = 0;
    }
    scrollToIndex(newIndex);
  };

  return (
    <>
      {/* Desktop view with scrollable carousel */}
      <div className="flex flex-row gap-10 px-8 items-center">
        <button
          onClick={handlePrevious}
          className="absolute left-8 z-10 hidden md:block"
          aria-label="Previous related items"
        >
          <Image
            width="15"
            height="26"
            src="/left_arrow.svg"
            alt="Left arrow"
          />
        </button>

        <div
          ref={containerRef}
          className="flex flex-col md:flex-row gap-10 w-full overflow-hidden scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {related.map((item, index) => (
            <div
              key={item._id + index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="w-full md:flex-shrink-0 md:w-[calc(50%_-_20px)] border-box flex flex-col gap-4.5"
            >
              <div className="flex flex-row gap-4.5 text-base font-normal font-brook uppercase">
                <MediaTagIcon type={item._type} />
                <h4>{item._type}</h4>
              </div>
              <div className="text-2xl font-normal font-milling">
                {item.title}
              </div>
              <SanityImage image={item.image} />
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-8 z-10 hidden md:block"
          aria-label="Next related items"
        >
          <Image
            width="15"
            height="26"
            src="/right_arrow.svg"
            alt="Right arrow"
          />
        </button>
      </div>

      {/* Mobile view - vertical layout with all items */}
      <div className="hidden flex-col gap-10 px-8">
        {related.map((item, index) => (
          <div key={item._id + index} className="flex flex-col gap-4.5">
            <div className="flex flex-row gap-4.5 text-base font-normal font-brook uppercase">
              <MediaTagIcon type={item._type} />
              <h4>{item._type}</h4>
            </div>
            <div className="text-2xl font-normal font-milling">
              {item.title}
            </div>
            <SanityImage image={item.image} />
          </div>
        ))}
      </div>
    </>
  );
}
