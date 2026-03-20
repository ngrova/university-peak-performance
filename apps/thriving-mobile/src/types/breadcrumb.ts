// ═══════════════════════════════════════════════════════════
// FILE: breadcrumb.ts
// PURPOSE: Shared type for breadcrumb navigation items. Used by
//   both the Goals and Tree drill-down hooks so that the
//   Breadcrumbs component stays generic and reusable.
// CALLED BY: hooks/use-goals-drilldown.ts, hooks/use-tree-drilldown.ts,
//   components/Breadcrumbs.tsx, components/BreadcrumbChip.tsx
// DATA FLOW: Hooks build BreadcrumbItem arrays → pass to
//   Breadcrumbs component → user taps → onNavigate fires
// ═══════════════════════════════════════════════════════════

export interface BreadcrumbItem {
  label: string;
  level: string;
  id?: string;
}
