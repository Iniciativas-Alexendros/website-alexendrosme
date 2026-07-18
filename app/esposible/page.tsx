import type { Metadata } from "next";
import Link from "next/link";
import { getContentCollection } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { CollectionLabel, CollectionEmpty, BackHomeLabel } from "@/components/translated-labels";

export const metadata: Metadata = {
  title: "Es posible",
  description:
    "Guías prácticas, alternativas reales y caminos concretos hacia la soberanía digital y la libertad tecnológica.",
  alternates: { canonical: "/esposible" },
  openGraph: {
    title: "Es posible · Alexendros",
    description: "Guías prácticas y alternativas reales hacia la soberanía digital.",
    url: "https://alexendros.me/esposible",
  },
};

export default async function EsPosiblePage() {
  const articles = await getContentCollection("esposible");

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Es posible", href: `${siteConfig.url}/esposible` }]} />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <p className="ds-label collection-label">
            <CollectionLabel />
          </p>
          <h1 className="headline">Es posible</h1>
          <p className="prose-lead collection-desc">
            Guías prácticas, alternativas reales y caminos concretos hacia la soberanía digital y la
            libertad tecnológica. No teoría: lo que puedes hacer desde mañana.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="empty-state">
            <CollectionEmpty />
          </p>
        ) : (
          <div className="stack-lg">
            {articles.map((article) => (
              <article key={article.slug}>
                <Link href={`/esposible/${article.slug}`} className="article-item">
                  <time dateTime={article.frontmatter.date} className="ds-caption">
                    {new Date(article.frontmatter.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="article-item__title">{article.frontmatter.title}</h2>
                  {article.frontmatter.description && (
                    <p className="article-item__desc">{article.frontmatter.description}</p>
                  )}
                  {article.frontmatter.tags.length > 0 && (
                    <div className="cluster-sm">
                      {article.frontmatter.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="tag-pill no-underline hover:bg-muted transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                  <span className="ds-caption">
                    <span aria-hidden="true">·</span>{" "}
                    {article.readingTime} min de lectura
                  </span>
                </Link>
              </article>
            ))}
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
