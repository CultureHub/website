"use server";

import { getPastEvents } from "@/sanity/queries";
import type { EventListItem } from "@/sanity/queries";

export async function getPastEventsAction(): Promise<EventListItem[]> {
  return getPastEvents();
}
