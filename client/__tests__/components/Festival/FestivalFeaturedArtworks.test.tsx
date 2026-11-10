import { render, screen } from "@testing-library/react";
import { FestivalFeaturedArtworks } from "@/components/Festival/FestivalFeaturedArtworks";
import type { FestivalArtwork } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

const artwork = {
  _key: "art-1",
  title: "Ancient Futures",
  artist: "Craftwork Collective",
  description: "A woven installation.",
  image: null,
} as unknown as FestivalArtwork;

it("renders artwork details", () => {
  render(<FestivalFeaturedArtworks artworks={[artwork]} />);

  expect(screen.getByText("Featured Artworks")).toBeInTheDocument();
  expect(screen.getByText("Ancient Futures")).toBeInTheDocument();
  expect(screen.getByText("Craftwork Collective")).toBeInTheDocument();
  expect(screen.getByText("A woven installation.")).toBeInTheDocument();
});

it("renders nothing without artworks", () => {
  const { container } = render(<FestivalFeaturedArtworks artworks={[]} />);
  expect(container).toBeEmptyDOMElement();
});
