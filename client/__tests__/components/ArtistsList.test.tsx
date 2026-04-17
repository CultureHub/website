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
  getArtistsByMediums: jest.fn(),
  getArtists: jest.fn(),
}));

import * as Queries from "@/sanity/queries";

const mockGetArtists = Queries.getArtists as jest.Mock;
const mockGetArtistsByMediums = Queries.getArtistsByMediums as jest.Mock;

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
      medium: ["AI" as const],
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
      medium: ["Education" as const],
      image: { _type: "image" as const, alt: "test" },
    },
  ];

  const mockMediumOptions = ["AI", "Education", "Installation"];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetArtists.mockResolvedValue(mockArtists);
    mockGetArtistsByMediums.mockResolvedValue(mockArtists);
  });

  it("renders initial artists when provided", async () => {
    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          mediumOptions={mockMediumOptions}
        />,
      );
    });

    // Should show initial artists
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Artist Two")).toBeInTheDocument();
  });

  it("renders medium filter select with options", async () => {
    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          mediumOptions={mockMediumOptions}
        />,
      );
    });

    // Should render the select element
    const select = screen.getByRole("listbox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute("multiple", "");

    // Should render all medium options
    mockMediumOptions.forEach((medium) => {
      expect(screen.getByText(medium)).toBeInTheDocument();
    });
  });

  it("fetches and displays artists when no initial artists provided", async () => {
    mockGetArtists.mockResolvedValue(mockArtists);

    await act(async () => {
      render(
        <ArtistsList initialArtists={[]} mediumOptions={mockMediumOptions} />,
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

  it("filters artists when medium is selected", async () => {
    const filteredArtists = [mockArtists[0]]; // Only AI artists
    mockGetArtistsByMediums.mockResolvedValue(filteredArtists);

    await act(async () => {
      render(
        <ArtistsList
          initialArtists={mockArtists}
          mediumOptions={mockMediumOptions}
        />,
      );
    });

    // Get the select element
    const select = screen.getByRole("listbox");

    // Simulate selecting a medium by changing the value
    // For a multiple select, we need to simulate the change event properly
    await act(async () => {
      fireEvent.change(select, { target: { value: "AI" } });
    });

    // Should call getArtistsByMediums with selected medium
    await waitFor(() => {
      expect(mockGetArtistsByMediums).toHaveBeenCalledWith(["AI"]);
    });
  });

  it("shows empty state when no artists are found", async () => {
    mockGetArtists.mockResolvedValue([]);

    await act(async () => {
      render(
        <ArtistsList initialArtists={[]} mediumOptions={mockMediumOptions} />,
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
          mediumOptions={mockMediumOptions}
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
