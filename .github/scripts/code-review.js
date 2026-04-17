#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { reviewAgent, readInputs } = require("./code-review-helpers");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PAYLOAD_SIZE_LIMIT = 450000; // ~112k tokens, 75% of Sonnet's 200k context window

// Glass Office: ledger version — bump when the ledger schema changes
const LEDGER_VERSION = "2.0";

if (!API_KEY) {
  console.error(JSON.stringify({ approved: false, results: [{ name: "setup", verdict: "FAIL", reason: "ANTHROPIC_API_KEY not set" }] }));
  process.exit(1);
}

function loadAgents() {
  const dir = path.join(process.cwd(), ".claude", "review-agents");
  const sharedRules = fs.readFileSync(path.join(dir, "shared-rules.md"), "utf8");
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "shared-rules.md")
    .sort()
    .map((f) => ({
      name: f.replace(/^agent-\d+-/, "").replace(".md", ""),
      prompt: sharedRules + "\n\n---\n\n" + fs.readFileSync(path.join(dir, f), "utf8"),
    }));
}

// Extract process feedback from agent response text.
// Agents may include a PROCESS FEEDBACK section after the verdict.
function extractProcessFeedback(responseText) {
  const match = responseText.match(/PROCESS FEEDBACK[:\s]*\n([\s\S]*?)$/i);
  if (!match) return "";
  const feedback = match[1].trim();
  if (/^none\.?$/i.test(feedback) || feedback.length < 5) return "";
  return feedback;
}

async function runParallel(agents, diff, plan, catalog, codebaseScan, fullFiles, contextManifest) {
  return Promise.all(
    agents.map((agent) =>
      reviewAgent(agent, diff, plan, catalog, codebaseScan, fullFiles, API_KEY, contextManifest)
    )
  );
}

async function main() {
  const { diff, plan, catalog, codebaseScan, fullFiles, contextManifest, ledgerContext } = readInputs();
  const agents = loadAgents();
  if (agents.length === 0) {
    console.error("No agent prompt files found in .claude/review-agents/");
    process.exit(1);
  }

  // Payload size check — fail fast if PR is too large for reliable review
  const samplePayload = `${agents[0].prompt}\n\n${contextManifest}\n\nPLAN:\n${plan}\n\nCODE DIFF:\n${diff}\n\n${catalog}\n\n${codebaseScan}\n\n${fullFiles}`;
  if (samplePayload.length > PAYLOAD_SIZE_LIMIT) {
    const result = {
      approved: false,
      results: [{
        name: "payload-check",
        verdict: "FAIL",
        reason: `PR too large for reliable review. Assembled payload is ${samplePayload.length} chars (${Math.round(samplePayload.length / 4)} est. tokens), exceeding the ${PAYLOAD_SIZE_LIMIT} char limit (75% of model context window). Split into smaller PRs.`,
      }],
    };
    process.stdout.write(JSON.stringify(result));
    process.exit(1);
  }

  const councilStartedAt = new Date().toISOString();
  const results = await runParallel(agents, diff, plan, catalog, codebaseScan, fullFiles, contextManifest);
  const councilCompletedAt = new Date().toISOString();

  // Extract process feedback from each agent
  for (const r of results) {
    r.processFeedback = extractProcessFeedback(r.responseText || r.reason || "");
  }

  const PASS_VERDICTS = ["PASS", "EXEMPT"];
  const approved = results.every((r) => PASS_VERDICTS.includes(r.verdict));

  // Glass Office: assemble the council ledger
  const verdictCounts = {};
  for (const r of results) {
    verdictCounts[r.verdict] = (verdictCounts[r.verdict] || 0) + 1;
  }

  const ledger = {
    version: LEDGER_VERSION,
    generatedAt: new Date().toISOString(),
    model: process.env.COUNCIL_MODEL || "claude-sonnet-4-20250514",
    pr: {
      number: parseInt(process.env.PR_NUMBER || "0", 10),
      branch: process.env.PR_BRANCH || "",
      commit: process.env.PR_COMMIT || "",
      repo: process.env.GITHUB_REPOSITORY || "",
    },
    timing: {
      startedAt: councilStartedAt,
      completedAt: councilCompletedAt,
      totalDurationMs: new Date(councilCompletedAt) - new Date(councilStartedAt),
    },
    context: ledgerContext,
    agents: results.map((r) => ({
      name: r.name,
      verdict: r.verdict,
      responseText: r.responseText || r.reason || "",
      processFeedback: r.processFeedback || "",
      startedAt: r.startedAt || null,
      completedAt: r.completedAt || null,
      durationMs: r.durationMs || null,
      promptChars: r.promptChars || null,
      apiUsage: r.apiUsage || null,
    })),
    outcome: {
      approved,
      verdicts: verdictCounts,
    },
  };

  fs.writeFileSync("/tmp/council-ledger.json", JSON.stringify(ledger, null, 2));
  console.error(`[Glass Office] Council ledger written: ${JSON.stringify(ledger, null, 2).length} chars`);

  process.stdout.write(JSON.stringify({ approved, results }));
  process.exit(approved ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ approved: false, results: [{ name: "runner", verdict: "FAIL", reason: err.message }] }));
  process.exit(1);
});
