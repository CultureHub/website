import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import MediaTagIcon from "@/components/MediaTagIcon";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;
type ReadMoreItem = NonNullable<NonNullable<Article["readMore"]>[number]>;

function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return `${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}.${String(year).slice(-2)}`;
}

export default function ReadMore({ items }: { items: Article["readMore"] }) {
  const valid = (items ?? []).filter(
    (item): item is ReadMoreItem => !!item && !!item.slug,
  );
  if (valid.length === 0) return null;

  return (
    <section className="px-16">
      <h2 className="border-t border-ch-midnite py-6 font-milling font-bold text-2xl">
        Read More
      </h2>
      <div className="mt-[21px] flex flex-col md:flex-row">
        {valid.map((item, i) => (
          <Link
            key={item._id}
            href={`/read/${item.slug}`}
            className={`group relative flex h-[600px] w-[437px] max-w-full flex-col justify-between border border-ch-midnite bg-ch-lite p-6 ${
              i > 0 ? "-mt-px md:mt-0 md:-ml-px" : ""
            }`}
          >
            {item.heroImage ? (
              <SanityImage
                image={item.heroImage}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity group-hover:opacity-100"
              />
            ) : null}
            <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-4.5">
                <MediaTagIcon type="read" />
                <span className="font-brook text-base uppercase group-hover:text-ch-lite">
                  READ
                </span>
              </div>
              <span className="font-brook text-base uppercase group-hover:text-ch-lite">
                {formatShortDate(item.publishDate)}
              </span>
            </div>

            <div className="relative">
              <span className="font-miller italic text-[36px] leading-10 group-hover:text-ch-lite">
                {item.title}
              </span>
            </div>

            <div className="relative">
              {item.authorName ? (
                <span className="font-miller text-2xl leading-10 group-hover:text-ch-lite">
                  {item.authorName}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
