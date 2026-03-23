#!/usr/bin/env node

/**
 * Dead Code Sweeper — finds orphaned .ts/.tsx files with zero inbound imports.
 * Runs in CI on every PR. Exits 1 if orphans found.
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../apps/thriving-mobile/src");
const ALIAS = "@/";

// Next.js entry points and framework convention files — never flagged
const ENTRY_PATTERNS = [
  /page\.tsx$/,
  /layout\.tsx$/,
  /middleware\.ts$/,
  /loading\.tsx$/,
  /error\.tsx$/,
  /not-found\.tsx$/,
  /globals\.css$/,
];

// Files exempt from orphan detection
function isExempt(filePath) {
  const rel = path.relative(SRC_DIR, filePath);
  if (/\.(test|spec)\.(ts|tsx)$/.test(rel)) return true;
  if (/\.types\.ts$/.test(rel)) return true;
  if (rel.startsWith("types" + path.sep) || rel.includes(path.sep + "types" + path.sep)) return true;
  // Server actions are framework entry points (called via 'use server')
  if (rel.startsWith("actions" + path.sep)) return true;
  if (ENTRY_PATTERNS.some((p) => p.test(rel))) return true;
  return false;
}

// Collect all .ts/.tsx files in src/
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

// Extract import paths from file contents
function extractImports(content) {
  const imports = [];
  const re = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

// Resolve an import path to an absolute file path
function resolveImport(importPath, fromFile) {
  let resolved;
  if (importPath.startsWith(ALIAS)) {
    resolved = path.join(SRC_DIR, importPath.slice(ALIAS.length));
  } else if (importPath.startsWith(".")) {
    resolved = path.resolve(path.dirname(fromFile), importPath);
  } else {
    return null; // node_modules — skip
  }
  // Try exact, then with extensions
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = resolved + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// Main
const allFiles = collectFiles(SRC_DIR);
const imported = new Set();

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const imp of extractImports(content)) {
    const target = resolveImport(imp, file);
    if (target) imported.add(target);
  }
}

const orphans = allFiles.filter((f) => !imported.has(f) && !isExempt(f));

if (orphans.length > 0) {
  console.error("Dead code detected — orphaned files with zero inbound imports:\n");
  for (const o of orphans) {
    console.error("  " + path.relative(path.resolve(__dirname, ".."), o));
  }
  console.error(`\n${orphans.length} orphan(s) found. Remove them or add imports.`);
  process.exit(1);
}

console.log("No orphaned files detected.");
