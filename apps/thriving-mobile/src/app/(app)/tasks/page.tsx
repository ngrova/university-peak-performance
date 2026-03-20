// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (tasks)
// PURPOSE: The Tasks tab's page — a thin wrapper that renders
//   TasksContent, which handles search, filters, and the full
//   task inventory.
// CALLED BY: Next.js framework (automatic — this is the /tasks route)
// DATA FLOW: Next.js renders this → it renders TasksContent →
//   TasksContent fetches all tasks and manages filtering
// ═══════════════════════════════════════════════════════════
import React from 'react';
import TasksContent from '@/components/TasksContent';

/**
 * Triggered by: user navigates to the Tasks tab.
 * Steps: renders the TasksContent component which handles all
 *   data fetching, search, filtering, and display.
 * Returns: the Tasks screen UI.
 */
export default function TasksPage(): React.JSX.Element {
  return <TasksContent />;
}
