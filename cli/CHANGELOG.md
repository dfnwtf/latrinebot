# Changelog

All notable changes to `@latrinebot/cli`.

## [0.4.9] - 2026-06-11

### Added
- `latrine live <project-id>` - public token page LIVE snapshot: fee split, hold fund transparency, perks, latest policy alert (`--json` for full `RealmLiveResponse`).

### Changed
- Depends on `@latrinebot/sdk@^0.4.9`.

## [0.4.7] - 2026-06-05

### Changed
- Depends on `@latrinebot/sdk@^0.4.7` (OpenAPI doc clarification for X post boost rules).

## [0.4.6] - 2026-06-05

### Added
- `latrine reward-options <project-id>` - public holder perk options.
- `latrine social-claim <project-id>` - boost status and post template.
- `latrine social-claim claim <project-id> --url URL --wallet WALLET` - claim a 1-hour boost.

### Changed
- Depends on `@latrinebot/sdk@^0.4.6`.

## [0.4.4] - 2026-05-31

### Changed
- Updated to `@latrinebot/sdk@^0.4.4` for `publicStats` support and the corrected `lifecycle.stats` response shape.

## [0.4.5] - 2026-05-31

### Changed
- Updated to `@latrinebot/sdk@^0.4.5`.

## [0.4.3] - 2026-05-27

### Added
- `latrine preflight <id>` prints the typed checklist with `required` / `severity` columns and exits non-zero if any `required` check fails.
- `latrine eligibility <project> <wallet>` (public lookup, no auth).

### Changed
- `latrine watch` defaults to 5 s polling and refreshes on terminal resize.

## [0.4.2] - 2026-05-26

### Added
- `latrine keys create` returns the plaintext key with a clear "save this now" warning.
- `--json` global flag for machine-readable output.

## [0.4.1] - 2026-05-25

### Added
- `latrine status`, `latrine events`, `latrine stats`.

## [0.4.0] - 2026-05-24

### Added
- Initial public CLI scaffold against the v0.4.0 API.
