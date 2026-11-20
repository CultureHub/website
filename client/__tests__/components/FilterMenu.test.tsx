import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterMenu from "@/components/Filter/FilterMenu";

const CATEGORIES = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Gamma" },
];

function Harness() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <FilterMenu
      title="Test Index"
      categories={CATEGORIES}
      activeCategory={active}
      onToggleCategory={(k) => setActive((prev) => (prev === k ? null : k))}
      onClose={() => setActive(null)}
      showingLabel="Showing: All (5)"
      renderDesktopItems={(k) => <div data-testid="desktop-items">{k}</div>}
      renderMobileItems={(k) => <div data-testid="mobile-items">{k}</div>}
    />
  );
}

describe("FilterMenu", () => {
  it("renders title, filter label, categories, and showing label", () => {
    render(<Harness />);

    expect(screen.getAllByText("Test Index")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Filter by")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Showing: All (5)")[0]).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Alpha" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Beta" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Gamma" })[0],
    ).toBeInTheDocument();
  });

  it("applies active styles to the selected tab", () => {
    render(<Harness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Beta" })[0]);

    const betaButton = screen.getAllByRole("button", { name: "Beta" })[0];
    expect(betaButton.className).toContain("bg-ch-midnite");
    expect(betaButton.className).toContain("text-ch-lite");
  });

  it("renders items when a category is active, toggles off on second click", () => {
    render(<Harness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Alpha" })[0]);
    expect(screen.getByTestId("desktop-items")).toHaveTextContent("a");

    fireEvent.click(screen.getAllByRole("button", { name: "Alpha" })[0]);
    expect(screen.queryByTestId("desktop-items")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking outside", () => {
    render(<Harness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Gamma" })[0]);
    expect(screen.getByTestId("desktop-items")).toHaveTextContent("c");

    fireEvent.mouseDown(document.body);

    expect(screen.queryByTestId("desktop-items")).not.toBeInTheDocument();
  });

  it("closes on mobile scroll but leaves desktop categories open", () => {
    const original = window.innerWidth;
    render(<Harness />);
    fireEvent.click(screen.getAllByRole("button", { name: "Alpha" })[0]);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
    fireEvent.scroll(window);
    expect(screen.getByTestId("desktop-items")).toBeInTheDocument();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 440,
    });
    fireEvent.scroll(window);
    expect(screen.queryByTestId("desktop-items")).not.toBeInTheDocument();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: original,
    });
  });

  it("passes the category and border state through both default layout slots", () => {
    render(
      <FilterMenu
        title="Slots"
        categories={[{ key: "year", label: "Year" }]}
        activeCategory="year"
        onToggleCategory={() => {}}
        onClose={() => {}}
        showingLabel="All"
        hideBottomBorder
        renderDesktopItems={(key, border) => (
          <p>{`Desktop ${key}: ${border}`}</p>
        )}
        renderMobileItems={(key, border) => <p>{`Mobile ${key}: ${border}`}</p>}
      />,
    );
    expect(screen.getByText("Desktop year: true")).toBeInTheDocument();
    expect(screen.getByText("Mobile year: true")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Year" })).toHaveLength(2);
  });

  it("removes outside-click and scroll handlers on unmount", () => {
    const close = jest.fn();
    const { unmount } = render(
      <FilterMenu
        title="Cleanup"
        categories={CATEGORIES}
        activeCategory="a"
        onToggleCategory={() => {}}
        onClose={close}
        showingLabel="All"
      />,
    );
    unmount();
    fireEvent.mouseDown(document.body);
    fireEvent.scroll(window);
    expect(close).not.toHaveBeenCalled();
  });

  it("opts into an editorial heading and a single responsive year panel", () => {
    render(
      <FilterMenu
        layout="editorial"
        title="Article Index"
        categories={[{ key: "year", label: "Year" }]}
        activeCategory="year"
        onToggleCategory={() => {}}
        onClose={() => {}}
        showingLabel="Showing: 2026 (2)"
        renderDesktopItems={() => <button>2026</button>}
        renderMobileItems={() => <button>2026</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Article Index" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "2026" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Year" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
