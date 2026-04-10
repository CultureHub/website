import { PortableText } from "next-sanity";

import { Project } from "@/sanity/types";
import SanityImage from "@/components/SanityImage";

type ProjectContent = NonNullable<Project["content"]>[number];
type ProjectContentRowProps = {
  content: ProjectContent;
};

export default function ProjectContentRow({ content }: ProjectContentRowProps) {
  switch (content._type) {
    case "singleImage": {
      return <SanityImage image={content.image} />;
    }
    case "imageAndText": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <SanityImage image={content.image} />
          </div>
          <div className="flex-1 md:self-end text-[20px] md:text-[28px] font-thin">
            {content.text && <PortableText value={content.text} />}
          </div>
        </div>
      );
    }
    case "textAndImage": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 md:self-end text-[20px] md:text-[28px] font-thin">
            {content.text && <PortableText value={content.text} />}
          </div>
          <div className="flex-1">
            <SanityImage image={content.image} />
          </div>
        </div>
      );
    }
    case "twoImages": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <SanityImage image={content.image1} />
          </div>
          <div className="flex-1">
            <SanityImage image={content.image2} />
          </div>
        </div>
      );
    }
  }
}
