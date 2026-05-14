#!/usr/bin/env node
import { LatrineClient, LatrineError } from "@latrinebot/sdk";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

type Args = {
  positional: string[];
  flags: Record<string, string | boolean>;
};

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

async function loadConfig(): Promise<{ metricsKey?: string; token?: string; api?: string }> {
  try {
    const text = await readFile(join(homedir(), ".latrine", "config.json"), "utf8");
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function client(args: Args, cfg: Awaited<ReturnType<typeof loadConfig>>): LatrineClient {
  return new LatrineClient({
    baseUrl: String(args.flags["api"] ?? process.env.LATRINE_API ?? cfg.api ?? "https://api.latrinebot.com"),
    token: String(args.flags["token"] ?? process.env.LATRINE_TOKEN ?? cfg.token ?? "") || undefined,
    metricsKey: String(args.flags["metrics-key"] ?? process.env.LATRINE_METRICS_KEY ?? cfg.metricsKey ?? "") || undefined,
  });
}

function print(args: Args, value: unknown, formatHuman: () => string): void {
  if (args.flags["json"]) {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatHuman()}\n`);
  }
}

function fail(message: string, exit = 1): never {
  process.stderr.write(`latrine: ${message}\n`);
  process.exit(exit);
}

function HELP(): string {
  return `latrine - thin CLI over the Latrine Bot public API

USAGE
  latrine <command> [args...] [--flag value]

READ-ONLY (metrics key)
  status       <project-id>                Live stats snapshot
  stats        <project-id>                Stats bucket only
  events       <project-id> [--limit N]    Recent events
  watch        <project-id> [--interval N] Live tail (default 5s)
  eligibility  <project-id> <wallet>       Public eligibility lookup (no auth)

AUTHENTICATED (Bearer JWT)
  preflight    <project-id>                Run preflight, exit non-zero on red required checks
  projects     list                        List your projects
  start        <project-id>                Start scheduler
  stop         <project-id>                Stop scheduler
  run-once     <project-id>                Force one cycle
  keys list    <project-id>
  keys create  <project-id> --label NAME
  keys revoke  <project-id> <key-id>

DISCOVERY
  version
  health

GLOBAL FLAGS
  --api URL          Override API base.       Env: LATRINE_API
  --metrics-key K    Read-only metrics key.   Env: LATRINE_METRICS_KEY
  --token JWT        Session JWT.             Env: LATRINE_TOKEN
  --json             Output JSON (for scripts).
  --help, -h         Show this help.

CONFIG FILE
  ~/.latrine/config.json:
    { "metricsKey": "lb_live_...", "token": "...", "api": "..." }
`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.flags["help"] || args.flags["h"] || args.positional.length === 0) {
    process.stdout.write(HELP());
    return;
  }

  const cfg = await loadConfig();
  const c = client(args, cfg);
  const [cmd, sub, ...rest] = args.positional;

  switch (cmd) {
    case "version": {
      const v = await c.version();
      print(args, v, () => `${v.name} ${v.version}`);
      return;
    }
    case "health": {
      const h = await c.health();
      print(args, h, () => (h.ok ? "ok" : "not ok"));
      return;
    }
    case "status": {
      const id = sub ?? fail("status: missing project id");
      const s = await c.metrics.get(id);
      print(args, s, () => [
        `Running:        ${s.running}`,
        `Cycles:         ${s.stats.cycles}`,
        `SOL claimed:    ${(s.stats.totalClaimedSol ?? 0).toFixed(4)}`,
        `Holders paid:   ${s.stats.uniqueHoldersPaidCount}`,
        `Last MC (USD):  ${s.stats.lastMarketCapUsd ?? "-"}`,
        `Last cycle:     ${s.stats.lastCycleAt ?? "-"}`,
      ].join("\n"));
      return;
    }
    case "stats": {
      const id = sub ?? fail("stats: missing project id");
      const s = await c.metrics.get(id);
      print(args, s.stats, () => JSON.stringify(s.stats, null, 2));
      return;
    }
    case "events": {
      const id = sub ?? fail("events: missing project id");
      const limit = Number(args.flags["limit"]) || 10;
      const { events } = await c.metrics.events(id, { limit });
      print(args, { events }, () => events.map((e) => `${e.ts}  ${e.kind.padEnd(20)}  ${e.detail ?? ""}`).join("\n"));
      return;
    }
    case "watch": {
      const id = sub ?? fail("watch: missing project id");
      const interval = Math.max(2000, Number(args.flags["interval"]) * 1000 || 5000);
      let lastEventId = 0;
      while (true) {
        try {
          const { events } = await c.metrics.events(id, { limit: 30 });
          const fresh = events.filter((e) => e.id > lastEventId).reverse();
          for (const e of fresh) {
            process.stdout.write(`${e.ts}  ${e.kind.padEnd(20)}  ${e.detail ?? ""}\n`);
            lastEventId = Math.max(lastEventId, e.id);
          }
        } catch (err) {
          if (err instanceof LatrineError) process.stderr.write(`(transient: ${err.message})\n`);
          else throw err;
        }
        await new Promise((r) => setTimeout(r, interval));
      }
    }
    case "eligibility": {
      const id = sub ?? fail("eligibility: missing project id");
      const wallet = rest[0] ?? fail("eligibility: missing wallet");
      const r = await c.public.realm.checkEligibility(id, { wallet });
      print(args, r, () => (r.eligible
        ? `eligible at tier MC>=${r.tier?.mcUsd}, needs >= ${r.tier?.minTokens} tokens`
        : `not eligible (${r.reason ?? "unknown"})`));
      return;
    }
    case "preflight": {
      const id = sub ?? fail("preflight: missing project id");
      const pf = await c.lifecycle.preflight(id);
      const blocking = pf.checks.filter((ch) => ch.required && !ch.ok);
      print(args, pf, () => {
        const lines = pf.checks.map((ch) => {
          const mark = ch.ok ? "ok " : "x  ";
          const req = ch.required ? "REQUIRED " : "optional ";
          return `${mark} ${req} ${ch.code.padEnd(22)} ${ch.message}`;
        });
        return `ready: ${pf.ready}\n\n${lines.join("\n")}`;
      });
      if (blocking.length) process.exit(2);
      return;
    }
    case "projects": {
      if (sub === "list") {
        const list = await c.projects.list();
        print(args, list, () => list.map((p) => `${p.id}  ${p.name.padEnd(24)}  ${p.mint}`).join("\n"));
        return;
      }
      fail(`projects: unknown subcommand ${sub ?? "(none)"}`);
    }
    case "start": {
      const id = sub ?? fail("start: missing project id");
      const r = await c.lifecycle.start(id);
      print(args, r, () => "started");
      return;
    }
    case "stop": {
      const id = sub ?? fail("stop: missing project id");
      const r = await c.lifecycle.stop(id);
      print(args, r, () => "stopped");
      return;
    }
    case "run-once": {
      const id = sub ?? fail("run-once: missing project id");
      const r = await c.lifecycle.runOnce(id);
      print(args, r, () => "scheduled");
      return;
    }
    case "keys": {
      const action = sub;
      const id = rest[0] ?? fail(`keys ${action}: missing project id`);
      if (action === "list") {
        const list = await c.keys.list(id);
        print(args, list, () => list.map((k) => `${k.id}  ${k.label.padEnd(24)}  ${k.createdAt}`).join("\n"));
        return;
      }
      if (action === "create") {
        const label = String(args.flags["label"] ?? "");
        if (!label) fail("keys create: --label required");
        const k = await c.keys.create(id, { label });
        print(args, k, () => `created: ${k.id}\nkey:     ${k.key}\n\nSave this key now. It will not be shown again.`);
        return;
      }
      if (action === "revoke") {
        const keyId = rest[1] ?? fail("keys revoke: missing key id");
        await c.keys.delete(id, keyId);
        print(args, { ok: true }, () => "revoked");
        return;
      }
      fail(`keys: unknown subcommand ${action ?? "(none)"}`);
    }
    default:
      fail(`unknown command: ${cmd}\nrun: latrine --help`);
  }
}

main().catch((err) => {
  if (err instanceof LatrineError) {
    process.stderr.write(`latrine: API error [${err.code}]: ${err.message}\n`);
    if (err.fields?.length) process.stderr.write(`fields: ${err.fields.join(", ")}\n`);
    process.exit(2);
  }
  process.stderr.write(`latrine: ${(err as Error).message}\n`);
  process.exit(1);
});
