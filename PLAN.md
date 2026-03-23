# Plan: Fix capture notes prompt to preserve full transcript detail

## TYPE
FEATURE

## Task
When a task is created via voice capture with full notes like "Bill from Heritage in email. Only approve expansion tank part, decline the rest of the bill." — the task detail sheet only shows partial text like "Nick's email." The AI extraction prompt tells Claude to extract "notes":"context, contacts, amounts" which causes it to SUMMARIZE instead of preserving the full text. Fix the prompt so notes contain the complete detail from the transcript.

## Approach
- Update the `buildPrompt` function in `process-capture-action.ts` to change the notes field instruction
- Replace the vague `"notes":"context, contacts, amounts"` with explicit instructions to preserve the FULL relevant detail from the transcript verbatim — not keywords, not a summary
- Keep the existing JSON structure and all other field instructions unchanged
- No changes to database schema, display components, or capture flow

## Files to Change
- apps/thriving-mobile/src/actions/process-capture-action.ts — update the AI prompt's notes field instruction to preserve full transcript detail

## Scope
small

## STATUS: COMPLETED
