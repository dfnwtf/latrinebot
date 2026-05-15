/**
 * Public eligibility lookup for any wallet against a public LIVE realm.
 *
 *   LATRINE_PROJECT_ID=<uuid> \
 *   WALLET=<wallet-pubkey> \
 *     npx tsx examples/eligibility.ts
 *
 * No metrics key needed.
 */
import { LatrineClient } from "../src/index.js";

const projectId = process.env.LATRINE_PROJECT_ID;
const wallet = process.env.WALLET;

if (!projectId || !wallet) {
  console.error("Set LATRINE_PROJECT_ID and WALLET");
  process.exit(1);
}

const client = new LatrineClient();

const res = await client.public.realm.checkEligibility(projectId, { wallet });

if (res.eligible) {
  console.log(`Eligible. Active tier:`, res.tier);
} else {
  console.log(`Not eligible. Reason: ${res.reason ?? "unknown"}`);
  if (res.tier) {
    console.log(`Current tier floor: ${res.tier.minTokens} tokens at MC $${res.tier.mcUsd}`);
  }
  console.log(`Balance: ${res.balance}`);
}
