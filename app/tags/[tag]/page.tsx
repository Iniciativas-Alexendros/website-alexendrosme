import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getArticlesByTag } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import {
  TagPageHeader,
  ReadingTime,
  LocalDate,
  BackToTagsLabel,
} from "@/components/translated-labels";

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
        <TagPageHeader tag={decoded} count={articles.length} />

        <div className="stack-lg">
          {articles.map((article) => (
            <article key={`${article.type}-${article.slug}`}>
              <Link href={`/${article.type}/${article.slug}`} className="article-item">
                <LocalDate date={article.frontmatter.date} />
                <h2 className="article-item__title">{article.frontmatter.title}</h2>
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

        <footer className="section-footer">
          <Link href="/tags" className="back-link">
            <BackToTagsLabel />
          </Link>
        </footer>
      </div>
    </>
  );
}
