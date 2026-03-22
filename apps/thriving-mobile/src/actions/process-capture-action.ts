// ═══════════════════════════════════════════════════════════
// FILE: process-capture-action.ts
// PURPOSE: Server action that sends voice recordings and photos
//   to Claude AI for transcription and task field extraction.
//   Receives base64-encoded media (converted client-side since
//   Blobs are not serializable across the RSC boundary).
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: Client converts blobs to base64 → this action loads
//   pillar/goal structure → calls Claude API → returns suggestions
// ═══════════════════════════════════════════════════════════
'use server';

import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
import { reportError } from '@/lib/report-error';

interface MediaPayload {
  voice: { data: string; mimeType: string }[];
  images: { data: string; mimeType: string }[];
}

export interface AISuggestion {
  title?: string;
  goalTitle?: string;
  priority?: 1 | 2 | 3 | 4;
  assignee?: string;
  deadline?: string;
  notes?: string;
}

/**
 * Triggered by: user taps "Process with AI" in CaptureMediaSection.
 * Steps: authenticates user, loads their pillar/goal hierarchy,
 *   builds a Claude API request with base64 media and goal context,
 *   parses the JSON response into suggested task field values.
 * Returns: AISuggestion on success, or { error } on failure.
 */
export async function processCapture(
  media: MediaPayload,
): Promise<AISuggestion | { error: string }> {
  try {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) return { error: 'AI processing not configured — add fields manually' };
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    const pillars = await getPillars(supabase, targetUserId);
    const allGoals: Goal[] = [];
    for (const p of pillars) { const g = await getGoals(supabase, p.id); allGoals.push(...g); }
    const systemPrompt = buildPrompt(pillars, allGoals);
    const content = buildContent(media);
    if (content.length <= 1) return { error: 'No media to process' };
    return await callClaude(apiKey, systemPrompt, content);
  } catch (err) {
    reportError(err);
    return { error: 'AI processing failed — add fields manually' };
  }
}

/** Builds system prompt with the user's pillar → goal hierarchy */
function buildPrompt(pillars: LifePillar[], goals: Goal[]): string {
  const hierarchy = pillars.map((p) => {
    const pg = goals.filter((g) => g.pillar_id === p.id).map((g) => `  - ${g.title}`).join('\n');
    return `${p.icon} ${p.name}\n${pg || '  (no goals)'}`;
  }).join('\n\n');
  return `You extract tasks from voice recordings and photos for a productivity app.

The user's pillars and goals:
${hierarchy}

Valid assignees: Nick, Erin, Liz. Priority: 1 (urgent) to 4 (low).

Respond with ONLY valid JSON:
{"title":"action verb + what","goalTitle":"exact goal from list or null","priority":1-4,"assignee":"Nick"|"Erin"|"Liz"|null,"deadline":"YYYY-MM-DD"|null,"notes":"context, contacts, amounts"}

Use EXACT goal titles. Keep title short. Extract dates, names, contact info into notes.`;
}

/** Converts base64 media into Claude API content blocks */
function buildContent(media: MediaPayload): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  for (const v of media.voice) {
    const mt = v.mimeType.split(';')[0] as string;
    blocks.push({ type: 'document', source: { type: 'base64', media_type: mt, data: v.data } });
  }
  for (const img of media.images) {
    blocks.push({ type: 'image', source: { type: 'base64', media_type: img.mimeType || 'image/jpeg', data: img.data } });
  }
  blocks.push({ type: 'text', text: 'Analyze the recordings and photos above. Extract one task.' });
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
  try { return JSON.parse(text) as AISuggestion; }
  catch { reportError(new Error(`Non-JSON from Claude: ${text.substring(0, 100)}`)); return { error: 'AI response was malformed — add fields manually' }; }
}
