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

// Every block MUST go through refuseBash so every reason telegraphs hook-layer
// refusal semantics: the ENTIRE Bash call was rejected — no commands in a
// chain (`A && B && C`) ran. Without this prefix, CC tends to misread
// subcommand-scoped messages as partial execution ("A and B ran, C failed").
// When adding a new block, call refuseBash(...) — do not hand-roll a block
// response with inline JSON.stringify.
function refuseBash(reason) {
  return JSON.stringify({
    decision: "block",
    reason: "Entire Bash call refused (nothing in the chain ran) — " + reason,
  });
}

// Heredoc bodies are *data*, not commands — never scan them for danger patterns.
// Without this, writing a retrospective via `cat > retro.md <<'EOF' ... EOF` fires
// danger blocks whenever the retro prose mentions a blocked command (e.g. a retro
// ABOUT `git switch main` being blocked will itself be blocked from being written).
// When another embedded-text form surfaces in a retrospective (python -c, here-string,
// etc.), extend this helper — do not bolt per-pattern escapes onto individual blocks.
function stripHeredocs(cmd) {
  return cmd.replace(
    /<<-?\s*(['"]?)(\w+)\1[\s\S]*?\n\s*\2(?=\s|$)/g,
    "<<HEREDOC_STRIPPED"
  );
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
  // All pattern checks run against `scan`, not `cmd`, so heredoc bodies never false-positive.
  const scan = stripHeredocs(cmd);

  // Block force push to ANY branch (flags must be standalone, not substrings of branch names)
  if (/git\s+push/.test(scan) && /\s(-f|--force)(\s|$)/.test(scan)) {
    process.stdout.write(refuseBash("force push is blocked on all branches."));
    return;
  }

  // Block git push to main/master (explicit target, bare push, or HEAD while on main)
  if (/git\s+push(\s|$)/.test(scan)) {
    if (/git\s+push\s+\S+\s+(main|master)(\s|$)/.test(scan)) {
      process.stdout.write(refuseBash("pushing directly to main/master is blocked."));
      return;
    }

    const branch = getCurrentBranch();
    const onMain = branch === "main" || branch === "master";

    if (/git\s+push\s*$/.test(scan.trim())) {
      process.stdout.write(refuseBash("bare 'git push' is blocked — specify a remote and branch explicitly (not main/master)."));
      return;
    }

    if (onMain) {
      if (/git\s+push\s+\S+\s+HEAD(\s|$)/.test(scan)) {
        process.stdout.write(refuseBash("pushing HEAD while on main/master is blocked."));
        return;
      }
      if (/git\s+push\s+\S+\s*$/.test(scan.trim())) {
        process.stdout.write(refuseBash("pushing while on main/master without an explicit branch is blocked."));
        return;
      }
    }
  }

  // Block checkout/switch to main/master
  if (/git\s+(checkout|switch)\s+(main|master)(\s|$)/.test(scan)) {
    process.stdout.write(refuseBash("switching to main/master is blocked. Work on a feature branch."));
    return;
  }

  // Block rm with dangerous flags (-r, -f, -rf, --recursive, --force)
  const rmMatch = scan.match(/\brm\s+(.*)/s);
  if (rmMatch) {
    const tokens = rmMatch[1].trim().split(/\s+/);
    const hasDangerousFlag = tokens.some((token) => {
      if (token === "--recursive" || token === "--force") return true;
      if (/^-[a-zA-Z]+$/.test(token) && /[rf]/.test(token)) return true;
      return false;
    });
    if (hasDangerousFlag) {
      process.stdout.write(refuseBash("rm with -r, -f, --recursive, or --force is blocked."));
      return;
    }
  }

  // Block DROP TABLE / DROP DATABASE (case-insensitive)
  if (/drop\s+(table|database)/i.test(scan)) {
    process.stdout.write(refuseBash("DROP TABLE/DATABASE is blocked."));
    return;
  }

  process.stdout.write(JSON.stringify({ decision: "approve" }));
});
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
