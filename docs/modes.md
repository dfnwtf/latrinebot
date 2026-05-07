# Modes

Latrine Bot is **LIVE-only** for clients.

## LIVE

The default and only mode available to dashboard users. Every cycle hits the network:

- Real claim from the bonding curve or PumpSwap creator-share wallet.
- Real buyback through Pump.fun or PumpSwap routes.
- Real airdrop transfers signed by your dev wallet.

There is no way to "test" against mainnet without running a real cycle. The preflight step is the substitute - it validates that the wallet, mint, RPC, and runner are wired correctly **before** the first cycle.

## SIM and DRY (legacy)

Earlier service versions exposed `SIM` (synthetic cycles inside the Worker) and `DRY` (build-but-do-not-send transactions). These are no longer available to client dashboards.

The Worker still understands the modes internally, so older accounts created before LIVE-only enforcement remain functional, but:

- New projects are created with `mode: "LIVE"`.
- `PATCH /api/projects/:id` rejects attempts to change `mode`.
- `POST /api/projects/:id/control/start` and `…/run-once` call `ensureLiveForClient()` before scheduling.

If you have a use case for synthetic cycles (rehearsal, demo, video capture), open an issue in [latrinebot-docs](https://github.com/dfnwtf/latrinebot-docs) so we can decide whether to expose a public demo endpoint.

## Switching from LIVE back to off

Stop a project with `POST /api/projects/:id/control/stop`. The scheduler unregisters the project from its Durable Object; no further cycles run until you call `…/control/start` again.

Stopping does not delete state. Stats, event log, eligibility history, and credentials are all preserved.
