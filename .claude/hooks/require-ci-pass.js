#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");

function decide(decision, reason) {
  const result = reason ? { decision, reason } : { decision };
  process.stdout.write(JSON.stringify(result));
}

function extractPrNumber(cmd) {
  const match = cmd.match(/gh\s+pr\s+merge\s+(\d+)/);
  return match ? match[1] : null;
}

function isMergeCommand(cmd) {
  return /gh\s+pr\s+merge/.test(cmd);
}

function hasAutoFlag(cmd) {
  return /--auto/.test(cmd);
}

function getCheckStatuses(prNumber) {
  const raw = execSync(
    `gh pr checks ${prNumber} --json name,state`,
    { encoding: "utf8", timeout: 30000 }
  );
  return JSON.parse(raw);
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    decide("block", "CI check failed — could not parse input.");
    return;
  }

  if (data.tool_name !== "Bash") {
    decide("approve");
    return;
  }

  const cmd = (data.tool_input && data.tool_input.command) || "";

  if (!isMergeCommand(cmd)) {
    decide("approve");
    return;
  }

  if (hasAutoFlag(cmd)) {
    decide("approve");
    return;
  }

  const prNumber = extractPrNumber(cmd);
  if (!prNumber) {
    decide("block", "CI gate: could not extract PR number from merge command.");
    return;
  }

  let checks;
  try {
    checks = getCheckStatuses(prNumber);
  } catch {
    decide("block", "CI gate: could not query PR checks. Verify CI status manually.");
    return;
  }

  if (!Array.isArray(checks) || checks.length === 0) {
    decide("block", "CI gate: no checks found for PR #" + prNumber + ". Wait for CI to start.");
    return;
  }

  const passing = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
  const failing = checks.filter((c) => !passing.has(c.state));
  if (failing.length === 0) {
    decide("approve");
    return;
  }

  const summary = failing.map((c) => c.name + ": " + c.state).join(", ");
  decide("block", "CI gate: PR #" + prNumber + " has failing checks — " + summary);
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
