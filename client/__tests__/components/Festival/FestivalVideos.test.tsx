import { render, screen } from "@testing-library/react";
import { FestivalVideos } from "@/components/Festival/FestivalVideos";
import type { FestivalVideo } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

it("renders video cards without a play control", () => {
  render(
    <FestivalVideos
      videos={[
        {
          _key: "v1",
          title: "Dyad",
          artist: "NUUM Collective",
        } as FestivalVideo,
      ]}
    />,
  );

  expect(screen.getByText("Videos")).toBeInTheDocument();
  expect(screen.getByText("Dyad")).toBeInTheDocument();
  expect(screen.getByText("NUUM Collective")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /play/i }),
  ).not.toBeInTheDocument();
});

it("renders nothing without videos", () => {
  const { container } = render(<FestivalVideos videos={[]} />);
  expect(container).toBeEmptyDOMElement();
});
