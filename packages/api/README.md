# @open-fi/api

Standalone REST microservice wrapping the undocumented [TryFi](https://tryfi.com) GraphQL API. Handles authentication and exposes clean endpoints for pet data.

## Endpoints

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ userId, sessionId, fiCookies }` |

### Pets

All pet endpoints require authentication headers:
- `X-Fi-Cookies` — Fi session cookies (from login response)
- `X-Session-Id` — Fi session ID (from login response)

| Method | Path | Response |
|---|---|---|
| GET | `/pets` | Array of all pets with device info |
| GET | `/pets/:id/location` | Current location/activity |
| GET | `/pets/:id/activity` | Daily/weekly/monthly step counts + distance |
| GET | `/pets/:id/sleep` | Daily/weekly/monthly sleep/nap durations |
| GET | `/pets/:id/details` | Comprehensive pet info (activity, sleep, location, device) |
| GET | `/pets/:id/device` | Collar status (connection, LED, firmware) |
| PUT | `/pets/:id/device/led` | `{ ledColorCode }` — Change collar LED color |
| PUT | `/pets/:id/device/led-toggle` | `{ ledEnabled }` — Turn collar LED on/off |

### Health

| Method | Path | Response |
|---|---|---|
| GET | `/health` | `{ status: "ok" }` |

## Usage

```bash
# Development (hot reload)
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

### Standalone example

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"..."}'

# Get pets (use fiCookies from login response)
curl http://localhost:3001/pets \
  -H "X-Fi-Cookies: i18next=en-US; fi.sid=s%3A..." \
  -H "X-Session-Id: abc123"

# Get pet location
curl http://localhost:3001/pets/PET_ID/location \
  -H "X-Fi-Cookies: ..." \
  -H "X-Session-Id: ..."
```

## Stack

- **Hono** — lightweight web framework
- **@hono/node-server** — Node.js adapter
- **tsx** — TypeScript execution (dev)

## How It Works

1. Client sends Fi credentials via headers on each request
2. API forwards credentials as cookies to `api.tryfi.com/graphql`
3. GraphQL queries are built from exact strings reverse-engineered from [pytryfi](https://github.com/sbabcock23/pytryfi)
4. Responses are passed through as JSON

The API is stateless — it doesn't store sessions or credentials. Authentication state is managed by the caller.

## CORS

Configured to allow requests from `http://localhost:3000` (the web frontend). Modify `src/index.ts` to change allowed origins.
