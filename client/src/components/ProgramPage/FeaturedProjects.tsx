import { Carousel, type CarouselItem } from "@/components/Carousel";

interface FeaturedProjectsProps {
  title: string;
  projects: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    heroImage: {
      asset?: { _id: string; url: string } | null;
      alt?: string | null;
    } | null;
    people?: string | null;
  }>;
}

export default function FeaturedProjects({
  title,
  projects,
}: FeaturedProjectsProps) {
  const items: CarouselItem[] = projects.map((p) => ({
    _key: p._id,
    title: p.title,
    image: p.heroImage as never,
    href: `/projects/${p.slug.current}`,
    subtitle: p.people || undefined,
  }));

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>
      <Carousel items={items} />
    </section>
  );
}
