#!/usr/bin/env node
// Runs the Code Review Council via the Anthropic Messages API.
// Loads agent prompts from .claude/review-agents/, runs them sequentially, outputs JSON results.
// Exit 0 = all approved, exit 1 = any rejected or error. Fail closed.

const fs = require("fs");
const path = require("path");
const { reviewAgent, readInputs } = require("./code-review-helpers");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const AGENT_DELAY_MS = 60000;

if (!API_KEY) {
  console.error(JSON.stringify({ approved: false, results: [{ name: "setup", verdict: "REJECTED", reason: "ANTHROPIC_API_KEY not set" }] }));
  process.exit(1);
}

// Loads all agent prompts from .claude/review-agents/
function loadAgents() {
  const dir = path.join(process.cwd(), ".claude", "review-agents");
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => ({
    name: f.replace(/^agent-\d+-/, "").replace(".md", ""),
    prompt: fs.readFileSync(path.join(dir, f), "utf8"),
  }));
}

// Runs agents sequentially with delay to stay under API rate limits
async function runSequentially(agents, diff, plan) {
  const results = [];
  for (let i = 0; i < agents.length; i++) {
    results.push(await reviewAgent(agents[i], diff, plan, API_KEY));
    if (i < agents.length - 1) await new Promise((r) => setTimeout(r, AGENT_DELAY_MS));
  }
  return results;
}

// Main: run agents sequentially, output results
async function main() {
  const { diff, plan } = readInputs();
  const agents = loadAgents();
  if (agents.length === 0) {
    console.error("No agent prompt files found in .claude/review-agents/");
    process.exit(1);
  }
  const results = await runSequentially(agents, diff, plan);
  const PASS_VERDICTS = ["APPROVED", "WARN", "EXEMPT"];
  const approved = results.every((r) => PASS_VERDICTS.includes(r.verdict));
  process.stdout.write(JSON.stringify({ approved, results }));
  process.exit(approved ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ approved: false, results: [{ name: "runner", verdict: "REJECTED", reason: err.message }] }));
  process.exit(1);
});
