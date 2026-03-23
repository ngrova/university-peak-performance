#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

// Derives plan file path from current git branch name
function getPlanPath() {
  const root = getRepoRoot();
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const slug = branch.replace(/\//g, "-");
    return path.join(root, "plans", slug + ".md");
  } catch {
    return path.join(root, "plans", "unknown.md");
  }
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  const toolName = data.tool_name;
  if (toolName !== "Write" && toolName !== "Edit" && toolName !== "MultiEdit") {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Determine the file path being edited
  const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || "";
  const normalized = filePath.replace(/\\/g, "/");

  // Allow edits to exempt paths
  const baseName = path.basename(normalized);
  if (
    baseName === "CLAUDE.md" ||
    normalized.includes("/plans/") ||
    normalized.includes("/.claude/") ||
    normalized.includes("/docs/") ||
    normalized.includes("\\plans\\") ||
    normalized.includes("\\.claude\\") ||
    normalized.includes("\\docs\\")
  ) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Check for branch-specific plan with STATUS: APPROVED
  const planPath = getPlanPath();
  try {
    const content = fs.readFileSync(planPath, "utf8");
    if (content.includes("STATUS: APPROVED")) {
      process.stdout.write(JSON.stringify({ decision: "approve" }));
      return;
    }
  } catch {
    // Plan file doesn't exist for this branch
  }

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: "No approved plan. Create plans/{branch}.md with STATUS: APPROVED first.",
    })
  );
});
