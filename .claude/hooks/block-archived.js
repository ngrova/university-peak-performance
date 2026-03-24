#!/usr/bin/env node
"use strict";

/**
 * Block Archived App Hook — prevents edits to the archived desktop app.
 * Fails CLOSED on parse errors.
 */

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: "block-archived: malformed hook input — blocking." })
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

  if (normalized.includes("_archived-thriving-desktop")) {
    process.stdout.write(JSON.stringify({
      decision: "block",
      reason: "The desktop app is ARCHIVED. Do not modify files under apps/_archived-thriving-desktop/. The active app is apps/thriving-mobile/.",
    }));
    return;
  }

  process.stdout.write(JSON.stringify({ decision: "approve" }));
});
