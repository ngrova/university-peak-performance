/**
 * Shared helpers for RLS test suites.
 * Provides admin client, test user creation, assertion, and cleanup.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

// Creates a Supabase admin client with service_role privileges
export const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Mutable counter object — works across CJS and ESM module boundaries
export const counts = { passed: 0, failed: 0 }

// Asserts a condition and logs the result
export function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ ${label}`)
    counts.passed++
  } else {
    console.error(`  ❌ ${label}`)
    counts.failed++
  }
}

// Creates a test user and returns an authenticated client
export async function createTestUser(email: string): Promise<ReturnType<typeof createClient>> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: 'test-password-123!',
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create user ${email}: ${error.message}`)

  const { data: session, error: signInError } = await admin.auth.signInWithPassword({
    email,
    password: 'test-password-123!',
  })
  if (signInError) throw new Error(`Failed to sign in ${email}: ${signInError.message}`)

  return createClient(SUPABASE_URL, process.env.SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${session.session!.access_token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Deletes test users by their IDs
export async function cleanup(userIds: string[]): Promise<void> {
  for (const id of userIds) {
    await admin.auth.admin.deleteUser(id)
  }
}

// Looks up a user ID by email from the admin user list
export async function getUserId(email: string): Promise<string> {
  const { data } = await admin.auth.admin.listUsers()
  const user = data.users.find((u) => u.email === email)
  if (!user) throw new Error(`User not found: ${email}`)
  return user.id
}

// Prints final pass/fail summary and exits with appropriate code
export function printAndExit(): void {
  console.log(`\n${counts.passed} passed, ${counts.failed} failed\n`)
  process.exit(counts.failed > 0 ? 1 : 0)
}
