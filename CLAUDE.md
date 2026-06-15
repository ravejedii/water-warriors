# CLAUDE.md

Guidance for AI assistants working in this repository.

## Project

**Water Futures AI** — a Next.js 15 (App Router) + React 19 + TypeScript app that
demonstrates AI-assisted water-scarcity risk management: water-sector trading
(Alpaca paper API), drought-based USDC subsidies (Crossmint on Ethereum Sepolia),
an illustrative futures-analysis view backed by an ML notebook, and a
Claude-powered assistant. Styling is Tailwind CSS v4 with shadcn/ui primitives.

## Core design: Demo Mode + Bring-Your-Own-Key (BYOK)

This is the most important concept in the codebase. The app is fully usable with
**no credentials** — every provider-backed route falls back to realistic built-in
demo data and the UI labels it clearly. Credentials, when present, switch a feature
to live data.

Server-side resolution precedence (`lib/server-credentials.ts`):
1. Per-request headers (`x-alpaca-key`, `x-alpaca-secret`, `x-anthropic-key`,
   `x-crossmint-key`) — a visitor's own keys, held only in their browser.
2. Server environment variables (`ALPACA_API_KEY`, etc.) — for a private deploy.
3. Neither → return demo data with `{ demo: true }`.

Client side (`lib/credentials.tsx`): a React context stores keys in `localStorage`
only, exposes `mode` ("demo" | "live"), and provides `headers()` to attach to
fetches. The Settings dialog (`components/settings-dialog.tsx`) edits them. Never
persist keys server-side; never log them.

All provider routes return an envelope with a `demo: boolean` flag plus the data,
e.g. `{ demo, account }`, `{ demo, positions }`, `{ demo, events }`.

## Layout

```
app/
  layout.tsx           Root layout: fonts, ThemeProvider, CredentialsProvider
  page.tsx             Responsive shell: header, tab nav, theme toggle, chatbot
  globals.css          Refined aquatic theme tokens (light + dark)
  api/
    alpaca/{account,positions,orders}/route.ts
    crossmint/{balance,activity,transfer}/route.ts
    chat/route.ts      Intent parsing (buy/balance/subsidy) + Claude for chat
components/
  trading-dashboard / government-subsidy / futures-recommendations
  chatbot.tsx          Floating launcher + slide-over panel
  settings-dialog.tsx  BYOK key entry
  mode-banner.tsx      ModeBadge + dismissible DemoBanner
  ui/                  shadcn primitives (button, card, dialog, input, …)
lib/
  demo-data.ts         Built-in sample datasets + shared constants
  credentials.tsx      Client BYOK context
  server-credentials.ts Server credential resolution helpers
research/
  notebooks/           NQH2O drought-prediction ML pipeline (Jupyter)
  mcp-servers/          Reference Python MCP servers (Alpaca, Crossmint)
```

## Conventions

- Use semantic theme tokens (`bg-card`, `text-muted-foreground`, `text-primary`,
  `text-success`, `border-border`, the `.glass` utility) — not hard-coded colors.
  This keeps light/dark mode consistent.
- Components that read live/demo data call the API routes with `headers()` from
  `useCredentials()` and branch on the returned `demo` flag.
- The AI assistant uses model `claude-opus-4-8` via `@anthropic-ai/sdk` (see
  `app/api/chat/route.ts`). Confirm model IDs against current Anthropic docs.
- Keep everything responsive: the app must work on phone and desktop.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build (fails on type errors)
npm start          # serve the production build
npx tsc --noEmit   # type check
```
