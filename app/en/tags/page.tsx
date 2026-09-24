import type { Metadata } from "next";
import TagsPage from "@/app/tags/page";
import { siteConfig } from "@/lib/site";
import { hreflangAlternates } from "@/lib/seo/hreflang";
import { rootOgImageUrl } from "@/lib/seo/og";

const alts = hreflangAlternates("/tags");

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse articles by tag.",
  alternates: { canonical: "/en/tags", languages: alts.languages },
  openGraph: {
    title: "Tags · Alexendros",
    description: "Browse articles by tag.",
    type: "website",
    url: `${siteConfig.url}/en/tags`,
    images: [rootOgImageUrl()],
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image", images: [rootOgImageUrl()] },
};

export default TagsPage;
