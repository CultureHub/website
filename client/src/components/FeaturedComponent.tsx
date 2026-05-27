"use client";

import { PortableText } from "next-sanity";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SanityImage from "@/components/SanityImage";
import { Program } from "@/sanity/types";

function CarouselContent({
  program,
  accentColor,
}: {
  program: Program;
  accentColor: string | undefined;
}) {
  const [rotationOffset, setRotationOffset] = useState(0);

  const originalImages = [program.heroImage, ...program.thumbnails];
  const images = [
    ...originalImages.slice(rotationOffset),
    ...originalImages.slice(0, rotationOffset),
  ];
  const activeImage = images[0];

  const handleThumbClick = (index: number) => {
    const advance = index === 0 ? 1 : index;
    setRotationOffset((prev) => (prev + advance) % originalImages.length);
  };

  return (
    <div className="flex">
      <div
        className="grow basis-0 h-[670px] flex flex-col bg-ch-midnite"
        style={{ borderRight: `1px solid var(--color-ch-midnite)` }}
      >
        <div className="flex-1 relative overflow-hidden">
          <SanityImage image={activeImage} fill objectFit="cover" />
        </div>
        <div className="px-4 py-[10px] flex gap-4">
          {images.slice(1).map((img, i) => (
            <button
              key={img._type === "thumbnail" ? img._key : "hero"}
              onClick={() => handleThumbClick(i + 1)}
              className="relative flex-1 h-[124px] overflow-hidden cursor-pointer focus:outline-none border-2"
              style={{ borderColor: accentColor }}
              aria-label={`View image ${i + 2}`}
            >
              <SanityImage image={img} fill objectFit="cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="grow basis-0 flex flex-col px-8 py-12">
        <h2 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em] mb-6 text-ch-midnite">
          {program.displayTitle ? (
            <PortableText value={program.displayTitle} />
          ) : (
            program.title
          )}
        </h2>
        <p className="font-milling font-normal text-[28px] leading-snug mb-6 text-ch-midnite">
          {program.description}
        </p>
        <Link
          href={`/projects?program=${encodeURIComponent(program.slug.current)}`}
          className="font-milling font-bold text-[24px] underline underline-offset-2 text-ch-midnite"
        >
          Explore→
        </Link>
        <p className="font-brook italic text-[14px] mt-auto text-ch-midnite">
          {activeImage.credits}
        </p>
      </div>
    </div>
  );
}

function TabBar({
  programs,
  activeProgram,
  onSelect,
}: {
  programs: Program[];
  activeProgram: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-end gap-4">
      {programs.map((program) => {
        const accentColor = program.accentColor;

        return (
          <button
            key={program.slug.current}
            onClick={() => onSelect(program.slug.current)}
            className={`
              inline-flex items-center justify-center gap-2.5
              font-milling text-[20px] font-normal leading-none
              rounded-t-[20px]
              border border-b-0
              cursor-pointer px-4 py-5
              text-ch-midnite border-ch-midnite
            `}
            style={{
              backgroundColor: accentColor,
            }}
          >
            {program.slug.current === "re-fest" && (
              <Image
                src="/refest_icon.svg"
                width={30}
                height={20}
                alt="Re-Fest Icon"
              />
            )}
            {program.slug.current === "experiments-in-digital-storytelling" && (
              <Image
                src="/eds_icon.svg"
                width={21}
                height={23}
                alt="Experiments in Digital Storytelling Icon"
              />
            )}
            {program.slug.current === "residency" && (
              <Image
                src="/residency_icon.svg"
                width={24}
                height={22}
                alt="Residency Icon"
              />
            )}
            <span>{program.title}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FeaturedClient({ programs }: { programs: Program[] }) {
  const [activeProgram, setActiveProgram] = useState<string>(
    programs[0].slug.current,
  );

  const program = programs.find((p) => p.slug.current === activeProgram);
  if (!program) return null;
  const accentColor = program.accentColor;

  return (
    <section className="w-full mx-auto">
      <TabBar
        activeProgram={activeProgram}
        onSelect={setActiveProgram}
        programs={programs}
      />

      <div
        className="w-full border border-ch-midnite rounded-b-[5px]"
        style={{ backgroundColor: accentColor }}
      >
        <CarouselContent
          key={activeProgram}
          program={program}
          accentColor={accentColor}
        />
      </div>
    </section>
  );
}
