#!/usr/bin/env node
// Helper functions for the Code Review Council GitHub Action.
// Handles API calls, diff parsing, and smart diff summarization.

const fs = require("fs");

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;
const RETRY_STATUSES = [429, 529];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 30000;
const MAX_DIFF_CHARS = 40000;
const PRIORITY_PATTERNS = [/actions\//, /migrations\//, /supabase\//, /\.github\//, /middleware/, /\.config\./];

// Wraps fetch with retry on 429/529 — waits 30s between attempts
async function fetchWithRetry(url, options) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, options);
    if (!RETRY_STATUSES.includes(res.status) || attempt === MAX_RETRIES) return res;
    console.error(`API returned ${res.status}, retrying in 30s (attempt ${attempt}/${MAX_RETRIES})...`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
}

// Calls the Anthropic API for a single agent review
async function reviewAgent(agent, diff, plan, apiKey) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: `${agent.prompt}\n\nPLAN:\n${plan}\n\nCODE DIFF:\n${diff}` }],
  });
  const res = await fetchWithRetry(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    return { name: agent.name, verdict: "REJECTED", reason: `API error ${res.status}: ${err.slice(0, 200)}` };
  }
  const data = await res.json();
  const text = (data.content && data.content[0] && data.content[0].text) || "";
  const firstLine = text.split("\n")[0] || "";
  const verdict = /REJECTED/i.test(firstLine) ? "REJECTED"
    : /WARN/i.test(firstLine) ? "WARN"
    : /EXEMPT/i.test(firstLine) ? "EXEMPT"
    : /APPROVED/i.test(firstLine) ? "APPROVED"
    : "REJECTED";
  return { name: agent.name, verdict, reason: text };
}

// Splits a unified diff into per-file chunks
function parseFileDiffs(rawDiff) {
  const chunks = rawDiff.split(/^(?=diff --git )/m);
  return chunks.filter(Boolean).map((chunk) => {
    const match = chunk.match(/^diff --git a\/(.+?) b\//);
    return { path: match ? match[1] : "unknown", diff: chunk };
  });
}

// Returns true if a file path matches priority patterns
function isPriorityFile(filePath) {
  return PRIORITY_PATTERNS.some((p) => p.test(filePath));
}

// Builds a smart diff: file manifest + priority files first, then others up to limit
function buildSmartDiff(rawDiff) {
  if (rawDiff.length <= MAX_DIFF_CHARS) return rawDiff;
  const files = parseFileDiffs(rawDiff);
  const manifest = files.map((f) => `- ${f.path} (${f.diff.length} chars)`).join("\n");
  const priority = files.filter((f) => isPriorityFile(f.path));
  const other = files.filter((f) => !isPriorityFile(f.path));
  let result = `FILE MANIFEST (${files.length} files changed):\n${manifest}\n\n`;
  let remaining = MAX_DIFF_CHARS - result.length;
  for (const f of [...priority, ...other]) {
    if (f.diff.length <= remaining) {
      result += f.diff + "\n";
      remaining -= f.diff.length + 1;
    } else if (remaining > 200) {
      result += f.diff.slice(0, remaining - 50) + "\n[...truncated]\n";
      break;
    }
  }
  return result;
}

// Reads diff and plan files from environment variables
function readInputs() {
  const diffFile = process.env.DIFF_FILE || "";
  const planFile = process.env.PLAN_FILE || "";
  const rawDiff = diffFile ? fs.readFileSync(diffFile, "utf8") : "";
  const plan = planFile && fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf8") : "(no plan file found)";
  return { diff: buildSmartDiff(rawDiff), plan: plan.slice(0, 5000) };
}

module.exports = { fetchWithRetry, reviewAgent, readInputs };
