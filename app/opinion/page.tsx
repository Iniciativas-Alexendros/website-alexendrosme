import type { Metadata } from "next";
import Link from "next/link";
import { getContentCollection } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import {
  CollectionLabel,
  CollectionEmpty,
  BackHomeLabel,
  ReadingTime,
} from "@/components/translated-labels";

const alts = hreflangAlternates("/opinion");

export const metadata: Metadata = {
  title: "Opinión",
  description: "Escritos en primera persona sobre libertad, atención y vida digital.",
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    title: "Opinión · Alexendros",
    description: "Escritos en primera persona sobre libertad, atención y vida digital.",
    type: "website",
    url: "https://alexendros.me/opinion",
    images: [rootOgImageUrl()],
    locale: "es_ES",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Opinión · Alexendros",
    images: [rootOgImageUrl()],
  },
};

export default async function OpinionPage() {
  const articles = await getContentCollection("opinion");
  const [featured, ...archive] = articles;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Opinión", href: `${siteConfig.url}/opinion` }]} />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <p className="ds-label collection-label">
            <CollectionLabel />
          </p>
          <h1 className="headline">Opinión</h1>
          <p className="prose-lead collection-desc">
            Un blog personal. Lo que pienso, sin vender nada y sin disfrazarlo de tutorial.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="empty-state">
            <CollectionEmpty />
          </p>
        ) : (
          <div className="stack-xl">
            {featured && (
              <section aria-labelledby="opinion-featured">
                <p className="ds-label" id="opinion-featured">
                  Lo más reciente
                </p>
                <article>
                  <Link href={`/opinion/${featured.slug}`} className="article-item">
                    <time dateTime={featured.frontmatter.date} className="ds-caption">
                      {new Date(featured.frontmatter.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <h2 className="article-item__title">{featured.frontmatter.title}</h2>
                    {featured.frontmatter.description && (
                      <p className="article-item__desc">{featured.frontmatter.description}</p>
                    )}
                    <span className="ds-caption">
                      <ReadingTime minutes={featured.readingTime} />
                    </span>
                  </Link>
                </article>
              </section>
            )}

            {archive.length > 0 && (
              <section aria-labelledby="opinion-archive">
                <h2 id="opinion-archive" className="title">
                  Archivo
                </h2>
                <div className="stack-lg">
                  {archive.map((article) => (
                    <article key={article.slug}>
                      <Link href={`/opinion/${article.slug}`} className="article-item">
                        <time dateTime={article.frontmatter.date} className="ds-caption">
                          {new Date(article.frontmatter.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <h3 className="article-item__title">{article.frontmatter.title}</h3>
                        {article.frontmatter.description && (
                          <p className="article-item__desc">{article.frontmatter.description}</p>
                        )}
                        <span className="ds-caption">
                          <ReadingTime minutes={article.readingTime} />
                        </span>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <footer className="section-footer">
          <Link href="/" className="back-link">
            <BackHomeLabel />
          </Link>
        </footer>
      </div>
    </>
  );
}
