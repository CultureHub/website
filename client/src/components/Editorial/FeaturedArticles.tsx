"use client";

import { useState } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { FeaturedArticle } from "@/sanity/editorial-types";
import { formatEditorialDate } from "@/util/editorial";
import styles from "./editorial.module.css";

function FeaturedCard({
  article,
  lead,
  wide,
}: {
  article: FeaturedArticle;
  lead: boolean;
  wide: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasPreview =
    article.previewMode === "image"
      ? !!article.heroImage
      : !!article.previewText;
  const active = hasPreview && (hovered || focused);
  return (
    <Link
      href={`/read/${article.slug}`}
      aria-label={article.title}
      aria-description={
        article.previewMode === "text"
          ? article.previewText || undefined
          : undefined
      }
      className={`${styles.feature} ${wide ? styles.featureWide : ""}`}
      data-lead={lead}
      data-preview-active={active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div
        className={styles.featureMetadata}
        style={{ opacity: active ? 0 : 1 }}
      >
        <time dateTime={article.publishDate} className="font-brook text-xl">
          {formatEditorialDate(article.publishDate)}
        </time>
        <h2 className="font-miller text-[36px] leading-none">
          {article.title}
        </h2>
        {article.authorName && (
          <p className="font-miller text-2xl italic">{article.authorName}</p>
        )}
      </div>
      {hasPreview && (
        <div
          aria-hidden="true"
          className={styles.featurePreview}
          style={{ opacity: active ? 1 : 0 }}
        >
          {article.previewMode === "image" && article.heroImage ? (
            <SanityImage
              image={article.heroImage}
              fill
              objectFit="contain"
              className="object-contain"
            />
          ) : (
            <p className={styles.featureExcerpt}>{article.previewText}</p>
          )}
        </div>
      )}
    </Link>
  );
}

export default function FeaturedArticles({
  items,
}: {
  items: FeaturedArticle[];
}) {
  if (!items.length) return null;
  return (
    <section aria-label="Featured articles" className={styles.features}>
      {items.map((article, index) => (
        <FeaturedCard
          key={article._key}
          article={article}
          lead={index === 0}
          wide={index === 0 || items.length === 2}
        />
      ))}
    </section>
  );
}
