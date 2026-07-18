import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getArticlesByTag } from "@/lib/content/loader";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Etiquetas",
  description: "Navega los artículos por etiqueta.",
  alternates: { canonical: "/tags" },
  openGraph: {
    title: "Etiquetas · Alexendros",
    description: "Navega los artículos por etiqueta.",
    url: `${siteConfig.url}/tags`,
  },
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => ({ tag, count: (await getArticlesByTag(tag)).length })),
  );

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Etiquetas", href: `${siteConfig.url}/tags` }]} />
      <div className="site-shell article-shell">
        <header className="collection-header">
          <h1 className="headline">Etiquetas</h1>
          <p className="prose-lead collection-desc">
            {tags.length} {tags.length === 1 ? "etiqueta" : "etiquetas"} en total.
          </p>
        </header>

        {tags.length === 0 ? (
          <p className="empty-state">No hay etiquetas aún.</p>
        ) : (
          <div className="cluster">
            {tagsWithCount.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="tag-pill hover:bg-muted transition-colors no-underline"
              >
                #{tag}
                <span className="ml-1 text-xs text-muted-foreground">({count})</span>
              </Link>
            ))}
          </div>
        )}

        <footer className="section-footer">
          <Link href="/" className="back-link">
            ← Volver al inicio
          </Link>
        </footer>
      </div>
    </>
  );
}
