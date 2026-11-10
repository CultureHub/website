import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FeaturedArticles from "@/components/Editorial/FeaturedArticles";
import { makeFeature } from "../../fixtures/editorial";

// The shared setup's leaf mock expects an `alt` prop, but SanityImage consumes
// image.alt. Preserve that real contract while testing the card's visibility.
jest.mock("@/components/SanityImage", () => ({
  __esModule: true,
  default: ({ image }: { image: { alt?: string } }) =>
    React.createElement("img", { alt: image.alt ?? "" }),
}));

describe("featured articles", () => {
  it("keeps the entire configured excerpt available as the article's accessible description", () => {
    const previewText = Array.from({ length: 150 }, (_, i) =>
      i === 149 ? "ending." : "collaboration",
    ).join(" ");
    render(<FeaturedArticles items={[makeFeature({ previewText })]} />);
    const link = screen.getByRole("link", { name: "An article" });
    fireEvent.focus(link);
    expect(link).toHaveAccessibleDescription(previewText);
    expect(link).toHaveAccessibleName("An article");
  });
  it("keeps each article link named while revealing opening text on hover and focus", () => {
    render(<FeaturedArticles items={[makeFeature()]} />);
    const link = screen.getByRole("link", { name: "An article" });
    expect(link).toHaveAttribute("href", "/read/an-article");
    const preview = screen.getByText("These are the opening words.");
    expect(preview).not.toBeVisible();
    fireEvent.mouseEnter(link);
    expect(preview).toBeVisible();
    fireEvent.mouseLeave(link);
    expect(preview).not.toBeVisible();
    fireEvent.focus(link);
    expect(preview).toBeVisible();
    fireEvent.blur(link);
    expect(preview).not.toBeVisible();
    expect(link).toHaveAccessibleName("An article");
  });

  it("reveals a hero image but retains metadata when a configured image is missing", () => {
    render(
      <FeaturedArticles
        items={[
          makeFeature({
            heroImage: {
              asset: { _ref: "image-abcdef-1200x800-jpg", _type: "reference" },
              alt: "Article hero",
              hotspot: null,
              crop: null,
              credits: null,
            },
            previewMode: "image",
          }),
          makeFeature({
            _id: "b",
            _key: "b",
            title: "Missing image",
            previewMode: "image",
          }),
        ]}
      />,
    );
    const image = screen.getByAltText("Article hero");
    expect(image).not.toBeVisible();
    fireEvent.focus(screen.getByRole("link", { name: "An article" }));
    expect(image).toBeVisible();
    fireEvent.focus(screen.getByRole("link", { name: "Missing image" }));
    expect(screen.getByText("Missing image")).toBeVisible();
  });

  it.each([0, 1, 2, 3])(
    "renders %i usable entries in their supplied order without invented cards",
    (count) => {
      const items = ["lead", "second", "third"]
        .slice(0, count)
        .map((id) => makeFeature({ _id: id, _key: id, title: id, slug: id }));
      render(<FeaturedArticles items={items} />);
      expect(
        screen.queryAllByRole("link").map((a) => a.getAttribute("href")),
      ).toEqual(items.map((a) => `/read/${a.slug}`));
      if (!count)
        expect(
          screen.queryByRole("region", { name: "Featured articles" }),
        ).not.toBeInTheDocument();
    },
  );
});
