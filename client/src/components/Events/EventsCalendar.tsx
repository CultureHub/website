"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildWeek,
  countEventsInWeek,
  formatDayHoverLine,
  getEventsForDay,
  getEventsForDayKey,
  isSameDay,
  toDayKey,
  weekStartOf,
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
  const [weekOffset, setWeekOffset] = useState(0);

  if (!today) {
    return (
      <div className="w-[329px] h-[120px] bg-ch-lite" aria-hidden="true" />
    );
  }

  const weekStart = new Date(weekStartOf(today));
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = buildWeek(weekStart);

  const weekCount = countEventsInWeek(events, weekStart);
  const hoverEvents = hoveredDayKey
    ? getEventsForDayKey(events, hoveredDayKey)
    : [];
  const statusLine = hoveredDayKey
    ? formatDayHoverLine(hoverEvents)
    : weekCount === 0
      ? "There are no events this week."
      : `There ${weekCount === 1 ? "is" : "are"} ${weekCount} event${
          weekCount === 1 ? "" : "s"
        } this week.`;

  const label = `${MONTH_LABELS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;

  const prevWeek = () => setWeekOffset((o) => Math.max(0, o - 1));
  const nextWeek = () => setWeekOffset((o) => o + 1);

  return (
    <div className="flex flex-col items-center gap-[13px] w-[329px] bg-ch-lite py-[3px]">
      <span className="font-brook text-base uppercase text-ch-midnite">
        {label}
      </span>

      <div className="flex flex-row items-center gap-[15px]">
        <button
          onClick={prevWeek}
          aria-label="Previous week"
          disabled={weekOffset === 0}
          className={`shrink-0 ${weekOffset === 0 ? "opacity-30" : ""}`}
        >
          <Image src="/left_arrow.svg" alt="" width={15} height={26} />
        </button>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const key = toDayKey(day);
            const dayEvents = getEventsForDay(events, day);
            const isToday = isSameDay(day, today);
            const isHovered = hoveredDayKey === key;
            const hasEvent = dayEvents.length > 0;
            const accentColor =
              dayEvents.length === 1
                ? (dayEvents[0].program?.accentColor ?? null)
                : null;

            let circleClass = "";
            let textColorClass = "text-ch-midnite";
            let weightClass = "";
            let bgStyle: { backgroundColor?: string } | undefined;

            if (isToday) {
              circleClass = "bg-ch-midnite border border-ch-midnite";
              textColorClass = "text-ch-lite";
            } else if (isHovered && hasEvent) {
              circleClass = "border border-ch-midnite";
              weightClass = "font-bold";
              if (accentColor) {
                bgStyle = { backgroundColor: accentColor };
              }
            } else if (hasEvent) {
              weightClass = "font-bold";
            }

            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <span className="font-brook text-base text-ch-midnite">
                  {WEEKDAY_LABELS[day.getDay()]}
                </span>
                <button
                  onClick={() => onDayClick(day, dayEvents)}
                  onMouseEnter={() => onDayHover(dayEvents.length ? key : null)}
                  onMouseLeave={() => onDayHover(null)}
                  style={bgStyle}
                  className={`flex items-center justify-center w-[29px] h-[20px] rounded-full font-milling text-base leading-none ${weightClass} ${circleClass} ${textColorClass}`}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={nextWeek} aria-label="Next week" className="shrink-0">
          <Image src="/right_arrow.svg" alt="" width={15} height={26} />
        </button>
      </div>

      <span className="font-brook text-base text-ch-midnite text-center whitespace-pre-line">
        {statusLine}
      </span>
    </div>
  );
}
