#!/bin/bash
# Pipeline verification script — run after setup or update.
# Exits 0 if all checks pass, 1 if any fail.

FAIL=0
PASS_COUNT=0
FAIL_COUNT=0

check() {
  local description="$1"
  local condition="$2"
  if eval "$condition"; then
    echo "  ✅ $description"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  ❌ $description"
    FAIL=1
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo ""
echo "Pipeline Verification"
echo "====================="
echo ""

# --- Hooks ---
echo "Hooks:"
check "block-dangerous.js exists" "[ -f .claude/hooks/block-dangerous.js ]"
check "block-infra-edit.js exists" "[ -f .claude/hooks/block-infra-edit.js ]"
check "block-on-pushback.js exists" "[ -f .claude/hooks/block-on-pushback.js ]"
check "block-redlisted-ops.js exists" "[ -f .claude/hooks/block-redlisted-ops.js ]"
check "manager-stop.js exists" "[ -f .claude/hooks/manager-stop.js ]"
check "require-ci-pass.js exists" "[ -f .claude/hooks/require-ci-pass.js ]"
check "require-plan.js exists" "[ -f .claude/hooks/require-plan.js ]"

# --- Hook wiring in settings.json ---
echo ""
echo "Hook Wiring (settings.json):"
check "settings.json exists" "[ -f .claude/settings.json ]"
check "wires block-dangerous" "grep -q 'block-dangerous' .claude/settings.json"
check "wires block-infra-edit" "grep -q 'block-infra-edit' .claude/settings.json"
check "wires block-on-pushback" "grep -q 'block-on-pushback' .claude/settings.json"
check "wires block-redlisted-ops" "grep -q 'block-redlisted-ops' .claude/settings.json"
check "wires manager-stop" "grep -q 'manager-stop' .claude/settings.json"
check "wires require-ci-pass" "grep -q 'require-ci-pass' .claude/settings.json"
check "wires require-plan" "grep -q 'require-plan' .claude/settings.json"
check "SessionStart hook wired" "grep -q 'SessionStart' .claude/settings.json"
check "SessionStart reads DELEGATION.md" "grep -q 'DELEGATION.md' .claude/settings.json"

# --- Review Agents ---
echo ""
echo "Review Agents:"
check "shared-rules exists" "[ -f .claude/review-agents/shared-rules.md ]"
check "agent-1 (security-data-integrity) exists" "[ -f .claude/review-agents/agent-1-security-data-integrity.md ]"
check "agent-2 (code-quality-standards) exists" "[ -f .claude/review-agents/agent-2-code-quality-standards.md ]"
check "agent-3 (integration-correctness) exists" "[ -f .claude/review-agents/agent-3-integration-correctness.md ]"
check "agent-4 (plan-fidelity) exists" "[ -f .claude/review-agents/agent-4-plan-fidelity.md ]"
check "agent-5 (error-handling) exists" "[ -f .claude/review-agents/agent-5-error-handling.md ]"
check "agent-6 (test-coverage) exists" "[ -f .claude/review-agents/agent-6-test-coverage.md ]"
check "agent-7 (design-consistency) exists" "[ -f .claude/review-agents/agent-7-design-consistency.md ]"

# --- Rules ---
echo ""
echo "Rules:"
check "coding-standards.md exists" "[ -f .claude/rules/coding-standards.md ]"
check "workflow.md exists" "[ -f .claude/rules/workflow.md ]"

# --- Core Config ---
echo ""
echo "Core Config:"
check "CLAUDE.md exists" "[ -f CLAUDE.md ]"
check "DELEGATION.md exists" "[ -f DELEGATION.md ]"
check "project.yml exists" "[ -f project.yml ]"
check "turbo.json exists" "[ -f turbo.json ]"
check "netlify.toml exists" "[ -f netlify.toml ]"
check "apps/thriving-mobile exists" "[ -d apps/thriving-mobile ]"
check "verify-pipeline.sh is executable" "[ -x .claude/scripts/verify-pipeline.sh ]"
check "pre-review-scan.js exists" "[ -f .claude/scripts/pre-review-scan.js ]"
check "scripts/check-dead-code.js exists" "[ -f scripts/check-dead-code.js ]"

# --- GitHub Actions ---
echo ""
echo "GitHub Actions:"
check "council.yml exists" "[ -f .github/workflows/council.yml ]"
check "code-review.js exists" "[ -f .github/scripts/code-review.js ]"
check "code-review-helpers.js exists" "[ -f .github/scripts/code-review-helpers.js ]"
check "helpers reads catalog files" "grep -q 'CATALOG_FILES\|readCatalog' .github/scripts/code-review-helpers.js"
check "helpers exports ledgerContext" "grep -q 'ledgerContext' .github/scripts/code-review-helpers.js"
check "code-review.js writes council ledger" "grep -q 'council-ledger.json' .github/scripts/code-review.js"
check "council.yml uploads council ledger" "grep -q 'upload-artifact' .github/workflows/council.yml"

# --- CI Pipeline ---
echo ""
echo "CI Pipeline:"
check "ci.yml exists" "[ -f .github/workflows/ci.yml ]"
check "dependabot.yml exists" "[ -f .github/dependabot.yml ]"
check ".nvmrc exists" "[ -f .nvmrc ]"
check "ci.yml has Secret Scan job" "grep -q 'name: Secret Scan' .github/workflows/ci.yml"
check "ci.yml has Dependency Audit job" "grep -q 'name: Dependency Audit' .github/workflows/ci.yml"
check "ci.yml has Dead Code Check job" "grep -q 'name: Dead Code Check' .github/workflows/ci.yml"
check "ci.yml has Lint job" "grep -q 'name: Lint' .github/workflows/ci.yml"
check "ci.yml has Type Check job" "grep -q 'name: Type Check' .github/workflows/ci.yml"
check "ci.yml has Build job" "grep -q 'name: Build' .github/workflows/ci.yml"

# E2E job is a template-level conditional — may be absent for projects without Playwright
if grep -q 'name: E2E Tests' .github/workflows/ci.yml 2>/dev/null; then
  check "ci.yml E2E Tests job has test results verification" "grep -q 'Verify tests actually ran' .github/workflows/ci.yml"
fi

# --- Required Status Check Names ---
echo ""
echo "Required Status Check Names:"
check "ci.yml workflow name is 'CI'" "head -1 .github/workflows/ci.yml | grep -q 'name: CI'"
check "council.yml workflow name is 'Code Review Council'" "head -1 .github/workflows/council.yml | grep -q 'name: Code Review Council'"

# --- Catalog Files ---
echo ""
echo "Catalog Files:"
check "DESIGN-REGISTRY.md exists" "[ -f docs/DESIGN-REGISTRY.md ]"
check "DESIGN-TOKENS.md exists" "[ -f docs/DESIGN-TOKENS.md ]"
check "CODE-PATTERNS.md exists" "[ -f docs/CODE-PATTERNS.md ]"

# --- Plans ---
echo ""
echo "Plans Directory:"
check "plans/ directory exists" "[ -d plans ]"
check "plans/ is NOT in .gitignore" "! grep -q '^plans/' .gitignore 2>/dev/null"

# --- Placeholder Check ---
echo ""
echo "Placeholder Check:"
PLACEHOLDER_COUNT=$(grep -rn '{{' CLAUDE.md .claude/review-agents/ docs/*.md 2>/dev/null | grep -v 'node_modules' | grep -v 'project.yml' | wc -l)
check "No {{placeholder}} strings in generated files" "[ $PLACEHOLDER_COUNT -eq 0 ]"

# --- CLAUDE.md Content Check ---
echo ""
echo "CLAUDE.md Content:"
check "references pipeline" "grep -qi 'pipeline' CLAUDE.md"
check "references council review" "grep -qi 'council' CLAUDE.md"
check "references plan requirement" "grep -qi 'plan' CLAUDE.md"
check "references pushback" "grep -qi 'pushback' CLAUDE.md"
check "references DELEGATION.md" "grep -qi 'delegation' CLAUDE.md"
check "references catalog files" "grep -q 'DESIGN-TOKENS\|DESIGN-REGISTRY\|CODE-PATTERNS' CLAUDE.md"

# --- DELEGATION.md Content Check ---
echo ""
echo "DELEGATION.md Content:"
check "DELEGATION.md references GitHub" "grep -qi 'github' DELEGATION.md"
check "DELEGATION.md has provisioning section" "grep -qi 'provisioning' DELEGATION.md"

echo ""
echo "====================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ PIPELINE VERIFICATION PASSED"
  exit 0
else
  echo "❌ PIPELINE VERIFICATION FAILED — fix the items above"
  exit 1
fi
