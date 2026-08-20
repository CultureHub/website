"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";

export interface CarouselProps {
  children: ReactNode;
}

export function Carousel({ children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [itemWidth, setItemWidth] = useState(0);
  const gap = 40;

  useEffect(() => {
    const el = itemRefs.current[0];
    if (el) {
      setItemWidth(el.offsetWidth + gap);
    }
  }, [gap]);

  const scrollBy = useCallback(
    (direction: "prev" | "next") => {
      if (!scrollRef.current) return;
      const scrollAmount = direction === "prev" ? -itemWidth : itemWidth;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    },
    [itemWidth],
  );

  return (
    <div className="flex flex-row items-center">
      <button
        onClick={() => scrollBy("prev")}
        className="absolute left-10 z-10 hidden md:block"
        aria-label="Previous items"
      >
        <Image width="15" height="26" src="/left_arrow.svg" alt="Left arrow" />
      </button>

      <div
        ref={scrollRef}
        className="flex flex-col md:flex-row w-full overflow-hidden scroll-smooth"
        style={{
          gap: `${gap}px`,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div
                key={index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="w-full md:flex-shrink-0 md:w-[calc(50%_-_20px)]"
              >
                {child}
              </div>
            ))
          : children}
      </div>

      <button
        onClick={() => scrollBy("next")}
        className="absolute right-10 z-10 hidden md:block"
        aria-label="Next items"
      >
        <Image
          width="15"
          height="26"
          src="/right_arrow.svg"
          alt="Right arrow"
        />
      </button>
    </div>
  );
}
