import { test } from "node:test";
import assert from "node:assert/strict";
import { LatrineClient, LatrineError } from "../dist/index.js";

function mockFetch(handler) {
  return async (url, init) => {
    const u = new URL(url);
    const res = await handler({
      pathname: u.pathname,
      search: u.search,
      method: init?.method ?? "GET",
      headers: init?.headers ?? {},
      body: init?.body,
    });
    return new Response(res.body ?? null, {
      status: res.status ?? 200,
      headers: res.headers ?? { "content-type": "application/json" },
    });
  };
}

test("metrics.get attaches X-Metrics-Key", async () => {
  const fetchImpl = mockFetch((req) => {
    assert.equal(req.method, "GET");
    assert.equal(req.pathname, "/api/v1/projects/abc/metrics");
    assert.equal(req.headers["x-metrics-key"], "lb_live_test");
    return {
      body: JSON.stringify({
        running: true,
        mode: "LIVE",
        stats: { cycles: 7 },
      }),
    };
  });

  const client = new LatrineClient({
    metricsKey: "lb_live_test",
    fetch: fetchImpl,
  });
  const snap = await client.metrics.get("abc");
  assert.equal(snap.stats.cycles, 7);
});

test("preflight failure surfaces as LatrineError with fields", async () => {
  const fetchImpl = mockFetch(() => ({
    status: 409,
    body: JSON.stringify({
      error: {
        code: "preflight_blocked",
        message: "Required preflight check failed",
        fields: ["dev_is_creator"],
      },
    }),
  }));

  const client = new LatrineClient({ token: "jwt", fetch: fetchImpl });
  await assert.rejects(
    () => client.lifecycle.start("proj-1"),
    (err) =>
      err instanceof LatrineError &&
      err.code === "preflight_blocked" &&
      Array.isArray(err.fields) &&
      err.fields.includes("dev_is_creator"),
  );
});

test("rate limit populates retryAfterMs", async () => {
  const fetchImpl = mockFetch(() => ({
    status: 429,
    headers: { "content-type": "application/json", "retry-after": "12" },
    body: JSON.stringify({ error: { code: "rate_limited", message: "slow down" } }),
  }));

  const client = new LatrineClient({ metricsKey: "lb_live_test", fetch: fetchImpl });
  try {
    await client.metrics.get("abc");
    assert.fail("expected throw");
  } catch (err) {
    assert.ok(err instanceof LatrineError);
    assert.equal(err.code, "rate_limited");
    assert.equal(err.retryAfterMs, 12000);
  }
});
