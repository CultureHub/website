import { render, screen } from "@testing-library/react";
import ArticleAuthorBio from "@/components/Article/ArticleAuthorBio";
import ReadMore from "@/components/Article/ReadMore";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Article = NonNullable<GetArticleBySlugQueryResult>;
type Author = NonNullable<Article["author"]>;
type ReadMoreItem = NonNullable<NonNullable<Article["readMore"]>[number]>;

function readMoreItem(overrides: Partial<ReadMoreItem> = {}): ReadMoreItem {
  return {
    _id: "r1",
    title: "A Title",
    slug: "a-title",
    publishDate: "2025-01-20",
    authorName: "Todd Anderson",
    heroImage: null,
    ...overrides,
  };
}

describe("ArticleAuthorBio", () => {
  it("renders name, bio, and a website link", () => {
    render(
      <ArticleAuthorBio
        author={
          {
            name: "Mark Iosifescu",
            website: "https://iosifescu.biz",
            photo: null,
            bio: [
              {
                _type: "block",
                _key: "b1",
                style: "normal",
                children: [
                  {
                    _type: "span",
                    _key: "s1",
                    text: "A writer from New York.",
                  },
                ],
              },
            ],
          } as Author
        }
      />,
    );

    expect(screen.getByText("Mark Iosifescu")).toBeInTheDocument();
    expect(screen.getByText("A writer from New York.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /iosifescu\.biz/ }),
    ).toHaveAttribute("href", "https://iosifescu.biz");
  });

  it("returns null when there is no author", () => {
    const { container } = render(<ArticleAuthorBio author={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ReadMore", () => {
  it("renders titles linking to /read/<slug> and skips null items", () => {
    render(
      <ReadMore items={[readMoreItem(), null as unknown as ReadMoreItem]} />,
    );

    expect(screen.getByText("A Title")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/read/a-title");
  });

  it("renders the hero image and group-hover classes", () => {
    render(
      <ReadMore
        items={[
          readMoreItem({
            heroImage: {
              asset: { _ref: "img-1", _type: "reference" },
              hotspot: null,
              crop: null,
              alt: "alt",
            },
          }),
        ]}
      />,
    );

    expect(screen.getAllByTestId("sanity-image")).toHaveLength(1);
    expect(screen.getByRole("link").className).toContain("group");
    expect(screen.getByText("A Title").className).toContain(
      "group-hover:text-ch-lite",
    );
  });
});
