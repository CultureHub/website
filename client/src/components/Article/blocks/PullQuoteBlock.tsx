import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type PullQuoteBlockType = Extract<
  Content[number],
  { _type: "pullQuote" }
>;

export default function PullQuoteBlock({
  block,
}: {
  block: PullQuoteBlockType;
}) {
  const isLarge = block.size === "large";

  return (
    <blockquote
      className={`font-miller italic text-center leading-10 ${
        isLarge ? "text-5xl" : "text-[32px]"
      }`}
    >
      {block.text}
    </blockquote>
  );
}
