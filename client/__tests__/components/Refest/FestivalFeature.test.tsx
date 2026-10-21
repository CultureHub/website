import { render, screen } from "@testing-library/react";
import FestivalFeature from "@/components/Refest/FestivalFeature";
import type { FestivalArchiveItem } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

const festival = {
  _id: "festival-2025",
  title: "Re–Collect",
  year: 2025,
  slug: "2025",
  summary: "A theme about collecting and recollection.",
  locationSummary: "New York & Los Angeles",
  heroImage: null,
  links: [],
  locations: [
    { name: "New York", kind: "in-person", dateLabel: "March 6-9th" },
    { name: "Los Angeles", kind: "in-person", dateLabel: "March 14-15th" },
  ],
} as unknown as FestivalArchiveItem;

it("renders the current festival feature", () => {
  render(<FestivalFeature festival={festival} />);

  expect(screen.getByText("2025")).toBeInTheDocument();
  expect(screen.getByText("Re–Collect")).toBeInTheDocument();
  expect(screen.getByText("March 6-9th in New York")).toBeInTheDocument();
  expect(screen.getByText("March 14-15th in Los Angeles")).toBeInTheDocument();
  expect(
    screen.getByText("A theme about collecting and recollection."),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Visit Festival" })).toHaveAttribute(
    "href",
    "/re-fest/2025",
  );
});
