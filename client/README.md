## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

```bash
pnpm build      # Run a production build
pnpm lint       # Lint the code
pnpm typecheck  # Run the typescript compiler
pnpm format     # Run prettier to format
```

## Read editorial index

`/read` renders the published Read Page selection from Sanity; `/read/[slug]` remains
the article detail route. Editors select three ordered features and per-feature
image/text hover previews in Studio. Remaining article summaries are filtered by year.
If no Read Page is configured, the archive still works without invented features.

Run `pnpm test --runInBand` for the component/data regression suite. Use localhost
port **3000** for browser filtering checks: other origins may be rejected by the
project's existing Sanity CORS settings. Shared content-only helpers live in
`../shared/editorial`, so Turbopack's source root is the repository root.

Watch/input integration is deferred; the Read header does not link to a nonexistent
Watch page. Miller Text retains the existing Georgia fallback until licensed font
files are provided. No content seeding, production publishing, or deployment is
part of local verification; in particular, do not run `seed:articles`.

## Deploy on Vercel

Changes to the `main` branch will automatically get deployed on Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
