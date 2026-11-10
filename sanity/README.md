# Sanity Studio

The Sanity Content Studio is an open-source real-time content editing environment connected to the Sanity backend.

You can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

## Development

### Getting started

First install the dependencies:

```bash
pnpm install
```

Then run the dev server:

```bash
pnpm dev
```

Sanity studio should be available at [http://localhost:3333](http://localhost:3333)

From here you can make changes to the schema adn edit data

### Read editorial index

Open **Read Page** in the Content list to select exactly three featured articles.
Drag entries into order: the first is the full-width lead, followed by two secondary cards.
Each entry chooses a hero-image or opening-text hover/focus preview; text previews allow
10–150 words (default 80). Image mode requires a hero asset, and text mode requires actual
article text, including Q&A or image/text blocks. Validation blocks incomplete publishing.

All remaining published articles with valid titles, slugs, and dates populate `/read`.
The year filter affects only that remaining list. The optional Article Type field labels
the desktop index and does not change existing detail pages. No article migration is needed.

`pnpm test` runs content/schema tests; `pnpm typegen` regenerates frontend types.
The configured dataset is **production**: local development does not authorize creating or
publishing content. Use an explicitly approved test dataset for live editor validation.
Do not run the frontend `seed:articles` script—it deletes existing article documents.

Watch and its YouTube input integration are deferred pending a compatible plugin decision.

### Deploying

To deploy Sanity Studio you can run

```bash
pnpm run deploy
```
