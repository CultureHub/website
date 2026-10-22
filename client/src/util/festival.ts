interface FestivalLocationSummaryInput {
  name: string;
}

interface FestivalDateLineInput {
  name: string;
  kind?: string | null;
  dateLabel?: string | null;
}

export function festivalAnchor(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function festivalLocationSummary(
  locations: FestivalLocationSummaryInput[],
  override?: string | null,
): string {
  const trimmedOverride = override?.trim();
  if (trimmedOverride) return trimmedOverride;

  const names = locations.map((location) => location.name).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export function festivalDateLines(
  locations: FestivalDateLineInput[],
): string[] {
  return locations
    .filter(
      (location) => location.kind !== "virtual" && location.dateLabel?.trim(),
    )
    .map((location) => `${location.dateLabel!.trim()} in ${location.name}`);
}

export function festivalNavItems(
  locations: { name: string; kind?: string | null }[],
): { label: string; anchor: string }[] {
  return [
    { label: "About", anchor: "about" },
    ...locations.map((location) => ({
      label: location.kind === "virtual" ? "Virtual" : location.name,
      anchor: festivalAnchor(location.name),
    })),
  ];
}

export function festivalHref(slug: string): string {
  return `/re-fest/${slug}`;
}
