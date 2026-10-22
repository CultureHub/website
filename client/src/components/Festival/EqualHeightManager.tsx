"use client";

import { useEffect } from "react";

const GROUPS = ["artwork"] as const;

export default function EqualHeightManager() {
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;

    const media = window.matchMedia?.("(min-width: 768px)");
    let frame = 0;

    const clear = () => {
      for (const group of GROUPS) {
        root
          .querySelectorAll<HTMLElement>(`[data-equal-height-group="${group}"]`)
          .forEach((element) => {
            element.style.minHeight = "";
          });
      }
    };

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (media && !media.matches) {
          clear();
          return;
        }

        for (const group of GROUPS) {
          const elements = Array.from(
            root.querySelectorAll<HTMLElement>(
              `[data-equal-height-group="${group}"]`,
            ),
          );
          if (elements.length === 0) continue;

          elements.forEach((element) => {
            element.style.minHeight = "";
          });

          const tallest = Math.max(
            ...elements.map(
              (element) => element.getBoundingClientRect().height,
            ),
          );

          elements.forEach((element) => {
            element.style.minHeight = `${tallest}px`;
          });
        }
      });
    };

    measure();
    document.fonts?.ready.then(measure);

    const images = Array.from(root.querySelectorAll("img"));
    images.forEach((image) => {
      if (!image.complete) image.addEventListener("load", measure);
    });

    window.addEventListener("resize", measure);
    media?.addEventListener("change", measure);

    return () => {
      cancelAnimationFrame(frame);
      images.forEach((image) => image.removeEventListener("load", measure));
      window.removeEventListener("resize", measure);
      media?.removeEventListener("change", measure);
      clear();
    };
  }, []);

  return null;
}
