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
  | "reward_asset"
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

/** What eligible holders receive each cycle. */
export type RewardKind = "SAME" | "SOL" | "USDC" | "CUSTOM";

/**
 * Reward asset selection. Eligibility is always computed against the project
 * mint; only the distributed asset changes. Unknown/invalid input degrades to
 * `SAME` server-side.
 */
export interface RewardAsset {
  /**
   * `SAME` buys & airdrops the project token. `SOL` splits claimed SOL.
   * `USDC` swaps SOL to USDC (Jupiter). `CUSTOM` swaps SOL to an arbitrary mint.
   */
  kind: RewardKind;
  /** Base58 SPL mint, required only for `CUSTOM`; `null` otherwise. */
  mint: string | null;
}

export type HoldFundMode = "simple" | "goal";

export type HoldFundTemplate = "dex" | "boost" | "ad" | "custom";

/** Dashboard `settings.holdFund` (normalized server-side). */
export interface HoldFundSettings {
  mode: HoldFundMode;
  template: HoldFundTemplate | null;
  customLabel: string;
  goalSol: number;
}

/** Read-only `holdFund` on `GET /api/public/realm/:id/live`. */
export interface HoldFundPublic {
  mode: HoldFundMode;
  template: HoldFundTemplate | null;
  label: string;
  purposeLine: string;
  customLabel: string;
  goalSol: number;
  /** Cumulative hold-% slice from `stats.totalHeldSol`. */
  heldSol: number;
  holdPct: number;
  showProgress: boolean;
  progressPct: number;
}

export interface ProjectSettings {
  cycleIntervalSec: number;
  minHolderBalance: number;
  maxHolderBalance: number;
  minClaimSol: number;
  minReserveSol: number;
  slippageBps: number;
  buybackPercent: number;
  /** Reward asset selection. Defaults to `{ kind: "SAME", mint: null }`. */
  rewardAsset: RewardAsset;
  /** Holder reward currency choice on the public token page. */
  holderRewardChoiceEnabled?: boolean;
  /** X post drop boost on the public token page. */
  socialClaimEnabled?: boolean;
  /** Minutes a claimed boost stays active (default 60). */
  socialBoostDurationMin?: number;
  /** Weight multiplier for eligible holders with an active boost (default 1.15). */
  socialHolderBoostMultiplier?: number;
  /** Virtual weight ratio x tier minTokens for non-holder intro drops (default 0.08). */
  socialNonHolderWeightRatio?: number;
  /** Hold fund transparency (dashboard only). See HoldFundSettings. */
  holdFund?: HoldFundSettings;
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

/** Public token-page style stats (the 6 tiles shown on token pages and widgets). */
export interface PublicStats {
  airdropsCount: number;
  totalDistributedSol: number;
  uniqueHoldersPaid: number;
  lastEligibleCount: number | null;
  burnedDisplay: string;
  totalClaimedSol: number;
}

/** Creator fee split shown on the public token page (hold = remainder). */
export interface PoolSplit {
  distributePct: number;
  burnPct: number;
  holdPct: number;
}

/** Public perk / payout flags on the token page banner. */
export interface PublicFeatures {
  holderRewardChoice: boolean;
  socialClaimBoost: boolean;
  defaultRewardLabel: string;
  defaultRewardKind: RewardKind | string;
}

export interface PolicyHistoryEntry {
  at: Iso;
  body: string;
  severity: string | null;
  time: string;
}

/** Sticky banner for the latest POLICY event (omitted only when no policy changes yet). */
export interface PolicyAlert {
  at: Iso;
  body: string;
  severity: string;
  ageSec: number;
}

export interface RealmFeedLine {
  tag: string;
  body: string;
  severity: string | null;
  at: Iso;
  time: string;
}

/** `GET /api/public/realm/:id/live` - token page LIVE payload. */
export interface RealmLiveResponse {
  ok: boolean;
  status: "live" | "idle" | "waiting";
  stale?: boolean;
  running: boolean;
  mode: "LIVE";
  mint: string;
  ticker?: string;
  name?: string;
  stats: PublicStats;
  publicStats?: PublicStats;
  recent: RealmFeedLine[];
  feedDisplayLimit?: number;
  lastEvent?: RealmFeedLine | null;
  updatedAt?: Iso;
  poolSplit: PoolSplit;
  holdFund: HoldFundPublic;
  publicFeatures: PublicFeatures;
  policyHistory: PolicyHistoryEntry[];
  policyAlert?: PolicyAlert | null;
  meta?: Record<string, unknown>;
  charter?: Record<string, unknown>;
  settings?: Partial<ProjectSettings>;
}

export interface StatsBucket {
  cycles: number;
  totalClaimedSol: number;
  totalBuybackSol: number;
  totalBoughtTokensUi: number;
  totalAirdropTokensUi: number;
  totalAirdropTokensMillions: number;
  /** Cumulative SOL airdropped when reward kind is SOL. */
  totalAirdropSol?: number;
  airdropsCount: number;
  uniqueHoldersPaidCount: number;
  /** Reward kind used in the last airdrop cycle. */
  lastRewardKind?: RewardKind | null;
  /** Reward mint used last cycle (null for SOL). */
  lastRewardMint?: string | null;
  /** Ticker of the reward actually airdropped last cycle. */
  lastRewardSymbol?: string | null;
  lastMarketCapUsd: number | null;
  lastPriceUsd: number | null;
  lastTierMcUsd: number | null;
  lastTierMinTokens: number | null;
  lastTierHoldCycles: number | null;
  lastCycleAt: Iso | null;
  lastClaimAt: Iso | null;
  lastAirdropAt: Iso | null;
  /** Cumulative SOL reserved from the hold-% fee split slice. */
  totalHeldSol?: number;
}

export interface ProjectStats {
  ok?: boolean;
  running: boolean;
  mode: "LIVE";
  mint?: string | null;
  hasSecrets?: boolean;
  cycleBusy?: boolean;
  credentials?: unknown;
  stats: StatsBucket;
  publicStats?: PublicStats;
  simRuntime?: Record<string, unknown>;
  runner?: unknown;
}

export interface ProjectStatsBucketResponse {
  ok: boolean;
  stats: StatsBucket;
  publicStats?: PublicStats;
  simRuntime?: Record<string, unknown>;
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
  /** Newer event format (tag/body). */
  tag?: string;
  body?: string;
  at?: Iso;
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

export interface RewardOptionsResponse {
  ok: boolean;
  enabled: boolean;
  options: Array<Exclude<RewardKind, "CUSTOM">>;
  defaultKind?: Exclude<RewardKind, "CUSTOM">;
  defaultRewardKind?: Exclude<RewardKind, "CUSTOM">;
  defaultRewardLabel?: string;
  rewardMint?: string | null;
  ticker?: string;
}

export interface RewardPreferenceResponse {
  ok: boolean;
  kind?: Exclude<RewardKind, "CUSTOM"> | null;
}

export interface RewardPreferenceSave {
  wallet: string;
  message: string;
  nonce: string;
  signature: string;
  kind: Exclude<RewardKind, "CUSTOM">;
}

export interface SocialClaimStatus {
  ok: boolean;
  enabled: boolean;
  ticker?: string;
  mint?: string;
  handle?: string;
  template?: string | null;
}

export interface SocialClaimSubmit {
  tweetUrl: string;
  wallet: string;
}

export interface SocialClaimResult {
  ok: boolean;
  status: "pending";
  boostUntil: Iso;
  message: string;
}
