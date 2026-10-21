import { render, screen } from "@testing-library/react";
import { FestivalLocationSection } from "@/components/Festival/FestivalLocationSection";
import type { FestivalLocation } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

const location = {
  _key: "loc-1",
  name: "New York",
  kind: "in-person",
  colorVariant: "highlighter",
  dateLabel: "March 6-9th",
  venueName: "La MaMa",
  address: "74a E 4th Street",
  details: "Thursday - Sunday",
  links: [],
  participatingArtists: ["Artist One", "Artist Two"],
  schedule: null,
  featuredArtworks: [],
} as unknown as FestivalLocation;

it("renders the location details and artists", () => {
  render(<FestivalLocationSection location={location} />);

  expect(screen.getByRole("heading", { name: "New York" })).toBeInTheDocument();
  expect(screen.getByText("March 6-9th")).toBeInTheDocument();
  expect(screen.getByText("La MaMa")).toBeInTheDocument();
  expect(screen.getByText("Artist One")).toBeInTheDocument();
  expect(screen.getByText("Artist Two")).toBeInTheDocument();
});

it("omits the artist list when there are no artists", () => {
  render(
    <FestivalLocationSection
      location={{ ...location, participatingArtists: [] }}
    />,
  );

  expect(screen.queryByText("Participating Artists")).not.toBeInTheDocument();
});
