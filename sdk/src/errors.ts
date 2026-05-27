export type LatrineErrorCode =
  | "preflight_blocked"
  | "auth_required"
  | "auth_invalid"
  | "rate_limited"
  | "not_found"
  | "validation_failed"
  | "creator_mismatch"
  | "rpc_unreachable"
  | "runner_unreachable"
  | "live_only"
  | "internal";

export interface LatrineErrorPayload {
  code: LatrineErrorCode | string;
  message: string;
  fields?: string[];
  retryAfterMs?: number;
}

/**
 * Thrown for every non-2xx HTTP response from the Latrine Bot API.
 * `code` is stable inside `0.x` and safe to switch on.
 */
export class LatrineError extends Error {
  readonly status: number;
  readonly code: LatrineErrorCode | string;
  readonly fields?: string[];
  readonly retryAfterMs?: number;
  override readonly cause?: unknown;

  constructor(status: number, payload: LatrineErrorPayload, cause?: unknown) {
    super(payload.message);
    this.name = "LatrineError";
    this.status = status;
    this.code = payload.code;
    this.fields = payload.fields;
    this.retryAfterMs = payload.retryAfterMs;
    this.cause = cause;
  }
}
