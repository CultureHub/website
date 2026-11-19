import { render, screen } from "@testing-library/react";
import RefestPage from "@/components/Refest/RefestPage";
import type { RefestPageData } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("@/components/ProgramPage/ProgramHeader", () => {
  return function MockProgramHeader({
    program,
  }: {
    program: { title: string };
  }) {
    return <p>{program.title}</p>;
  };
});

const data = {
  _id: "program-refest",
  title: "Re-Fest",
  displayTitle: null,
  slug: { current: "re-fest" },
  shortLabel: "Re-Fest",
  accentColor: "#EDFD8B",
  hasPage: true,
  pageDescription: null,
  heroImage: null,
  currentFestival: {
    _id: "festival-2026",
    title: "Re–Mapping",
    year: 2026,
    slug: "2026",
    summary: "Current festival summary.",
    locationSummary: "New York",
    heroImage: null,
    links: [],
    locations: [
      { name: "New York", kind: "in-person", dateLabel: "March 20th-27th" },
    ],
  },
  archive: [
    {
      _id: "festival-2025",
      title: "Re–Collect",
      year: 2025,
      slug: "2025",
      summary: "Archive festival summary.",
      locationSummary: "New York & Los Angeles",
      heroImage: null,
      links: [],
      locations: [],
    },
  ],
} as unknown as RefestPageData;

it("renders the Re-Fest header, current festival, and archive", () => {
  render(<RefestPage data={data} />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Re-Fest" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Current")).toBeInTheDocument();
  expect(screen.getByText("Re–Mapping")).toBeInTheDocument();
  expect(screen.getByText("Festival Archive")).toBeInTheDocument();
  expect(screen.getAllByText("Re–Collect").length).toBeGreaterThan(0);
});

it("omits the archive when there are no archived festivals", () => {
  render(<RefestPage data={{ ...data, archive: [] }} />);

  expect(screen.queryByText("Festival Archive")).not.toBeInTheDocument();
});
