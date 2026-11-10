import type { GetArticleIndexQueryResult } from "@/sanity/types";

export type EditorialMode = "read" | "watch";
export type EditorialImage = NonNullable<
  GetArticleIndexQueryResult[number]["heroImage"]
>;

export type ArticleSummary = {
  _id: string;
  title: string;
  slug: string;
  publishDate: string;
  authorName: string | null;
  articleType: string | null;
  heroImage: EditorialImage | null;
};

export type FeaturedArticle = ArticleSummary & {
  _key: string;
  previewMode: "image" | "text";
  previewText: string;
};

export type ReadData = {
  heading: string;
  articleIndexTitle: string;
  featured: FeaturedArticle[];
  articles: ArticleSummary[];
};
