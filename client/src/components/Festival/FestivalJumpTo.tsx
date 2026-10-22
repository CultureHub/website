"use client";

import { useEffect, useState } from "react";
import { festivalNavItems } from "@/util/festival";
import type { FestivalTemplateData } from "@/sanity/queries";

export function FestivalJumpTo({
  festival,
}: {
  festival: FestivalTemplateData;
}) {
  const navItems = festivalNavItems(festival.locations ?? []);
  const anchorKey = navItems.map((item) => item.anchor).join("|");
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    const anchors = anchorKey.split("|").filter(Boolean);

    const updateActive = () => {
      const current = anchors
        .map((anchor) => document.getElementById(anchor))
        .filter((element): element is HTMLElement => Boolean(element))
        .filter((element) => element.getBoundingClientRect().top <= 166)
        .at(-1);

      setActiveAnchor(current?.id ?? null);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [anchorKey]);

  return (
    <nav className="sticky top-[61px] z-40 bg-ch-lite border-b border-ch-midnite">
      <h1 className="sr-only">
        {festival.title} — Re–Fest {festival.year}
      </h1>
      <div className="px-6 md:px-16 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="font-schoolbook text-[38px] leading-none text-rf-metal">
            {festival.year}
          </span>
          <span className="font-new-edge font-semibold text-4xl tracking-[-0.02em] text-rf-metal">
            {festival.title}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {navItems.map((item) => {
            const active = activeAnchor === item.anchor;
            return (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setActiveAnchor(item.anchor)}
                className={`inline-flex h-[34px] w-[172px] items-center justify-center rounded-[5px] border px-2.5 pt-[5px] font-new-edge text-xl uppercase transition-colors ${
                  active
                    ? "border-rf-blue-smoke bg-rf-midnight text-rf-blue-smoke"
                    : "border-rf-metal bg-rf-blue-smoke text-rf-metal"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
