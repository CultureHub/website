"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPastEventsAction } from "@/app/events/actions";
import EventsCalendar from "@/components/Events/EventsCalendar";
import EventsEmptyState from "@/components/Events/EventsEmptyState";
import EventRow from "@/components/Events/EventRow";
import EventSummary from "@/components/Events/EventSummary";
import PastEvents from "@/components/Events/PastEvents";
import { eventStartDayKey, formatToday, toDayKey } from "@/util/events-calendar";
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
          : "text-ch-midnite border border-ch-midnite"
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
  const [tab, setTab] = useState<Tab>("upcoming");
  const [hoveredEvent, setHoveredEvent] = useState<EventListItem | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
  const [pastEvents, setPastEvents] = useState<EventListItem[] | null>(null);

  useEffect(() => {
    if (tab === "past" && pastEvents === null) {
      getPastEventsAction().then(setPastEvents);
    }
  }, [tab, pastEvents]);

  const filteredUpcoming = useMemo(() => {
    if (!selectedDayKey) return upcomingEvents;
    return upcomingEvents.filter(
      (e) => eventStartDayKey(e) === selectedDayKey,
    );
  }, [upcomingEvents, selectedDayKey]);

  const previewEvent = hoveredEvent ?? filteredUpcoming[0] ?? null;

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
    <div className="px-6 md:px-16">
      <div className="py-9 flex flex-col gap-6">
        <h1 className="font-milling font-bold text-[40px] text-ch-midnite">
          Events
        </h1>
        <p className="font-brook text-base text-ch-midnite">{formatToday()}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-9">
        <div className="md:w-[329px] shrink-0">
          <EventsCalendar
            events={upcomingEvents}
            hoveredDayKey={hoveredDayKey}
            onDayClick={handleDayClick}
            onDayHover={setHoveredDayKey}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-row border-b border-ch-midnite">
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
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[671px] flex flex-col">
                  {filteredUpcoming.map((e) => (
                    <EventRow
                      key={e._id}
                      event={e}
                      onHover={() => setHoveredEvent(e)}
                    />
                  ))}
                </div>
                <EventSummary event={previewEvent} />
              </div>
            )
          ) : (
            <PastEvents events={pastEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
