/**
 * Read-only quickstart: poll a project's stats and last 10 events.
 *
 *   LATRINE_PROJECT_ID=<uuid> \
 *   LATRINE_METRICS_KEY=lb_live_xxx \
 *     npx tsx examples/quickstart.ts
 */
import { LatrineClient, LatrineError } from "../src/index.js";

const projectId = process.env.LATRINE_PROJECT_ID;
const metricsKey = process.env.LATRINE_METRICS_KEY;

if (!projectId || !metricsKey) {
  console.error("Set LATRINE_PROJECT_ID and LATRINE_METRICS_KEY");
  process.exit(1);
}

const client = new LatrineClient({ metricsKey });

try {
  const snap = await client.metrics.get(projectId);
  console.log(`Running:        ${snap.running}`);
  console.log(`Cycles:         ${snap.stats.cycles}`);
  console.log(`SOL claimed:    ${snap.stats.totalClaimedSol.toFixed(4)}`);
  console.log(`Holders paid:   ${snap.stats.uniqueHoldersPaidCount}`);
  console.log(`Last MC (USD):  ${snap.stats.lastMarketCapUsd ?? "-"}`);

  const { events } = await client.metrics.events(projectId, { limit: 10 });
  console.log(`\nLast ${events.length} events`);
  for (const ev of events) {
    console.log(`  ${ev.ts}  ${ev.kind.padEnd(20)}  ${ev.detail ?? ""}`);
  }
} catch (err) {
  if (err instanceof LatrineError) {
    console.error(`API error [${err.code}]: ${err.message}`);
    if (err.fields) console.error("Fields:", err.fields.join(", "));
    process.exit(2);
  }
  throw err;
}
