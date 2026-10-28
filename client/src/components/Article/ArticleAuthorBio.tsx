import Button from "@/components/Button";
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
    <section className="px-16">
      <h2 className="border-b border-t border-ch-midnite py-6 font-milling font-bold text-2xl">
        About the Author
      </h2>
      <div className="flex flex-col gap-8 py-8 md:flex-row md:gap-13">
        <div className="flex w-[355px] max-w-full shrink-0 flex-col gap-2.5">
          {author.photo ? (
            <SanityImage image={author.photo} className="h-auto w-full" />
          ) : null}
          {author.website && websiteLabel ? (
            <Button
              variant="rounded"
              href={author.website}
              openNewTab
              hoverColor="ch-read-lilac"
              className="p-[5px] self-start"
            >
              <div className="font-normal underline leading-6">
                {websiteLabel}
              </div>
            </Button>
          ) : null}
        </div>
        {author.bio || author.note ? (
          <div className="flex flex-col gap-9">
            {author.bio ? (
              <div className="font-milling text-2xl leading-10 tracking-[-0.02em]">
                <PortableText value={author.bio} />
              </div>
            ) : null}
            {author.note ? (
              <div className="font-milling font-thin italic text-2xl leading-10">
                <PortableText value={author.note} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
