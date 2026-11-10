import {
  articleYear,
  formatEditorialDate,
  getArticleTilt,
  clampPreviewX,
} from "@/util/editorial";

describe("editorial dates and hover geometry", () => {
  it("accepts real calendar dates, including leap days, without local timezone shifts", () => {
    expect(articleYear("2024-02-29")).toBe("2024");
    for (const date of [
      "2026-02-30",
      "2025-02-29",
      "",
      "2026-13-01",
      "2026-1-01",
    ]) {
      expect(articleYear(date)).toBeNull();
    }
    expect(formatEditorialDate("2026-01-01")).toBe("01.01.26");
    expect(formatEditorialDate("bad")).toBe("");
  });

  it("uses stable bounded varied tilts regardless of draft prefix", () => {
    expect(getArticleTilt("a")).toBe(getArticleTilt("drafts.a"));
    expect(getArticleTilt("a")).not.toBe(getArticleTilt("b"));
    for (const id of ["a", "b", "c", "article-2026"])
      expect(Math.abs(getArticleTilt(id))).toBeLessThanOrEqual(8);
  });

  it("keeps the overlay inside either viewport edge", () => {
    expect(clampPreviewX(1400, 500, 1440, 16)).toBe(924);
    expect(clampPreviewX(-100, 500, 1440, 16)).toBe(16);
    expect(clampPreviewX(200, 500, 1440, 16)).toBe(200);
    expect(clampPreviewX(100, 500, 375, 16)).toBe(16);
  });
});
