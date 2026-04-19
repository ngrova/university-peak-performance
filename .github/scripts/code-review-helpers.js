#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.COUNCIL_MODEL || "claude-sonnet-4-20250514";
const MAX_TOKENS = 16384;
const RETRY_STATUSES = [429, 529];
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 180_000;

// Catalog files that get injected into agent context
const CATALOG_FILES = [
  "docs/DESIGN-TOKENS.md",
  "docs/DESIGN-REGISTRY.md",
  "docs/CODE-PATTERNS.md",
];

const FULL_FILES_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const GENERATED_FILE_PATTERNS = [/^next-env\.d\.ts$/];

async function fetchWithRetry(url, options) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, options);
    if (!RETRY_STATUSES.includes(res.status) || attempt === MAX_RETRIES) return res;
    const expBackoff = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
    const delay = Math.floor(Math.random() * expBackoff);
    console.error(`API returned ${res.status}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt}/${MAX_RETRIES})...`);
    await new Promise((r) => setTimeout(r, delay));
  }
}

function buildContextManifest(diff, plan, catalog, codebaseScan, fullFiles) {
  const diffFileCount = (diff.match(/^diff --git/gm) || []).length;
  const fullFilesList = [];
  for (const match of fullFiles.matchAll(/^--- (.+?) \[(.+?)\] ---$/gm)) {
    fullFilesList.push({ path: match[1], type: match[2] });
  }
  const catalogEntries = [];
  for (const match of catalog.matchAll(/^--- (.+?) ---$/gm)) {
    const section = catalog.slice(match.index);
    const nextMatch = section.indexOf("\n--- ", 5);
    const content = nextMatch > 0 ? section.slice(0, nextMatch) : section;
    const isEmpty = content.replace(/^--- .+? ---\n/, "").trim().length < 50;
    catalogEntries.push({ path: match[1], empty: isEmpty });
  }

  let manifest = "CONTEXT MANIFEST — here is everything you have been given for this review:\n\n";
  manifest += `1. PLAN: ${plan === "(no plan file found)" ? "⚠ No plan file found" : plan.length + " chars"}\n`;
  manifest += `2. CODE DIFF: ${diffFileCount} files changed, ${diff.length} chars (complete — no truncation)\n`;
  if (catalogEntries.length > 0) {
    manifest += `3. DESIGN CATALOG: ${catalogEntries.length} files\n`;
    for (const entry of catalogEntries) {
      manifest += `   - ${entry.path}${entry.empty ? " (⚠ scaffold only — minimal content)" : ""}\n`;
    }
  } else {
    manifest += "3. DESIGN CATALOG: ⚠ No catalog files found\n";
  }
  manifest += `4. CODEBASE SCAN: ${codebaseScan.length > 0 ? codebaseScan.length + " chars" : "⚠ No scan output (no app code patterns detected)"}\n`;
  if (fullFilesList.length > 0) {
    manifest += `5. FULL FILE CONTENTS: ${fullFilesList.length} files, ${fullFiles.length} chars\n`;
    for (const f of fullFilesList) {
      manifest += `   - ${f.path} [${f.type}]\n`;
    }
    manifest += "   Complete source files for every code file in this PR plus direct imports.\n";
  } else {
    manifest += "5. FULL FILE CONTENTS: 0 code files (infra-only PR — reviewed via diff).\n";
  }
  manifest += "\nIf you suspect an issue in a file NOT listed above, FAIL with a clear REASON\n";
  manifest += "naming the file and what you would need to see.\n";
  return manifest;
}

function parseVerdict(text) {
  // Look for the VERDICT line in structured output format.
  // Tolerate markdown decoration: **VERDICT**, ## VERDICT, > VERDICT, - **VERDICT**, etc.
  const verdictLine = text.match(/^[\s>*#\-_]*\**\s*VERDICT\**[:\s]*\**\s*(PASS|FAIL|EXEMPT)/im);
  if (verdictLine) return verdictLine[1].toUpperCase();
  // Fallback: last verdict keyword found (fail closed). Also tolerate markdown decoration.
  const lines = text.split("\n");
  let verdict = "FAIL";
  for (const line of lines) {
    if (/^[\s>*#\-_]*\**\s*PASS\b/i.test(line)) verdict = "PASS";
    else if (/^[\s>*#\-_]*\**\s*FAIL\b/i.test(line)) verdict = "FAIL";
    else if (/^[\s>*#\-_]*\**\s*EXEMPT\b/i.test(line)) verdict = "EXEMPT";
  }
  return verdict;
}

async function reviewAgent(agent, diff, plan, catalog, codebaseScan, fullFiles, apiKey, contextManifest) {
  const catalogSection = catalog ? `\n\nDESIGN CATALOG (reference for pattern compliance):\n${catalog}` : "";
  const scanSection = codebaseScan ? `\n\nCODEBASE SCAN (patterns in this diff that already exist elsewhere in the repo):\n${codebaseScan}` : "";
  const fullFilesSection = fullFiles ? `\n\n${fullFiles}` : "";
  const userContent = `${agent.prompt}\n\n${contextManifest}\n\nPLAN:\n${plan}\n\nCODE DIFF:\n${diff}${catalogSection}${scanSection}${fullFilesSection}`;
  console.error(`[Agent ${agent.name}] Sending ${userContent.length} chars (${Math.round(userContent.length / 4)} est. tokens)`);
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0,
    messages: [{ role: "user", content: userContent }],
  });

  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  const res = await fetchWithRetry(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    return {
      name: agent.name, verdict: "FAIL",
      reason: `API error ${res.status}: ${err.slice(0, 200)}`,
      startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - startMs,
      promptChars: userContent.length, apiUsage: null,
    };
  }
  const data = await res.json();
  const text = (data.content && data.content[0] && data.content[0].text) || "";
  const verdict = parseVerdict(text);
  const apiUsage = data.usage || null;

  const completedAt = new Date().toISOString();
  return {
    name: agent.name, verdict, reason: text,
    startedAt, completedAt, durationMs: Date.now() - startMs,
    promptChars: userContent.length, apiUsage,
    responseText: text,
  };
}

function parseFileDiffs(rawDiff) {
  const chunks = rawDiff.split(/^(?=diff --git )/m);
  return chunks.filter(Boolean).map((chunk) => {
    const match = chunk.match(/^diff --git a\/(.+?) b\//);
    return { path: match ? match[1] : "unknown", diff: chunk };
  });
}

function readCatalog() {
  const root = process.cwd();
  const sections = [];
  for (const relPath of CATALOG_FILES) {
    const fullPath = path.join(root, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      sections.push(`--- ${relPath} ---\n${content}`);
    }
  }
  return sections.length > 0 ? sections.join("\n\n") : "";
}

function getRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

function loadPathAliases(root) {
  const aliases = {};
  for (const cfg of ["tsconfig.json", "jsconfig.json"]) {
    const p = path.join(root, cfg);
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
      const json = JSON.parse(raw);
      const paths = json?.compilerOptions?.paths || {};
      const baseUrl = json?.compilerOptions?.baseUrl || ".";
      for (const [alias, targets] of Object.entries(paths)) {
        if (!Array.isArray(targets) || targets.length === 0) continue;
        const aliasKey = alias.replace(/\*$/, "");
        const targetVal = String(targets[0]).replace(/\*$/, "");
        aliases[aliasKey] = path.join(baseUrl, targetVal).replace(/\\/g, "/");
      }
    } catch { /* fall through to default */ }
    break;
  }
  if (!aliases["@/"]) aliases["@/"] = "src/";
  return aliases;
}

function gatherFullFiles(rawDiff) {
  const root = getRoot();
  const pathAliases = loadPathAliases(root);

  const changedFiles = [];
  const excludedNonCode = [];
  const excludedGenerated = [];
  for (const line of rawDiff.split("\n")) {
    const match = line.match(/^diff --git a\/(.+?) b\//);
    if (!match) continue;
    const p = match[1];
    const base = p.split("/").pop();
    if (GENERATED_FILE_PATTERNS.some(rx => rx.test(base))) {
      excludedGenerated.push(p);
    } else if (FULL_FILES_EXTENSIONS.some(ext => p.endsWith(ext))) {
      changedFiles.push(p);
    } else {
      excludedNonCode.push(p);
    }
  }

  const buildExclusionBlock = () => {
    if (excludedNonCode.length === 0 && excludedGenerated.length === 0) return "";
    let s = "";
    if (excludedNonCode.length > 0) {
      s += `\nEXCLUDED FROM FULL FILE CONTENTS (reviewed via diff only, by design):\n`;
      for (const f of excludedNonCode) s += `  - ${f}\n`;
    }
    if (excludedGenerated.length > 0) {
      s += `\nEXCLUDED FROM FULL FILE CONTENTS (framework-generated, no review value):\n`;
      for (const f of excludedGenerated) s += `  - ${f}\n`;
    }
    s += `\nNon-code files are reviewed via diff only. Their absence from FULL FILE CONTENTS is intentional.\n`;
    return s;
  };

  if (changedFiles.length === 0) {
    let text = `FILE MANIFEST (what you should have received — verify before reviewing):\n`;
    text += `CHANGED (0 code files): this PR touches only non-code or generated files.\n`;
    text += `IMPORTED BY CHANGED FILES (0): none\n`;
    text += `UNRESOLVED: none\n`;
    text += buildExclusionBlock();
    text += `\nFULL FILE CONTENTS (0 files, 0 chars): none — see diff for all content.\n`;
    return {
      text,
      fileDetails: [],
      manifest: { loaded: [], skippedExternal: [], unresolved: [], excludedNonCode, excludedGenerated },
    };
  }

  const fileContents = {};
  let totalChars = 0;

  for (const file of changedFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    fileContents[file] = content;
    totalChars += content.length;
  }

  const relatedFiles = new Set();
  const skippedExternal = new Set();
  const unresolved = [];

  for (const [file, content] of Object.entries(fileContents)) {
    const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
    for (const imp of importMatches) {
      const importPath = imp.replace(/from\s+['"]/, "").replace(/['"]$/, "");
      const aliasMatch = Object.keys(pathAliases).find(a => importPath.startsWith(a));
      let resolved = null;
      if (aliasMatch) {
        resolved = path.join(pathAliases[aliasMatch], importPath.slice(aliasMatch.length)).replace(/\\/g, "/");
      } else if (importPath.startsWith(".")) {
        resolved = path.join(path.dirname(file), importPath).replace(/\\/g, "/");
      } else {
        skippedExternal.add(importPath);
        continue;
      }

      let found = null;
      const candidates = [];
      for (const ext of FULL_FILES_EXTENSIONS) {
        candidates.push(resolved.endsWith(ext) ? resolved : resolved + ext);
        candidates.push(path.join(resolved, "index" + ext).replace(/\\/g, "/"));
      }
      for (const candidate of candidates) {
        if (fs.existsSync(path.join(root, candidate))) { found = candidate; break; }
      }

      if (found) {
        if (!fileContents[found]) relatedFiles.add(found);
      } else {
        unresolved.push({ fromFile: file, importPath, attemptedRoot: resolved });
      }
    }
  }

  for (const file of relatedFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    fileContents[file] = content;
    totalChars += content.length;
  }

  const changedSet = new Set(changedFiles);
  const fileDetails = Object.entries(fileContents).map(([filePath, content]) => ({
    path: filePath,
    type: changedSet.has(filePath) ? "CHANGED" : "IMPORTED BY CHANGED FILE",
    chars: content.length,
    content,
  }));

  const manifest = {
    loaded: Object.keys(fileContents).map(f => ({
      path: f,
      type: changedSet.has(f) ? "CHANGED" : "IMPORTED BY CHANGED FILE",
      chars: fileContents[f].length,
    })),
    skippedExternal: [...skippedExternal].sort(),
    unresolved,
    excludedNonCode,
    excludedGenerated,
  };

  if (Object.keys(fileContents).length === 0) {
    return { text: "", fileDetails, manifest };
  }

  let text = `FILE MANIFEST (what you should have received — verify before reviewing):\n`;
  text += `CHANGED (${manifest.loaded.filter(l => l.type === "CHANGED").length}):\n`;
  for (const l of manifest.loaded.filter(l => l.type === "CHANGED")) text += `  - ${l.path} (${l.chars} chars)\n`;
  text += `IMPORTED BY CHANGED FILES (${manifest.loaded.filter(l => l.type !== "CHANGED").length}):\n`;
  for (const l of manifest.loaded.filter(l => l.type !== "CHANGED")) text += `  - ${l.path} (${l.chars} chars)\n`;
  if (manifest.skippedExternal.length) {
    text += `EXTERNAL (not loaded, expected): ${manifest.skippedExternal.join(", ")}\n`;
  }
  text += `UNRESOLVED (file-follower could NOT find — if non-empty, FAIL the review):\n`;
  if (manifest.unresolved.length === 0) {
    text += `  - none\n`;
  } else {
    for (const u of manifest.unresolved) {
      text += `  - ${u.importPath} (from ${u.fromFile}) — tried: ${u.attemptedRoot}\n`;
    }
  }
  text += buildExclusionBlock();
  text += `\nFULL FILE CONTENTS (${Object.keys(fileContents).length} files, ${totalChars} chars):\n\n`;
  for (const [file, content] of Object.entries(fileContents)) {
    const label = changedSet.has(file) ? "CHANGED" : "IMPORTED BY CHANGED FILE";
    text += `--- ${file} [${label}] ---\n${content}\n\n`;
  }
  return { text, fileDetails, manifest };
}

function runCodebaseScan(diffFile) {
  const scanScript = path.join(process.cwd(), ".claude", "scripts", "pre-review-scan.js");
  if (!fs.existsSync(scanScript) || !diffFile) return "";
  try {
    return execSync(`node "${scanScript}" "${diffFile}"`, {
      encoding: "utf8",
      timeout: 30000,
      cwd: process.cwd(),
    }).trim();
  } catch (err) {
    console.error("Pre-review scan failed (non-blocking):", err.message);
    return "";
  }
}

function readInputs() {
  const diffFile = process.env.DIFF_FILE || "";
  const planFile = process.env.PLAN_FILE || "";
  const rawDiff = diffFile ? fs.readFileSync(diffFile, "utf8") : "";
  const plan = planFile && fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf8") : "(no plan file found)";
  const catalog = readCatalog();
  const codebaseScan = runCodebaseScan(diffFile);
  const fullFilesResult = gatherFullFiles(rawDiff);
  const fullFiles = fullFilesResult.text;
  const diff = rawDiff; // No truncation — payload size check in code-review.js handles oversized PRs
  const contextManifest = buildContextManifest(diff, plan, catalog, codebaseScan, fullFiles);

  // Diagnostic logging
  const diagnostics = {
    diff: { chars: diff.length, fileCount: (rawDiff.match(/^diff --git/gm) || []).length },
    plan: { chars: plan.length, found: planFile && fs.existsSync(planFile), path: planFile || "(none)" },
    catalog: CATALOG_FILES.map(f => {
      const fp = path.join(process.cwd(), f);
      const exists = fs.existsSync(fp);
      return { path: f, exists, chars: exists ? fs.readFileSync(fp, "utf8").length : 0 };
    }),
    codebaseScan: { chars: codebaseScan.length },
    fullFiles: { chars: fullFiles.length, fileCount: (fullFiles.match(/^--- /gm) || []).length },
    contextManifest: { chars: contextManifest.length },
  };
  console.error("=== CONTEXT ASSEMBLY DIAGNOSTICS ===");
  console.error(JSON.stringify(diagnostics, null, 2));
  console.error("=== END DIAGNOSTICS ===");

  // Glass Office: structured context for the ledger
  const diffFiles = parseFileDiffs(rawDiff);
  const ledgerContext = {
    diff: {
      rawChars: rawDiff.length,
      fileCount: diffFiles.length,
      files: diffFiles.map(f => ({ path: f.path, chars: f.diff.length })),
    },
    plan: {
      found: !!(planFile && fs.existsSync(planFile)),
      path: planFile || "(none)",
      chars: plan.length,
      content: plan,
    },
    catalog: {
      files: CATALOG_FILES.map(f => {
        const fp = path.join(process.cwd(), f);
        const exists = fs.existsSync(fp);
        const content = exists ? fs.readFileSync(fp, "utf8") : "";
        return { path: f, exists, chars: content.length, content };
      }),
    },
    codebaseScan: { chars: codebaseScan.length, content: codebaseScan },
    fullFiles: {
      totalChars: fullFiles.length,
      fileCount: fullFilesResult.fileDetails.length,
      files: fullFilesResult.fileDetails,
      manifest: fullFilesResult.manifest,
    },
  };

  return { diff, plan, catalog, codebaseScan, fullFiles, contextManifest, ledgerContext };
}

module.exports = { fetchWithRetry, reviewAgent, readInputs };
