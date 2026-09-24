import { getContentCollection } from "@/lib/content/loader";
import { OG_SIZE, CONTENT_TYPE, PROYECTOS_THEME, ogImageResponse } from "@/lib/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = CONTENT_TYPE;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const articles = await getContentCollection("proyectos");
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ProyectosOG({ params }: Props) {
  const { slug } = await params;
  return ogImageResponse({
    collection: "proyectos",
    slug,
    theme: PROYECTOS_THEME,
    sectionLabel: "Proyectos",
  });
}
