import { render, screen } from "@testing-library/react";
import EditorialHeader from "@/components/Editorial/EditorialHeader";

it("provides Read navigation without linking to an unimplemented Watch route", () => {
  render(<EditorialHeader heading="Editorial" mode="read" />);
  expect(
    screen.getByRole("heading", { name: "Editorial", level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Read" })).toHaveAttribute(
    "href",
    "/read",
  );
  expect(screen.getByRole("link", { name: "Read" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.queryByRole("link", { name: "Watch" })).not.toBeInTheDocument();
  expect(screen.getByText("Watch")).toHaveAttribute("aria-disabled", "true");
});
