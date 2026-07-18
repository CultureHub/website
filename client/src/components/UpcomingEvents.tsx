import { Carousel } from "@/components/Carousel";
import { getUpcomingEvents } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(10);

  if (!events || events.length === 0) return null;

  const items = events.map((event) => {
    const dates = formatEventDates(event.dateTimes ?? []);
    return {
      _key: event._id,
      title: event.title,
      image: event.heroImage,
      href: `/events/${event.slug}`,
      type: "event",
      subtitle: dates ? (
        <span>
          {dates.dateRange}
          <br />
          {event.location}
        </span>
      ) : (
        event.location
      ),
    };
  });

  return (
    <section className="px-16 py-9 flex flex-col gap-5 items-center">
      <div className="w-full border-t border-b border-ch-midnite py-6">
        <h3 className="font-milling font-bold text-[28px]">Upcoming Events</h3>
      </div>
      <Carousel items={items} />
    </section>
  );
}
