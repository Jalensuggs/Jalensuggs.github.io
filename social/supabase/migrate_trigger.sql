-- Run ONLY this in a NEW Supabase SQL Editor tab.
-- This replaces the old handle_new_user trigger with one that:
--   • derives username from email prefix (sanitized, max 20 chars)
--   • adds a counter suffix if the username is already taken
--   • pulls avatar_url from Google OAuth metadata automatically

create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  if new.email is not null and new.email != '' then
    base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
    base_username := left(base_username, 20);
  else
    base_username := 'user_' || substr(md5(random()::text), 1, 8);
  end if;

  final_username := base_username;
  while exists(select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || '_' || counter::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Re-create the trigger (drop first in case it already exists on an old version)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
