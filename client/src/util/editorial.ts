import { canonicalId } from "../../../shared/editorial/content";

export function articleYear(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
    ? date.slice(0, 4)
    : null;
}

export function formatEditorialDate(date: string): string {
  return articleYear(date)
    ? `${date.slice(5, 7)}.${date.slice(8, 10)}.${date.slice(2, 4)}`
    : "";
}

export function getArticleTilt(id: string): number {
  let hash = 2166136261;
  for (const character of canonicalId(id))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1601) / 100 - 8;
}

export function clampPreviewX(
  cursorX: number,
  previewWidth: number,
  viewportWidth: number,
  padding = 16,
): number {
  return Math.max(
    padding,
    Math.min(
      Number.isFinite(cursorX) ? cursorX : padding,
      viewportWidth - previewWidth - padding,
    ),
  );
}
