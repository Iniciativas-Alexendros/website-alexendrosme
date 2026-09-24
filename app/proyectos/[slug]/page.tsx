import { notFound } from "next/navigation";
import { getRawContent, getContentCollection } from "@/lib/content/loader";
import { MarkdownRenderer } from "@/components/mdx";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ArticleMeta } from "@/components/article-meta";
import { ArticleToc } from "@/components/article-toc";
import { extractToc } from "@/lib/content/toc";
import { siteConfig } from "@/lib/site";
import { articleOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { BackProyectosLabel } from "@/components/translated-labels";
import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const articles = await getContentCollection("proyectos");
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRawContent("proyectos", slug);

  if (!article) return {};

  const alts = hreflangAlternates(`/proyectos/${slug}`);

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description ?? article.frontmatter.title,
    alternates: {
      canonical: alts.canonical,
      languages: alts.languages,
    },
    openGraph: {
      title: `${article.frontmatter.title} · Alexendros`,
      description: article.frontmatter.description ?? article.frontmatter.title,
      type: "article",
      publishedTime: article.frontmatter.date,
      modifiedTime: article.frontmatter.date,
      tags: article.frontmatter.tags,
      url: `${siteConfig.url}/proyectos/${slug}`,
      images: [articleOgImageUrl("proyectos", slug)],
      locale: "es_ES",
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.frontmatter.title} · Alexendros`,
      description: article.frontmatter.description ?? article.frontmatter.title,
      images: [articleOgImageUrl("proyectos", slug)],
    },
  };
}

export default async function ProyectosArticle({ params }: Props) {
  const { slug } = await params;
  const article = await getRawContent("proyectos", slug);

  if (!article) notFound();

  const tocItems = extractToc(article.content);
  const ogImage = articleOgImageUrl("proyectos", slug);
  const published = article.frontmatter.date;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.frontmatter.title,
    description: article.frontmatter.description,
    datePublished: published,
    dateModified: published,
    inLanguage: "es",
    keywords: article.frontmatter.tags?.join(", "),
    image: ogImage,
    author: {
      "@type": "Person",
      name: siteConfig.fullName,
      alternateName: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.fullName,
      alternateName: siteConfig.name,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/proyectos/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/proyectos/${slug}`,
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
          { name: "Proyectos", href: `${siteConfig.url}/proyectos` },
          { name: article.frontmatter.title, href: `${siteConfig.url}/proyectos/${slug}` },
        ]}
      />

      <div className="site-shell article-shell">
        <nav className="article-nav">
          <LocaleLink href="/proyectos" className="ds-caption back-link">
            <BackProyectosLabel />
          </LocaleLink>
        </nav>

        <div className="article-layout">
          <ArticleToc items={tocItems} />
          <article className="article-main">
            <header className="article-head">
              {article.frontmatter.status ? (
                <p className="ds-label project-status">{article.frontmatter.status}</p>
              ) : null}
              <h1 className="headline article-title">{article.frontmatter.title}</h1>
              <ArticleMeta
                date={article.frontmatter.date}
                readingTime={article.content.trim().length > 0 ? article.readingTime : undefined}
                tags={article.frontmatter.tags}
              />
              {article.frontmatter.description ? (
                <p className="article-lead">{article.frontmatter.description}</p>
              ) : null}
            </header>

            {article.content.trim().length > 0 ? (
              <MarkdownRenderer content={article.content} />
            ) : null}
          </article>
        </div>

        <footer className="section-footer">
          <LocaleLink href="/proyectos" className="back-link">
            <BackProyectosLabel />
          </LocaleLink>
        </footer>
      </div>
    </>
  );
}
