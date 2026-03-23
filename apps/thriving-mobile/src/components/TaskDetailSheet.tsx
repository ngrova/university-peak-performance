// ═══════════════════════════════════════════════════════════
// FILE: TaskDetailSheet.tsx
// PURPOSE: Bottom sheet for viewing and editing a single task —
//   title, goal, priority, assignee, failure cost, deadline, and
//   notes. Changes auto-save on blur/change.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User taps a task anywhere → useTaskDetail store holds
//   it → this sheet reads it and renders editable fields → on
//   blur/change, updateTaskField server action saves to Supabase
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTaskDetail } from '@/hooks/use-task-detail';
import { updateTaskField } from '@/actions/task-actions';
import type { TaskWithContext } from '@upp/db';
import TaskActions from './TaskActions';
import GoalPicker from './GoalPicker';
import PriorityChips from './PriorityChips';
import AssigneeChips from './AssigneeChips';
import FailureCostChips from './FailureCostChips';

/**
 * Triggered by: useTaskDetail store gets a task (user tapped one).
 * Steps: reads the task from the store. If set, renders the sheet
 *   overlay with backdrop and delegates to SheetBody for form content.
 * Returns: the detail sheet overlay, or null when no task is selected.
 */
export default function TaskDetailSheet(): React.JSX.Element | null {
  const task = useTaskDetail((s) => s.task);
  const close = useTaskDetail((s) => s.close);
  if (!task) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <SheetBody task={task} onClose={close} />
    </div>
  );
}

/** Auto-saves a single task field */
async function saveField(taskId: string, field: string, value: string | number | null) {
  await updateTaskField(taskId, field, value);
}

/** Form content — all editable task fields */
function SheetBody({ task, onClose }: { task: TaskWithContext; onClose: () => void }) {
  const save = (field: string, value: string | number | null) => saveField(task.id, field, value);
  return (
    <div className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <SheetHeader onClose={onClose} />
      <TitleField defaultValue={task.title} onSave={(v) => save('title', v)} />
      <TaskActions taskId={task.id} status={task.status} onCompleted={onClose} />
      <FieldLabel text="Goal" />
      <div className="mb-3"><GoalPicker value={task.goal_id} onChange={(goalId) => save('goal_id', goalId)} /></div>
      <FieldLabel text="Priority" />
      <PriorityChips value={task.priority} onChange={(v) => save('priority', v)} />
      <FieldLabel text="Assignee" />
      <AssigneeChips value={task.assignee} onChange={(v) => save('assignee', v)} />
      <FieldLabel text="Failure Cost" />
      <FailureCostChips value={task.failure_cost} onChange={(v) => save('failure_cost', v)} />
      <FieldLabel text="Deadline" />
      <input type="date" defaultValue={task.due_date ?? ''} onChange={(e) => save('due_date', e.target.value || null)}
        className="rounded-lg px-3 py-2 text-sm mb-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
      <FieldLabel text="Notes" />
      <textarea defaultValue={task.notes ?? ''} onBlur={(e) => save('notes', e.target.value || null)} rows={3}
        className="w-full rounded-lg px-3 py-2 text-sm resize-none mb-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
    </div>
  );
}

/** Header row */
function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Task Detail</h2>
      <button type="button" onClick={onClose} aria-label="Close" style={{ minHeight: '44px', minWidth: '44px' }} className="flex items-center justify-center">
        <X size={20} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
}

/** Auto-sizing title textarea — wraps long text, saves on blur */
function TitleField({ defaultValue, onSave }: { defaultValue: string; onSave: (v: string) => void }) {
  /** Resizes textarea to fit content */
  function autoResize(el: HTMLTextAreaElement) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  return (
    <textarea defaultValue={defaultValue} onBlur={(e) => onSave(e.target.value)} rows={1}
      onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
      ref={(el) => { if (el) autoResize(el); }}
      className="w-full text-lg font-semibold bg-transparent border-none outline-none mb-4 resize-none overflow-hidden"
      style={{ color: 'var(--text-primary)' }} />
  );
}

/** Small section label */
function FieldLabel({ text }: { text: string }) {
  return <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{text}</label>;
}
