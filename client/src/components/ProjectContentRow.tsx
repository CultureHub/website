import { PortableText } from "@/components/PortableText";

import { Project } from "@/sanity/types";
import SanityImage from "@/components/SanityImage";

type ProjectContent = NonNullable<Project["content"]>[number];
type ProjectContentRowProps = {
  content: ProjectContent;
};

export default function ProjectContentRow({ content }: ProjectContentRowProps) {
  const imageClassName = "w-full md:rounded-[20px]";
  const textClassName =
    "mx-6 md:mx-0 flex-1 md:self-end text-[20px] md:text-[28px] font-thin leading-tight";
  switch (content._type) {
    case "singleImage": {
      return <SanityImage className={imageClassName} image={content.image} />;
    }
    case "imageAndText": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <SanityImage className={imageClassName} image={content.image} />
          </div>
          <div className={textClassName}>
            {content.text && <PortableText value={content.text} />}
          </div>
        </div>
      );
    }
    case "textAndImage": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className={textClassName}>
            {content.text && <PortableText value={content.text} />}
          </div>
          <div className="flex-1">
            <SanityImage className={imageClassName} image={content.image} />
          </div>
        </div>
      );
    }
    case "twoImages": {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative aspect-[3/2]">
            <SanityImage
              className="md:rounded-[20px]"
              image={content.image1}
              fill
              objectFit="cover"
            />
          </div>
          <div className="flex-1 relative aspect-[3/2]">
            <SanityImage
              className="md:rounded-[20px]"
              image={content.image2}
              fill
              objectFit="cover"
            />
          </div>
        </div>
      );
    }
  }
}
