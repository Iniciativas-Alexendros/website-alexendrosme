/**
 * Inline pre-paint theme script.
 *
 * Returns the JS string that gets inlined into a `<script>` tag in
 * `<head>` BEFORE the CSS parser. Runs synchronously, so it can apply
 * the right theme class on `<html>` BEFORE the browser paints the
 * first frame. Without this, the React bootstrap from
 * `components/theme-provider.tsx` runs AFTER paint and produces a
 * visible theme flicker (FOUC) — especially noticeable on low-end
 * devices where LCP measurements shift by hundreds of milliseconds.
 *
 * See ADR 0004 for the full architectural rationale.
 */

import { THEME_KEY, VALID_THEME_PATTERN } from "@/lib/theme-storage";

const COOKIE_THEME = "ax-th";
const COOKIE_REDUCE = "ax-rd";

/**
 * The literal JS source. Must stay small (<500 bytes after minification);
 * the cookie + localStorage fallback chain and the class mutation are
 * the only essential pieces.
 */
export function prePaintScriptString(): string {
  const themeRegex = `(?:^|;\\s*)${COOKIE_THEME}=(${VALID_THEME_PATTERN})`;
  const reduceRegex = `(?:^|;\\s*)${COOKIE_REDUCE}=1\\b`;
  const storageKey = THEME_KEY;
  return [
    `(function(){try{`,
    `var t=null,r=null,ck=document.cookie,`,
    `tm=ck.match(/${themeRegex}/),`,
    `rm=ck.match(/${reduceRegex}/);`,
    `if(tm)t=tm[1];if(rm)r=1;`,
    `if(!t){try{t=localStorage.getItem('${storageKey}')}catch(e){}};`,
    `if(t==='light'||t==='dark'){`,
    `document.documentElement.classList.add(t);`,
    `document.documentElement.setAttribute('data-theme',t);`,
    `}else if(t==='system'){`,
    `var m=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';`,
    `document.documentElement.classList.add(m);`,
    `document.documentElement.setAttribute('data-theme',m);`,
    `}`,
    `if(r===1||(r===null&&matchMedia('(prefers-reduced-motion: reduce)').matches)){`,
    `document.documentElement.setAttribute('data-reduce','true');`,
    `}`,
    `}catch(e){}})()`,
  ].join("");
}
