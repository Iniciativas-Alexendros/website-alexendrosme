import type { Metadata } from "next";
import { getContentCollection } from "@/lib/content/loader";
import { HomeContent } from "@/components/home-content";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/");

export const metadata: Metadata = {
  title: {
    absolute: "Alexendros · thought, freedom and digital life",
  },
  description:
    "Alexendros' personal, money-free space: opinion, projects and reflections on freedom and digital life from Valencia. No ads, no capture.",
  alternates: {
    canonical: "/en",
    languages: alts.languages,
  },
  openGraph: {
    title: "Alexendros · thought, freedom and digital life",
    description:
      "Alexendros' personal, money-free space: opinion, projects and reflections from Valencia.",
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    url: `${siteConfig.url}/en`,
    images: [rootOgImageUrl()],
  },
  twitter: {
    card: "summary_large_image",
    images: [rootOgImageUrl()],
  },
};

export default async function EnHome() {
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
