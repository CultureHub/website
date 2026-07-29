import { PortableText } from "next-sanity";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type Program = NonNullable<GetProgramBySlugQueryResult>;

interface ProgramHeaderProps {
  program: Program;
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  const jumpToButtons: { label: string; anchor: string }[] = [];
  if (program.featuredProjects && program.featuredProjects.length > 0) {
    jumpToButtons.push({ label: "Projects", anchor: "projects" });
  }
  if (program.featuredArtists && program.featuredArtists.length > 0) {
    jumpToButtons.push({ label: "Artists", anchor: "artists" });
  }
  if (program.openCallTitle) {
    jumpToButtons.push({ label: "Open Call", anchor: "open-call" });
  }

  return (
    <section className="px-6 md:px-16 pt-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-ch-midnite">
        <div className="flex flex-col gap-6">
          <h1 className="font-milling font-bold text-[40px] leading-tight tracking-[-0.02em]">
            {program.title}
          </h1>
          {jumpToButtons.length > 0 && (
            <div className="flex flex-row items-center gap-4">
              {jumpToButtons.map((btn) => (
                <a
                  key={btn.anchor}
                  href={`#${btn.anchor}`}
                  className="inline-flex px-[10px] py-[5px] border border-ch-midnite rounded-[20px] bg-ch-lite font-milling text-xl"
                >
                  {btn.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {program.pageDescription && (
          <div className="max-w-[614px] font-milling text-2xl font-light">
            <PortableText value={program.pageDescription} />
          </div>
        )}
      </div>
    </section>
  );
}
