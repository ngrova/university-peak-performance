// ═══════════════════════════════════════════════════════════
// FILE: process-capture-action.ts
// PURPOSE: Server action that transcribes voice recordings via
//   Deepgram, then sends transcripts + photos to Claude for task
//   field extraction. Returns AI suggestions + transcripts.
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: Client sends base64 media → Deepgram transcribes voice →
//   Claude receives text + images → returns field suggestions
// ═══════════════════════════════════════════════════════════
'use server';

import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
import { reportError } from '@/lib/report-error';
import { transcribeAudio } from '@/lib/transcribe-audio';

type MediaPayload = { voice: { data: string; mimeType: string }[]; images: { data: string; mimeType: string }[] };

export interface AISuggestion {
  title?: string;
  goalTitle?: string;
  priority?: 1 | 2 | 3 | 4;
  assignee?: string;
  deadline?: string;
  notes?: string;
}

export interface ProcessResult {
  suggestion: AISuggestion;
  transcripts: string[];
}

/**
 * Triggered by: user taps "Process with AI" in CaptureMediaSection.
 * Steps: transcribes voice recordings via Deepgram, loads the user's
 *   pillar/goal hierarchy, sends transcripts + images to Claude,
 *   returns AI suggestions alongside transcripts for the UI.
 * Returns: { suggestion, transcripts } on success, or { error }.
 */
export async function processCapture(
  media: MediaPayload,
): Promise<ProcessResult | { error: string }> {
  try {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) return { error: 'AI processing not configured — add fields manually' };
    const txResult = await transcribeAll(media.voice);
    if ('error' in txResult) return txResult;
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    const pillars = await getPillars(supabase, targetUserId);
    const allGoals: Goal[] = [];
    for (const p of pillars) { const g = await getGoals(supabase, p.id); allGoals.push(...g); }
    const content = buildContent(txResult.transcripts, media.images);
    if (content.length <= 1) return { error: 'No media to process' };
    const suggestion = await callClaude(apiKey, buildPrompt(pillars, allGoals), content);
    if ('error' in suggestion) return suggestion;
    return { suggestion, transcripts: txResult.transcripts };
  } catch (err) {
    reportError(err);
    return { error: 'AI processing failed — add fields manually' };
  }
}

/** Transcribes all voice recordings via Deepgram, returns transcripts or first error */
async function transcribeAll(voice: MediaPayload['voice']): Promise<{ transcripts: string[] } | { error: string }> {
  const transcripts: string[] = [];
  for (const v of voice) {
    const result = await transcribeAudio(v.data, v.mimeType);
    if ('error' in result) return { error: result.error };
    transcripts.push(result.transcript);
  }
  return { transcripts };
}

/** Builds system prompt with the user's pillar → goal hierarchy */
function buildPrompt(pillars: LifePillar[], goals: Goal[]): string {
  const hierarchy = pillars.map((p) => {
    const pg = goals.filter((g) => g.pillar_id === p.id).map((g) => `  - ${g.title}`).join('\n');
    return `${p.icon} ${p.name}\n${pg || '  (no goals)'}`;
  }).join('\n\n');
  return `You extract tasks from voice recordings and photos for a productivity app.

GOALS (use these EXACT titles for goalTitle):
${hierarchy}

ASSIGNEE DETECTION: Look for phrases like "Erin should handle", "assign to Nick", "Liz can do this", "have Erin...", "Nick needs to...", "let Liz...". Also note: the transcription may spell "Erin" as "Aaron" — treat "Aaron" as "Erin". Valid assignees: Nick, Erin, Liz.

Priority: 1 (urgent/critical) to 4 (low/someday).

Respond with ONLY valid JSON (no markdown, no code fences):
{"title":"action verb + what","goalTitle":"exact goal title from list above or null","priority":1-4,"assignee":"Nick"|"Erin"|"Liz"|null,"deadline":"YYYY-MM-DD"|null,"notes":"context, contacts, amounts"}

CRITICAL: goalTitle must EXACTLY match one of the goal titles listed above. Do not paraphrase or invent goals.`;
}

/** Builds Claude content blocks: transcripts as text + images */
function buildContent(transcripts: string[], images: MediaPayload['images']): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  if (transcripts.length > 0) {
    blocks.push({ type: 'text', text: `Voice recording transcripts:\n${transcripts.join('\n\n')}` });
  }
  for (const img of images) {
    blocks.push({ type: 'image', source: { type: 'base64', media_type: img.mimeType || 'image/jpeg', data: img.data } });
  }
  blocks.push({ type: 'text', text: 'Extract one task from the content above.' });
  return blocks;
}

/** Calls Claude API and parses JSON response */
async function callClaude(apiKey: string, system: string, content: Record<string, unknown>[]): Promise<AISuggestion | { error: string }> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system, messages: [{ role: 'user', content }] }),
  });
  if (!resp.ok) {
    const errBody = await resp.text().catch(() => 'no body');
    reportError(new Error(`Claude API ${resp.status}: ${errBody}`));
    return { error: 'AI processing failed — add fields manually' };
  }
  const body = await resp.json() as { content: { type: string; text?: string }[] };
  const text = body.content.find((b) => b.type === 'text')?.text;
  if (!text) return { error: 'AI returned empty response — add fields manually' };
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(cleaned) as AISuggestion; }
  catch { reportError(new Error(`Non-JSON from Claude: ${text.substring(0, 100)}`)); return { error: 'AI response was malformed — add fields manually' }; }
}
