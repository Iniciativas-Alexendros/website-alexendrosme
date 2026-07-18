import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { NowContent } from "@/components/now-content";

export const metadata: Metadata = {
  title: "Ahora",
  description: "Qué estoy haciendo ahora mismo — proyectos, lecturas, enfoque actual.",
  alternates: { canonical: "/now" },
  openGraph: {
    title: "Ahora · Alexendros",
    description: "Qué estoy haciendo ahora mismo.",
    type: "profile",
    url: `${siteConfig.url}/now`,
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
