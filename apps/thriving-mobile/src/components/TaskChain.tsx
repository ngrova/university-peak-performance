// ═══════════════════════════════════════════════════════════
// FILE: TaskChain.tsx
// PURPOSE: Level 3 of the Domino Tree — shows a goal as the
//   root vertex, then a vertical chain of task nodes connected
//   by lines. Completed tasks show a check, the "up next" task
//   is highlighted, and future tasks dim progressively.
// CALLED BY: components/TreeContent.tsx
// DATA FLOW: TreeContent passes goal info + chain nodes → this
//   renders the vertex, then maps chain nodes to TaskChainNode
//   or ForkNode components with connecting lines between them
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { Task, Goal, TaskWithContext } from '@upp/db';
import type { ChainNode } from '@/lib/build-chain';
import { useTaskDetail } from '@/hooks/use-task-detail';
import VertexNode from './VertexNode';
import TaskChainNode from './TaskChainNode';
import ForkNode from './ForkNode';

interface TaskChainProps {
  goal: Goal;
  chain: ChainNode[];
  color: string;
  onForkTap: (taskId: string, label: string) => void;
}

/** Synthesizes TaskWithContext shape so TaskDetailSheet can display it */
function toTaskWithContext(task: Task, goal: Goal): TaskWithContext {
  return { ...task, goals: { title: goal.title, pillar_id: goal.pillar_id, priority_rank: goal.priority_rank, life_pillars: { id: goal.pillar_id, name: '', color: '', icon: '' } } };
}

/**
 * Triggered by: TreeContent renders this at Level 3 (task chain).
 * Steps: finds the first non-done task as "up next", renders a
 *   goal vertex at top, then the chain with vertical connector
 *   lines between nodes.
 * Returns: the task chain view, or empty-state message.
 */
export default function TaskChain({ goal, chain, color, onForkTap }: TaskChainProps): React.JSX.Element {
  const openDetail = useTaskDetail((s) => s.open);
  const tasks = chain.filter((n): n is { type: 'task'; task: Task } => n.type === 'task');
  const done = tasks.filter((n) => n.task.status === 'done').length;
  const upNextIdx = chain.findIndex((n) => n.type === 'task' && n.task.status !== 'done');

  if (chain.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No tasks in this goal yet</p>;
  }

  return (
    <div>
      <VertexNode label={`${done}/${tasks.length}`} subtitle={goal.title} color={color} completed={done} total={tasks.length} />
      <div className="flex flex-col items-center">
        {chain.map((node, i) => (
          <React.Fragment key={node.type === 'task' ? node.task.id : `fork-${i}`}>
            {i > 0 && <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />}
            {node.type === 'task' ? (
              <TaskChainNode task={node.task} isUpNext={i === upNextIdx}
                chainIndex={i} upNextIndex={upNextIdx >= 0 ? upNextIdx : 0}
                color={color} onTap={() => openDetail(toTaskWithContext(node.task, goal))} />
            ) : (
              <ForkNode trackCount={node.tracks.length} color={color}
                onTap={() => onForkTap(node.parentTask.id, `${node.tracks.length} tracks`)} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
