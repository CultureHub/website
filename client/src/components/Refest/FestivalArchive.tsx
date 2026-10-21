"use client";

import { useState } from "react";
import FestivalArchiveRow from "@/components/Refest/FestivalArchiveRow";
import FestivalSummary from "@/components/Refest/FestivalSummary";
import type { FestivalArchiveItem } from "@/sanity/queries";

export default function FestivalArchive({
  festivals,
}: {
  festivals: FestivalArchiveItem[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const preview =
    festivals.find((festival) => festival._id === hoveredId) ??
    festivals[0] ??
    null;

  return (
    <div className="flex flex-col border-l border-ch-midnite md:grid md:grid-cols-[671fr_641fr]">
      <div className="flex min-w-0 flex-col">
        {festivals.map((festival) => (
          <FestivalArchiveRow
            key={festival._id}
            festival={festival}
            selected={festival._id === preview?._id}
            onHover={() => setHoveredId(festival._id)}
          />
        ))}
      </div>

      <div className="hidden md:grid min-w-0 border-l border-ch-midnite">
        {festivals.map((festival) => {
          const active = festival._id === preview?._id;
          return (
            <div
              key={festival._id}
              data-testid={`festival-preview-${festival.slug}`}
              data-active={active}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 ${active ? "" : "invisible"}`}
            >
              <FestivalSummary festival={festival} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
