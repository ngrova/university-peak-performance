#!/usr/bin/env node
"use strict";

/**
 * Enforce Plan Review Hook — gates plan approval behind council review.
 *
 * Blocks two things:
 * 1. Writing STATUS: APPROVED unless COUNCIL_PLAN_REVIEW: PASS already exists
 * 2. Writing a COUNCIL_*_REVIEW: PASS marker unless a valid 9-agent table exists
 *
 * Fails CLOSED — parse errors or missing data block the action.
 */

const fs = require("fs");
const path = require("path");

// Counts APPROVED verdicts in a council review section
function countApprovals(content, sectionHeader) {
  const idx = content.indexOf(sectionHeader);
  if (idx === -1) return 0;
  const section = content.slice(idx, idx + 2000);
  const matches = section.match(/\|\s*\d\s*\|[^|]+\|\s*APPROVED\s*\|/g);
  return matches ? matches.length : 0;
}

// Checks if content has any REJECTED verdicts in a section
function hasRejections(content, sectionHeader) {
  const idx = content.indexOf(sectionHeader);
  if (idx === -1) return false;
  const section = content.slice(idx, idx + 2000);
  return /REJECTED/.test(section);
}

// Resolves what the file content will be after the edit
function resolveContent(toolName, toolInput, currentContent) {
  if (toolName === "Write") return toolInput.content || "";
  if (toolName === "MultiEdit") {
    // MultiEdit passes an edits array — apply all sequentially
    let result = currentContent;
    for (const edit of (toolInput.edits || [])) {
      const oldStr = edit.old_string || "";
      const newStr = edit.new_string || "";
      if (oldStr && result.includes(oldStr)) {
        result = result.replace(oldStr, newStr);
      }
    }
    return result;
  }
  if (toolName === "Edit") {
    const oldStr = toolInput.old_string || "";
    const newStr = toolInput.new_string || "";
    if (oldStr && currentContent.includes(oldStr)) {
      return currentContent.replace(oldStr, newStr);
    }
  }
  return currentContent;
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
      JSON.stringify({ decision: "block", reason: "enforce-plan-review: malformed hook input — blocking." })
    );
    return;
  }

  const toolName = data.tool_name;
  if (toolName !== "Write" && toolName !== "Edit" && toolName !== "MultiEdit") {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || "";
  const normalized = filePath.replace(/\\/g, "/");

  // Only enforce on plan files
  if (!normalized.includes("/plans/") && !normalized.includes("\\plans\\")) {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  // Read current file content (may not exist yet)
  let current = "";
  try { current = fs.readFileSync(filePath, "utf8"); } catch { /* new file */ }

  const after = resolveContent(toolName, data.tool_input || {}, current);

  // Gate 1: Block STATUS: APPROVED unless COUNCIL_PLAN_REVIEW: PASS exists
  if (after.includes("STATUS: APPROVED") && !current.includes("STATUS: APPROVED")) {
    if (!after.includes("COUNCIL_PLAN_REVIEW: PASS")) {
      process.stdout.write(JSON.stringify({
        decision: "block",
        reason: "Cannot set STATUS: APPROVED — run the 9-agent plan review first (COUNCIL_PLAN_REVIEW: PASS required).",
      }));
      return;
    }
  }

  // Gate 2: Block COUNCIL_PLAN_REVIEW: PASS unless 9 approvals in plan review table
  if (after.includes("COUNCIL_PLAN_REVIEW: PASS") && !current.includes("COUNCIL_PLAN_REVIEW: PASS")) {
    const header = "Council Plan Review";
    if (countApprovals(after, header) < 9 || hasRejections(after, header)) {
      process.stdout.write(JSON.stringify({
        decision: "block",
        reason: "Cannot write COUNCIL_PLAN_REVIEW: PASS — need 9 APPROVED verdicts with no rejections in the Council Plan Review table.",
      }));
      return;
    }
  }

  // Gate 3: Block COUNCIL_CODE_REVIEW: PASS unless 9 approvals in code review table
  if (after.includes("COUNCIL_CODE_REVIEW: PASS") && !current.includes("COUNCIL_CODE_REVIEW: PASS")) {
    const header = "Council Code Review";
    if (countApprovals(after, header) < 9 || hasRejections(after, header)) {
      process.stdout.write(JSON.stringify({
        decision: "block",
        reason: "Cannot write COUNCIL_CODE_REVIEW: PASS — need 9 APPROVED verdicts with no rejections in the Council Code Review table.",
      }));
      return;
    }
  }

  process.stdout.write(JSON.stringify({ decision: "approve" }));
});
