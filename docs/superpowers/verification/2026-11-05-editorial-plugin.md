# YouTube input compatibility gate

Checked: 2026-11-10.
Verdict: **BLOCKED — approval needed for a compatible local port or fork.**

## Established facts

- Registry latest: `sanity-plugin-youtube-input@0.2.0`.
- Declared peers: React `^18`, Sanity `^3`.
- Actual locked Studio: Sanity `5.31.1`, React/React DOM `19.2.3`.
- Its dependency tree introduces `@sanity/ui@1.9.3`, `@sanity/icons@2.11.8`, and Framer Motion `10.18.0`, also declaring incompatible React 18 peers.
- No plugin dependency, override, forced installation, or version downgrade was applied to the application.

## Controlled experiment

Experiments live under the ignored execution workspace, not in `sanity/`.

1. An isolated manifest pinned the original direct Studio runtime dependencies to their installed versions and added plugin 0.2.0. Strict installation exited 1 with incompatible plugin peers, plus missing development peers because that first manifest omitted devDependencies.
2. To isolate that confound, copied **the original full Studio package manifest and lockfile** into `plugin-experiment-locked/`, preserving its peer-auto-install setting. `pnpm install --frozen-lockfile --lockfile-only --ignore-scripts` passed, exit 0, as the unchanged control.
3. Added only the plugin with `pnpm add sanity-plugin-youtube-input@0.2.0 --lockfile-only --ignore-scripts --strict-peer-dependencies`. pnpm exited **0 but explicitly warned** about incompatible peers throughout the plugin subtree. Do not misreport this as a hard install failure or as proof of support.
4. A follow-up strict lockfile-only install also exited 0 without resolving the peer warnings. Package-manager permissiveness does not establish compatibility; the approved spec forbids introducing unsupported peers into the main application.

Representative controlled output:

```text
sanity-plugin-youtube-input 0.2.0
  unmet peer react@^18: found 19.2.3
  unmet peer sanity@^3: found 5.31.1
  @sanity/ui 1.9.3
    unmet peer react@^18: found 19.2.3
    unmet peer react-dom@^18: found 19.2.3
```

Full logs: `.superpowers/sdd/2026-11-05-editorial-read-watch/plugin-*.log`.

Plugin Studio build/schema/import/save/reopen tests were not declared passing: dependency adoption remains blocked, and live prerequisites are absent. The **existing** Studio build passed separately; that is not a plugin compatibility result.

## Source inspection

- The package defines `youtubeVideo` with `id`, `title`, `description`, `publishedAt`, `thumbnails` (availability keys, not URLs).
- Metadata fetching requests only `snippet`, omits duration, and rejects an otherwise valid result with an empty description.
- Its custom input passes import/reset/replace callbacks into child controls without forwarding or checking `props.readOnly`. A compatible port must explicitly guard mutation and network actions; setting the schema field read-only alone is not demonstrated safe with this input.

Sources:

- https://registry.npmjs.org/sanity-plugin-youtube-input/latest
- https://github.com/msfragala/sanity-plugin-youtube-input/blob/main/src/index.ts
- https://github.com/msfragala/sanity-plugin-youtube-input/blob/main/src/utils.ts
- https://github.com/msfragala/sanity-plugin-youtube-input/blob/main/src/components/InputComponent.tsx

## Smallest proposed compatibility change — not yet authorized

Create a small local compatibility port under `sanity/plugins/youtubeInput/`, retaining the requested URL-import/metadata/preview workflow and the same `youtubeVideo` storage shape. Use the current Studio's React/Sanity-compatible UI rather than adding the old React-18 UI subtree. Preserve applicable MIT attribution if adapting upstream source.

The port would add:

- `index.ts`: plugin registration using the current Sanity API and the existing `youtubeVideo` field shape.
- `YouTubeInput.tsx`: import/replace/reset, preview, loading/errors, and explicit read-only/missing-key guards.
- `metadata.ts`: validate IDs/URLs, fetch saved metadata only on editor activation, allow absent descriptions, and keep availability keys for thumbnails.
- Unit tests for metadata/URL/error handling and input mutation guards, then schema extraction/TypeGen/build and authorized editor validation.

No new content model, channel synchronization, duration backend, production settings, or runtime public-page API calls would be introduced. Cost: maintaining this small compatibility port locally rather than consuming an upstream-supported release. Do not implement it until the user approves the change.

## Live-validation prerequisites

`SANITY_STUDIO_YOUTUBE_API_KEY` is not configured in the execution environment; there are no Studio `.env` files. No nonproduction authoring dataset has been authorized. Do not request a key value in chat or create/publish production documents to work around this.

Once configured and authorized, verify normal/missing-description/private/deleted video import, quota/network failures, read-only behavior, preview, save/reopen, and published content consumption.
