import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot, type Root } from "react-dom/client";
import { I18nProvider, useI18n } from "@/lib/i18n";

const LOCALE_KEY = "ax-locale";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "es";
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.lang = "es";
});

/**
 * Wait for React effects + re-renders to settle.
 * happy-dom is single-threaded; a single setTimeout(0) may not be enough
 * for the useEffect → setState → re-render cycle. We yield twice.
 */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function flushEffects(): Promise<void> {
  await tick();
  await tick();
  await tick();
}

/* ── SSR: renderToStaticMarkup (no hydration) ── */

describe("I18nProvider SSR (renderToStaticMarkup)", () => {
  it("renderiza children", () => {
    const html = renderToStaticMarkup(
      <I18nProvider>
        <div data-testid="child">content</div>
      </I18nProvider>,
    );
    expect(html).toContain("content");
  });

  it("no lee localStorage en SSR", () => {
    localStorage.setItem(LOCALE_KEY, "en");
    const getSpy = vi.spyOn(Storage.prototype, "getItem");
    renderToStaticMarkup(
      <I18nProvider>
        <div />
      </I18nProvider>,
    );
    expect(getSpy).not.toHaveBeenCalledWith(LOCALE_KEY);
    getSpy.mockRestore();
  });
});

/* ── Hydration: createRoot (client-side) ── */

describe("I18nProvider hydrated (createRoot)", () => {
  let container: HTMLDivElement;
  let root: Root;

  function Consumer({ path }: { path: string }) {
    const { locale, t, tArray, setLocale } = useI18n();
    return (
      <div>
        <span data-testid="locale">{locale}</span>
        <span data-testid="t-result">{t(path)}</span>
        <span data-testid="tArray-result">{tArray(path).join("|")}</span>
        <span data-testid="tArray-length">{tArray(path).length}</span>
        <span data-testid="is-array">{Array.isArray(tArray(path)) ? "yes" : "no"}</span>
        <button data-testid="set-locale-en" onClick={() => setLocale("en")} />
        <button data-testid="set-locale-es" onClick={() => setLocale("es")} />
      </div>
    );
  }

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    root?.unmount();
    container.remove();
  });

  async function renderApp(element: React.ReactElement) {
    root = createRoot(container);
    root.render(element);
    await flushEffects();
  }

  async function clickTestid(testid: string) {
    const btn = container.querySelector(`[data-testid="${testid}"]`) as HTMLButtonElement;
    btn?.click();
    await tick();
    await tick();
  }

  it("renderiza con locale=es por defecto", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="hero.signature" />
      </I18nProvider>,
    );
    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
  });

  it("resuelve t() con path existente", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Ahora");
  });

  it("resuelve t() con path inexistente devuelve el path", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="non.existent.key" />
      </I18nProvider>,
    );
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe(
      "non.existent.key",
    );
  });

  it("tArray() devuelve string[] para paths de tipo string[]", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="sections.expStack.items" />
      </I18nProvider>,
    );
    const lenEl = container.querySelector('[data-testid="tArray-length"]');
    const isArrEl = container.querySelector('[data-testid="is-array"]');
    expect(parseInt(lenEl?.textContent ?? "0", 10)).toBeGreaterThan(0);
    expect(isArrEl?.textContent).toBe("yes");
  });

  it("tArray() devuelve array vacío para paths de tipo string", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="hero.signature" />
      </I18nProvider>,
    );
    const isArrEl = container.querySelector('[data-testid="is-array"]');
    const lenEl = container.querySelector('[data-testid="tArray-length"]');
    expect(isArrEl?.textContent).toBe("yes");
    expect(lenEl?.textContent).toBe("0");
  });

  it("tArray() devuelve conteo correcto para expStack.items (6)", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="sections.expStack.items" />
      </I18nProvider>,
    );
    const lenEl = container.querySelector('[data-testid="tArray-length"]');
    expect(lenEl?.textContent).toBe("6");
  });

  it("tArray() devuelve conteo correcto para expHerramientas.items (4)", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="sections.expHerramientas.items" />
      </I18nProvider>,
    );
    const lenEl = container.querySelector('[data-testid="tArray-length"]');
    expect(lenEl?.textContent).toBe("4");
  });

  it("actualiza locale al llamar setLocale('en')", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    await clickTestid("set-locale-en");

    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe("en");
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Now");
  });

  it("actualiza locale al llamar setLocale('es') desde en", async () => {
    localStorage.setItem(LOCALE_KEY, "en");
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    // After hydration effects, should be "en"
    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe("en");
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Now");

    await clickTestid("set-locale-es");

    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Ahora");
  });

  it("lee locale de localStorage al montar", async () => {
    localStorage.setItem(LOCALE_KEY, "en");

    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Now");
  });

  it("persiste locale en localStorage al cambiar", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    await clickTestid("set-locale-en");

    expect(localStorage.getItem(LOCALE_KEY)).toBe("en");
  });

  it("actualiza document.documentElement.lang al cambiar locale", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    await clickTestid("set-locale-en");

    expect(document.documentElement.lang).toBe("en");
  });

  it("ignora locale inválido en localStorage", async () => {
    localStorage.setItem(LOCALE_KEY, "fr");

    await renderApp(
      <I18nProvider>
        <Consumer path="locale.name" />
      </I18nProvider>,
    );

    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Español");
  });

  it("tolera localStorage lanzando excepción al leer", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    vi.restoreAllMocks();
  });

  it("tolera localStorage lanzando excepción al escribir", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    expect(() => {
      const btn = container.querySelector('[data-testid="set-locale-en"]') as HTMLButtonElement;
      btn?.click();
    }).not.toThrow();
    vi.restoreAllMocks();
  });

  it("cambia locale dos veces (es→en→es)", async () => {
    await renderApp(
      <I18nProvider>
        <Consumer path="nav.now" />
      </I18nProvider>,
    );

    await clickTestid("set-locale-en");
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Now");

    await clickTestid("set-locale-es");
    expect(container.querySelector('[data-testid="t-result"]')?.textContent).toBe("Ahora");
  });
});

/* ── Context default values ── */

describe("useI18n default context (fuera del provider)", () => {
  it("devuelve locale=es por defecto", () => {
    function TestComponent() {
      const { locale, t, tArray } = useI18n();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <span data-testid="t">{t("any.path")}</span>
          <span data-testid="tArray-length">{tArray("any.path").length}</span>
        </div>
      );
    }
    const html = renderToStaticMarkup(<TestComponent />);
    expect(html).toContain("es");
    expect(html).toContain("any.path");
    expect(html).toContain("0");
  });
});
