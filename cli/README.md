# @latrinebot/cli

A tiny CLI over the [Latrine Bot](https://latrinebot.com) public API. Read-only by default, perfect for scripts, alerts, and CI jobs.

[![npm version](https://img.shields.io/npm/v/@latrinebot/cli.svg?style=flat-square)](https://www.npmjs.com/package/@latrinebot/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE)

> Part of the [`dfnwtf/latrinebot`](https://github.com/dfnwtf/latrinebot) monorepo.

```bash
npm install -g @latrinebot/cli
# or
npx @latrinebot/cli status <project-id>
```

## Configuration

Set credentials via environment variables (recommended) or `~/.latrine/config.json`.

| Env var | Purpose |
|---|---|
| `LATRINE_METRICS_KEY` | Read-only metrics key (`lb_live_...`). For `status`, `stats`, `events`, `watch`. |
| `LATRINE_TOKEN` | Session JWT. For `preflight`, `projects`, `start`, `stop` etc. |
| `LATRINE_API` | Override the API base. Default `https://api.latrinebot.com`. |

You can also pass `--metrics-key`, `--token`, `--api` per command.

## Commands

### Read-only (metrics key)

```bash
# Snapshot
latrine status <project-id>

# Latest N events (default 10)
latrine events <project-id> --limit 20

# Watch live (polls every 5s)
latrine watch <project-id>

# Eligibility check for any wallet (public, no auth needed)
latrine eligibility <project-id> <wallet-pubkey>
```

### Authenticated (Bearer JWT)

```bash
# Run preflight on a project
latrine preflight <project-id>

# List your projects
latrine projects list

# Start / stop
latrine start <project-id>
latrine stop <project-id>

# Force a single cycle now
latrine run-once <project-id>

# Get a metrics key (printed once)
latrine keys create <project-id> --label "ci-monitor"
latrine keys list <project-id>
latrine keys revoke <project-id> <key-id>
```

### Discovery

```bash
latrine version
latrine health
```

## Examples

### Slack alert on a failed cycle

```bash
#!/usr/bin/env bash
set -e
events=$(latrine events "$PROJECT" --limit 5 --json)
echo "$events" | jq -e '.events[] | select(.severity=="error")' >/dev/null && \
  curl -sX POST "$SLACK_WEBHOOK" -d '{"text":"Latrine Bot error on '"$PROJECT"'"}'
```

### CI smoke test before deploying a token site

```bash
latrine eligibility "$PROJECT" "$TEAM_WALLET" --json > eligibility.json
```

## Why this CLI

- Read-only by default. Never asks for, never logs your wallet secret.
- Works with the same metrics key that powers the dashboard widgets.
- Zero runtime deps beyond [`@latrinebot/sdk`](https://github.com/dfnwtf/latrinebot/tree/main/sdk).
- Output is human by default, JSON with `--json` for scripts.

## License

MIT - see the [root LICENSE](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE).
