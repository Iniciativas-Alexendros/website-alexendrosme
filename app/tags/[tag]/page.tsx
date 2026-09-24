import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getArticlesByTag, resolveTagLabel } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { slugifyTag, tagPath } from "@/lib/seo/tags";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { LocaleLink } from "@/components/locale-link";
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
  const params = new Set<string>();
  for (const tag of tags) {
    params.add(slugifyTag(tag));
    // Legacy export path (accented / spaced segment) still resolve via resolveTagLabel
    if (tag !== slugifyTag(tag)) params.add(tag);
  }
  return [...params].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);
  if (!label) return {};
  const path = tagPath(label);
  const alts = hreflangAlternates(path);
  return {
    title: `#${label} · Etiquetas`,
    description: `Artículos etiquetados con #${label}.`,
    alternates: {
      canonical: alts.canonical,
      languages: alts.languages,
    },
    openGraph: {
      title: `#${label} · Alexendros`,
      description: `Artículos etiquetados con #${label}.`,
      type: "website",
      url: `${siteConfig.url}${path}`,
      images: [rootOgImageUrl()],
      locale: "es_ES",
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      images: [rootOgImageUrl()],
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);
  if (!label) notFound();

  const articles = await getArticlesByTag(label);
  if (articles.length === 0) notFound();

  const path = tagPath(label);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Etiquetas", href: `${siteConfig.url}/tags` },
          {
            name: `#${label}`,
            href: `${siteConfig.url}${path}`,
          },
        ]}
      />
      <div className="site-shell article-shell">
        <TagPageHeader tag={label} count={articles.length} />

        <div className="stack-lg">
          {articles.map((article) => (
            <article key={`${article.type}-${article.slug}`}>
              <LocaleLink href={`/${article.type}/${article.slug}`} className="article-item">
                <LocalDate date={article.frontmatter.date} />
                <h2 className="article-item__title">{article.frontmatter.title}</h2>
                {article.frontmatter.description && (
                  <p className="article-item__desc">{article.frontmatter.description}</p>
                )}
                <span className="ds-caption">
                  <ReadingTime minutes={article.readingTime} />
                </span>
              </LocaleLink>
            </article>
          ))}
        </div>

        <footer className="section-footer">
          <LocaleLink href="/tags" className="back-link">
            <BackToTagsLabel />
          </LocaleLink>
        </footer>
      </div>
    </>
  );
}
