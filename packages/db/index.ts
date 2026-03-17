// Client exports (keep existing)
export { createClient, createBrowserClient, createServerClient } from './clients'
// Type exports
export type { LifePillar, Goal, Task, FailureCost, TaskAssignee } from './types'
// Query helpers
export { getPillars, createPillar, updatePillar, deletePillar, getPillarsWithProgress } from './pillars'
export type { CreatePillarInput, PillarWithProgress } from './pillars'
export { getGoals, createGoal, updateGoal, deleteGoal } from './goals'
export type { CreateGoalInput } from './goals'
export { getTasksByGoal, createTask, updateTask, deleteTask, unpinOneThingForUser } from './tasks'
export type { CreateTaskInput } from './tasks'
export { getOneThingTask, getTasksWithDeadlines, getTasksForQueue } from './tasks-views'
export type { TaskWithContext } from './tasks-views'
export { saveAssessment, getAssessmentHistory, getLatestAssessment, deleteAssessment } from './assessments'
export type { Assessment, DomainKey, DomainScores, DomainAverages } from './assessments'
export { getTreeData } from './tree'
export type { TreeData } from './tree'
