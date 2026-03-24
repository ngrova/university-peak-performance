#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Outputs a decision and exits
function decide(decision, reason) {
  const result = reason ? { decision, reason } : { decision };
  process.stdout.write(JSON.stringify(result));
}

// Protected infrastructure paths
const PROTECTED = [
  "/.claude/hooks/", "/.claude/settings.json", "/.claude/rules/",
  "/.claude/pipeline/", "/.claude/skills/",
];

// Checks if a normalized path is in a protected directory
function isProtected(normalized) {
  return PROTECTED.some((p) => normalized.includes(p));
}

// Reads the plan file and checks for PIPELINE-INFRA type + APPROVED
function isPipelineInfraPlan() {
  try {
    const root = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const slug = branch.replace(/\//g, "-");
    const planPath = path.join(root, "plans", slug + ".md");
    const content = fs.readFileSync(planPath, "utf8");
    return content.includes("TYPE") && /PIPELINE-INFRA/i.test(content) && content.includes("STATUS: APPROVED");
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
  const normalized = filePath.replace(/\\/g, "/");

  if (!isProtected(normalized)) {
    decide("approve");
    return;
  }

  // Protected path — require PIPELINE-INFRA plan
  if (isPipelineInfraPlan()) {
    decide("approve");
    return;
  }

  decide("block", "Infrastructure edits require a PIPELINE-INFRA plan approved by the human. Create a plan with TYPE: PIPELINE-INFRA first.");
});
