import { render, screen, fireEvent } from "@testing-library/react";
import Menu from "@/components/Menu";

it("links Editorial and Read to the new index and closes the menu on activation", () => {
  render(<Menu />);
  fireEvent.click(
    screen.getByRole("button", { name: "CultureHub logo arrow" }),
  );
  expect(screen.getByRole("link", { name: "Editorial" })).toHaveAttribute(
    "href",
    "/read",
  );
  const read = screen.getByRole("link", { name: "Read" });
  expect(read).toHaveAttribute("href", "/read");
  // Prevent jsdom's unsupported document navigation, not the menu's handler.
  read.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(read);
  expect(screen.queryByRole("link", { name: "Read" })).not.toBeInTheDocument();
});
