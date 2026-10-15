import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { PortableText } from "@/components/PortableText";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;

export default function ArticleAuthorBio({
  author,
}: {
  author: Article["author"];
}) {
  if (!author) return null;

  const websiteLabel = author.website
    ? author.website.replace(/^https?:\/\//, "")
    : null;

  return (
    <section className="border-t border-ch-midnite pt-8">
      <h2 className="font-milling text-2xl">About the Author</h2>
      <div className="mt-8 flex flex-col gap-8 md:flex-row md:gap-13">
        <div className="flex w-[355px] max-w-full shrink-0 flex-col gap-2.5">
          {author.photo ? (
            <SanityImage image={author.photo} className="h-auto w-full" />
          ) : null}
          {author.name ? (
            <div className="font-brook text-2xl">{author.name}</div>
          ) : null}
          {author.website && websiteLabel ? (
            <Link
              href={author.website}
              className="font-brook text-base underline"
            >
              {websiteLabel}
            </Link>
          ) : null}
        </div>
        {author.bio ? (
          <div className="font-miller text-2xl leading-10">
            <PortableText value={author.bio} />
          </div>
        ) : null}
        {author.note ? (
          <div className="font-milling italic text-2xl leading-10">
            <PortableText value={author.note} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
