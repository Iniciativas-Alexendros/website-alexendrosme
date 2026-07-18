import fs from "node:fs";
import crypto from "node:crypto";

const layout = fs.readFileSync("app/layout.tsx", "utf-8");

// Captura todo entre `__html: \`` y `\`,` o ` }` — multilínea OK
const re = /__html:\s*`([\s\S]*?)`/g;
const blocks: string[] = [];
let m: RegExpExecArray | null;

while ((m = re.exec(layout)) !== null) {
  const inner = m[1];
  if (inner !== undefined) blocks.push(inner);
}

if (blocks.length === 0) {
  console.error("ERROR: no inline blocks found in app/layout.tsx");
  process.exit(1);
}

console.log(`Found ${blocks.length} inline block(s):`);
for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];
  if (block === undefined) continue;
  const hash = crypto.createHash("sha256").update(block, "utf-8").digest("base64");
  const isStyle = /^html,body\{/.test(block);
  console.log(
    `  [${i}] type=${isStyle ? "style" : "script"}  length=${block.length}  sha256-${hash}`,
  );
}
