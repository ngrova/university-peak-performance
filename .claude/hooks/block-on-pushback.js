#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Returns the git repo root directory
function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
}

// Returns the current git branch name, or null on failure
function getBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

// Builds the pushback file path from branch name
function getPushbackPath(root, branch) {
  const slug = branch.replace(/\//g, "-");
  return path.join(root, "plans", "PUSHBACK-" + slug + ".md");
}

// Normalizes a file path to forward slashes for comparison
function normalize(p) {
  return p.replace(/\\/g, "/");
}

// Checks if a Write/Edit/MultiEdit targets the pushback file
function isWriteToPushbackFile(toolInput, pushbackPath) {
  const filePath = (toolInput && (toolInput.file_path || toolInput.path)) || "";
  return normalize(filePath) === normalize(pushbackPath);
}

// Checks if a Bash command is a bare rm of the pushback file only
function isBashDeleteOfPushbackFile(command, pushbackPath, slug) {
  const cmd = (command || "").trim();
  // Reject compound commands
  if (/[|&;>]/.test(cmd)) return false;
  // Must start with rm (no flags allowed)
  const match = cmd.match(/^rm\s+(.+)$/);
  if (!match) return false;
  const target = match[1].trim();
  // Reject if target has flags
  if (target.startsWith("-")) return false;
  const normalizedTarget = normalize(target).replace(/^\.\//, "");
  const expectedRelative = "plans/PUSHBACK-" + slug + ".md";
  return normalizedTarget === expectedRelative || normalizedTarget === normalize(pushbackPath);
}

// Outputs a decision and exits
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

  // Get branch — fail closed if detection fails
  const branch = getBranch();
  if (!branch) {
    decide("block", "Pushback check failed — could not determine branch.");
    return;
  }

  const root = getRepoRoot();
  const slug = branch.replace(/\//g, "-");
  const pushbackPath = getPushbackPath(root, branch);

  // No pushback file → allow everything
  if (!fs.existsSync(pushbackPath)) {
    decide("approve");
    return;
  }

  // Pushback file exists — check bootstrap exemption
  if (toolName === "Write" || toolName === "Edit" || toolName === "MultiEdit") {
    if (isWriteToPushbackFile(toolInput, pushbackPath)) {
      decide("approve");
      return;
    }
  }

  if (toolName === "Bash") {
    if (isBashDeleteOfPushbackFile(toolInput.command, pushbackPath, slug)) {
      decide("approve");
      return;
    }
  }

  // Block everything else
  decide("block", "Pushback pending. Read plans/PUSHBACK-" + slug + ".md and resolve before proceeding.");
});
