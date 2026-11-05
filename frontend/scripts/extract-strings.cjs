/* Extracts user-facing string candidates from TSX sources for translation. */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..", "src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) files.push(full);
  }
  return files;
}

const files = walk(ROOT).filter((f) => !f.includes(`${path.sep}i18n${path.sep}`));
const counts = new Map();

function add(text) {
  const t = text.trim();
  if (!/[A-Za-z]{2,}/.test(t)) return;
  if (!/[\s]/.test(t) && t.length < 3) return; // skip tiny single words unless meaningful
  counts.set(t, (counts.get(t) || 0) + 1);
}

for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.TSX);
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const kind = parent ? ts.SyntaxKind[parent.kind] : "";
      // skip imports, type positions, property keys, comparisons
      if (/Import/.test(kind)) return;
      add(node.text);
    } else if (ts.isJsxText(node)) {
      add(node.getText(source));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const lines = sorted.map(([text, n]) => `${n}\t${JSON.stringify(text)}`);
fs.writeFileSync(path.join(__dirname, "strings-inventory.txt"), lines.join("\n"));
console.log(`files: ${files.length}, unique candidates: ${sorted.length}`);
