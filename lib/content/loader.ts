import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { FrontmatterSchema, type ContentItem, type CollectionType } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " $& ")
    .replace(/[#*_~>-]/g, " ");

  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function getContentCollection(
  type: CollectionType,
): Promise<Omit<ContentItem, "content">[]> {
  const dir = path.join(CONTENT_DIR, type);

  try {
    const files = await fs.readdir(dir);
    const mdxFiles = files.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    const items = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(dir, file);
        const source = await fs.readFile(filePath, "utf-8");
        const { data: attributes, content: body } = matter(source);
        const parsed = FrontmatterSchema.parse(attributes);

        if (parsed.draft) return null;

        return {
          slug: file.replace(/\.mdx?$/, ""),
          frontmatter: parsed,
          readingTime: calculateReadingTime(body),
        };
      }),
    );

    return items
      .filter((item): item is Omit<ContentItem, "content"> => item !== null)
      .sort(
        (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime(),
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function getRawContent(
  type: CollectionType,
  slug: string,
): Promise<ContentItem | null> {
  const dir = path.join(CONTENT_DIR, type);
  const extensions = [".mdx", ".md"];

  for (const ext of extensions) {
    const filePath = path.join(dir, `${slug}${ext}`);
    try {
      const source = await fs.readFile(filePath, "utf-8");
      const { data: attributes, content: body } = matter(source);
      const parsed = FrontmatterSchema.parse(attributes);

      if (parsed.draft) return null;

      return {
        slug,
        frontmatter: parsed,
        content: body,
        readingTime: calculateReadingTime(body),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }

  return null;
}

export async function getAllSlugs(type: CollectionType): Promise<string[]> {
  const items = await getContentCollection(type);
  return items.map((item) => item.slug);
}

export async function getRelatedContent(
  type: CollectionType,
  currentSlug: string,
  limit = 3,
): Promise<Omit<ContentItem, "content">[]> {
  const items = await getContentCollection(type);
  const current = items.find((item) => item.slug === currentSlug);
  if (!current) return [];

  const currentTags = new Set(current.frontmatter.tags);

  return items
    .filter((item) => item.slug !== currentSlug)
    .map((item) => ({
      item,
      score: item.frontmatter.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export interface TagArticle {
  type: CollectionType;
  slug: string;
  frontmatter: ContentItem["frontmatter"];
  readingTime: number;
}

import { slugifyTag } from "@/lib/seo/tags";

export async function getAllTags(): Promise<string[]> {
  const [proyectos, opinion] = await Promise.all([
    getContentCollection("proyectos"),
    getContentCollection("opinion"),
  ]);
  const tags = new Set<string>();
  for (const item of [...proyectos, ...opinion]) {
    for (const tag of item.frontmatter.tags) tags.add(tag);
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "es"));
}

/** Resolve a URL tag param (slug or raw label) to the frontmatter display label. */
export async function resolveTagLabel(param: string): Promise<string | null> {
  const decoded = decodeURIComponent(param);
  const tags = await getAllTags();
  const exact = tags.find((t) => t === decoded);
  if (exact) return exact;
  const bySlug = tags.find((t) => slugifyTag(t) === slugifyTag(decoded));
  return bySlug ?? null;
}

export async function getArticlesByTag(tag: string): Promise<TagArticle[]> {
  const label = (await resolveTagLabel(tag)) ?? tag;
  const [proyectos, opinion] = await Promise.all([
    getContentCollection("proyectos"),
    getContentCollection("opinion"),
  ]);
  const tagged: TagArticle[] = [
    ...proyectos
      .filter((a) => a.frontmatter.tags.includes(label))
      .map((a) => ({
        ...a,
        type: "proyectos" as const,
      })),
    ...opinion
      .filter((a) => a.frontmatter.tags.includes(label))
      .map((a) => ({
        ...a,
        type: "opinion" as const,
      })),
  ];
  return tagged.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime(),
  );
}
