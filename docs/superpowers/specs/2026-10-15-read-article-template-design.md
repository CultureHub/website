# Read Article Template — Design

Date: 2026-10-15
Status: Draft (awaiting approval)

## Intent & why

CultureHub has an editorial section ("Read") with long-form articles in several
formats — standard features, Q&A interviews (their "Scribble" series), reviews —
and some with no photography at all. Today the site has no article content type,
no article route, and no way to publish a single piece of writing. This work adds
the **article detail page** ("Read Article Template") so editors can publish any
of those article shapes without a developer, and renders it pixel-accurately
against the Figma designs.

The Figma file's "Read Article Template" canvas (node `2787:6678`) is the source
of truth. It contains five article variants that are really one flexible page,
not five hard-coded layouts.

## Goals

1. A Sanity content model that can express every article variant in the designs,
   and compose new article shapes without schema changes.
2. A pixel-perfect Next.js rendering of the Read Article Template, reusing and
   extending existing components (Menu, Footer, Breadcrumbs, Button, SanityImage,
   PortableText).
3. Cover all component states shown in Figma: breadcrumb Default/Hover/Pressed/
   Scrolled, link hover/pressed, READ-card hover, image hover where present.

## Non-goals

- The **Editorial / Article index** (listing) page and its Featured Articles /
  Article Index components are **out of scope**. This is the detail page only.
- No author *document* type — authors are embedded inline (see Decisions).
- No migration of existing content; no live preview / Presentation Tool wiring in
  this pass (can be added later).
- No print/PDF, no localization, no comments/engagement.

## Anti-goals (would be a failure even if it "works")

- A rigid schema that forces editors into one article layout and can't reproduce
  the "No Image" and "Scribble" variants without developer help.
- Baking layout decisions (alignment, image width) into the *document type* so
  that a new layout means a new schema or a code change.
- Copy-pasting five near-identical page components; the body must be one
  block-renderer with small, reusable blocks.

## Constraints

- **Stack**: Sanity Studio v5 (`sanity/`, `defineType`/`defineField`, `sanity
  schema extract` typegen) + Next.js App Router (`client/`, Tailwind v4
  `@theme`, `next-sanity`). Follow existing helpers: `imageField`,
  `linkField`, `creditFields`, `programField`.
- **Design tokens already present**: `ch-lite` #F2FBFD, `ch-midnite` #0A0018,
  `ch-bb` #CCF1FF, `ch-blue` #6DCFFD, `ch-teal` #94DEEB. **Missing**: `ch-read-
  lilac` #D5C1FF (used by the Scribble badge hover state) — add it.
- **Fonts**: Milling (local, loaded) and Brook (local, loaded) are available, plus
  Fig Script (Adobe Fonts kit `qwz8mrs`). **Gap**: the article body, deck, and
  pull quotes use **Miller Text** (serif), and related-article titles/authors use
  **Baskervville** (italic serif). Neither is currently loaded. These must be
  added (Adobe Fonts/Typekit or licensed webfont) or a documented serif fallback
  (Baskervville via Google Fonts → Georgia) used; this is flagged for the plan.
- **Route**: articles live at `/read/[slug]`. `Menu`/`Footer` are already global
  in `layout.tsx`; the article page should render within them.
- **Images**: use the existing `SanityImage` + `imageField` (alt + credits). The
  design's "photo credit line" (e.g. "Photo by Ji Hoon Kim") maps onto the
  existing `credits` string field.

## Decisions (locked — from the user)

1. **"Flexblocks" = page-builder array + Portable Text.** The article body is a
   flexible array of reusable content blocks (objects); rich text inside each
   block uses Portable Text (`block`). This is the Sanity "page builder" pattern,
   not the WordPress "Flexblocks" plugin.
2. **Scope = article detail page only.**
3. **Authors are embedded inline** on the article (name, photo, bio, website),
   not a reusable `author` document.
4. **URL = `/read/[slug]`.**
5. **Responsive.** The article page is responsive, matching the rest of the site;
   mobile layouts are extrapolated from house patterns (the Figma frames are
   desktop-only).
6. **Parent links.** The breadcrumb renders "Read" as the current page (no href)
   and "Editorial" as a non-linking label; "Read More" cards link to referenced
   articles at `/read/[slug]`. No index/stub route is added.
7. **No `type`/format field.** Articles are treated identically; the Scribble
   label is carried by the free-form `byline` field. A dedicated type label is
   deferred to the index page (out of scope).
8. **`qa` is a Portable Text custom block**, composable inside any rich-text field
   (standalone body and the text side of `imageText`/`textImage`).
9. **Figma content is imported** into a dev dataset (images downloaded via the
   Figma tool, text copied in) to validate the schema and renderer against real
   content across all seven frames.

## What's left to the builder (my calls, marked here so the user can veto)

- **One `article` document type** (no per-format types), with **no `type`/format
  field**. Articles are treated identically; the only type-dependent text on the
  detail page (e.g. the Scribble "Scribble" line) is carried by the free-form
  `byline` field. A dedicated type label is deferred to the index page (out of
  scope).
- **Body block inventory** (each an object in a `content[]` array), derived from
  the seven Figma frames:
  - `text` — Portable Text paragraph(s), with `align` (left / right / center) and
    optional `size`/`style` (body / lead / small / series-note).
  - `pullQuote` — centered large quote (Miller Text italic; two sizes seen in
    Figma: 48px bold-italic in "No Image", 48px Milling in V1).
  - `image` — image + caption/credit, with `layout` (full-bleed / full /
    align-left / align-right).
  - `imagePair` — two images side by side.
  - `imageText` — image + text in a split row (and its `textImage` mirror).
  - `qa` — a **Portable Text custom block** (`question` + `answer`), not a
    standalone page-builder block. It is allowed inside every rich-text field:
    the standalone body, and the text side of `imageText`/`textImage`. This is the
    Scribble interview Q&A (Milling bold question + Miller answer) and composes
    inside the image+text splits as the designs show.
- **Figma → Sanity import (explicit step).** The plan must include a step that
  downloads the article images (hero, inline, author photos) via the Figma image
  tool and imports the real article text into a dev dataset, mapped frame-by-frame
  across all seven Figma frames, so the schema and renderer are proven against the
  actual designs' content before sign-off.
- **Header**: a `layout` field on the article (centered-hero / split / split-tall)
  to cover the three title-block arrangements (V1 centered, V1 split rail, V3
  split-tall), with a hero image + credit + deck + publish date + "Written by".
  "No Image" is simply the centered layout with no hero image.
- **Author bio block** (inline object): photo + name + website + bio text, rendered
  under a "About the Author" rule.
- **"Read More"**: an array of references to other `article` documents (title,
  author, date, READ tag), reusing the existing card styling language.
- **Type safety**: regenerate `sanity/types.ts` via typegen; query the article
  with the block-expansion GROQ pattern from the page-builder guide.

## Open question for the user (may change the plan)

- None blocking. Font licensing for Miller Text/Baskervville will be confirmed
  during planning (fallback documented above).
