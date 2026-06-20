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
| `buybackPercent` | int (0-100) | `100` | What percentage of the **claim minus reserve and airdrop costs** to spend acquiring the reward asset. |
| `slippageBps` | int | `500` | Slippage tolerance in basis points (`500` = 5 %). Applies to buyback and Jupiter swaps. Raise for low-liquidity pools. |

### Reward asset (what holders receive)

Eligibility and holder snapshots are **always** computed against the project mint - holders must hold your token to qualify. Only the **distributed asset** is configurable, via `rewardAsset`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `rewardAsset.kind` | `SAME` \| `SOL` \| `USDC` \| `CUSTOM` | `SAME` | `SAME`: buy & airdrop the project token (buyback). `SOL`: split claimed SOL directly (no swap, no ATA rent). `USDC`: swap SOL to USDC via Jupiter. `CUSTOM`: swap SOL to any SPL mint via Jupiter. |
| `rewardAsset.mint` | string \| null | `null` | Base58 SPL mint to distribute. Required only for `CUSTOM` (must have a tradable Jupiter route). Ignored for other kinds. |

Notes:

- All reward kinds stay **self-financing**: gas, ATA rent, and (for USDC/custom) the Jupiter swap are paid from claimed creator fees before sizing the spend.
- Logs and overlay show the reward token's own ticker (e.g. `$USDC` or your custom symbol), not the project ticker. The last drop's ticker is exposed as `stats.lastRewardSymbol`.
- An invalid or routeless `rewardAsset` safely degrades to `SAME`, so existing projects keep working with no migration.

```json
{ "rewardAsset": { "kind": "CUSTOM", "mint": "REWARD_MINT_BASE58" } }
```

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

### Public distribution transparency

When a project owner saves policy-affecting settings (`PATCH` with `settings`), the API **always** appends public `POLICY` events. There is **no toggle to disable** this and **no setting** to change major-cut rules or hide lines from the token page.

**Triggers**

| Change | Log |
|---|---|
| Fee split (`buybackPercent`, `burnPercent`, hold %) | `Distribution changed. Holders X% -> Y%. Burn … Hold …` |
| Major holder cut (platform rule) | `Major distribution cut. …` with severity `alert` when airdrop % drops **≥20 pp** or to **0%** |
| `rewardAsset` | `Payout currency changed: …` |
| `holderRewardChoiceEnabled` | enabled / disabled message |
| `socialClaimEnabled` | X post boost enabled / disabled message |
| `holdFund` | `Creator hold fund: …` when hold % &gt; 0 (simple reserve, goal + purpose, or Dex Vault selected/active) |

**Where it appears**

- Token page banner (`poolSplit`, `publicFeatures` on `GET .../realm/:id/live`)
- Sidebar **Distribution history** (`policyHistory`, up to 50 entries from permanent audit storage)
- Public activity log + permanent sticky banner for the latest change (`policyAlert`, until the next change)
- Dashboard Output (`GET .../events` / SSE) - same `POLICY` text

**Storage:** policy changes are written to a dedicated `project_policy_log` table (up to **100** entries per project) so they are not lost when cycle event spam is trimmed. The activity log tail is separate (up to **120** displayed lines, **200** non-`POLICY` events per project in the events table).

Token page polls about every **20 s**. The dashboard confirms before saving when a public policy change is detected.

Full API: [web configuration](https://latrinebot.com/docs/configuration.html#distribution-transparency), [API reference](https://latrinebot.com/docs/api-reference.html#distribution-transparency).

### Hold fund transparency

When your **Creator fee split** keeps a non-zero **hold** slice, part of each cycle's pooled creator fees is reserved for your hold fund. In **simple** and **goal** modes the reserve stays on the dev wallet (`stats.totalHeldSol`). In **Dex Vault** mode hold fees transfer to a per-project vault each cycle until DexScreener is paid. The dashboard block **Hold fund transparency** lets you explain why you keep that slice and, optionally, show progress toward a SOL goal or Dex payment on the token page and [Stream Studio](https://latrinebot.com/docs/stream-studio.html) `hold-vault` overlay.

This is **not** holder **hold cycles** in the tier table. Hold cycles gate eligibility streaks; hold fund is the creator's fee-split reserve counter.

| Dashboard mode | `settings.holdFund` | Token page | Stream Studio |
|---|---|---|---|
| **Simple hold** | `{ mode: "simple", template: null, customLabel: "", goalSol: 0 }` | No extra hold card (only hold % in fee split bar). | Compact read-only card: purpose + held SOL + hold %. |
| **Hold with a goal** | `{ mode: "goal", template, customLabel?, goalSol }` | **Hold fund transparency** card when template is set. | Same data; optional progress when `goalSol > 0`. |
| **Dex Vault** | `{ mode: "guaranteed", guaranteed: { … } }` | **Dex Vault** card with full `purposeLine`. | Short `purposeLineShort` + status `Accumulating`. |

Purpose templates in goal mode: `dex` (Dex Paid), `boost` (Dex Boost Paid), `ad` (Dex Ad Paid), `custom` (your label, max 80 chars). Goal SOL is optional but required for a progress bar.

**Dex Vault** (API `mode: "guaranteed"`): irreversible after **Activate Dex Vault**. Hold slice routes to a per-project vault until Latrine pays DexScreener Enhanced Token Info (~$299). Dev cannot spend vault funds. Dashboard routes: `POST /api/projects/:id/hold-fund/guaranteed/{upload,preflight,draft,reset,enable}`. Public prefill images: `GET /api/public/hold-fund/:projectId/{icon,header}`.

Only you edit hold fund in the dashboard. Stream Studio and the token page are **read-only**. In simple/goal mode `holdFund.heldSol` mirrors `stats.totalHeldSol` on the dev wallet. In Dex Vault mode `holdFund.heldSol` mirrors on-chain vault balance.

Full docs: [web configuration](https://latrinebot.com/docs/configuration.html#hold-fund-transparency).

### Holder reward choice (Holder perk)

| Field | Type | Default | Notes |
|---|---|---|---|
| `holderRewardChoiceEnabled` | bool | `false` | When on, eligible holders can save a payout preference (SAME / SOL / USDC) on the token page via SIWS. Eligibility stays on the project mint. |

### X post boost (Boost)

Optional social perk on the token page. Anyone posts on X, then pastes the post URL + wallet (no SIWS).

**Core rules**

| Rule | Detail |
|---|---|
| Active window | **1 hour** by default (`socialBoostDurationMin: 60`, range 5-1440 via PATCH) |
| One post URL per token, forever | Each X URL (`tweet_id`) is claimable **once per project, globally** (`409` on reuse). First valid claim wins |
| One active claim per wallet per token | While `boost_until` is active, that wallet cannot claim a second post on **this** token (`409` + `boostUntil`). After the hour, use a **new** post URL |
| Different wallets, same token | Each wallet can claim its own post URL (each URL still once) |
| Same wallet, other tokens | Limits are per token - parallel boosts on other projects are allowed |
| Boost again | New X post + new URL after window ends or after payout |
| LIVE only | Requires `mode: LIVE`, mint set, `socialClaimEnabled: true` |

**Per cycle (after hold-cycle gate)**

- **Eligible holder** (balance + streak): weight x `socialHolderBoostMultiplier` (default 1.15)
- **Everyone else** (no bag, below floor, anti-whale, or streak not met): small intro share with virtual weight = `socialNonHolderWeightRatio` x tier `minTokens` (default 8%), dev default cohort only (`socialOnly`)

Does not change eligibility history or bypass hold streaks for full tier status.

| Field | Type | Default | Notes |
|---|---|---|---|
| `socialClaimEnabled` | bool | `false` | Shows Boost panel; server fetches and validates tweet text |
| `socialBoostDurationMin` | int | `60` | Active window in minutes (5-1440). Not in dashboard UI yet |
| `socialHolderBoostMultiplier` | float | `1.15` | Multiplier for eligible holders with an active boost (1-3) |
| `socialNonHolderWeightRatio` | float | `0.08` | Virtual weight for non-holders as a fraction of tier `minTokens` (0-0.5) |

Post must include `$TICKER` (with `$`), full project mint, `@Latrine_bot` (or `X_TWITTER_HANDLE`), and at most one Solana address in the body. Suggested copy: `GET .../social-claim` → `template`.

Full docs: [web configuration](https://latrinebot.com/docs/configuration.html#social-claim-boost).

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
| `reward_asset` | conditional | For `USDC`/`CUSTOM` rewards: **required** read-only Jupiter swap-route probe. For `SOL`/project-token rewards: informational. |
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
  "rewardAsset": { "kind": "SAME", "mint": null },
  "holderRewardChoiceEnabled": false,
  "socialClaimEnabled": false,
  "socialBoostDurationMin": 60,
  "socialHolderBoostMultiplier": 1.15,
  "socialNonHolderWeightRatio": 0.08,
  "holdFund": { "mode": "simple", "template": null, "customLabel": "", "goalSol": 0 },
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
