import { createClient } from "@sanity/client";
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Seeds five `article` documents from the Figma "Read Article Template" canvas
 * (file erOB5ZYdcXZ27cukPYrfZr, node 2787:6678), uploading their images first.
 *
 * Usage (from the repo root):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=... SANITY_DATASET=development SANITY_WRITE_TOKEN=... \
 *     pnpm --dir client seed:articles
 *
 * Requires a SANITY_WRITE_TOKEN with write access and a NON-production dataset
 * (SANITY_DATASET defaults to "development"; the app's configured dataset is
 * "production").
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "development";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN (set SANITY_DATASET to target a non-production dataset).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const IMG_DIR = join(process.cwd(), "public/article-images");

type ImageValue = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt: string;
  credits?: string;
};

async function uploadImage(
  filename: string,
  alt: string,
  credits?: string,
): Promise<ImageValue> {
  const path = join(IMG_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Missing image ${path}. Download it from Figma first.`);
  }
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename,
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt,
    ...(credits ? { credits } : {}),
  };
}

const p = (text: string) => ({
  _type: "block" as const,
  style: "normal" as const,
  children: [{ _type: "span" as const, text }],
});

const qa = (question: string, answer: string) => ({
  _type: "qa" as const,
  question,
  answer: [p(answer)],
});

async function main() {
  const [hero, iosifescu, chang, gero, inlineRight] = await Promise.all([
    uploadImage(
      "quadrophonic-hero.png",
      "Tommy Martinez's Distant Streams",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage("iosifescu.png", "Mark Iosifescu"),
    uploadImage("chang.png", "Spencer Chang"),
    uploadImage("gero.png", "Katy Ilonka Gero"),
    uploadImage("quadrophonic-inline-right.png", ""),
  ]);

  const articles = [
    {
      _type: "article",
      title: "Quadrophonic Landscapes",
      slug: { _type: "slug", current: "quadrophonic-landscapes" },
      publishDate: "2025-10-21",
      deck: "Leveraged Tech and Reclaimed Infrastructure in Tommy Martinez's Distant Streams",
      byline: "Written by Mark Iosifescu",
      headerLayout: "centered",
      heroImage: hero,
      content: [
        {
          _type: "articleText",
          align: "left",
          style: "body",
          text: [
            p(
              "Let's start with the sound. Slow, an unhurried build, chorusing birdcalls and wobbles of tape delay, ocean waves shorebreaking swoony across your stereo field. Repeating, repeating, speeding and slowing, sounds arcing and echoing into directionlessness, a single immersive range being steadily demarcated around you as, inside the span, new pitches beginning to rise: a bowed guitar string, heady harmonics converted to current and compressed; low sailing bass notes, high textures on the wind; tactile synth brittleness like leaves under your feet, sampled voices flowing liquid down the panning spectrum—right to left, near to far, there and back and gone again.",
            ),
          ],
        },
        { _type: "articleImage", layout: "alignRight", image: inlineRight },
        {
          _type: "articleText",
          align: "left",
          style: "body",
          text: [
            p(
              "Martinez's ongoing practice is devoted to fostering experimental possibilities in sound and music via coding: open-source software development, generative interactive systems, community-minded reorientations of the tech infrastructure that has come to dominate our world.",
            ),
          ],
        },
        {
          _type: "pullQuote",
          size: "large",
          text: "Slow, an unhurried build, chorusing birdcalls and wobbles of tape delay, ocean waves shorebreaking swoony across your stereo field.",
        },
      ],
      author: {
        name: "Mark Iosifescu",
        website: "https://iosifescu.biz",
        photo: iosifescu,
        bio: [
          p(
            "Mark Iosifescu is a writer, musician, and editor from New York City. His writing has appeared in LCD, The Brooklyn Rail, and The Whitney Review of New Writing, and is forthcoming in n+1. He is working on a novel called The Soft Exclusion.",
          ),
        ],
      },
    },
    {
      _type: "article",
      title: "Quadrophonic Landscapes",
      slug: { _type: "slug", current: "quadrophonic-landscapes-split" },
      publishDate: "2025-10-21",
      deck: "Leveraged Tech and Reclaimed Infrastructure in Tommy Martinez's Distant Streams",
      byline: "Mark Iosifescu",
      headerLayout: "split",
      heroImage: hero,
      content: [
        {
          _type: "articleText",
          align: "left",
          style: "body",
          text: [
            p(
              "The project uses preexisting web infrastructure—the very web technologies that underlie our streaming and video-call-saturated day-to-day lives—to construct a new way for sound artists to collaborate.",
            ),
          ],
        },
      ],
      author: {
        name: "Mark Iosifescu",
        website: "https://iosifescu.biz",
        photo: iosifescu,
        bio: [
          p(
            "Mark Iosifescu is a writer, musician, and editor from New York City. His writing has appeared in LCD, The Brooklyn Rail, and The Whitney Review of New Writing.",
          ),
        ],
      },
    },
    {
      _type: "article",
      title: "Quadrophonic Landscapes",
      slug: { _type: "slug", current: "quadrophonic-landscapes-tall" },
      publishDate: "2025-10-21",
      deck: "Leveraged Tech and Reclaimed Infrastructure in Tommy Martinez's Distant Streams",
      byline: "Written by Mark Iosifescu",
      headerLayout: "splitTall",
      heroImage: hero,
      content: [
        {
          _type: "imageText",
          imagePosition: "left",
          image: inlineRight,
          text: [
            p(
              "The openness of Distant Streams allows for expressions and formations of deep nuance and referential power, drawing on the singular qualities and backgrounds of participants, locations, and networked affinities.",
            ),
          ],
        },
      ],
      author: {
        name: "Mark Iosifescu",
        website: "https://iosifescu.biz",
        photo: iosifescu,
        bio: [
          p(
            "Mark Iosifescu is a writer, musician, and editor from New York City.",
          ),
        ],
      },
    },
    {
      _type: "article",
      title: "An Interview with Spencer Chang",
      slug: { _type: "slug", current: "an-interview-with-spencer-chang" },
      publishDate: "2026-08-13",
      deck: null,
      byline: "Scribble",
      headerLayout: "centered",
      heroImage: null,
      content: [
        qa(
          "Hi Spencer! Can you introduce yourself & what you make?",
          "Hi :) I'm an artist and technologist based in San Francisco. I like to say I make software you can touch—systems, sculptures, and environments that use technology to help us create, connect, and care for each other in more playful and empowering ways.",
        ),
        {
          _type: "imageText",
          imagePosition: "right",
          image: chang,
          text: [
            qa(
              "What ingredients do you need for technology to feel magical?",
              "I think technology feels most magical when it opens our capacity for possibility & dreaming by turning something new and wonderful into an everyday experience.",
            ),
          ],
        },
        {
          _type: "articleText",
          align: "left",
          style: "seriesNote",
          text: [
            p(
              "⌇Scribble is a series of handwritten interviews about the handmade web, edited by Blair Johnson.",
            ),
          ],
        },
      ],
      author: {
        name: "Spencer Chang",
        website: "https://spencer.place",
        photo: chang,
        bio: [
          p(
            "Spencer Chang is an artist and toymaker who makes software you can touch. Working across internet spaces, interactive sculpture, and creative infrastructure, he activates the care, creativity, and intimacy in our everyday interactions with and through technology.",
          ),
        ],
      },
    },
    {
      _type: "article",
      title: "An Introduction to Feedback",
      slug: { _type: "slug", current: "an-introduction-to-feedback" },
      publishDate: "2021-02-16",
      deck: null,
      byline: "Written by Katy Iloka Gero",
      headerLayout: "centered",
      heroImage: null,
      content: [
        {
          _type: "articleText",
          align: "left",
          style: "body",
          text: [
            p(
              "I first learn about feedback when I learn about buildings: how to stop their swaying in the wind. In a psychology seminar, we discuss failed feedback as a potential origin of neurological diseases.",
            ),
          ],
        },
        {
          _type: "pullQuote",
          size: "large",
          text: "Feedback is how we nourish the creative soul. We commune, we grow, we share. Sometimes I crave this self-indulgent meal but other times, it makes me sick.",
        },
        {
          _type: "articleText",
          align: "left",
          style: "body",
          text: [
            p(
              "Feedback is how we nourish the creative soul. My own work, fed back in. Everywhere I went, there was a slightly different way to give feedback.",
            ),
          ],
        },
      ],
      author: {
        name: "Katy Ilonka Gero",
        website: "https://katygero.com",
        photo: gero,
        bio: [
          p(
            "Katy Ilonka Gero is a poet, essayist, and scientist, and is a CultureHub Resident Contributing Writer (2020–2021).",
          ),
        ],
      },
    },
  ];

  const created = [];
  for (const doc of articles) {
    created.push(await client.create(doc));
  }

  // Link "Read More" cards across the seeded articles.
  const ids = created.map((d) => d._id);
  for (let i = 0; i < created.length; i++) {
    const others = ids.filter((_, j) => j !== i).slice(0, 3);
    await client
      .patch(ids[i])
      .set({ readMore: others.map((_ref) => ({ _type: "reference", _ref })) })
      .commit();
  }

  console.log(`Created ${created.length} articles:`);
  for (const d of created) {
    console.log(`  ${d._id}  ${d.slug?.current}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
