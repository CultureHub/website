"use client";

import { useState, useEffect, useRef } from "react";
import { PortableText } from "next-sanity";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type Program = NonNullable<GetProgramBySlugQueryResult>;

interface ProgramHeaderProps {
  program: Program;
  hasArtists?: boolean;
}

export default function ProgramHeader({
  program,
  hasArtists = false,
}: ProgramHeaderProps) {
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

  const jumpToButtons: { label: string; anchor: string }[] = [];
  if (program.featuredProjects && program.featuredProjects.length > 0) {
    jumpToButtons.push({ label: "Projects", anchor: "projects" });
  }
  if (hasArtists) {
    jumpToButtons.push({ label: "Artists", anchor: "artists" });
  }
  if (program.openCallTitle) {
    jumpToButtons.push({ label: "Open Call", anchor: "open-call" });
  }

  const buttonRow =
    jumpToButtons.length > 0 ? (
      <div className="relative inline-flex items-center">
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-ch-midnite" />
        <div className="relative flex flex-row gap-4">
          {jumpToButtons.map((btn) => (
            <a
              key={btn.anchor}
              href={`#${btn.anchor}`}
              className="inline-flex px-[5px] md:px-[10px] py-[5px] border border-ch-midnite rounded-[20px] bg-ch-lite font-milling text-xl"
            >
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    ) : null;

  const titleBlock = program.displayTitle ? (
    <div className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
      <PortableText value={program.displayTitle} />
    </div>
  ) : (
    <h1 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
      {program.title}
    </h1>
  );

  return (
    <>
      <section ref={headerRef} className="px-6 md:px-16 pt-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-ch-midnite">
          <div className="flex flex-col gap-6 items-start">
            {titleBlock}
            {buttonRow}
          </div>

          {program.pageDescription && (
            <div className="max-w-[614px] font-milling text-2xl font-light">
              <PortableText value={program.pageDescription} />
            </div>
          )}
        </div>
      </section>

      <section
        className="px-6 md:px-16 sticky top-[61px] z-40 bg-ch-lite border-b border-ch-midnite"
        style={
          isScrolled
            ? { animation: "fade-in 0.15s ease-in-out forwards" }
            : { opacity: 0, pointerEvents: "none" }
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
