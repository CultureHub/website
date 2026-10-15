import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/sanity/queries";
import ArticleHeader from "@/components/Article/ArticleHeader";
import ArticleBody from "@/components/Article/ArticleBody";
import ArticleAuthorBio from "@/components/Article/ArticleAuthorBio";
import ReadMore from "@/components/Article/ReadMore";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-24 py-16">
        <ArticleHeader article={article} />
        <ArticleBody content={article.content} />
        <ArticleAuthorBio author={article.author} />
        <ReadMore items={article.readMore} />
      </div>
    </main>
  );
}
