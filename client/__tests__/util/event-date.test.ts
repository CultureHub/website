import { formatEventDates } from "@/util/event-date";

describe("formatEventDates", () => {
  it("returns null for empty array", () => {
    expect(formatEventDates([])).toBeNull();
  });

  it("formats a single day with single time range", () => {
    const result = formatEventDates([
      { start: "2026-06-03T18:00:00-04:00", end: "2026-06-03T20:00:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("Wednesday, June 3, 2026");
    expect(result?.timeDescription).toBe("6\u20138PM");
  });

  it("formats a single day with two time slots", () => {
    const result = formatEventDates([
      { start: "2026-05-28T14:00:00-04:00", end: "2026-05-28T16:00:00-04:00" },
      { start: "2026-05-28T19:00:00-04:00", end: "2026-05-28T21:00:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("Thursday, May 28, 2026");
    expect(result?.timeDescription).toMatch(/Thursday/);
    expect(result?.timeDescription).toMatch(/2.*PM/);
    expect(result?.timeDescription).toMatch(/7.*PM/);
  });

  it("formats multi-day with same time each day", () => {
    const result = formatEventDates([
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201310, 2026");
    expect(result?.timeDescription).toMatch(/Thursday.*Friday/);
    expect(result?.timeDescription).toMatch(/7.*PM/);
  });

  it("formats three-day run with varied times per day", () => {
    const result = formatEventDates([
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
      { start: "2026-04-11T16:00:00-04:00", end: "2026-04-11T17:30:00-04:00" },
      { start: "2026-04-11T19:30:00-04:00", end: "2026-04-11T21:00:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201311, 2026");
    expect(result?.timeDescription).toMatch(/Thursday/);
    expect(result?.timeDescription).toMatch(/Friday/);
    expect(result?.timeDescription).toMatch(/Saturday/);
  });

  it("handles multi-month range", () => {
    const result = formatEventDates([
      { start: "2026-05-28T14:00:00-04:00", end: "2026-05-28T16:00:00-04:00" },
      { start: "2026-06-03T18:00:00-04:00", end: "2026-06-03T20:00:00-04:00" },
    ]);
    expect(result?.dateRange).toMatch("May");
    expect(result?.dateRange).toMatch("June");
  });

  it("handles unsorted entries", () => {
    const result = formatEventDates([
      { start: "2026-04-10T19:00:00-04:00", end: "2026-04-10T20:30:00-04:00" },
      { start: "2026-04-09T19:00:00-04:00", end: "2026-04-09T20:30:00-04:00" },
    ]);
    expect(result?.dateRange).toBe("April 9\u201310, 2026");
  });

  it("handles cross-year range", () => {
    const result = formatEventDates([
      { start: "2026-12-31T20:00:00-05:00", end: "2026-12-31T23:59:00-05:00" },
      { start: "2027-01-01T14:00:00-05:00", end: "2027-01-01T16:00:00-05:00" },
    ]);
    expect(result?.dateRange).toMatch("2026");
    expect(result?.dateRange).toMatch("2027");
  });
});
