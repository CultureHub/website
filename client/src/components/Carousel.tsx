"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import SanityImage from "@/components/SanityImage";
import MediaTagIcon from "@/components/MediaTagIcon";
import type { MediaTagType } from "@/components/MediaTagIcon";

export interface CarouselItem {
  _key?: string;
  title: string | null;
  image: {
    asset?: { _ref: string; _type: string } | null;
    alt?: string | null;
    hotspot?: { x: number; y: number; width: number; height: number } | null;
    crop?: { top: number; bottom: number; left: number; right: number } | null;
    [key: string]: unknown;
  } | null;
  href?: string;
  type?: string;
  subtitle?: ReactNode;
}

interface CarouselProps {
  items: CarouselItem[];
}

export function Carousel({ items }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const gap = 40;

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  useEffect(() => {
    const el = itemRefs.current[0];
    if (el) setItemWidth(el.offsetWidth + gap);
  }, [items.length, gap]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current || index < 0 || index >= items.length) return;
      const scrollPosition = index * itemWidth;
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
      setCurrentIndex(index);
    },
    [itemWidth, items.length],
  );

  const handlePrev = () => {
    const newIndex =
      currentIndex - 1 < 0 ? Math.max(0, items.length - 1) : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
    scrollToIndex(newIndex);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-row gap-10 items-center">
      <button
        onClick={handlePrev}
        className="absolute left-10 z-10 hidden md:block"
        aria-label="Previous items"
      >
        <Image width="15" height="26" src="/left_arrow.svg" alt="Left arrow" />
      </button>

      <div
        ref={scrollRef}
        className="flex flex-col md:flex-row gap-10 w-full overflow-hidden scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => {
          const inner = (
            <div
              key={item._key ?? index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="w-full md:flex-shrink-0 md:w-[calc(50%_-_20px)] flex flex-col gap-4.5"
            >
              {item.type && (
                <div className="flex flex-row gap-4.5 text-base font-normal font-brook uppercase">
                  <MediaTagIcon type={item.type as MediaTagType} />
                  <h4>{item.type}</h4>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="text-2xl font-normal font-milling">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="font-brook text-base uppercase text-right opacity-60">
                    {item.subtitle}
                  </div>
                )}
              </div>
              {item.image && (
                <SanityImage className="rounded-[20px]" image={item.image} />
              )}
            </div>
          );

          if (item.href) {
            return (
              <Link key={item._key ?? index} href={item.href} className="block">
                {inner}
              </Link>
            );
          }

          return inner;
        })}
      </div>

      <button
        onClick={handleNext}
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
