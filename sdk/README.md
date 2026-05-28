# @latrinebot/sdk

TypeScript client and [OpenAPI 3.1](./openapi.yaml) specification for the [Latrine Bot](https://latrinebot.com) public API at `api.latrinebot.com`.

[![npm version](https://img.shields.io/npm/v/@latrinebot/sdk.svg?style=flat-square)](https://www.npmjs.com/package/@latrinebot/sdk)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@latrinebot/sdk?style=flat-square)](https://bundlephobia.com/package/@latrinebot/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE)

> Part of the [`dfnwtf/latrinebot`](https://github.com/dfnwtf/latrinebot) monorepo. See the root README for the docs, widgets, calculator, and CLI.

```bash
npm install @latrinebot/sdk
```

Zero runtime deps. Works in Node 18+, browsers, Workers, Deno, Bun. Ships ESM and CJS, with full TypeScript types.

## Getting credentials

The SDK talks to two surfaces of the API. Each has its own auth model.

### Project ID

A UUID like `789caa12-7411-4754-b1dd-5a637cbe8a9f`. You get one when you create a project in the [dashboard](https://latrinebot.com/app). The dashboard URL while a project is open is `https://latrinebot.com/app/?project=<id>` - that's the value to pass into the SDK.

### Metrics key (`lb_live_...`) - read-only

Use this for `client.metrics.*` (status, stats, events, stream) and `client.public.*`. It is per-project, read-only, and safe to ship in server-side scripts and dashboards. **Do not** put it in a public client bundle.

1. Open your project in the [dashboard](https://latrinebot.com/app)
2. Go to the **API** tab (or **Metrics keys** section)
3. Click **Generate metrics key**, give it a label (e.g. `ci-monitor`, `grafana`)
4. Copy the `lb_live_...` value - it is shown **once**

```ts
const client = new LatrineClient({ metricsKey: process.env.LATRINE_METRICS_KEY });
```

You can also rotate or revoke keys from the same screen, or programmatically via `client.keys.*` after you authenticate.

### Bearer JWT - full session

Use this for `client.projects.*`, `client.lifecycle.*` (start, stop, run-once, preflight), and any other authenticated route. Two ways to get one:

**Programmatic (Sign-in with Solana):**

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient();
const { message } = await client.auth.challenge(walletPubkey);
const signature = await wallet.signMessage(new TextEncoder().encode(message));
const { token } = await client.auth.verify({ wallet: walletPubkey, signature });
client.useBearer(token);
```

**From the dashboard (for one-off scripts):**

After you sign in to [latrinebot.com/app](https://latrinebot.com/app), open DevTools → Application → Cookies (or Local Storage). The session token is also returned by `POST /api/auth/verify` if you intercept it. Save it as `LATRINE_TOKEN` and use:

```ts
const client = new LatrineClient({ token: process.env.LATRINE_TOKEN });
```

JWTs expire (rolling 7 days by default). For long-running scripts, repeat the SiwS flow when you get a `LatrineError` with `code === "auth_invalid"`.

### Fully public (no auth)

`client.public.checkEligibility(...)`, share-card bundles, and widget config / live endpoints don't need any credential. Useful for build steps and embeddable third-party pages.

## Quick start

### Read-only (with a metrics key)

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient({
  metricsKey: process.env.LATRINE_METRICS_KEY,
});

const stats = await client.metrics.get("YOUR_PROJECT_ID");
console.log(stats.stats.totalClaimedSol, "SOL claimed total");

const events = await client.metrics.events("YOUR_PROJECT_ID", { limit: 25 });
for (const ev of events.events) {
  console.log(ev.ts, ev.kind, ev.detail);
}
```

### Authenticated session (Sign-in with Solana)

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient();

const { message } = await client.auth.challenge(walletPubkey);
const signature = await wallet.signMessage(new TextEncoder().encode(message));

const { token } = await client.auth.verify({
  wallet: walletPubkey,
  signature,
});

client.useBearer(token);

const projects = await client.projects.list();
```

### Public eligibility check (no auth)

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient();

const res = await client.public.checkEligibility("PROJECT_ID", {
  wallet: "SomeWalletPubkey",
});

if (!res.eligible) console.log("rejected because:", res.reason);
```

## What this SDK covers

| API surface | Methods on the client |
|---|---|
| Discovery | `client.health()`, `client.version()` |
| Auth | `client.auth.*` (challenge, verify, OAuth, me, logout) |
| Projects | `client.projects.*` (list, get, create, patch, delete, tiers reset) |
| Credentials | `client.credentials.*` (save, get metadata, test RPC) |
| Lifecycle | `client.lifecycle.*` (preflight, status, stats, events, start, stop, runOnce, stream) |
| Widgets (CRUD) | `client.widgets.*` (list, get, create, patch, put, delete) |
| Share card | `client.share.*` (bundle, caption, png, postX) |
| Metrics (read-only) | `client.metrics.*` (get, events, stream) |
| Public | `client.public.*` (widget config + live, realm live, share-card, check-eligibility) |

Admin endpoints, internal cycle endpoints, runner endpoints, and anything that handles raw secrets are **not** in this SDK and never will be. See the [security docs](https://github.com/dfnwtf/latrinebot/blob/main/docs/security.md).

## OpenAPI

The same surface is available as a static [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.1). Use it to:

- Generate clients for other languages (`openapi-generator-cli`)
- Drive Postman or Insomnia collections
- Validate requests in a gateway

```bash
npm pack @latrinebot/sdk
tar -xOzf latrinebot-sdk-*.tgz package/openapi.yaml > openapi.yaml
```

Or fetch it directly from this repo.

## Errors

All HTTP errors are thrown as `LatrineError` with a stable `code`:

```ts
import { LatrineClient, LatrineError } from "@latrinebot/sdk";

try {
  await client.lifecycle.start("PROJECT_ID");
} catch (err) {
  if (err instanceof LatrineError && err.code === "preflight_blocked") {
    console.log("Fix these checks first:", err.fields);
  } else {
    throw err;
  }
}
```

`error.code` values are documented in [`docs/api-reference.md#errors`](https://github.com/dfnwtf/latrinebot/blob/main/docs/api-reference.md#errors).

## Versioning

This package tracks the service version (currently `0.4.3`). Pre-1.0 the minor bump may add fields and endpoints. Breaking changes are listed in [`CHANGELOG.md`](./CHANGELOG.md) under **Breaking**.

## License

MIT - see the [root LICENSE](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE).
