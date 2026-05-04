# Configuration

Every setting you can edit in the dashboard, what it does, and what the default is.

## Project settings

Edit at `/app/projects/:id` -> **Settings**. Saved with `PATCH /api/projects/:id`.

### Identity

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Internal label only. Not shown publicly. |
| `mint` | string | `""` | SPL or Token-2022 mint address. Lock once the bot has run a cycle. |

### Cycle pacing

| Field | Type | Default | Notes |
|---|---|---|---|
| `cycleIntervalSec` | int | `60` | Seconds between cycle attempts. The scheduler may stretch the next run if a cycle is still finishing. |
| `minClaimSol` | float | `0.005` | Minimum claim before the cycle proceeds to buyback. Smaller claims are deferred to the next round. |
| `minReserveSol` | float | `0.05` | SOL kept in the dev wallet at all times. The cycle will skip the buyback rather than dip below this. |

### Buyback

| Field | Type | Default | Notes |
|---|---|---|---|
| `buybackPercent` | int (0-100) | `100` | What percentage of the **claim minus reserve and airdrop costs** to spend on the buyback. |
| `slippageBps` | int | `500` | Slippage tolerance in basis points (`500` = 5 %). Raise for low-liquidity PumpSwap pools. |

### Eligibility

| Field | Type | Default | Notes |
|---|---|---|---|
| `minHolderBalance` | int | `500 000` | Fallback floor when no MC is available and the tier table is empty. |
| `maxHolderBalance` | int | `20 000 000` | Anti-whale cap (2 % of fixed 1 B supply). Set `0` to disable. |
| `eligibilityTiers` | row[] | 13-row default | See [eligibility](./eligibility.md) for the full default table. |

A tier row has shape:

```json
{ "mcUsd": 250000, "minTokens": 300000, "holdCycles": 10 }
```

Rows are sorted by `mcUsd` ascending. The engine picks the highest row whose `mcUsd <= current market cap`.

## Wallet credentials

Edit at `/app/projects/:id` -> **Credentials**. Saved with `POST /api/projects/:id/secrets`.

| Field | Notes |
|---|---|
| Dev wallet secret | Base58 secret key **or** `[1,2,3,...]` JSON keypair array. Stored encrypted with the service master key. |
| RPC URL | Your Helius / QuickNode / Triton URL. Tested before save. |

After save, only `pubkey` and a redacted RPC host are returned by `GET /api/projects/:id/credentials`.

## Metrics keys

A metrics key is a read-only token scoped to one project. It can read `/api/v1/projects/:id/metrics` and `/api/v1/projects/:id/events` and nothing else.

Manage them at `/app/projects/:id` -> **Metrics keys**. CRUD on `GET/POST /api/projects/:id/keys` and `DELETE /api/projects/:id/keys/:keyId`.

## Preflight checks

| Check | Required | What it verifies |
|---|---|---|
| `dev_wallet_present` | yes | Encrypted secret stored, public key derivable. |
| `mint_resolves` | yes | The mint exists on Solana (SPL or Token-2022). |
| `dev_is_creator` | yes | The dev wallet is either bonding-curve `creator`, vault wallet, or PumpSwap creator-share wallet. |
| `rpc_reachable` | yes | RPC URL responds and the wallet balance can be fetched. |
| `balance_reserve` | yes | Dev wallet has at least `minReserveSol`. |
| `runner_reachable` | yes | The Node runner responds to a health probe. |
| `mint_market` | no | DexScreener has a listing for the mint. |
| `balance_recommended` | no | Dev wallet has at least `minReserveSol + minClaimSol` (enough to also fund a first buyback). |

`Required: yes` blocks Start. `Required: no` shows yellow and starts anyway.

## Defaults at a glance

```json
{
  "cycleIntervalSec": 60,
  "minHolderBalance": 500000,
  "maxHolderBalance": 20000000,
  "minClaimSol": 0.005,
  "minReserveSol": 0.05,
  "slippageBps": 500,
  "buybackPercent": 100,
  "eligibilityTiers": [
    { "mcUsd":         0, "minTokens": 500000, "holdCycles": 5 },
    { "mcUsd":     50000, "minTokens": 450000, "holdCycles": 6 },
    { "mcUsd":    100000, "minTokens": 400000, "holdCycles": 8 },
    { "mcUsd":    250000, "minTokens": 300000, "holdCycles": 10 },
    { "mcUsd":    500000, "minTokens": 220000, "holdCycles": 12 },
    { "mcUsd":   1000000, "minTokens": 150000, "holdCycles": 15 },
    { "mcUsd":   2500000, "minTokens": 110000, "holdCycles": 22 },
    { "mcUsd":   5000000, "minTokens":  75000, "holdCycles": 30 },
    { "mcUsd":  10000000, "minTokens":  55000, "holdCycles": 40 },
    { "mcUsd":  15000000, "minTokens":  40000, "holdCycles": 50 },
    { "mcUsd":  25000000, "minTokens":  30000, "holdCycles": 60 },
    { "mcUsd":  50000000, "minTokens":  22000, "holdCycles": 80 },
    { "mcUsd": 100000000, "minTokens":  15000, "holdCycles": 100 }
  ]
}
```
