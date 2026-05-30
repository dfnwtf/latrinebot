# Changelog

All notable changes to the Latrine Bot service. Dates are production deploys to `api.latrinebot.com`.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/). This project follows semantic-ish versioning while pre-1.0 - see [README.md](./README.md).

## [0.4.4] - 2026-05-29

### Added
- **Choosable reward asset.** `settings.rewardAsset` (`{ kind, mint }`) lets a project airdrop the project token (`SAME`, buyback), native `SOL`, `USDC`, or any `CUSTOM` SPL mint. USDC/custom rewards are acquired with a Jupiter swap from claimed fees; SOL is split directly. Eligibility is still computed on the project mint.
- Preflight `reward_asset` check: read-only Jupiter swap-route probe (required for `USDC`/`CUSTOM`, informational for `SOL`/project token).
- New stats fields: `lastRewardKind`, `lastRewardMint`, `lastRewardSymbol`, and `totalAirdropSol`. Logs and overlay now show the reward token's own ticker instead of the project ticker.

### Changed
- `buybackPercent` / `slippageBps` now describe acquiring the reward asset (buyback or Jupiter swap), not just the project-token buyback.
- OpenAPI spec and `@latrinebot/sdk` types updated with `RewardAsset`, `rewardAsset` on `ProjectSettings`, reward stats, and the `reward_asset` preflight code.

### Fixed
- Custom-token airdrops logged the project ticker (e.g. `$BITCH`) instead of the reward token's ticker (e.g. `$CUM`); the public log and overlay now resolve and display the reward token's symbol.

## [0.4.3] - 2026-05-27

### Added
- Preflight `Required` vs informational checks: market data (`mint_market`) and `balance_recommended` are now flagged as non-blocking, so a missing DexScreener listing no longer prevents Start.
- Configuration docs page with a full settings reference and preflight table.

### Changed
- Client API is **LIVE-only**. SIM and DRY modes are removed from the dashboard and from project creation defaults. `PATCH /api/projects/:id` rejects `mode` changes.
- Documentation rewrite across `getting-started`, `configuration`, `modes`, `api-reference`, `metrics-api`, `security`, `eligibility`, `how-it-works`, `widgets`.
- Getting started page no longer claims OAuth is "shown only when enabled on the server".

### Fixed
- Preflight UI race: refreshing the dashboard while a preflight call was in flight no longer duplicates checklist items.

## [0.4.2] - 2026-05-26

### Added
- Launch readiness preflight endpoint `GET /api/projects/:id/preflight` returning per-check `ok`, `severity`, and explanatory text.
- `assertDevIsPumpCreator()` enforced on `POST /api/projects/:id/control/start` and `…/control/run-once`.
- Share-to-X from dashboard: `POST /api/projects/:id/share-card/post-x` (server-side X credentials).

### Changed
- Creator verification expanded beyond `bondingCurve.creator`: also matches creator-vault and PumpSwap-graduated wallets via `getCreatorVaultBalanceBothPrograms()`.
- New projects default to `mode: 'LIVE'` server-side.

### Fixed
- Graduated tokens (post bonding curve) now claim and buy via PumpSwap routes; pre-graduation tokens continue on Pump.fun.

## [0.4.1] - 2026-05-25

### Added
- Public widget embed endpoints: `GET /api/public/widgets/:id/config`, `GET /api/public/widgets/:id/live`.
- Per-token public share-card: `GET /api/public/realm/:id/share-card/bundle`.
- Public eligibility lookup: `GET/POST /api/public/realm/:id/check-eligibility`.
- Embed page at `https://latrinebot.com/embed/?id=WIDGET_UUID` (iframe + script tag both supported).

### Changed
- Rate limit on `…/widgets/:id/live` lifted to 120 req/min/IP with 5 s edge cache.

## [0.4.0] - 2026-05-24

### Added
- Google OAuth login (`GET /api/auth/google`, `…/google/callback`).
- X (Twitter) OAuth login with PKCE (`GET /api/auth/x`, `…/x/callback`).
- `POST /api/auth/complete-oauth` exchanges a `login_code` for a JWT.
- `GET /api/auth/providers` returns enabled login methods.

### Changed
- Accounts for OAuth users are namespaced (`google:<sub>`, `x:<id>`) to avoid colliding with Sign-in with Solana wallet accounts.

## [0.3.3] - 2026-05-23

### Added
- Widget engine: drag-and-drop builder, theme presets (medieval, stream-dark, stream-light, minimal, OBS transparent, cyberpunk, pastel, brutalist), block catalog (status, ticker, stat, label, divider, last event, event log).
- Layout presets: `stats-row`, `stats-grid`, `log-focus`, `stream-hud`.
- `GET /api/projects/:id/share-card/bundle` returns share-card PNG + caption.

### Changed
- Widget config schema is sanitized server-side (`sanitizeWidgetConfig`) before save; invalid blocks are dropped, not rejected.

## [0.3.2] - 2026-05-22

### Added
- Metrics API: `GET /api/v1/projects/:id/metrics` and `…/events`, authed by `X-Metrics-Key`.
- Per-project metrics key CRUD: `GET/POST /api/projects/:id/keys`, `DELETE /api/projects/:id/keys/:keyId`.

### Changed
- `GET /api/v1` returns API name and version (`0.4.0`).

## [0.3.1] - 2026-05-21

### Added
- Anti-whale hard cap: wallets above `maxHolderBalance` are excluded from the public airdrop (default 20 M tokens = 2% of 1 B supply).
- DexScreener market-cap feed wired into tier resolution.

### Fixed
- Tier resolver returns the **highest** row with `mcUsd <= current MC`, not the closest. Edge-case at exact tier boundaries was off-by-one in 0.3.0.

## [0.3.0] - 2026-05-20

### Added
- LIVE mode: real on-chain claim, buyback, and proportional holder airdrop.
- Eligibility tier table (13 default rows from `$0` to `$100 M` MC).
- Hold-cycles anti-sybil filter: wallets must stay in band for N consecutive cycles before they qualify.

### Changed
- Dev wallet secret is now stored encrypted per project with the service master key, and only decrypted at runner-invocation time.

## [0.2.2] - 2026-05-19

### Added
- Eligibility tier resolver (`resolveTier(mcUsd, tiers)`).
- Per-row `holdCycles` so anti-sybil scales with MC (5 cycles at `$0`, 100 cycles at `$100 M`).

## [0.2.1] - 2026-05-18

### Added
- Per-project hold history (`updateHoldHistory`, `filterByHoldCycles`).
- Event log endpoint `GET /api/projects/:id/events?limit=`.

## [0.2.0] - 2026-05-17

### Added
- SIM mode: synthetic cycles run entirely inside the Worker (no VPS).
- SSE live updates: `GET /api/projects/:id/stream?token=`.

## [0.1.1] - 2026-05-16

### Added
- Helius RPC integration (per-project URL).
- `POST /api/projects/:id/credentials/test` validates RPC and key.

## [0.1.0] - 2026-05-15

### Added
- Initial Cloudflare Worker scaffold (D1 + Durable Objects).
- Sign-in with Solana (SIWS) via `GET /api/auth/challenge?wallet=` and `POST /api/auth/verify`.
- Project CRUD (`/api/projects/...`).
- API base at `api.latrinebot.com`.
