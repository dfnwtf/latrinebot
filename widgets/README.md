# @latrinebot/widgets

Embeddable, framework-free widgets for the [Latrine Bot](https://latrinebot.com) public API. Drop them into a token page, an OBS browser source, or any HTML you can edit.

[![npm version](https://img.shields.io/npm/v/@latrinebot/widgets.svg?style=flat-square)](https://www.npmjs.com/package/@latrinebot/widgets)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE)

> Part of the [`dfnwtf/latrinebot`](https://github.com/dfnwtf/latrinebot) monorepo.

## Three ways to embed

### 1. iframe (zero JS on your page)

```html
<iframe
  src="https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID"
  width="480" height="560"
  style="border:0;background:transparent"
  loading="lazy"
  title="Latrine Bot live stats"
></iframe>
```

### 2. Script tag (flows with your DOM, theme overrides)

```html
<div id="lb-widget"></div>
<script
  src="https://cdn.jsdelivr.net/npm/@latrinebot/widgets/dist/embed.js"
  data-widget-id="YOUR_WIDGET_UUID"
  data-target="#lb-widget"
  data-poll-sec="20"
  defer
></script>
```

### 3. Programmatic (frameworks, SPAs)

```ts
import { mountWidget } from "@latrinebot/widgets";

const ctrl = mountWidget({
  widgetId: "YOUR_WIDGET_UUID",
  target: "#lb-widget",
  pollSec: 20,
});

// later
ctrl.refresh();
ctrl.destroy();
```

## What you get out of the box

- **Stat tiles** - claimed SOL, holders paid, airdrops sent, market cap, cycles, tier floor, hold cycles
- **Status pill** - running / stopped + last cycle timestamp
- **Token ticker** - symbol + short mint
- **Event log** - the last 1-30 cycle events, scrolling
- **Last event** - one-line summary card
- **Custom label** + **divider** - styling primitives

Layout, theme, and which blocks are visible are configured in the dashboard at [latrinebot.com/app](https://latrinebot.com/app). The widget UUID is stable.

## Themes

Eight presets bundled (`medieval`, `stream-dark`, `stream-light`, `minimal`, `obs`, `cyberpunk`, `pastel`, `brutalist`). All exposed as CSS variables on the embed root so a parent stylesheet can override anything:

```css
.lb-widget {
  --lb-text: #2b2118;
  --lb-muted: #6b5c4a;
  --lb-accent: #c45c00;
  --lb-border: #2b2118;
  --lb-panel-bg: rgba(255, 255, 255, 0.6);
}
```

## OBS / streaming

The `obs` theme uses a transparent canvas. The `stream-hud` layout preset is sized 360 by 720, ready to drop as a sidebar in OBS:

1. Add **Browser** source.
2. URL: `https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID&theme=obs&layout=stream-hud`
3. Width 360, height 720.
4. Check **Shutdown source when not visible**.

## How it works

The embed library calls two public endpoints:

| Endpoint | Cached | Purpose |
|---|---|---|
| `GET /api/public/widgets/:id/config` | 60 s | Layout + theme |
| `GET /api/public/widgets/:id/live` | 5 s | Stats + last events |

No auth. No tokens. No CORS quirks. Safe to embed on third-party domains.

The poll interval defaults to 20 seconds. Set `data-poll-sec` or `pollSec` to override (10 to 120).

## Examples

- [`examples/index.html`](examples/index.html) - vanilla HTML
- [`examples/react.tsx`](examples/react.tsx) - thin React wrapper
- [`examples/obs-overlay.html`](examples/obs-overlay.html) - transparent OBS overlay

```bash
npm install
npm run serve:examples
# open http://localhost:3001
```

## Security

These widgets only call **public** endpoints. They do not send any wallet, signature, or metrics key over the network. You can safely embed them on a third-party site.

## Bundle size

ESM build is ~5 KB gzipped, zero deps.

## License

MIT - see the [root LICENSE](https://github.com/dfnwtf/latrinebot/blob/main/LICENSE).
