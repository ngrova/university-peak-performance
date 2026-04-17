#!/usr/bin/env node
"use strict";

function decide(decision, reason) {
  const result = reason ? { decision, reason } : { decision };
  process.stdout.write(JSON.stringify(result));
}

// Provisioning commands that create or destroy cloud resources.
// These always need human confirmation regardless of context.
const RED_LIST = [
  { pattern: /supabase\s+projects\s+create/i, label: "Supabase project creation" },
  { pattern: /supabase\s+projects\s+delete/i, label: "Supabase project deletion" },
  { pattern: /supabase\s+orgs\s+create/i, label: "Supabase org creation" },
  { pattern: /netlify\s+sites:create/i, label: "Netlify site creation" },
  { pattern: /netlify\s+sites:delete/i, label: "Netlify site deletion" },
  { pattern: /gh\s+repo\s+create/i, label: "GitHub repo creation" },
  { pattern: /gh\s+repo\s+delete/i, label: "GitHub repo deletion" },
  { pattern: /stripe\s+.*--live/i, label: "Stripe live-mode operation" },
];

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    decide("approve");
    return;
  }

  if (data.tool_name !== "Bash") {
    decide("approve");
    return;
  }

  const cmd = (data.tool_input && data.tool_input.command) || "";

  for (const { pattern, label } of RED_LIST) {
    if (pattern.test(cmd)) {
      decide("block",
        `Red-listed operation: ${label}. ` +
        "Present the exact command to Nick as a silver-platter ask and wait for explicit confirmation."
      );
      return;
    }
  }

  decide("approve");
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
