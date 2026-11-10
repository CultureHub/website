import type { EditorialImage, ReadData } from "@/sanity/editorial-types";
import { truncateWords } from "../../../shared/editorial/content";

// Local validation only: copy from Figma Read frame 3662:6583 and feature states.
// Images are existing public Sanity assets used as stand-ins, not new documents.
// Placeholder links intentionally open sample published articles.
const image = (ref: string, alt: string): EditorialImage => ({
  asset: { _type: "reference", _ref: ref },
  alt,
  crop: null,
  hotspot: null,
  credits: null,
});
const performance = image(
  "image-1ae183e4891beed5dd38f31355571160865b8538-4096x3072-png",
  "Placeholder imagery: Distant Streams performance",
);
const portrait = image(
  "image-3afa929466039f2b36fa0286b4c65b1edee0d1b0-1080x1350-png",
  "Placeholder imagery: Spencer Chang",
);
const landscape = image(
  "image-84396817f44a5a60a41aa9523050b0b4abf599ae-2500x1408-png",
  "Placeholder imagery: performance space",
);
const sampleSlugs = [
  "quadrophonic-landscapes",
  "an-interview-with-spencer-chang",
  "an-introduction-to-feedback",
];
const images = [performance, portrait, landscape];

const rows = [
  ["Interview with Yu Lee", "Scribble", "Interview", "2026-07-28"],
  ["Interview with Helen Lin", "Scribble", "Interview", "2026-07-27"],
  ["The Nail Files: Tech Tips", "Museum of Nails", "Reflection", "2026-06-10"],
  ["Taming the Chariot", "Matt Nasser", "Review", "2026-04-13"],
  ["Silence in Time", "Min-hyung Kang", "Review", "2026-03-30"],
  ["What is this Gesture", "Nisreen Kaj", "Review", "2026-03-16"],
  ["Violins and Vertigo", "Kurt Gottschalk", "Review", "2026-02-02"],
  [
    "Choice, Chance and Revolution",
    "Michelle Santiago Cortez",
    "Review",
    "2026-03-16",
  ],
  [
    "Herdimas Anggarra’s Ecstatic Interfaces",
    "Todd Anderson",
    "Review",
    "2026-03-16",
  ],
  ["Call and Response", "David Muenzer", "Review", "2026-03-16"],
] as const;

export const readDesignPreview: ReadData = {
  heading: "Editorial",
  articleIndexTitle: "Article Index",
  featured: [
    {
      _id: "design-quadrophonic",
      _key: "design-feature-quadrophonic",
      title: "Quadrophonic Landscapes",
      slug: sampleSlugs[0],
      publishDate: "2025-10-21",
      authorName: "Mark Iosifescu",
      articleType: "Review",
      heroImage: performance,
      previewMode: "text",
      previewText: truncateWords(
        "By calling on histories and prophecies of networks and kinships, traditions and formats, physical and virtual spaces all expressed via the communal gestures and utopian spaces of spirited musical collaboration, Distant Streams taps the currents that feed creation’s wellspring and carries their lessons into a living space you can feel—no idle research project or airless lecture, no workaday phone conference or video meeting, no prescriptive score or frozen recording.",
        80,
      ),
    },
    {
      _id: "design-spencer",
      _key: "design-feature-spencer",
      title: "An Interview with Spencer Chang",
      slug: sampleSlugs[1],
      publishDate: "2026-08-13",
      authorName: "Scribble",
      articleType: "Interview",
      heroImage: portrait,
      previewMode: "image",
      previewText: "",
    },
    {
      _id: "design-circuitry",
      _key: "design-feature-circuitry",
      title: "Circles of Circuitry in the Lower East Side",
      slug: sampleSlugs[2],
      publishDate: "2025-05-27",
      authorName: "Blair Johnson",
      articleType: "Reflection",
      heroImage: landscape,
      previewMode: "text",
      previewText:
        "Placeholder excerpt for validating this design: a space for artists, shared experiments, and unexpected connections between art and technology. This sample text demonstrates the secondary featured card’s opening-text preview; it is not published article copy.",
    },
  ],
  articles: rows.map(
    ([title, authorName, articleType, publishDate], index) => ({
      _id: `design-index-${index}`,
      title,
      authorName,
      articleType,
      publishDate,
      slug: sampleSlugs[index % sampleSlugs.length],
      heroImage: images[index % images.length],
    }),
  ),
};
