# Changelog

All notable changes to `@latrinebot/cli`.

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
