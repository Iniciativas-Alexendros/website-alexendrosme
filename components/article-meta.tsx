"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Props {
  date: string;
  readingTime: number;
  tags: string[];
}

export function ArticleMeta({ date, readingTime, tags }: Props) {
  const { t, locale } = useI18n();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="article-meta">
      <time dateTime={date}>{formattedDate}</time>
      <span aria-hidden="true">·</span>
      <span>
        {readingTime} {t("article.minutesShort")}
      </span>
      {tags.length > 0 && (
        <span className="cluster-sm" role="list" aria-label={t("article.tagsLabel")}>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              role="listitem"
              className="tag-pill no-underline hover:bg-muted transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </span>
      )}
    </div>
  );
}
