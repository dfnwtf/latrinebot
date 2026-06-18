# Changelog

All notable changes to `@latrinebot/sdk`.

## [0.4.9] - 2026-06-11

### Added
- `HoldFundSettings`, `HoldFundPublic`, `HoldFundMode`, and `HoldFundTemplate` types.
- `ProjectSettings.holdFund` and `RealmLiveResponse.holdFund` for creator hold reserve transparency.
- `StatsBucket.totalHeldSol` - cumulative hold-% slice counter.
- OpenAPI `HoldFundSettings` / `HoldFundPublic` schemas on realm live and project settings.

## [0.4.8] - 2026-06-06

### Added
- `RealmLiveResponse` and related types (`PoolSplit`, `PublicFeatures`, `PolicyHistoryEntry`, `PolicyAlert`, `RealmFeedLine`) for `GET /api/public/realm/{id}/live`.
- OpenAPI documents mandatory public `POLICY` audit fields on the token page (no dev opt-out).

### Changed
- `public.realm.live()` return type is now `RealmLiveResponse` (was `ProjectStats`).

## [0.4.7] - 2026-06-05

### Changed
- OpenAPI: clarified X post boost claim rules (one post URL per token forever, one active claim per wallet per token, cross-wallet and cross-token behaviour) and `409` responses.

## [0.4.6] - 2026-06-05

### Added
- Holder perks on `public.realm`: `rewardOptions`, `rewardPreference`, `saveRewardPreference`.
- X post boost on `public.realm`: `socialClaim`, `claimSocialBoost`.
- `ProjectSettings` fields: `holderRewardChoiceEnabled`, `socialClaimEnabled`, `socialBoostDurationMin`, `socialHolderBoostMultiplier`, `socialNonHolderWeightRatio`.
- OpenAPI paths and schemas for holder reward choice and social claim (`RewardOptionsResponse`, `SocialClaimStatus`, `SocialClaimResult`, etc.).

## [0.4.4] - 2026-05-31

### Added
- `RewardAsset` interface and `RewardKind` union (`SAME` | `SOL` | `USDC` | `CUSTOM`), exported from the package root.
- `ProjectSettings.rewardAsset` - choose what eligible holders receive each cycle.
- Stats fields `lastRewardKind`, `lastRewardMint`, `lastRewardSymbol`, and `totalAirdropSol`.
- `reward_asset` added to the `PreflightCode` union and the OpenAPI `PreflightCheck` enum.
- `publicStats` (token-page style 6-tile stats) on `lifecycle.status(projectId)` and `lifecycle.stats(projectId)` responses.

### Changed
- OpenAPI spec bumped to `0.4.4` with the `RewardAsset` schema and reward stats.
- `lifecycle.stats(projectId)` now returns an object `{ ok, stats, publicStats, simRuntime }` (previously typed as a raw stats bucket).
- OpenAPI spec updated to include `PublicStats` and the new `/stats` response shape.

## [0.4.5] - 2026-05-31

### Fixed
- Republish bump after npm version collision on `0.4.4`.

## [0.4.3] - 2026-05-27

### Added
- `lifecycle.preflight(projectId)` returns the typed preflight check list (`ok`, `severity`, `required`, `code`, `message`).
- `lifecycle.events(projectId, { limit })` accepts `severity` filter.
- `public.realm` namespace with `live`, `checkEligibility`, `shareCard`.
- OpenAPI spec mounts `share-card` endpoints with binary `image/png` responses.

### Changed
- `projects.create` no longer accepts `mode` (server always sets `LIVE`).
- `projects.patch` strips `mode` from input.

### Fixed
- `metrics.events` paginates correctly when `limit` is exactly `200` (the cap).

## [0.4.2] - 2026-05-26

### Added
- `share.postX(projectId)` for posting the live share card to X from server-side credentials.
- Typed `PreflightCheck.code` literal union covering `dev_wallet_present`, `mint_resolves`, `dev_is_creator`, `rpc_reachable`, `balance_reserve`, `runner_reachable`, `mint_market`, `balance_recommended`.

### Changed
- `client.lifecycle.start` and `runOnce` throw `LatrineError('preflight_blocked')` with `fields` listing failed required checks (matches new API error shape).

## [0.4.1] - 2026-05-25

### Added
- `public.widgets.config(widgetId)` and `public.widgets.live(widgetId)` for embedding stat widgets without a metrics key.
- Edge cache hint headers exposed on the response wrapper.

## [0.4.0] - 2026-05-24

### Added
- OAuth helpers: `auth.providers()`, `auth.googleStartUrl()`, `auth.xStartUrl()`, `auth.completeOAuth({ loginCode })`.

## [0.3.3] - 2026-05-23

### Added
- Widget CRUD namespace `client.widgets`.
- Layout preset type union mirrors the dashboard (`empty`, `stats-row`, `stats-grid`, `log-focus`, `stream-hud`).

## [0.3.2] - 2026-05-22

### Added
- `metrics.get(projectId)` and `metrics.events(projectId, opts)` over `X-Metrics-Key`.
- `metrics.stream(projectId, opts)` thin SSE wrapper.

## [0.3.1] - 2026-05-21

### Added
- `lifecycle.stats(projectId)` returns `lastTierMinTokens`, `lastTierMcUsd`, `lastTierHoldCycles`.

## [0.3.0] - 2026-05-20

### Added
- Project lifecycle: `start`, `stop`, `runOnce`, `status`, `stats`, `events`.
- Credentials: `secrets.save`, `secrets.metadata`, `secrets.testRpc`.

## [0.2.0] - 2026-05-17

### Added
- Project CRUD, tier table types.

## [0.1.0] - 2026-05-15

### Added
- Initial scaffold, auth via SIWS, base `LatrineClient`.
