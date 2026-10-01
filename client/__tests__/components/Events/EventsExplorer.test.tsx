import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsExplorer } from "@/components/Events/EventsExplorer";
import type { EventListItem } from "@/sanity/queries";

jest.mock("@/app/events/actions", () => ({
  getPastEventsAction: jest.fn().mockResolvedValue([]),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/components/SanityImage", () => {
  return function MockSanityImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("next/image", () => {
  return function MockNextImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="next-image" />;
  };
});

jest.mock("next-sanity", () => ({
  PortableText: ({ value }: { value: unknown }) => (
    <span data-testid="portable-text">{JSON.stringify(value)}</span>
  ),
}));

const upcoming: EventListItem[] = [
  {
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
    description: null,
    links: null,
    program: {
      _id: "p1",
      title: "Experiments in Digital Storytelling",
      slug: { _type: "slug", current: "eds" },
      shortLabel: "EDS",
      displayTitle: null,
    },
    heroImage: { asset: null, hotspot: null, crop: null, alt: "" },
  },
];

describe("EventsExplorer", () => {
  it("renders the header and upcoming event title", () => {
    render(<EventsExplorer upcomingEvents={upcoming} />);
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
    expect(screen.getAllByText("Castle Door")[0]).toBeInTheDocument();
  });

  it("renders the empty state when there are no upcoming events", () => {
    render(<EventsExplorer upcomingEvents={[]} />);
    expect(
      screen.getByText(/There are no upcoming events scheduled at this time/),
    ).toBeInTheDocument();
  });

  it("loads past events when the Past tab is selected", async () => {
    render(<EventsExplorer upcomingEvents={upcoming} />);
    await userEvent.click(screen.getByRole("button", { name: "Past" }));
    expect(await screen.findByText("No past events.")).toBeInTheDocument();
  });
});
