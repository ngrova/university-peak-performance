/**
 * RLS delegation model test.
 * Verifies that User C (assistant) with a valid delegation CAN access
 * User A's data, and access is revoked immediately when the delegation
 * row is deleted. Also verifies User B (no delegation) remains blocked.
 * Runs against a local Supabase instance started via `supabase start`.
 */
import { admin, assert, createTestUser, getUserId, cleanup, printAndExit } from './test-rls-helpers'

async function run(): Promise<void> {
  console.log('\n🤝 RLS Delegation Model Test\n')

  const userAClient = await createTestUser('rls-deleg-a@example.com')
  const userBClient = await createTestUser('rls-deleg-b@example.com')
  const userCClient = await createTestUser('rls-deleg-c@example.com')
  const userAId = await getUserId('rls-deleg-a@example.com')
  const userBId = await getUserId('rls-deleg-b@example.com')
  const userCId = await getUserId('rls-deleg-c@example.com')

  try {
    // User A creates pillar → goal → task
    console.log('User A creates test data...')
    const { data: pillar } = await userAClient
      .from('life_pillars')
      .insert({ user_id: userAId, name: 'Delegation Test Pillar', icon: '🤝', color: '#00ff00', sort_order: 99 })
      .select('id')
      .single()

    const { data: goal } = await userAClient
      .from('goals')
      .insert({ user_id: userAId, pillar_id: pillar!.id, title: 'Delegation Test Goal', sort_order: 99 })
      .select('id')
      .single()

    const { data: task } = await userAClient
      .from('tasks')
      .insert({ user_id: userAId, goal_id: goal!.id, title: 'Delegation Test Task', sort_order: 99 })
      .select('id')
      .single()

    // Owner grants delegation to User C
    console.log('User A grants delegation to User C...')
    const { error: delegErr } = await userAClient
      .from('delegations')
      .insert({ owner_id: userAId, assistant_id: userCId })
    assert('Owner can create a delegation', !delegErr)

    // Test 1: Assistant CAN read owner's data
    console.log('\nUser C (assistant) reads User A\'s data...')
    const { data: cReadPillars } = await userCClient
      .from('life_pillars').select('id').eq('id', pillar!.id)
    assert('Assistant can read owner pillars', cReadPillars?.length === 1)

    const { data: cReadGoals } = await userCClient
      .from('goals').select('id').eq('id', goal!.id)
    assert('Assistant can read owner goals', cReadGoals?.length === 1)

    const { data: cReadTasks } = await userCClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('Assistant can read owner tasks', cReadTasks?.length === 1)

    // Test 2: Assistant CAN create a task under the owner's user_id
    console.log('\nUser C creates a task under User A\'s account...')
    const { data: cTask, error: cTaskErr } = await userCClient
      .from('tasks')
      .insert({ user_id: userAId, goal_id: goal!.id, title: 'Created by assistant', sort_order: 100 })
      .select('id')
      .single()
    assert('Assistant can create task with owner user_id', !!cTask && !cTaskErr)

    // Test 3: Assistant CAN update the owner's task
    console.log('\nUser C updates User A\'s task...')
    const { data: cUpdTask } = await userCClient
      .from('tasks').update({ title: 'Updated by assistant' }).eq('id', task!.id).select('id')
    assert('Assistant can update owner task', cUpdTask?.length === 1)

    // Restore the original title so later asserts stay clean
    await userCClient
      .from('tasks').update({ title: 'Delegation Test Task' }).eq('id', task!.id)

    // Test 4: Assistant CAN delete a task in the owner's account
    console.log('\nUser C deletes the task they created...')
    const { data: cDelTask } = await userCClient
      .from('tasks').delete().eq('id', cTask!.id).select('id')
    assert('Assistant can delete task in owner account', cDelTask?.length === 1)

    // Test 5: User B (no delegation) STILL cannot read User A's data
    console.log('\nUser B (no delegation) still blocked...')
    const { data: bStillBlocked } = await userBClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('Non-delegated user still cannot read owner data', bStillBlocked?.length === 0)

    // Test 6a: User B cannot forge a delegation to gain access
    console.log('\nUser B attempts to forge a delegation...')
    const { error: forgeErr } = await userBClient
      .from('delegations')
      .insert({ owner_id: userAId, assistant_id: userBId })
    assert('Non-owner cannot forge a delegation', !!forgeErr)

    // Test 6b: Revoking a delegation immediately cuts off access
    console.log('\nUser A revokes delegation from User C...')
    const { error: revokeErr } = await userAClient
      .from('delegations')
      .delete()
      .eq('owner_id', userAId)
      .eq('assistant_id', userCId)
    assert('Owner can revoke delegation', !revokeErr)

    const { data: cAfterRevoke } = await userCClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('Revoked assistant cannot read owner tasks', cAfterRevoke?.length === 0)

    const { data: cPillarsAfterRevoke } = await userCClient
      .from('life_pillars').select('id').eq('id', pillar!.id)
    assert('Revoked assistant cannot read owner pillars', cPillarsAfterRevoke?.length === 0)

    // Verify User A's data is STILL intact after all delegation tests
    console.log('\nFinal integrity check...')
    const { data: finalCheck } = await userAClient
      .from('tasks').select('id').eq('id', task!.id)
    assert('User A data intact after delegation tests', finalCheck?.length === 1)

  } finally {
    // Clean up delegation rows (admin bypasses RLS)
    await admin.from('delegations').delete().eq('owner_id', userAId)
    await cleanup([userAId, userBId, userCId])
  }

  printAndExit()
}

run().catch((err) => {
  console.error('Test crashed:', err)
  process.exit(1)
})
