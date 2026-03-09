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
- **Device controls** — LED color, LED toggle, Lost Dog Mode via mutations
- **OpenAPI docs** — `@hono/zod-openapi` generates spec at `/doc`, Scalar UI at `/reference`
- **Timeline** — reverse-engineered from Fi app via mitmproxy, cursor-based pagination

## Data Flow

```
User -> Next.js (3000) -> /api/chat -> Claude (tool calling)
  -> ai-tools.ts -> api-client.ts -> fi-open-api (3001) -> api.tryfi.com
```

## Important Files

### API (`packages/api/src/`)
- `client.ts` — `FiCredentials` interface, `fiQuery()` GraphQL wrapper, all pet data functions + `getTimeline()`
- `queries.ts` — GraphQL query strings + fragment strings from pytryfi + timeline query (mitmproxy). `buildHouseholdsQuery()`, `buildPetLocationQuery(petId)`, `buildTimelineQuery()`, etc.
- `schemas.ts` — Zod schemas for OpenAPI request/response validation
- `routes/auth.ts` — `POST /auth/login` proxies to TryFi (OpenAPIHono)
- `routes/pets.ts` — REST endpoints wrapping client functions (OpenAPIHono), includes `/timeline`
- `index.ts` — OpenAPIHono app entry, CORS config, `/doc` + `/reference` endpoints, port 3001

### Web (`packages/web/src/`)
- `lib/api-client.ts` — typed fetch wrapper for fi-open-api (`apiGetPets`, `apiGetPetLocation`, `apiGetTimeline`, etc.)
- `lib/ai-tools.ts` — 9 Claude tool definitions using Vercel AI SDK `tool()` with `inputSchema` (Zod)
- `lib/session.ts` — iron-session config, `getServerSession()` helper
- `app/api/chat/route.ts` — streaming chat endpoint using Claude Haiku with tools
- `app/dashboard/page.tsx` — SSR page that fetches initial pet data
- `components/dashboard.tsx` — two-panel layout (chat left, widgets right), mobile sheet
- `components/timeline-widget.tsx` — activity timeline with diceui, client-side pagination
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
- Timeline query uses GraphQL variables (`$pagingInstruction`, `$includeTravel`, `$filter`)
- Queries must include all required fragments concatenated into one string
- Timeline query was reverse-engineered from the Fi iOS app via mitmproxy (not from pytryfi)
