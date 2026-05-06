/**
 * Theme presets exposed as CSS variables on the widget root.
 * Mirror of the dashboard widget catalog; do not edit one without the other.
 */

export interface ThemeTokens {
  text: string;
  muted: string;
  accent: string;
  border: string;
  panelBg: string;
  fontFamily: string;
  monoFamily: string;
  radius: number;
  borderWidth: number;
}

export interface CanvasTokens {
  bg: string;
  transparent: boolean;
}

export interface ThemePreset {
  label: string;
  canvas: CanvasTokens;
  theme: ThemeTokens;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  medieval: {
    label: "Medieval",
    canvas: { bg: "#f4f0e6", transparent: false },
    theme: {
      text: "#2b2118",
      muted: "#6b5c4a",
      accent: "#c45c00",
      border: "#2b2118",
      panelBg: "rgba(255,255,255,0.6)",
      fontFamily: '"Crimson Pro", Georgia, serif',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 0,
      borderWidth: 2,
    },
  },
  "stream-dark": {
    label: "Stream dark",
    canvas: { bg: "#0f1115", transparent: false },
    theme: {
      text: "#f2f4f8",
      muted: "#9aa3b2",
      accent: "#e8b923",
      border: "#2a3140",
      panelBg: "rgba(22,26,34,0.92)",
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 8,
      borderWidth: 1,
    },
  },
  "stream-light": {
    label: "Stream light",
    canvas: { bg: "#f5f6f8", transparent: false },
    theme: {
      text: "#0f172a",
      muted: "#475569",
      accent: "#0ea5e9",
      border: "#cbd5e1",
      panelBg: "rgba(255,255,255,0.95)",
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 10,
      borderWidth: 1,
    },
  },
  minimal: {
    label: "Minimal",
    canvas: { bg: "#ffffff", transparent: false },
    theme: {
      text: "#111827",
      muted: "#6b7280",
      accent: "#2563eb",
      border: "#e5e7eb",
      panelBg: "rgba(249,250,251,0.98)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      monoFamily: "ui-monospace, monospace",
      radius: 14,
      borderWidth: 1,
    },
  },
  obs: {
    label: "OBS transparent",
    canvas: { bg: "#000000", transparent: true },
    theme: {
      text: "#ffffff",
      muted: "#cbd5e1",
      accent: "#7dd3fc",
      border: "rgba(255,255,255,0.28)",
      panelBg: "rgba(0,0,0,0.55)",
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 6,
      borderWidth: 1,
    },
  },
  cyberpunk: {
    label: "Cyberpunk",
    canvas: { bg: "#0a0a14", transparent: false },
    theme: {
      text: "#e0f7ff",
      muted: "#7ad8ff",
      accent: "#ff0080",
      border: "#00f0ff",
      panelBg: "rgba(10,10,20,0.85)",
      fontFamily: '"IBM Plex Mono", monospace',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 2,
      borderWidth: 1,
    },
  },
  pastel: {
    label: "Pastel",
    canvas: { bg: "#fdf6f9", transparent: false },
    theme: {
      text: "#3b2438",
      muted: "#a07a8e",
      accent: "#d57aa5",
      border: "#e8c8d8",
      panelBg: "rgba(255,255,255,0.85)",
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 18,
      borderWidth: 1,
    },
  },
  brutalist: {
    label: "Brutalist",
    canvas: { bg: "#fffce8", transparent: false },
    theme: {
      text: "#000000",
      muted: "#333333",
      accent: "#ff3b00",
      border: "#000000",
      panelBg: "#ffffff",
      fontFamily: '"IBM Plex Mono", monospace',
      monoFamily: '"IBM Plex Mono", monospace',
      radius: 0,
      borderWidth: 3,
    },
  },
};

export type ThemeName = keyof typeof THEME_PRESETS;

export function applyThemeVars(root: HTMLElement, theme: ThemeTokens, canvas: CanvasTokens): void {
  root.style.setProperty("--lb-text", theme.text);
  root.style.setProperty("--lb-muted", theme.muted);
  root.style.setProperty("--lb-accent", theme.accent);
  root.style.setProperty("--lb-border", theme.border);
  root.style.setProperty("--lb-panel-bg", theme.panelBg);
  root.style.setProperty("--lb-font", theme.fontFamily);
  root.style.setProperty("--lb-mono", theme.monoFamily);
  root.style.setProperty("--lb-radius", `${theme.radius}px`);
  root.style.setProperty("--lb-border-width", `${theme.borderWidth}px`);
  if (canvas.transparent) {
    root.style.background = "transparent";
  } else {
    root.style.background = canvas.bg;
  }
}
