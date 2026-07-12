import { siteConfig } from "@/lib/site";

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const allItems = [{ name: "Inicio", href: siteConfig.url }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": item.href,
        name: item.name,
      },
    })),
  };
}
