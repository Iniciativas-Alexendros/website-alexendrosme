import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumb";

interface BreadcrumbJsonLdProps {
  items: { name: string; href: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id="breadcrumb-json-ld"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(items)) }}
    />
  );
}
