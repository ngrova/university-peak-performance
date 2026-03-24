-- Task attachments: links uploaded media (voice notes, photos) to tasks.
-- Files live in the task-media Storage bucket; this table tracks metadata.

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_type text not null check (file_type in ('audio', 'image')),
  mime_type text not null,
  file_size integer not null default 0,
  display_name text not null default '',
  transcription text,
  created_at timestamptz not null default now()
);

alter table public.task_attachments enable row level security;

-- Delegation-aware RLS: owner or assistant with valid delegation
create policy "users_or_delegates_attachments" on public.task_attachments
  for all
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = task_attachments.user_id
      and delegations.assistant_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = task_attachments.user_id
      and delegations.assistant_id = auth.uid()
    )
  );

-- Index for task_id lookups (task detail sheet loads attachments by task)
create index task_attachments_task_id_idx on public.task_attachments(task_id);
