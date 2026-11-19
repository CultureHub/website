import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import FestivalPage from "@/app/re-fest/[slug]/page";

jest.mock("@/sanity/queries", () => ({
  getFestivalBySlug: jest.fn(),
}));

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

jest.mock("@/components/PortableText", () => ({
  PortableText: ({ value }: { value: unknown }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

import * as Queries from "@/sanity/queries";
const getFestivalBySlug = Queries.getFestivalBySlug as jest.Mock;

const festival = {
  _id: "festival-2025",
  title: "Re–Collect",
  year: 2025,
  slug: "2025",
  summary: "A theme about collecting and recollection.",
  about: [
    {
      _type: "block",
      _key: "about-1",
      children: [{ _type: "span", _key: "span-1", text: "About copy" }],
      markDefs: [],
      style: "normal",
    },
  ],
  heroImage: null,
  logo: null,
  links: [],
  locations: [
    {
      _key: "loc-1",
      name: "New York",
      kind: "in-person",
      colorVariant: "highlighter",
      dateLabel: "March 6-9th",
      venueName: "La MaMa",
      address: "74a E 4th Street",
      details: null,
      links: [],
      participatingArtists: ["Artist One"],
      schedule: {
        days: [
          {
            _key: "day-1",
            dateLabel: "Thursday, March 6th",
            items: [
              {
                _key: "item-1",
                time: "6-9PM",
                description: "Festival Opening",
                links: [],
              },
            ],
          },
        ],
      },
      featuredArtworks: [
        {
          _key: "art-1",
          title: "Ancient Futures",
          artist: "Craftwork Collective",
          description: "A woven installation.",
          image: null,
        },
      ],
    },
  ],
  videos: [],
  partnerGroups: [{ _key: "partners", title: "Partners", names: ["Arium"] }],
  program: { title: "Re-Fest", shortLabel: "Re-Fest", accentColor: "#EDFD8B" },
};

describe("FestivalPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the festival template sections", async () => {
    getFestivalBySlug.mockResolvedValue(festival);

    await act(async () => {
      render(
        await FestivalPage({
          params: Promise.resolve({ slug: "2025" }),
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Re–Collect — Re–Fest 2025",
        }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Re–Collect").length).toBeGreaterThan(0);
      expect(screen.getAllByText("New York").length).toBeGreaterThan(0);
      expect(screen.getByText("Thursday, March 6th")).toBeInTheDocument();
      expect(screen.getByText("Ancient Futures")).toBeInTheDocument();
      expect(screen.getAllByText("Partners").length).toBeGreaterThan(0);
      expect(screen.getByText("Arium")).toBeInTheDocument();
    });
  });

  it("throws notFound when the festival does not exist", async () => {
    getFestivalBySlug.mockResolvedValue(null);

    await expect(
      FestivalPage({ params: Promise.resolve({ slug: "not-a-year" }) }),
    ).rejects.toBeDefined();
  });
});
