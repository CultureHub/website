import { EventsExplorer } from "@/components/Events/EventsExplorer";
import { getAllUpcomingEvents } from "@/sanity/queries";

export default async function EventsPage() {
  const upcomingEvents = await getAllUpcomingEvents();

  return (
    <main className="min-h-screen">
      <EventsExplorer upcomingEvents={upcomingEvents ?? []} />
    </main>
  );
}
