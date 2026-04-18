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

function getBranchAndPlan() {
  const root = getRepoRoot();
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const slug = branch.replace(/\//g, "-");
    return { branch, planPath: path.join(root, "plans", slug + ".md") };
  } catch {
    return { branch: "", planPath: path.join(root, "plans", "unknown.md") };
  }
}

function extractField(content, fieldName) {
  const regex = new RegExp("^" + fieldName + ":\\s*(.+)$", "m");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
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

  const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || "";
  const normalized = process.platform === "win32"
    ? filePath.replace(/\\/g, "/").toLowerCase()
    : filePath.replace(/\\/g, "/");

  // Exempt paths — these can be edited without a plan
  const baseName = path.basename(normalized);
  const baseLower = baseName.toLowerCase();
  if (
    baseLower === "claude.md" ||
    baseLower === "delegation.md" ||
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

  const { branch, planPath } = getBranchAndPlan();

  // No commits yet (bootstrap) — nothing to gate on
  if (!branch) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Branch naming enforcement — must be nick/ prefix
  if (branch && branch !== "main" && branch !== "master" && !/^nick\//.test(branch)) {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "Feature branches must use nick/ prefix." })
    );
    return;
  }

  try {
    const content = fs.readFileSync(planPath, "utf8");

    // Pre-plan pushback must be declared (not UNDECLARED)
    const preplan = extractField(content, "PUSHBACK-PREPLAN");
    if (!preplan || preplan === "UNDECLARED") {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Pre-plan pushback not declared. Set PUSHBACK-PREPLAN in the plan file before proceeding." })
      );
      return;
    }

    // If pushback concerns were declared, they must be resolved
    if (preplan.startsWith("CONCERNS")) {
      const resolved = extractField(content, "PUSHBACK-RESOLVED");
      if (!resolved || resolved === "N/A") {
        process.stdout.write(
          JSON.stringify({ decision: "block", reason: "Pushback concerns declared but not resolved — wait for Nick's direction." })
        );
        return;
      }
      if (!resolved.includes(branch)) {
        process.stdout.write(
          JSON.stringify({ decision: "block", reason: "PUSHBACK-RESOLVED does not match current branch (" + branch + ")." })
        );
        return;
      }
    }

    // If pushback cleared, verify branch match
    if (preplan.startsWith("CLEAR-") && !preplan.includes(branch)) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "PUSHBACK-PREPLAN clearance is for a different branch. Stale — re-declare for " + branch + "." })
      );
      return;
    }

    // Council plan review must have passed — tied to THIS branch
    const branchMatchedPass = content.includes("RESULT: PASS \u2014 " + branch);
    if (!branchMatchedPass) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Plan review not completed for this branch — run the council review before building." })
      );
      return;
    }

    // Human must have confirmed
    const status = extractField(content, "STATUS");
    if (status && status.startsWith("CONFIRMED")) {
      process.stdout.write(JSON.stringify({ decision: "approve" }));
      return;
    }
    if (status && status.startsWith("COMPLETED")) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Plan is locked (COMPLETED). Create a new plan for the next task." })
      );
      return;
    }
  } catch {
    // Plan file doesn't exist
  }

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: "No confirmed plan. Create plans/{branch}.md and get human approval first.",
    })
  );
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
