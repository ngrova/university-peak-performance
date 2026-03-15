import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from './TaskCard'
import type { Task } from '@upp/db'

vi.mock('@/actions/task-actions', () => ({
  deleteTaskAction: vi.fn().mockResolvedValue(undefined),
  updateTaskStatusAction: vi.fn().mockResolvedValue(undefined),
}))

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  goal_id: 'goal-1',
  parent_task_id: null,
  title: 'Write tests',
  notes: null,
  due_date: null,
  priority: 2,
  status: 'todo',
  is_one_thing: false,
  sort_order: 0,
  assignee: null,
  failure_cost: null,
  created_at: '2026-03-14T00:00:00Z',
  completed_at: null,
  updated_at: '2026-03-14T00:00:00Z',
}

describe('TaskCard', () => {
  it('renders task title and priority badge', () => {
    render(<TaskCard task={mockTask} goalId="goal-1" pillarId="pillar-1" />)
    expect(screen.getByText('Write tests')).toBeDefined()
    expect(screen.getByText('P2')).toBeDefined()
  })

  it('shows status toggle button with aria-label', () => {
    render(<TaskCard task={mockTask} goalId="goal-1" pillarId="pillar-1" />)
    expect(screen.getByLabelText('Status: todo')).toBeDefined()
  })

  it('opens detail sheet when card is clicked', () => {
    render(<TaskCard task={mockTask} goalId="goal-1" pillarId="pillar-1" />)
    const card = screen.getByRole('button', { name: /Task: Write tests/i })
    fireEvent.click(card)
    // Sheet should open — Mark Complete button visible
    expect(screen.getByText('✓ Mark Complete')).toBeDefined()
  })

  it('applies line-through style when status is done', () => {
    const doneTask = { ...mockTask, status: 'done' as const }
    render(<TaskCard task={doneTask} goalId="goal-1" pillarId="pillar-1" />)
    const title = screen.getByText('Write tests')
    expect(title.className).toContain('line-through')
  })
})
