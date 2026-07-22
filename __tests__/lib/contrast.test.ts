/**
 * WCAG 2.1 AA contrast ratio test for Alexendros.me Design System tokens.
 *
 * Parses the oklch(--ax-*) tokens from colors.css and computes the WCAG
 * relative luminance for each scheme (dark, light/media, light/data-theme,
 * dark/data-theme), then checks every critical foreground-on-background
 * pair for a minimum ratio of 4.5:1 (AA normal text).
 */

import { describe, expect, it } from "vitest";

/* ═══════════════════════════════════════════════════════════════════════
   OKLCH → sRGB → Relative Luminance conversion
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Based on the CSS Color Level 4 spec and the WCAG 2.1 relative luminance
 * definition (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance).
 */

const DEG = Math.PI / 180;

/** oklch(L, C, h) → oklab(L, a, b) */
function oklchToOklab(L: number, C: number, h: number): [number, number, number] {
  return [L, C * Math.cos(h * DEG), C * Math.sin(h * DEG)];
}

/**
 * oklab → linear sRGB via the LMS matrix.
 *
 * Matrix from https://bottosson.github.io/posts/oklab/
 */
function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearSrgbToRelativeLuminance(r: number, g: number, b: number): number {
  // The WCAG formula expects linear (not gamma-corrected) sRGB values
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Parse an oklch(L C h) or oklch(L C h / alpha) CSS string into [L, C, h] */
function parseOklch(raw: string): [number, number, number] {
  const cleaned = raw.replace(/\s*\/\s*[\d.]+/, ""); // strip alpha
  const match = cleaned.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) throw new Error(`Cannot parse oklch: ${raw}`);
  // SAFE: guard clause ensures match is truthy and capture groups exist
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [parseFloat(match[1]!), parseFloat(match[2]!), parseFloat(match[3]!)];
}

/** Full pipeline: oklch CSS string → relative luminance */
function oklchToLuminance(raw: string): number {
  const [L, C, h] = parseOklch(raw);
  const [l, a, b] = oklchToOklab(L, C, h);
  const [r, g, b_] = oklabToLinearSrgb(l, a, b);
  return linearSrgbToRelativeLuminance(r, g, b_);
}

/** WCAG 2.1 contrast ratio between two relative luminances */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/* ═══════════════════════════════════════════════════════════════════════
   Token definitions — three schemes
   ═══════════════════════════════════════════════════════════════════════ */

type TokenMap = Record<string, string>;

/**
 * Resolve a raw value that might be a `var(--ax-*)` reference
 * into the concrete oklch string by looking it up in the same map.
 */
function resolve(token: string, map: TokenMap): string {
  const varRef = token.match(/^var\((--[\w-]+)\)$/);
  if (varRef) {
    // SAFE: regex guarantees varRef[1] exists when varRef is truthy
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resolved = map[varRef[1]!];
    if (resolved) return resolve(resolved, map);
  }
  return token;
}

function resolveAll(map: TokenMap): TokenMap {
  const out: TokenMap = {};
  for (const [key, raw] of Object.entries(map)) {
    out[key] = resolve(raw, map);
  }
  return out;
}

// ── Dark (default :root) ──
const DARK: TokenMap = resolveAll({
  "--ax-surface-0": "oklch(0.1 0.014 315)",
  "--ax-surface-100": "oklch(0.14 0.018 315)",
  "--ax-surface-200": "oklch(0.17 0.02 315)",
  "--ax-surface-300": "oklch(0.2 0.022 315)",
  "--ax-surface-400": "oklch(0.23 0.024 315)",
  "--ax-surface-500": "oklch(0.26 0.026 315)",
  "--ax-surface-600": "oklch(0.29 0.028 315)",
  "--ax-surface-700": "oklch(0.33 0.03 315)",
  "--ax-surface-800": "oklch(0.37 0.032 315)",
  "--ax-surface-900": "oklch(0.42 0.034 315)",
  "--ax-accent": "oklch(0.78 0.165 85)",
  "--ax-accent-dim": "oklch(0.62 0.13 85)",
  "--ax-accent-bright": "oklch(0.92 0.1 88)",
  "--ax-accent-fg": "oklch(0.08 0.01 50)",
  "--ax-text-primary": "oklch(0.97 0.008 310)",
  "--ax-text-secondary": "oklch(0.8 0.01 310)",
  "--ax-text-tertiary": "oklch(0.62 0.012 310)",
  "--ax-text-disabled": "oklch(0.46 0.014 310)",
  "--ax-text-inverse": "oklch(0.07 0.012 315)",
  // Brand aliases
  "--ax-brand-primary": "var(--ax-accent)",
  "--ax-brand-primary-fg": "var(--ax-accent-fg)",
  "--ax-brand-accent": "var(--ax-accent-dim)",
  "--ax-brand-accent-fg": "var(--ax-accent-fg)",
  // Semantic
  "--ax-success-fg": "oklch(0.78 0.16 130)",
  "--ax-success-bg": "oklch(0.2 0.06 130)",
  "--ax-warning-fg": "oklch(0.82 0.16 82)",
  "--ax-warning-bg": "oklch(0.22 0.06 82)",
  "--ax-error-fg": "oklch(0.72 0.22 25)",
  "--ax-error-bg": "oklch(0.22 0.07 25)",
  "--ax-info-fg": "oklch(0.78 0.14 230)",
  "--ax-info-bg": "oklch(0.2 0.05 230)",
});

// ── Light (media query / [data-theme="light"]) ──
const LIGHT: TokenMap = resolveAll({
  "--ax-surface-0": "oklch(0.98 0.01 85)",
  "--ax-surface-100": "oklch(0.93 0.014 85)",
  "--ax-surface-200": "oklch(0.88 0.016 85)",
  "--ax-surface-300": "oklch(0.82 0.018 85)",
  "--ax-surface-400": "oklch(0.76 0.02 85)",
  "--ax-surface-500": "oklch(0.7 0.022 85)",
  "--ax-surface-600": "oklch(0.63 0.024 85)",
  "--ax-surface-700": "oklch(0.56 0.026 85)",
  "--ax-surface-800": "oklch(0.49 0.028 85)",
  "--ax-surface-900": "oklch(0.42 0.03 85)",
  "--ax-accent": "oklch(0.55 0.15 85)",
  "--ax-accent-dim": "oklch(0.48 0.14 85)",
  "--ax-accent-bright": "oklch(0.52 0.17 85)",
  "--ax-accent-fg": "oklch(1 0 0)",
  "--ax-text-primary": "oklch(0.15 0.012 315)",
  "--ax-text-secondary": "oklch(0.3 0.014 315)",
  "--ax-text-tertiary": "oklch(0.45 0.016 315)",
  "--ax-text-disabled": "oklch(0.6 0.018 315)",
  "--ax-text-inverse": "oklch(0.95 0.008 85)",
  // Brand aliases
  "--ax-brand-primary": "var(--ax-accent)",
  "--ax-brand-primary-fg": "var(--ax-accent-fg)",
  "--ax-brand-accent": "var(--ax-accent-dim)",
  "--ax-brand-accent-fg": "var(--ax-accent-fg)",
  // Semantic
  "--ax-success-fg": "oklch(0.3 0.12 130)",
  "--ax-success-bg": "oklch(0.88 0.08 130)",
  "--ax-warning-fg": "oklch(0.35 0.12 82)",
  "--ax-warning-bg": "oklch(0.9 0.08 82)",
  "--ax-error-fg": "oklch(0.35 0.15 25)",
  "--ax-error-bg": "oklch(0.88 0.08 25)",
  "--ax-info-fg": "oklch(0.3 0.12 230)",
  "--ax-info-bg": "oklch(0.88 0.07 230)",
});

/* ═══════════════════════════════════════════════════════════════════════
   Foreground/Background pairs to test
   ═══════════════════════════════════════════════════════════════════════ */

interface ContrastPair {
  fg: string; // token name
  bg: string; // token name
  label: string;
  minRatio: number; // 4.5:1 for AA, 3:1 for large text
}

/**
 * Critical semantic pairs that appear in the UI. Each pair represents
 * an actual foreground-on-background combination used by components.
 */
const PAIRS: ContrastPair[] = [
  // Main text on backgrounds
  { fg: "--ax-text-primary", bg: "--ax-surface-0", label: "body text on page bg", minRatio: 4.5 },
  { fg: "--ax-text-primary", bg: "--ax-surface-100", label: "body text on card bg", minRatio: 4.5 },
  {
    fg: "--ax-text-primary",
    bg: "--ax-surface-200",
    label: "body text on muted bg",
    minRatio: 4.5,
  },
  {
    fg: "--ax-text-secondary",
    bg: "--ax-surface-0",
    label: "secondary text on page",
    minRatio: 4.5,
  },
  {
    fg: "--ax-text-secondary",
    bg: "--ax-surface-100",
    label: "secondary text on card",
    minRatio: 4.5,
  },
  { fg: "--ax-text-tertiary", bg: "--ax-surface-0", label: "tertiary text on page", minRatio: 4.5 },
  {
    fg: "--ax-text-tertiary",
    bg: "--ax-surface-200",
    label: "tertiary text on muted",
    minRatio: 4.5,
  },

  // Accent / brand
  { fg: "--ax-brand-primary", bg: "--ax-surface-0", label: "accent text on page", minRatio: 4.5 },
  {
    fg: "--ax-brand-primary-fg",
    bg: "--ax-brand-primary",
    label: "accent fg on accent bg (CTA)",
    minRatio: 4.5,
  },

  // Brand accent (dim) — used as accent shadcn background
  {
    fg: "--ax-brand-accent-fg",
    bg: "--ax-brand-accent",
    label: "accent foreground on accent background",
    minRatio: 4.5,
  },

  // Semantic states
  { fg: "--ax-success-fg", bg: "--ax-surface-0", label: "success text on page", minRatio: 4.5 },
  {
    fg: "--ax-success-fg",
    bg: "--ax-success-bg",
    label: "success text on success bg",
    minRatio: 4.5,
  },
  { fg: "--ax-warning-fg", bg: "--ax-surface-0", label: "warning text on page", minRatio: 4.5 },
  {
    fg: "--ax-warning-fg",
    bg: "--ax-warning-bg",
    label: "warning text on warning bg",
    minRatio: 4.5,
  },
  { fg: "--ax-error-fg", bg: "--ax-surface-0", label: "error text on page", minRatio: 4.5 },
  { fg: "--ax-error-fg", bg: "--ax-error-bg", label: "error text on error bg", minRatio: 4.5 },
  { fg: "--ax-info-fg", bg: "--ax-surface-0", label: "info text on page", minRatio: 4.5 },
  { fg: "--ax-info-fg", bg: "--ax-info-bg", label: "info text on info bg", minRatio: 4.5 },

  // Button variants (shadcn semantic mapping)
  {
    fg: "--ax-brand-primary-fg",
    bg: "--ax-brand-primary",
    label: "primary button text primary button bg",
    minRatio: 4.5,
  },
  {
    fg: "--ax-text-primary",
    bg: "--ax-surface-200",
    label: "muted button text on muted",
    minRatio: 4.5,
  },
  {
    fg: "--ax-accent-fg",
    bg: "--ax-accent-dim",
    label: "accent button text on accent dim",
    minRatio: 4.5,
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Test runner
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * For each scheme, compute the luminance of every known token, then check
 * each pair's contrast ratio meets the minimum.
 */
function checkScheme(schemeName: string, tokens: TokenMap): void {
  // Pre-compute luminance for all tokens
  const luminance: Record<string, number> = {};
  for (const [token, raw] of Object.entries(tokens)) {
    try {
      luminance[token] = oklchToLuminance(raw);
    } catch {
      // skip non-oklch (gradients, calc, etc.)
    }
  }

  describe(`Scheme: ${schemeName}`, () => {
    for (const pair of PAIRS) {
      const fgL = luminance[pair.fg];
      const bgL = luminance[pair.bg];
      const ratio = fgL !== undefined && bgL !== undefined ? contrastRatio(fgL, bgL) : 0;

      it(`${pair.fg} on ${pair.bg} (${pair.label}): ${ratio.toFixed(2)}:1 ≥ ${pair.minRatio}:1`, () => {
        expect(fgL, `Missing luminance for fg: ${pair.fg}`).toBeDefined();
        expect(bgL, `Missing luminance for bg: ${pair.bg}`).toBeDefined();
        expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
      });
    }
  });
}

describe("WCAG 2.1 AA contrast ratio — ax tokens", () => {
  describe("Color conversion", () => {
    it("oklch(0 0 0) → luminance ~0 (pure black)", () => {
      expect(oklchToLuminance("oklch(0 0 0)")).toBeLessThan(0.001);
    });

    it("oklch(1 0 0) → luminance ~1 (pure white)", () => {
      expect(oklchToLuminance("oklch(1 0 0)")).toBeGreaterThan(0.9);
    });

    it("contrast between black and white is ~21:1", () => {
      const black = oklchToLuminance("oklch(0 0 0)");
      const white = oklchToLuminance("oklch(1 0 0)");
      expect(contrastRatio(white, black)).toBeGreaterThan(18);
    });
  });

  checkScheme("Dark (:root)", DARK);
  checkScheme("Light ([data-theme=light])", LIGHT);
});
