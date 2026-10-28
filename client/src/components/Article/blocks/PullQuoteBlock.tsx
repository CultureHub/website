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
      className={`mx-auto max-w-[1279px] px-16 text-center font-milling font-bold leading-tight tracking-[-0.03em] ${
        isLarge ? "text-[48px]" : "text-[32px]"
      }`}
    >
      {block.text}
    </blockquote>
  );
}
