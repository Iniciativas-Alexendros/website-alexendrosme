import type { Metadata } from "next";
import { getContentCollection } from "@/lib/content/loader";
import { HomeContent } from "@/components/home-content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [espensar, esposible] = await Promise.all([
    getContentCollection("espensar"),
    getContentCollection("esposible"),
  ]);

  const latestArticles = [
    ...espensar.slice(0, 3).map((item) => ({ ...item, type: "espensar" as const })),
    ...esposible.slice(0, 3).map((item) => ({ ...item, type: "esposible" as const })),
  ].sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

  return <HomeContent latestArticles={latestArticles} years={{ misionYear: "2024–" }} />;
}
