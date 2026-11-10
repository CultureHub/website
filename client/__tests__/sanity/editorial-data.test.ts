import { getReadData } from "@/sanity/editorial-data";
import { client } from "@/sanity/client";

jest.mock("@/sanity/client", () => ({ client: { fetch: jest.fn() } }));
jest.mock("next-sanity", () => ({ defineQuery: (query: string) => query }));
// Sanity's overloaded fetch ends with a raw-response overload; this boundary
// double models the normal parsed response and also accepts malformed fixtures.
const fetch = client.fetch as unknown as jest.Mock<
  Promise<unknown>,
  [string, Record<string, unknown>, Record<string, unknown>]
>;

const article = (id = "a") => ({
  _id: id,
  title: `Article ${id}`,
  slug: id,
  publishDate: "2026-01-01",
  authorName: null,
  byline: "Written by someone",
  articleType: null,
  heroImage: null,
});
const feature = (id: string) => ({
  _key: `selection-${id}`,
  previewMode: "text",
  previewWordCount: 10,
  article: {
    ...article(id),
    content: [
      {
        _type: "articleText",
        text: [
          {
            _type: "qa",
            question: "Why?",
            answer: [
              {
                _type: "block",
                children: [{ _type: "span", text: "Because art matters." }],
              },
            ],
          },
        ],
      },
    ],
  },
});

describe("published Read assembly", () => {
  beforeEach(() => fetch.mockReset());

  it("excludes only usable rendered features and never sends their raw bodies to the client", async () => {
    fetch
      .mockResolvedValueOnce({
        heading: "Editorial",
        articleIndexTitle: "Article Index",
        featuredArticles: [
          feature("b"),
          { _key: "stale", article: null },
          feature("a"),
          feature("b"),
          { ...feature("drafts.c") },
        ],
      })
      .mockResolvedValueOnce([
        article("z"),
        { ...article("invalid"), publishDate: "2026-02-30" },
      ]);
    const result = await getReadData();
    expect(result.featured.map((f) => f._id)).toEqual(["b", "a"]);
    expect(result.featured[0]._key).toBe("selection-b");
    expect(result.featured[0].previewText).toBe("Why? Because art matters.");
    expect(result.featured[0]).not.toHaveProperty("content");
    expect(result.articles.map((a) => a._id)).toEqual(["z"]);
    expect(result.articles[0].authorName).toBe("Written by someone");
    expect(fetch.mock.calls[1][1]).toEqual({ excludedIds: ["b", "a"] });
    for (const call of fetch.mock.calls)
      expect(call[2]).toMatchObject({
        perspective: "published",
        next: { revalidate: 30 },
      });
    expect(String(fetch.mock.calls[1][0])).not.toContain("content");
  });

  it("keeps every eligible archive article when no singleton exists", async () => {
    fetch
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([
        article("a"),
        { ...article("no-slug"), slug: "" },
        { ...article("no-title"), title: " " },
      ]);
    const data = await getReadData();
    expect(data.heading).toBe("Editorial");
    expect(data.articleIndexTitle).toBe("Article Index");
    expect(data.featured).toEqual([]);
    expect(data.articles.map((a) => a._id)).toEqual(["a"]);
    expect(fetch.mock.calls[1][1]).toEqual({ excludedIds: [] });
  });

  it("defaults stale word counts and preserves image-less metadata cards", async () => {
    const f = feature("a");
    fetch
      .mockResolvedValueOnce({
        featuredArticles: [{ ...f, previewWordCount: 1, previewMode: "image" }],
      })
      .mockResolvedValueOnce([]);
    const data = await getReadData();
    expect(data.featured).toHaveLength(1);
    expect(data.featured[0].heroImage).toBeNull();
    expect(data.featured[0].previewMode).toBe("image");
  });

  it("bounds legacy feature counts and truncates opening text by the configured word limit", async () => {
    const f = {
      ...feature("a"),
      article: {
        ...article("a"),
        content: [
          {
            _type: "articleText",
            text: [
              {
                _type: "block",
                children: [
                  {
                    _type: "span",
                    text: "one two three four five six seven eight nine ten eleven",
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    fetch
      .mockResolvedValueOnce({
        featuredArticles: [f, feature("b"), feature("c"), feature("d")],
      })
      .mockResolvedValueOnce([]);
    const data = await getReadData();
    expect(data.featured).toHaveLength(3);
    expect(data.featured[0].previewText).toBe(
      "one two three four five six seven eight nine ten…",
    );
  });
});
