// ═══════════════════════════════════════════════════════════
// FILE: use-ai-suggestion.ts
// PURPOSE: Handles AI suggestion results from processCapture —
//   populates form fields, detects new-goal suggestions, and
//   manages inline goal creation state.
// CALLED BY: components/CapturePageContent.tsx
// DATA FLOW: AI returns AISuggestion → hook populates form fields →
//   if isNewGoal, opens inline creation with pre-filled name →
//   user can accept, edit, dismiss, or skip
// ═══════════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import type { Goal, TaskAssignee } from '@upp/db';
import type { AISuggestion } from '@/actions/process-capture-action';

interface FormSetters {
  setTitle: (v: string) => void;
  setGoalId: (v: string) => void;
  setPriority: (v: 1 | 2 | 3 | 4 | null) => void;
  setDeadline: (v: string) => void;
  setAssignee: (v: TaskAssignee | null) => void;
  setNotes: (v: string) => void;
}

/**
 * Triggered by: CapturePageContent when it needs AI suggestion handling.
 * Steps: returns handleAI callback + inline creation state. handleAI
 *   populates form fields from the suggestion. If isNewGoal, opens the
 *   inline creation form pre-filled — user can edit, dismiss, or skip.
 * Returns: { handleAI, showInlineCreate, suggestedGoalName, setShowInlineCreate }.
 */
export function useAISuggestion(goals: Goal[], setters: FormSetters) {
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [suggestedGoalName, setSuggestedGoalName] = useState('');

  const handleAI = useCallback((s: AISuggestion) => {
    if (s.title) setters.setTitle(s.title);
    if (s.priority) setters.setPriority(s.priority);
    if (s.deadline) setters.setDeadline(s.deadline);
    if (s.assignee) setters.setAssignee(s.assignee as TaskAssignee);
    if (s.notes) setters.setNotes(s.notes);

    // Goal handling: try existing match first, then offer new goal creation
    if (s.goalTitle) {
      const match = goals.find((g) => g.title.toLowerCase() === s.goalTitle!.toLowerCase());
      if (match) {
        setters.setGoalId(match.id);
      } else if (s.isNewGoal) {
        // AI suggests a new goal — pre-fill inline creation (user can dismiss)
        setSuggestedGoalName(s.goalTitle);
        setShowInlineCreate(true);
      }
    }
  }, [goals, setters]);

  return { handleAI, showInlineCreate, setShowInlineCreate, suggestedGoalName };
}
