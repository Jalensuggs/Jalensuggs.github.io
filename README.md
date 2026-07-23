# Myles | Software Engineer

Personal portfolio site — live at [jalensuggs.github.io](https://jalensuggs.github.io)

A single-page site (hero, about, tech stack, projects, interests, life stats, blog previews, contact) plus a couple of interactive extras and two companion apps.

## Structure

- `index.html` — the main site. Plain HTML/CSS/JS, no framework, no build step.
- `player/` — standalone music player (React + Vite), built to `player/dist/`
- `social/` — standalone blog/social feed (React + Vite + Supabase), built to `social/dist/`
- `vendor/sticker-forge.es.js` — self-hosted build of [sticker-forge](https://github.com/CatsJuice/sticker-forge) (MIT), powers the peelable-photo "Photo Wall" section
- `tape-game.js` / `tape-game.css` — the "Photo Strip Roll" interactive section (Three.js)
- `images/`, `music/`, `相片素材/` — site assets

## Running locally

The main page has no build step, but it does load an ES module, so it needs a real server rather than opening the file directly:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

`player/` and `social/` are separate Vite apps:

```bash
cd player && npm install && npm run dev
cd social && npm install && npm run dev
```

## Deployment

GitHub Pages serves the repo root directly on every push to `main` — no build step needed for the top-level site. `player/` and `social/` are exceptions: `.github/workflows/build-player.yml` and `build-social.yml` rebuild them with Vite and commit the refreshed `dist/` output back into the repo whenever their source changes.

## Credits

The Photo Wall's peel effect is built on [sticker-forge](https://github.com/CatsJuice/sticker-forge) by [@CatsJuice](https://github.com/CatsJuice), MIT licensed.
