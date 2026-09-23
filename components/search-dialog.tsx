"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Search, FileText, Command, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface SearchIndexItem {
  slug: string;
  type: "proyectos" | "opinion";
  title: string;
  description: string;
  tags: string[];
  content: string;
}

export function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function getContentSnippet(content: string, query: string, maxLength = 150): string {
  if (!query.trim()) return content.slice(0, maxLength) + (content.length > maxLength ? "..." : "");
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLength) + (content.length > maxLength ? "..." : "");

  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + query.length + 60);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet += "…";
  return snippet;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fetched, setFetched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || fetched) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`search index HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: SearchIndexItem[]) => {
        if (cancelled) return;
        setIndex(data);
        setLoadError(false);
        setFetched(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, fetched]);

  const results = useCallback(() => {
    if (!query.trim() || !index.length) return [];

    const q = query.toLowerCase().trim();
    const scored = index
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const tagLower = item.tags.join(" ").toLowerCase();
        const contentLower = item.content.toLowerCase();

        if (titleLower.includes(q)) score += 100;
        if (titleLower.startsWith(q)) score += 50;
        if (tagLower.includes(q)) score += 30;
        if (descLower.includes(q)) score += 20;
        if (contentLower.includes(q)) score += 10;

        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored;
  }, [query, index]);

  const handleSelect = (slug: string, type: string) => {
    onOpenChange(false);
    router.push(`/${type}/${slug}`);
  };

  const scored = results();
  const proyectosResults = scored.filter((r) => r.item.type === "proyectos");
  const opinionResults = scored.filter((r) => r.item.type === "opinion");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[60]",
            "bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[15vh] z-[60] w-full max-w-lg -translate-x-1/2",
            "border border-border bg-popover",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-top-[5%] data-[state=open]:slide-in-from-top-[5%]",
            "transition-[opacity,transform] duration-200 ease-out-expo",
          )}
          style={{
            borderRadius: "var(--ax-radius-lg)",
            boxShadow: "var(--ax-shadow-popover)",
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
              aria-label={t("search.placeholder")}
              disabled={loadError}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
              <Command className="size-3" />K
            </kbd>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                aria-label={t("search.clear")}
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[60vh] p-2">
            {loading && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.loading")}
              </p>
            )}

            {!loading && loadError && (
              <p role="alert" className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.loadError")}
              </p>
            )}

            {!loading && !loadError && query.trim() && scored.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.noResults").replace("{query}", query)}
              </p>
            )}

            {!loading && !loadError && !query.trim() && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.shortcut")}
              </p>
            )}

            {proyectosResults.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {t("search.sectionProyectos")}
                </p>
                {proyectosResults.map(({ item }) => (
                  <button
                    key={`proyectos-${item.slug}`}
                    type="button"
                    onClick={() => handleSelect(item.slug, item.type)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left",
                      "transition-colors duration-100",
                      "hover:bg-muted focus-visible:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-medium text-foreground text-sm">
                        {highlightMatches(item.title, query)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {highlightMatches(getContentSnippet(item.content, query), query)}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex text-[10px] font-mono text-muted-foreground/60"
                          >
                            #{highlightMatches(tag, query)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {opinionResults.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {t("search.sectionOpinion")}
                </p>
                {opinionResults.map(({ item }) => (
                  <button
                    key={`opinion-${item.slug}`}
                    type="button"
                    onClick={() => handleSelect(item.slug, item.type)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left",
                      "transition-colors duration-100",
                      "hover:bg-muted focus-visible:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-medium text-foreground text-sm">
                        {highlightMatches(item.title, query)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {highlightMatches(getContentSnippet(item.content, query), query)}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex text-[10px] font-mono text-muted-foreground/60"
                          >
                            #{highlightMatches(tag, query)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
