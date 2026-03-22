# Plan: Fix AI field mapping — goal picker, assignee, keyword boosting

## TYPE
FEATURE

## Task
Three confirmed issues from production testing: (1) AI goalTitle is never mapped to goalId — picker stays on default, (2) assignee not detected from "Erin should handle this", (3) Deepgram transcribes "Erin" as "Aaron". Fix all three: goal title→ID matching, improved prompt for assignee detection, Deepgram keyword boosting for known names.

## Approach
- GoalPicker: expose goals list via a ref or callback so CaptureSheet can match goalTitle→goalId
- CaptureSheet handleAI: find goal by title match (case-insensitive, trim), set goalId if found, log unmatched goalTitle via reportError
- Prompt: add explicit assignee detection instructions ("look for phrases like 'Erin should handle', 'assign to Nick', 'Liz can do this'")
- Prompt: list goal titles as a numbered list with exact titles to reduce Claude's tendency to paraphrase
- Deepgram: add `keywords=Erin:2&keywords=Liz:2&keywords=Nick:2` to the /v1/listen URL in transcribe-audio.ts

## Files to Change
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — add goalTitle→goalId matching in handleAI
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — expose goals list to parent via onGoalsLoaded callback
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — improve prompt for assignee + goal matching
- `apps/thriving-mobile/src/lib/transcribe-audio.ts` — add keyword boosting params to Deepgram URL

## Scope
small (4 files changed)

## STATUS: COMPLETED
