import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FestivalArchive from "@/components/Refest/FestivalArchive";
import type { FestivalArchiveItem } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

const festivals = [
  {
    _id: "festival-2025",
    title: "Re–Collect",
    year: 2025,
    slug: "2025",
    summary: "First festival summary.",
    locationSummary: "New York & Los Angeles",
    heroImage: null,
    links: [],
    locations: [
      { name: "New York", kind: "in-person", dateLabel: "March 6-9th" },
    ],
  },
  {
    _id: "festival-2024",
    title: "Re–Source",
    year: 2024,
    slug: "2024",
    summary: "Second festival summary.",
    locationSummary: "Worldwide",
    heroImage: null,
    links: [],
    locations: [],
  },
] as unknown as FestivalArchiveItem[];

it("renders archive rows and previews the first festival by default", () => {
  render(<FestivalArchive festivals={festivals} />);

  expect(screen.getAllByText("Re–Collect").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Re–Source").length).toBeGreaterThan(0);
  expect(screen.getByTestId("festival-preview-2025")).toHaveAttribute(
    "data-active",
    "true",
  );
  expect(screen.getByTestId("festival-preview-2024")).toHaveAttribute(
    "data-active",
    "false",
  );
});

it("uses the re-fest highlighter for the archive Visit Festival hover", () => {
  render(<FestivalArchive festivals={festivals} />);

  const link = screen.getAllByRole("link", { name: "Visit Festival" })[0];
  expect(link.firstElementChild).toHaveClass("hover:bg-rf-highlighter");
});

it("switches the preview on hover", async () => {
  render(<FestivalArchive festivals={festivals} />);

  await userEvent.hover(screen.getAllByText("Re–Source")[0]);

  expect(screen.getByTestId("festival-preview-2024")).toHaveAttribute(
    "data-active",
    "true",
  );
  expect(screen.getByTestId("festival-preview-2025")).toHaveAttribute(
    "data-active",
    "false",
  );
});
