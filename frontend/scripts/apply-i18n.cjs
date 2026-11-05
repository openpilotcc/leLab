/*
 * Codemod: wraps UI strings with i18n.t() calls.
 *
 * Only strings whose normalized text exists in src/i18n/locales/zh.json are
 * touched (the dictionary doubles as the allow-list), so identifiers, class
 * names, enum values, storage keys and URLs are never rewritten. Comparison
 * operands, switch cases, type literals, quoted property keys and import
 * specifiers are skipped entirely.
 *
 * Run: node scripts/apply-i18n.cjs [--dry]
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const dry = process.argv.includes("--dry");
const SRC = path.join(__dirname, "..", "src");
const dict = require("../src/i18n/locales/zh.json");
const keys = new Set(Object.keys(dict));
const normalize = (s) => s.replace(/\s+/g, " ").trim();

const COMPARISONS = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
]);

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) acc.push(full);
  }
  return acc;
}

const files = walkFiles(SRC).filter((f) => !f.includes(`${path.sep}i18n${path.sep}`));
let total = 0;
const touched = [];

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.TSX);
  const edits = [];

  function visit(node, parent) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const key = normalize(node.text);
      if (key && keys.has(key) && parent) {
        const k = parent.kind;
        const isImport = k === ts.SyntaxKind.ImportDeclaration || k === ts.SyntaxKind.ImportSpecifier;
        const isPropKey = k === ts.SyntaxKind.PropertyAssignment && parent.name === node;
        const isComparison =
          k === ts.SyntaxKind.BinaryExpression &&
          COMPARISONS.has(parent.operatorToken.kind);
        const isCase = k === ts.SyntaxKind.CaseClause;
        const isType = k === ts.SyntaxKind.LiteralType;
        const isEnum = k === ts.SyntaxKind.EnumMember;
        const isElemAccess = k === ts.SyntaxKind.ElementAccessExpression;
        // Skip arguments of existing t()/i18n.t() calls so already-wrapped
        // strings are not double-wrapped.
        const isTArg =
          k === ts.SyntaxKind.CallExpression &&
          ((ts.isIdentifier(parent.expression) && parent.expression.text === "t") ||
            (ts.isPropertyAccessExpression(parent.expression) && parent.expression.name.text === "t"));
        if (!isImport && !isPropKey && !isComparison && !isCase && !isType && !isEnum && !isElemAccess && !isTArg) {
          const call = `i18n.t(${JSON.stringify(key)})`;
          if (k === ts.SyntaxKind.JsxAttribute) edits.push({ start: node.getStart(source), end: node.getEnd(), text: `{${call}}` });
          else edits.push({ start: node.getStart(source), end: node.getEnd(), text: call });
        }
      }
    } else if (ts.isJsxText(node)) {
      const raw = node.getText(source);
      const key = normalize(raw);
      if (key && keys.has(key) && /[A-Za-z]/.test(raw)) {
        const lead = /^\s/.test(raw) ? " " : "";
        const trail = /\s$/.test(raw) ? " " : "";
        edits.push({
          start: node.getStart(source),
          end: node.getEnd(),
          text: `${lead}{i18n.t(${JSON.stringify(key)})}${trail}`,
        });
      }
    }
    ts.forEachChild(node, (child) => visit(child, node));
  }
  visit(source, undefined);

  if (edits.length === 0) continue;

  edits.sort((a, b) => b.start - a.start);
  let out = code;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  if (!/from ["']@\/i18n["']/.test(out)) out = `import i18n from "@/i18n";\n` + out;

  if (!dry) fs.writeFileSync(file, out);
  total += edits.length;
  touched.push(`${path.relative(SRC, file)}: ${edits.length}`);
}

console.log(`${dry ? "[dry] " : ""}files touched: ${touched.length}, replacements: ${total}`);
for (const t of touched.sort()) console.log("  " + t);
