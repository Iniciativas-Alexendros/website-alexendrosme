import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRawContent, getContentCollection } from "@/lib/content/loader";
import { MarkdownRenderer } from "@/components/mdx";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ArticleMeta } from "@/components/article-meta";
import { ArticleToc } from "@/components/article-toc";
import { extractToc } from "@/lib/content/toc";
import { siteConfig } from "@/lib/site";
import { BackEsposibleLabel } from "@/components/translated-labels";

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

  const tocItems = extractToc(article.content);

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
      <BreadcrumbJsonLd
        items={[
          { name: "Es posible", href: `${siteConfig.url}/esposible` },
          { name: article.frontmatter.title, href: `${siteConfig.url}/esposible/${slug}` },
        ]}
      />

      <div className="site-shell article-shell">
        <nav className="article-nav">
          <Link href="/esposible" className="ds-caption back-link">
            <BackEsposibleLabel />
          </Link>
        </nav>

        <div className="article-layout">
          <article className="article-main">
            <header className="article-head">
              <h1 className="headline article-title">{article.frontmatter.title}</h1>
              <ArticleMeta
                date={article.frontmatter.date}
                readingTime={article.readingTime}
                tags={article.frontmatter.tags}
              />
            </header>

            <MarkdownRenderer content={article.content} />
          </article>

          <ArticleToc items={tocItems} />
        </div>

        <footer className="section-footer">
          <Link href="/esposible" className="back-link">
            <BackEsposibleLabel />
          </Link>
        </footer>
      </div>
    </>
  );
}
