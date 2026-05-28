# Developers

Public source, OpenAPI spec, TypeScript SDK, embeddable widgets, a CLI, and a standalone calculator. Everything you need to build on top of Latrine Bot lives in one repo and three npm packages.

> Repo: [github.com/dfnwtf/latrinebot](https://github.com/dfnwtf/latrinebot) (MIT for code, CC BY 4.0 for docs).
> The engine, runner, and operator panel are private by design - the public repo is enough to integrate, audit the API, and understand the eligibility math.

## What is published

| Package | Use it for | Install |
|---|---|---|
| [`@latrinebot/sdk`](https://www.npmjs.com/package/@latrinebot/sdk) | Typed HTTP client + OpenAPI 3.1 spec | `npm i @latrinebot/sdk` |
| [`@latrinebot/widgets`](https://www.npmjs.com/package/@latrinebot/widgets) | Browser-embed library for live stats / holder list / status badge | `npm i @latrinebot/widgets` |
| [`@latrinebot/cli`](https://www.npmjs.com/package/@latrinebot/cli) | Thin CLI over the public API. Great for cron jobs, CI, alerts | `npm i -g @latrinebot/cli` |

Source on GitHub:
[sdk/](https://github.com/dfnwtf/latrinebot/tree/main/sdk) ·
[widgets/](https://github.com/dfnwtf/latrinebot/tree/main/widgets) ·
[cli/](https://github.com/dfnwtf/latrinebot/tree/main/cli) ·
[calculator/](https://github.com/dfnwtf/latrinebot/tree/main/calculator) ·
[docs/](https://github.com/dfnwtf/latrinebot/tree/main/docs)

## Getting credentials

Three things to know about, in increasing privilege.

### Project ID (UUID)

Created when you make a project in the [dashboard](https://latrinebot.com/app). The dashboard URL while a project is open contains it: `https://latrinebot.com/app/?project=<id>`. That UUID is the value to pass into the SDK, the CLI, and the widget embeds.

### Metrics key (`lb_live_...`) - read only

Per-project, read-only token for `client.metrics.*` (status, stats, events, stream). Generated in the dashboard under **API** -> **Generate metrics key**. Shown **once**; rotate or revoke at any time.

Safe to ship in server-side scripts, dashboards, and CI. **Do not** put it in a public browser bundle - use the public widget endpoints instead.

### Bearer JWT - full session

Required for `client.projects.*`, `client.lifecycle.*` (start, stop, run-once, preflight), `client.keys.*`, and any other write route. Two ways to get one:

- **Programmatic Sign-in with Solana** - call `client.auth.challenge()`, sign the message with the connected wallet, then `client.auth.verify()`. See the SDK quick-start below.
- **From the dashboard** - sign in at [latrinebot.com/app](https://latrinebot.com/app), then copy the session token from DevTools (Application -> Cookies / Local Storage). Easy for one-off scripts.

JWTs roll on a 7-day window. Long-running scripts should re-run SiwS when they get `LatrineError` with `code === "auth_invalid"`.

### Fully public (no auth)

Eligibility lookups, share-card bundles, widget config / live endpoints. Useful for build steps and embeddable third-party pages. See [API reference](./api-reference.md) for the full list.

## SDK quick start

Read a project snapshot with a metrics key:

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient({
  metricsKey: process.env.LATRINE_METRICS_KEY,
});

const snap = await client.metrics.get(process.env.PROJECT_ID);
console.log(snap.stats.totalClaimedSol, "SOL claimed");
console.log(snap.stats.cycles, "cycles ran");
```

Sign in, then start a project:

```ts
const client = new LatrineClient();
const { message } = await client.auth.challenge(walletPubkey);
const signature = await wallet.signMessage(new TextEncoder().encode(message));
const { token } = await client.auth.verify({ wallet: walletPubkey, signature });
client.useBearer(token);

await client.lifecycle.preflight(projectId);
await client.lifecycle.start(projectId);
```

Anonymous eligibility check (no credentials):

```ts
const res = await client.public.checkEligibility(projectId, {
  wallet: "SomeWalletPubkey",
});
if (!res.eligible) console.log("rejected:", res.reason);
```

Full method list and error codes: [SDK README](https://github.com/dfnwtf/latrinebot/tree/main/sdk#readme).

## CLI quick start

For cron jobs, CI, and quick checks.

```bash
npm install -g @latrinebot/cli

# Save credentials once
mkdir -p ~/.latrine
cat > ~/.latrine/config.json <<EOF
{
  "metricsKey": "lb_live_xxxxxxxx",
  "token":      "eyJhbGciOi..."
}
EOF

# Read-only
latrine status      <project-id>
latrine events      <project-id> --limit 20
latrine watch       <project-id>
latrine eligibility <project-id> <wallet>

# Authenticated
latrine preflight   <project-id>
latrine projects list
latrine start       <project-id>
latrine stop        <project-id>
latrine run-once    <project-id>
```

PowerShell equivalent of the config file write:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.latrine" | Out-Null
'{"metricsKey":"lb_live_xxxxxxxx","token":"eyJhbGciOi..."}' |
  Set-Content "$env:USERPROFILE\.latrine\config.json"
```

Full command list: [CLI README](https://github.com/dfnwtf/latrinebot/tree/main/cli#readme).

## Embeddable widgets

Two ways to embed live data on a third-party page.

### Iframe (zero JavaScript)

```html
<iframe
  src="https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID"
  width="480" height="560"
  style="border:0;background:transparent"
  loading="lazy"></iframe>
```

### npm library (custom mount, theming, programmatic refresh)

```ts
import { mountWidget } from "@latrinebot/widgets";

mountWidget("#stats", {
  widgetId: "YOUR_WIDGET_UUID",
  theme: "stream-dark",
});
```

Both modes call the public widget endpoints - no credentials needed. Build your widget in the [Widget builder docs](./widgets.md), then copy either the iframe URL or the widget UUID.

## OpenAPI 3.1 spec

The full API surface ships as a machine-readable spec. Useful for generating clients in other languages, driving Postman / Insomnia collections, and validating requests in a gateway.

```bash
# From the npm package
npm pack @latrinebot/sdk
tar -xOzf latrinebot-sdk-*.tgz package/openapi.yaml > openapi.yaml

# Or from GitHub directly
curl -O https://raw.githubusercontent.com/dfnwtf/latrinebot/main/sdk/openapi.yaml
```

## Eligibility calculator

Live at [latrinebot.com/calculator/](https://latrinebot.com/calculator/). Pure HTML + JS, no build step. Source in the [calculator folder](https://github.com/dfnwtf/latrinebot/tree/main/calculator). Same math as the engine; useful for showing potential users where a wallet would land.

## Versioning and support

- The npm packages track the service version. `0.4.x` SDK matches `api.latrinebot.com` at the `0.4.x` minor.
- Pre-1.0, the minor bump may add fields and endpoints. Breaking changes are listed in the [CHANGELOG](../CHANGELOG.md) under **Breaking**.
- Issues, ideas, PRs welcome on [GitHub Issues](https://github.com/dfnwtf/latrinebot/issues).
- Security: [private advisory](https://github.com/dfnwtf/latrinebot/security/advisories/new) or `latrine@atomicmail.io`. See [Security](./security.md).
