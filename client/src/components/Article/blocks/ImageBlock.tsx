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
  alignLeft: "pl-16 w-[958px] max-w-full",
  alignRight: "ml-auto mr-16 w-[958px] max-w-full",
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
        <figcaption className="text-right font-brook italic text-2xl">
          {block.image.credits}
        </figcaption>
      ) : null}
    </figure>
  );
}
