"use client";

import { useState } from "react";
import Image from "next/image";
import SanityImage from "@/components/SanityImage";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type Slide = NonNullable<CommunityPage["supportImages"]>[number];

export default function ImageSlideshow({ images }: { images: Slide[] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const current = images[index];
  const hasMultiple = images.length > 1;

  return (
    <div className="relative w-full max-w-[1312px]">
      <div className="relative w-full h-[320px] md:h-[586px] border-[5px] border-ch-bb overflow-hidden">
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
        <>
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2"
            aria-label="Previous image"
          >
            <Image
              width="15"
              height="26"
              src="/left_arrow.svg"
              alt="Left arrow"
            />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            aria-label="Next image"
          >
            <Image
              width="15"
              height="26"
              src="/right_arrow.svg"
              alt="Right arrow"
            />
          </button>
        </>
      )}
    </div>
  );
}
