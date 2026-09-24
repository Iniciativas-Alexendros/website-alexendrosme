import type { Metadata } from "next";
import { getContentCollection } from "@/lib/content/loader";
import { HomeContent } from "@/components/home-content";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/");

export const metadata: Metadata = {
  description: siteConfig.description,
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [rootOgImageUrl()],
  },
  twitter: {
    card: "summary_large_image",
    images: [rootOgImageUrl()],
  },
};

export default async function Home() {
  const [proyectos, opinion] = await Promise.all([
    getContentCollection("proyectos"),
    getContentCollection("opinion"),
  ]);

  const latestArticles = [
    ...proyectos.slice(0, 3).map((item) => ({ ...item, type: "proyectos" as const })),
    ...opinion.slice(0, 3).map((item) => ({ ...item, type: "opinion" as const })),
  ].sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

  return <HomeContent latestArticles={latestArticles} />;
}
