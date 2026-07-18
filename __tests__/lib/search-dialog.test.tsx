import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { highlightMatches } from "@/components/search-dialog";

function htmlOf(node: React.ReactNode): string {
  return renderToStaticMarkup(<>{node}</>);
}

describe("search-dialog highlightMatches", () => {
  it("returns plain text when query is empty/whitespace", () => {
    expect(highlightMatches("hello world", "")).toBe("hello world");
    expect(highlightMatches("hello world", "   ")).toBe("hello world");
  });

  it("wraps a single occurrence in <mark>", () => {
    const html = htmlOf(highlightMatches("hello world", "world"));
    expect(html).toContain("<mark");
    expect(html).toContain("world");
    expect(html).toContain("hello");
  });

  it("highlights every occurrence even when many (stateful regex bug regression)", () => {
    const html = htmlOf(highlightMatches("foo bar foo baz foo qux foo", "foo"));
    const matches = html.match(/<mark[^>]*>foo<\/mark>/g) ?? [];
    expect(matches).toHaveLength(4);
  });

  it("regression: '.test() stateful bug' would skip matches — fix must catch all of them", () => {
    const text = "alpha beta alpha gamma alpha delta alpha";
    const html = htmlOf(highlightMatches(text, "alpha"));
    const marks = html.match(/<mark[^>]*>alpha<\/mark>/g) ?? [];
    expect(marks.length).toBe(4);
  });

  it("escapes regex metacharacters safely (no ReDoS, no exception)", () => {
    const html = htmlOf(highlightMatches("price: $100.00 — that^costs_*+?", "$100.00"));
    expect(html).toContain("<mark");
  });

  it("is case-insensitive", () => {
    const html = htmlOf(highlightMatches("Foo foo FOO", "foo"));
    const marks = html.match(/<mark[^>]*>[^<]+<\/mark>/g) ?? [];
    expect(marks).toHaveLength(3);
  });

  it("preserves the original casing in the highlighted span", () => {
    const html = htmlOf(highlightMatches("Foo bar foo", "foo"));
    expect(html).toMatch(/<mark[^>]*>Foo<\/mark>/);
    expect(html).toMatch(/<mark[^>]*>foo<\/mark>/);
  });

  it("returns the original text when there is no match", () => {
    const html = htmlOf(highlightMatches("no match here", "xyz"));
    expect(html).toBe("no match here");
  });
});
