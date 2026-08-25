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
});
