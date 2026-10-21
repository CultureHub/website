import { render } from "@testing-library/react";
import { FestivalAbout } from "@/components/Festival/FestivalAbout";
import type { FestivalTemplateData } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("@/components/PortableText", () => ({
  PortableText: () => <p>About copy</p>,
}));

const base = {
  _id: "festival-2024",
  title: "Re–Source",
  year: 2024,
  slug: "2024",
  about: null,
  logo: null,
  locations: [],
} as unknown as FestivalTemplateData;

it("renders the About section when there is content", () => {
  const { container } = render(
    <FestivalAbout
      festival={{ ...base, about: [{ _type: "block", _key: "about-1" }] }}
    />,
  );
  expect(container).not.toBeEmptyDOMElement();
});

it("renders nothing for an archive stub with no about, logo, or locations", () => {
  const { container } = render(<FestivalAbout festival={base} />);
  expect(container).toBeEmptyDOMElement();
});
