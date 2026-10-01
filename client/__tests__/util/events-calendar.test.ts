import {
  buildMonthGrid,
  countEventsInCurrentWeek,
  formatDayHoverLine,
  formatToday,
  getEventsForDay,
  getEventsForDayKey,
  MONTH_LABELS,
  toDayKey,
} from "@/util/events-calendar";

const event = (id: string, starts: string[]) => ({
  _id: id,
  title: id,
  slug: id,
  timezoneLabel: null,
  dateTimes: starts.map((s) => ({ start: s, end: s })),
});

describe("events-calendar", () => {
  it("formats a day key", () => {
    expect(toDayKey(new Date(2026, 3, 6))).toBe("2026-04-06");
  });

  it("builds a 42-cell month grid anchored to Sunday", () => {
    const grid = buildMonthGrid(2026, 3); // April 2026
    expect(grid).toHaveLength(42);
    expect(toDayKey(grid[0])).toBe("2026-03-29"); // Sunday before April 1
    expect(grid[0].getDay()).toBe(0);
  });

  it("groups events by start day", () => {
    const events = [
      event("a", ["2026-04-06T18:00:00-04:00"]),
      event("b", ["2026-04-06T10:00:00-04:00"]),
      event("c", ["2026-04-07T18:00:00-04:00"]),
    ];
    const day = new Date(2026, 3, 6);
    expect(getEventsForDay(events, day).map((e) => e._id)).toEqual(["a", "b"]);
    expect(getEventsForDayKey(events, "2026-04-07").map((e) => e._id)).toEqual([
      "c",
    ]);
  });

  it("counts events in the current week", () => {
    const today = new Date(2026, 3, 6); // Monday April 6 2026
    const events = [
      event("in-week", ["2026-04-08T18:00:00-04:00"]),
      event("out-week", ["2026-04-13T18:00:00-04:00"]),
      event("before-week", ["2026-04-04T18:00:00-04:00"]),
    ];
    expect(countEventsInCurrentWeek(events, today)).toBe(1);
  });

  it("formats today's date with ordinal", () => {
    expect(formatToday(new Date(2026, 3, 6))).toBe(
      "Today is Monday, April 6th, 2026",
    );
    expect(formatToday(new Date(2026, 3, 2))).toBe(
      "Today is Thursday, April 2nd, 2026",
    );
  });

  it("formats the day hover line", () => {
    const events = [
      {
        _id: "a",
        title: "Castle Door",
        slug: "castle-door",
        timezoneLabel: "ET",
        dateTimes: [
          {
            start: "2026-04-09T19:00:00-04:00",
            end: "2026-04-09T20:30:00-04:00",
          },
        ],
      },
    ];
    expect(formatDayHoverLine(events)).toBe("Castle Door, 7pm ET");
  });

  it("exposes month labels", () => {
    expect(MONTH_LABELS[0]).toBe("JAN");
    expect(MONTH_LABELS[11]).toBe("DEC");
  });
});
