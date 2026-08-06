import { Carousel, type CarouselItem } from "@/components/Carousel";
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
  const items: CarouselItem[] = projects
    .filter((p) => p.title)
    .map((p) => {
      const artistNames = getProjectPeopleOrNull(p);
      return {
        _key: p._id,
        title: p.title,
        image: p.heroImage,
        href: `/projects/${p.slug.current}`,
        subtitle: artistNames ? (
          <span className="font-milling font-thin text-xl text-right">
            {artistNames}
          </span>
        ) : undefined,
      };
    });

  return (
    <section id="projects" className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>
      <Carousel items={items} />
    </section>
  );
}
