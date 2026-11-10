import type { Metadata } from "next";
import { getReadData } from "@/sanity/editorial-data";
import EditorialHeader from "@/components/Editorial/EditorialHeader";
import FeaturedArticles from "@/components/Editorial/FeaturedArticles";
import ArticleIndex from "@/components/Editorial/ArticleIndex";

export const metadata: Metadata = {
  title: "Read | CultureHub",
  description:
    "Articles, interviews, reviews, and reflections from CultureHub.",
};

export default async function ReadPage() {
  const data = await getReadData();
  return (
    <main className="min-h-screen pb-9">
      <EditorialHeader heading={data.heading} mode="read" />
      <div className="flex flex-col gap-16 pt-9">
        <FeaturedArticles items={data.featured} />
        <ArticleIndex title={data.articleIndexTitle} articles={data.articles} />
      </div>
    </main>
  );
}
