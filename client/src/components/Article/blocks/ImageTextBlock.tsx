import SanityImage from "@/components/SanityImage";
import { PortableText } from "@/components/PortableText";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type ImageTextBlockType = Extract<
  Content[number],
  { _type: "imageText" }
>;

export default function ImageTextBlock({
  block,
}: {
  block: ImageTextBlockType;
}) {
  const hasImage = !!block.image?.asset;
  const hasText = !!block.text && block.text.length > 0;
  if (!hasImage && !hasText) return null;

  const position = block.imagePosition ?? "left";

  return (
    <div
      className={`flex flex-col gap-9 ${
        position === "right" ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {hasImage ? (
        <div className="md:w-1/2">
          <SanityImage
            image={block.image}
            objectFit="cover"
            className="h-auto w-full"
          />
        </div>
      ) : null}
      {hasText ? (
        <div className="font-miller md:w-1/2">
          <PortableText value={block.text} />
        </div>
      ) : null}
    </div>
  );
}
