# Security

How Latrine Bot stores secrets, runs the loop, and isolates client accounts.

## What we store

| Item | Where | Encryption | Decrypted when |
|---|---|---|---|
| Dev wallet secret | Encrypted at rest, per project | AES-GCM with the service master key | At cycle invocation, in memory only, dropped after the runner returns |
| RPC URL | Encrypted at rest, per project | Same | Same |
| OAuth tokens (Google, X) | Encrypted at rest | Hashed where possible, sealed otherwise | Per request, never logged |
| Metrics keys | Hashed at rest (HMAC), per project | Constant-time compare on `X-Metrics-Key` requests | Never reversed |
| JWT signing key | Edge secret | Rotated on demand | Per JWT issue / verify |

The edge layer never logs plaintext secrets. The runner receives the dev wallet secret only as a one-time payload over an authenticated channel and discards it after the cycle.

## What we do not store

- Your seed phrase. The dashboard does not ask for it.
- Your password. Authentication is wallet-signed or OAuth-based.
- Plaintext OAuth refresh tokens beyond what is necessary to keep the session usable.

## Account isolation

Each login method creates a **distinct account**:

- Sign in with Solana - keyed by wallet pubkey.
- Google - keyed by `google:<sub>`.
- X - keyed by `x:<id>`.

Projects, settings, secrets, metrics keys, and event logs live under exactly one account. Two accounts with the same operator behind them do not share data unless you copy it manually.

## Preflight as a guardrail

Most "the bot did something weird" reports trace back to one of:

- The dev wallet was not actually the creator on Pump.fun.
- The RPC URL was rate-limited or pointed at a stale endpoint.
- The dev wallet had less than `minReserveSol` and the first cycle hung.

Preflight catches all three before Start. See [configuration](./configuration.md#preflight-checks) for the full list.

## Mainnet only

LIVE cycles sign and send real transactions on Solana mainnet. There is no testnet sandbox - any preflight error that says `Required: yes` will block Start.

The dashboard's Start button only unlocks when every `Required: yes` check is green.

## Disclosure

Found a real security issue? Email **latrine@atomicmail.io** with a clear reproduction. Please do not file public issues for vulnerabilities. We respond within two working days.

## What lives in private repos

For full transparency on what is **not** in any public repo:

- The on-chain engine: claim, buyback, snapshot, distribute, hold-history, retry policy, priority-fee strategy.
- The runner service that signs and sends transactions.
- The operator panel and its admin endpoints.

These do not need to be open for the product to be inspectable. The public surface (this docs folder, the OpenAPI spec, the SDK, the widgets, the calculator, and the CLI) is enough to integrate, audit the API, and understand the eligibility math.
