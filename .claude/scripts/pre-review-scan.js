#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SHARED_DIRS = [
  "apps/web/src/actions", "apps/web/src/lib", "apps/web/src/hooks",
  "apps/web/src/utils", "apps/web/src/components/shared",
  "packages"
];

function getRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

function parseDiffAdditions(diff) {
  const files = {};
  let currentFile = null;
  for (const line of diff.split("\n")) {
    const fileMatch = line.match(/^diff --git a\/(.+?) b\//);
    if (fileMatch) { currentFile = fileMatch[1]; files[currentFile] = []; continue; }
    if (currentFile && line.startsWith("+") && !line.startsWith("+++")) {
      files[currentFile].push(line.slice(1));
    }
  }
  return files;
}

function extractClassNames(lines) {
  const classes = new Set();
  for (const line of lines) {
    const matches = line.match(/className="([^"]+)"/g) || [];
    for (const m of matches) {
      const val = m.replace(/className="/, "").replace(/"$/, "");
      const tokens = val.split(/\s+/).filter(t =>
        /^(bg-|text-|border-|rounded-|shadow-|px-|py-|p-|font-|hover:)/.test(t)
      );
      tokens.forEach(t => classes.add(t));
    }
  }
  return [...classes];
}

function extractExportedFunctions(lines) {
  const funcs = [];
  for (const line of lines) {
    const match = line.match(/export\s+(async\s+)?function\s+(\w+)/);
    if (match) funcs.push(match[2]);
    const arrowMatch = line.match(/export\s+const\s+(\w+)\s*=/);
    if (arrowMatch) funcs.push(arrowMatch[1]);
  }
  return funcs;
}

function extractHexColors(lines) {
  const colors = new Set();
  for (const line of lines) {
    const matches = line.match(/#[0-9a-fA-F]{6}\b/g) || [];
    matches.forEach(c => colors.add(c.toLowerCase()));
    const twMatches = line.match(/(?:bg|text|border|shadow)-\[#[0-9a-fA-F]{6,8}\]/g) || [];
    twMatches.forEach(c => colors.add(c));
  }
  return [...colors];
}

function grepCodebase(root, pattern, extensions, maxResults) {
  try {
    const extArgs = extensions.map(e => `--include="*.${e}"`).join(" ");
    const cmd = `grep -rl ${extArgs} --exclude-dir=node_modules --exclude-dir=.claude --exclude-dir=.github --exclude-dir=plans "${pattern}" . 2>/dev/null | head -${maxResults}`;
    return execSync(cmd, { encoding: "utf8", cwd: root, timeout: 10000 }).trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function findSimilarFunctions(root, funcName) {
  const results = [];
  for (const dir of SHARED_DIRS) {
    try {
      const cmd = `grep -rn "function ${funcName}\\|const ${funcName}" --include="*.ts" --include="*.tsx" ${dir}/ 2>/dev/null | head -3`;
      const out = execSync(cmd, { encoding: "utf8", cwd: root, timeout: 5000 }).trim();
      if (out) results.push(out);
    } catch {
      // Directory may not exist
    }
  }
  return results;
}

function scan(diffText) {
  const root = getRoot();
  const additions = parseDiffAdditions(diffText);
  const sections = [];

  // 1. Component pattern scan
  const allClasses = [];
  const componentFiles = [];
  for (const [file, lines] of Object.entries(additions)) {
    if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
      componentFiles.push(file);
      allClasses.push(...extractClassNames(lines));
    }
  }

  if (allClasses.length > 0) {
    const uniqueClasses = [...new Set(allClasses)];
    const existingMatches = {};
    for (const cls of uniqueClasses.slice(0, 10)) {
      const matches = grepCodebase(root, cls, ["tsx", "jsx"], 5);
      const others = matches.filter(m => !componentFiles.some(f => m.includes(f)));
      if (others.length > 0) existingMatches[cls] = others;
    }
    if (Object.keys(existingMatches).length > 0) {
      let section = "EXISTING PATTERN MATCHES (classes in this diff that already exist elsewhere):\n";
      for (const [cls, files] of Object.entries(existingMatches)) {
        section += `  ${cls} → ${files.join(", ")}\n`;
      }
      sections.push(section);
    }
  }

  // 2. Function duplication scan
  const allFuncs = [];
  for (const [file, lines] of Object.entries(additions)) {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      allFuncs.push(...extractExportedFunctions(lines));
    }
  }
  if (allFuncs.length > 0) {
    const duplicates = [];
    for (const func of allFuncs) {
      const matches = findSimilarFunctions(root, func);
      if (matches.length > 0) duplicates.push({ func, matches });
    }
    if (duplicates.length > 0) {
      let section = "POTENTIAL FUNCTION DUPLICATES (exported functions in this diff that have matches in shared directories):\n";
      for (const { func, matches } of duplicates) {
        section += `  ${func}() → ${matches.join("; ")}\n`;
      }
      sections.push(section);
    }
  }

  // 3. Hardcoded color scan
  const allColors = [];
  for (const [, lines] of Object.entries(additions)) {
    allColors.push(...extractHexColors(lines));
  }
  if (allColors.length > 0) {
    let configColors = {};
    try {
      const twConfig = fs.readFileSync(path.join(root, "tailwind.config.ts"), "utf8");
      const colorMatches = twConfig.match(/'#[0-9a-fA-F]{6}'/g) || [];
      colorMatches.forEach(c => {
        const hex = c.replace(/'/g, "").toLowerCase();
        const idx = twConfig.indexOf(c);
        const before = twConfig.slice(Math.max(0, idx - 50), idx);
        const nameMatch = before.match(/(\w+)\s*:\s*$/);
        if (nameMatch) configColors[hex] = nameMatch[1];
      });
    } catch {
      // No tailwind config
    }

    const hardcodedWithTokens = allColors
      .filter(c => {
        const hex = c.replace(/.*#/, "#").slice(0, 7).toLowerCase();
        return configColors[hex];
      })
      .map(c => {
        const hex = c.replace(/.*#/, "#").slice(0, 7).toLowerCase();
        return `${c} → use "${configColors[hex]}" token instead`;
      });

    if (hardcodedWithTokens.length > 0) {
      let section = "HARDCODED COLORS THAT HAVE TOKENS (use the token, not the hex value):\n";
      hardcodedWithTokens.forEach(h => { section += `  ${h}\n`; });
      sections.push(section);
    }
  }

  // 4. Summary
  const fileCount = Object.keys(additions).length;
  let header = `PRE-REVIEW CODEBASE SCAN (${fileCount} files in diff, scanned against full codebase):\n`;

  if (sections.length === 0) {
    return header + "No existing pattern conflicts, function duplicates, or hardcoded token violations detected.\n";
  }

  return header + sections.join("\n");
}

const diffFile = process.argv[2] || process.env.DIFF_FILE;
if (!diffFile) {
  console.error("Usage: node pre-review-scan.js <diff-file>");
  process.exit(1);
}
const diff = fs.readFileSync(diffFile, "utf8");
process.stdout.write(scan(diff));
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
