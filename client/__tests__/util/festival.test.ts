import {
  festivalAnchor,
  festivalDateLines,
  festivalHref,
  festivalLocationSummary,
  festivalNavItems,
} from "@/util/festival";

describe("festival helpers", () => {
  it("makes URL-safe anchors", () => {
    expect(festivalAnchor("New York")).toBe("new-york");
    expect(festivalAnchor("Virtual Gallery")).toBe("virtual-gallery");
    expect(festivalAnchor("Re–Fest & LA")).toBe("re-fest-la");
  });

  it("derives the archive location summary", () => {
    expect(festivalLocationSummary([{ name: "New York" }])).toBe("New York");
    expect(
      festivalLocationSummary([{ name: "New York" }, { name: "Los Angeles" }]),
    ).toBe("New York & Los Angeles");
    expect(
      festivalLocationSummary(
        [{ name: "New York" }, { name: "Los Angeles" }],
        "Worldwide",
      ),
    ).toBe("Worldwide");
  });

  it("formats date lines for the feature and preview", () => {
    expect(
      festivalDateLines([
        { name: "New York", kind: "in-person", dateLabel: "March 6-9th" },
        { name: "Los Angeles", kind: "in-person", dateLabel: "March 14-15th" },
        { name: "Virtual", kind: "virtual", dateLabel: "March 6-15th" },
      ]),
    ).toEqual([
      "March 6-9th in New York",
      "March 14-15th in Los Angeles",
      "March 6-15th",
    ]);
  });

  it("builds nav items with About first", () => {
    expect(
      festivalNavItems([
        { name: "New York" },
        { name: "Los Angeles" },
        { name: "Virtual Gallery" },
      ]),
    ).toEqual([
      { label: "About", anchor: "about" },
      { label: "New York", anchor: "new-york" },
      { label: "Los Angeles", anchor: "los-angeles" },
      { label: "Virtual Gallery", anchor: "virtual-gallery" },
    ]);
  });

  it("builds festival hrefs", () => {
    expect(festivalHref("2025")).toBe("/re-fest/2025");
  });
});
