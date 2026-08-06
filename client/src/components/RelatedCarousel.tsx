import { Carousel } from "@/components/Carousel";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { GetProjectBySlugQueryResult } from "@/sanity/types";

type ProjectRelated = NonNullable<
  NonNullable<GetProjectBySlugQueryResult>["related"]
>;

type RelatedCarouselProps = {
  related: ProjectRelated;
};

export default function RelatedCarousel({ related }: RelatedCarouselProps) {
  if (!related || related.length === 0) return null;

  return (
    <Carousel>
      {related
        .filter((item) => item.title)
        .map((item) => (
          <Link
            key={item._id}
            href={
              item._type === "project"
                ? `/projects/${item.slug ?? ""}`
                : `/artists/${item.slug ?? ""}`
            }
            className="flex flex-col gap-4.5"
          >
            <div className="flex flex-row items-center gap-4.5">
              <span className="w-[10px] h-[10px] rounded-full bg-ch-midnite shrink-0" />
              <span className="font-brook text-base uppercase">
                {item._type === "project" ? "PROJECT" : "ARTIST"}
              </span>
            </div>
            <span className="font-milling text-2xl">{item.title}</span>
            <SanityImage
              image={item.image}
              className="w-full h-[423px] object-cover border border-ch-midnite rounded-[20px]"
            />
          </Link>
        ))}
    </Carousel>
  );
}
