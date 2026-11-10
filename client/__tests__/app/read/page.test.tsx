import { render, screen } from "@testing-library/react";
import ReadPage, { metadata } from "@/app/read/page";
import { getReadData } from "@/sanity/editorial-data";
import { makeArchiveAcrossYears, makeFeature } from "../../fixtures/editorial";

jest.mock("@/sanity/editorial-data", () => ({ getReadData: jest.fn() }));
const load = jest.mocked(getReadData);

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
