import type { Metadata } from "next";
import Link from "next/link";
import { getContentCollection } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import {
  CollectionLabel,
  CollectionEmpty,
  BackHomeLabel,
  ReadingTime,
} from "@/components/translated-labels";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Cosas que estoy haciendo o cuidando, contadas sin jerga técnica.",
  alternates: { canonical: "/proyectos" },
  openGraph: {
    title: "Proyectos · Alexendros",
    description: "Cosas que estoy haciendo o cuidando, contadas sin jerga técnica.",
    url: "https://alexendros.me/proyectos",
  },
};

export default async function ProyectosPage() {
  const articles = await getContentCollection("proyectos");

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Proyectos", href: `${siteConfig.url}/proyectos` }]} />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <p className="ds-label collection-label">
            <CollectionLabel />
          </p>
          <h1 className="headline">Proyectos</h1>
          <p className="prose-lead collection-desc">
            Fichas cortas de lo que estoy construyendo o cuidando. Qué es, para qué sirve y en qué
            punto está.
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
                <Link href={`/proyectos/${article.slug}`} className="article-item">
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
                    <ReadingTime minutes={article.readingTime} />
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
