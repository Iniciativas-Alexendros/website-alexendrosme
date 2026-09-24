import type { Metadata } from "next";
import { getContentCollection } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { ProjectCard } from "@/components/project-card";
import { LocaleLink } from "@/components/locale-link";
import { CollectionLabel, CollectionEmpty, BackHomeLabel } from "@/components/translated-labels";

const alts = hreflangAlternates("/proyectos");

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Cosas que estoy haciendo o cuidando, contadas sin jerga técnica.",
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    title: "Proyectos · Alexendros",
    description: "Cosas que estoy haciendo o cuidando, contadas sin jerga técnica.",
    type: "website",
    url: "https://alexendros.me/proyectos",
    images: [rootOgImageUrl()],
    locale: "es_ES",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Proyectos · Alexendros",
    images: [rootOgImageUrl()],
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
          <div className="project-grid">
            {articles.map((article) => (
              <ProjectCard
                key={article.slug}
                slug={article.slug}
                title={article.frontmatter.title}
                description={article.frontmatter.description}
                status={article.frontmatter.status}
              />
            ))}
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
