import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ArtistDirectory from "@/components/Community/ArtistDirectory";
import type { GetArtistDirectoryQueryResult } from "@/sanity/types";

const mockSlug = (current: string) => ({
  _type: "slug" as const,
  current,
});

const mockArtists: GetArtistDirectoryQueryResult = [
  {
    _id: "a1",
    name: "Alice",
    slug: mockSlug("alice"),
    locations: ["New York"],
    programs: [{ _id: "p1", shortLabel: "Residency" }],
  },
  {
    _id: "b1",
    name: "Bob",
    slug: mockSlug("bob"),
    locations: ["Los Angeles"],
    programs: [{ _id: "p2", shortLabel: "CoLab" }],
  },
  {
    _id: "c1",
    name: "Charlie",
    slug: mockSlug("charlie"),
    locations: ["New York"],
    programs: [{ _id: "p1", shortLabel: "Residency" }],
  },
];

describe("ArtistDirectory", () => {
  let scrollIntoViewSpy: jest.Mock;

  beforeEach(() => {
    scrollIntoViewSpy = jest.fn();
    (
      Element.prototype as unknown as { scrollIntoView: () => void }
    ).scrollIntoView = scrollIntoViewSpy;
  });

  afterEach(() => {
    delete (Element.prototype as unknown as { scrollIntoView?: unknown })
      .scrollIntoView;
  });

  it("renders all artists and the initial showing label", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    expect(screen.getAllByText("Showing: All (3)")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Alice")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Bob")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Charlie")[0]).toBeInTheDocument();
  });

  it("renders the three filter tabs", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    expect(
      screen.getAllByRole("button", { name: "Letter" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Program" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Place" })[0],
    ).toBeInTheDocument();
  });

  it("greys out letters with no artists", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Letter" })[0]);

    const a = screen.getAllByRole("button", { name: "A" })[0];
    expect(a.className).not.toContain("cursor-not-allowed");

    const q = screen.getAllByRole("button", { name: "Q" })[0];
    expect(q.className).toContain("cursor-not-allowed");
    expect(q).toBeDisabled();
  });

  it("filters and updates the showing label when a letter is selected", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Letter" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "A" })[0]);

    expect(screen.getAllByText("Showing: A (1)")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Alice")[0]).toBeInTheDocument();
    expect(screen.queryAllByText("Bob").length).toBe(0);
    expect(screen.queryAllByText("Charlie").length).toBe(0);
  });

  it("greys out programs with no results given the current letter filter", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Letter" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "A" })[0]);

    fireEvent.click(screen.getAllByRole("button", { name: "Program" })[0]);

    const residency = screen.getAllByRole("button", { name: "Residency" })[0];
    expect(residency.className).not.toContain("cursor-not-allowed");

    const colab = screen.getAllByRole("button", { name: "CoLab" })[0];
    expect(colab.className).toContain("cursor-not-allowed");
    expect(colab).toBeDisabled();
  });

  it("groups artists under only the letters that have results", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    expect(document.getElementById("directory-letter-A")).toBeInTheDocument();
    expect(document.getElementById("directory-letter-B")).toBeInTheDocument();
    expect(document.getElementById("directory-letter-C")).toBeInTheDocument();
    expect(
      document.getElementById("directory-letter-D"),
    ).not.toBeInTheDocument();
  });

  it("scrolls to a letter section when the sticky letter is clicked", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    fireEvent.click(screen.getAllByRole("button", { name: "B" })[0]);

    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("shows a removable tag chip for the active filter", () => {
    render(<ArtistDirectory title="Artist Directory" artists={mockArtists} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Letter" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "A" })[0]);

    expect(screen.getAllByText("Showing: A (1)")[0]).toBeInTheDocument();
    expect(screen.getAllByText("x").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByText("x")[0]);

    expect(screen.getAllByText("Showing: All (3)")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Bob")[0]).toBeInTheDocument();
  });
});
