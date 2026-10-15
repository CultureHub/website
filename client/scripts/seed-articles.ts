import { createClient } from "@sanity/client";
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Seeds the three "Read" articles from the Figma "Read Article Template"
 * canvas (file erOB5ZYdcXZ27cukPYrfZr) into Sanity, uploading their images
 * first. Existing `article` documents are deleted before seeding.
 *
 * Usage (from the repo root):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=... SANITY_DATASET=... SANITY_WRITE_TOKEN=... \
 *     pnpm --dir client seed:articles
 *
 * Images live in `scripts/seed-assets/` (gitignored). Re-download them from
 * the Figma file with download_figma_images (see the image manifest in
 * seed-assets, or the node ids referenced in the download tool's output).
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN (set SANITY_DATASET to the target dataset).",
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

const IMG_DIR = join(process.cwd(), "scripts/seed-assets");

let keyCounter = 0;
const key = () => `seed-${keyCounter++}`;

const p = (text: string) => ({
  _type: "block" as const,
  _key: key(),
  style: "normal" as const,
  children: [{ _type: "span" as const, _key: key(), text }],
});

const paragraphs = (text: string) =>
  text
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(p);

const qa = (question: string, answer: string) => ({
  _type: "qa" as const,
  _key: key(),
  question,
  answer: paragraphs(answer),
});

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

async function main() {
  const imgs = await Promise.all([
    uploadImage(
      "quadrophonic-hero.png",
      "Tommy Martinez's Distant Streams performance",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage(
      "quadrophonic-inline-right.png",
      "Distant Streams performance",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage(
      "quadrophonic-inline-2.png",
      "Distant Streams performance",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage(
      "quadrophonic-inline-left.png",
      "Distant Streams performance",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage(
      "quadrophonic-fullbleed.png",
      "Distant Streams performance",
      "Photo by Ji Hoon Kim",
    ),
    uploadImage("scribble-hero.png", "Spencer Chang"),
    uploadImage("scribble-page2.png", "Spencer Chang"),
    uploadImage("scribble-page3.png", "Spencer Chang"),
    uploadImage("scribble-page4.png", "Spencer Chang"),
    uploadImage("scribble-page5.png", "Spencer Chang"),
    uploadImage("scribble-page6.png", "Spencer Chang"),
    uploadImage("iosifescu.png", "Mark Iosifescu"),
    uploadImage("chang.png", "Spencer Chang"),
    uploadImage("gero.png", "Katy Ilonka Gero"),
  ]);
  const [
    qHero,
    qRight,
    qImg2,
    qLeft,
    qBleed,
    sHero,
    sP2,
    sP3,
    sP4,
    sP5,
    sP6,
    iosifescu,
    chang,
    gero,
  ] = imgs;

  const articles = [
    {
      _type: "article" as const,
      title: "Quadrophonic Landscapes",
      slug: { _type: "slug" as const, current: "quadrophonic-landscapes" },
      publishDate: "2025-10-21",
      deck: "Leveraged Tech and Reclaimed Infrastructure in Tommy Martinez's Distant Streams",
      byline: "Written by Mark Iosifescu",
      heroImage: qHero,
      content: [
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "Let's start with the sound. Slow, an unhurried build, chorusing birdcalls and wobbles of tape delay, ocean waves shorebreaking swoony across your stereo field. Repeating, repeating, speeding and slowing, sounds arcing and echoing into directionlessness, a single immersive range being steadily demarcated around you as, inside the span, new pitches beginning to rise: a bowed guitar string, heady harmonics converted to current and compressed; low sailing bass notes, high textures on the wind; tactile synth brittleness like leaves under your feet, sampled voices flowing liquid down the panning spectrum—right to left, near to far, there and back and gone again. Before long, the feeling was one of spaciousness itself as I sat at CultureHub on a Thursday night in October, attending Tommy Martinez's performance of the fittingly-titled Distant Streams.",
          ),
        },
        {
          _type: "articleImage",
          _key: key(),
          layout: "alignRight",
          image: qRight,
        },
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "Martinez's ongoing practice is devoted to fostering experimental possibilities in sound and music via coding: open-source software development, generative interactive systems, community-minded reorientations of the tech infrastructure that has come to dominate our world. Distant Streams, which leverages the capacities of WebRTC protocols to combine multiple remote transmissions of spatial audio, is no exception. The project uses preexisting web infrastructure—the very web technologies, in fact, that underlie our streaming and video-call-saturated day-to-day lives—to construct a new way for sound artists to collaborate.\n\nThe possibilities of Distant Streams as a tool were well represented at the system's inaugural performance on October 2, 2025, where Martinez and the LA-based artist Jazmin \u201cJazzy\u201d Romero bridged physical and conceptual space between New York and Los Angeles in ways whose complexities and dimensional subtleties went well beyond any \u201cisn't this cool?\u201d kind of tech demo. Romero—whose work combines a decidedly analog outlook with multi-instrumental traditions and, increasingly, the expressive capacities of field recording—accompanied Martinez's processed guitar work with looping cassette effects, ambient recordings, and spoken samples to create a texture richly reflective of the environmental particularities of the city from which she was transmitting.",
          ),
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "Slow, an unhurried build, chorusing birdcalls and wobbles of tape delay, ocean waves shorebreaking swoony across your stereo field. Repeating, repeating, speeding and slowing, sounds arcing and echoing into directionlessness;",
        },
        { _type: "articleImage", _key: key(), layout: "full", image: qImg2 },
        {
          _type: "articleText",
          _key: key(),
          align: "left",
          style: "body",
          text: paragraphs(
            "After a series of recordings invoking layered buildups of Southern California's natural landscapes and referencing the sonic distinctions between harmonic and dissonant intervals, the sound of Wanda Coleman's 1985 poem \u201cI Live for My Car\u201d—beamed in via the recorded voice of the poet herself—had the quality of a communion among LA's intergenerational creative lineages, of an interrogation into the human subjectivities of a life spent among alienating urban infrastructure, and of an expression of homegrown beauty crossing vast distances, whether measured in freeway offramps or continentwide fiberoptics or years and years of deliberate DIY practice and devoted artistic struggle.\n\nDistant Streams builds on a long and storied tradition of artistic intervention into technologies that might otherwise be used only as consumer products or worse, as tools for domination. From the seminal 9 Evenings performances of 1966, to Liza B\u00e9ar and Keith Sonnier's \u201cSend/Receive\u201d satellite collaborations of 1977, to the telepresence experiments of Eduardo Kac and the environmental sound works of Max Neuhaus and, especially, to the long-running and extraordinary \u201cCity-Links\u201d projects of Maryanne Amacher, artists have often acted on an impulse to counteract new tech's otherwise bummer applications, appropriating extant machineries and directing them toward productive, communal, and homegrown, possibilities—in the best non-hierarchical, hack-the-planet sorta way.",
          ),
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "Distant Streams builds on a long and storied tradition of artistic intervention into technologies that might otherwise be used only as consumer products or worse, as tools for domination.",
        },
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "The openness of Distant Streams allows for expressions and formations of deep nuance and referential power, drawing on the singular qualities and backgrounds of participants, locations, and networked affinities to create something greater than the sum of its technical innovations. The project's quadraphonic possibilities offer an expanded palette for remote exchange and musical collaboration over the web—in a way that recalls Amacher's \u201cCity-Links,\u201d which leveraged its era's tech infrastructure by running FM-quality recorded transmissions over dedicated phone lines. The piece also suggests a new means of reflecting on location, lineage, and other knotty time-and-space relationships.",
          ),
        },
        {
          _type: "articleImage",
          _key: key(),
          layout: "alignLeft",
          image: qLeft,
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "The openness of Distant Streams allows for expressions and formations of deep nuance and referential power, drawing on the singular qualities and backgrounds of participants, locations, and networked affinities to create something greater than the sum of its technical innovations.",
        },
        {
          _type: "articleImage",
          _key: key(),
          layout: "fullBleed",
          image: qBleed,
        },
        {
          _type: "articleText",
          _key: key(),
          align: "center",
          style: "body",
          text: paragraphs(
            "But for me, Distant Streams' greatest achievement is also the least summarizable. By calling on histories and prophecies of networks and kinships, traditions and formats, physical and virtual spaces all expressed via the communal gestures and utopian spaces of spirited musical collaboration, Distant Streams taps the currents that feed creation's wellspring and carries their lessons into a living space you can feel—no idle research project or airless lecture, no workaday phone conference or video meeting, no prescriptive score or frozen recording. That which was flat lifts, expands, deepens into vividness, into full spatial expression, into irreducible multi-dimensionality",
          ),
        },
      ],
      author: {
        name: "Mark Iosifescu",
        website: "https://iosifescu.biz",
        photo: iosifescu,
        bio: paragraphs(
          "Mark Iosifescu is a writer, musician, and editor from New York City. His writing has appeared in LCD, The Brooklyn Rail, and The Whitney Review of New Writing, and is forthcoming in n+1. He is working on a novel called The Soft Exclusion.",
        ),
      },
    },
    {
      _type: "article" as const,
      title: "An Interview with Spencer Chang",
      slug: {
        _type: "slug" as const,
        current: "an-interview-with-spencer-chang",
      },
      publishDate: "2026-08-13",
      deck: null,
      byline: "Scribble",
      heroImage: sHero,
      content: [
        {
          _type: "imageText",
          _key: key(),
          imagePosition: "left",
          image: sP2,
          text: [
            qa(
              "Hi Spencer! Can you introduce yourself & what you make?",
              "Hi :) I'm an artist and technologist based in San Francisco. I like to say I make software you can touch — systems, sculptures, and environments that use technology to help us create, connect, and care for each other in more playful and empowering ways. Sometimes these are tools for creating tiny social networks, websites with poems made by internet strangers, or boulders that transform our phones into portals for local connection. Ultimately, I believe technology is meaningless without us, so it should amplify the best parts of our humanity.",
            ),
          ],
        },
        {
          _type: "imageText",
          _key: key(),
          imagePosition: "right",
          image: sP3,
          text: [
            qa(
              "Your work reminds me that technology can feel like magic, as in Computing Shrines, Web Stones, or even turning on/off the lamp on your homepage. What ingredients do you need for technology to feel magical?",
              "I think technology feels most magical when it opens our capacity for possibility & dreaming by turning something new and wonderful into an everyday experience. All of these creations show us a new way of thinking about technology — that our phones can be portals for local connection, stones can be computers, and a website can come to life with the actions of its visitors. I hope these inspire others to invent new forms of life, connection, and creation through our devices and digital spaces. Another big part of the magic is the playful nature of the interactions. I think play is fundamental to our ability to dream & the magic comes through when we see that idea come to life.",
            ),
          ],
        },
        {
          _type: "imageText",
          _key: key(),
          imagePosition: "left",
          image: sP4,
          text: [
            qa(
              "What can happen when the internet (to borrow your words) is not lonely, but becomes a public space that we share with others?",
              "I think a big reason the internet doesn't feel inhabited now is because we can lurk & be invisible to each other. What I love about cities & neighborhoods is that you can be alone but together: journaling quietly on a bench as so much life unfolds around you. I want the internet to feel like this because I think it helps us feel more connected to each other, the places we visit, and allows for those spontaneous encounters that stay with us for a lifetime. Public space also gives us permission to shape it! And I dream of a future of millions of tiny internet spaces, each personal, expressive, and full of life, rather than the handful of large platforms we rely on today.",
            ),
          ],
        },
        {
          _type: "imageText",
          _key: key(),
          imagePosition: "right",
          image: sP5,
          text: [
            qa(
              "Both playhtml and we were online turn the internet into worlds for collective play. What have you learned from making tools & infrastructure? What has surprised you about how people use them?",
              "The hardest part of making infrastructure & tools is choosing the right constraints. I used to have a tendency to make anything possible, but I realized that being able to do anything actually makes it harder to do something. The trick is to find the right balance where the structure provides a base for inspiration while allowing for strange emergent behavior. When people do this, they feel so rewarded for their creativity, too. I've been surprised at just how kind, creative, and playful internet strangers can be in these spaces — from creating weird new ways to feel the person through the screen to leaving a trail across websites for people to follow.",
            ),
          ],
        },
        {
          _type: "imageText",
          _key: key(),
          imagePosition: "left",
          image: sP6,
          text: [
            qa(
              "What do you dream about making next?",
              "Honestly, I find myself still dreaming about & working towards the fullest expressions of the projects we've talked about already. I dream of changing how we browse the web & our relationship to creating on top of it with a new \u201cbrowser\u201d \u2192 one focused on actually connecting us & nourishing meaningful encounters and relationships. I dream of creating alternative devices: sculptural phones & public computers.\n\nI want to make things that inspire us to believe in the internet, technology, and each other and push us to subvert, build, and imagine how our systems can support us in doing so.",
            ),
          ],
        },
      ],
      author: {
        name: "Spencer Chang",
        website: "https://spencer.place",
        photo: chang,
        bio: paragraphs(
          "Spencer Chang is an artist and toymaker who makes software you can touch. Working across internet spaces, interactive sculpture, and creative infrastructure, he activates the care, creativity, and intimacy in our everyday interactions with and through technology. These works leverage subversive play to interrogate our systems, invite different imaginations, and provide the means to reinvent them. He is interested in how we inspire new forms of technology and how these inspire us to discover new versions of ourselves. Spencer is the creator of playhtml, an open-source platform for creating communal websites, and Computing Shrines, a public art installation protocol.",
        ),
        note: paragraphs(
          "\u2317Scribble is a series of handwritten interviews about the handmade web, edited by Blair Johnson.",
        ),
      },
    },
    {
      _type: "article" as const,
      title: "An Introduction to Feedback",
      slug: { _type: "slug" as const, current: "an-introduction-to-feedback" },
      publishDate: "2021-02-16",
      deck: null,
      byline: "Written by Katy Iloka Gero",
      content: [
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "I first learn about feedback when I learn about buildings: how to stop their swaying in the wind.\n\nIn a psychology seminar, we discuss failed feedback as a potential origin of neurological diseases.\n\nI am taught how to give feedback: what I like, what I experience, what I wonder.",
          ),
        },
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "Feedback is how we nourish the creative soul. We commune, we grow, we share. Sometimes I crave this self-indulgent meal but other times, it makes me sick. Feedback as a kind of self-reflective loop. I eat my own tail. I return to myself. I find my work anew.\n\nMy own work, fed back in.",
          ),
        },
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "In architecture they were called \u2018crits\u2019. In mechanical engineering we had \u2018design reviews\u2019. When working on software I received \u2018performance evaluations\u2019. Everywhere I went, there was a slightly different way to give feedback. Slightly different language for this fundamental activity. Feedback as the touchstone of improvement.\n\nBut I always found that word so weird: feedback. It strikes me as an engineering word. Circuits use feedback to regulate their output voltage. Buildings use feedback to stop their oscillation during storms. Robots use feedback to balance themselves upright. Critique, review, evaluate-- none of these seem quite as technical. \u201cFeed\u201d less as in sustenance and more as in \u201cfeed that into the machine\u201d.",
          ),
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "Feedback is how we nourish the creative soul. We commune, we grow, we share. Sometimes I crave this self-indulgent meal but other times, it makes me sick. Feedback as a kind of self-reflective loop. I eat my own tail. I return to myself. I find my work anew.",
        },
        {
          _type: "articleText",
          _key: key(),
          align: "left",
          style: "body",
          text: paragraphs(
            "At CultureHub I am asking how feedback frames the creative process. Where does this word, feedback, come from, and how far has it traveled? When does feedback act as a self-regulating process, driving us towards a desired equilibrium? When does it produce instability, which in turn can lead to chaos, destruction? And when does it bring forth that subtle shift inside, a slight rise in our internal temperature, and create something new?\n\nI have always loved Kay Ryan's poem Don't Look Back. The poem suggests that looking back is meaningless. It's antithetical to feedback. Whether or not we witness loss does not change the fact that loss occurred:\n\n\u201cThis is not / a problem / for the neckless. / Fish cannot / recklessly / swivel their heads / to check / on their fry. / No one expects / this.\u201d\n\nAnd even if geese, with their long S-shaped necks, can check on their goslings, this does not prevent their demise. The play of life does not require our attention. Though aren't we the S-necked geese? The poem is a kind of logical trickery. Ryan tells us, don't look back, because of course we look back. Ryan surely looked back, to revise her poem, or just to reread it, languish in her creation. Looking back is our only shot at noticing something new. This is why we review our own work, or even better turn a caring eye to the work of our colleagues. Training our attention back onto ourselves, our ancestors, and our past is a powerful act of witness. And looking back may be necessary for change-- to stop history from repeating itself, to learn from our mistakes, and to understand the context in which we go forward.",
          ),
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "Where does this word, feedback, come from, and how far has it traveled? When does feedback act as a self-regulating process, driving us towards a desired equilibrium? When does it produce instability, which in turn can lead to chaos, destruction? And when does it bring forth that subtle shift inside, a slight rise in our internal temperature, and create something new?",
        },
        {
          _type: "articleText",
          _key: key(),
          align: "right",
          style: "body",
          text: paragraphs(
            "Looking back is the first part of feedback. The word \u2018feedback\u2019 seems to be birthed for electronics, where, in the 1920s, engineers were struggling to amplify only the signals they wanted. Mechanical amplification, as used in traditional gramophones, would only go so far. And electrical components weren't yet well manufactured. Feeding signals back into themselves, in clever and sometimes complicated ways, would help them grow.\n\nUltimately these feedback techniques allowed signals to be selected and increased, for instance selecting a single radio frequency from all the signals in the air and amplifying that one frequency above everything else. Tuning in. I love this vision of feedback, where amidst all the invisible signs moving through the air (and this still works even now when our rooms are filled to the brim with electrical signals of all kinds) a single thought can be selected and allowed to blossom. This is the ultimate self-reflection: an amplification of the selected part of the self. A positive loop ever increasing, until some natural limit is hit.\n\nSeveral of the artists I have interviewed at CultureHub brought up Steve Reich's piece Pendulum Music, which embodies the feedback that occurs when a microphone is placed in front of its own speaker. Three microphones are suspended from the ceiling, above three speakers. Pull the microphones back, setting them to swing like pendulums, and if you adjust the pick-up and volume just right, as they swing back and forth a melody emerges.",
          ),
        },
        {
          _type: "pullQuote",
          _key: key(),
          size: "large",
          text: "Ultimately these feedback techniques allowed signals to be selected and increased, for instance selecting a single radio frequency from all the signals in the air and amplifying that one frequency above everything else. Tuning in.",
        },
        {
          _type: "articleText",
          _key: key(),
          align: "left",
          style: "body",
          text: paragraphs(
            "The melody shifts as the microphones slow down, their arcs becoming shallow, their beat frequency shifting until eventually everything comes to a stand still. This is the second level of feedback, the feedback of air resistance, that means everything that has started will, left to its own devices, eventually stop.\n\nPendulum Music captivates me because it harnesses what I consider wild. When I think of audio feedback I think of that chaotic screeching that emerges from a microphone too close to a speaker-- now maybe we think of a video call with multiple people gone awry, a cry that someone mute themselves. But there is a way in which feedback can create balance, where the signal fed back into the circuit regulates the system. Too loud and it will get quieter; too quiet and it automatically gets louder.\n\nIn the 1940s a group of thinkers and engineers emerged called the cyberneticists, and they saw feedback in everything. Norbert Weiner, an originator of cybernetics, discusses patients with neurological diseases in the same way he discusses signal towers at railroads. Neurological diseases are an instance of something broken in the chain of feedback of the brain; the mechanical systems demonstrate our ability to stabilize systems using a human-designed chain of feedback. Here feedback becomes a different kind of tool, one that points us towards solutions, that can be harnessed.",
          ),
        },
      ],
      author: {
        name: "Katy Ilonka Gero",
        website: "https://katygero.com",
        photo: gero,
        bio: paragraphs(
          "Katy Ilonka Gero is a poet, essayist, and scientist, and is a CultureHub Resident Contributing Writer (2020\u20132021).",
        ),
      },
    },
  ];

  // Delete existing article documents, then create the three fresh ones.
  await client.delete({ query: '*[_type == "article"]' });

  const created = [];
  for (const doc of articles) {
    created.push(await client.create(doc as never));
  }

  const ids = created.map((d) => d._id);
  for (let i = 0; i < created.length; i++) {
    const others = ids.filter((_, j) => j !== i);
    await client
      .patch(ids[i])
      .set({
        readMore: others.map((_ref) => ({
          _type: "reference",
          _key: key(),
          _ref,
        })),
      })
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
