#!/usr/bin/env node

/**
 * Manager Stop Hook — runs typecheck and tests when Claude finishes building.
 * If either fails, sends Claude back to fix the issues.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the repo root
let repoRoot;
try {
  repoRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();
} catch {
  // Not in a git repo, skip
  process.stdout.write(JSON.stringify({ decision: 'approve' }));
  process.exit(0);
}

// Check if there are code changes (staged or unstaged) in apps/
let hasCodeChanges = false;
try {
  const diff = execSync(
    'git diff --name-only && git diff --cached --name-only',
    { encoding: 'utf8', cwd: repoRoot }
  );
  hasCodeChanges = diff
    .split('\n')
    .some(
      (f) =>
        f.startsWith('apps/') &&
        (f.endsWith('.ts') ||
          f.endsWith('.tsx') ||
          f.endsWith('.js') ||
          f.endsWith('.jsx'))
    );
} catch {
  hasCodeChanges = false;
}

// Only run checks if there are actual code changes
if (!hasCodeChanges) {
  process.stdout.write(JSON.stringify({ decision: 'approve' }));
  process.exit(0);
}

const warnings = [];

// Warn if file deletions appear in a FEATURE PR
try {
  // Derive plan path from current branch name
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: repoRoot }).trim();
  const slug = branch.replace(/\//g, '-');
  const planPath = path.join(repoRoot, 'plans', slug + '.md');
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, 'utf8');
    const typeMatch = plan.match(/^## TYPE\s*\n\s*(\w+)/m);
    const planType = typeMatch ? typeMatch[1].trim() : 'FEATURE';
    if (planType === 'FEATURE') {
      const deletions = execSync('git diff --cached --diff-filter=D --name-only', {
        encoding: 'utf8',
        cwd: repoRoot,
      }).trim();
      if (deletions) {
        warnings.push(
          'WARNING: File deletions detected in a FEATURE PR.\n' +
          'If this PR replaces existing code, change TYPE to REDESIGN\n' +
          "and list deleted files in 'Files to Delete'."
        );
      }
    }
  }
} catch {
  // Non-critical — skip warning if check fails
}

const errors = [];

// Run typecheck
try {
  execSync('npx tsc --noEmit', {
    cwd: path.join(repoRoot, 'apps', 'thriving'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000,
  });
} catch (err) {
  const output = (err.stdout || '') + (err.stderr || '');
  errors.push(`Typecheck failed:\n${output.slice(0, 500)}`);
}

// Run tests
try {
  execSync('npx vitest run --reporter=verbose', {
    cwd: path.join(repoRoot, 'apps', 'thriving'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000,
  });
} catch (err) {
  const output = (err.stdout || '') + (err.stderr || '');
  errors.push(`Tests failed:\n${output.slice(0, 500)}`);
}

if (errors.length > 0) {
  const message = [
    'Manager check FAILED. Fix these before proceeding:',
    '',
    ...errors,
  ].join('\n');

  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: message,
    })
  );
} else {
  const reason = warnings.length > 0
    ? 'Typecheck and tests passed.\n\n' + warnings.join('\n\n')
    : 'Typecheck and tests passed.';
  process.stdout.write(
    JSON.stringify({
      decision: 'approve',
      reason,
    })
  );
}
