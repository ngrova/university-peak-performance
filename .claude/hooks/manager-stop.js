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
  process.stdout.write(
    JSON.stringify({
      decision: 'approve',
      reason: 'Typecheck and tests passed.',
    })
  );
}
