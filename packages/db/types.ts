export interface LifePillar {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  sort_order: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  pillar_id: string
  title: string
  description: string | null
  target_date: string | null
  status: 'active' | 'completed' | 'archived'
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  goal_id: string
  parent_task_id: string | null
  title: string
  notes: string | null
  due_date: string | null
  priority: 1 | 2 | 3 | 4
  status: 'todo' | 'in_progress' | 'done'
  is_one_thing: boolean
  sort_order: number
  created_at: string
  completed_at: string | null
  updated_at: string
}
