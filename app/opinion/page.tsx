import type { Metadata } from "next";
import { getContentCollection } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { OpinionFeatured, OpinionArchive } from "@/components/opinion-list";
import { LocaleLink } from "@/components/locale-link";
import { CollectionLabel, CollectionEmpty, BackHomeLabel } from "@/components/translated-labels";

const alts = hreflangAlternates("/opinion");

export const metadata: Metadata = {
  title: "Opinión",
  description: "Escritos en primera persona sobre libertad, atención y vida digital.",
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    title: "Opinión · Alexendros",
    description: "Escritos en primera persona sobre libertad, atención y vida digital.",
    type: "website",
    url: "https://alexendros.me/opinion",
    images: [rootOgImageUrl()],
    locale: "es_ES",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Opinión · Alexendros",
    images: [rootOgImageUrl()],
  },
};

export default async function OpinionPage() {
  const articles = await getContentCollection("opinion");
  const [featured, ...archive] = articles;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Opinión", href: `${siteConfig.url}/opinion` }]} />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <p className="ds-label collection-label">
            <CollectionLabel />
          </p>
          <h1 className="headline">Opinión</h1>
          <p className="prose-lead collection-desc">
            Un blog personal. Lo que pienso, sin vender nada y sin disfrazarlo de tutorial.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="empty-state">
            <CollectionEmpty />
          </p>
        ) : (
          <div className="stack-xl">
            {featured ? (
              <OpinionFeatured
                slug={featured.slug}
                title={featured.frontmatter.title}
                description={featured.frontmatter.description}
                date={featured.frontmatter.date}
                readingTime={featured.readingTime}
              />
            ) : null}

            <OpinionArchive
              items={archive.map((article) => ({
                slug: article.slug,
                title: article.frontmatter.title,
                description: article.frontmatter.description,
                date: article.frontmatter.date,
                readingTime: article.readingTime,
              }))}
            />
          </div>
        )}

        <footer className="section-footer">
          <LocaleLink href="/" className="back-link">
            <BackHomeLabel />
          </LocaleLink>
        </footer>
      </div>
    </>
  );
}
