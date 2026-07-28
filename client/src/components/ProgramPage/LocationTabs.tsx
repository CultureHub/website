"use client";

import { useState } from "react";
import { PortableText } from "next-sanity";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type LocationTab = NonNullable<
  NonNullable<GetProgramBySlugQueryResult>["locationContent"]
>[number];

interface LocationTabsProps {
  locations: LocationTab[];
}

export default function LocationTabs({ locations }: LocationTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = locations[activeIndex];

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="flex flex-row">
        {locations.map((tab, i) => (
          <button
            key={tab._key ?? i}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-6 font-brook text-[28px] uppercase border border-ch-midnite rounded-t-[20px] ${
              i === activeIndex ? "border-b-0" : "border-b"
            }`}
            style={{
              backgroundColor:
                i === activeIndex ? tab.accentColor || "#B5FD8B" : "#F2FBFD",
            }}
          >
            {tab.displayTitle}
          </button>
        ))}
        <div className="flex-1 border-b border-ch-midnite" />
      </div>

      {active && (
        <div
          className="p-9 border border-t-0 border-ch-midnite"
          style={{ backgroundColor: active.accentColor || "#B5FD8B" }}
        >
          <div className="max-w-[975px] flex flex-col gap-8">
            {active.description && (
              <div className="font-milling text-xl">
                <PortableText value={active.description} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
