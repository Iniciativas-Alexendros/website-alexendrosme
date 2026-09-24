/** ASCII kebab slug for tag URLs (display label stays accented). */
export function slugifyTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tagPath(tag: string): string {
  return `/tags/${slugifyTag(tag)}`;
}
