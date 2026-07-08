# Stackwrk

Marketing landing page for **Stackwrk** — bold websites, real results.
Single-page, dark-mode, conversion-focused. Design direction: "Direction B —
Bold, Electric, Modern."

> Public brand: **Stackwrk** (stackwrk.com). Legal entity: Fox Solutions LLC
> (footer copyright only).

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** — `leads` table for audit-request submissions (via `/api/leads`)
- **Vercel** — deploy target
- Fonts: **Anton** (display) + **Inter** (body), self-hosted via `next/font`

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase creds (optional for UI-only dev)
npm run dev                  # http://localhost:3000
```

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server              |
| `npm run build` | Production build                  |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Lint (Next.js ESLint)             |

## Lead capture

The audit form posts to `POST /api/leads`, which inserts into the Supabase
`leads` table using the server-only service-role key. Without env vars set the
route returns `503` and the form shows a friendly "email me instead" message —
so the site builds and deploys before Supabase is wired up. See `.env.example`
for the expected table schema.

## Structure

```
src/
  app/
    layout.tsx          # metadata, fonts, sticky nav
    page.tsx            # section assembly
    globals.css         # theme tokens + component classes
    api/leads/route.ts  # Supabase lead insert
  components/            # Nav, Hero, HeroVisual, FeaturedProjects, ...
  lib/
    content.ts          # ALL copy + links (edit here)
    fonts.ts            # Anton + Inter
    supabase.ts         # server client factory
```

## Editing copy

All user-facing text and links live in `src/lib/content.ts`. Replace the
placeholder Calendly URL and project links there before launch.
