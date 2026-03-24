#!/bin/bash
set -euo pipefail

# Post-PR automation: enables auto-merge, watches CI, polls until merged.
# Usage: bash scripts/pr-watch.sh <PR_NUMBER>

PR="$1"

if [ -z "$PR" ]; then
  echo "Usage: bash scripts/pr-watch.sh <PR_NUMBER>"
  exit 1
fi

# Validate PR exists
if ! gh pr view "$PR" --json number >/dev/null 2>&1; then
  echo "ERROR: PR #${PR} not found."
  exit 1
fi

BRANCH=$(gh pr view "$PR" --json headRefName --jq '.headRefName')
echo "=== PR #${PR} on branch ${BRANCH} ==="

# Step 1: Enable auto-merge (squash)
echo "Enabling auto-merge (squash)..."
gh pr merge "$PR" --auto --squash
echo "Auto-merge enabled."

# Step 2: Get CI run and print link
RUN_URL=$(gh run list --branch "$BRANCH" --limit 1 --json url --jq '.[0].url')
RUN_ID=$(gh run list --branch "$BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId')
echo "CI run: ${RUN_URL}"

# Step 3: Watch CI until it finishes
echo "Watching CI..."
if gh run watch "$RUN_ID" --exit-status; then
  echo "CI passed."
else
  echo "ERROR: CI failed. Check: ${RUN_URL}"
  exit 1
fi

# Step 4: Poll until PR is merged (auto-merge may take a moment)
echo "Waiting for merge..."
for i in $(seq 1 30); do
  STATE=$(gh pr view "$PR" --json state --jq '.state')
  if [ "$STATE" = "MERGED" ]; then
    echo ""
    echo "PR #${PR} merged and deployed. Ready for testing."
    exit 0
  fi
  sleep 2
done

echo "WARNING: PR #${PR} not yet merged after 60s. State: ${STATE}"
echo "Check: https://github.com/ngrova/university-peak-performance/pull/${PR}"
exit 1
