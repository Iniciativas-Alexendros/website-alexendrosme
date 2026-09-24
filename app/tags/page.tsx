import type { Metadata } from "next";
import { getAllTags, getArticlesByTag } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { LocaleLink } from "@/components/locale-link";
import { tagPath } from "@/lib/seo/tags";
import { TagsIndexHeader, TagsEmpty, BackHomeLabel } from "@/components/translated-labels";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";

const alts = hreflangAlternates("/tags");

export const metadata: Metadata = {
  title: "Etiquetas",
  description: "Navega los artículos por etiqueta.",
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    title: "Etiquetas · Alexendros",
    description: "Navega los artículos por etiqueta.",
    type: "website",
    url: `${siteConfig.url}/tags`,
    images: [rootOgImageUrl()],
    locale: "es_ES",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    images: [rootOgImageUrl()],
  },
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => ({ tag, count: (await getArticlesByTag(tag)).length })),
  );

  if (tags.length === 0) {
    return (
      <>
        <BreadcrumbJsonLd items={[{ name: "Etiquetas", href: `${siteConfig.url}/tags` }]} />
        <div className="site-shell article-shell">
          <TagsIndexHeader count={0} />
          <p className="empty-state">
            <TagsEmpty />
          </p>
          <footer className="section-footer">
            <LocaleLink href="/" className="back-link">
              <BackHomeLabel />
            </LocaleLink>
          </footer>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Etiquetas", href: `${siteConfig.url}/tags` }]} />
      <div className="site-shell article-shell">
        <TagsIndexHeader count={tags.length} />

        <div className="cluster">
          {tagsWithCount.map(({ tag, count }) => (
            <LocaleLink
              key={tag}
              href={tagPath(tag)}
              className="tag-pill hover:bg-muted transition-colors no-underline"
            >
              #{tag}
              <span className="ml-1 text-xs text-muted-foreground">({count})</span>
            </LocaleLink>
          ))}
        </div>

        <footer className="section-footer">
          <LocaleLink href="/" className="back-link">
            <BackHomeLabel />
          </LocaleLink>
        </footer>
      </div>
    </>
  );
}
