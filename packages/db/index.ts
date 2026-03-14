// Client exports (keep existing)
export { createClient, createBrowserClient, createServerClient } from './clients'
// Type exports
export type { LifePillar, Goal, Task } from './types'
// Query helpers
export { getPillars, createPillar, updatePillar, deletePillar, getPillarsWithProgress } from './pillars'
export type { CreatePillarInput, PillarWithProgress } from './pillars'
export { getGoals, createGoal, updateGoal, deleteGoal } from './goals'
export type { CreateGoalInput } from './goals'
export { getTasksByGoal, createTask, updateTask, deleteTask } from './tasks'
export type { CreateTaskInput } from './tasks'
