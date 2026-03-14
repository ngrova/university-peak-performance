import React from 'react'

interface PillarProgressProps {
  goalCount: number
  taskCount: number
  completedTaskCount: number
}

export default function PillarProgress({
  goalCount,
  taskCount,
  completedTaskCount,
}: PillarProgressProps): React.JSX.Element {
  if (goalCount === 0) {
    return (
      <p className="text-xs text-gray-400 italic">No goals yet</p>
    )
  }

  const allDone = taskCount > 0 && completedTaskCount === taskCount
  const progressPct = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{goalCount} {goalCount === 1 ? 'goal' : 'goals'}</span>
        {taskCount > 0 ? (
          <span className={allDone ? 'text-green-600 font-medium' : ''}>
            {allDone ? '✓ All done' : `${completedTaskCount}/${taskCount} tasks`}
          </span>
        ) : (
          <span className="text-gray-400">No tasks</span>
        )}
      </div>
      {taskCount > 0 && (
        <div
          className="h-1.5 rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Task completion progress"
        >
          <div
            className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
