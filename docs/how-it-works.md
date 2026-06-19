# How it works

Latrine Bot turns three on-chain actions into one continuous loop and runs them in the cloud, on a schedule you control.

## The cycle

```
   +--------+     +------------------ fee pool (pending + claim) ------------------+
   | CLAIM  | --> | split: distribute % | burn % | hold % (after tx fee estimate) |
   +--------+     +----------+----------+--------+--------------------------------+
                         |          |          |
                         v          v          v
                    +---------+ +--------+ +----------+
                    | ACQUIRE | | BURN   | | HOLD     |
                    | reward  | | track  | | reserve  |
                    +----+----+ +--------+ +----------+
                         |
                         v
                    +---------+
                    | AIRDROP |
                    +----+----+
                         |
                         v
                    WAIT (cycle interval)
```

1. **Claim.** The engine claims creator fees from Pump.fun (or PumpSwap after graduation). SOL lands in the dev wallet and joins any rolled-over pending pool.
2. **Fee pool.** Pending fees plus this claim form the pool. Estimated transaction fees (claim, acquire, airdrop, optional burn track) are subtracted first.
3. **Split.** The pool after fees is divided by your dashboard percents: **Rewards to distribute %** (`buybackPercent`), **Burn %** (`burnPercent`), and **hold %** (remainder up to 100%). See [configuration](./configuration.md).
4. **Burn track (optional).** When burn % is above zero, that slice buys the **project token** and **100% of those tokens are SPL-burned**. Separate from the distribute track; works with any reward asset setting.
5. **Distribute track.** The distribute slice acquires the chosen [reward asset](./configuration.md#reward-asset-what-holders-receive): project-token buyback, Jupiter swap to USDC or a custom mint, or plain SOL.
6. **Hold slice.** The hold remainder stays in the dev wallet and increments `totalHeldSol`. Optional [hold fund transparency](./configuration.md#hold-fund-transparency) on the token page and Stream Studio.
7. **Airdrop.** The acquired reward is split among eligible holders by balance share (optional holder perks and X post boost - see configuration). SPL batched transfers; SOL native transfers.
8. **Wait.** The scheduler sleeps for the configured interval, then repeats.

**Hold cycles** in the tier table (anti-sybil streak) are not the same as fee-split **hold %** or hold fund transparency. See [eligibility](./eligibility.md).

Eligibility is always measured on your project token - holders qualify on what they hold, regardless of which asset the bot distributes.

## Where it runs

- **Edge layer:** an edge worker at `api.latrinebot.com` owns the dashboard, the API, the scheduler, the database, and the public widget endpoints.
- **Runner:** a managed Node service runs the actual on-chain steps (claim, buyback, airdrop). It receives a one-time decrypted dev wallet secret per cycle and returns a structured result.
- **You:** open the dashboard and set the rules.

You do not run anything locally. There is no CLI to install, no service to host, no server to babysit.

## Who gets paid

Eligibility is decided per cycle. A wallet is eligible if all of these are true:

- It is not the dev wallet, not the bonding-curve account, not a program-owned account, not the mint authority.
- Its balance is **at least** the current tier floor (the floor scales down as market cap grows - see [eligibility](./eligibility.md)).
- Its balance is **at most** the anti-whale cap (default 20 M tokens = 2 % of fixed 1 B supply).
- It has stayed in the eligible band for at least `holdCycles` consecutive cycles (anti-sybil).

The payout per wallet is proportional to its eligible balance. Hold twice as many tokens as another eligible wallet, get roughly twice the drop.

## Preflight before Start

Before the first cycle runs, the dashboard runs a preflight that checks:

- Dev wallet credentials and RPC URL are present and signed.
- The mint exists on-chain (SPL or Token-2022) and matches a Pump.fun token.
- The dev wallet is recognized as the creator (Pump.fun bonding curve creator, or vault, or PumpSwap creator-share wallet).
- The dev wallet has enough SOL to cover one full cycle (reserve + claim fees + transfer fees).
- For USDC / custom-token rewards: a Jupiter swap route exists for the reward mint (required). For SOL / project-token rewards this check is informational.
- The runner is reachable.
- Optional: market data is available (DexScreener listing). Non-blocking.
- Optional: the wallet has a recommended balance (reserve + minimum claim). Non-blocking.

A check marked `Required: yes` blocks Start. A check marked `Required: no` is informational - the engine will still run if it fails.

## What is not in the cloud

Your private dev wallet key. Latrine Bot only stores it encrypted, decrypts at runtime to sign a single cycle, then drops the plaintext.

See [security](./security.md) for the full storage model and how preflight protects against common launch mistakes.
