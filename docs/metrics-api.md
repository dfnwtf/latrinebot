# Metrics API

Read-only stats and events for one project. Designed for widgets, OBS overlays, dashboards, and other read-only integrations that should not have full project credentials.

If you want the same 6 tiles shown on token pages (Airdrops sent, To holders (SOL est.), Holders paid, Eligible now, Tokens burned, Creator fees claimed), use:

- `/api/public/realm/<PROJECT_ID>/live` (per-token public stats)
- `/api/public/widgets/<WIDGET_ID>/live` (widget live payload)

Those endpoints do not require a metrics key and return derived `publicStats`.

## Authentication

A metrics key is a per-project read-only token. It is created in the dashboard under **Metrics keys** and looks like:

```
lb_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

You authenticate by sending the key in the `X-Metrics-Key` header:

```http
GET /api/v1/projects/<PROJECT_ID>/metrics HTTP/1.1
Host: api.latrinebot.com
X-Metrics-Key: lb_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

Keys are scoped to one project. They cannot read other projects, cannot mutate state, and cannot read secrets.

To rotate a key, create a new one and `DELETE /api/projects/<PROJECT_ID>/keys/<KEY_ID>` for the old one.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/projects/<PROJECT_ID>/metrics` | Current stats snapshot |
| GET | `/api/v1/projects/<PROJECT_ID>/events?limit=N` | Last `N` events (1-200, default 50) |

Both are cached for a few seconds at the edge.

## Response - metrics snapshot

```json
{
  "running": true,
  "mode": "LIVE",
  "stats": {
    "cycles": 142,
    "totalClaimedSol": 12.4621,
    "totalBuybackSol": 10.8732,
    "totalBoughtTokensUi": 12450000,
    "totalAirdropTokensUi": 12450000,
    "totalAirdropTokensMillions": 12.45,
    "airdropsCount": 142,
    "uniqueHoldersPaidCount": 184,
    "lastMarketCapUsd": 412000,
    "lastPriceUsd": 0.000412,
    "lastTierMcUsd": 250000,
    "lastTierMinTokens": 300000,
    "lastTierHoldCycles": 10,
    "lastCycleAt": "2026-05-26T19:14:22.103Z",
    "lastClaimAt": "2026-05-26T19:14:18.901Z",
    "lastAirdropAt": "2026-05-26T19:14:22.103Z"
  }
}
```

All token amounts are in **UI units** (i.e. `1_000_000` tokens, not base units). SOL is in floats.

## Response - events

```json
{
  "events": [
    {
      "id": 4123,
      "ts": "2026-05-26T19:14:22.103Z",
      "kind": "airdrop.sent",
      "title": "Airdrop sent",
      "detail": "184 wallets, 87 k tokens",
      "severity": "info"
    },
    {
      "id": 4122,
      "ts": "2026-05-26T19:14:18.901Z",
      "kind": "buyback.executed",
      "title": "Buyback executed",
      "detail": "0.21 SOL -> 87 k tokens",
      "severity": "info"
    }
  ]
}
```

Event kinds are stable. New kinds may appear over time but existing kinds will not change shape inside `0.x`.

## Streaming updates

If you want push instead of pull, the dashboard's SSE endpoint `GET /api/projects/<PROJECT_ID>/stream?token=…` accepts a metrics key in the `token` query string (the URL token form is required because browsers cannot set custom headers on `EventSource`).

```js
const es = new EventSource(
  `https://api.latrinebot.com/api/projects/${PROJECT_ID}/stream?token=${METRICS_KEY}`,
);
es.addEventListener('event', (e) => {
  const ev = JSON.parse(e.data);
  console.log(ev.kind, ev.detail);
});
```

## Rate limits

| Endpoint | Limit |
|---|---|
| `GET /api/v1/projects/:id/metrics` | 60 req/min/key |
| `GET /api/v1/projects/:id/events` | 60 req/min/key |
| `GET /api/projects/:id/stream` | 1 open SSE per key, replaced on reconnect |

Exceeding the limit returns `429 Too Many Requests` with a `Retry-After` header.
