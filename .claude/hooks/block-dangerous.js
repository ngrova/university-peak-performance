#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");

function getCurrentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
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

  if (data.tool_name !== "Bash") {
    process.stdout.write(JSON.stringify({ decision: "approve" }));
    return;
  }

  const cmd = (data.tool_input && data.tool_input.command) || "";

  // Block force push to ANY branch (flags must be standalone, not substrings of branch names)
  if (/git\s+push/.test(cmd) && /\s(-f|--force)(\s|$)/.test(cmd)) {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "Force push is blocked on all branches." })
    );
    return;
  }

  // Block git push to main/master (explicit target, bare push, or HEAD while on main)
  if (/git\s+push(\s|$)/.test(cmd)) {
    if (/git\s+push\s+\S+\s+(main|master)(\s|$)/.test(cmd)) {
      process.stdout.write(
        JSON.stringify({ decision: "block", reason: "Pushing directly to main/master is blocked." })
      );
      return;
    }

    const branch = getCurrentBranch();
    const onMain = branch === "main" || branch === "master";

    if (/git\s+push\s*$/.test(cmd.trim())) {
      process.stdout.write(
        JSON.stringify({
          decision: "block",
          reason: "Bare 'git push' is blocked — specify a remote and branch explicitly (not main/master).",
        })
      );
      return;
    }

    if (onMain) {
      if (/git\s+push\s+\S+\s+HEAD(\s|$)/.test(cmd)) {
        process.stdout.write(
          JSON.stringify({ decision: "block", reason: "Pushing HEAD while on main/master is blocked." })
        );
        return;
      }
      if (/git\s+push\s+\S+\s*$/.test(cmd.trim())) {
        process.stdout.write(
          JSON.stringify({ decision: "block", reason: "Pushing while on main/master without an explicit branch is blocked." })
        );
        return;
      }
    }
  }

  // Block checkout/switch to main/master
  if (/git\s+(checkout|switch)\s+(main|master)(\s|$)/.test(cmd)) {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "Switching to main/master is blocked. Work on a feature branch." })
    );
    return;
  }

  // Block rm with dangerous flags (-r, -f, -rf, --recursive, --force)
  const rmMatch = cmd.match(/\brm\s+(.*)/s);
  if (rmMatch) {
    const tokens = rmMatch[1].trim().split(/\s+/);
    const hasDangerousFlag = tokens.some((token) => {
      if (token === "--recursive" || token === "--force") return true;
      if (/^-[a-zA-Z]+$/.test(token) && /[rf]/.test(token)) return true;
      return false;
    });
    if (hasDangerousFlag) {
      process.stdout.write(
        JSON.stringify({
          decision: "block",
          reason: "rm with -r, -f, --recursive, or --force is blocked.",
        })
      );
      return;
    }
  }

  // Block DROP TABLE / DROP DATABASE (case-insensitive)
  if (/drop\s+(table|database)/i.test(cmd)) {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "DROP TABLE/DATABASE is blocked." })
    );
    return;
  }

  process.stdout.write(JSON.stringify({ decision: "approve" }));
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
