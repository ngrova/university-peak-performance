// ═══════════════════════════════════════════════════════════
// FILE: TaskActions.tsx
// PURPOSE: The "Complete" and "Block/Unblock" buttons shown in
//   the task detail sheet. Lets users mark a task done or flag
//   it as blocked.
// CALLED BY: components/TaskDetailSheet.tsx
// DATA FLOW: User taps a button → completeTask or updateTaskField
//   server action fires → parent's onCompleted callback closes
//   the sheet and refreshes data
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { Check, Ban } from 'lucide-react';
import { completeTask, updateTaskField } from '@/actions/task-actions';

interface TaskActionsProps {
  taskId: string;
  status: string;
  onCompleted: () => void;
}

/**
 * Triggered by: TaskDetailSheet renders this with the current task's
 *   ID and status.
 * Steps: shows two buttons — "Complete" (calls completeTask server
 *   action) and "Block/Unblock" (calls updateTaskField to toggle
 *   status). Complete button disables during processing.
 * Returns: a row of action buttons.
 */
export default function TaskActions({ taskId, status, onCompleted }: TaskActionsProps): React.JSX.Element {
  const [completing, setCompleting] = useState(false);
  const isBlocked = status === 'blocked';

  /** Marks task done and notifies parent */
  async function handleComplete() {
    if (completing) return;
    setCompleting(true);
    await completeTask(taskId);
    onCompleted();
  }

  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={handleComplete}
        disabled={completing}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: 'rgba(56,200,120,0.15)', color: 'var(--success)', minHeight: '44px' }}
      >
        <Check size={16} /> {completing ? 'Done!' : 'Complete'}
      </button>
      <button
        type="button"
        onClick={() => updateTaskField(taskId, 'status', isBlocked ? 'todo' : 'blocked')}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
        style={{
          backgroundColor: isBlocked ? 'rgba(104,104,160,0.2)' : 'transparent',
          color: 'var(--blocked)', border: '1px solid var(--border)', minHeight: '44px',
        }}
      >
        <Ban size={16} /> {isBlocked ? 'Unblock' : 'Blocked'}
      </button>
    </div>
  );
}
