import { act, fireEvent, render, screen } from "@testing-library/react";
import ArticleHoverPreview from "@/components/Editorial/ArticleHoverPreview";
import ArticleIndex from "@/components/Editorial/ArticleIndex";
import { makeArticle } from "../../fixtures/editorial";

const hero = {
  asset: { _type: "reference" as const, _ref: "image-abcdef-1200x800-jpg" },
  alt: "Hero",
  crop: null,
  hotspot: null,
  credits: null,
};
let fine = true;
let reduced = false;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

function tick() {
  act(() => {
    const current = [...frames.values()];
    frames.clear();
    current.forEach((callback) => callback(16));
  });
}

beforeEach(() => {
  fine = true;
  reduced = false;
  frames = new Map();
  nextFrame = 0;
  window.matchMedia = jest.fn((query) => ({
    matches: query.includes("reduced-motion") ? reduced : fine,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
  window.requestAnimationFrame = jest.fn((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  window.cancelAnimationFrame = jest.fn((id) => {
    frames.delete(id);
  });
});

it("moves one decorative portal horizontally, retains its row anchor, and bounds both edges", () => {
  const cursor = { current: 300 as number | null };
  const { rerender, unmount } = render(
    <ArticleHoverPreview
      article={makeArticle({ heroImage: hero })}
      anchor={{ top: 300, height: 89 }}
      cursorXRef={cursor}
    />,
  );
  const preview = document.querySelector(
    "[data-article-preview]",
  ) as HTMLElement;
  expect(preview.parentElement).toBe(document.body);
  expect(preview).toHaveAttribute("aria-hidden", "true");
  expect(preview).toHaveStyle({ pointerEvents: "none" });
  const top = preview.style.top;
  const first = preview.style.left;
  const tilt = preview.style.transform;
  cursor.current = 800;
  tick();
  expect(preview.style.left).not.toBe(first);
  expect(preview.style.top).toBe(top);
  cursor.current = -1000;
  tick();
  expect(parseFloat(preview.style.left)).toBeGreaterThanOrEqual(16);
  cursor.current = 2000;
  tick();
  expect(
    parseFloat(preview.style.left) + parseFloat(preview.style.width),
  ).toBeLessThanOrEqual(window.innerWidth - 16);
  rerender(
    <ArticleHoverPreview
      article={makeArticle({ _id: "drafts.article-a", heroImage: hero })}
      anchor={{ top: 300, height: 89 }}
      cursorXRef={cursor}
    />,
  );
  expect(preview.style.transform).toBe(tilt);
  expect(document.querySelectorAll("[data-article-preview]")).toHaveLength(1);
  unmount();
  expect(frames.size).toBe(0);
});

it("shows a smaller image with its rotated left edge 24px to the right of the cursor", () => {
  render(
    <ArticleHoverPreview
      article={makeArticle({ _id: "sanity-article-42", heroImage: hero })}
      anchor={{ top: 300, height: 89 }}
      cursorXRef={{ current: 200 }}
    />,
  );
  const preview = document.querySelector(
    "[data-article-preview]",
  ) as HTMLElement;
  expect(parseFloat(preview.style.width)).toBe(400);
  const angle = parseFloat(preview.style.transform.slice("rotate(".length));
  const radians = (Math.abs(angle) * Math.PI) / 180;
  const rotatedWidth =
    400 * Math.cos(radians) + ((400 * 2) / 3) * Math.sin(radians);
  const rotatedLeft = parseFloat(preview.style.left) - (rotatedWidth - 400) / 2;
  expect(rotatedLeft).toBeCloseTo(224, 5);
});

it("keeps each Sanity ID's rotation stable across reordering and remounting", () => {
  const props = {
    anchor: { top: 300, height: 89 },
    cursorXRef: { current: 200 },
  };
  const first = render(
    <ArticleHoverPreview
      {...props}
      article={makeArticle({ _id: "sanity-article-42", heroImage: hero })}
    />,
  );
  const angle = document.querySelector<HTMLElement>("[data-article-preview]")!
    .style.transform;
  first.rerender(
    <ArticleHoverPreview
      {...props}
      article={makeArticle({ _id: "sanity-article-99", heroImage: hero })}
    />,
  );
  expect(
    document.querySelector<HTMLElement>("[data-article-preview]")!.style
      .transform,
  ).not.toBe(angle);
  first.unmount();
  render(
    <ArticleHoverPreview
      {...props}
      article={makeArticle({
        _id: "drafts.sanity-article-42",
        heroImage: hero,
      })}
    />,
  );
  expect(
    document.querySelector<HTMLElement>("[data-article-preview]")!.style
      .transform,
  ).toBe(angle);
});

it("uses a stationary preview for focus and reduced motion", () => {
  const cursor = { current: null as number | null };
  render(
    <ArticleHoverPreview
      article={makeArticle({ heroImage: hero })}
      anchor={{ top: 300, height: 89 }}
      cursorXRef={cursor}
    />,
  );
  const preview = document.querySelector(
    "[data-article-preview]",
  ) as HTMLElement;
  const left = preview.style.left;
  reduced = true;
  tick();
  const stationary = preview.style.left;
  cursor.current = 800;
  tick();
  expect(preview.style.left).toBe(stationary);
  expect(left).not.toBe("");
});

it("does not mount a floating preview without a hero or for coarse pointers", () => {
  const props = {
    anchor: { top: 100, height: 80 },
    cursorXRef: { current: 100 },
  };
  const { rerender } = render(
    <ArticleHoverPreview {...props} article={makeArticle()} />,
  );
  expect(document.querySelector("[data-article-preview]")).toBeNull();
  fine = false;
  rerender(
    <ArticleHoverPreview
      {...props}
      article={makeArticle({ heroImage: hero })}
    />,
  );
  expect(document.querySelector("[data-article-preview]")).toBeNull();
});

it("clears row previews on blur, scroll, year changes, and refreshed records", () => {
  const articles = [
    makeArticle({ heroImage: hero }),
    makeArticle({
      _id: "old",
      title: "Old",
      slug: "old",
      publishDate: "2025-01-01",
      heroImage: hero,
    }),
  ];
  const { rerender } = render(
    <ArticleIndex title="Index" articles={articles} />,
  );
  const link = screen.getByRole("link", { name: "An article" });
  fireEvent.focus(link);
  expect(document.querySelector("[data-article-preview]")).not.toBeNull();
  fireEvent.blur(link);
  expect(document.querySelector("[data-article-preview]")).toBeNull();
  fireEvent.focus(link);
  fireEvent.scroll(window);
  expect(document.querySelector("[data-article-preview]")).toBeNull();
  fireEvent.focus(link);
  fireEvent.click(screen.getByRole("button", { name: "2025" }));
  expect(document.querySelector("[data-article-preview]")).toBeNull();
  fireEvent.focus(screen.getByRole("link", { name: "Old" }));
  rerender(
    <ArticleIndex title="Index" articles={articles.map((a) => ({ ...a }))} />,
  );
  expect(document.querySelector("[data-article-preview]")).toBeNull();
});
