// Server route assembly: pass only the normalized records to client components.
import { getArticleIndex, getReadPage } from "@/sanity/queries";
import type { GetArticleIndexQueryResult } from "@/sanity/types";
import type {
  ArticleSummary,
  FeaturedArticle,
  ReadData,
} from "@/sanity/editorial-types";
import { articleYear } from "@/util/editorial";
import { openingText, truncateWords } from "../../../shared/editorial/content";

function summary(
  source: GetArticleIndexQueryResult[number] | null | undefined,
): ArticleSummary | null {
  if (
    !source ||
    source._id.startsWith("drafts.") ||
    !source.title?.trim() ||
    !source.slug?.trim() ||
    !source.publishDate ||
    !articleYear(source.publishDate)
  )
    return null;
  const typeNames: Record<string, string> = {
    review: "Review",
    reflection: "Reflection",
    interview: "Interview",
  };
  return {
    _id: source._id,
    title: source.title.trim(),
    slug: source.slug.trim(),
    publishDate: source.publishDate,
    authorName: source.authorName?.trim() || source.byline?.trim() || null,
    articleType: source.articleType
      ? (typeNames[source.articleType] ?? source.articleType)
      : null,
    heroImage: source.heroImage?.asset?._ref ? source.heroImage : null,
  };
}

export async function getReadData(): Promise<ReadData> {
  const page = await getReadPage();
  const featured: FeaturedArticle[] = [];
  const selected = new Set<string>();
  for (const entry of page?.featuredArticles ?? []) {
    const article = summary(entry.article);
    if (!article || selected.has(article._id) || featured.length === 3)
      continue;
    selected.add(article._id);
    const count = entry.previewWordCount;
    const limit =
      typeof count === "number" &&
      Number.isInteger(count) &&
      count >= 10 &&
      count <= 150
        ? count
        : 80;
    featured.push({
      ...article,
      _key: entry._key || article._id,
      previewMode: entry.previewMode === "image" ? "image" : "text",
      previewText: truncateWords(openingText(entry.article?.content), limit),
    });
  }
  const records = await getArticleIndex([...selected]);
  const articles = records
    .map(summary)
    .filter(
      (article): article is ArticleSummary =>
        !!article && !selected.has(article._id),
    );
  return {
    heading: page?.heading?.trim() || "Editorial",
    articleIndexTitle: page?.articleIndexTitle?.trim() || "Article Index",
    featured,
    articles,
  };
}
