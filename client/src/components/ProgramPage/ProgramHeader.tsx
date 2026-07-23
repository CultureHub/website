import { PortableText } from "next-sanity";
import Breadcrumbs from "@/components/Breadcrumbs";
import SanityImage from "@/components/SanityImage";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type Program = NonNullable<GetProgramBySlugQueryResult>;

interface ProgramHeaderProps {
  program: Program;
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  return (
    <section className="px-6 md:px-16 py-9">
      <Breadcrumbs
        buttons={[
          { label: "Art & Technology", href: "/art-and-technology" },
          { label: program.shortLabel, children: program.title },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
        <div className="flex flex-col gap-6 max-w-[500px]">
          <h1 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
            {program.title}
          </h1>
          {program.pageDescription && (
            <div className="font-milling text-2xl font-light">
              <PortableText value={program.pageDescription} />
            </div>
          )}
        </div>

        {program.jumpToButtons && program.jumpToButtons.length > 0 && (
          <div className="flex flex-row items-center gap-4">
            {program.jumpToButtons.map((btn) => (
              <a
                key={btn._key}
                href={
                  btn.anchor ? `#${btn.anchor.replace(/^#/, "")}` : undefined
                }
                className="inline-flex px-[10px] py-[5px] border border-ch-midnite rounded-[20px] bg-ch-lite font-milling text-xl"
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {program.heroImage && (
        <div className="mt-9">
          <SanityImage
            image={program.heroImage}
            className="w-full rounded-[20px] border border-ch-midnite"
          />
          {program.heroImage.credits && (
            <p className="text-right font-brook italic text-sm text-[#ACACAC] mt-2">
              {program.heroImage.credits}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
