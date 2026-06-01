import { LatrineError, type LatrineErrorPayload } from "./errors.js";
import type {
  AuthChallenge,
  AuthSession,
  AuthVerifyInput,
  CreatedMetricsKey,
  EligibilityTier,
  EventEntry,
  MetricsKey,
  PreflightResult,
  Project,
  ProjectStats,
  ProjectStatsBucketResponse,
  ProvidersInfo,
  PublicEligibility,
  ShareCardBundle,
  ShareCardCaption,
  WidgetSummary,
} from "./types.js";

export interface LatrineClientOptions {
  /** Default `https://api.latrinebot.com`. */
  baseUrl?: string;
  /** Bearer JWT obtained from `auth.verify` or `auth.completeOAuth`. */
  token?: string;
  /** Read-only metrics key (`lb_live_...`). Used for `metrics.*` requests. */
  metricsKey?: string;
  /** Override `fetch` (for Node 18- shims, Workers, tests). */
  fetch?: typeof globalThis.fetch;
  /** Optional client name appended to `User-Agent`. */
  userAgent?: string;
}

interface RequestOptions {
  method?: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: "bearer" | "metrics" | "none";
  responseType?: "json" | "binary" | "text";
}

const DEFAULT_BASE_URL = "https://api.latrinebot.com";

export class LatrineClient {
  private baseUrl: string;
  private token?: string;
  private metricsKey?: string;
  private fetchImpl: typeof globalThis.fetch;
  private userAgent: string;

  constructor(options: LatrineClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.token = options.token;
    this.metricsKey = options.metricsKey;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.userAgent = `latrinebot-sdk/0.4.4${options.userAgent ? ` ${options.userAgent}` : ""}`;
  }

  /** Attach (or replace) the session Bearer token used by authenticated routes. */
  useBearer(token: string | undefined): void {
    this.token = token;
  }

  /** Attach (or replace) the metrics key used by `metrics.*` routes. */
  useMetricsKey(key: string | undefined): void {
    this.metricsKey = key;
  }

  // ----------------- HTTP -----------------

  private async request<T>(opts: RequestOptions): Promise<T> {
    const url = new URL(this.baseUrl + opts.path);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v == null) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      "user-agent": this.userAgent,
      accept: "application/json",
    };
    if (opts.body !== undefined) headers["content-type"] = "application/json";

    if (opts.auth === "bearer" || (opts.auth === undefined && this.token)) {
      if (!this.token) {
        throw new LatrineError(401, {
          code: "auth_required",
          message: "Bearer token required for this request.",
        });
      }
      headers["authorization"] = `Bearer ${this.token}`;
    } else if (opts.auth === "metrics") {
      if (!this.metricsKey) {
        throw new LatrineError(401, {
          code: "auth_required",
          message: "Metrics key required for this request.",
        });
      }
      headers["x-metrics-key"] = this.metricsKey;
    }

    let res: Response;
    try {
      res = await this.fetchImpl(url.toString(), {
        method: opts.method ?? "GET",
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      });
    } catch (cause) {
      throw new LatrineError(
        0,
        { code: "internal", message: "Network request failed." },
        cause,
      );
    }

    if (!res.ok) {
      let payload: LatrineErrorPayload = {
        code: "internal",
        message: `HTTP ${res.status}`,
      };
      try {
        const data = (await res.json()) as { error?: LatrineErrorPayload };
        if (data?.error) payload = data.error;
      } catch {
        // body was not JSON; keep the default payload
      }
      if (res.status === 429) {
        const retryAfter = res.headers.get("retry-after");
        if (retryAfter) {
          const ms = Number(retryAfter) * 1000;
          if (Number.isFinite(ms)) payload.retryAfterMs = ms;
        }
        payload.code = payload.code ?? "rate_limited";
      }
      throw new LatrineError(res.status, payload);
    }

    if (opts.responseType === "binary") return (await res.arrayBuffer()) as T;
    if (opts.responseType === "text") return (await res.text()) as T;
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  // ----------------- discovery -----------------

  health(): Promise<{ ok: boolean; engine?: string }> {
    return this.request({ path: "/api/health", auth: "none" });
  }

  version(): Promise<{ name: string; version: string }> {
    return this.request({ path: "/api/v1", auth: "none" });
  }

  // ----------------- auth -----------------

  auth = {
    challenge: (wallet: string): Promise<AuthChallenge> =>
      this.request({
        path: "/api/auth/challenge",
        query: { wallet },
        auth: "none",
      }),

    verify: (input: AuthVerifyInput): Promise<AuthSession> =>
      this.request({
        method: "POST",
        path: "/api/auth/verify",
        body: input,
        auth: "none",
      }),

    providers: (): Promise<ProvidersInfo> =>
      this.request({ path: "/api/auth/providers", auth: "none" }),

    /** Build the URL the user's browser should open to start Google OAuth. */
    googleStartUrl: (returnTo?: string): string => {
      const u = new URL(this.baseUrl + "/api/auth/google");
      if (returnTo) u.searchParams.set("return_to", returnTo);
      return u.toString();
    },

    /** Build the URL the user's browser should open to start X OAuth. */
    xStartUrl: (returnTo?: string): string => {
      const u = new URL(this.baseUrl + "/api/auth/x");
      if (returnTo) u.searchParams.set("return_to", returnTo);
      return u.toString();
    },

    completeOAuth: (input: { loginCode: string }): Promise<AuthSession> =>
      this.request({
        method: "POST",
        path: "/api/auth/complete-oauth",
        body: { login_code: input.loginCode },
        auth: "none",
      }),

    me: (): Promise<AuthSession["user"]> =>
      this.request({ path: "/api/auth/me", auth: "bearer" }),

    logout: (): Promise<void> =>
      this.request({
        method: "POST",
        path: "/api/auth/logout",
        auth: "bearer",
      }),
  };

  // ----------------- projects -----------------

  projects = {
    list: (): Promise<Project[]> =>
      this.request({ path: "/api/projects", auth: "bearer" }),

    get: (id: string): Promise<Project> =>
      this.request({ path: `/api/projects/${id}`, auth: "bearer" }),

    create: (input: { name: string; mint: string }): Promise<Project> =>
      this.request({
        method: "POST",
        path: "/api/projects",
        body: input,
        auth: "bearer",
      }),

    patch: (
      id: string,
      input: Partial<{
        name: string;
        mint: string;
        settings: Partial<Project["settings"]>;
      }>,
    ): Promise<Project> =>
      this.request({
        method: "PATCH",
        path: `/api/projects/${id}`,
        body: input,
        auth: "bearer",
      }),

    delete: (id: string): Promise<void> =>
      this.request({
        method: "DELETE",
        path: `/api/projects/${id}`,
        auth: "bearer",
      }),

    resetTiers: (id: string): Promise<{ eligibilityTiers: EligibilityTier[] }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/tiers/reset-default`,
        auth: "bearer",
      }),

    resolveSymbol: (mint: string): Promise<{ symbol: string | null }> =>
      this.request({
        path: "/api/projects/symbol",
        query: { mint },
        auth: "bearer",
      }),
  };

  // ----------------- credentials -----------------

  credentials = {
    save: (
      id: string,
      input: { devWalletSecret: string; rpcUrl: string },
    ): Promise<{ pubkey: string }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/secrets`,
        body: input,
        auth: "bearer",
      }),

    metadata: (
      id: string,
    ): Promise<{ pubkey: string | null; rpcHost: string | null }> =>
      this.request({
        path: `/api/projects/${id}/credentials`,
        auth: "bearer",
      }),

    testRpc: (id: string): Promise<{ ok: boolean; latencyMs?: number }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/credentials/test`,
        auth: "bearer",
      }),
  };

  // ----------------- lifecycle -----------------

  lifecycle = {
    preflight: (id: string): Promise<PreflightResult> =>
      this.request({
        path: `/api/projects/${id}/preflight`,
        auth: "bearer",
      }),

    status: (id: string): Promise<ProjectStats> =>
      this.request({ path: `/api/projects/${id}/status`, auth: "bearer" }),

    stats: (id: string): Promise<ProjectStatsBucketResponse> =>
      this.request({ path: `/api/projects/${id}/stats`, auth: "bearer" }),

    events: (
      id: string,
      opts: { limit?: number; severity?: "info" | "warn" | "error" } = {},
    ): Promise<{ events: EventEntry[] }> =>
      this.request({
        path: `/api/projects/${id}/events`,
        query: opts,
        auth: "bearer",
      }),

    start: (id: string): Promise<{ running: true }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/control/start`,
        auth: "bearer",
      }),

    stop: (id: string): Promise<{ running: false }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/control/stop`,
        auth: "bearer",
      }),

    runOnce: (id: string): Promise<{ scheduled: true }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${id}/control/run-once`,
        auth: "bearer",
      }),

    /** Returns the SSE URL. Use `new EventSource(url)` in browsers, or a Node SSE client. */
    streamUrl: (id: string, token?: string): string => {
      const tok = token ?? this.token ?? this.metricsKey;
      if (!tok) {
        throw new LatrineError(401, {
          code: "auth_required",
          message: "Stream requires a Bearer token or metrics key.",
        });
      }
      const u = new URL(this.baseUrl + `/api/projects/${id}/stream`);
      u.searchParams.set("token", tok);
      return u.toString();
    },
  };

  // ----------------- widgets (authenticated CRUD) -----------------

  widgets = {
    list: (projectId: string): Promise<WidgetSummary[]> =>
      this.request({
        path: `/api/projects/${projectId}/widgets`,
        auth: "bearer",
      }),

    get: (projectId: string, widgetId: string): Promise<WidgetSummary> =>
      this.request({
        path: `/api/projects/${projectId}/widgets/${widgetId}`,
        auth: "bearer",
      }),

    create: (
      projectId: string,
      input: { name: string; layout?: string },
    ): Promise<WidgetSummary> =>
      this.request({
        method: "POST",
        path: `/api/projects/${projectId}/widgets`,
        body: input,
        auth: "bearer",
      }),

    patch: (
      projectId: string,
      widgetId: string,
      input: Record<string, unknown>,
    ): Promise<WidgetSummary> =>
      this.request({
        method: "PATCH",
        path: `/api/projects/${projectId}/widgets/${widgetId}`,
        body: input,
        auth: "bearer",
      }),

    put: (
      projectId: string,
      widgetId: string,
      input: Record<string, unknown>,
    ): Promise<WidgetSummary> =>
      this.request({
        method: "PUT",
        path: `/api/projects/${projectId}/widgets/${widgetId}`,
        body: input,
        auth: "bearer",
      }),

    delete: (projectId: string, widgetId: string): Promise<void> =>
      this.request({
        method: "DELETE",
        path: `/api/projects/${projectId}/widgets/${widgetId}`,
        auth: "bearer",
      }),
  };

  // ----------------- share card -----------------

  share = {
    bundle: (projectId: string): Promise<ShareCardBundle> =>
      this.request({
        path: `/api/projects/${projectId}/share-card/bundle`,
        auth: "bearer",
      }),

    caption: (projectId: string): Promise<ShareCardCaption> =>
      this.request({
        path: `/api/projects/${projectId}/share-card/caption`,
        auth: "bearer",
      }),

    png: (projectId: string): Promise<ArrayBuffer> =>
      this.request({
        path: `/api/projects/${projectId}/share-card.png`,
        auth: "bearer",
        responseType: "binary",
      }),

    postX: (projectId: string): Promise<{ tweetId: string; tweetUrl: string }> =>
      this.request({
        method: "POST",
        path: `/api/projects/${projectId}/share-card/post-x`,
        auth: "bearer",
      }),
  };

  // ----------------- metrics keys (authenticated CRUD) -----------------

  keys = {
    list: (projectId: string): Promise<MetricsKey[]> =>
      this.request({
        path: `/api/projects/${projectId}/keys`,
        auth: "bearer",
      }),

    create: (
      projectId: string,
      input: { label: string },
    ): Promise<CreatedMetricsKey> =>
      this.request({
        method: "POST",
        path: `/api/projects/${projectId}/keys`,
        body: input,
        auth: "bearer",
      }),

    delete: (projectId: string, keyId: string): Promise<void> =>
      this.request({
        method: "DELETE",
        path: `/api/projects/${projectId}/keys/${keyId}`,
        auth: "bearer",
      }),
  };

  // ----------------- metrics (read-only over X-Metrics-Key) -----------------

  metrics = {
    get: (projectId: string): Promise<ProjectStats> =>
      this.request({
        path: `/api/v1/projects/${projectId}/metrics`,
        auth: "metrics",
      }),

    events: (
      projectId: string,
      opts: { limit?: number } = {},
    ): Promise<{ events: EventEntry[] }> =>
      this.request({
        path: `/api/v1/projects/${projectId}/events`,
        query: { limit: opts.limit ?? 50 },
        auth: "metrics",
      }),
  };

  // ----------------- public (no auth) -----------------

  public = {
    widget: {
      config: (widgetId: string): Promise<Record<string, unknown>> =>
        this.request({
          path: `/api/public/widgets/${widgetId}/config`,
          auth: "none",
        }),

      live: (widgetId: string): Promise<ProjectStats> =>
        this.request({
          path: `/api/public/widgets/${widgetId}/live`,
          auth: "none",
        }),
    },

    realm: {
      live: (projectId: string): Promise<ProjectStats> =>
        this.request({
          path: `/api/public/realm/${projectId}/live`,
          auth: "none",
        }),

      checkEligibility: (
        projectId: string,
        input: { wallet: string },
      ): Promise<PublicEligibility> =>
        this.request({
          path: `/api/public/realm/${projectId}/check-eligibility`,
          query: { wallet: input.wallet },
          auth: "none",
        }),

      shareCard: (projectId: string): Promise<ShareCardBundle> =>
        this.request({
          path: `/api/public/realm/${projectId}/share-card/bundle`,
          auth: "none",
        }),
    },

    wardRoll: (
      opts: { faces?: boolean } = {},
    ): Promise<{ realms: Array<{ id: string; symbol: string; mc: number | null }> }> =>
      this.request({
        path: "/api/public/ward-roll",
        query: { faces: opts.faces ? 1 : undefined },
        auth: "none",
      }),

    latrineLive: (): Promise<ProjectStats> =>
      this.request({ path: "/api/public/latrine/live", auth: "none" }),
  };
}
