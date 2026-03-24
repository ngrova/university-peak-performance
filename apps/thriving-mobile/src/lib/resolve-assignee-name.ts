// ═══════════════════════════════════════════════════════════
// FILE: resolve-assignee-name.ts
// PURPOSE: Maps a Supabase auth user to their task assignee name.
//   Tries user_metadata first, falls back to email handle, validates
//   against known assignee values. Returns null if unresolvable.
// CALLED BY: actions/today-actions.ts
// DATA FLOW: Supabase user object → extract name from metadata or
//   email → validate against known assignees → return match or null
// ═══════════════════════════════════════════════════════════

import type { TaskAssignee } from '@upp/db';

const VALID_ASSIGNEES: readonly string[] = ['Nick', 'Erin', 'Liz'];

/** Capitalizes the first letter of a string */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

interface UserLike {
  user_metadata?: Record<string, unknown>;
  email?: string;
}

/**
 * Triggered by: fetchTodayTasks after resolving auth user.
 * Steps: tries user_metadata.full_name, then user_metadata.name
 *   (extracting first name), then email handle before @. Validates
 *   the result against the known TaskAssignee values.
 * Returns: a valid TaskAssignee string, or null if unresolvable.
 */
export function resolveAssigneeName(user: UserLike): TaskAssignee | null {
  // Try user_metadata.full_name → first name
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof fullName === 'string' && fullName.length > 0) {
    const first = capitalize(fullName.split(' ')[0] ?? '');
    if (VALID_ASSIGNEES.includes(first)) return first as TaskAssignee;
  }

  // Fallback: extract first name from email handle
  const email = user.email;
  if (email) {
    const handle = email.split('@')[0] ?? '';
    // Split on common separators (. _ -) and take the first part
    const first = capitalize(handle.split(/[._-]/)[0] ?? '');
    if (VALID_ASSIGNEES.includes(first)) return first as TaskAssignee;
  }

  // Unresolvable — caller should skip filtering
  return null;
}
