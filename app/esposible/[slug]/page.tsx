import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRawContent, getContentCollection } from "@/lib/content/loader";
import { MarkdownRenderer } from "@/components/mdx";
import { siteConfig } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const articles = await getContentCollection("esposible");
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRawContent("esposible", slug);

  if (!article) return {};

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description ?? article.frontmatter.title,
    alternates: { canonical: `/esposible/${slug}` },
    openGraph: {
      title: `${article.frontmatter.title} · Alexendros`,
      description: article.frontmatter.description ?? article.frontmatter.title,
      type: "article",
      publishedTime: article.frontmatter.date,
      tags: article.frontmatter.tags,
      url: `${siteConfig.url}/esposible/${slug}`,
    },
  };
}

export default async function EsPosibleArticle({ params }: Props) {
  const { slug } = await params;
  const article = await getRawContent("esposible", slug);

  if (!article) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.frontmatter.title,
    description: article.frontmatter.description,
    datePublished: article.frontmatter.date,
    author: {
      "@type": "Person",
      name: siteConfig.fullName,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/esposible/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/esposible/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        id="article-json-ld"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="site-shell article-shell">
        <nav className="article-nav">
          <Link href="/esposible" className="ds-caption back-link">
            ← Volver a Es posible
          </Link>
        </nav>

        <article>
          <header className="article-head">
            <h1 className="headline article-title">{article.frontmatter.title}</h1>
            <div className="article-meta">
              <time dateTime={article.frontmatter.date}>
                {new Date(article.frontmatter.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {article.frontmatter.tags.length > 0 && (
                <span className="cluster-sm" role="list" aria-label="Etiquetas">
                  {article.frontmatter.tags.map((tag) => (
                    <span key={tag} role="listitem" className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </header>

          <MarkdownRenderer content={article.content} />
        </article>

        <footer className="section-footer">
          <Link href="/esposible" className="back-link">
            ← Volver a Es posible
          </Link>
        </footer>
      </div>
    </>
  );
}
