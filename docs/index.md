# Latrine Bot docs

Latrine Bot is a cloud automation engine for Pump.fun tokens. It runs the loop you would otherwise wire up by hand:

1. Claim accumulated creator fees from your token.
2. Buy the token back with most of those fees.
3. Drop the bought tokens to holders who match your eligibility rules.
4. Wait for the next cycle and repeat.

Nothing runs on your machine. You connect a wallet, configure rules in a dashboard at [latrinebot.com/app](https://latrinebot.com/app), and the cloud runner does the rest.

## Start here

- [How it works](./how-it-works.md) - one page on the full cycle, with diagrams
- [Getting started](./getting-started.md) - account, project, mint, preflight, Start
- [Configuration](./configuration.md) - every setting in the dashboard, with defaults
- [Modes](./modes.md) - LIVE-only client model and what that means

## Build on top

- [API reference](./api-reference.md) - HTTP surface for clients
- [Metrics API](./metrics-api.md) - read-only stats and event feed (for widgets, OBS overlays, dashboards)
- [Widgets](./widgets.md) - drop-in embeds for your token page
- [Eligibility](./eligibility.md) - tier math, hold cycles, anti-whale cap

## Operations

- [Security](./security.md) - how secrets are stored, how preflight protects launches, how account isolation works

## Links

- Site: [latrinebot.com](https://latrinebot.com)
- Dashboard: [latrinebot.com/app](https://latrinebot.com/app)
- API: `api.latrinebot.com`
- OpenAPI + SDK: [latrinebot-sdk](https://github.com/dfnwtf/latrinebot-sdk)
- Embeds: [latrinebot-widgets](https://github.com/dfnwtf/latrinebot-widgets)
- Calculator: [latrinebot-calculator](https://github.com/dfnwtf/latrinebot-calculator)
- CLI: [latrinebot-cli](https://github.com/dfnwtf/latrinebot-cli)
- Service changelog: [latrinebot-changelog](https://github.com/dfnwtf/latrinebot-changelog)
