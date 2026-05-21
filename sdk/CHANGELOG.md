# Changelog

All notable changes to `@latrinebot/sdk`.

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
