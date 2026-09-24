import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { NowContent } from "@/components/now-content";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";

const alts = hreflangAlternates("/now");

export const metadata: Metadata = {
  title: "Ahora",
  description: "Qué estoy haciendo ahora mismo — proyectos, lecturas, enfoque actual.",
  alternates: {
    canonical: alts.canonical,
    languages: alts.languages,
  },
  openGraph: {
    title: "Ahora · Alexendros",
    description: "Qué estoy haciendo ahora mismo.",
    type: "website",
    url: `${siteConfig.url}/now`,
    images: [rootOgImageUrl()],
    locale: "es_ES",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahora · Alexendros",
    images: [rootOgImageUrl()],
  },
};

export default function NowPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Ahora", href: `${siteConfig.url}/now` }]} />
      <NowContent lastUpdated="2026-07-18" />
    </>
  );
}
