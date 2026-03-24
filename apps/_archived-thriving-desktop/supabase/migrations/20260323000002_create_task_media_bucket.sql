-- Storage bucket for task media (voice notes + photos).
-- Files are organized as: {user_id}/{task_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-media',
  'task-media',
  false,
  52428800, -- 50 MB max per file
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/aac', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Authenticated users can upload to their own folder
create policy "users_upload_own_media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'task-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner or delegate can read files
create policy "users_or_delegates_read_media" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'task-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.delegations
        where delegations.owner_id = ((storage.foldername(name))[1])::uuid
        and delegations.assistant_id = auth.uid()
      )
    )
  );

-- Owner can delete their own files
create policy "users_delete_own_media" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'task-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
