# Widgets

Drop a live Latrine Bot widget on your token page in two lines of HTML.

## Quick start

```html
<iframe
  src="https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID"
  width="480" height="560"
  style="border:0;background:transparent"
  loading="lazy"
  title="Latrine Bot widget"
></iframe>
```

Or as a script tag (if you prefer the widget to flow with your DOM):

```html
<div id="lb-widget"></div>
<script
  src="https://cdn.jsdelivr.net/npm/@latrinebot/widgets/dist/embed.js"
  data-widget-id="YOUR_WIDGET_UUID"
  data-target="#lb-widget"
  defer
></script>
```

Source for the embed library lives in [`latrinebot-widgets`](https://github.com/dfnwtf/latrinebot-widgets).

## Building your widget

1. In the dashboard open your project -> **Widgets** -> **New widget**.
2. Pick a layout preset (`Stats row`, `Stats grid`, `Log focus`, `Stream HUD`) or start from `Empty canvas`.
3. Pick a theme (`Medieval`, `Stream dark`, `Stream light`, `Minimal`, `OBS transparent`, `Cyberpunk`, `Pastel`, `Brutalist`).
4. Drag blocks onto the canvas. Resize, restyle, reorder. Each block has its own colour, font size, opacity overrides.
5. Save. The widget gets a stable UUID. Use it in the iframe or script tag.

## Available blocks

| Block | What it shows |
|---|---|
| Status | Running / stopped, last cycle timestamp |
| Token ticker | Symbol + short mint |
| Custom text | Free text, useful for labels |
| Divider | Horizontal rule |
| Stat - Creator fees (SOL) | Total claimed across all cycles |
| Stat - Holders paid | Unique wallets ever paid |
| Stat - Airdrops sent | Total airdrop transactions |
| Stat - Market cap | Last known DexScreener MC |
| Stat - Cycles | Total cycles run |
| Stat - Tier floor (tokens) | Current active tier's `minTokens` |
| Stat - Hold cycles | Current active tier's `holdCycles` |
| Stat - Airdropped (M tokens) | Total airdropped in millions |
| Last event | The most recent log line |
| Event log | Scrolling log (1-30 lines) |

## API endpoints

Widgets read two public endpoints:

```http
GET /api/public/widgets/{widgetId}/config   # layout + theme (cached 60s)
GET /api/public/widgets/{widgetId}/live     # stats + event tail (cached 5s, 120 req/min/IP)
```

No auth. No CORS surprises. Safe to embed on any third-party site.

## Themes and tokens

Widget themes are exposed as CSS variables on the embed root, so you can override them from a parent stylesheet if you embed via the script tag:

```css
.lb-widget {
  --lb-text: #2b2118;
  --lb-muted: #6b5c4a;
  --lb-accent: #c45c00;
  --lb-border: #2b2118;
  --lb-panel-bg: rgba(255, 255, 255, 0.6);
}
```

For exact preset values see [`THEME_PRESETS`](https://github.com/dfnwtf/latrinebot-widgets/blob/main/src/themes.ts).

## OBS / streaming

The `OBS transparent` theme uses a transparent canvas, so the widget composes cleanly into OBS as a Browser Source. The `Stream HUD` layout is sized for a 360×720 sidebar.

Set the OBS Browser Source URL to `https://latrinebot.com/embed/?id=YOUR_WIDGET_UUID`, width/height to match the layout, and check **Shutdown source when not visible**.
