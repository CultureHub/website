import { render, screen } from "@testing-library/react";
import ArticleHeader from "@/components/Article/ArticleHeader";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    _id: "a1",
    title: "Quadrophonic Landscapes",
    slug: "quadrophonic-landscapes",
    publishDate: "2025-10-21",
    deck: "Leveraged Tech and Reclaimed Infrastructure",
    byline: "Written by Mark Iosifescu",
    heroImage: null,
    content: null,
    author: null,
    readMore: null,
    ...overrides,
  } as Article;
}

describe("ArticleHeader", () => {
  it("renders date, title, deck, and byline", () => {
    render(<ArticleHeader article={makeArticle()} />);

    expect(screen.getByText("October 21, 2025")).toBeInTheDocument();
    expect(screen.getByText("Quadrophonic Landscapes")).toBeInTheDocument();
    expect(
      screen.getByText("Leveraged Tech and Reclaimed Infrastructure"),
    ).toBeInTheDocument();
    expect(screen.getByText("Written by Mark Iosifescu")).toBeInTheDocument();
  });

  it("renders the hero image credit when present, none when absent", () => {
    const { rerender } = render(<ArticleHeader article={makeArticle()} />);
    expect(screen.queryByText(/Photo by/)).not.toBeInTheDocument();

    rerender(
      <ArticleHeader
        article={makeArticle({
          heroImage: {
            asset: null,
            hotspot: null,
            crop: null,
            alt: "alt",
            credits: "Photo by Ji Hoon Kim",
          },
        })}
      />,
    );
    expect(screen.getByText("Photo by Ji Hoon Kim")).toBeInTheDocument();
  });

  it("uses responsive, wrapping title classes for mobile", () => {
    render(<ArticleHeader article={makeArticle()} />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.className).toContain("break-words");
    expect(title.className).toMatch(/md:text-/);
  });
});
