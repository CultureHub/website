import { render, screen } from "@testing-library/react";
import SectionHeading from "@/components/shared/SectionHeading";

it("renders the heading text", () => {
  render(<SectionHeading title="Festival Archive" />);
  expect(
    screen.getByRole("heading", { name: "Festival Archive" }),
  ).toBeInTheDocument();
});

it("can omit the top border for existing single-border headings", () => {
  const { container } = render(
    <SectionHeading title="Recent Projects" borderTop={false} />,
  );
  expect((container.firstChild as HTMLElement).className).not.toMatch(
    /\bborder-t\b/,
  );
});

it("keeps the top border by default", () => {
  const { container } = render(<SectionHeading title="Featured Artists" />);
  expect((container.firstChild as HTMLElement).className).toMatch(
    /\bborder-t\b/,
  );
});
