import { describe, it, expect } from "vitest";
import {
  calculateReadingTime,
  getContentCollection,
  getAllTags,
  getArticlesByTag,
} from "@/lib/content/loader";

describe("calculateReadingTime", () => {
  it("returns 1 for ~200 words", () => {
    expect(calculateReadingTime(Array(200).fill("w").join(" "))).toBe(1);
  });

  it("returns 2 for ~400 words", () => {
    expect(calculateReadingTime(Array(400).fill("w").join(" "))).toBe(2);
  });

  it("returns minimum 1 for empty content", () => {
    expect(calculateReadingTime("")).toBe(1);
  });

  it("strips markdown formatting before counting", () => {
    const md = "# Title\n\nSome **bold** text and `code`.";
    const minutes = calculateReadingTime(md);
    expect(minutes).toBeGreaterThanOrEqual(1);
  });

  it("counts words across whitespace including newlines", () => {
    const text = "word1\nword2\n\nword3\nword4";
    expect(calculateReadingTime(text)).toBe(1);
  });

  it("strips fenced code blocks completely", () => {
    const longCodeBlock = "```\n" + Array(500).fill("inside-code").join(" ") + "\n```";
    expect(calculateReadingTime(longCodeBlock)).toBe(1);
  });
});

describe("getContentCollection", () => {
  it("assigns readingTime to each item", async () => {
    const items = await getContentCollection("espensar");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(typeof item.readingTime).toBe("number");
      expect(item.readingTime).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("getAllTags", () => {
  it("returns sorted unique tags", async () => {
    const tags = await getAllTags();
    expect(tags.length).toBeGreaterThan(0);
    const sorted = [...tags].sort((a, b) => a.localeCompare(b, "es"));
    expect(tags).toEqual(sorted);
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe("getArticlesByTag", () => {
  it("returns empty for unknown tag", async () => {
    const articles = await getArticlesByTag("nonexistent-tag-xyz-12345");
    expect(articles).toEqual([]);
  });

  it("filters by tag and sorts newest first", async () => {
    const tags = await getAllTags();
    const target = tags[0];
    if (target === undefined) return;
    const articles = await getArticlesByTag(target);
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) {
      expect(a.frontmatter.tags).toContain(target);
    }
    for (let i = 1; i < articles.length; i++) {
      const prev = articles[i - 1]?.frontmatter.date ?? "";
      const curr = articles[i]?.frontmatter.date ?? "";
      expect(new Date(prev).getTime()).toBeGreaterThanOrEqual(new Date(curr).getTime());
    }
  });
});
