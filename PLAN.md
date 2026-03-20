# Plan: Phase 4 — Domino Tree (Zone-Based Navigation)

## Task
Build the Tree tab with 3-level zone navigation using one visual pattern: vertex node at top + children below. Level 1: Pillar Map (user vertex + 2-col pillar grid with progress rings). Level 2: Goal Clusters (pillar vertex + 2-col goal grid with task dots). Level 3: Task Chain (goal vertex + vertical chain with completed/current/blocked states). Fork points show "N parallel tracks" and drill down to a track list. Breadcrumbs, 300ms spring transitions, real Supabase data.

## Approach
- One shared pattern: VertexNode (circular header) + ProgressRing (SVG) reused at all 3 levels
- Build build-chain.ts utility to linearize task trees from flat parent_task_id relationships, detecting forks
- Server action wraps existing getTreeData() with { data } | { error } pattern; hook mirrors use-goals-drilldown
- Extract BreadcrumbItem to shared types file (level: string) so both Goals and Tree hooks can use Breadcrumbs
- Synthesize TaskWithContext from tree data (goals array) when opening TaskDetailSheet
- Stagger-fade children animation + 300ms spring transitions in globals.css
- Unit test for build-chain.ts fork detection; E2E covers drill-down + fork tap + breadcrumb back

## Files to Change
- `apps/thriving-mobile/src/app/(app)/tree/page.tsx` — replace placeholder with TreeContent
- `apps/thriving-mobile/src/app/globals.css` — add stagger-fade keyframes for child nodes
- `apps/thriving-mobile/src/hooks/use-goals-drilldown.ts` — import BreadcrumbItem from shared types
- `apps/thriving-mobile/src/components/Breadcrumbs.tsx` — accept generic level string in onNavigate
- `apps/thriving-mobile/src/components/BreadcrumbChip.tsx` — accept generic level string

## New Files
- `apps/thriving-mobile/src/types/breadcrumb.ts` — shared BreadcrumbItem type with level: string
- `apps/thriving-mobile/src/actions/tree-actions.ts` — fetchTreeData server action
- `apps/thriving-mobile/src/hooks/use-tree-drilldown.ts` — drill-down state + TanStack Query
- `apps/thriving-mobile/src/lib/build-chain.ts` — linearizes task tree into chain nodes with fork detection
- `apps/thriving-mobile/src/components/TreeContent.tsx` — orchestrator
- `apps/thriving-mobile/src/components/VertexNode.tsx` — circular vertex header
- `apps/thriving-mobile/src/components/ProgressRing.tsx` — SVG circular progress ring
- `apps/thriving-mobile/src/components/PillarMap.tsx` — Level 1
- `apps/thriving-mobile/src/components/GoalClusters.tsx` — Level 2
- `apps/thriving-mobile/src/components/TaskChain.tsx` — Level 3
- `apps/thriving-mobile/src/components/TaskChainNode.tsx` — single task node
- `apps/thriving-mobile/src/components/ForkNode.tsx` — fork point node
- `apps/thriving-mobile/src/components/ForkDetail.tsx` — parallel tracks list
- `apps/thriving-mobile/src/lib/build-chain.test.ts` — unit tests for chain building + fork detection
- `apps/thriving-mobile/e2e/phase4-tree.spec.ts` — E2E: drill-down + fork tap + breadcrumb back

## Scope
large (20 files — 5 modified, 15 new)

## STATUS: APPROVED
