/**
 * RLS cross-tenant isolation test.
 * Verifies that User B cannot read, update, or delete User A's data.
 * Runs against a local Supabase instance started via `supabase start`.
 */
import { assert, createTestUser, getUserId, cleanup, printAndExit } from './test-rls-helpers'

async function run(): Promise<void> {
  console.log('\n🔒 RLS Cross-Tenant Isolation Test\n')

  const userAClient = await createTestUser('rls-test-a@example.com')
  const userBClient = await createTestUser('rls-test-b@example.com')
  const userAId = await getUserId('rls-test-a@example.com')
  const userBId = await getUserId('rls-test-b@example.com')

  try {
    // User A creates pillar → goal → task
    console.log('User A creates data...')
    const { data: pillar } = await userAClient
      .from('life_pillars')
      .insert({ user_id: userAId, name: 'RLS Test Pillar', icon: '🔒', color: '#ff0000', sort_order: 99 })
      .select('id')
      .single()

    const { data: goal } = await userAClient
      .from('goals')
      .insert({ user_id: userAId, pillar_id: pillar!.id, title: 'RLS Test Goal', sort_order: 99 })
      .select('id')
      .single()

    const { data: task } = await userAClient
      .from('tasks')
      .insert({ user_id: userAId, goal_id: goal!.id, title: 'RLS Test Task', sort_order: 99 })
      .select('id')
      .single()

    // User B tries to READ User A's data
    console.log('\nUser B attempts to read User A\'s data...')
    const { data: readTasks } = await userBClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('User B cannot read User A tasks', readTasks?.length === 0)

    const { data: readGoals } = await userBClient
      .from('goals').select('id').eq('id', goal!.id)
    assert('User B cannot read User A goals', readGoals?.length === 0)

    const { data: readPillars } = await userBClient
      .from('life_pillars').select('id').eq('id', pillar!.id)
    assert('User B cannot read User A pillars', readPillars?.length === 0)

    // User B tries to UPDATE User A's data
    console.log('\nUser B attempts to update User A\'s data...')
    const { data: updTask } = await userBClient
      .from('tasks').update({ title: 'HACKED' }).eq('id', task!.id).select('id')
    assert('User B cannot update User A tasks', updTask?.length === 0)

    const { data: updGoal } = await userBClient
      .from('goals').update({ title: 'HACKED' }).eq('id', goal!.id).select('id')
    assert('User B cannot update User A goals', updGoal?.length === 0)

    const { data: updPillar } = await userBClient
      .from('life_pillars').update({ name: 'HACKED' }).eq('id', pillar!.id).select('id')
    assert('User B cannot update User A pillars', updPillar?.length === 0)

    // User B tries to DELETE User A's data
    console.log('\nUser B attempts to delete User A\'s data...')
    const { data: delTask } = await userBClient
      .from('tasks').delete().eq('id', task!.id).select('id')
    assert('User B cannot delete User A tasks', delTask?.length === 0)

    const { data: delGoal } = await userBClient
      .from('goals').delete().eq('id', goal!.id).select('id')
    assert('User B cannot delete User A goals', delGoal?.length === 0)

    const { data: delPillar } = await userBClient
      .from('life_pillars').delete().eq('id', pillar!.id).select('id')
    assert('User B cannot delete User A pillars', delPillar?.length === 0)

    // Verify User A's data is still intact
    console.log('\nVerify User A data is intact...')
    const { data: intact } = await userAClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('User A task still exists after User B attacks', intact?.length === 1)

  } finally {
    await cleanup([userAId, userBId])
  }

  printAndExit()
}

run().catch((err) => {
  console.error('Test crashed:', err)
  process.exit(1)
})
