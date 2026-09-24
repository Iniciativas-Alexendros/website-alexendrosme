import type { Metadata } from "next";
import {
  generateStaticParams as gen,
  default as ProyectosArticle,
} from "@/app/proyectos/[slug]/page";
import { getRawContent } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";
import { articleOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";

export const generateStaticParams = gen;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRawContent("proyectos", slug);
  if (!article) return {};
  const alts = hreflangAlternates(`/proyectos/${slug}`);
  const og = articleOgImageUrl("proyectos", slug);
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description ?? article.frontmatter.title,
    alternates: { canonical: `/en/proyectos/${slug}`, languages: alts.languages },
    openGraph: {
      title: `${article.frontmatter.title} · Alexendros`,
      description: article.frontmatter.description ?? article.frontmatter.title,
      type: "article",
      publishedTime: article.frontmatter.date,
      modifiedTime: article.frontmatter.date,
      tags: article.frontmatter.tags,
      url: `${siteConfig.url}/en/proyectos/${slug}`,
      images: [og],
      locale: "en_US",
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.frontmatter.title} · Alexendros`,
      description: article.frontmatter.description ?? article.frontmatter.title,
      images: [og],
    },
  };
}

export default ProyectosArticle;
