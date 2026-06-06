insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Profile media is public" on storage.objects;
drop policy if exists "Users upload their own media" on storage.objects;
drop policy if exists "Users update their own media" on storage.objects;
drop policy if exists "Users delete their own media" on storage.objects;

create policy "Profile media is public"
on storage.objects
for select
using (bucket_id = 'profile-media');

create policy "Users upload their own media"
on storage.objects
for insert
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update their own media"
on storage.objects
for update
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete their own media"
on storage.objects
for delete
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);
