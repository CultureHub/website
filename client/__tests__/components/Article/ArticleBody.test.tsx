import { render, screen } from "@testing-library/react";
import ArticleBody from "@/components/Article/ArticleBody";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;

describe("ArticleBody", () => {
  it("renders an articleText block's portable text", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "t1",
              _type: "articleText",
              align: "left",
              style: "body",
              text: [
                {
                  _type: "block",
                  _key: "b1",
                  style: "normal",
                  children: [
                    { _type: "span", _key: "s1", text: "Body paragraph" },
                  ],
                },
              ],
            },
          ] as Content
        }
      />,
    );

    expect(screen.getByText("Body paragraph")).toBeInTheDocument();
  });

  it("renders a pullQuote block's quote", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "q1",
              _type: "pullQuote",
              text: "A quote",
              size: "standard",
            },
          ] as Content
        }
      />,
    );

    expect(screen.getByText("A quote")).toBeInTheDocument();
  });

  it("renders nothing for an empty articleText block", () => {
    const { container } = render(
      <ArticleBody
        content={
          [
            {
              _key: "t2",
              _type: "articleText",
              align: "left",
              style: "body",
              text: null,
            },
          ] as Content
        }
      />,
    );

    expect(container.textContent).toBe("");
  });
});
