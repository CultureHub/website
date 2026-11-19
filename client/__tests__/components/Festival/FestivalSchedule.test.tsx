import { render, screen } from "@testing-library/react";
import { FestivalSchedule } from "@/components/Festival/FestivalSchedule";
import type { FestivalLocation } from "@/sanity/queries";

const schedule = {
  days: [
    {
      _key: "day-1",
      dateLabel: "Thursday, March 6th",
      items: [
        {
          _key: "item-1",
          time: "6-9PM",
          description: "Festival Opening",
          links: [
            {
              _key: "link-1",
              label: "RSVP",
              url: "https://example.com/rsvp",
            },
          ],
        },
      ],
    },
  ],
} as unknown as NonNullable<FestivalLocation["schedule"]>;

it("renders schedule days, times, descriptions, and links", () => {
  render(<FestivalSchedule schedule={schedule} />);

  expect(screen.getByText("Thursday, March 6th")).toBeInTheDocument();
  expect(screen.getByText("6-9PM")).toBeInTheDocument();
  expect(screen.getByText("Festival Opening")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /RSVP/ })).toHaveAttribute(
    "href",
    "https://example.com/rsvp",
  );
});

it("renders nothing for an empty schedule", () => {
  const { container } = render(
    <FestivalSchedule schedule={{ days: [] } as never} />,
  );
  expect(container).toBeEmptyDOMElement();
});
