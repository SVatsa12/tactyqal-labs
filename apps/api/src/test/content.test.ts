import { describe, expect, it } from "vitest";
import { htmlToText, makeExcerpt, readingTimeMinutes, stripTags } from "../lib/content.js";

// Pure functions: these run even without TEST_DATABASE_URL.
describe("content helpers", () => {
  const html = "<h2>Hello</h2><p>Some <strong>bold</strong> words.</p><ul><li>One</li><li>Two</li></ul>";

  it("keeps words apart across block boundaries", () => {
    expect(htmlToText(html)).toBe("Hello Some bold words. One Two");
    expect(stripTags(html)).toBe("HelloSome bold words.OneTwo"); // the old behaviour, kept for the recompute script
  });

  it("decodes entities and collapses whitespace", () => {
    expect(htmlToText("<p>Tom &amp; Jerry&nbsp;&mdash;  friends</p>")).toBe("Tom & Jerry — friends");
  });

  it("cuts excerpts on a word boundary with an ellipsis", () => {
    const long = `<p>${"word ".repeat(80)}</p><p>end.</p>`;
    const excerpt = makeExcerpt(long, 50);
    expect(excerpt.length).toBeLessThanOrEqual(51);
    expect(excerpt.endsWith("word…")).toBe(true);
  });

  it("estimates reading time at 200 words per minute, minimum 1", () => {
    expect(readingTimeMinutes("<p>short</p>")).toBe(1);
    expect(readingTimeMinutes(`<p>${"word ".repeat(1000)}</p>`)).toBe(5);
  });
});
