"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import SanityImage from "@/components/SanityImage";
import type { ArticleSummary } from "@/sanity/editorial-types";
import { clampPreviewX, getArticleTilt } from "@/util/editorial";
import styles from "./editorial.module.css";

export function hasFinePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches
  );
}

export default function ArticleHoverPreview({
  article,
  anchor,
  cursorXRef,
}: {
  article: ArticleSummary | null;
  anchor: { top: number; height: number } | null;
  cursorXRef: RefObject<number | null>;
}) {
  const element = useRef<HTMLDivElement>(null);
  const enabled = !!article?.heroImage && !!anchor && hasFinePointer();
  useEffect(() => {
    if (!enabled || !article || !anchor) return;
    let frame = 0;
    const position = () => {
      const node = element.current;
      if (!node) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const angle = reduced ? 0 : getArticleTilt(article._id);
      const width = Math.max(0, Math.min(400, (window.innerWidth - 32) / 1.1));
      const height = (width * 2) / 3;
      // Clamp the rotated bounding box, not just the unrotated image.
      const radians = (Math.abs(angle) * Math.PI) / 180;
      const boundsWidth =
        width * Math.cos(radians) + height * Math.sin(radians);
      const boundsHeight =
        height * Math.cos(radians) + width * Math.sin(radians);
      const desiredLeft =
        cursorXRef.current === null || reduced
          ? (window.innerWidth - boundsWidth) / 2
          : cursorXRef.current + 24;
      const left = clampPreviewX(desiredLeft, boundsWidth, window.innerWidth);
      const top = Math.max(
        16,
        Math.min(
          anchor.top + anchor.height / 2 - boundsHeight / 2,
          window.innerHeight - boundsHeight - 16,
        ),
      );
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;
      node.style.left = `${left + (boundsWidth - width) / 2}px`;
      node.style.top = `${top + (boundsHeight - height) / 2}px`;
      node.style.transform = `rotate(${angle}deg)`;
      frame = window.requestAnimationFrame(position);
    };
    position();
    return () => window.cancelAnimationFrame(frame);
  }, [enabled, article, anchor, cursorXRef]);
  if (!enabled || !article?.heroImage || typeof document === "undefined")
    return null;
  return createPortal(
    <div
      ref={element}
      data-article-preview={article._id}
      aria-hidden="true"
      className={styles.hoverPreview}
      style={{ pointerEvents: "none" }}
    >
      <SanityImage
        image={article.heroImage}
        fill
        objectFit="cover"
        className="object-cover"
      />
    </div>,
    document.body,
  );
}
