import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

/* ── Global IntersectionObserver mock ── */
type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

/**
 * Map of element-id → observer callback, populated by observe(el).
 * Enables per-element intersection firing for multi-section tests.
 */
let callbacksById = new Map<string, ObserverCallback>();

function makeEntry(id: string, intersectionRatio: number, el?: Element): IntersectionObserverEntry {
  const target = el ?? document.getElementById(id) ?? document.createElement("div");
  return {
    intersectionRatio,
    isIntersecting: intersectionRatio > 0,
    target,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry;
}

beforeEach(() => {
  callbacksById = new Map();
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (callback: ObserverCallback) {
      const disconnect = vi.fn(() => {
        callbacksById.clear();
      });
      return {
        observe: vi.fn((el: Element) => {
          if (el.id) callbacksById.set(el.id, callback);
        }),
        unobserve: vi.fn(),
        disconnect,
        root: null,
        rootMargin: "",
        thresholds: [],
        takeRecords: () => [],
      };
    }) as unknown as typeof IntersectionObserver,
  );
});

afterEach(() => {
  callbacksById.clear();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

/**
 * Fire an intersection event for a given element id.
 */
function fireIntersection(id: string, intersectionRatio: number) {
  const cb = callbacksById.get(id);
  const el = document.getElementById(id);
  if (!cb || !el) return;
  cb([makeEntry(id, intersectionRatio, el)]);
}

/**
 * Wait for React effects + re-renders to settle.
 */
async function flushEffects(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
}

/* ── Spy component factory: inject deps at render time ── */
function createSpyApp(deps: {
  useScrollSpy: typeof import("@/lib/hooks/useScrollSpy").useScrollSpy;
}) {
  return function SpyApp({
    ids,
    rootMargin,
    threshold,
  }: {
    ids: string[];
    rootMargin?: string;
    threshold?: number[];
  }) {
    const activeId = deps.useScrollSpy(ids, { rootMargin, threshold });
    return <div data-testid="result">{activeId}</div>;
  };
}

describe("useScrollSpy", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    root?.unmount();
    container.remove();
  });

  async function render(ids: string[], opts?: { rootMargin?: string; threshold?: number[] }) {
    // Create DOM elements with the provided ids
    for (const id of ids) {
      const el = document.createElement("section");
      el.id = id;
      el.style.height = "200px";
      el.style.width = "100%";
      document.body.appendChild(el);
    }

    // Dynamically import the hook and create a component with it
    const { useScrollSpy } = await import("@/lib/hooks/useScrollSpy");
    const App = createSpyApp({ useScrollSpy });

    root = createRoot(container);
    root.render(<App ids={ids} rootMargin={opts?.rootMargin} threshold={opts?.threshold} />);
    await flushEffects();

    return {
      getResult: () => container.querySelector('[data-testid="result"]')?.textContent ?? "",
      fireIntersection,
    };
  }

  it("devuelve string vacío cuando no hay intersecciones", async () => {
    const { getResult } = await render(["section1", "section2"]);
    expect(getResult()).toBe("");
  });

  it("devuelve el id de la sección con mayor intersección", async () => {
    const { getResult } = await render(["section1", "section2"]);

    fireIntersection("section1", 0.6);
    await flushEffects();
    expect(getResult()).toBe("#section1");

    fireIntersection("section2", 0.8);
    await flushEffects();
    expect(getResult()).toBe("#section2");
  });

  it("cambia a la sección con ratio más alto cuando ambas son visibles", async () => {
    const { getResult } = await render(["section1", "section2"]);

    fireIntersection("section1", 0.5);
    fireIntersection("section2", 0.3);
    await flushEffects();
    expect(getResult()).toBe("#section1");

    fireIntersection("section1", 0.2);
    fireIntersection("section2", 0.7);
    await flushEffects();
    expect(getResult()).toBe("#section2");
  });

  it("ignora IDs que no existen en el DOM", async () => {
    const { getResult } = await render(["existing-section"]);

    fireIntersection("existing-section", 0.5);
    await flushEffects();
    expect(getResult()).toBe("#existing-section");
  });

  it("se mantiene en la última sección activa cuando todos los ratios son 0", async () => {
    const { getResult } = await render(["section1", "section2"]);

    fireIntersection("section1", 0.5);
    await flushEffects();
    expect(getResult()).toBe("#section1");

    fireIntersection("section1", 0);
    fireIntersection("section2", 0);
    await flushEffects();
    // Should keep the last active since none has ratio > 0
    expect(getResult()).toBe("#section1");
  });

  it("acepta rootMargin personalizado", async () => {
    const { getResult } = await render(["section1"], { rootMargin: "-10% 0px -50% 0px" });

    fireIntersection("section1", 0.8);
    await flushEffects();
    expect(getResult()).toBe("#section1");
  });

  it("acepta threshold personalizado", async () => {
    const { getResult } = await render(["section1"], { threshold: [0, 0.1, 0.2, 0.3] });

    fireIntersection("section1", 0.25);
    await flushEffects();
    expect(getResult()).toBe("#section1");
  });

  it("desconecta observers al desmontar", async () => {
    const { useScrollSpy } = await import("@/lib/hooks/useScrollSpy");

    // Reset the global mock to capture disconnect
    const disconnect = vi.fn();
    callbacksById = new Map();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function () {
        return {
          observe: vi.fn((el: Element) => {
            if (el.id) callbacksById.set(el.id, (_entries: IntersectionObserverEntry[]) => {});
          }),
          unobserve: vi.fn(),
          disconnect,
          root: null,
          rootMargin: "",
          thresholds: [],
          takeRecords: () => [],
        };
      }) as unknown as typeof IntersectionObserver,
    );

    const el = document.createElement("section");
    el.id = "cleanup-section";
    document.body.appendChild(el);

    function DisposeApp() {
      useScrollSpy(["cleanup-section"]);
      return <div />;
    }

    root = createRoot(container);
    root.render(<DisposeApp />);
    await flushEffects();

    root.unmount();
    await flushEffects();

    expect(disconnect).toHaveBeenCalled();
    el.remove();
  });

  it("maneja array de IDs vacío sin errores", async () => {
    const { getResult } = await render([]);
    // No observers should be created with empty ids
    await flushEffects();
    expect(getResult()).toBe("");
  });
});

describe("useScrollSpy — valores por defecto", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    root?.unmount();
    container.remove();
  });

  it("usa valores por defecto cuando no se pasan opciones", async () => {
    const { useScrollSpy } = await import("@/lib/hooks/useScrollSpy");

    const section = document.createElement("section");
    section.id = "default-section";
    document.body.appendChild(section);

    function DefaultApp() {
      useScrollSpy(["default-section"]);
      return <div />;
    }

    root = createRoot(container);
    root.render(<DefaultApp />);
    await flushEffects();

    expect(callbacksById.size).toBe(1);
    section.remove();
  });
});
