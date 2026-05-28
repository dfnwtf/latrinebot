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

### What you need

| Credential | Used by | Where to get it |
|---|---|---|
| **Project ID** (UUID) | every command | the dashboard URL `?project=<id>` or `latrine projects list` once authenticated |
| **Metrics key** (`lb_live_...`) | read-only commands (`status`, `stats`, `events`, `watch`) | dashboard → **API** tab → **Generate metrics key**. Shown once. |
| **Session JWT** | write commands (`start`, `stop`, `preflight`, `run-once`, `projects`, `keys`) | Sign in at [latrinebot.com/app](https://latrinebot.com/app), then copy the session token from DevTools |

The eligibility check (`latrine eligibility <id> <wallet>`) is **public** and needs neither.

### How to pass them

In order of precedence the CLI reads: command flag, env var, then `~/.latrine/config.json`.

**Flags (one-off):**
```bash
latrine status <project-id> --metrics-key lb_live_xxxxxxxx
latrine start  <project-id> --token eyJhbGciOi...
```

**Env vars (per shell session):**
```bash
export LATRINE_METRICS_KEY=lb_live_xxxxxxxx
export LATRINE_TOKEN=eyJhbGciOi...
export LATRINE_API=https://api.latrinebot.com   # optional override
```

**Config file (permanent, recommended for personal use):**
```bash
mkdir -p ~/.latrine
cat > ~/.latrine/config.json <<EOF
{
  "metricsKey": "lb_live_xxxxxxxx",
  "token":      "eyJhbGciOi..."
}
EOF
chmod 600 ~/.latrine/config.json
```

PowerShell equivalent:
```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.latrine" | Out-Null
'{"metricsKey":"lb_live_xxxxxxxx","token":"eyJhbGciOi..."}' |
  Set-Content "$env:USERPROFILE\.latrine\config.json"
```

### Why even reads need a key

Latrine Bot treats per-project metrics (cycle counts, holders snapshot, last-event payloads) as **operator-private**, not public. They are read-only data, but only the project owner should see them. Truly public data (eligibility check, share card, widget snapshots) is on the `client.public.*` surface and needs no credentials.

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
