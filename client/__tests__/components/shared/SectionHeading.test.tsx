import { render, screen } from "@testing-library/react";
import SectionHeading from "@/components/shared/SectionHeading";

it("renders the heading text", () => {
  render(<SectionHeading title="Festival Archive" />);
  expect(
    screen.getByRole("heading", { name: "Festival Archive" }),
  ).toBeInTheDocument();
});
