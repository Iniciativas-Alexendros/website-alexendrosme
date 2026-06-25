import fs from "node:fs";
import path from "node:path";

function readSchema(filename: string): string | null {
  try {
    const filePath = path.join(process.cwd(), "public", "schema", filename);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function JsonLd() {
  const person = readSchema("person.json");
  const website = readSchema("website.json");

  return (
    <>
      {person && (
        <script
          type="application/ld+json"
          id="person-json-ld"
          dangerouslySetInnerHTML={{ __html: person }}
        />
      )}
      {website && (
        <script
          type="application/ld+json"
          id="website-json-ld"
          dangerouslySetInnerHTML={{ __html: website }}
        />
      )}
    </>
  );
}
