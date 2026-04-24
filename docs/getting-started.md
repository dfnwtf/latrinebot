# Getting started

Five minutes from a fresh account to a running bot.

## 1. Sign in

Open [latrinebot.com/app](https://latrinebot.com/app) and sign in with any of:

- **Sign in with Solana** - connect Phantom (or any Solana wallet that supports SIWS). No password.
- **Google** - one-tap Google account.
- **X** - sign in with your X (Twitter) account.

The three login methods create **separate accounts**. If you sign in with Google today and Phantom tomorrow, you get two accounts with two separate project lists. Pick one and stick with it.

## 2. Create a project

Click `+ New project` on the dashboard and fill in:

- **Name** - free text, only shown in your dashboard.
- **Mint** - the SPL or Token-2022 mint address of your Pump.fun token.

The dashboard auto-resolves the symbol from the on-chain metadata.

## 3. Connect your dev wallet

Open the project and go to `Credentials`:

- **Dev wallet secret key** - base58 secret key (or `[1,2,3,...]` JSON keypair array). This is the wallet that received the token's creator fees on Pump.fun.
- **RPC URL** - your Helius / QuickNode / Triton URL. The service does **not** ship a shared RPC for projects.

Both are encrypted server-side with the service master key and only decrypted at cycle invocation. Hit `Save`. Then `Test RPC` to confirm the URL is reachable.

## 4. Tune your settings

Defaults are sane. The ones you usually want to touch:

| Field | Default | When to change |
|---|---|---|
| `minClaimSol` | `0.005` | Raise it if you want to wait for bigger fee piles before each round. |
| `minReserveSol` | `0.05` | Raise it if you have hundreds of eligible holders (more transfer + rent costs). |
| `buybackPercent` | `100` | Lower if you want to leave more dev-wallet SOL between rounds. |
| `slippageBps` | `500` (5 %) | Raise on illiquid PumpSwap pools. |
| `eligibilityTiers` | 13-row default | Tune floor / hold cycles per MC band. |
| `maxHolderBalance` | `20 000 000` | Anti-whale cap. Set `0` to disable. |

Full reference in [configuration](./configuration.md).

## 5. Preflight

Click `Run preflight`. You will see a checklist:

- Dev wallet present and signs - **required**
- Mint resolves on-chain - **required**
- Dev wallet is recognized as token creator - **required**
- RPC reachable - **required**
- Reserve balance covers one cycle (`minReserveSol`) - **required**
- Runner is reachable - **required**
- Market data available (DexScreener listing) - informational
- Recommended balance (`minReserve + minClaim`) - informational

A red check that says `Required: yes` blocks the next step. Fix it, then re-run preflight.

## 6. Start

When the required checks pass, the `Start` button unlocks. Hit it.

The first cycle runs as soon as the scheduler picks it up (within a few seconds). You will see live events in the project view and via SSE on `/api/projects/:id/stream`.

## What runs in the cloud

Everything from step 5 onwards. The dashboard, the scheduler, the runner, the metrics endpoint, and the public widget endpoints all live on `api.latrinebot.com`. You do not need to keep your laptop on.

## What is next

- Add a [widget](./widgets.md) to your token page so holders can see the live cycle.
- Issue a [metrics key](./metrics-api.md#authentication) for read-only access to your stats and event feed.
- Add hashtags and screenshots on `@Latrine_bot` so other devs find you.
