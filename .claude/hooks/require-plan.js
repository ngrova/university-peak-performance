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
    baseName === "PLAN.md" ||
    baseName === "CLAUDE.md" ||
    normalized.includes("/.claude/") ||
    normalized.includes("/docs/") ||
    // Windows-style paths
    normalized.includes("\\.claude\\") ||
    normalized.includes("\\docs\\")
  ) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Check for PLAN.md with STATUS: APPROVED
  const planPath = path.join(getRepoRoot(), "PLAN.md");
  try {
    const content = fs.readFileSync(planPath, "utf8");
    if (content.includes("STATUS: APPROVED")) {
      process.stdout.write(JSON.stringify({ decision: "approve" }));
      return;
    }
  } catch {
    // File doesn't exist
  }

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: "No approved plan. Create PLAN.md with STATUS: APPROVED first.",
    })
  );
});
