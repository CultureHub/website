import { parseDate } from "@/util/event-date";
import type { CalendarEventRef } from "@/util/events-calendar";

export type PastEventRef = CalendarEventRef;

function earliestStart(event: PastEventRef): Date | null {
  const times = event.dateTimes ?? [];
  if (times.length === 0) return null;
  const starts = times
    .map((t) => parseDate(t.start))
    .sort((a, b) => a.getTime() - b.getTime());
  const first = starts[0];
  return first && !Number.isNaN(first.getTime()) ? first : null;
}

export function eventYear(event: PastEventRef): number | null {
  const first = earliestStart(event);
  if (!first) return null;
  return first.getFullYear();
}

export function eventMonthIndex(event: PastEventRef): number | null {
  const first = earliestStart(event);
  if (!first) return null;
  return first.getMonth();
}

export function deriveYears<T extends PastEventRef>(events: T[]): number[] {
  const years = new Set<number>();
  for (const e of events) {
    const y = eventYear(e);
    if (y != null) years.add(y);
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function deriveMonths<T extends PastEventRef>(
  events: T[],
  year: number,
): number[] {
  const months = new Set<number>();
  for (const e of events) {
    if (eventYear(e) === year) {
      const m = eventMonthIndex(e);
      if (m != null) months.add(m);
    }
  }
  return Array.from(months).sort((a, b) => b - a);
}

export function filterPastEvents<T extends PastEventRef>(
  events: T[],
  year: number | null,
  month: number | null,
): T[] {
  return events.filter((e) => {
    if (year != null && eventYear(e) !== year) return false;
    if (month != null && eventMonthIndex(e) !== month) return false;
    return true;
  });
}
