"use client";

import { LocaleLink } from "@/components/locale-link";
import { LocalDate, ReadingTime } from "@/components/translated-labels";
import { useI18n } from "@/lib/i18n";

interface FeaturedProps {
  slug: string;
  title: string;
  description?: string;
  date: string;
  readingTime: number;
}

export function OpinionFeatured({ slug, title, description, date, readingTime }: FeaturedProps) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="opinion-featured" className="opinion-featured">
      <p className="ds-label" id="opinion-featured">
        {t("opinion.featured")}
      </p>
      <article className="opinion-featured__card">
        <LocaleLink href={`/opinion/${slug}`} className="opinion-featured__link">
          <h2 className="opinion-featured__title">{title}</h2>
          {description ? <p className="opinion-featured__desc">{description}</p> : null}
          <div className="opinion-featured__meta">
            <LocalDate date={date} />
            <span aria-hidden="true">·</span>
            <span className="ds-caption">
              <ReadingTime minutes={readingTime} />
            </span>
          </div>
        </LocaleLink>
      </article>
    </section>
  );
}

interface ArchiveItem {
  slug: string;
  title: string;
  description?: string;
  date: string;
  readingTime: number;
}

export function OpinionArchive({ items }: { items: ArchiveItem[] }) {
  const { t, locale } = useI18n();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="opinion-archive" className="opinion-archive">
      <h2 id="opinion-archive" className="title">
        {t("opinion.archive")}
      </h2>
      <ul className="opinion-archive__list" role="list">
        {items.map((article) => {
          const shortDate = new Date(article.date).toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <li key={article.slug} className="opinion-archive__row">
              <time dateTime={article.date} className="opinion-archive__date">
                {shortDate}
              </time>
              <div className="opinion-archive__body">
                <LocaleLink href={`/opinion/${article.slug}`} className="opinion-archive__title">
                  {article.title}
                </LocaleLink>
                {article.description ? (
                  <p className="opinion-archive__desc">{article.description}</p>
                ) : null}
              </div>
              <span className="opinion-archive__mins ds-caption">
                <ReadingTime minutes={article.readingTime} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
