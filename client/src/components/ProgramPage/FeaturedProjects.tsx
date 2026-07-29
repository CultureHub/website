import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
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
    <section id="projects" className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>
      <Carousel>
        {projects.map((p) => (
          <Link
            key={p._id}
            href={`/projects/${p.slug.current}`}
            className="flex flex-col gap-4.5"
          >
            <div className="flex justify-between items-center">
              <span className="font-milling text-2xl">{p.title}</span>
              {p.people && (
                <span className="font-brook text-base uppercase opacity-60 text-right">
                  {p.people}
                </span>
              )}
            </div>
            <SanityImage
              image={p.heroImage}
              className="w-full h-[423px] object-cover border border-ch-midnite"
            />
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
