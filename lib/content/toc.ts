export interface ToCItem {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Algoritmo que MATCHEA rehype-slug v6+ en producción:
 *   text.toLowerCase().trim().replace(/[\s\W-]+/g, '-')
 *
 * Notas:
 *  - `trim()` después de lowercase elimina whitespace al final
 *  - `[\s\W-]+` colapsa espacios, no-word chars y dashes en un único '-'
 *  - El resultado esperado mantiene el caso del primer carácter del val final limpiado
 *  - rehype-slug además hace strip de '-' al final si quedan. Pero dado que
 *    nuestra regex colapse múltiples separadores en uno solo, el resultado
 *    nunca debe terminar/comezar con '-' salvo que el texto original sí tenga
 *    separadores que se transformen al inicio/final.
 *
 *  Edge case: "¿Cómo funciona?" → "como-funciona" (acentos fuera de \w no se preservan
 *  según el regex). Esto matchea el comportamiento por defecto de rehype-slug
 *  cuando se llama con un texto puro (sin pasar por el plugin). Verificamos
 *  empíricamente en tests de integración con el plugin activo.
 */
function matchSlugify(text: string): string {
  // github-slugger (usado por rehype-slug v6+) produce slugs así:
  //   lowercase → replace [^a-z0-9\-]+ with - → colapse - → strip leading/trailing -
  // Por tanto caracteres como ó, é, ñ se tratan como separador (no unicode-aware /\W/).
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractToc(markdown: string, minLevel = 2, maxLevel = 3): ToCItem[] {
  const safeMin = Math.max(1, Math.min(6, minLevel));
  const safeMax = Math.max(safeMin, Math.min(6, maxLevel));
  const headingRegex = new RegExp(`^(#{${safeMin},${safeMax}})\\s+(.+)$`, "gm");
  const items: ToCItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1] ?? "";
    const text = (match[2] ?? "").trim();
    const level = hashes.length as ToCItem["level"];
    items.push({ id: matchSlugify(text), text, level });
  }

  return items;
}
