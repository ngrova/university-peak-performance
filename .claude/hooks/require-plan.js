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

// Returns branch name and plan file path
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

// Checks if pushback content is a "None" variant
function isNonePushback(text) {
  return /^\s*(none|n\/a)/i.test(text.trim());
}

// Extracts text between ## Pushback and the next ## heading
function extractPushbackContent(content) {
  const match = content.match(/## Pushback[\s\S]*?\n([\s\S]*?)(?=\n## |$)/);
  return match ? match[1].trim() : "";
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

  const { branch, planPath } = getBranchAndPlan();

  // Branch naming check — nick/ or erin/ prefix required (skip on main)
  if (branch && branch !== "main" && branch !== "master" && !/^(nick|erin)\//.test(branch)) {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "Feature branches must use nick/ or erin/ prefix." })
    );
    return;
  }

  // Multi-gate plan validation
  try {
    const content = fs.readFileSync(planPath, "utf8");

    // Gate 1: ## Pushback section must exist
    if (!content.includes("## Pushback")) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Plan file missing required ## Pushback section." })
      );
      return;
    }

    // Gate 2: If pushback is non-None, require acknowledgment
    const pushbackText = extractPushbackContent(content);
    const pushbackAcked = content.includes("ACKNOWLEDGED") || content.includes("PUSHBACK_ACKNOWLEDGED: YES");
    if (pushbackText && !isNonePushback(pushbackText) && !pushbackAcked) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Pushback declared but not acknowledged — wait for human response." })
      );
      return;
    }

    // Gate 3: Plan review must be completed (new or old marker)
    const reviewPassed = content.includes("RESULT: PASS") || content.includes("COUNCIL_PLAN_REVIEW: PASS");
    if (!reviewPassed) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Plan review not completed — run the 9-agent review before building." })
      );
      return;
    }

    // Gate 4: Human must have confirmed (new or old marker) — NOT completed/locked
    const confirmed = content.includes("STATUS: CONFIRMED") || content.includes("STATUS: APPROVED");
    const locked = /^STATUS: COMPLETED/im.test(content);
    if (confirmed && !locked) {
      process.stdout.write(JSON.stringify({ decision: "approve" }));
      return;
    }
    if (locked) {
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
