"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getPastEventsAction } from "@/app/events/actions";
import EventsCalendar from "@/components/Events/EventsCalendar";
import EventsEmptyState from "@/components/Events/EventsEmptyState";
import EventMonthHeader from "@/components/Events/EventMonthHeader";
import EventRow from "@/components/Events/EventRow";
import EventSummary from "@/components/Events/EventSummary";
import PastEvents from "@/components/Events/PastEvents";
import {
  eventStartDayKey,
  formatToday,
  toDayKey,
} from "@/util/events-calendar";
import { groupEventsByMonth } from "@/util/events-filter";
import { useToday } from "@/util/use-today";
import type { EventListItem } from "@/sanity/queries";

type Tab = "upcoming" | "past";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-[10px] py-[18px] w-[150px] font-milling text-xl ${
        active
          ? "bg-ch-midnite text-ch-lite"
          : "text-ch-midnite border-ch-midnite border-r"
      }`}
    >
      {children}
    </button>
  );
}

export function EventsExplorer({
  upcomingEvents,
}: {
  upcomingEvents: EventListItem[];
}) {
  const router = useRouter();
  const today = useToday();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [hoveredEvent, setHoveredEvent] = useState<EventListItem | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
  const [pastEvents, setPastEvents] = useState<EventListItem[] | null>(null);
  const [pastError, setPastError] = useState(false);
  const fetchingPastRef = useRef(false);

  useEffect(() => {
    if (tab === "past" && pastEvents === null && !fetchingPastRef.current) {
      fetchingPastRef.current = true;
      getPastEventsAction()
        .then((events) => setPastEvents(events))
        .catch(() => setPastError(true))
        .finally(() => {
          fetchingPastRef.current = false;
        });
    }
  }, [tab, pastEvents]);

  const filteredUpcoming = useMemo(() => {
    if (!selectedDayKey) return upcomingEvents;
    return upcomingEvents.filter((e) => eventStartDayKey(e) === selectedDayKey);
  }, [upcomingEvents, selectedDayKey]);

  const previewEvent = hoveredEvent ?? filteredUpcoming[0] ?? null;

  const selectedDayLabel = selectedDayKey
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${selectedDayKey}T00:00:00`))
    : null;

  const handleDayClick = useCallback(
    (day: Date, dayEvents: EventListItem[]) => {
      if (dayEvents.length === 1) {
        router.push(`/events/${dayEvents[0].slug}`);
        return;
      }
      if (dayEvents.length === 0) {
        return;
      }
      const key = toDayKey(day);
      setSelectedDayKey((prev) => (prev === key ? null : key));
    },
    [router],
  );

  return (
    <div className="px-6 pb-6 md:px-16">
      <div className="py-9 border-b border-ch-midnite flex flex-col items-center gap-9 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-0">
        <h1 className="font-milling font-bold text-[40px] text-ch-midnite self-start md:self-auto">
          Events
        </h1>
        <p className="hidden md:block font-brook text-base text-ch-midnite text-center">
          {today ? formatToday(today) : "\u00A0"}
        </p>
        <EventsCalendar
          events={upcomingEvents}
          hoveredDayKey={hoveredDayKey}
          onDayClick={handleDayClick}
          onDayHover={setHoveredDayKey}
        />
      </div>

      <div className="flex flex-col border-ch-midnite border-r border-l">
        <div className="flex flex-row">
          <TabButton
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </TabButton>
          <TabButton active={tab === "past"} onClick={() => setTab("past")}>
            Past
          </TabButton>
        </div>

        {tab === "upcoming" ? (
          upcomingEvents.length === 0 ? (
            <EventsEmptyState />
          ) : (
            <div className="border-t border-b border-ch-midnite flex flex-col md:flex-row">
              <div className="flex-1 min-w-0 flex flex-col">
                {selectedDayKey && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-ch-midnite">
                    <span className="font-brook text-xs uppercase text-ch-midnite">
                      {selectedDayLabel}
                    </span>
                    <button
                      onClick={() => setSelectedDayKey(null)}
                      className="font-brook text-xs uppercase text-ch-midnite underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
                {groupEventsByMonth(filteredUpcoming).map((group) => (
                  <Fragment key={`${group.year}-${group.month}`}>
                    <EventMonthHeader month={group.month} />
                    {group.events.map((e) => (
                      <EventRow
                        key={e._id}
                        event={e}
                        onHover={() => setHoveredEvent(e)}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
              <div className="hidden md:block flex-1 min-w-0 md:border-l border-ch-midnite">
                <EventSummary event={previewEvent} />
              </div>
            </div>
          )
        ) : pastError ? (
          <div className="py-8 text-neutral-400 text-sm">
            Failed to load past events.
          </div>
        ) : (
          <PastEvents events={pastEvents} />
        )}
      </div>
    </div>
  );
}
