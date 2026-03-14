import type { LifePillar, Goal, Task } from '@upp/db'
import type { TreeNode, NodeDepth, LayoutConfig } from './tree-layout'

export const CANVAS_PAD = 60

export function buildTree(
  pillars: LifePillar[],
  goals: Goal[],
  tasks: Task[],
  focusPillarId: string | null,
): TreeNode {
  const goalsByPillar = new Map<string, Goal[]>()
  for (const g of goals) {
    const list = goalsByPillar.get(g.pillar_id) ?? []
    list.push(g)
    goalsByPillar.set(g.pillar_id, list)
  }

  const rootTasks = tasks.filter((t) => t.parent_task_id === null)
  const subtasksByParent = new Map<string, Task[]>()
  for (const t of tasks) {
    if (t.parent_task_id) {
      const list = subtasksByParent.get(t.parent_task_id) ?? []
      list.push(t)
      subtasksByParent.set(t.parent_task_id, list)
    }
  }

  function makeTaskNode(task: Task, pillar: LifePillar, depth: NodeDepth): TreeNode {
    const subs = subtasksByParent.get(task.id) ?? []
    return {
      id: task.id, label: task.title,
      depth, pillarId: pillar.id, pillarColor: pillar.color,
      status: task.status, failureCost: task.failure_cost ?? null, color: null,
      children: subs.map((s) => makeTaskNode(s, pillar, 4)),
      x: 0, y: 0,
    }
  }

  function makeGoalNode(goal: Goal, pillar: LifePillar): TreeNode {
    const goalTasks = rootTasks.filter((t) => t.goal_id === goal.id)
    return {
      id: goal.id, label: goal.title,
      depth: 2, pillarId: pillar.id, pillarColor: pillar.color,
      status: goal.status, failureCost: null, color: null,
      children: goalTasks.map((t) => makeTaskNode(t, pillar, 3)),
      x: 0, y: 0,
    }
  }

  function makePillarNode(pillar: LifePillar): TreeNode {
    const pillarGoals = goalsByPillar.get(pillar.id) ?? []
    return {
      id: pillar.id, label: `${pillar.icon} ${pillar.name}`,
      depth: 1, pillarId: pillar.id, pillarColor: pillar.color,
      status: null, failureCost: null, color: pillar.color,
      children: pillarGoals.map((g) => makeGoalNode(g, pillar)),
      x: 0, y: 0,
    }
  }

  const visiblePillars = focusPillarId ? pillars.filter((p) => p.id === focusPillarId) : pillars

  return {
    id: 'root', label: '🌱 Thriving',
    depth: 0, pillarId: null, pillarColor: null,
    status: null, failureCost: null, color: null,
    children: visiblePillars.map(makePillarNode),
    x: 0, y: 0,
  }
}

export function fitViewport(
  nodes: TreeNode[],
  viewW: number,
  viewH: number,
  cfg: LayoutConfig,
): { z: number; x: number; y: number } {
  if (nodes.length === 0) return { z: 1, x: 0, y: 0 }
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs) - CANVAS_PAD
  const minY = Math.min(...ys) - CANVAS_PAD
  const maxX = Math.max(...xs) + cfg.cardW + CANVAS_PAD
  const maxY = Math.max(...ys) + cfg.cardH + CANVAS_PAD
  const contentW = maxX - minX
  const contentH = maxY - minY
  const z = Math.min(3, Math.max(0.15, Math.min(viewW / contentW, viewH / contentH) * 0.9))
  const x = (viewW - contentW * z) / 2 - minX * z
  const y = (viewH - contentH * z) / 2 - minY * z
  return { z, x, y }
}
