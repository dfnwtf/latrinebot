/** ISO 8601 timestamp string. */
export type Iso = string;

/** Stable preflight check identifier. */
export type PreflightCode =
  | "dev_wallet_present"
  | "mint_resolves"
  | "dev_is_creator"
  | "rpc_reachable"
  | "balance_reserve"
  | "runner_reachable"
  | "mint_market"
  | "balance_recommended";

export interface PreflightCheck {
  code: PreflightCode | string;
  ok: boolean;
  required: boolean;
  severity: "ok" | "warn" | "error";
  message: string;
}

export interface PreflightResult {
  ok: boolean;
  ready: boolean;
  checks: PreflightCheck[];
}

export interface EligibilityTier {
  mcUsd: number;
  minTokens: number;
  holdCycles: number;
}

export interface ProjectSettings {
  cycleIntervalSec: number;
  minHolderBalance: number;
  maxHolderBalance: number;
  minClaimSol: number;
  minReserveSol: number;
  slippageBps: number;
  buybackPercent: number;
  eligibilityTiers: EligibilityTier[];
}

export interface Project {
  id: string;
  name: string;
  mint: string;
  symbol?: string;
  mode: "LIVE";
  running: boolean;
  createdAt: Iso;
  updatedAt: Iso;
  settings: ProjectSettings;
}

export interface ProjectStats {
  running: boolean;
  mode: "LIVE";
  stats: {
    cycles: number;
    totalClaimedSol: number;
    totalBuybackSol: number;
    totalBoughtTokensUi: number;
    totalAirdropTokensUi: number;
    totalAirdropTokensMillions: number;
    airdropsCount: number;
    uniqueHoldersPaidCount: number;
    lastMarketCapUsd: number | null;
    lastPriceUsd: number | null;
    lastTierMcUsd: number | null;
    lastTierMinTokens: number | null;
    lastTierHoldCycles: number | null;
    lastCycleAt: Iso | null;
    lastClaimAt: Iso | null;
    lastAirdropAt: Iso | null;
  };
}

export type EventKind =
  | "cycle.started"
  | "cycle.finished"
  | "claim.skipped"
  | "claim.executed"
  | "buyback.executed"
  | "buyback.skipped"
  | "airdrop.sent"
  | "airdrop.empty"
  | "tier.changed"
  | "error";

export interface EventEntry {
  id: number;
  ts: Iso;
  kind: EventKind | string;
  title: string;
  detail?: string;
  severity: "info" | "warn" | "error";
}

export interface MetricsKey {
  id: string;
  label: string;
  createdAt: Iso;
  lastUsedAt: Iso | null;
}

export interface CreatedMetricsKey extends MetricsKey {
  /** Plaintext key, returned **once**. */
  key: string;
}

export interface AuthChallenge {
  message: string;
  nonce: string;
  expiresAt: Iso;
}

export interface AuthVerifyInput {
  wallet: string;
  signature: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    handle: string;
    provider: "siws" | "google" | "x";
  };
}

export interface ProvidersInfo {
  siws: boolean;
  google: boolean;
  x: boolean;
}

export interface PublicEligibility {
  eligible: boolean;
  reason?:
    | "below_floor"
    | "above_cap"
    | "hold_cycles"
    | "excluded"
    | "not_found";
  balance: number;
  tier: EligibilityTier | null;
  marketCapUsd: number | null;
}

export interface WidgetSummary {
  id: string;
  name: string;
  updatedAt: Iso;
}

export interface ShareCardCaption {
  caption: string;
  hashtags: string[];
}

export interface ShareCardBundle extends ShareCardCaption {
  pngUrl: string;
}
