"use client";

import { useEffect } from "react";

export default function ScheduleHeaderAligner() {
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;

    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const headers = Array.from(
          root.querySelectorAll<HTMLElement>("[data-schedule-header]"),
        );

        headers.forEach((header) => {
          header.style.minHeight = "";
        });

        const rows = new Map<number, HTMLElement[]>();
        for (const header of headers) {
          const cell = header.parentElement;
          if (!cell) continue;
          const top = Math.round(cell.getBoundingClientRect().top);
          rows.set(top, [...(rows.get(top) ?? []), header]);
        }

        for (const group of rows.values()) {
          const tallest = Math.max(
            ...group.map((header) => header.getBoundingClientRect().height),
          );
          group.forEach((header) => {
            header.style.minHeight = `${tallest}px`;
          });
        }
      });
    };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return null;
}
