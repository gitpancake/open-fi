# open-fi

AI-powered TryFi dog collar dashboard. pnpm monorepo with two packages.

## Monorepo Structure

- `packages/api` — `@open-fi/api`: Hono REST microservice wrapping TryFi's undocumented GraphQL API (port 3001)
- `packages/web` — `@open-fi/web`: Next.js 16 frontend with AI chat + dashboard widgets (port 3000)

## Commands

```bash
pnpm dev          # Start both services in parallel
pnpm build        # Build both packages

# Per-package
cd packages/api && pnpm dev    # API only
cd packages/web && pnpm dev    # Web only
```

## Key Architecture Decisions

- **pnpm workspaces** (not nx/turborepo) — minimal overhead for 2 packages
- **Hono** for API — tiny, Express-like, runs anywhere
- **Vercel AI SDK v6** — uses `UIMessage` format with `parts` (not `content` string). Must use `convertToModelMessages()` when passing to `streamText()`
- **iron-session** — session lives in the web package only, credentials passed to API via `X-Fi-Cookies` / `X-Session-Id` headers
- **TryFi GraphQL queries** — exact strings from pytryfi, concatenated with fragments. Do not modify query strings
- **Read-only** — no mutations or device controls

## Data Flow

```
User -> Next.js (3000) -> /api/chat -> Claude (tool calling)
  -> ai-tools.ts -> api-client.ts -> fi-open-api (3001) -> api.tryfi.com
```

## Important Files

### API (`packages/api/src/`)
- `client.ts` — `FiCredentials` interface, `fiQuery()` GraphQL wrapper, all pet data functions
- `queries.ts` — GraphQL query strings + fragment strings from pytryfi. `buildHouseholdsQuery()`, `buildPetLocationQuery(petId)`, etc.
- `types.ts` — TypeScript interfaces for all Fi API response shapes
- `routes/auth.ts` — `POST /auth/login` proxies to TryFi
- `routes/pets.ts` — REST endpoints wrapping client functions, uses Hono typed variables for middleware creds
- `index.ts` — Hono app entry, CORS config, port 3001

### Web (`packages/web/src/`)
- `lib/api-client.ts` — typed fetch wrapper for fi-open-api (`apiGetPets`, `apiGetPetLocation`, etc.)
- `lib/ai-tools.ts` — 6 Claude tool definitions using Vercel AI SDK `tool()` with `inputSchema` (Zod)
- `lib/session.ts` — iron-session config, `getServerSession()` helper
- `app/api/chat/route.ts` — streaming chat endpoint using Claude Haiku with tools
- `app/dashboard/page.tsx` — SSR page that fetches initial pet data
- `components/dashboard.tsx` — two-panel layout (chat left, widgets right)
- `components/chat-panel.tsx` — `useChat()` hook, manual input state, `sendMessage({ text })` pattern

## AI SDK v6 Gotchas

- `useChat()` returns `{ messages, sendMessage, status }` — no `input`, `handleInputChange`, `handleSubmit`
- Messages use `UIMessage` with `parts` array, not `Message` with `content` string
- `tool()` uses `inputSchema` not `parameters`
- `streamText()` returns `.toUIMessageStreamResponse()` not `.toDataStreamResponse()`
- Must convert messages: `messages: await convertToModelMessages(messages)` in route handler
- Chat status values: `'submitted' | 'streaming' | 'ready' | 'error'`

## Environment Variables

Only in `packages/web/.env.local`:
- `SESSION_SECRET` — 32+ char secret for iron-session
- `ANTHROPIC_API_KEY` — Anthropic API key
- `FI_API_URL` — fi-open-api URL (default: `http://localhost:3001`)

## TryFi API Notes

- Auth: `POST https://api.tryfi.com/auth/login` with form-urlencoded `email` + `password`
- Returns `{ userId, sessionId }` + Set-Cookie headers (`fi.sid`, `i18next`)
- GraphQL: `POST https://api.tryfi.com/graphql` with JSON `{ query }` + cookie header
- Pet queries use `__PET_ID__` placeholder replaced at runtime
- Queries must include all required fragments concatenated into one string
