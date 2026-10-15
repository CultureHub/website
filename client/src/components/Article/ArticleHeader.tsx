import Breadcrumbs from "@/components/Breadcrumbs";
import SanityImage from "@/components/SanityImage";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;

function formatLongDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return `${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}.${String(year).slice(-2)}`;
}

function Credit({ credits }: { credits: string | null }) {
  if (!credits) return null;
  return <p className="font-brook italic text-2xl">{credits}</p>;
}

export default function ArticleHeader({ article }: { article: Article }) {
  const layout = article.headerLayout ?? "centered";
  const breadcrumb = (
    <Breadcrumbs buttons={[{ label: "Editorial" }, { label: "Read" }]} />
  );

  if (layout === "split") {
    return (
      <header className="flex flex-col gap-8 md:flex-row md:justify-between">
        <div className="flex flex-col gap-4 md:w-[411px]">
          {breadcrumb}
          <div className="font-brook text-2xl">
            {formatShortDate(article.publishDate)}
          </div>
          <h1 className="break-words font-milling font-bold text-[32px] leading-[1.1] tracking-[-0.03em] md:text-[52px]">
            {article.title}
          </h1>
          {article.deck ? (
            <p className="break-words font-miller italic text-2xl">
              {article.deck}
            </p>
          ) : null}
          {article.byline ? (
            <p className="font-brook text-2xl">{article.byline}</p>
          ) : null}
        </div>
        {article.heroImage ? (
          <figure className="md:w-[1029px] md:max-w-[70%]">
            <SanityImage
              image={article.heroImage}
              className="h-auto w-full object-cover"
            />
            <Credit credits={article.heroImage.credits} />
          </figure>
        ) : null}
      </header>
    );
  }

  if (layout === "splitTall") {
    return (
      <header className="flex flex-col gap-8 md:flex-row md:items-center md:gap-9">
        <div className="flex flex-col gap-9 md:w-[663px]">
          {breadcrumb}
          <div className="font-brook text-2xl">
            {formatLongDate(article.publishDate)}
          </div>
          <h1 className="break-words font-milling font-bold text-[40px] leading-[1.05] tracking-[-0.03em] md:text-[64px] lg:text-[96px]">
            {article.title}
          </h1>
          {article.deck ? (
            <p className="break-words font-miller italic text-[24px] md:text-[36px]">
              {article.deck}
            </p>
          ) : null}
          {article.byline ? (
            <p className="font-brook text-2xl">{article.byline}</p>
          ) : null}
        </div>
        {article.heroImage ? (
          <figure className="md:w-[707px] md:max-w-[49%]">
            <SanityImage
              image={article.heroImage}
              className="h-auto w-full object-cover"
            />
            <Credit credits={article.heroImage.credits} />
          </figure>
        ) : null}
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-6">
      {breadcrumb}
      <div className="flex flex-col items-center gap-[46px] text-center">
        <div className="font-brook text-2xl">
          {formatLongDate(article.publishDate)}
        </div>
        <h1 className="break-words font-milling font-bold text-[44px] leading-[1.05] tracking-[-0.03em] md:text-[80px] lg:text-[128px]">
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
        <figure>
          <SanityImage
            image={article.heroImage}
            className="h-auto w-full object-cover"
          />
          <Credit credits={article.heroImage.credits} />
        </figure>
      ) : null}
    </header>
  );
}
