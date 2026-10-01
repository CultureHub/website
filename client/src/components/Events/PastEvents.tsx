"use client";

import { useMemo, useState } from "react";
import EventRow from "@/components/Events/EventRow";
import EventSummary from "@/components/Events/EventSummary";
import { MONTH_LABELS } from "@/util/events-calendar";
import {
  deriveMonths,
  deriveYears,
  filterPastEvents,
} from "@/util/events-filter";
import type { EventListItem } from "@/sanity/queries";

export default function PastEvents({
  events,
}: {
  events: EventListItem[] | null;
}) {
  const years = useMemo(() => (events ? deriveYears(events) : []), [events]);
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<EventListItem | null>(null);

  const activeYear = year ?? years[0] ?? null;
  const months = useMemo(
    () =>
      events && activeYear != null ? deriveMonths(events, activeYear) : [],
    [events, activeYear],
  );
  const filtered = useMemo(
    () => (events ? filterPastEvents(events, activeYear, month) : []),
    [events, activeYear, month],
  );

  if (!events) {
    return <div className="py-8 text-neutral-400 text-sm">Loading…</div>;
  }
  if (years.length === 0) {
    return <div className="py-8 text-neutral-400 text-sm">No past events.</div>;
  }

  const handleYearChange = (y: number) => {
    setYear(y);
    setMonth(null);
  };

  return (
    <div>
      <div className="border-t border-ch-midnite">
        <div className="ml-[150px] flex flex-row items-center">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => handleYearChange(y)}
              className={`px-[5px] py-[5px] w-[150px] h-[61px] font-milling text-xl border-r border-ch-midnite ${
                y === activeYear
                  ? "bg-ch-midnite text-ch-lite"
                  : "text-ch-midnite"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-ch-midnite flex flex-col md:flex-row">
        <div className="flex-1 min-w-0 flex flex-row">
          <div className="flex flex-col w-[97px] shrink-0 border-r border-ch-midnite">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setMonth((prev) => (prev === m ? null : m))}
                className={`w-[97px] h-[65px] font-brook text-xl uppercase ${
                  m === month ? "bg-ch-midnite text-ch-lite" : "text-ch-midnite"
                }`}
              >
                {MONTH_LABELS[m]}
              </button>
            ))}
          </div>
          <div
            className="flex flex-col flex-1 min-w-0 divide-y divide-ch-midnite"
            onMouseLeave={() => setHoveredEvent(null)}
          >
            {filtered.map((e) => (
              <EventRow
                key={e._id}
                event={e}
                onHover={() => setHoveredEvent(e)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 md:border-l border-ch-midnite">
          <EventSummary event={hoveredEvent ?? filtered[0] ?? null} />
        </div>
      </div>
    </div>
  );
}
