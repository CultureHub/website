import SanityImage from "@/components/SanityImage";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type ImagePairBlockType = Extract<
  Content[number],
  { _type: "imagePair" }
>;

export default function ImagePairBlock({
  block,
}: {
  block: ImagePairBlockType;
}) {
  if (!block.image1.asset && !block.image2.asset) return null;

  return (
    <div className="flex flex-row gap-4">
      {block.image1.asset ? (
        <div className="w-1/2">
          <SanityImage
            image={block.image1}
            objectFit="cover"
            className="h-auto w-full"
          />
        </div>
      ) : null}
      {block.image2.asset ? (
        <div className="w-1/2">
          <SanityImage
            image={block.image2}
            objectFit="cover"
            className="h-auto w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
