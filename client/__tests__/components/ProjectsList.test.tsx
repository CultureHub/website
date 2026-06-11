import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ProjectsList, { type ProjectRow } from "@/components/ProjectsList";

jest.mock("@/sanity/queries", () => ({
  getProjects: jest.fn(),
  getProjectFacets: jest.fn(),
}));

jest.mock("@/components/SanityImage", () => {
  return function MockSanityImage() {
    return null;
  };
});

const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

import * as Queries from "@/sanity/queries";
const mockGetProjects = Queries.getProjects as jest.Mock;
const mockGetProjectFacets = Queries.getProjectFacets as jest.Mock;

let intersectCallback: IntersectionObserverCallback | null = null;

function setupIntersectionObserver() {
  intersectCallback = null;
  (global as unknown as Record<string, unknown>).IntersectionObserver = jest
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => {
      intersectCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
}

function triggerIntersection() {
  if (intersectCallback) {
    intersectCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  }
}

const mockSlug = (current: string) => ({
  _type: "slug" as const,
  current,
});

const mockHeroImage = {
  asset: null,
  hotspot: null,
  crop: null,
  alt: "",
};

const mockPrograms = [
  {
    _id: "prog1",
    title: "Experiments in Digital Storytelling",
    slug: mockSlug("eds"),
    shortLabel: "EDS",
    accentColor: "#b5fd8b",
  },
  {
    _id: "prog2",
    title: "Residency",
    slug: mockSlug("residency"),
    shortLabel: "Residency",
    accentColor: "#6dcffd",
  },
];

const mockPlaces = ["New York", "Los Angeles"];
const mockYears = ["2025", "2024"];

const mockProjectRow = (overrides: Partial<ProjectRow> = {}): ProjectRow =>
  ({
    _id: "proj1",
    title: "Test Project",
    slug: mockSlug("test-project"),
    date: "2025-06-27",
    endDate: null,
    locations: ["New York"],
    program: {
      _id: "prog1",
      title: "Experiments in Digital Storytelling",
      slug: mockSlug("eds"),
      shortLabel: "EDS",
      accentColor: "#b5fd8b",
    },
    artists: [{ _id: "art1", name: "Artist One" }],
    heroImage: mockHeroImage,
    ...overrides,
  }) as ProjectRow;

const mockInitialData = {
  projects: [
    mockProjectRow(),
    mockProjectRow({
      _id: "proj2",
      title: "Second Project",
      slug: mockSlug("second-project"),
      date: "2024-12-01",
      endDate: "2024-12-03",
      locations: ["Los Angeles"],
      program: {
        _id: "prog2",
        title: "Residency",
        slug: mockSlug("residency"),
        shortLabel: "Residency",
        accentColor: "#6dcffd",
      },
      artists: [
        { _id: "art2", name: "Artist Two" },
        { _id: "art3", name: "Artist Three" },
      ],
    }),
  ],
  total: 50,
};

function renderList(overrides = {}) {
  return render(
    <ProjectsList
      initialData={mockInitialData}
      allPrograms={mockPrograms}
      allPlaces={mockPlaces}
      allYears={mockYears}
      {...overrides}
    />,
  );
}

describe("ProjectsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupIntersectionObserver();
    mockGetProjects.mockResolvedValue(mockInitialData);
  });

  it("renders initial projects", async () => {
    await act(async () => {
      renderList();
    });

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Second Project")).toBeInTheDocument();
  });

  it("renders filter category buttons and showing counter", async () => {
    await act(async () => {
      renderList();
    });

    expect(screen.getByText("Showing: All (50)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Program" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Year" })).toBeInTheDocument();
    expect(screen.getByText("Work Index")).toBeInTheDocument();
    expect(screen.getByText("Filter by")).toBeInTheDocument();
  });

  it("renders column headers", async () => {
    await act(async () => {
      renderList();
    });

    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent);
    expect(headerTexts).toEqual(
      expect.arrayContaining(["Date", "Program", "Place", "Project", "People"]),
    );
  });

  it("toggles filter items panel when category button is clicked", async () => {
    await act(async () => {
      renderList();
    });

    const programButton = screen.getByRole("button", { name: "Program" });
    await act(async () => {
      fireEvent.click(programButton);
    });

    expect(screen.getByRole("button", { name: "EDS" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Residency" }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(programButton);
    });

    expect(
      screen.queryByRole("button", { name: "EDS" }),
    ).not.toBeInTheDocument();
  });

  it("switches filter panel when a different category is clicked", async () => {
    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    expect(screen.getByRole("button", { name: "EDS" })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });

    expect(
      screen.queryByRole("button", { name: "EDS" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New York" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Los Angeles" }),
    ).toBeInTheDocument();
  });

  it("selects a filter option and fetches projects", async () => {
    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(mockGetProjects).toHaveBeenCalledWith(
        { program: "eds" },
        expect.any(Number),
        0,
      );
    });
  });

  it("shows tag chip for active filter", async () => {
    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Showing: EDS (1)")).toBeInTheDocument();
    });
  });

  it("removes filter when tag x is clicked", async () => {
    mockGetProjects
      .mockResolvedValueOnce({
        projects: [mockInitialData.projects[0]],
        total: 1,
      })
      .mockResolvedValueOnce(mockInitialData);

    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Showing: EDS (1)")).toBeInTheDocument();
    });

    const xButton = screen.getByText("x");
    await act(async () => {
      fireEvent.click(xButton);
    });

    await waitFor(() => {
      expect(mockGetProjects).toHaveBeenCalledWith({}, expect.any(Number), 0);
    });
  });

  it("greys out unavailable options", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(mockGetProjectFacets).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });

    const laOption = screen.getByRole("button", { name: "Los Angeles" });
    expect(laOption.className).toContain("cursor-not-allowed");
  });

  it("greys out unavailable programs when a place is selected first", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "New York" }));
    });

    await waitFor(() => {
      expect(mockGetProjectFacets).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    const edsOption = screen.getByRole("button", { name: "EDS" });
    expect(edsOption.className).not.toContain("cursor-not-allowed");

    const residencyOption = screen.getByRole("button", { name: "Residency" });
    expect(residencyOption.className).toContain("cursor-not-allowed");
  });

  it("selects a year filter and fetches projects", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds", "residency"],
      places: ["New York", "Los Angeles"],
      dates: ["2025-06-27", "2024-12-01"],
    });

    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Year" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "2025" }));
    });

    await waitFor(() => {
      expect(mockGetProjects).toHaveBeenCalledWith(
        { year: "2025" },
        expect.any(Number),
        0,
      );
    });
  });

  it("greys out year options that have no results for current filters", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(mockGetProjectFacets).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Year" }));
    });

    const year2025 = screen.getByRole("button", { name: "2025" });
    expect(year2025.className).not.toContain("cursor-not-allowed");

    const year2024 = screen.getByRole("button", { name: "2024" });
    expect(year2024.className).toContain("cursor-not-allowed");
  });

  it("resets greyed out options when filters are cleared", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    mockGetProjects
      .mockResolvedValueOnce({
        projects: [mockInitialData.projects[0]],
        total: 1,
      })
      .mockResolvedValueOnce(mockInitialData);

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(mockGetProjectFacets).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });

    const laOption = screen.getByRole("button", { name: "Los Angeles" });
    expect(laOption.className).toContain("cursor-not-allowed");

    await act(async () => {
      fireEvent.click(screen.getByText("x"));
    });

    await waitFor(() => {
      expect(screen.getByText("Showing: All (50)")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place" }));
    });

    const laOptionAfterClear = screen.getByRole("button", {
      name: "Los Angeles",
    });
    expect(laOptionAfterClear.className).not.toContain("cursor-not-allowed");
    expect(
      screen.getByRole("button", { name: "New York" }).className,
    ).not.toContain("cursor-not-allowed");
  });

  it("closes filter panel when clicking outside", async () => {
    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    expect(screen.getByRole("button", { name: "EDS" })).toBeInTheDocument();

    await act(async () => {
      fireEvent.mouseDown(document.body);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "EDS" }),
      ).not.toBeInTheDocument();
    });
  });

  it("triggers load more on intersection", async () => {
    await act(async () => {
      renderList();
    });

    await act(async () => {
      triggerIntersection();
    });

    await waitFor(() => {
      expect(mockGetProjects).toHaveBeenCalled();
    });
  });

  it("formats single dates correctly", async () => {
    await act(async () => {
      renderList();
    });

    expect(screen.getByText("06.27.25")).toBeInTheDocument();
  });

  it("formats date ranges correctly", async () => {
    await act(async () => {
      renderList();
    });

    const dateText = screen.getByText(/12\.01\.24/i);
    expect(dateText).toBeInTheDocument();
  });

  it("renders artist names", async () => {
    await act(async () => {
      renderList();
    });

    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Artist Two, Artist Three")).toBeInTheDocument();
  });

  it("creates correct project links", async () => {
    await act(async () => {
      renderList();
    });

    const firstRow = screen.getByText("Test Project").closest("tr")!;
    fireEvent.click(firstRow);
    expect(mockRouterPush).toHaveBeenCalledWith("/projects/test-project");

    const secondRow = screen.getByText("Second Project").closest("tr")!;
    fireEvent.click(secondRow);
    expect(mockRouterPush).toHaveBeenCalledWith("/projects/second-project");
  });

  it("shows empty state when no projects", async () => {
    const emptyData = { projects: [], total: 0 };

    await act(async () => {
      render(
        <ProjectsList
          initialData={emptyData}
          allPrograms={mockPrograms}
          allPlaces={mockPlaces}
          allYears={mockYears}
        />,
      );
    });

    expect(screen.getByText("No projects found.")).toBeInTheDocument();
  });

  it("shows filtered count with selected value when filters active", async () => {
    mockGetProjectFacets.mockResolvedValue({
      programSlugs: ["eds"],
      places: ["New York"],
      dates: ["2025-06-27"],
    });

    mockGetProjects.mockResolvedValue({
      projects: [mockInitialData.projects[0]],
      total: 1,
    });

    await act(async () => {
      renderList();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Program" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "EDS" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Showing: EDS (1)")).toBeInTheDocument();
    });
  });
});
