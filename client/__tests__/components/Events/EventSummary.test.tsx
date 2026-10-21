import { render, screen } from "@testing-library/react";
import EventSummary from "@/components/Events/EventSummary";
import type { EventListItem } from "@/sanity/queries";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("next-sanity", () => ({
  PortableText: ({ value }: { value: unknown }) => (
    <span data-testid="portable-text">{JSON.stringify(value)}</span>
  ),
}));

const event = {
  _id: "e1",
  title: "Castle Door",
  slug: "castle-door",
  dateTimes: [
    {
      _key: "dt1",
      _type: "dateTimeRange",
      start: "2030-04-09T19:00:00-04:00",
      end: "2030-04-09T20:30:00-04:00",
    },
  ],
  location: null,
  locationShort: "NEW YORK",
  timezoneLabel: "ET",
  description: [
    {
      _type: "block",
      _key: "b1",
      children: [{ _type: "span", _key: "s1", text: "An event description." }],
      markDefs: [],
      style: "normal",
    },
  ],
  links: [{ _key: "l1", label: "Tickets", url: "https://example.com" }],
  program: null,
  heroImage: { asset: null, hotspot: null, crop: null, alt: "hero" },
} as unknown as EventListItem;

it("renders the event summary content and links", () => {
  render(<EventSummary event={event} />);

  expect(
    screen.getByRole("heading", { name: "Castle Door" }),
  ).toBeInTheDocument();
  expect(screen.getByText("NEW YORK")).toBeInTheDocument();
  expect(screen.getByTestId("portable-text")).toHaveTextContent(
    "An event description.",
  );
  expect(screen.getByRole("link", { name: "Tickets" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Learn More" })).toHaveAttribute(
    "href",
    "/events/castle-door",
  );
});
