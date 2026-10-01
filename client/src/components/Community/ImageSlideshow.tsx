"use client";

import { useEffect, useState } from "react";
import SanityImage from "@/components/SanityImage";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type Slide = NonNullable<CommunityPage["supportImages"]>[number];

export default function ImageSlideshow({ images }: { images: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearTimeout(id);
  }, [index, images.length]);

  if (images.length === 0) return null;

  const current = images[index];
  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-row items-center gap-4 w-full max-w-[1312px]">
      {hasMultiple && (
        <button
          onClick={() =>
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          className="flex-shrink-0 cursor-pointer text-ch-bb"
          aria-label="Previous image"
        >
          <svg
            width="15"
            height="26"
            viewBox="0 0 15 26"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M1.72911e-07 12.5571L14.25 -0.000240156L14.25 25.1145L1.72911e-07 12.5571Z" />
          </svg>
        </button>
      )}

      <div className="relative flex-1 min-w-0 h-[320px] md:h-[586px] border-[5px] border-ch-bb overflow-hidden">
        {current.asset && (
          <SanityImage
            image={current}
            fill
            objectFit="cover"
            className="object-cover"
          />
        )}
      </div>

      {hasMultiple && (
        <button
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          className="flex-shrink-0 cursor-pointer text-ch-bb"
          aria-label="Next image"
        >
          <svg
            width="15"
            height="26"
            viewBox="0 0 15 26"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M14.25 12.5571L-1.18272e-06 25.1145L-8.49151e-08 -0.000239995L14.25 12.5571Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
