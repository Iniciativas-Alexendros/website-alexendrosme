import fs from "fs/promises";
import path from "path";
import { FrontmatterSchema, type ContentItem, type CollectionType } from "./types";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

function parseFrontmatter(raw: string): {
  attributes: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { attributes: {}, body: raw };

  const yamlBlock = match[1] ?? "";
  const body = raw.slice(match[0].length);
  const attributes: Record<string, unknown> = {};
  let currentKey = "";

  for (const line of yamlBlock.split("\n")) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1] ?? "";
      const val = (kvMatch[2] ?? "").trim();
      if (val === "true") attributes[currentKey] = true;
      else if (val === "false") attributes[currentKey] = false;
      else if (val.startsWith("[") && val.endsWith("]")) {
        attributes[currentKey] = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      } else {
        attributes[currentKey] = val.replace(/^["']|["']$/g, "");
      }
    } else if (line.startsWith("  - ") && currentKey) {
      if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = [];
      (attributes[currentKey] as string[]).push(
        line
          .slice(4)
          .trim()
          .replace(/^["']|["']$/g, ""),
      );
    }
  }

  return { attributes, body };
}

const CONTENT_DIR = path.join(process.cwd(), "content");

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
        const { attributes } = parseFrontmatter(source);
        const parsed = FrontmatterSchema.parse(attributes);

        if (parsed.draft) return null;

        return {
          slug: file.replace(/\.mdx?$/, ""),
          frontmatter: parsed,
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
      const { attributes, body } = parseFrontmatter(source);
      const parsed = FrontmatterSchema.parse(attributes);

      if (parsed.draft) return null;

      return { slug, frontmatter: parsed, content: body };
    } catch {
      continue;
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
