# @open-fi/web

Next.js frontend for open-fi. Features an AI chat interface powered by Claude that answers natural language questions about your dog, plus dashboard widgets showing real-time pet data.

## Features

- **AI Chat** — Ask "Where is my dog?", "How many steps today?", "How did she sleep?" and get natural language answers
- **Pet Profile** — Photo, name, breed, weight, age
- **Activity Widget** — Daily/weekly/monthly step counts with goal tracking
- **Location Widget** — Current location on OpenStreetMap
- **Device Status** — Battery level, collar connection, LED on/off toggle, color picker, signal strength, temperature
- **Lost Dog Mode** — Toggle to increase GPS tracking frequency when your dog is lost
- **Base Stations** — Wi-Fi base station status (online/offline, network name)
- **Activity Timeline** — Chronological feed of walks, rest, travel, play with pagination
- **Chat History** — Persisted in localStorage across page reloads

## Usage

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint
```

## Environment Variables

Create `.env.local`:

```env
SESSION_SECRET=your-32-char-secret-here
ANTHROPIC_API_KEY=sk-ant-...
FI_API_URL=http://localhost:3001
```

## How the AI Chat Works

1. User types a question in the chat panel
2. Message sent to `POST /api/chat` via Vercel AI SDK's `useChat()` hook
3. Route handler calls `streamText()` with Claude Haiku + tool definitions
4. Claude decides which Fi tools to call (e.g., `get_pet_activity`)
5. Tools call `@open-fi/api` microservice, which queries TryFi's GraphQL API
6. Claude formats the data into a natural language response
7. Response streams back token-by-token to the chat UI

### AI Tools

| Tool | Description |
|---|---|
| `get_pets` | List all pets with basic info |
| `get_pet_location` | Current location and activity |
| `get_pet_activity` | Step counts and distance (daily/weekly/monthly) |
| `get_pet_sleep` | Sleep and nap durations |
| `get_pet_details` | Comprehensive overview (activity + sleep + location + device) |
| `get_device_status` | Collar battery, connection, LED, firmware, temperature |
| `set_led_color` | Change the collar LED color by name |
| `set_lost_mode` | Toggle Lost Dog Mode on/off |
| `get_timeline` | Recent activity feed (walks, rest, travel, notifications) |

## Layout

```
+--------------------------------------------------+
|  open-fi                              [Logout]    |
+------------------------+-------------------------+
|                        |  Pet Profile Card        |
|                        +-------------------------+
|    Chat Panel          |  Activity Widget         |
|                        +-------------------------+
|  "Where is Luna?"      |  Location Widget         |
|  "Luna is at home..."  +-------------------------+
|                        |  Device Status           |
|                        +-------------------------+
|                        |  Base Stations           |
|                        +-------------------------+
|  [Ask about Luna...]   |  Timeline Feed           |
+------------------------+-------------------------+
```

- Left panel (60%): Chat with streaming responses
- Right panel (40%): Persistent widgets (hidden on mobile, accessible via sheet)

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS 4** + **shadcn/ui** (base-nova style)
- **Vercel AI SDK v6** (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/react`)
- **iron-session** — encrypted cookie-based sessions
- **recharts** — activity charts
- **@diceui/timeline** — timeline feed component
- **Inter + JetBrains Mono** fonts

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Root redirect
│   ├── login/page.tsx            # Login page
│   ├── dashboard/
│   │   ├── layout.tsx            # Session guard
│   │   └── page.tsx              # Dashboard (SSR data fetch)
│   └── api/
│       ├── auth/login/route.ts   # Login via fi-open-api
│       ├── auth/logout/route.ts  # Clear session
│       ├── chat/route.ts         # AI streaming chat
│       ├── timeline/route.ts     # Timeline pagination proxy
│       └── device/[petId]/
│           ├── led/             # PUT — change collar LED color
│           ├── led-toggle/      # PUT — toggle LED on/off
│           └── lost-mode/       # PUT — toggle Lost Dog Mode
├── components/
│   ├── dashboard.tsx             # Two-panel layout
│   ├── chat-panel.tsx            # Chat UI (useChat hook)
│   ├── chat-message.tsx          # Message bubbles
│   ├── pet-profile-card.tsx      # Dog profile
│   ├── activity-widget.tsx       # Step stats
│   ├── location-widget.tsx       # Map embed
│   ├── device-status-widget.tsx  # Collar status + battery + lost mode
│   ├── base-stations-widget.tsx  # Wi-Fi base stations
│   ├── timeline-widget.tsx       # Activity timeline feed
│   ├── login-form.tsx            # Login form
│   └── ui/                       # shadcn primitives
├── lib/
│   ├── api-client.ts             # Typed fetch wrapper for fi-open-api
│   ├── ai-tools.ts               # Claude tool definitions
│   ├── session.ts                # iron-session config
│   └── utils.ts                  # cn() helper
└── types/
    ├── fi.ts                     # Fi API response types
    └── session.ts                # Session shape
```
