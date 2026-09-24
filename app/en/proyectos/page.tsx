import type { Metadata } from "next";
import ProyectosPage from "@/app/proyectos/page";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/proyectos");

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I'm building or tending, told without jargon.",
  alternates: { canonical: "/en/proyectos", languages: alts.languages },
  openGraph: {
    title: "Projects · Alexendros",
    description: "Things I'm building or tending, told without jargon.",
    type: "website",
    url: `${siteConfig.url}/en/proyectos`,
    images: [rootOgImageUrl()],
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image", images: [rootOgImageUrl()] },
};

export default ProyectosPage;
