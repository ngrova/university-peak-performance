# Plan: Add priority, assignee, failure cost to task detail sheet

## TYPE
FEATURE

## Task
Task detail sheet doesn't display priority, assignee, or failure cost. All three save correctly during capture but are invisible when viewing a task. Add all three as editable fields using the same chip/pill components from capture. Auto-save on change matching existing detail sheet pattern.

## Approach
- Add PriorityChips, AssigneeChips to TaskDetailSheet with auto-save via updateTaskField on change
- Create FailureCostChips component (low/medium/high/critical pills, same pattern as PriorityChips)
- TaskDetailSheet currently at 94 lines — adding 3 field sections will push it over 100. Extract into TaskDetailBody sub-component to stay compliant.
- updateTaskField already accepts any field name + value — no server action changes needed

## Files to Change
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — add priority, assignee, failure cost fields, extract sub-component
- `docs/DESIGN-REGISTRY.md` — add FailureCostChips, update TaskDetailSheet entry

## New Files
- `apps/thriving-mobile/src/components/FailureCostChips.tsx` — low/medium/high/critical pill selector

## Scope
small (2 files changed, 1 new file)

## STATUS: COMPLETED
