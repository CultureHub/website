"use client";

import { useState, useEffect, useRef } from "react";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;

const JUMP_TO = [
  { label: "Artists", anchor: "artists" },
  { label: "Opportunities", anchor: "opportunities" },
  { label: "Support", anchor: "support" },
];

export default function CommunityHeader({
  heading,
  introText,
}: {
  heading: CommunityPage["heading"];
  introText: CommunityPage["introText"];
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { rootMargin: "-61px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleBlock = (
    <h1 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
      {heading || "Community"}
    </h1>
  );

  const buttonRow = (
    <div className="relative inline-flex items-center">
      <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-ch-midnite" />
      <div className="relative flex flex-row gap-4">
        {JUMP_TO.map((btn) => (
          <a
            key={btn.anchor}
            href={`#${btn.anchor}`}
            className="inline-flex justify-center items-center px-[10px] py-[5px] md:w-[156px] rounded-tr-[10px] rounded-bl-[10px] border border-ch-midnite bg-ch-lite text-ch-midnite font-milling text-xl transition-colors hover:bg-ch-bb"
          >
            {btn.label}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section ref={headerRef} className="px-6 md:px-16 pt-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-ch-midnite">
          <div className="flex flex-col gap-9 items-start">
            {titleBlock}
            {buttonRow}
          </div>

          {introText && (
            <p className="font-sans font-thin text-2xl leading-snug text-ch-midnite md:max-w-[616px]">
              {introText}
            </p>
          )}
        </div>
      </section>

      <section
        className={`px-6 md:px-16 sticky top-[61px] z-40 bg-ch-lite border-b border-ch-midnite ${
          isScrolled ? "" : "hidden"
        }`}
        style={
          isScrolled
            ? { animation: "fade-in 0.15s ease-in-out forwards" }
            : undefined
        }
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 py-4">
          {titleBlock}
          {buttonRow}
        </div>
      </section>
    </>
  );
}
