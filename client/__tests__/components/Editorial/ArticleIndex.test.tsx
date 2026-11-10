import { render, screen, fireEvent } from "@testing-library/react";
import ArticleIndex from "@/components/Editorial/ArticleIndex";
import { makeArticle, makeArchiveAcrossYears } from "../../fixtures/editorial";

describe("article index", () => {
  it("initially shows the newest year, and changes only list results when a year is selected", () => {
    render(
      <ArticleIndex
        title="Article Index"
        articles={makeArchiveAcrossYears()}
      />,
    );
    expect(screen.getByRole("button", { name: "2026" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: "2026 article" })).toHaveAttribute(
      "href",
      "/read/2026-article",
    );
    expect(
      screen.queryByRole("link", { name: "2025 article" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2025" }));
    expect(screen.getByRole("link", { name: "2025 article" })).toHaveAttribute(
      "href",
      "/read/2025-article",
    );
    expect(
      screen.queryByRole("link", { name: "2026 article" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("12.31.25")).toBeInTheDocument();
  });

  it("falls back to the latest available year when a refreshed list loses the selection", () => {
    const { rerender } = render(
      <ArticleIndex title="Index" articles={makeArchiveAcrossYears()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "2025" }));
    rerender(
      <ArticleIndex
        title="Index"
        articles={[makeArticle({ authorName: null, articleType: null })]}
      />,
    );
    expect(screen.getByRole("button", { name: "2026" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "An article" }),
    ).toBeInTheDocument();
  });

  it("does not render year controls or empty metadata headers when there are no remaining articles", () => {
    render(<ArticleIndex title="Article Index" articles={[]} />);
    expect(
      screen.getByRole("heading", { name: "Article Index" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No additional articles available."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Publish Date")).not.toBeInTheDocument();
  });
});
