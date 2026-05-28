# Social App — Setup Guide

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in / create a free account
2. Click **New project**, choose a name and password, hit **Create**
3. Wait ~1 minute for it to provision

## 2. Run the database schema

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

## 3. Create the .env file

Copy `.env.example` to `.env` and fill in your keys:

```
cp .env.example .env
```

Find your keys in Supabase dashboard → **Settings → API**:
- `VITE_SUPABASE_URL` → Project URL
- `VITE_SUPABASE_ANON_KEY` → anon / public key

## 4. Dev server

```bash
npm install   # already done
npm run dev   # opens on http://localhost:5174
```

## 5. Build for production (embed into blog)

```bash
npm run build
```

This writes to `dist/` — the main blog already links to `social/dist/index.html`.

---

## Features
- Sign up / Sign in
- Post text, images, and videos (up to 4 files)
- Like and comment on posts
- Follow / unfollow users
- Profile pages
- Twitter/X-style dark UI
