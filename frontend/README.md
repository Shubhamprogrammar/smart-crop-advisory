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

## Structure

```
app/            # App Router pages, grouped by role: (auth), (farmer), (admin), (expert)
components/     # ui/, forms/, charts/, layout/
lib/            # API client, query provider, i18n, utils
store/          # zustand stores
types/          # shared TypeScript types
```

See [../docs/blueprint.md](../docs/blueprint.md) for full architecture and design system.
