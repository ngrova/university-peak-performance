#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let repoRoot;
try {
  repoRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();
} catch {
  process.stdout.write(JSON.stringify({ decision: 'approve' }));
  process.exit(0);
}

// Directories that are infrastructure, not application code.
// Code changes OUTSIDE these directories trigger typecheck and tests.
const INFRA_DIRS = ['.claude/', '.github/', 'docs/', 'plans/', 'node_modules/'];

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
        !INFRA_DIRS.some(dir => f.startsWith(dir)) &&
        (f.endsWith('.ts') ||
          f.endsWith('.tsx') ||
          f.endsWith('.js') ||
          f.endsWith('.jsx'))
    );
} catch {
  hasCodeChanges = false;
}

if (!hasCodeChanges) {
  process.stdout.write(JSON.stringify({ decision: 'approve' }));
  process.exit(0);
}

const warnings = [];

try {
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
  // Non-critical
}

const errors = [];

function hasTypeScript(root) {
  try {
    const out = execSync('git ls-files "*tsconfig.json"', { cwd: root, encoding: 'utf8' });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

function hasVitest(root) {
  try {
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = fs.readFileSync(pkgPath, 'utf8');
    return pkg.includes('"vitest"');
  } catch {
    return false;
  }
}

if (hasTypeScript(repoRoot)) {
  try {
    execSync('npx tsc --noEmit', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
    });
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    errors.push(`Typecheck failed:\n${output.slice(0, 500)}`);
  }
}

if (hasVitest(repoRoot)) {
  try {
    execSync('npx vitest run --reporter=verbose', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
    });
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    errors.push(`Tests failed:\n${output.slice(0, 500)}`);
  }
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
// PIPELINE-OWNED: Do not modify. If this logic has a gap, note it in the retrospective.
