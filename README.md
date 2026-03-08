# open-fi

AI-powered dashboard for your [Fi](https://tryfi.com) dog collar. Ask natural language questions about your dog — location, activity, sleep, device status — and get answers powered by Claude.

## Architecture

pnpm monorepo with two packages:

| Package | Description | Port |
|---|---|---|
| [`@open-fi/api`](packages/api) | Hono microservice wrapping the TryFi GraphQL API | 3001 |
| [`@open-fi/web`](packages/web) | Next.js frontend with AI chat + dashboard widgets | 3000 |

```
User --> Next.js (3000) --> Claude (tool calling) --> fi-open-api (3001) --> api.tryfi.com
```

The frontend handles session management (iron-session) and AI chat (Vercel AI SDK + Claude Haiku). The API microservice handles all TryFi authentication and GraphQL queries, making it reusable by other clients.

## Quick Start

```bash
# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install

# Set up environment variables
cp packages/web/.env.example packages/web/.env.local
# Edit with your SESSION_SECRET and ANTHROPIC_API_KEY

# Start both services
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your Fi account credentials.

## Commands

```bash
pnpm dev        # Start API + web in parallel
pnpm build      # Build both packages
```

## Environment Variables

Only the web package needs env vars:

| Variable | Location | Description |
|---|---|---|
| `SESSION_SECRET` | `packages/web/.env.local` | 32+ char secret for iron-session |
| `ANTHROPIC_API_KEY` | `packages/web/.env.local` | Anthropic API key for Claude |
| `FI_API_URL` | `packages/web/.env.local` | fi-open-api URL (default: `http://localhost:3001`) |

## Tech Stack

- **Monorepo**: pnpm workspaces
- **API**: Hono + @hono/node-server
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **AI**: Vercel AI SDK v6 + Claude Haiku (tool calling)
- **Session**: iron-session (encrypted HTTP-only cookies)
- **Charts**: recharts
- **TryFi API**: Reverse-engineered GraphQL from [pytryfi](https://github.com/sbabcock23/pytryfi)

## Project Structure

```
open-fi/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── api/                  # fi-open-api microservice
│   │   └── src/
│   │       ├── index.ts      # Hono server entry
│   │       ├── client.ts     # TryFi GraphQL client
│   │       ├── queries.ts    # GraphQL query builders
│   │       ├── types.ts      # Fi API type definitions
│   │       └── routes/
│   │           ├── auth.ts   # POST /auth/login
│   │           └── pets.ts   # GET /pets, /pets/:id/*
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # Pages + API routes
│           ├── components/   # Dashboard, chat, widgets
│           ├── lib/          # Session, API client, AI tools
│           └── types/        # TypeScript interfaces
```
