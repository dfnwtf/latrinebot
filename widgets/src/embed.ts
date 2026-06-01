import { applyThemeVars, THEME_PRESETS, type ThemeName } from "./themes.js";

const DEFAULT_API = "https://api.latrinebot.com";
const DEFAULT_POLL_SEC = 20;
const MIN_POLL_SEC = 10;
const MAX_POLL_SEC = 120;

export interface MountOptions {
  widgetId: string;
  target: string | HTMLElement;
  /** Override theme preset from the saved config. */
  theme?: ThemeName;
  /** Override layout preset (currently informational; the saved layout is used at render time). */
  layout?: string;
  /** Poll interval in seconds. Clamped to [10, 120]. Default 20. */
  pollSec?: number;
  /** API base. Default `https://api.latrinebot.com`. */
  baseUrl?: string;
}

export interface WidgetController {
  refresh(): Promise<void>;
  destroy(): void;
}

interface WidgetConfig {
  themePreset?: ThemeName;
  canvas: { w: number; h: number; bg: string; transparent: boolean };
  theme: Record<string, string | number>;
  pollSec: number;
  blocks: WidgetBlock[];
}

interface WidgetBlock {
  id: string;
  type: string;
  field?: string;
  text?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  limit?: number;
  style?: Record<string, unknown>;
}

interface LiveStats {
  running?: boolean;
  mode?: string;
  settings?: Record<string, unknown>;
  stats?: Record<string, number | string | null>;
  publicStats?: Record<string, number | string | null>;
  events?: Array<{ ts: string; kind: string; title: string; detail?: string; severity: string }>;
}

function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) throw new Error(`Latrine widget: target ${target} not found`);
    return el as HTMLElement;
  }
  return target;
}

function clampPoll(n: number | undefined): number {
  if (!n || !Number.isFinite(n)) return DEFAULT_POLL_SEC;
  return Math.max(MIN_POLL_SEC, Math.min(MAX_POLL_SEC, Math.floor(n)));
}

function fmtNum(n: number | string | null | undefined, opts?: { decimals?: number }): string {
  if (n == null) return "-";
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  const d = opts?.decimals ?? 0;
  return v.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtSol(n: number | string | null | undefined): string {
  if (n == null) return "-";
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return `${v.toFixed(4)} SOL`;
}

function fmtMc(n: number | string | null | undefined): string {
  if (n == null) return "-";
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

const STAT_RENDERERS: Record<string, (stats: NonNullable<LiveStats["stats"]>) => { label: string; value: string }> = {
  airdropsCount: (s) => ({ label: "Airdrops sent", value: fmtNum(s.airdropsCount) }),
  totalDistributedSol: (s) => ({ label: "To holders (SOL est.)", value: fmtSol(s.totalDistributedSol) }),
  uniqueHoldersPaid: (s) => ({ label: "Holders paid", value: fmtNum(s.uniqueHoldersPaid) }),
  lastEligibleCount: (s) => ({ label: "Eligible now", value: fmtNum(s.lastEligibleCount) }),
  burnedDisplay: (s) => ({ label: "Tokens burned", value: String(s.burnedDisplay ?? "-") }),
  totalClaimedSol: (s) => ({ label: "Creator fees claimed", value: fmtSol(s.totalClaimedSol) }),

  // Backward-compatible fields (older API payloads / saved widget configs)
  uniqueHoldersPaidCount: (s) => ({ label: "Holders paid", value: fmtNum(s.uniqueHoldersPaidCount) }),
  totalAirdropTokensMillions: (s) => ({ label: "Airdropped (M)", value: fmtNum(s.totalAirdropTokensMillions, { decimals: 2 }) }),
  lastMarketCapUsd: (s) => ({ label: "Market cap", value: fmtMc(s.lastMarketCapUsd) }),
  cycles: (s) => ({ label: "Cycles", value: fmtNum(s.cycles) }),
  lastTierMinTokens: (s) => ({ label: "Tier floor", value: fmtNum(s.lastTierMinTokens) }),
  lastTierHoldCycles: (s) => ({ label: "Hold cycles", value: fmtNum(s.lastTierHoldCycles) }),
};

function renderBlock(b: WidgetBlock, live: LiveStats): string {
  const stats = (live.publicStats ?? live.stats ?? {}) as NonNullable<LiveStats["stats"]>;
  if (b.type === "status") {
    const running = !!live.running;
    return `<div class="lb-status ${running ? "ok" : "off"}">${running ? "RUNNING" : "STOPPED"}</div>`;
  }
  if (b.type === "ticker") {
    const symRaw = String((live.settings as any)?.tokenSymbol ?? "");
    const sym = symRaw ? (symRaw.startsWith("$") ? symRaw : "$" + symRaw) : "$TOKEN";
    return `<div class="lb-ticker">${sym}</div>`;
  }
  if (b.type === "label") {
    return `<div class="lb-label">${b.text ?? ""}</div>`;
  }
  if (b.type === "divider") {
    return `<div class="lb-divider"></div>`;
  }
  if (b.type === "stat" && b.field) {
    const fn = STAT_RENDERERS[b.field];
    if (!fn) return "";
    const { label, value } = fn(stats);
    return `<div class="lb-stat"><div class="lb-stat-l">${label}</div><div class="lb-stat-v">${value}</div></div>`;
  }
  if (b.type === "lastEvent") {
    const ev: any = live.events?.[0];
    if (!ev) return `<div class="lb-event">no events yet</div>`;
    const k = ev.tag ?? ev.kind ?? "INFO";
    const d = ev.body ?? ev.detail ?? ev.title ?? "";
    return `<div class="lb-event"><span class="lb-ev-k">${k}</span> <span class="lb-ev-d">${d}</span></div>`;
  }
  if (b.type === "eventLog") {
    const events = (live.events ?? []).slice(0, b.limit ?? 8) as any[];
    if (!events.length) return `<div class="lb-log">no events yet</div>`;
    return `<ul class="lb-log">${events
      .map((e) => {
        const k = e.tag ?? e.kind ?? "INFO";
        const d = e.body ?? e.detail ?? e.title ?? "";
        return `<li><span class="lb-ev-k">${k}</span> <span class="lb-ev-d">${d}</span></li>`;
      })
      .join("")}</ul>`;
  }
  return "";
}

const STYLE = `
.lb-widget {
  position: relative;
  font-family: var(--lb-font, system-ui, sans-serif);
  color: var(--lb-text, #111);
  background: var(--lb-canvas-bg, transparent);
  border-radius: var(--lb-radius, 0);
  overflow: hidden;
}
.lb-widget * { box-sizing: border-box; }
.lb-block {
  position: absolute;
  background: var(--lb-panel-bg, transparent);
  border: var(--lb-border-width, 1px) solid var(--lb-border, transparent);
  border-radius: var(--lb-radius, 0);
  padding: 8px 10px;
}
.lb-stat-l { font-size: 11px; color: var(--lb-muted, #888); text-transform: uppercase; letter-spacing: 0.06em; }
.lb-stat-v { font-family: var(--lb-mono, monospace); font-size: 20px; color: var(--lb-text, #111); margin-top: 2px; }
.lb-status.ok { color: #22c55e; font-weight: 600; }
.lb-status.off { color: #ef4444; font-weight: 600; }
.lb-ticker { font-weight: 700; font-size: 18px; }
.lb-divider { background: var(--lb-border, #ccc); height: 2px; width: 100%; }
.lb-log { list-style: none; padding: 0; margin: 0; font-family: var(--lb-mono, monospace); font-size: 12px; line-height: 1.45; max-height: 100%; overflow: hidden; }
.lb-event { font-family: var(--lb-mono, monospace); font-size: 12px; }
.lb-ev-k { color: var(--lb-accent, #c45c00); margin-right: 6px; }
.lb-ev-d { color: var(--lb-text, #111); }
`.trim();

export function mountWidget(opts: MountOptions): WidgetController {
  const root = resolveTarget(opts.target);
  const baseUrl = (opts.baseUrl ?? DEFAULT_API).replace(/\/+$/, "");
  root.classList.add("lb-widget");

  let style = document.getElementById("lb-widget-style") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "lb-widget-style";
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  let cfg: WidgetConfig | null = null;
  let live: LiveStats = {};
  let pollMs = clampPoll(opts.pollSec) * 1000;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let aborted = false;

  async function fetchJson<T>(url: string): Promise<T | null> {
    try {
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) return null;
      return (await r.json()) as T;
    } catch {
      return null;
    }
  }

  function render(): void {
    if (!cfg) return;
    const c = cfg.canvas;
    root.style.width = `${c.w}px`;
    root.style.height = `${c.h}px`;
    const presetName = (opts.theme as ThemeName) ?? cfg.themePreset ?? "medieval";
    const preset = THEME_PRESETS[presetName] ?? THEME_PRESETS["medieval"];
    if (!preset) return;
    applyThemeVars(root, preset.theme, c.transparent ? { ...preset.canvas, transparent: true } : preset.canvas);
    root.style.setProperty("--lb-canvas-bg", c.transparent ? "transparent" : c.bg);

    const blocks = cfg.blocks
      .map((b) => {
        const html = renderBlock(b, live);
        return `<div class="lb-block" data-id="${b.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px">${html}</div>`;
      })
      .join("");
    root.innerHTML = blocks;
  }

  async function loadConfig(): Promise<void> {
    const data = await fetchJson<WidgetConfig>(`${baseUrl}/api/public/widgets/${opts.widgetId}/config`);
    if (!data || aborted) return;
    cfg = data;
    if (cfg.pollSec) pollMs = clampPoll(cfg.pollSec) * 1000;
    if (opts.pollSec) pollMs = clampPoll(opts.pollSec) * 1000;
  }

  async function poll(): Promise<void> {
    if (aborted) return;
    const data = await fetchJson<LiveStats>(`${baseUrl}/api/public/widgets/${opts.widgetId}/live`);
    if (data) live = data;
    render();
    if (!aborted) timer = setTimeout(poll, pollMs);
  }

  function onVisible(): void {
    if (document.visibilityState === "visible") void poll();
  }
  document.addEventListener("visibilitychange", onVisible);

  const ready = (async () => {
    await loadConfig();
    if (aborted) return;
    await poll();
  })();
  void ready;

  return {
    refresh: poll,
    destroy(): void {
      aborted = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      root.innerHTML = "";
      root.classList.remove("lb-widget");
    },
  };
}

function autoBoot(): void {
  if (typeof document === "undefined") return;
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;
  const widgetId = script.dataset.widgetId;
  if (!widgetId) return;
  const target = script.dataset.target ?? script.parentElement ?? document.body;
  const pollSec = Number(script.dataset.pollSec);
  const theme = script.dataset.theme as ThemeName | undefined;
  const layout = script.dataset.layout;
  mountWidget({ widgetId, target: target as string | HTMLElement, pollSec, theme, layout });
}

autoBoot();

export { THEME_PRESETS };
export type { ThemeName } from "./themes.js";
