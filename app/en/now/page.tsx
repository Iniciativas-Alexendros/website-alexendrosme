import type { Metadata } from "next";
import NowPage from "@/app/now/page";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/now");

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm doing right now — projects, reading, focus.",
  alternates: { canonical: "/en/now", languages: alts.languages },
  openGraph: {
    title: "Now · Alexendros",
    description: "What I'm doing right now.",
    type: "website",
    url: `${siteConfig.url}/en/now`,
    images: [rootOgImageUrl()],
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image", images: [rootOgImageUrl()] },
};

export default NowPage;
