"use client";

import { useState } from "react";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildMonthGrid,
  countEventsInCurrentWeek,
  formatDayHoverLine,
  getEventsForDay,
  getEventsForDayKey,
  isSameDay,
  toDayKey,
} from "@/util/events-calendar";
import { useToday } from "@/util/use-today";
import type { EventListItem } from "@/sanity/queries";

export default function EventsCalendar({
  events,
  hoveredDayKey,
  onDayClick,
  onDayHover,
}: {
  events: EventListItem[];
  hoveredDayKey: string | null;
  onDayClick: (day: Date, dayEvents: EventListItem[]) => void;
  onDayHover: (key: string | null) => void;
}) {
  const today = useToday();
  const [monthOffset, setMonthOffset] = useState(0);

  if (!today) {
    return (
      <div className="w-[329px] h-[329px] bg-ch-lite" aria-hidden="true" />
    );
  }

  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const view = { year: base.getFullYear(), month: base.getMonth() };

  const days = buildMonthGrid(view.year, view.month);
  const weekCount = countEventsInCurrentWeek(events, today);
  const hoverEvents = hoveredDayKey
    ? getEventsForDayKey(events, hoveredDayKey)
    : [];
  const statusLine = hoveredDayKey
    ? formatDayHoverLine(hoverEvents)
    : `There ${weekCount === 1 ? "is" : "are"} ${weekCount} event${
        weekCount === 1 ? "" : "s"
      } this week.`;

  const prevMonth = () => setMonthOffset((o) => o - 1);
  const nextMonth = () => setMonthOffset((o) => o + 1);

  return (
    <div className="flex flex-col items-center gap-[13px] w-[329px] bg-ch-lite py-[3px]">
      <span className="font-brook text-base uppercase text-ch-midnite">
        {MONTH_LABELS[view.month]} {view.year}
      </span>

      <div className="flex flex-row items-center gap-[15px]">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-3 h-6 text-ch-midnite"
        >
          &lsaquo;
        </button>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((d) => (
            <span
              key={d}
              className="font-brook text-base text-ch-midnite w-[29px] text-center"
            >
              {d}
            </span>
          ))}
        </div>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-3 h-6 text-ch-midnite"
        >
          &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = toDayKey(day);
          const inMonth =
            day.getMonth() === view.month && day.getFullYear() === view.year;
          const dayEvents = getEventsForDay(events, day);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={key}
              onClick={() => onDayClick(day, dayEvents)}
              onMouseEnter={() => onDayHover(dayEvents.length ? key : null)}
              onMouseLeave={() => onDayHover(null)}
              className={`flex flex-col items-center justify-center w-[29px] h-[20px] rounded-full ${
                isToday
                  ? "bg-ch-midnite text-ch-lite"
                  : inMonth
                    ? "text-ch-midnite"
                    : "text-neutral-400"
              }`}
            >
              <span className="font-milling text-base leading-none">
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && !isToday && (
                <span className="block w-1 h-1 rounded-full bg-ch-midnite" />
              )}
            </button>
          );
        })}
      </div>

      <span className="font-brook text-base text-ch-midnite text-center whitespace-pre-line">
        {statusLine}
      </span>
    </div>
  );
}
