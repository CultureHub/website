import { Carousel } from "@/components/Carousel";
import MobileProjectsCarousel from "@/components/ProgramPage/MobileProjectsCarousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { getProjectPeopleOrNull } from "@/util/project-people";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type FeaturedProject = NonNullable<
  NonNullable<GetProgramBySlugQueryResult>["featuredProjects"]
>[number];

interface FeaturedProjectsProps {
  title: string;
  projects: FeaturedProject[];
}

export default function FeaturedProjects({
  title,
  projects,
}: FeaturedProjectsProps) {
  return (
    <section id="projects" className="px-6 md:px-16 pb-9">
      <div className="border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>

      <div className="hidden md:block">
        <Carousel>
          {projects.map((p) => {
            const artistNames = getProjectPeopleOrNull(p);
            return (
              <Link
                key={p._id}
                href={`/projects/${p.slug.current}`}
                className="flex flex-col gap-4.5"
              >
                <SanityImage
                  image={p.heroImage}
                  className="w-full h-[423px] object-cover border border-ch-midnite"
                />
                <div className="flex justify-between items-center">
                  <span className="font-milling text-2xl">{p.title}</span>
                  {artistNames && (
                    <span className="font-milling font-thin text-xl text-right">
                      {artistNames}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </Carousel>
      </div>

      <div className="md:hidden">
        <MobileProjectsCarousel projects={projects} />
      </div>
    </section>
  );
}
