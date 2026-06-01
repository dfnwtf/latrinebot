# Latrine Bot

Cloud automation engine for Pump.fun tokens. Claim creator fees, buy the token back, drop the proceeds to holders by tier rules. No CLI, no local node, no scripts to maintain.

[![Site](https://img.shields.io/badge/site-latrinebot.com-c45c00?style=flat-square)](https://latrinebot.com)
[![App](https://img.shields.io/badge/app-dashboard-2b2118?style=flat-square)](https://latrinebot.com/app)
[![API](https://img.shields.io/badge/api-api.latrinebot.com-0ea5e9?style=flat-square)](https://api.latrinebot.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-lightgrey?style=flat-square)](./LICENSE-DOCS)

This is the public side of Latrine Bot. The engine, the runner, and the operator panel are not in this repository - see [`SECURITY.md`](./SECURITY.md) for what is and is not public.

## What is in here

| Folder | What | Package |
|---|---|---|
| [`docs/`](./docs) | Public product documentation (mirrors [latrinebot.com/docs](https://latrinebot.com/docs)) | - |
| [`sdk/`](./sdk) | TypeScript client + OpenAPI 3.1 spec | [`@latrinebot/sdk`](https://www.npmjs.com/package/@latrinebot/sdk) |
| [`widgets/`](./widgets) | Embeddable live widgets (iframe, script tag, programmatic) | [`@latrinebot/widgets`](https://www.npmjs.com/package/@latrinebot/widgets) |
| [`calculator/`](./calculator) | Standalone eligibility calculator | hosted at [latrinebot.com/calculator/](https://latrinebot.com/calculator/) |
| [`cli/`](./cli) | Tiny CLI over the public API | [`@latrinebot/cli`](https://www.npmjs.com/package/@latrinebot/cli) |

## What the service does

![Latrine Bot service flow: claim, buyback, burn, airdrop, cycle interval](./docs/assets/service-flow.png)

1. **Claim** creator fees from your Pump.fun (or PumpSwap) token.
2. Reserve enough SOL for the next airdrop, then **acquire the reward** with the rest: buy back your token, swap to USDC / any SPL token via Jupiter, or keep plain SOL.
3. After buyback, **split the pool**: optionally **burn** a configured share (reduces supply) and **airdrop** the rest to eligible holders by balance share (per pool split settings).
4. **Wait** and repeat.

Eligibility is a **tiered floor** that gets easier as market cap grows, plus an **anti-whale cap**, plus a **hold-cycles** anti-sybil filter. Holders always qualify on the project token; the distributed asset is configurable (project token, SOL, USDC, or any SPL mint). Details in [`docs/eligibility.md`](./docs/eligibility.md) and [`docs/configuration.md`](./docs/configuration.md#reward-asset-what-holders-receive).

## Start using it

- Dashboard: [latrinebot.com/app](https://latrinebot.com/app)
- 5-minute walkthrough: [`docs/getting-started.md`](./docs/getting-started.md)
- Settings reference: [`docs/configuration.md`](./docs/configuration.md)
- API reference: [`docs/api-reference.md`](./docs/api-reference.md)

## Build on top

```ts
import { LatrineClient } from "@latrinebot/sdk";

const client = new LatrineClient({
  metricsKey: process.env.LATRINE_METRICS_KEY,
});

const snap = await client.metrics.get("YOUR_PROJECT_ID");
console.log(snap.stats.totalClaimedSol, "SOL claimed total");
```

Or drop a live widget on your token page:

```html
<iframe
  src="https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID"
  width="480" height="560"
  style="border:0;background:transparent"
  loading="lazy"
></iframe>
```

Or run preflight from a CI job:

```bash
npx @latrinebot/cli preflight YOUR_PROJECT_ID
```

## What is not here

These stay private by design:

- The on-chain engine: claim, buyback, snapshot, distribute, hold-history, retry / fee strategy
- The runner that signs and sends mainnet transactions
- The operator panel and its admin endpoints
- Anti-MEV / RPC strategy code
- Treasury keys and other platform-side secrets

The public surface in this repo is enough to integrate, audit the API, and understand the eligibility math. See [`SECURITY.md`](./SECURITY.md).

## Versioning

Pre-1.0, minor bumps (`0.X`) can add endpoints or settings. Breaking changes inside `0.X` are listed in [`CHANGELOG.md`](./CHANGELOG.md) under **Breaking**. Each npm package tracks the same service version - if you pin `@latrinebot/sdk` to `0.4.x` you get a client that matches `api.latrinebot.com` at the same minor.

## Contributing

Issues and PRs welcome - read [`CONTRIBUTING.md`](./CONTRIBUTING.md) first. Style rules live in [`docs/STYLE.md`](./docs/STYLE.md).

## Links

- Site: [latrinebot.com](https://latrinebot.com)
- App: [latrinebot.com/app](https://latrinebot.com/app)
- API health: [api.latrinebot.com/api/health](https://api.latrinebot.com/api/health)
- X: [@Latrine_bot](https://x.com/Latrine_bot)
- Security: [`SECURITY.md`](./SECURITY.md) - latrine@atomicmail.io

## License

- Code: [MIT](./LICENSE)
- Docs (`docs/` folder): [CC BY 4.0](./LICENSE-DOCS)
