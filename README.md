# Tadabbur — تدبر

A Quran study app: read per surah with English and Indonesian translations and tafsir, in a fast,
minimal, local-first 3-pane UI. Personal notes and progress sync (Convex + better-auth) are on the
[roadmap](https://github.com/fahreziadh/tadabbur/milestones).

## Stack

- **SvelteKit** (Svelte 5) + Tailwind CSS 4, deployed to Cloudflare Workers
- **Static Quran data** built ahead of time into per-surah JSON under `static/`, served from the
  CDN and cached client-side — no backend reads for Quran content
- **Convex** (planned, milestone v0.2) for user data only: notes, bookmarks, reading progress

## Data sources

All content is downloaded by `scripts/fetch-quran-data.ts` (run with `bun run scripts/fetch-quran-data.ts`).
The script resolves resources by exact name against the live resource lists — never guessed IDs —
and verifies verse counts (114 surahs, 6236 verses):

| Content                 | Source                                                        |
| ----------------------- | ------------------------------------------------------------- |
| Arabic (Uthmani script) | quran.com API v4                                              |
| English translation     | Saheeh International (quran.com API)                          |
| Indonesian translation  | Kemenag — Indonesian Islamic Affairs Ministry (quran.com API) |
| English tafsir          | Tafsir Ibn Kathir, abridged (quran.com API)                   |
| Indonesian tafsir       | Tafsir Kemenag (equran.id API v2)                             |
| Indonesian tafsir       | Al-Mukhtasar — Tafsir Center (QUL, via spa5k/tafsir_api)      |

Footnote markers are stripped from translations. Tafsir passages covering multiple consecutive
verses are stored once with a `from`/`to` range.

## Language & appearance

One language setting (English / Indonesia, via paraglide) drives the UI copy, which Quran
translation is shown, and the tafsir sources (EN: Ibn Kathir; ID: Tafsir Kemenag + Ibn Kathir).
Settings also offer light/dark/system themes, four self-hosted Arabic typefaces (KFGQPC Uthmanic
Hafs v22 — the official Madinah mushaf font, default — plus Amiri Quran, Scheherazade New, and
Noto Naskh Arabic), Arabic text size, and a focus mode for Arabic-only reading.

## Developing

```sh
bun install
bun run dev
```

Useful scripts: `bun run check` (types), `bun run lint`, `bun run format`, `bun run build`
(Cloudflare production build), `bun run preview`.

## Keyboard

- `Cmd/Ctrl+B` — toggle sidebar
