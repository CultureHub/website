import Image from "next/image";

import MediaTagIcon from "@/components/MediaTagIcon";
import SanityImage from "@/components/SanityImage";
import { GetProjectBySlugQueryResult } from "@/sanity/types";

type ProjectRelated = NonNullable<
  NonNullable<GetProjectBySlugQueryResult>["related"]
>;
type RelatedSliderProps = {
  related: ProjectRelated;
};

export default function RelatedSlider({ related }: RelatedSliderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-10 px-8">
      <button className="-mr-8">
        <Image width="15" height="26" src="/left_arrow.svg" alt="Left arrow" />
      </button>
      {related.slice(0, 2).map((item) => (
        <div key={item._id} className="flex-1 flex flex-col gap-4.5">
          <div className="flex flex-row gap-4.5 text-base font-normal font-brook uppercase">
            <MediaTagIcon type={item._type} />
            <h4>{item._type}</h4>
          </div>
          <div className="text-2xl font-normal font-milling">{item.title}</div>
          <SanityImage image={item.image} />
        </div>
      ))}
      <button className="-ml-8">
        <Image
          width="15"
          height="26"
          src="/right_arrow.svg"
          alt="Right arrow"
        />
      </button>
    </div>
  );
}
