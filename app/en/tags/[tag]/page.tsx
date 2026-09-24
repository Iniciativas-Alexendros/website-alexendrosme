import type { Metadata } from "next";
import { generateStaticParams as gen, default as TagPage } from "@/app/tags/[tag]/page";
import { resolveTagLabel } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";
import { tagPath } from "@/lib/seo/tags";
import { rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";

export const generateStaticParams = gen;

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = await resolveTagLabel(tag);
  if (!label) return {};
  const path = tagPath(label);
  const alts = hreflangAlternates(path);
  return {
    title: `#${label} · Tags`,
    description: `Articles tagged #${label}.`,
    alternates: {
      canonical: `/en${path}`,
      languages: alts.languages,
    },
    openGraph: {
      title: `#${label} · Alexendros`,
      description: `Articles tagged #${label}.`,
      type: "website",
      url: `${siteConfig.url}/en${path}`,
      images: [rootOgImageUrl()],
      locale: "en_US",
      siteName: siteConfig.name,
    },
    twitter: { card: "summary_large_image", images: [rootOgImageUrl()] },
  };
}

export default TagPage;
