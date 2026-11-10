import type { ArticleSummary, FeaturedArticle } from "@/sanity/editorial-types";

export function makeArticle(
  overrides: Partial<ArticleSummary> = {},
): ArticleSummary {
  return {
    _id: "article-a",
    title: "An article",
    slug: "an-article",
    publishDate: "2026-07-28",
    authorName: "Scribble",
    articleType: "Interview",
    heroImage: null,
    ...overrides,
  };
}

export function makeFeature(
  overrides: Partial<FeaturedArticle> = {},
): FeaturedArticle {
  return {
    ...makeArticle(),
    _key: "feature-a",
    previewMode: "text",
    previewText: "These are the opening words.",
    ...overrides,
  };
}

export function makeArchiveAcrossYears(): ArticleSummary[] {
  return [
    makeArticle({ _id: "2026", title: "2026 article", slug: "2026-article" }),
    makeArticle({
      _id: "2025",
      title: "2025 article",
      slug: "2025-article",
      publishDate: "2025-12-31",
    }),
  ];
}
