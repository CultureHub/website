"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FilterMenu from "@/components/Filter/FilterMenu";
import type { ArticleSummary } from "@/sanity/editorial-types";
import { articleYear, formatEditorialDate } from "@/util/editorial";
import styles from "./editorial.module.css";
import ArticleHoverPreview, { hasFinePointer } from "./ArticleHoverPreview";

const keepYearsVisible = () => {};

export default function ArticleIndex({
  title,
  articles,
}: {
  title: string;
  articles: ArticleSummary[];
}) {
  const years = [
    ...new Set(
      articles
        .map((a) => articleYear(a.publishDate))
        .filter((y): y is string => !!y),
    ),
  ]
    .sort()
    .reverse();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    article: ArticleSummary;
    anchor: { top: number; height: number };
  } | null>(null);
  const cursorXRef = useRef<number | null>(null);
  const year =
    selectedYear && years.includes(selectedYear) ? selectedYear : years[0];
  const filtered = articles.filter((a) => articleYear(a.publishDate) === year);
  const shownPreview =
    preview && filtered.includes(preview.article) ? preview : null;
  useEffect(() => {
    const clear = () => setPreview(null);
    window.addEventListener("scroll", clear, { capture: true, passive: true });
    window.addEventListener("resize", clear);
    return () => {
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);
  if (!years.length)
    return (
      <section className="px-6 md:px-16">
        <h2 className="mb-8 font-milling text-2xl font-thin">{title}</h2>
        <p className="pb-12 font-miller text-xl">
          No additional articles available.
        </p>
      </section>
    );
  return (
    <section>
      <FilterMenu
        layout="editorial"
        title={title}
        categories={[{ key: "year", label: "Year" }]}
        activeCategory="year"
        onToggleCategory={keepYearsVisible}
        onClose={keepYearsVisible}
        showingLabel={`Showing: ${year} (${filtered.length})`}
        renderDesktopItems={() => (
          <div className="flex flex-wrap">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={y === year}
                onClick={() => {
                  setSelectedYear(y);
                  setPreview(null);
                }}
                className={`min-w-[100px] border-r border-ch-midnite px-4 py-2.5 font-milling text-xl focus-visible:outline-2 focus-visible:outline-offset-[-3px] ${y === year ? "bg-ch-midnite text-ch-lite font-bold" : ""}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      />
      <div className={styles.indexHeader} aria-hidden="true">
        <span>Publish Date</span>
        <span>Article Title</span>
        <span>Author</span>
        <span>Article Type</span>
      </div>
      <ul className={styles.articleList}>
        {filtered.map((article) => (
          <li key={article._id}>
            <Link
              href={`/read/${article.slug}`}
              aria-label={article.title}
              className={styles.articleRow}
              onPointerEnter={(event) => {
                if (
                  event.pointerType === "touch" ||
                  !hasFinePointer() ||
                  !article.heroImage
                )
                  return;
                cursorXRef.current = Number.isFinite(event.clientX)
                  ? event.clientX
                  : null;
                const bounds = event.currentTarget.getBoundingClientRect();
                setPreview({
                  article,
                  anchor: { top: bounds.top, height: bounds.height },
                });
              }}
              onPointerMove={(event) => {
                if (event.pointerType !== "touch" && hasFinePointer())
                  cursorXRef.current = event.clientX;
              }}
              onPointerLeave={(event) => {
                if (!event.currentTarget.matches(":focus-visible"))
                  setPreview(null);
              }}
              onFocus={(event) => {
                if (!hasFinePointer() || !article.heroImage) return;
                cursorXRef.current = null;
                const bounds = event.currentTarget.getBoundingClientRect();
                setPreview({
                  article,
                  anchor: { top: bounds.top, height: bounds.height },
                });
              }}
              onBlur={() => setPreview(null)}
            >
              <time dateTime={article.publishDate} className={styles.rowDate}>
                {formatEditorialDate(article.publishDate)}
              </time>
              <span className={styles.rowTitle}>{article.title}</span>
              <span className={styles.rowAuthor}>{article.authorName}</span>
              <span className={styles.rowType}>{article.articleType}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ArticleHoverPreview
        article={shownPreview?.article ?? null}
        anchor={shownPreview?.anchor ?? null}
        cursorXRef={cursorXRef}
      />
    </section>
  );
}
