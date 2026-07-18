interface DateTimeRange {
  start: string;
  end: string;
}

interface FormattedEventDates {
  dateRange: string;
  timeDescription: string;
}

function parseDate(iso: string): Date {
  return new Date(iso);
}

function formatTime(date: Date, includeAmPm = true): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  if (minutes === 0) return `${hours}${includeAmPm ? ampm : ""}`;
  return `${hours}:${String(minutes).padStart(2, "0")}${includeAmPm ? ampm : ""}`;
}

function formatTimeRange(start: Date, end: Date): string {
  const startH = start.getHours();
  const endH = end.getHours();
  const startAmPm = startH >= 12 ? "PM" : "AM";
  const endAmPm = endH >= 12 ? "PM" : "AM";
  if (startAmPm === endAmPm) {
    return `${formatTime(start, false)}\u2013${formatTime(end, true)}`;
  }
  return `${formatTime(start, true)}\u2013${formatTime(end, true)}`;
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
}

function formatNumericDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date);
}

function formatYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date);
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isNextDay(a: Date, b: Date): boolean {
  const aNext = new Date(a);
  aNext.setDate(aNext.getDate() + 1);
  return (
    aNext.getFullYear() === b.getFullYear() &&
    aNext.getMonth() === b.getMonth() &&
    aNext.getDate() === b.getDate()
  );
}

function isConsecutiveDays(dates: Date[]): boolean {
  for (let i = 1; i < dates.length; i++) {
    if (!isNextDay(dates[i - 1], dates[i])) return false;
  }
  return true;
}

function getTimePattern(entries: { start: Date; end: Date }[]): string {
  return entries
    .map(
      (e) =>
        `${e.start.getHours()}:${e.start.getMinutes()}-${e.end.getHours()}:${e.end.getMinutes()}`,
    )
    .join(",");
}

function formatDateRange(dates: Date[]): string {
  if (dates.length === 1) {
    return formatLongDate(dates[0]);
  }

  const allSameYear = dates.every(
    (d) => d.getFullYear() === dates[0].getFullYear(),
  );
  const allSameMonth =
    allSameYear && dates.every((d) => d.getMonth() === dates[0].getMonth());
  const consecutive = isConsecutiveDays(dates);

  if (consecutive && allSameMonth) {
    const month = formatMonth(dates[0]);
    const firstDay = formatNumericDay(dates[0]);
    const lastDay = formatNumericDay(dates[dates.length - 1]);
    return `${month} ${firstDay}\u2013${lastDay}, ${formatYear(dates[0])}`;
  }

  const parts = dates.map((d) => {
    const monthDay = `${formatMonth(d)} ${formatNumericDay(d)}`;
    if (!allSameYear) {
      return `${monthDay}, ${formatYear(d)}`;
    }
    return monthDay;
  });

  if (allSameYear) {
    return `${parts.join(" & ")}, ${formatYear(dates[0])}`;
  }
  return parts.join(" & ");
}

export function formatEventDates(
  dateTimes: DateTimeRange[],
): FormattedEventDates | null {
  if (dateTimes.length === 0) return null;

  const parsed = dateTimes
    .map((dt) => ({ start: parseDate(dt.start), end: parseDate(dt.end) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const dayGroups: {
    key: string;
    date: Date;
    entries: { start: Date; end: Date }[];
  }[] = [];
  for (const entry of parsed) {
    const key = getDateKey(entry.start);
    const last = dayGroups[dayGroups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      dayGroups.push({ key, date: entry.start, entries: [entry] });
    }
  }

  const dateRange = formatDateRange(dayGroups.map((g) => g.date));
  const timeDescription = formatTimeDescription(dayGroups);

  return { dateRange, timeDescription };
}

function formatTimeDescription(
  dayGroups: {
    date: Date;
    entries: { start: Date; end: Date }[];
  }[],
): string {
  const timeGroups: {
    dates: Date[];
    entries: { start: Date; end: Date }[];
  }[] = [];
  for (const group of dayGroups) {
    const pattern = getTimePattern(group.entries);
    const last = timeGroups[timeGroups.length - 1];
    if (
      last &&
      getTimePattern(last.entries) === pattern &&
      isNextDay(last.dates[last.dates.length - 1], group.date)
    ) {
      last.dates.push(group.date);
    } else {
      timeGroups.push({ dates: [group.date], entries: group.entries });
    }
  }

  const parts = timeGroups.map((group) => {
    if (group.dates.length === 1) {
      const date = group.dates[0];
      const weekday = formatWeekday(date);
      const timeRanges = group.entries.map((e) =>
        formatTimeRange(e.start, e.end),
      );
      if (timeRanges.length === 1) {
        return timeRanges[0];
      } else {
        return `${weekday}: ${timeRanges.join(" & ")}`;
      }
    } else {
      const dayNames = group.dates.map((d) => formatWeekday(d));
      const timeRanges = group.entries.map((e) =>
        formatTimeRange(e.start, e.end),
      );
      return `${dayNames.join(" & ")} at ${timeRanges.join(" & ")}`;
    }
  });

  return parts.join(", ");
}
