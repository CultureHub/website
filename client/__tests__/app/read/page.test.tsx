import { render, screen } from "@testing-library/react";
import ReadPage, { metadata } from "@/app/read/page";
import { getReadData } from "@/sanity/editorial-data";
import { makeArchiveAcrossYears, makeFeature } from "../../fixtures/editorial";

jest.mock("@/sanity/editorial-data", () => ({ getReadData: jest.fn() }));
const load = jest.mocked(getReadData);

beforeEach(() => load.mockReset());
afterEach(() => jest.restoreAllMocks());

it("renders the server-supplied featured and remaining archive records without duplicate site chrome", async () => {
  load.mockResolvedValue({
    heading: "Editorial",
    articleIndexTitle: "Article Index",
    featured: [makeFeature()],
    articles: makeArchiveAcrossYears(),
  });
  render(await ReadPage());
  expect(
    screen.getByRole("heading", { level: 1, name: "Editorial" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "An article" })).toHaveAttribute(
    "href",
    "/read/an-article",
  );
  expect(
    screen.getByRole("link", { name: "2026 article" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  expect(metadata.title).toBe("Read | CultureHub");
});

it("renders an empty index without inventing featured content", async () => {
  load.mockResolvedValue({
    heading: "Editorial",
    articleIndexTitle: "Article Index",
    featured: [],
    articles: [],
  });
  render(await ReadPage());
  expect(
    screen.getByText("No additional articles available."),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Featured articles" }),
  ).not.toBeInTheDocument();
});

it("shows the three Figma features and an image-bearing index in an explicit development preview", async () => {
  jest.replaceProperty(process.env, "NODE_ENV", "development");
  load.mockResolvedValue({
    heading: "Editorial",
    articleIndexTitle: "Article Index",
    featured: [],
    articles: [],
  });
  render(
    await ReadPage({ searchParams: Promise.resolve({ preview: "design" }) }),
  );
  expect(
    screen.getByRole("complementary", { name: "Design preview" }),
  ).toBeInTheDocument();
  const features = screen.getByRole("region", { name: "Featured articles" });
  expect(features.querySelectorAll("a")).toHaveLength(3);
  expect(
    screen.getByRole("link", { name: "Quadrophonic Landscapes" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "An Interview with Spencer Chang" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", {
      name: "Circles of Circuitry in the Lower East Side",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Interview with Yu Lee" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "View published content" }),
  ).toHaveAttribute("href", "/read");
  expect(load).not.toHaveBeenCalled();
});

it.each(["production", "test"] as const)(
  "ignores the placeholder request in %s",
  async (environment) => {
    jest.replaceProperty(process.env, "NODE_ENV", environment);
    load.mockResolvedValue({
      heading: "Editorial",
      articleIndexTitle: "Article Index",
      featured: [makeFeature()],
      articles: [],
    });
    render(
      await ReadPage({ searchParams: Promise.resolve({ preview: "design" }) }),
    );
    expect(
      screen.getByRole("link", { name: "An article" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", { name: "Design preview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Circles of Circuitry in the Lower East Side",
      }),
    ).not.toBeInTheDocument();
  },
);

it("keeps ordinary development visits on published content without the preview flag", async () => {
  jest.replaceProperty(process.env, "NODE_ENV", "development");
  load.mockResolvedValue({
    heading: "Editorial",
    articleIndexTitle: "Article Index",
    featured: [],
    articles: makeArchiveAcrossYears(),
  });
  render(await ReadPage());
  expect(
    screen.getByRole("link", { name: "2026 article" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Featured articles" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("complementary", { name: "Design preview" }),
  ).not.toBeInTheDocument();
});
