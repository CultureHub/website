import { render, screen } from "@testing-library/react";
import { PortableText } from "@/components/PortableText";

it("renders a qa block with question and answer", () => {
  render(
    <PortableText
      value={[
        {
          _type: "qa",
          _key: "a",
          question: "Who are you?",
          answer: [
            {
              _type: "block",
              _key: "b",
              style: "normal",
              children: [{ _type: "span", _key: "c", text: "An artist." }],
            },
          ],
        },
      ]}
    />,
  );
  expect(screen.getByText("Who are you?")).toBeInTheDocument();
  expect(screen.getByText("An artist.")).toBeInTheDocument();
});
