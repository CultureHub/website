import Breadcrumbs from "@/components/Breadcrumbs";
import SanityImage from "@/components/SanityImage";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;

function formatPublishDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="flex flex-col">
      <div className="mb-[85px] px-16 pt-8">
        <Breadcrumbs buttons={[{ label: "Editorial" }, { label: "Read" }]} />
      </div>
      <div className="flex flex-col items-center gap-[46px] px-16 pb-[128px] text-center">
        <div className="font-brook text-2xl">
          {formatPublishDate(article.publishDate)}
        </div>
        <h1 className="break-words font-milling font-extrabold text-[44px] leading-[1.05] tracking-[-0.03em] md:text-[80px] lg:text-[128px]">
          {article.title}
        </h1>
        {article.deck ? (
          <p className="break-words font-miller italic text-[24px] md:text-[36px]">
            {article.deck}
          </p>
        ) : null}
        {article.byline ? (
          <p className="font-brook italic text-[32px]">{article.byline}</p>
        ) : null}
      </div>
      {article.heroImage ? (
        <figure className="w-full">
          <SanityImage
            image={article.heroImage}
            className="h-auto w-full object-cover"
          />
          {article.heroImage.credits ? (
            <figcaption className="mt-2.5 pr-16 text-right font-brook italic text-2xl">
              {article.heroImage.credits}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </header>
  );
}
