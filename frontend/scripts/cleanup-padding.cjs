/* Removes the padding spaces the i18n codemod kept around block-level JSX text. */
const fs = require("fs");
const { execSync } = require("child_process");

const files = execSync("git diff --name-only", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.startsWith("frontend/src/") && f.endsWith(".tsx"))
  .map((f) => f.slice("frontend/".length));

let fixed = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  // " {i18n.t("...")} </Tag>" -> " {i18n.t("...")}</Tag>"
  s = s.replace(/\}( +)(<\/)/g, "}\$2");
  // "{i18n.t("...")} \n" -> "{i18n.t("...")}\n" (trailing pad at EOL)
  s = s.replace(/(\{i18n\.t\((?:"[^"]*"|'[^']*')\)\})[ \t]+(\r?\n)/g, "$1$2");
  if (s !== before) {
    fs.writeFileSync(f, s);
    fixed++;
  }
}
console.log("files cleaned:", fixed);
