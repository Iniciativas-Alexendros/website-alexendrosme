"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { ToCItem } from "@/lib/content/toc";

interface Props {
  items: ToCItem[];
}

function TocNav({
  items,
  activeId,
  onNavigate,
}: {
  items: ToCItem[];
  activeId: string;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <nav>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id} className={cn("toc-item", `toc-level-${item.level}`)}>
            <a
              href={`#${item.id}`}
              className={cn("toc-link", activeId === item.id && "toc-link--active")}
              onClick={(e) => onNavigate(e, item.id)}
              aria-current={activeId === item.id ? "true" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ArticleToc({ items }: Props) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  useEffect(() => {
    if (items.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <>
      <details className="toc-mobile">
        <summary className="toc-mobile__summary">{t("article.tocTitle")}</summary>
        <TocNav items={items} activeId={activeId} onNavigate={handleClick} />
      </details>

      <aside className="toc" aria-label={t("article.tocTitle")}>
        <p className="toc-title">{t("article.tocTitle")}</p>
        <TocNav items={items} activeId={activeId} onNavigate={handleClick} />
      </aside>
    </>
  );
}
