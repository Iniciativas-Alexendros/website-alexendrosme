import type { Metadata } from "next";
import OpinionPage from "@/app/opinion/page";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/opinion");

export const metadata: Metadata = {
  title: "Opinion",
  description: "First-person writing on freedom, attention and digital life.",
  alternates: { canonical: "/en/opinion", languages: alts.languages },
  openGraph: {
    title: "Opinion · Alexendros",
    description: "First-person writing on freedom, attention and digital life.",
    type: "website",
    url: `${siteConfig.url}/en/opinion`,
    images: [rootOgImageUrl()],
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image", images: [rootOgImageUrl()] },
};

export default OpinionPage;
