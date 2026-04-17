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

function getBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function getPlanPath(root, branch) {
  const slug = branch.replace(/\//g, "-");
  return path.join(root, "plans", slug + ".md");
}

function normalize(p) {
  return p.replace(/\\/g, "/");
}

function isEditToPlanFile(toolInput, planPath) {
  const filePath = (toolInput && (toolInput.file_path || toolInput.path)) || "";
  return normalize(filePath) === normalize(planPath);
}

function extractField(content, fieldName) {
  const regex = new RegExp("^" + fieldName + ":\\s*(.+)$", "m");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function decide(decision, reason) {
  const result = reason ? { decision, reason } : { decision };
  process.stdout.write(JSON.stringify(result));
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    decide("block", "Pushback check failed — could not parse input.");
    return;
  }

  const toolName = data.tool_name;
  const toolInput = data.tool_input || {};

  const branch = getBranch();
  if (!branch || branch === "main" || branch === "master") {
    decide("approve");
    return;
  }

  const root = getRepoRoot();
  const planPath = getPlanPath(root, branch);

  // No plan file yet — allow (require-plan.js handles plan existence)
  if (!fs.existsSync(planPath)) {
    decide("approve");
    return;
  }

  // Always allow edits to the plan file itself (so declarations can be made)
  if (toolName === "Write" || toolName === "Edit" || toolName === "MultiEdit") {
    if (isEditToPlanFile(toolInput, planPath)) {
      decide("approve");
      return;
    }
  }

  const content = fs.readFileSync(planPath, "utf8");
  const preplan = extractField(content, "PUSHBACK-PREPLAN");
  const postbuild = extractField(content, "PUSHBACK-POSTBUILD");
  const humanStatus = extractField(content, "STATUS");

  // --- Checkpoint 1: Pre-plan pushback ---
  // Active from plan creation until planning is done (human approval granted)
  if (preplan === "UNDECLARED") {
    decide("block", "Pre-plan pushback not declared. Read the plan template instructions and set PUSHBACK-PREPLAN before proceeding.");
    return;
  }

  if (preplan && preplan.startsWith("CONCERNS")) {
    // Check if pushback has been resolved
    const resolved = extractField(content, "PUSHBACK-RESOLVED");
    if (!resolved || resolved === "N/A" || resolved === "UNDECLARED") {
      decide("block", "Pre-plan pushback concerns declared but not resolved. Surface concerns to Nick and wait for his direction.");
      return;
    }
    // Resolved — verify branch match
    if (!resolved.includes(branch)) {
      decide("block", "PUSHBACK-RESOLVED suffix does not match current branch (" + branch + "). Stale resolution from another branch.");
      return;
    }
  }

  if (preplan && preplan.startsWith("CLEAR-")) {
    // Verify branch match
    if (!preplan.includes(branch)) {
      decide("block", "PUSHBACK-PREPLAN suffix does not match current branch (" + branch + "). Stale clearance from another branch.");
      return;
    }
  }

  // --- Checkpoint 2: Post-build pushback ---
  // Only active after human approval (STATUS: CONFIRMED means build has started)
  if (humanStatus && humanStatus.startsWith("CONFIRMED")) {
    // Check if we're past the build phase — council code review is the gate
    const codeReviewResult = content.match(/## COUNCIL CODE REVIEW[\s\S]*?RESULT:\s*(.+)/m);
    const codeReviewStatus = codeReviewResult ? codeReviewResult[1].trim() : "PENDING";

    // Post-build pushback must be declared before code review can proceed
    if (postbuild === "UNDECLARED") {
      // Allow code edits (still building) but block council-related operations
      // The actual enforcement is: code review cannot be set to PASS while this is UNDECLARED
      // For now, we don't block during build — the council code review section
      // in the plan template instructions enforce this sequencing
      decide("approve");
      return;
    }

    if (postbuild && postbuild.startsWith("CONCERNS")) {
      decide("block", "Post-build pushback concerns declared. Surface concerns to Nick and wait for his direction before code review.");
      return;
    }

    if (postbuild && postbuild.startsWith("CLEAR-")) {
      // Verify it references the current branch or a PR number (not a stale one)
      // PR numbers are unique so we just check it's not "UNDECLARED"
      // Branch-based clears must match
      if (postbuild.startsWith("CLEAR-PR-") || postbuild.includes(branch)) {
        decide("approve");
        return;
      }
      decide("block", "PUSHBACK-POSTBUILD suffix does not match current branch or PR. Stale clearance from another branch.");
      return;
    }
  }

  decide("approve");
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
