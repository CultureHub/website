import { formatEventStartTime } from "@/util/event-date";

export interface CalendarEventDate {
  start: string;
  end: string;
}

export interface CalendarEventRef {
  _id: string;
  title: string;
  slug: string;
  dateTimes: CalendarEventDate[];
  timezoneLabel?: string | null;
}

export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDayKey(a) === toDayKey(b);
}

export function eventStartDayKey(event: CalendarEventRef): string | null {
  const times = event.dateTimes ?? [];
  if (times.length === 0) return null;
  const starts = times
    .map((t) => new Date(t.start))
    .sort((a, b) => a.getTime() - b.getTime());
  return toDayKey(starts[0]);
}

export function getEventsForDayKey<T extends CalendarEventRef>(
  events: T[],
  key: string,
): T[] {
  return events.filter((e) => eventStartDayKey(e) === key);
}

export function getEventsForDay<T extends CalendarEventRef>(
  events: T[],
  day: Date,
): T[] {
  return getEventsForDayKey(events, toDayKey(day));
}

export function countEventsInCurrentWeek<T extends CalendarEventRef>(
  events: T[],
  today: Date = new Date(),
): number {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return events.filter((e) => {
    const key = eventStartDayKey(e);
    if (!key) return false;
    const d = new Date(`${key}T00:00:00`);
    return d >= weekStart && d < weekEnd;
  }).length;
}

export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      ),
    );
  }
  return days;
}

export function formatToday(date: Date = new Date()): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    date,
  );
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date,
  );
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `Today is ${weekday}, ${month} ${day}${ordinal}, ${date.getFullYear()}`;
}

export function formatDayHoverLine<T extends CalendarEventRef>(
  events: T[],
): string {
  return events
    .map((e) => {
      const first = e.dateTimes?.[0];
      if (!first) return e.title;
      return `${e.title}, ${formatEventStartTime(first, e.timezoneLabel ?? undefined)}`;
    })
    .join("\n");
}
