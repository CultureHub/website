import TextBlock from "@/components/Article/blocks/TextBlock";
import PullQuoteBlock from "@/components/Article/blocks/PullQuoteBlock";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;

export default function ArticleBody({
  content,
}: {
  content: Content | null | undefined;
}) {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {content.map((block) => {
        switch (block._type) {
          case "articleText":
            return <TextBlock key={block._key} block={block} />;
          case "pullQuote":
            return <PullQuoteBlock key={block._key} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
