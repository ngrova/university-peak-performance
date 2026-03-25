#!/usr/bin/env node
// Runs the 9-agent code review council via the Anthropic Messages API.
// Reads diff and plan from files, calls all 9 agents in parallel, outputs JSON results.
// Exit 0 = all approved, exit 1 = any rejected or error. Fail closed.

const fs = require("fs");
const path = require("path");

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error(JSON.stringify({ approved: false, results: [{ name: "setup", verdict: "REJECTED", reason: "ANTHROPIC_API_KEY not set" }] }));
  process.exit(1);
}

// Reads the diff and plan files from environment variables
function readInputs() {
  const diffFile = process.env.DIFF_FILE || "";
  const planFile = process.env.PLAN_FILE || "";
  const diff = diffFile ? fs.readFileSync(diffFile, "utf8") : "";
  const plan = planFile && fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf8") : "(no plan file found)";
  return { diff: diff.slice(0, 50000), plan: plan.slice(0, 10000) };
}

// Loads all 9 agent prompts from .claude/review-agents/
function loadAgents() {
  const dir = path.join(process.cwd(), ".claude", "review-agents");
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => ({
    name: f.replace(/^agent-\d+-/, "").replace(".md", ""),
    prompt: fs.readFileSync(path.join(dir, f), "utf8"),
  }));
}

// Calls the Anthropic API for a single agent review
async function reviewAgent(agent, diff, plan) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: `${agent.prompt}\n\nPLAN:\n${plan}\n\nCODE DIFF:\n${diff}` }],
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    return { name: agent.name, verdict: "REJECTED", reason: `API error ${res.status}: ${err.slice(0, 200)}` };
  }

  const data = await res.json();
  const text = (data.content && data.content[0] && data.content[0].text) || "";
  const isRejected = /REJECTED/i.test(text);
  const isWarn = !isRejected && /WARN/i.test(text);
  const isApproved = !isRejected && (/APPROVED/i.test(text) || /EXEMPT/i.test(text));
  const verdict = isRejected ? "REJECTED" : isWarn ? "WARN" : isApproved ? "APPROVED" : "REJECTED";
  return { name: agent.name, verdict, reason: text.slice(0, 500) };
}

// Runs agents sequentially with delay to stay under 5 req/min rate limit
async function runSequentially(agents, diff, plan) {
  const results = [];
  for (let i = 0; i < agents.length; i++) {
    results.push(await reviewAgent(agents[i], diff, plan));
    if (i < agents.length - 1) await new Promise((r) => setTimeout(r, 13000));
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
  const approved = results.every((r) => r.verdict === "APPROVED" || r.verdict === "WARN");

  process.stdout.write(JSON.stringify({ approved, results }));
  process.exit(approved ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ approved: false, results: [{ name: "runner", verdict: "REJECTED", reason: err.message }] }));
  process.exit(1);
});
