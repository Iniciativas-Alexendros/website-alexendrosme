import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getArticlesByTag } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} · Etiquetas`,
    description: `Artículos etiquetados con #${decoded}.`,
    alternates: { canonical: `/tags/${encodeURIComponent(decoded)}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const articles = await getArticlesByTag(decoded);

  if (articles.length === 0) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Etiquetas", href: `${siteConfig.url}/tags` },
          {
            name: `#${decoded}`,
            href: `${siteConfig.url}/tags/${encodeURIComponent(decoded)}`,
          },
        ]}
      />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <p className="ds-label collection-label">Etiqueta</p>
          <h1 className="headline">#{decoded}</h1>
          <p className="prose-lead collection-desc">
            {articles.length} {articles.length === 1 ? "artículo" : "artículos"} con esta etiqueta.
          </p>
        </header>

        <div className="stack-lg">
          {articles.map((article) => (
            <article key={`${article.type}-${article.slug}`}>
              <Link href={`/${article.type}/${article.slug}`} className="article-item">
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
                <span className="ds-caption">{article.readingTime} min de lectura</span>
              </Link>
            </article>
          ))}
        </div>

        <footer className="section-footer">
          <Link href="/tags" className="back-link">
            ← Todas las etiquetas
          </Link>
        </footer>
      </div>
    </>
  );
}
