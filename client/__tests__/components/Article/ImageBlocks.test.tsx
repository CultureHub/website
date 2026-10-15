import { render, screen } from "@testing-library/react";
import ArticleBody from "@/components/Article/ArticleBody";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;

function image(credits?: string | null) {
  return {
    asset: { _ref: "image-1", _type: "reference" },
    hotspot: null,
    crop: null,
    alt: "alt",
    credits: credits ?? null,
  };
}

describe("ImageBlocks", () => {
  it("renders an articleImage with its credit", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "i1",
              _type: "articleImage",
              layout: "full",
              image: image("Photo by X"),
            },
          ] as Content
        }
      />,
    );

    expect(screen.getAllByTestId("sanity-image")).toHaveLength(1);
    expect(screen.getByText("Photo by X")).toBeInTheDocument();
  });

  it("renders no caption when articleImage has no credits", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "i1",
              _type: "articleImage",
              layout: "full",
              image: image(null),
            },
          ] as Content
        }
      />,
    );

    expect(screen.getAllByTestId("sanity-image")).toHaveLength(1);
    expect(screen.queryByText(/Photo by/)).not.toBeInTheDocument();
  });

  it("renders two images for an imagePair block", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "p1",
              _type: "imagePair",
              image1: image(),
              image2: image(),
            },
          ] as Content
        }
      />,
    );

    expect(screen.getAllByTestId("sanity-image")).toHaveLength(2);
  });

  it("renders a qa block inside an imageText block", () => {
    render(
      <ArticleBody
        content={
          [
            {
              _key: "it1",
              _type: "imageText",
              imagePosition: "left",
              image: image(),
              text: [
                {
                  _type: "qa",
                  _key: "qa1",
                  question: "Who are you?",
                  answer: [
                    {
                      _type: "block",
                      _key: "b1",
                      style: "normal",
                      children: [
                        { _type: "span", _key: "s1", text: "An artist." },
                      ],
                    },
                  ],
                },
              ],
            },
          ] as Content
        }
      />,
    );

    expect(screen.getByText("Who are you?")).toBeInTheDocument();
    expect(screen.getByText("An artist.")).toBeInTheDocument();
  });

  it("renders null when an articleImage has a missing image object", () => {
    const { container } = render(
      <ArticleBody
        content={
          [
            {
              _key: "i1",
              _type: "articleImage",
              layout: "full",
              image: null,
            },
          ] as unknown as Content
        }
      />,
    );

    expect(container.textContent).toBe("");
  });
});
