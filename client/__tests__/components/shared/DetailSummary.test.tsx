import { render, screen } from "@testing-library/react";
import Link from "next/link";
import DetailSummary from "@/components/shared/DetailSummary";

jest.mock("@/components/SanityImage", () => {
  return function MockImage() {
    return <div data-testid="sanity-image" />;
  };
});

it("renders title, meta, description, and actions", () => {
  render(
    <DetailSummary
      title={<h2>Re–Collect</h2>}
      meta={<span>March 6-9th in New York</span>}
      description={<p>A theme description.</p>}
      actions={<Link href="/re-fest/2025">Visit Festival</Link>}
    />,
  );

  expect(
    screen.getByRole("heading", { name: "Re–Collect" }),
  ).toBeInTheDocument();
  expect(screen.getByText("March 6-9th in New York")).toBeInTheDocument();
  expect(screen.getByText("A theme description.")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Visit Festival" }),
  ).toBeInTheDocument();
});

it("omits the image when none is provided", () => {
  render(<DetailSummary title={<h2>No image</h2>} />);
  expect(screen.queryByTestId("sanity-image")).not.toBeInTheDocument();
});
