-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid references auth.users on delete cascade primary key,
  username     text unique not null,
  display_name text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz default now()
);

-- ── Posts ─────────────────────────────────────────────────────────────────────
create table if not exists posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  content     text,
  media_urls  text[]  default '{}',
  media_type  text    check (media_type in ('image', 'video', null)),
  created_at  timestamptz default now()
);

-- ── Likes ─────────────────────────────────────────────────────────────────────
create table if not exists likes (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references profiles(id) on delete cascade not null,
  post_id  uuid references posts(id)    on delete cascade not null,
  unique (user_id, post_id)
);

-- ── Comments ──────────────────────────────────────────────────────────────────
create table if not exists comments (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  post_id    uuid references posts(id)    on delete cascade not null,
  content    text not null,
  created_at timestamptz default now()
);

-- ── Follows ───────────────────────────────────────────────────────────────────
create table if not exists follows (
  follower_id  uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table likes     enable row level security;
alter table comments  enable row level security;
alter table follows   enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- posts
create policy "posts_select" on posts for select using (true);
create policy "posts_insert" on posts for insert with check (auth.uid() = user_id);
create policy "posts_delete" on posts for delete using (auth.uid() = user_id);

-- likes
create policy "likes_select" on likes for select using (true);
create policy "likes_insert" on likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on likes for delete using (auth.uid() = user_id);

-- comments
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- follows
create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on follows for delete using (auth.uid() = follower_id);

-- ── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Storage bucket for media ──────────────────────────────────────────────────
-- Run in Supabase dashboard → Storage → New bucket: "media" (public)
-- Or run:
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict do nothing;

create policy "media_select" on storage.objects for select using (bucket_id = 'media');
create policy "media_insert" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_delete" on storage.objects for delete using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
