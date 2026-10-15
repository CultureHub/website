import SanityImage from "@/components/SanityImage";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type ImageBlockType = Extract<
  Content[number],
  { _type: "articleImage" }
>;

const LAYOUT_CLASSES: Record<NonNullable<ImageBlockType["layout"]>, string> = {
  fullBleed: "w-full",
  full: "w-full",
  alignLeft: "w-[958px] max-w-full",
  alignRight: "w-[958px] max-w-full self-end",
};

export default function ImageBlock({ block }: { block: ImageBlockType }) {
  if (!block.image?.asset) return null;

  const layoutClass = LAYOUT_CLASSES[block.layout ?? "full"];

  return (
    <figure className={layoutClass}>
      <SanityImage
        image={block.image}
        objectFit="cover"
        className="h-auto w-full"
      />
      {block.image.credits ? (
        <figcaption className="font-brook italic text-2xl">
          {block.image.credits}
        </figcaption>
      ) : null}
    </figure>
  );
}
