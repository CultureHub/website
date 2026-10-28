# Read Article Template — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `article` Sanity document type with a flexible page-builder body and render it pixel-accurately at `/read/[slug]`, covering every article variant in the Figma "Read Article Template" canvas.

**Architecture:** One `article` document with an inline author and a `content[]` array of small reusable block objects (page-builder pattern). Rich text inside blocks is Portable Text; the interview Q&A is a Portable Text *custom block* (`qa`) composable inside any rich-text field. One block-renderer in the client maps `_type` → component. Existing `Menu`/`Footer`/`Breadcrumbs`/`Button`/`SanityImage`/`PortableText` are reused.

**Tech Stack:** Sanity Studio v5 (`defineType`/`defineField`), Next.js 16 App Router + `next-sanity` v12, Tailwind v4 `@theme`, Jest + React Testing Library, `@sanity/client` v7 (seed script).

**Spec:** `docs/superpowers/specs/2026-10-15-read-article-template-design.md`

## Global Constraints

- Sanity Studio v5; schemas use `defineType`/`defineField`; object types referenced by name in `of: []` must be registered in `sanity/schemaTypes/index.ts`.
- Reuse existing helpers/patterns: `imageField` (`sanity/util/image.ts`), `linkField` (`sanity/util/link.ts`), `SanityImage` + `urlFor`, `Breadcrumbs`, `Button`, `Menu`, `Footer`, `PortableText`.
- Route is `/read/[slug]`; article is responsive (extrapolate mobile from `md:` house patterns).
- Body text font is **Miller Text** (serif); related-article titles/authors use **Baskervville**; both must be added (see Task 1). Design token **`ch-read-lilac` #D5C1FF** must be added.
- Never edit `client/src/sanity/types.ts` by hand — regenerate via `pnpm -C ../sanity typegen`.
- Article body blocks are always available to every article; no `type`-based gating (no `type` field in this scope — deferred to the index page).
- Seed/QA uses a dev dataset; never seed production.

## Review Focus

1. **Very long title/deck on mobile** — the 128px Milling title and 36px Miller deck must wrap, never overflow the viewport.
2. **Missing hero image** ("No Image" variant) — centered header renders cleanly with no hero and no empty credit line.
3. **Empty/incomplete blocks** — a block with no text, no image, or no `credits` renders nothing (returns `null`) instead of crashing.
4. **`qa` inside `imageText`** — question renders in Milling, answer in Miller, both left-aligned.
5. **Dangling `readMore` references** — deleted/unpublished referenced articles are filtered, not rendered as broken links.

---

### Task 1: Add article fonts and design tokens

**Files:**
- Modify: `client/src/atoms/text.ts`
- Modify: `client/src/app/globals.css`
- Modify: `client/src/app/layout.tsx`

**Interfaces:**
- Produces: `MillerFont` (CSS var `--font-miller`), `BaskervvilleFont` (CSS var `--font-baskervville`); Tailwind utilities `font-miller`, `font-baskervville`; color token `ch-read-lilac` (#D5C1FF).

- [ ] **Step 1: Add Baskervville (Google Font) and Miller Text loading in `client/src/atoms/text.ts`**

Add `BaskervvilleFont` via `next/font/google` (weights 400 regular + 400 italic) with `variable: "--font-baskervville"`. Add `MillerFont`: load from the project's Adobe Fonts/Typekit kit if "Miller Text" is available there; otherwise expose `--font-miller` as a CSS variable pointing to a serif stack (`"Miller Text", Baskervville, Georgia, serif`). Keep `preload: false`, `display: "swap"`.

- [ ] **Step 2: Register theme tokens in `client/src/app/globals.css`**

In `@theme`: add `--font-miller: var(--font-miller)` and `--font-baskervville: var(--font-baskervville)`. In `@theme inline`: add `--color-ch-read-lilac: #d5c1ff`.

- [ ] **Step 3: Load the font variables in `client/src/app/layout.tsx`**

Append `MillerFont.variable` and `BaskervvilleFont.variable` to the `<body>` `className`.

- [ ] **Step 4: Verify the app still builds**

Run: `pnpm --dir client build`
Expected: build succeeds; no "font" or "token" errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/atoms/text.ts client/src/app/globals.css client/src/app/layout.tsx
git commit -m "feat(article): add Miller/Baskervville fonts and read-lilac token"
```

---

### Task 2: Article schema (document + body blocks)

**Files:**
- Create: `sanity/schemaTypes/articleType.ts`
- Create: `sanity/schemaTypes/articleBlocks.ts`
- Modify: `sanity/schemaTypes/index.ts`

**Interfaces:**
- Produces schema types: `article` (document), and objects `articleText`, `pullQuote`, `articleImage`, `imagePair`, `imageText`, `qa`.
- `article` fields: `title` (string, required), `slug` (slug from title, required), `publishDate` (date, required), `deck` (string), `byline` (string), `headerLayout` (string list `centered`|`split`|`splitTall`, default `centered`), `heroImage` (image, optional), `content` (array of the five block types), `author` (object: `name` string, `photo` image optional, `website` url, `bio` array of block), `readMore` (array of reference → `article`).
- Block field shapes:
  - `articleText`: `align` (list `left`|`right`|`center`, default `left`), `style` (list `body`|`lead`|`small`|`seriesNote`, default `body`), `text` (array of `block` and `qa`).
  - `pullQuote`: `text` (text, required), `size` (list `standard`|`large`, default `standard`).
  - `articleImage`: `image` (`imageField`, required), `layout` (list `fullBleed`|`full`|`alignLeft`|`alignRight`, default `full`).
  - `imagePair`: `image1`, `image2` (`imageField`, required).
  - `imageText`: `image` (`imageField`, required), `imagePosition` (list `left`|`right`, default `left`), `text` (array of `block` and `qa`).
  - `qa`: `question` (string, required), `answer` (array of `block`, required).
- Each block gets a `preview` (title/subtitle + `media` for image blocks).

- [ ] **Step 1: Write `sanity/schemaTypes/articleBlocks.ts`**

Define `articleText`, `pullQuote`, `articleImage`, `imagePair`, `imageText`, `qa` via `defineType`/`defineField` with the exact field names/shapes above. Export `articleBlockTypes` (the five page-builder object names) for reuse.

- [ ] **Step 2: Write `sanity/schemaTypes/articleType.ts`**

Define `article` via `defineType` using `imageField` for `heroImage` (pass `false` for the `required` arg so it's optional) and for the block/author images. Reference block types in `content` via `of: [{type: 'articleText'}, ...]` and register the `qa` type in the `of` of the two rich-text fields (`text`).

- [ ] **Step 3: Register types in `sanity/schemaTypes/index.ts`**

Add `articleType`, `articleText`, `pullQuote`, `articleImage`, `imagePair`, `imageText`, `qa` to the exported `schemaTypes` array.

- [ ] **Step 4: Verify schema extracts and typegens cleanly**

Run: `pnpm -C sanity typegen`
Expected: no schema errors; `client/src/sanity/types.ts` regenerates with `Article`, `ArticleText`, `PullQuote`, `ArticleImage`, `ImagePair`, `ImageText`, `Qa` types.

- [ ] **Step 5: Commit**

```bash
git add sanity/schemaTypes/articleType.ts sanity/schemaTypes/articleBlocks.ts sanity/schemaTypes/index.ts client/src/sanity/types.ts
git commit -m "feat(article): add article document and page-builder block schema"
```

---

### Task 3: Article query

**Files:**
- Modify: `client/src/sanity/queries.ts`

**Interfaces:**
- Produces: `getArticleBySlug(slug: string) => Promise<GetArticleBySlugQueryResult>` (type from typegen). Result shape: `_id`, `title`, `"slug": slug.current`, `publishDate`, `deck`, `byline`, `headerLayout`, `heroImage { asset, hotspot, crop, alt, credits }`, `content[]` (each block expanded with `_type`, `_key`, its fields, and image fields as `{ asset, hotspot, crop, alt, credits }`), `author { name, photo { asset, hotspot, crop, alt }, website, bio }`, `readMore[]->{ _id, title, "slug": slug.current, publishDate, "authorName": author.name, heroImage { asset, hotspot, crop, alt } }` (heroImage is needed for the Read More card hover reveal).

- [ ] **Step 1: Add `getArticleBySlug` to `client/src/sanity/queries.ts`**

Write a `defineQuery` matching the result shape above. Filter `readMore` to `_type == "article" && defined(slug.current)`. Use `client.fetch(query, { slug }, options)` with the existing `options` constant.

- [ ] **Step 2: Regenerate types and typecheck**

Run: `pnpm -C sanity typegen` then `pnpm --dir client typecheck`
Expected: `GetArticleBySlugQueryResult` is generated; no TS errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/sanity/queries.ts client/src/sanity/types.ts
git commit -m "feat(article): add getArticleBySlug query"
```

---

### Task 4: Portable Text `qa` custom block support

**Files:**
- Modify: `client/src/components/PortableText.tsx`
- Test: `client/src/components/PortableText.test.tsx`

**Interfaces:**
- Produces: `qa` registered in `PortableText` `components.types`; renders question (Milling, 28px) + answer (Miller serif).

- [ ] **Step 1: Write the failing test `client/src/components/PortableText.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { PortableText } from "./PortableText";

it("renders a qa block with question and answer", () => {
  render(<PortableText value={[{ _type: "qa", _key: "a", question: "Who are you?", answer: [{ _type: "block", _key: "b", style: "normal", children: [{ _type: "span", _key: "c", text: "An artist." }] }] }]} />);
  expect(screen.getByText("Who are you?")).toBeInTheDocument();
  expect(screen.getByText("An artist.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --dir client test PortableText.test.tsx`
Expected: FAIL (unknown `qa` type renders nothing / no "Who are you?").

- [ ] **Step 3: Implement `qa` in `client/src/components/PortableText.tsx`**

Add `types: { qa: ({ value }) => (... ) }` to the existing `components` object: render `value.question` in a Milling-styled element and `value.answer` through `<NextPortableText value={value.answer} />` inside a Miller-serif wrapper.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --dir client test PortableText.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/PortableText.tsx client/src/components/PortableText.test.tsx
git commit -m "feat(article): render qa portable-text block"
```

---

### Task 5: Article header + breadcrumb + byline

**Files:**
- Create: `client/src/components/Article/ArticleHeader.tsx`
- Test: `client/src/components/Article/ArticleHeader.test.tsx`

**Interfaces:**
- Consumes: `GetArticleBySlugQueryResult` (from Task 3).
- Produces: `<ArticleHeader article={...} />` rendering breadcrumb (via `Breadcrumbs`: "Editorial" then "Read", both non-linking) + date + title (Milling 128px) + deck (Miller italic 36px) + byline (Brook italic 32px) + optional hero image with credit, across three layouts (`centered` / `split` / `splitTall`).

- [ ] **Step 1: Write the failing tests `client/src/components/Article/ArticleHeader.test.tsx`**

Three cases: (a) `centered` with a hero renders date/title/deck/byline and the credit text; (b) `centered` with **no** hero renders no credit element (Review Focus #2); (c) `split` renders the metadata column. Use a minimal mock article object (cast to the result type).

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm --dir client test ArticleHeader.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `ArticleHeader` in `client/src/components/Article/ArticleHeader.tsx`**

Switch on `article.headerLayout`. Render breadcrumb via `Breadcrumbs` with two `Button` pills (no `href`). Map date via the existing date formatting util if one exists, else `toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })`. Render `heroImage` through `SanityImage` with the credit line below when present. Apply responsive classes (`md:` breakpoints) so long titles/decks wrap (Review Focus #1).

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm --dir client test ArticleHeader.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Article/ArticleHeader.tsx client/src/components/Article/ArticleHeader.test.tsx
git commit -m "feat(article): article header with breadcrumb and hero"
```

---

### Task 6: Body block renderer + text and pull-quote blocks

**Files:**
- Create: `client/src/components/Article/ArticleBody.tsx`
- Create: `client/src/components/Article/blocks/TextBlock.tsx`
- Create: `client/src/components/Article/blocks/PullQuoteBlock.tsx`
- Test: `client/src/components/Article/ArticleBody.test.tsx`

**Interfaces:**
- Consumes: `article.content` from `GetArticleBySlugQueryResult` (block union with `_type` + `_key`).
- Produces: `<ArticleBody content={...} />` switching on `_type` (`articleText` → `TextBlock`, `pullQuote` → `PullQuoteBlock`, `articleImage`/`imagePair`/`imageText` handled in Task 7). Block components accept the `Extract<...>`-typed block and use `_key` for React key.

- [ ] **Step 1: Write the failing tests `client/src/components/Article/ArticleBody.test.tsx`**

Case (a): a `content` array with one `articleText` block renders its Portable Text. Case (b): one `pullQuote` block renders the quote text. Case (c): an empty `articleText` (no `text`) renders `null` (Review Focus #3).

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm --dir client test ArticleBody.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `TextBlock`, `PullQuoteBlock`, `ArticleBody`**

`TextBlock` maps `align`→text alignment class, `style`→size/font class (body=Miller 32px/40px, lead=Miller with bold lead-in, small=Miller 24px, seriesNote=Milling simplex italic 24px), and renders `<PortableText value={block.text} />`. `PullQuoteBlock` renders `block.text` centered in Miller italic (48px `large`, 32px `standard`). `ArticleBody` maps over `content` and switches on `_type` (default: `null`), keyed by `_key`.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm --dir client test ArticleBody.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Article/ArticleBody.tsx client/src/components/Article/blocks/TextBlock.tsx client/src/components/Article/blocks/PullQuoteBlock.tsx client/src/components/Article/ArticleBody.test.tsx
git commit -m "feat(article): body renderer with text and pull-quote blocks"
```

---

### Task 7: Image, image-pair, and image-text blocks

**Files:**
- Create: `client/src/components/Article/blocks/ImageBlock.tsx`
- Create: `client/src/components/Article/blocks/ImagePairBlock.tsx`
- Create: `client/src/components/Article/blocks/ImageTextBlock.tsx`
- Modify: `client/src/components/Article/ArticleBody.tsx`
- Test: `client/src/components/Article/ImageBlocks.test.tsx`

**Interfaces:**
- Produces: `ImageBlock` (image + optional credit, `layout` → width/alignment class: `fullBleed`/`full`/`alignLeft`/`alignRight`), `ImagePairBlock` (two images side-by-side), `ImageTextBlock` (`imagePosition` left/right, text side renders `<PortableText>` — which may contain `qa`). All return `null` when their image/text is missing (Review Focus #3, #4).

- [ ] **Step 1: Write the failing tests `client/src/components/Article/ImageBlocks.test.tsx`**

Case (a): `articleImage` renders the image and credit; with no `credits` renders no caption. Case (b): `imagePair` renders two images. Case (c): `imageText` with a `qa` block in its `text` renders both the question and the answer (Review Focus #4).

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm --dir client test ImageBlocks.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement the three block components**

Render images via `SanityImage` with `objectFit="cover"` and the appropriate width/height/aspect classes per `layout`. Wire them into `ArticleBody`'s switch (`articleImage`, `imagePair`, `imageText`).

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm --dir client test ImageBlocks.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Article/blocks/ImageBlock.tsx client/src/components/Article/blocks/ImagePairBlock.tsx client/src/components/Article/blocks/ImageTextBlock.tsx client/src/components/Article/ArticleBody.tsx client/src/components/Article/ImageBlocks.test.tsx
git commit -m "feat(article): image, image-pair, and image-text blocks"
```

---

### Task 8: Author bio + Read More

**Files:**
- Create: `client/src/components/Article/ArticleAuthorBio.tsx`
- Create: `client/src/components/Article/ReadMore.tsx`
- Test: `client/src/components/Article/ArticleFooter.test.tsx`

**Interfaces:**
- Produces: `<ArticleAuthorBio author={article.author} />` (photo + name + website link + bio, under an "About the Author" rule; returns `null` if `author` absent). `<ReadMore items={article.readMore} />` rendering a heading "Read More" and a row of cards, each linking to `/read/[slug]`, filtering null/dangling refs (Review Focus #5).

  **Read More card** (Figma "More Read" component set `3849:3261`): 437×600 column with 24px padding and a `ch-midnite` 1px border, `justify-between`. Content top-to-bottom: top metadata row (`READ` tag — Brook uppercase 16px with the `readIcon` arrow — left, `MM.DD.YY` date right), title (Baskervville italic 36px/40px), author (Baskervville regular 24px). **Hover state** (both treatments in Figma): the card's background reveals the referenced article's `heroImage` with a `rgba(0,0,0,0.3)` scrim, and the READ tag/date/title/author flip to `ch-lite`; the alternate treatment uses a `ch-read-lilac` (#D5C1FF) overlay instead of the dark scrim with a black-stroked title. Implement with Tailwind `group`/`group-hover` (matching the existing `Button` state pattern), rendering the image via `SanityImage` behind the text.

- [ ] **Step 1: Write the failing tests `client/src/components/Article/ArticleFooter.test.tsx`**

Case (a): `author` renders name, bio, and a `href`-bearing website link. Case (b): `readMore` renders each item's title and links to `/read/<slug>`; a `null` item is skipped (Review Focus #5). Case (c): no `author` renders `null`. Case (d): a Read More card renders the referenced `heroImage` (for the hover reveal) and its link carries `group` plus the `group-hover:text-ch-lite` light-text classes.

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm --dir client test ArticleFooter.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `ArticleAuthorBio` and `ReadMore`**

Use `SanityImage` for the photo and for the card's background `heroImage`, `next/link` for website + article links, `Baskervville` (`font-baskervville`) for card titles, date formatting matching Task 5. Card link uses `group` with `group-hover:` classes to reveal the image + dark scrim and flip text to `ch-lite`.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm --dir client test ArticleFooter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Article/ArticleAuthorBio.tsx client/src/components/Article/ReadMore.tsx client/src/components/Article/ArticleFooter.test.tsx
git commit -m "feat(article): author bio and read-more components"
```

---

### Task 9: `/read/[slug]` page assembly

**Files:**
- Create: `client/src/app/read/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getArticleBySlug`, `ArticleHeader`, `ArticleBody`, `ArticleAuthorBio`, `ReadMore`.

- [ ] **Step 1: Write `client/src/app/read/[slug]/page.tsx`**

Server component: `const { slug } = await params; const article = await getArticleBySlug(slug); if (!article) notFound();` Render `<ArticleHeader article={article} />`, `<ArticleBody content={article.content} />`, `<ArticleAuthorBio author={article.author} />`, `<ReadMore items={article.readMore} />` inside `<main>`.

- [ ] **Step 2: Typecheck and start dev server**

Run: `pnpm --dir client typecheck` then `pnpm --dir client dev`
Expected: typecheck passes; server starts with no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/read/[slug]/page.tsx
git commit -m "feat(article): add /read/[slug] page"
```

---

### Task 10: Import Figma articles and images (seed)

**Files:**
- Create: `client/scripts/seed-articles.ts`
- Modify: `client/package.json` (add `tsx` devDependency and a `seed:articles` script)

**Interfaces:**
- Produces: a runnable `pnpm --dir client seed:articles` that downloads/reads Figma-exported images and creates the five seed `article` documents in the dev dataset (via `@sanity/client` `create` + `assets.upload`).

**Seed mapping (Figma canvas `2787:6678` → 5 documents):**

| # | Article (title) | Figma frame | `headerLayout` | notes |
|---|---|---|---|---|
| 1 | Quadrophonic Landscapes | `Read - Article V1` #2845:5164 | `centered` | hero + full/align images + pull quotes + author bio |
| 2 | Quadrophonic Landscapes | `Read - Article V1` #3833:1527 | `split` | same article, split metadata/cover header |
| 3 | Quadrophonic Landscapes | `Read - Article V3` #3477:2557 | `splitTall` | tall image right; "page" image/text layouts |
| 4 | An Interview with Spencer Chang | `Read - Article (Scribble)` #3844:2303 | `centered` | `qa` blocks + `imageText`(qa) + `seriesNote` |
| 5 | An Introduction to Feedback | `Read - Article ( No Image)` #3821:4786 | `centered` | no hero; `large` pull quotes; author bio |

(Fields per article: `publishDate` = "October 21, 2025" / "August 13, 2026" / "February 16, 2021"; `deck`, `byline`, `author`, and `content` text copied verbatim from the canvas data.)

- [ ] **Step 1: Download Figma images via the Figma image tool**

Using `download_figma_images` (fileKey `erOB5ZYdcXZ27cukPYrfZr`, localPath `client/public/article-images/`), download the image rectangles used by the five frames, mapping them to filenames — e.g. hero (`#3833:1841`, imageRef `1ae183e4…` → `quadrophonic-hero.png`), author portraits (`#3849:2671` → `iosifescu.png`, `#3855:3465` → `chang.png`, `#3855:3488` → `gero.png`), and inline images (e.g. `#2845:5325`, `#3835:873`, `#4033:4954`, `#2846:5354`, `#3833:1624`, `#3490:3491`). Enumerate the full node→imageRef manifest from the canvas data at execution time.

- [ ] **Step 2: Add `tsx` and write `client/scripts/seed-articles.ts`**

Script: `createClient({ projectId, dataset, token: process.env.SANITY_WRITE_TOKEN, apiVersion })`. For each of the 5 articles: `client.assets.upload("image", readStream, { filename })` for its images, then `client.create({ _type: "article", ...fields, content: [...], author: {...}, readMore: [{ _type: "reference", _ref: <other article _id> }] })`. Embed the article text (from the canvas) as in-script data. Print created `_id`s. Add `"seed:articles": "tsx scripts/seed-articles.ts"` and `"tsx": "^4"` to `client/package.json`.

- [ ] **Step 3: Run the seed against the dev dataset**

Run: `SANITY_WRITE_TOKEN=… pnpm --dir client seed:articles`
Expected: script prints 5 `_id`s with no errors.

- [ ] **Step 4: Verify visually in Studio and on the page**

Open the Studio: confirm 5 `article` documents render with images and blocks. Open `/read/quadrophonic-landscapes`, `/read/an-interview-with-spencer-chang`, `/read/an-introduction-to-feedback` (and the split/splitTall variants): confirm each matches its Figma frame across desktop and a narrow viewport (Review Focus #1–#5), and confirm the Read More cards' hover reveal (image + dark scrim + light text) matches the "More Read" component (`3849:3261`).

- [ ] **Step 5: Commit**

```bash
git add client/scripts/seed-articles.ts client/package.json client/public/article-images/ client/pnpm-lock.yaml
git commit -m "feat(article): seed articles and images from Figma"
```
