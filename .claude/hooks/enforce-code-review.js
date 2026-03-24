#!/usr/bin/env node
"use strict";

/**
 * Enforce Code Review Hook — gates push/PR behind council code review.
 *
 * Blocks `git push` and `gh pr create` unless the branch plan file
 * contains COUNCIL_CODE_REVIEW: PASS.
 *
 * Fails CLOSED — parse errors or missing plan file block the action.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Gets the repo root for the current worktree
function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

// Derives plan file path from current branch name
function getPlanPath() {
  const root = getRepoRoot();
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const slug = branch.replace(/\//g, "-");
    return path.join(root, "plans", slug + ".md");
  } catch {
    return null;
  }
}

// Reads plan file and checks for the code review marker
function hasCodeReviewPass() {
  const planPath = getPlanPath();
  if (!planPath) return false;
  try {
    const content = fs.readFileSync(planPath, "utf8");
    return content.includes("COUNCIL_CODE_REVIEW: PASS");
  } catch {
    return false;
  }
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    // Fail CLOSED — broken input blocks the action
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "enforce-code-review: malformed hook input — blocking." })
    );
    return;
  }

  if (data.tool_name !== "Bash") {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  const cmd = (data.tool_input && data.tool_input.command) || "";

  // Only gate push and PR creation commands
  const isPush = /git\s+push/.test(cmd);
  const isPrCreate = /gh\s+pr\s+create/.test(cmd);
  if (!isPush && !isPrCreate) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Allow pushes that only set upstream without code (empty branch tracking)
  // But gate all substantive pushes
  if (hasCodeReviewPass()) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  const action = isPush ? "git push" : "gh pr create";
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: `Cannot ${action} — run the 9-agent code review first (COUNCIL_CODE_REVIEW: PASS required in plan file).`,
  }));
});
