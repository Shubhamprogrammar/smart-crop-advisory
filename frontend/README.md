# Frontend — Smart Crop Advisory System

Next.js (App Router) + TypeScript + Tailwind CSS. Farmer, Admin, and Expert web app.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Runs on `http://localhost:3000`. The home page checks connectivity to the backend `/health` endpoint as a scaffold smoke test.

## Stack

- Next.js / React / TypeScript
- Tailwind CSS (design tokens in `app/globals.css`)
- TanStack Query for server state (`lib/query-provider.tsx`)
- Zustand for client state (`store/`)
- Recharts for charts
- Leaflet + OpenStreetMap for maps
- `next/font/google`: Inter (Latin UI) + Noto Sans Devanagari (Hindi/Marathi) + Noto Sans Gujarati
- `next-intl` for multilingual support (en/hi/mr/gu) — see below

## Multilingual routing (Phase 17)

All routes live under `app/[locale]/` (e.g. `app/[locale]/page.tsx`). The
default locale (`en`) uses clean URLs with no prefix (`/`); other locales
are prefixed (`/hi`, `/mr`, `/gu`) — configured via `localePrefix: "as-needed"`
in `i18n/routing.ts`. `proxy.ts` (Next.js 16's renamed `middleware.ts`
convention) handles locale detection/redirection and persists the choice
in a `NEXT_LOCALE` cookie.

- `i18n/routing.ts` — locale list (`lib/languages.ts`, kept in sync with
  the backend's `LANGUAGES` enum) and routing config
- `i18n/navigation.ts` — locale-aware `Link`/`useRouter`/`usePathname`;
  use these instead of `next/link` / `next/navigation` anywhere a link
  needs to preserve the current locale
- `i18n/request.ts` — loads `messages/{locale}.json` per request
- `messages/*.json` — translation catalogs; add new keys to all four
  files together, `en.json` first
- `components/LanguageSwitcher.tsx` — the language `<select>`; for a
  logged-in farmer, Phase 18's profile page should also PATCH
  `/api/users/me` with the new `preferredLanguage` so it persists across
  devices, not just in the cookie (that wiring needs the auth/session
  layer Phase 18 builds — not present yet)

New pages: add `useTranslations("namespace")` (client) or
`getTranslations("namespace")` (server) from `next-intl`, and add the
corresponding keys to every file in `messages/`.

## Structure

```
app/[locale]/   # App Router pages — everything lives under the locale segment
i18n/           # next-intl routing/navigation/request config
messages/       # en.json, hi.json, mr.json, gu.json translation catalogs
components/     # ui/, forms/, charts/, layout/
lib/            # API client, query provider, language metadata, utils
store/          # zustand stores
types/          # shared TypeScript types
```

See [../docs/blueprint.md](../docs/blueprint.md) for full architecture and design system.
