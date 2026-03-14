import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export type DomainKey =
  | 'physical' | 'mental' | 'spiritual' | 'purpose' | 'character'
  | 'relationships' | 'social' | 'financial' | 'growth' | 'adventure' | 'environment'

export type DomainScores = Record<DomainKey, [number, number]>
export type DomainAverages = Record<DomainKey, number>

export interface Assessment {
  id: string
  user_id: string
  scores: DomainScores
  domain_averages: DomainAverages
  overall_score: number
  created_at: string
}

export async function saveAssessment(
  supabase: AnyClient,
  userId: string,
  scores: DomainScores,
  domainAverages: DomainAverages,
  overallScore: number,
): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      scores,
      domain_averages: domainAverages,
      overall_score: overallScore,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAssessmentHistory(
  supabase: AnyClient,
  userId: string,
): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getLatestAssessment(
  supabase: AnyClient,
  userId: string,
): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}
