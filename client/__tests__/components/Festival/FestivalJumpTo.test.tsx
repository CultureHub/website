import { render, screen } from "@testing-library/react";
import { FestivalJumpTo } from "@/components/Festival/FestivalJumpTo";
import type { FestivalTemplateData } from "@/sanity/queries";

function makeFestival(locations: { name: string }[]) {
  return {
    _id: "festival-2025",
    title: "Re–Collect",
    year: 2025,
    slug: "2025",
    locations,
  } as unknown as FestivalTemplateData;
}

it("renders the year, theme, and location anchors", () => {
  render(
    <FestivalJumpTo
      festival={makeFestival([{ name: "New York" }, { name: "Los Angeles" }])}
    />,
  );

  expect(screen.getByText("2025")).toBeInTheDocument();
  expect(screen.getByText("Re–Collect")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
    "href",
    "#about",
  );
  expect(screen.getByRole("link", { name: "New York" })).toHaveAttribute(
    "href",
    "#new-york",
  );
  expect(screen.getByRole("link", { name: "Los Angeles" })).toHaveAttribute(
    "href",
    "#los-angeles",
  );
});

it("handles a single location", () => {
  render(<FestivalJumpTo festival={makeFestival([{ name: "New York" }])} />);

  expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "New York" })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Los Angeles" }),
  ).not.toBeInTheDocument();
});

it("handles a virtual-only location", () => {
  render(
    <FestivalJumpTo festival={makeFestival([{ name: "Virtual Gallery" }])} />,
  );

  expect(screen.getByRole("link", { name: "Virtual Gallery" })).toHaveAttribute(
    "href",
    "#virtual-gallery",
  );
});
