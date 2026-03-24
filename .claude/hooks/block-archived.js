#!/usr/bin/env node
"use strict";

// Blocks Write/Edit operations to the archived desktop app directory.
// The desktop app is preserved for reference but must not be modified.

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
    decide("block", "Archived app check failed — could not parse input.");
    return;
  }

  const toolName = data.tool_name;
  if (toolName !== "Write" && toolName !== "Edit" && toolName !== "MultiEdit") {
    decide("approve");
    return;
  }

  const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || "";
  const normalized = filePath.replace(/\\/g, "/");

  // Block any edit to the archived desktop app
  if (
    normalized.includes("/_archived-thriving-desktop/") ||
    normalized.includes("\\_archived-thriving-desktop\\")
  ) {
    decide("block", "Edits to apps/_archived-thriving-desktop/ are blocked. That app is archived — work in apps/thriving-mobile/ instead.");
    return;
  }

  decide("approve");
});
