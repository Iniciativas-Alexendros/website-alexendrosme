"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { tagPath } from "@/lib/seo/tags";
import { useLocalePrefix, withLocalePrefix } from "@/lib/i18n/locale-path";

interface Props {
  date: string;
  readingTime?: number;
  tags: string[];
}

export function ArticleMeta({ date, readingTime, tags }: Props) {
  const { t, locale } = useI18n();
  const prefix = useLocalePrefix();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const showReading = typeof readingTime === "number" && readingTime > 0;

  return (
    <div className="article-meta">
      <time dateTime={date}>{formattedDate}</time>
      {showReading ? (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {readingTime} {t("article.minutesShort")}
          </span>
        </>
      ) : null}
      {tags.length > 0 && (
        <ul className="cluster-sm article-meta__tags" aria-label={t("article.tagsLabel")}>
          {tags.map((tag) => (
            <li key={tag}>
              <Link
                href={withLocalePrefix(prefix, tagPath(tag))}
                className="tag-pill no-underline hover:bg-muted transition-colors"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
