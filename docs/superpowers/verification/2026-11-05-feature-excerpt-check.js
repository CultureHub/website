// Browser layout regression for the real FeaturedArticles component with three
// 150-word fixture excerpts. Run with DevTools evaluate_script/sourcePath after
// loading the development-only fixture at each acceptance width (375/440/768/1440).
// JSDOM cannot measure CSS clipping. The temporary fixture route must not ship.
function checkFeaturedExcerpts() {
  const excerpts = [
    ...document.querySelectorAll(
      'section[aria-label="Featured articles"] [aria-hidden="true"] p',
    ),
  ];
  if (excerpts.length !== 3)
    throw new Error("Expected three real text-preview cards");
  const bounds = excerpts.map((excerpt) => {
    const card = excerpt.closest("a");
    const box = excerpt.getBoundingClientRect();
    const outer = card.getBoundingClientRect();
    if (excerpt.textContent.trim().split(/\s+/).length !== 150)
      throw new Error("Configured words were lost");
    const style = getComputedStyle(excerpt);
    const lineHeight = parseFloat(style.lineHeight);
    const lineLimit = parseInt(style.webkitLineClamp, 10);
    if (box.bottom > outer.bottom - 23 || box.top < outer.top + 23) {
      throw new Error(`Excerpt cut off by card at ${innerWidth}px`);
    }
    // A CSS line clamp supplies its own visible ellipsis, unlike max-height
    // clipping. Require whole lines with no earlier hard cut and full AT text.
    if (
      excerpt.scrollHeight > excerpt.clientHeight + 1 &&
      (!Number.isFinite(lineLimit) ||
        Math.abs(excerpt.clientHeight - lineLimit * lineHeight) > 1)
    ) {
      throw new Error(
        `Excerpt silently clipped before ellipsis at ${innerWidth}px: ${excerpt.clientHeight}/${excerpt.scrollHeight}px`,
      );
    }
    if (card.getAttribute("aria-description") !== excerpt.textContent)
      throw new Error("Full excerpt is inaccessible");
    if (Math.abs(outer.height - (innerWidth < 768 ? 323 : 584)) > 1)
      throw new Error("Card lost its reference size");
    return { cardHeight: outer.height, excerptHeight: box.height, words: 150 };
  });
  if (document.documentElement.scrollWidth > innerWidth)
    throw new Error("Horizontal page overflow");
  return { width: innerWidth, bounds };
}
