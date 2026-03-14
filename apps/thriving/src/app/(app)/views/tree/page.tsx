import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient, getTreeData } from '@upp/db'
import TreeView from './TreeView'

export default async function TreePage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies()
  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pillars, goals, tasks } = user
    ? await getTreeData(supabase, user.id)
    : { pillars: [], goals: [], tasks: [] }

  return (
    <div className="-m-6" style={{ height: 'calc(100vh - 0px)' }}>
      <TreeView pillars={pillars} goals={goals} tasks={tasks} />
    </div>
  )
}
