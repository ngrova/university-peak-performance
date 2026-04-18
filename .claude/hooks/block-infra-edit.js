#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function decide(decision, reason) {
  const result = reason ? { decision, reason } : { decision };
  process.stdout.write(JSON.stringify(result));
}

const PROTECTED = [
  "/.claude/hooks/",
  "/.claude/settings.json",
  "/.claude/rules/",
  "/.claude/skills/",
  "/.claude/scripts/",
  "/.claude/review-agents/",
  "/.github/",
  "/DELEGATION.md",
];

function isProtected(normalized) {
  return PROTECTED.some((p) => normalized.includes(p));
}

function isPipelineInfraPlan() {
  try {
    const root = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const slug = branch.replace(/\//g, "-");
    const planPath = path.join(root, "plans", slug + ".md");
    const content = fs.readFileSync(planPath, "utf8");
    return content.includes("TYPE") && /PIPELINE-INFRA/i.test(content) && (content.includes("STATUS: CONFIRMED") || content.includes("STATUS: APPROVED"));
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
    decide("block", "Infrastructure check failed — could not parse input.");
    return;
  }

  const toolName = data.tool_name;
  if (toolName !== "Write" && toolName !== "Edit" && toolName !== "MultiEdit") {
    decide("approve");
    return;
  }

  const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || "";
  const normalized = process.platform === "win32"
    ? filePath.replace(/\\/g, "/").toLowerCase()
    : filePath.replace(/\\/g, "/");

  if (!isProtected(normalized)) {
    decide("approve");
    return;
  }

  // No commits yet (bootstrap) — pipeline files don't exist yet, let the install through
  let hasHead = false;
  try {
    execSync("git rev-parse --verify HEAD", { encoding: "utf8", stdio: "pipe" });
    hasHead = true;
  } catch {}
  if (!hasHead) {
    decide("approve");
    return;
  }

  if (isPipelineInfraPlan()) {
    decide("approve");
    return;
  }

  decide("block", "Infrastructure edits require a PIPELINE-INFRA plan approved by the human. Create a plan with TYPE: PIPELINE-INFRA first.");
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
