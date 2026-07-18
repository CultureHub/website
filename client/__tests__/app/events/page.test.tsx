import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import EventPage from "@/app/events/[slug]/page";

jest.mock("@/sanity/queries", () => ({
  getEventBySlug: jest.fn(),
}));

jest.mock("@/components/UpcomingEvents", () => ({
  UpcomingEvents: () => null,
}));

jest.mock("next-sanity", () => ({
  PortableText: ({ value }: { value: unknown }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

jest.mock("@/components/SanityImage", () => {
  return function MockSanityImage({ className }: { className?: string }) {
    return <div data-testid="sanity-image" className={className} />;
  };
});

jest.mock("@/components/Breadcrumbs", () => {
  return function MockBreadcrumbs({
    buttons,
  }: {
    buttons: Array<{ label: string }>;
  }) {
    return (
      <div data-testid="breadcrumbs">
        {buttons.map((b, i) => (
          <span key={i}>{b.label}</span>
        ))}
      </div>
    );
  };
});

jest.mock("@/components/Button", () => {
  return function MockButton({
    children,
    href,
  }: {
    children: React.ReactNode;
    href?: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/components/LocationPin", () => {
  return function MockLocationPin({ locations }: { locations: string[] }) {
    return <div data-testid="location-pin">{locations.join(", ")}</div>;
  };
});

jest.mock("@/components/credits", () => ({
  CreditSection: () => <div data-testid="credit-section" />,
}));

import * as Queries from "@/sanity/queries";
const getEventBySlug = Queries.getEventBySlug as jest.Mock;

const mockEvent = {
  title: "Test Event",
  heroImage: {
    asset: { _ref: "img-1", _type: "reference" },
    alt: "hero",
    credits: "Photo credit text",
  },
  program: {
    shortLabel: "EDS",
    title: "Experiments in Digital Storytelling",
    displayTitle: null,
  },
  location: "CultureHub NYC",
  dateTimes: [
    {
      _key: "a",
      start: "2026-06-03T18:00:00-04:00",
      end: "2026-06-03T20:00:00-04:00",
    },
  ],
  cost: "$15",
  accessInfo: "Elevator available",
  links: [{ _key: "t1", label: "Tickets", url: "https://example.com" }],
  description: [
    {
      _key: "b1",
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Event description text" }],
    },
  ],
  featuredArtists: null,
  artworks: null,
  aboutProgram: null,
  schedule: null,
  credits: null,
};

const fullMockEvent = {
  ...mockEvent,
  featuredArtists: [
    {
      _key: "fa1",
      name: "Artist One",
      bio: [
        {
          _key: "b2",
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "Bio text" }],
        },
      ],
      image: { asset: { _ref: "img-2", _type: "reference" }, alt: "artist" },
    },
  ],
  artworks: [
    {
      _key: "aw1",
      image: { asset: { _ref: "img-3", _type: "reference" }, alt: "artwork" },
      description: [
        {
          _key: "b3",
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "Artwork desc" }],
        },
      ],
    },
  ],
  aboutProgram: [
    {
      _key: "b4",
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Program info" }],
    },
  ],
  schedule: {
    description: [
      {
        _key: "b5",
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "Schedule intro" }],
      },
    ],
    items: [
      {
        _key: "s1",
        title: "Workshop A",
        time: "10:00 AM",
        description: null,
      },
    ],
  },
  credits: {
    locations: [
      {
        _key: "loc1",
        groups: [
          {
            _key: "g1",
            name: "Creative Team",
            items: [{ _key: "c1", role: "Director", people: "Jane Doe" }],
          },
        ],
      },
    ],
  },
};

describe("EventPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders event title and description", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
    });
  });

  it("renders detail sidebar fields", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("$15")).toBeInTheDocument();
      expect(screen.getAllByText("CultureHub NYC")[0]).toBeInTheDocument();
      expect(screen.getByText("Elevator available")).toBeInTheDocument();
    });
  });

  it("renders ticket links", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Tickets")[0]).toBeInTheDocument();
    });
  });

  it("renders photo credit when present", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Photo credit text")).toBeInTheDocument();
    });
  });

  it("renders breadcrumb with program", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Events")).toBeInTheDocument();
      expect(screen.getByText("EDS")).toBeInTheDocument();
    });
  });

  it("renders all optional sections when present", async () => {
    getEventBySlug.mockResolvedValue(fullMockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("About the Artists")).toBeInTheDocument();
      expect(screen.getByText("Artworks on View")).toBeInTheDocument();
      expect(screen.getByText("About the Program")).toBeInTheDocument();
      expect(screen.getByText("Schedule")).toBeInTheDocument();
      expect(screen.getByText("Workshop A")).toBeInTheDocument();
    });
  });

  it("hides optional sections when null", async () => {
    getEventBySlug.mockResolvedValue(mockEvent);

    await act(async () => {
      render(
        await EventPage({ params: Promise.resolve({ slug: "test-event" }) }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
    });

    expect(screen.queryByText("About the Artists")).not.toBeInTheDocument();
    expect(screen.queryByText("Artworks on View")).not.toBeInTheDocument();
    expect(screen.queryByText("About the Program")).not.toBeInTheDocument();
    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
  });

  it("throws notFound when event is null", async () => {
    getEventBySlug.mockResolvedValue(null);

    await expect(
      EventPage({ params: Promise.resolve({ slug: "nonexistent" }) }),
    ).rejects.toBeDefined();
  });
});
