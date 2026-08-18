"use client";

import { useState } from "react";
import { PortableText } from "@/components/PortableText";
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
            className={`cursor-pointer mr-4 md:mr-8 px-3 md:px-4 py-3 md:py-6 font-brook text-2xl md:text-[28px] uppercase border border-ch-midnite rounded-t-[20px] whitespace-normal text-left max-w-[183px] md:max-w-none ${
              i === activeIndex ? "border-b-0" : "border-b"
            }`}
            style={{
              backgroundColor: tab.accentColor || "#B5FD8B",
            }}
          >
            {tab.displayTitle}
          </button>
        ))}
        <div className="flex-1 border-b border-ch-midnite" />
      </div>

      {active && (
        <div
          className="p-9 border -mt-[1px] border-ch-midnite rounded-b-[10px]"
          style={{ backgroundColor: active.accentColor || "#B5FD8B" }}
        >
          <div className="max-w-[975px] flex flex-col gap-8 font-milling text-xl leading-[1.7] [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
            {active.description && <PortableText value={active.description} />}
          </div>
        </div>
      )}
    </section>
  );
}
