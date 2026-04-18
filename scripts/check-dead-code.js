#!/usr/bin/env node
/**
 * Dead Code Sweeper — finds orphaned .ts/.tsx files with zero inbound imports.
 * Runs in CI on every PR. Exits 1 if orphans found.
 *
 * Assumes Next.js App Router conventions. For non-Next projects, override
 * ci.deadcode_command in project.yml or set it to null.
 *
 * Environment variables:
 *   DEADCODE_SRC_DIR — source root to scan (default: ../src relative to this script)
 *   DEADCODE_ALIAS   — TypeScript path alias (default: "@/")
 *
 * Suppression:
 *   A file may opt out of orphan detection by including an inline directive:
 *     // @deadcode-allow: <reason>
 *   The reason text is required — it documents why the file is intentionally
 *   unimported (e.g. "runtime-only import via dynamic()", "CLI entry point").
 *   Use sparingly; prefer deleting truly dead code over suppressing.
 */
const fs = require("fs");
const path = require("path");

// Assumes script lives at <repo>/scripts/ and apps/web/ is the deployable app.
const SRC_DIR = process.env.DEADCODE_SRC_DIR
  ? path.resolve(process.env.DEADCODE_SRC_DIR)
  : path.resolve(__dirname, "../apps/web/src");

const ALIAS = process.env.DEADCODE_ALIAS || "@/";

const ENTRY_PATTERNS = [
  /page\.tsx$/,
  /layout\.tsx$/,
  /middleware\.ts$/,
  /loading\.tsx$/,
  /error\.tsx$/,
  /not-found\.tsx$/,
  /route\.ts$/,
];

function hasAllowDirective(content) {
  return /\/\/\s*@deadcode-allow:\s*\S+/.test(content);
}

function isExempt(filePath, content) {
  const rel = path.relative(SRC_DIR, filePath);
  if (/\.(test|spec)\.(ts|tsx)$/.test(rel)) return true;
  if (/\.types\.ts$/.test(rel)) return true;
  if (rel.startsWith("types" + path.sep) || rel.includes(path.sep + "types" + path.sep)) return true;
  if (rel.startsWith("actions" + path.sep)) return true;
  if (ENTRY_PATTERNS.some((p) => p.test(rel))) return true;
  if (content !== undefined && hasAllowDirective(content)) return true;
  return false;
}

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function extractImports(content) {
  const imports = [];
  const re = /(?:import|export)[\s\S]*?from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function resolveImport(importPath, fromFile) {
  let resolved;
  if (importPath.startsWith(ALIAS)) {
    resolved = path.join(SRC_DIR, importPath.slice(ALIAS.length));
  } else if (importPath.startsWith(".")) {
    resolved = path.resolve(path.dirname(fromFile), importPath);
  } else {
    return null;
  }
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = resolved + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const allFiles = collectFiles(SRC_DIR);
const fileContents = new Map();
const imported = new Set();
for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");
  fileContents.set(file, content);
  for (const imp of extractImports(content)) {
    const target = resolveImport(imp, file);
    if (target) imported.add(target);
  }
}

const orphans = allFiles.filter(
  (f) => !imported.has(f) && !isExempt(f, fileContents.get(f))
);

if (orphans.length > 0) {
  console.error("Dead code detected — orphaned files with zero inbound imports:\n");
  for (const o of orphans) {
    console.error("  " + path.relative(path.resolve(__dirname, ".."), o));
  }
  console.error(`\n${orphans.length} orphan(s) found. Remove them or add imports.`);
  process.exit(1);
}

console.log("No orphaned files detected.");
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
