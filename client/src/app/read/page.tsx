import type { Metadata } from "next";
import Link from "next/link";
import { getReadData } from "@/sanity/editorial-data";
import EditorialHeader from "@/components/Editorial/EditorialHeader";
import FeaturedArticles from "@/components/Editorial/FeaturedArticles";
import ArticleIndex from "@/components/Editorial/ArticleIndex";

export const metadata: Metadata = {
  title: "Read | CultureHub",
  description:
    "Articles, interviews, reviews, and reflections from CultureHub.",
};

export default async function ReadPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string | string[] }>;
} = {}) {
  const designPreview =
    process.env.NODE_ENV === "development" &&
    (await searchParams)?.preview === "design";
  const data = designPreview
    ? (await import("@/fixtures/editorial-design")).readDesignPreview
    : await getReadData();
  return (
    <main className="min-h-screen pb-9">
      <EditorialHeader heading={data.heading} mode="read" />
      {designPreview && (
        <aside
          aria-label="Design preview"
          className="mx-6 border border-ch-midnite bg-ch-read-lilac p-3 text-sm md:mx-16"
        >
          Design placeholders from Figma, with sample imagery. No Sanity content
          has changed. Article links open sample published articles.{" "}
          <Link href="/read" className="underline">
            View published content
          </Link>
        </aside>
      )}
      <div className="flex flex-col gap-16 pt-9">
        <FeaturedArticles items={data.featured} />
        <ArticleIndex title={data.articleIndexTitle} articles={data.articles} />
      </div>
    </main>
  );
}
