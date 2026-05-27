import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ArtistsList from "@/components/ArtistsList";

// Mock the queries module
jest.mock("@/sanity/queries", () => ({
  getArtistsByLocations: jest.fn(),
  getArtists: jest.fn(),
}));

import * as Queries from "@/sanity/queries";

const mockGetArtists = Queries.getArtists as jest.Mock;
const mockGetArtistsByLocations = Queries.getArtistsByLocations as jest.Mock;

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe("ArtistsList", () => {
  const mockArtists = [
    {
      _id: "1",
      _type: "artist" as const,
      _createdAt: "2024-01-01T00:00:00Z",
      _updatedAt: "2024-01-01T00:00:00Z",
      _rev: "rev1",
      slug: { current: "artist-1", _type: "slug" as const },
      name: "Artist One",
      program: "Residency" as const,
      locations: ["New York"],
      image: { _type: "image" as const, alt: "test" },
    },
    {
      _id: "2",
      _type: "artist" as const,
      _createdAt: "2024-01-02T00:00:00Z",
      _updatedAt: "2024-01-02T00:00:00Z",
      _rev: "rev2",
      slug: { current: "artist-2", _type: "slug" as const },
      name: "Artist Two",
      program: "Re-Fest" as const,
      locations: ["LA"],
      image: { _type: "image" as const, alt: "test" },
    },
  ];

  const mockLocationOptions = ["New York", "LA", "Nowhere"];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetArtists.mockResolvedValue(mockArtists);
    mockGetArtistsByLocations.mockResolvedValue(mockArtists);
  });

  it("renders initial artists when provided", async () => {
    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // Should show initial artists
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Artist Two")).toBeInTheDocument();
  });

  it("renders filter select with options", async () => {
    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // Should render the select element
    const select = screen.getByRole("listbox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute("multiple", "");

    mockLocationOptions.forEach((location) => {
      expect(screen.getByText(location)).toBeInTheDocument();
    });
  });

  it("fetches and displays artists when no initial artists provided", async () => {
    mockGetArtists.mockResolvedValue(mockArtists);

    await act(async () => {
      render(
        <ArtistsList
          initialArtists={[]}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // Should call getArtists
    expect(mockGetArtists).toHaveBeenCalledTimes(1);

    // Should show artists after fetching
    await waitFor(() => {
      expect(screen.getByText("Artist One")).toBeInTheDocument();
      expect(screen.getByText("Artist Two")).toBeInTheDocument();
    });
  });

  it("filters artists when location is selected", async () => {
    const filteredArtists = [mockArtists[0]];
    mockGetArtistsByLocations.mockResolvedValue(filteredArtists);

    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // Get the select element
    const select = screen.getByRole("listbox");

    await act(async () => {
      fireEvent.change(select, { target: { value: "New York" } });
    });

    await waitFor(() => {
      expect(mockGetArtistsByLocations).toHaveBeenCalledWith(["New York"]);
    });
  });

  it("shows empty state when no artists are found", async () => {
    mockGetArtists.mockResolvedValue([]);

    await act(async () => {
      render(
        <ArtistsList
          initialArtists={[]}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // After loading, should show empty list (no artist names)
    await waitFor(() => {
      expect(screen.queryByText("Artist One")).not.toBeInTheDocument();
      expect(screen.queryByText("Artist Two")).not.toBeInTheDocument();
    });
  });

  it("handles artist links correctly", async () => {
    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          locationOptions={mockLocationOptions}
        />,
      );
    });

    // Check that links are created with correct hrefs
    const link1 = screen.getByText("Artist One").closest("a");
    const link2 = screen.getByText("Artist Two").closest("a");

    expect(link1).toHaveAttribute("href", "/artists/artist-1");
    expect(link2).toHaveAttribute("href", "/artists/artist-2");
  });
});
