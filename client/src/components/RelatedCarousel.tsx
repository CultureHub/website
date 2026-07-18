import { Carousel, type CarouselItem } from "@/components/Carousel";
import type { GetProjectBySlugQueryResult } from "@/sanity/types";

type ProjectRelated = NonNullable<
  NonNullable<GetProjectBySlugQueryResult>["related"]
>;

type RelatedCarouselProps = {
  related: ProjectRelated;
};

export default function RelatedCarousel({ related }: RelatedCarouselProps) {
  if (!related || related.length === 0) return null;

  const items: CarouselItem[] = related
    .map((item) => ({
      _key: item._id,
      title: item.title ?? "",
      image: item.image,
      type: item._type ?? undefined,
      href:
        item._type === "project"
          ? `/projects/${item.slug ?? ""}`
          : item._type === "artist"
            ? `/artists/${item.slug ?? ""}`
            : undefined,
    }))
    .filter((item) => item.title);

  return <Carousel items={items} />;
}
