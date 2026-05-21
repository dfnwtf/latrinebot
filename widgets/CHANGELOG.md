# Changelog

All notable changes to `@latrinebot/widgets`.

## [0.4.3] - 2026-05-27

### Added
- New stat block: `lastTierHoldCycles`.
- `layout` and `theme` URL parameters on `/embed/` (override the widget's saved layout/theme without editing it).

### Fixed
- Polling skipped a beat when the tab went background and back; widgets now refresh immediately on `visibilitychange`.

## [0.4.2] - 2026-05-26

### Added
- `Stream HUD` sidebar preset (360x720, transparent).

## [0.4.1] - 2026-05-25

### Added
- Public embed endpoints (`/api/public/widgets/:id/config`, `…/live`).
- `data-poll-sec` and `pollSec` runtime override.
- `mountWidget()` programmatic API for SPA usage.

## [0.3.3] - 2026-05-23

### Added
- Initial widget engine: themes, blocks, layout presets.
- iframe and script-tag embedding modes.
