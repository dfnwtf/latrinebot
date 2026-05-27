# Latrine Bot eligibility calculator

A standalone, zero-dep calculator that does the same math the Latrine Bot engine does when deciding who gets paid.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE)

> Part of the [`dfnwtf/latrinebot`](https://github.com/dfnwtf/latrinebot) monorepo.

- **Live:** [latrinebot.com/calculator/](https://latrinebot.com/calculator/)
- **Source:** [`index.html`](./index.html) - single file, pure HTML + JS, no build step

## What it does

Plug in:

- A market cap (USD)
- A token supply (defaults to 1 B - the fixed Pump.fun supply)
- A wallet balance in tokens

The calculator returns:

- The active tier from the default table (or your custom table)
- Whether the balance clears the floor
- Whether the balance is above the anti-whale cap
- USD value of the position at the current MC
- How many more cycles the wallet needs to "hold cycles" pass

You can also query the production API for a live answer against any LIVE realm:

> _Public eligibility lookup uses the same tier table the live bot uses for that project. No auth, no wallet signature, no key material._

## Why it exists

- Decide what tiers make sense for your token **before** you launch.
- Show holders why they did or did not get a drop last cycle, without giving them dashboard access.
- Embed the math in your own page (the file is self-contained).

## Embed

The whole thing is a single static page. Drop it anywhere:

```html
<iframe src="https://latrinebot.com/calculator//" width="100%" height="780" style="border:0"></iframe>
```

Or download [`index.html`](./index.html) and host it on your own domain.

## Default tier table

The default table is built into the page. If you customize tiers in your dashboard, paste your JSON into the **Custom tiers** field and the page will recompute.

## Run locally

```bash
git clone https://github.com/dfnwtf/latrinebot.git
cd latrinebot/calculator
python -m http.server 8080
# open http://localhost:8080
```

That is the whole build.

## License

MIT - see the [root LICENSE](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE).
