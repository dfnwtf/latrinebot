# Latrine Bot eligibility calculator

A standalone, zero-dep calculator that does the same math the Latrine Bot engine does when deciding who gets paid.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE)

> Part of the [`dfnwtf/latrinebot`](https://github.com/dfnwtf/latrinebot) monorepo.

- **Live:** [latrinebot.com/calculator/](https://latrinebot.com/calculator/)
- **Source:** [`index.html`](./index.html) + [`app.js`](./app.js) - no build step, no framework, no runtime deps

## What it does

Given a market cap, a token supply, a wallet balance, the anti-whale cap, and how many cycles a wallet has been in the eligible band, it tells you whether that wallet would be paid in the next cycle, and what the minimum position USD looks like at every tier.

This is the same math the bot runs on every cycle. The only difference: the bot reads holders from chain and runs the resolver for every wallet; this page runs it for one wallet at a time, on inputs you choose.

## How the math works

```
1. Resolve the active tier:
   pick the highest row in the tier table where mcUsd <= current MC

2. Apply the floor:
   wallet balance must be >= active tier.minTokens

3. Apply the anti-whale cap:
   wallet balance must be <= maxHolderBalance
   (skipped when cap is set to 0)

4. Apply hold-cycles:
   wallet must have been in the eligible band
   for >= active tier.holdCycles consecutive cycles
```

All four checks must pass. Edit the `Custom tier table (JSON)` section to plug in your own values.

## Run locally

```bash
git clone https://github.com/dfnwtf/latrinebot.git
cd latrinebot/calculator
python -m http.server 8080
# open http://localhost:8080
```

The page pulls its medieval-themed CSS from `latrinebot.com` so it looks the same as the live version when you open it locally. If you serve this offline and need standalone styles, inline the contents of `latrinebot.com/assets/medieval.css`, `medieval-docs.css`, `medieval-tools.css`, and `medieval-calculator.css` into the page or fork it with your own CSS.

## License

MIT - see the [root LICENSE](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE).
