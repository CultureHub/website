import {
  deriveMonths,
  deriveYears,
  eventMonthIndex,
  eventYear,
  filterPastEvents,
} from "@/util/events-filter";

const event = (id: string, start: string) => ({
  _id: id,
  title: id,
  slug: id,
  dateTimes: [{ start, end: start }],
});

describe("events-filter", () => {
  it("derives years descending", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2024-05-01T10:00:00-04:00"),
      event("c", "2025-01-01T10:00:00-05:00"),
    ];
    expect(deriveYears(events)).toEqual([2026, 2025, 2024]);
  });

  it("derives months within a year descending", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2026-01-01T10:00:00-05:00"),
      event("c", "2025-12-01T10:00:00-05:00"),
    ];
    expect(deriveMonths(events, 2026)).toEqual([2, 0]); // Mar, Jan
  });

  it("reads year and month index", () => {
    expect(eventYear(event("a", "2026-03-15T10:00:00-04:00"))).toBe(2026);
    expect(eventMonthIndex(event("a", "2026-03-15T10:00:00-04:00"))).toBe(2);
  });

  it("filters by year and month", () => {
    const events = [
      event("a", "2026-03-01T10:00:00-05:00"),
      event("b", "2026-01-01T10:00:00-05:00"),
      event("c", "2025-03-01T10:00:00-05:00"),
    ];
    expect(filterPastEvents(events, 2026, null).map((e) => e._id)).toEqual([
      "a",
      "b",
    ]);
    expect(filterPastEvents(events, 2026, 2).map((e) => e._id)).toEqual(["a"]);
    expect(filterPastEvents(events, null, null).map((e) => e._id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
