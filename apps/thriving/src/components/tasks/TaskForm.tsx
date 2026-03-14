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
    <form action={handleSubmit} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={task?.title}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="Task title"
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          name="priority"
          defaultValue={task?.priority ?? 4}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
        >
          <option value={1}>1 — Critical</option>
          <option value={2}>2 — High</option>
          <option value={3}>3 — Medium</option>
          <option value={4}>4 — Low</option>
        </select>
      </div>
      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
        <select
          id="assignee"
          name="assignee"
          defaultValue={task?.assignee ?? ''}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
        >
          <option value="">Unassigned</option>
          <option value="Nick">Nick</option>
          <option value="Erin">Erin</option>
        </select>
      </div>
      <div>
        <label htmlFor="failure_cost" className="block text-sm font-medium text-gray-700">Failure Cost</label>
        <select
          id="failure_cost"
          name="failure_cost"
          defaultValue={task?.failure_cost ?? ''}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
        >
          <option value="">— None —</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          id="due_date"
          name="due_date"
          type="date"
          defaultValue={task?.due_date ?? ''}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={task?.notes ?? ''}
          rows={3}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="Optional notes..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {task ? 'Save' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  )
}
