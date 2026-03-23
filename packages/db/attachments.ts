import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  file_path: string
  file_type: 'audio' | 'image'
  mime_type: string
  file_size: number
  display_name: string
  transcription: string | null
  created_at: string
}

// Explicit column list — never use .select('*')
const ATTACHMENT_COLUMNS = 'id, task_id, user_id, file_path, file_type, mime_type, file_size, display_name, transcription, created_at'

export interface CreateAttachmentInput {
  task_id: string
  user_id: string
  file_path: string
  file_type: 'audio' | 'image'
  mime_type: string
  file_size: number
  display_name: string
  transcription?: string
}

// Fetches all attachments for a given task
export async function getTaskAttachments(
  supabase: AnyClient,
  taskId: string,
): Promise<TaskAttachment[]> {
  const { data, error } = await supabase
    .from('task_attachments')
    .select(ATTACHMENT_COLUMNS)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
    .limit(50)
  if (error) throw error
  return data
}

// Inserts a single attachment row
export async function createAttachment(
  supabase: AnyClient,
  input: CreateAttachmentInput,
): Promise<TaskAttachment> {
  const { data, error } = await supabase
    .from('task_attachments')
    .insert(input)
    .select(ATTACHMENT_COLUMNS)
    .single()
  if (error) throw error
  return data
}

// Deletes an attachment row by ID
export async function deleteAttachment(
  supabase: AnyClient,
  attachmentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('task_attachments')
    .delete()
    .eq('id', attachmentId)
  if (error) throw error
}
