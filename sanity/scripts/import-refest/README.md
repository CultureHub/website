# Re–Fest Content Import

Seeds the Re–Fest program page and festival documents from the Figma design and the live CultureHub festival pages.

## Sources

| Festival | Source |
|---|---|
| 2026 Re–Mapping | Live `https://www.culturehub.org/re-fest-2026` + Figma node `2214:7039` |
| 2025 Re–Collect | Live `https://www.culturehub.org/re-fest-2025` |
| 2023 Re–New | Figma template `2916:2707` + live `https://www.culturehub.org/re-fest-2023` images |
| 2024, 2022, 2021, 2020, 2019 | Figma archive component `2214:6759` |

Figma file: `erOB5ZYdcXZ27cukPYrfZr` (CultureHub Web Design 2026).

## Environment

- `CULTUREHUB_SANITY_TOKEN` (or `SANITY_API_WRITE_TOKEN`) — Sanity write token for project `2r5hg86f`, dataset `production`.
- `CAM_FIGMA_API_KEY` — Figma personal access token, required for image exports.

## Commands

```bash
# Dry run — prints documents and the image plan, writes nothing
pnpm -C sanity import:refest -- --dry-run

# Write
pnpm -C sanity import:refest -- --write
```

## Behaviour

- Uses deterministic document ids: `festival-2026`, `festival-2025`, etc.
- Uses `createOrReplace` for festival documents.
- Patches the Re–Fest program with `currentFestival`, `pageDescription`, and `hasPage: true`.
- Reuses an existing Sanity image asset when `originalFilename` matches.
- Downloads Figma images via the REST image export endpoint, then uploads them to Sanity.
- The 2023 artwork images come from the live 2023 page because the Figma artwork placeholders are grey boxes.

## Re-running

The script is safe to re-run. It replaces the festival documents for the seeded years and patches the same program fields. Images are reused by filename; changing a local image and re-running requires deleting the old `sanity.imageAsset` or changing the filename.
