"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Props {
  lastUpdated: string;
}

function splitItems(raw: string): string[] {
  return raw
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function NowContent({ lastUpdated }: Props) {
  const { t, locale } = useI18n();
  const focus = splitItems(t("now.focusItems"));
  const building = splitItems(t("now.buildingItems"));
  const reading = splitItems(t("now.readingItems"));
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const formattedDate = new Date(lastUpdated).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="site-shell article-shell">
      <header className="collection-header">
        <time dateTime={lastUpdated} className="ds-caption">
          {t("now.lastUpdatedPrefix")} {formattedDate}
        </time>
        <h1 className="headline">{t("now.title")}</h1>
        <p className="prose-lead collection-desc">{t("now.desc")}</p>
      </header>

      {focus.length === 0 && building.length === 0 && reading.length === 0 ? (
        <p className="empty-state">{t("now.empty")}</p>
      ) : (
        <div className="stack-lg prose">
          {building.length > 0 && (
            <section>
              <h2>🔨 {t("now.sectionBuilding")}</h2>
              <ul>
                {building.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {reading.length > 0 && (
            <section>
              <h2>📖 {t("now.sectionReading")}</h2>
              <ul>
                {reading.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {focus.length > 0 && (
            <section>
              <h2>🎯 {t("now.sectionFocus")}</h2>
              <ul>
                {focus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <footer className="section-footer">
        <Link href="/" className="back-link">
          {t("now.footerBack")}
        </Link>
      </footer>
    </div>
  );
}
