/**
 * Seed delegation rows for Erin and Liz.
 * Run this AFTER Erin and Liz have signed up through the normal signup flow.
 * Looks up all three users by email and inserts delegation rows linking
 * Erin and Liz as assistants to Nick's account.
 *
 * Usage:
 *   SUPABASE_URL=https://kemmvxnmlmvspfxgfvhl.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   npx tsx scripts/seed-delegations.ts
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// The three accounts — update Nick's email if different
const NICK_EMAIL = process.env.NICK_EMAIL ?? ''
const ERIN_EMAIL = 'erin.wilson@b2bbhs.com'
const LIZ_EMAIL = 'liz.bowen@b2bbhs.com'

// Looks up a user's ID by email
async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data } = await admin.auth.admin.listUsers()
  const user = data.users.find((u) => u.email === email)
  return user?.id ?? null
}

async function run(): Promise<void> {
  console.log('\n🤝 Seeding delegation rows\n')

  if (!NICK_EMAIL) {
    console.error('Set NICK_EMAIL env var to Nick\'s Supabase account email')
    process.exit(1)
  }

  const nickId = await getUserIdByEmail(NICK_EMAIL)
  const erinId = await getUserIdByEmail(ERIN_EMAIL)
  const lizId = await getUserIdByEmail(LIZ_EMAIL)

  if (!nickId) { console.error(`Nick not found: ${NICK_EMAIL}`); process.exit(1) }

  const delegations: { owner_id: string; assistant_id: string; label: string }[] = []

  if (erinId) {
    delegations.push({ owner_id: nickId, assistant_id: erinId, label: 'Nick → Erin' })
  } else {
    console.log(`⚠️  Erin (${ERIN_EMAIL}) not found — has she signed up yet?`)
  }

  if (lizId) {
    delegations.push({ owner_id: nickId, assistant_id: lizId, label: 'Nick → Liz' })
  } else {
    console.log(`⚠️  Liz (${LIZ_EMAIL}) not found — has she signed up yet?`)
  }

  if (!delegations.length) {
    console.log('\nNo delegations to create — both assistants need to sign up first')
    process.exit(0)
  }

  for (const d of delegations) {
    const { error } = await admin
      .from('delegations')
      .upsert({ owner_id: d.owner_id, assistant_id: d.assistant_id }, { onConflict: 'owner_id,assistant_id' })

    if (error) {
      console.error(`❌ Failed to create ${d.label}: ${error.message}`)
    } else {
      console.log(`✅ ${d.label}`)
    }
  }

  console.log('\nDone! Erin and Liz can now select Nick\'s account after login.\n')
}

run().catch((err) => {
  console.error('Script crashed:', err)
  process.exit(1)
})
