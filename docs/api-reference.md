# API reference

The Latrine Bot HTTP API at `https://api.latrinebot.com`.

For a machine-readable description see the OpenAPI 3.1 spec in [`@latrinebot/sdk`](https://github.com/dfnwtf/latrinebot-sdk/blob/main/openapi.yaml).

## Versions

| Channel | Path | Status |
|---|---|---|
| Discovery | `/api/v1` | Live |
| Auth | `/api/auth/...` | Live |
| Session | `/api/projects/...` | Live |
| Metrics | `/api/v1/projects/.../metrics`, `…/events` | Live |
| Public | `/api/public/...` | Live |

Pre-1.0 the service may add fields and endpoints. Breaking changes inside `0.x` are listed in the [service changelog](https://github.com/dfnwtf/latrinebot-changelog/blob/main/CHANGELOG.md) under **Breaking**.

## Authentication

Three flavours:

- **Session (Bearer JWT)** for dashboard endpoints. Get a JWT by:
  - `POST /api/auth/verify` after signing the SIWS challenge from `GET /api/auth/challenge?wallet=`.
  - `POST /api/auth/complete-oauth` with the `login_code` returned by the Google or X callback.
- **`X-Metrics-Key`** for the read-only metrics endpoints.
- **Public** for everything under `/api/public/...` and the discovery endpoints. No auth.

## Discovery

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` or `/api` | none | JSON landing |
| GET | `/api/health` | none | Health + on-chain engine status |
| GET | `/api/v1` | none | API name + version |

## Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/auth/challenge?wallet=` | none | SIWS nonce |
| POST | `/api/auth/verify` | none | Verify signed SIWS, returns JWT |
| GET | `/api/auth/providers` | none | Which OAuth providers are enabled |
| GET | `/api/auth/google` | none | Start Google OAuth |
| GET | `/api/auth/google/callback` | none | Google callback |
| GET | `/api/auth/x` | none | Start X OAuth (PKCE) |
| GET | `/api/auth/x/callback` | none | X callback |
| POST | `/api/auth/complete-oauth` | none | Exchange `login_code` for JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/logout` | Bearer | Clear server session |

## Projects

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects` | Bearer | List your projects |
| POST | `/api/projects` | Bearer | Create project (always `mode: LIVE`) |
| GET | `/api/projects/symbol?mint=` | Bearer | Resolve a mint's symbol |
| GET | `/api/projects/:id` | Bearer | Get project |
| PATCH | `/api/projects/:id` | Bearer | Update name / mint / settings (cannot change `mode`) |
| DELETE | `/api/projects/:id` | Bearer | Delete project |
| POST | `/api/projects/:id/tiers/reset-default` | Bearer | Reset tier table to defaults |

`PATCH .../settings` accepts `rewardAsset` (`{ kind: "SAME" | "SOL" | "USDC" | "CUSTOM", mint }`) to choose what holders receive; `mint` is required only for `CUSTOM`. Invalid input degrades to `SAME`. The last drop's ticker is exposed as `stats.lastRewardSymbol`. Full field reference: [configuration](./configuration.md#reward-asset-what-holders-receive).

### Credentials

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/projects/:id/secrets` | Bearer | Save dev wallet secret + RPC URL (sensitive) |
| GET | `/api/projects/:id/credentials` | Bearer | Metadata only - pubkey + redacted RPC host |
| POST | `/api/projects/:id/credentials/test` | Bearer | Test RPC reachability |

### Lifecycle

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects/:id/preflight` | Bearer | Run all preflight checks |
| GET | `/api/projects/:id/status` | Bearer | Running state + stats |
| GET | `/api/projects/:id/stats` | Bearer | Stats bucket |
| GET | `/api/projects/:id/events?limit=` | Bearer | Event log |
| GET | `/api/projects/:id/stream?token=` | JWT or metrics key in query | SSE live updates |
| POST | `/api/projects/:id/control/start` | Bearer | Start scheduler |
| POST | `/api/projects/:id/control/stop` | Bearer | Stop scheduler |
| POST | `/api/projects/:id/control/run-once` | Bearer | Force a single cycle now |

### Widgets

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects/:id/widgets` | Bearer | List widgets |
| POST | `/api/projects/:id/widgets` | Bearer | Create widget |
| GET | `/api/projects/:id/widgets/:widgetId` | Bearer | Get widget |
| PATCH | `/api/projects/:id/widgets/:widgetId` | Bearer | Partial update |
| PUT | `/api/projects/:id/widgets/:widgetId` | Bearer | Replace config |
| DELETE | `/api/projects/:id/widgets/:widgetId` | Bearer | Delete widget |

### Share card

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects/:id/share-card/bundle` | Bearer | PNG + caption |
| GET | `/api/projects/:id/share-card/caption` | Bearer | Caption only |
| GET | `/api/projects/:id/share-card.png` | Bearer | Raw PNG |
| POST | `/api/projects/:id/share-card/post-x` | Bearer | Post to X using server credentials |

### Metrics keys

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects/:id/keys` | Bearer | List metrics keys (metadata only) |
| POST | `/api/projects/:id/keys` | Bearer | Create metrics key (returns plaintext **once**) |
| DELETE | `/api/projects/:id/keys/:keyId` | Bearer | Revoke metrics key |

## Metrics (read-only)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/projects/:id/metrics` | `X-Metrics-Key` | Stats snapshot |
| GET | `/api/v1/projects/:id/events?limit=` | `X-Metrics-Key` | Event tail |

See [metrics API](./metrics-api.md) for full payload shapes.

## Public (no auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/public/widgets/:id/config` | Widget layout + theme (cached 60 s) |
| GET | `/api/public/widgets/:id/live` | Widget stats + event tail (cached 5 s, 120 req/min/IP) |
| GET | `/api/public/realm/:id/live` | Per-token public LIVE stats (LIVE-mode realms only) |
| GET/POST | `/api/public/realm/:id/check-eligibility` | Public eligibility lookup (`?wallet=` or JSON body) |
| GET | `/api/public/realm/:id/share-card/bundle` | Per-token public share card |
| GET | `/api/public/ward-roll` | Ward-roll realm listing (`?faces=1` for hero faces) |

## Rate limits

Public endpoints carry per-IP limits (120 req/min/IP on widget `live`, 60 req/min on most others). Authenticated endpoints are per-account. Exceeding a limit returns `429` with `Retry-After`.

## Errors

All error responses are JSON:

```json
{
  "error": {
    "code": "preflight_blocked",
    "message": "Required preflight check failed: dev_is_creator",
    "fields": ["dev_is_creator"]
  }
}
```

`error.code` values are stable - safe to switch on.
