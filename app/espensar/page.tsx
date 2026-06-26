import type { Metadata } from "next";
import Link from "next/link";
import { getContentCollection } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Es pensar",
  description:
    "Reflexiones sobre soberanía digital, crítica tecnológica y filosofía práctica para el siglo XXI.",
  alternates: { canonical: "/espensar" },
  openGraph: {
    title: "Es pensar · Alexendros",
    description: "Reflexiones sobre soberanía digital, crítica tecnológica y filosofía práctica.",
    url: "https://alexendros.me/espensar",
  },
};

export default async function EsPensarPage() {
  const articles = await getContentCollection("espensar");

  return (
    <div className="site-shell article-shell">
      <header className="collection-header">
        <p className="ds-label collection-label">Colección</p>
        <h1 className="headline">Es pensar</h1>
        <p className="prose-lead collection-desc">
          Reflexiones sobre soberanía digital, crítica tecnológica y filosofía práctica para el
          siglo XXI.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="empty-state">No hay artículos publicados aún.</p>
      ) : (
        <div className="stack-lg">
          {articles.map((article) => (
            <article key={article.slug}>
              <Link href={`/espensar/${article.slug}`} className="article-item">
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
                      <span key={tag} className="tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}

      <footer className="section-footer">
        <Link href="/" className="back-link">
          ← Volver al inicio
        </Link>
      </footer>
    </div>
  );
}
