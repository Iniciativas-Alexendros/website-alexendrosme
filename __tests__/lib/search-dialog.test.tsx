import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot, type Root } from "react-dom/client";
import { highlightMatches, SearchDialog } from "@/components/search-dialog";
import { I18nProvider } from "@/lib/i18n";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function htmlOf(node: React.ReactNode): string {
  return renderToStaticMarkup(<>{node}</>);
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function flushEffects(): Promise<void> {
  await tick();
  await tick();
  await tick();
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

describe("SearchDialog load error state", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    root?.unmount();
    container.remove();
    globalThis.fetch = originalFetch;
    document.querySelectorAll("[data-radix-portal]").forEach((el) => el.remove());
  });

  async function renderDialog() {
    root = createRoot(container);
    root.render(
      <I18nProvider>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </I18nProvider>,
    );
    await flushEffects();
  }

  it("shows loadError alert when search-index.json fetch fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down")) as typeof fetch;

    await renderDialog();

    const alert = document.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain("No se pudo cargar el índice de búsqueda");
  });

  it("shows loadError when search-index.json returns non-OK status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }) as typeof fetch;

    await renderDialog();

    const alert = document.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain("No se pudo cargar el índice de búsqueda");
  });

  it("shows shortcut hint when index loads successfully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          slug: "demo",
          type: "opinion",
          title: "Demo title",
          description: "Demo description",
          tags: ["demo"],
          content: "Demo body about soberania",
        },
      ],
    }) as typeof fetch;

    await renderDialog();

    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(document.body.textContent).toContain("Buscar (⌘K)");
  });

  it("does not fetch the search index until the dialog is open", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    }) as typeof fetch;
    globalThis.fetch = fetchMock;

    root = createRoot(container);
    root.render(
      <I18nProvider>
        <SearchDialog open={false} onOpenChange={() => {}} />
      </I18nProvider>,
    );
    await flushEffects();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
