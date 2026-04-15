# Security policy

## Reporting a vulnerability

For real security issues in the Latrine Bot service (`api.latrinebot.com`, the dashboard, the runner, the widget endpoints) or in any package in this repo (`sdk/`, `widgets/`, `cli/`):

- **Email:** latrine@atomicmail.io
- Or open a GitHub Security Advisory on this repository.
- Include a clear reproduction (request, response, version observed, expected behaviour).
- Expect an initial reply within 2 working days.

Please do **not** open public issues for vulnerabilities.

## What lives in this repo

| Folder | License | Sensitive content? |
|---|---|---|
| `docs/` | CC BY 4.0 | No |
| `sdk/` | MIT | No - HTTP client only, never handles private keys |
| `widgets/` | MIT | No - calls only public endpoints |
| `calculator/` | MIT | No - pure client-side math |
| `cli/` | MIT | No - reads `LATRINE_TOKEN` / `LATRINE_METRICS_KEY` from env, never asks for the dev wallet secret |

## What does **not** live in any public repo

For full transparency:

- The on-chain engine (claim, buyback, snapshot, distribute, retry / fee strategy).
- The runner service that signs and sends transactions.
- The operator panel and its admin endpoints.

These are out of scope here by design. The public surface (docs, SDK, OpenAPI spec, widgets, calculator, CLI) is enough to integrate, audit the API, and understand the eligibility math.

## Safe usage guidance

- Do **not** ship a Bearer JWT or metrics key in a public client bundle.
- The browser embed library (`widgets/`) only calls public endpoints and is safe on third-party domains.
- The CLI uses env vars; do not commit `~/.latrine/config.json` to your dotfiles repo if it is public.
- Open a Security Advisory before publishing a public PoC, even if the issue feels minor.
