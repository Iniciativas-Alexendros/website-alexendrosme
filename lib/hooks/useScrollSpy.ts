"use client";

import { useEffect, useState } from "react";

interface ScrollSpyOptions {
  rootMargin?: string;
  threshold?: number[];
}

export function useScrollSpy(ids: string[], options: ScrollSpyOptions = {}): string {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const ratios = new Map<string, number>();

    const { rootMargin = "-20% 0px -60% 0px", threshold = [0, 0.25, 0.5, 0.75, 1] } = options;

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            ratios.set(id, entry.intersectionRatio);
            const best = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0];
            if (best && best[1] > 0) {
              setActiveId(`#${best[0]}`);
            }
          }
        },
        { rootMargin, threshold },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids, options.rootMargin, options.threshold]);

  return activeId;
}
