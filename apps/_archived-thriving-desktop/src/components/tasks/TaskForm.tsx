'use client'
import React, { useState } from 'react'
import type { Task } from '@upp/db'
import { createTaskAction, updateTaskAction } from '@/actions/task-actions'

interface TaskFormProps {
  goalId: string
  pillarId: string
  task?: Task
  onCancel: () => void
}

const labelStyle: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '6px' }
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '0 14px',
  height: '44px',
  fontSize: '15px',
  width: '100%',
  outline: 'none',
}
const selectStyle: React.CSSProperties = { ...inputStyle }
const textareaStyle: React.CSSProperties = { ...inputStyle, height: 'auto', padding: '12px 14px' }

export default function TaskForm({ goalId, pillarId, task, onCancel }: TaskFormProps): React.JSX.Element {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (task) {
      await updateTaskAction(task.id, goalId, pillarId, formData)
    } else {
      await createTaskAction(goalId, pillarId, formData)
    }
    setPending(false)
    onCancel()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label style={labelStyle}>Title</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={task?.title}
          placeholder="Task title"
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Priority</label>
          <select name="priority" defaultValue={task?.priority ?? 4} style={selectStyle}>
            <option value={1}>P1 — Critical</option>
            <option value={2}>P2 — High</option>
            <option value={3}>P3 — Medium</option>
            <option value={4}>P4 — Low</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Assignee</label>
          <select name="assignee" defaultValue={task?.assignee ?? ''} style={selectStyle}>
            <option value="">Unassigned</option>
            <option value="Nick">Nick</option>
            <option value="Erin">Erin</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Failure Cost</label>
          <select name="failure_cost" defaultValue={task?.failure_cost ?? ''} style={selectStyle}>
            <option value="">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input
            name="due_date"
            type="date"
            defaultValue={task?.due_date ?? ''}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          name="notes"
          defaultValue={task?.notes ?? ''}
          rows={3}
          placeholder="Optional notes…"
          style={textareaStyle}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full font-semibold rounded-xl disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1410', height: '48px', fontSize: '15px' }}
        >
          {pending ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full font-medium rounded-xl transition-colors"
          style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', height: '44px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
