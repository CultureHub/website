"use client";

import { PortableText } from "@/components/PortableText";
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
    <>
      <div className="flex flex-col md:hidden">
        <div className="px-8 py-6" style={{ backgroundColor: accentColor }}>
          <h2 className="font-milling font-bold text-[36px] leading-[42px] tracking-[-0.02em] text-ch-midnite">
            {program.displayTitle ? (
              <PortableText value={program.displayTitle} />
            ) : (
              program.title
            )}
          </h2>
        </div>

        <div className="w-full h-[525px] relative overflow-hidden bg-ch-midnite">
          <SanityImage image={activeImage} fill objectFit="cover" />
        </div>

        <p
          className="font-brook italic text-[14px] bg-ch-midnite px-6 py-8"
          style={{ color: accentColor }}
        >
          {activeImage.credits}
        </p>

        <div className="bg-ch-midnite px-4 pb-4 overflow-x-auto flex gap-3 scrollbar-none">
          {images.slice(1).map((img, i) => (
            <button
              key={img._type === "thumbnail" ? img._key : "hero"}
              onClick={() => handleThumbClick(i + 1)}
              className="relative flex-shrink-0 w-[190px] h-[114px] overflow-hidden cursor-pointer focus:outline-none border-2"
              style={{ borderColor: accentColor }}
              aria-label={`View image ${i + 2}`}
            >
              <SanityImage image={img} fill objectFit="cover" />
            </button>
          ))}
        </div>

        <div
          className="px-6 py-6 flex flex-col gap-6"
          style={{ backgroundColor: accentColor }}
        >
          <p className="font-milling font-thin text-[24px] leading-snug text-ch-midnite">
            {program.description}
          </p>
          <Link
            href={`/art-and-technology?program=${encodeURIComponent(program.slug.current)}`}
            className="font-milling font-bold text-[24px] underline underline-offset-2 text-ch-midnite"
          >
            Explore→
          </Link>
        </div>
      </div>

      <div className="hidden md:flex">
        <div
          className="grow basis-0 min-w-0 h-[670px] flex flex-col bg-ch-midnite"
          style={{ borderRight: `1px solid var(--color-ch-midnite)` }}
        >
          <div className="flex-1 relative overflow-hidden">
            <SanityImage image={activeImage} fill objectFit="cover" />
          </div>
          <div className="px-4 py-[10px] overflow-x-auto flex gap-4 scrollbar-none">
            {images.slice(1).map((img, i) => (
              <button
                key={img._type === "thumbnail" ? img._key : "hero"}
                onClick={() => handleThumbClick(i + 1)}
                className="relative flex-shrink-0 w-[190px] h-[124px] overflow-hidden cursor-pointer focus:outline-none border-2"
                style={{ borderColor: accentColor }}
                aria-label={`View image ${i + 2}`}
              >
                <SanityImage image={img} fill objectFit="cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="grow basis-0 min-w-0 flex flex-col px-8 py-12">
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
            href={`/art-and-technology?program=${encodeURIComponent(program.slug.current)}`}
            className="font-milling font-bold text-[24px] underline underline-offset-2 text-ch-midnite"
          >
            Explore→
          </Link>
          <p className="font-brook italic text-[14px] mt-auto text-ch-midnite">
            {activeImage.credits}
          </p>
        </div>
      </div>
    </>
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
    <div className="flex items-end justify-center md:justify-start gap-4">
      {programs.map((program, index) => {
        const accentColor = program.accentColor;
        const isLast = index === programs.length - 1;

        return (
          <button
            key={program.slug.current}
            onClick={() => onSelect(program.slug.current)}
            className={`
              inline-flex items-center justify-center gap-2.5
              font-milling text-[20px] font-normal leading-none
              rounded-t-[20px]
              border border-b-0
              cursor-pointer
              w-[122px] h-[50px] md:w-auto md:h-auto flex-shrink-0
              px-4 py-5
              text-ch-midnite border-ch-midnite
              ${program.slug.current === activeProgram ? "-mb-px relative z-10" : ""}
              ${isLast && program.slug.current === activeProgram ? "md:-mb-px md:relative md:z-10 md:pb-[21px]" : "md:mb-0 md:static md:z-auto"}
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
            <span className="hidden md:inline">{program.title}</span>
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
    <section className="w-full md:px-8">
      <TabBar
        activeProgram={activeProgram}
        onSelect={setActiveProgram}
        programs={programs}
      />

      <div
        className="w-full border-y border-solid border-ch-midnite md:border md:border-ch-midnite"
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
