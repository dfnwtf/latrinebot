# How it works

Latrine Bot turns three on-chain actions into one continuous loop and runs them in the cloud, on a schedule you control.

## The cycle

```
   +-----------+      +-----------+      +-----------+
   |  CLAIM    | ---> |  BUYBACK  | ---> |  AIRDROP  |
   +-----------+      +-----------+      +-----------+
        ^                                       |
        |                                       v
        +-------------- WAIT --------------------+
                  (cycle interval)
```

1. **Claim.** The engine claims the creator fees that piled up on your Pump.fun token (or PumpSwap, if the token has graduated). The SOL lands in your dev wallet.
2. **Acquire the reward.** After reserving enough SOL to cover the next airdrop (transaction fees, token-account rents, plus a small buffer), the engine turns the rest of the claim into the chosen [reward asset](./configuration.md#reward-asset-what-holders-receive): a market **buyback** of your token (default), a **Jupiter swap** to USDC or any SPL mint, or **nothing** when the reward is plain SOL.
3. **Airdrop.** The reward is split among eligible holders by their balance share. SPL tokens go out as batched transfers; SOL rewards use native transfers. Whales above the cap and wallets that have not held long enough are excluded.
4. **Wait.** The scheduler sleeps for the configured cycle interval, then starts over.

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
