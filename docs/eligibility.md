# Eligibility

Per cycle the engine decides who gets paid. This page explains the math.

## The filters, in order

1. **Exclude non-holder accounts.** Dev wallet, mint authority, bonding-curve account, program-owned token accounts, the Pump.fun creator vault. These never receive airdrops.
2. **Tier floor.** Resolve the active tier from the current market cap. A wallet must hold at least `minTokens` of the active tier to be in band.
3. **Anti-whale cap.** A wallet must hold at most `maxHolderBalance` (default 20 M = 2 % of fixed 1 B supply). Wallets above the cap are hard-excluded, not capped down.
4. **Hold cycles.** A wallet must have been in band for the last `holdCycles` consecutive cycles. New buyers wait this many cycles before they start receiving drops.

Wallets that survive all four filters are **eligible**.

## Distribution

The bought-back tokens are split among eligible wallets in proportion to their **eligible balance** (their actual token balance, clipped to the anti-whale cap if you set one below 100 % whitelist).

A wallet holding twice the balance of another eligible wallet gets twice the drop.

There is no per-cycle minimum payout floor; if the per-wallet share rounds to zero base units it is skipped.

## Tier resolution

Given the current market cap in USD, the engine picks the **highest** tier row whose `mcUsd <= market cap`. Below the first row, the first row applies.

### Default tier table

| MC band (USD) | `minTokens` | `holdCycles` |
|---:|---:|---:|
| 0 | 500 000 | 5 |
| 50 000 | 450 000 | 6 |
| 100 000 | 400 000 | 8 |
| 250 000 | 300 000 | 10 |
| 500 000 | 220 000 | 12 |
| 1 000 000 | 150 000 | 15 |
| 2 500 000 | 110 000 | 22 |
| 5 000 000 | 75 000 | 30 |
| 10 000 000 | 55 000 | 40 |
| 15 000 000 | 40 000 | 50 |
| 25 000 000 | 30 000 | 60 |
| 50 000 000 | 22 000 | 80 |
| 100 000 000 | 15 000 | 100 |

The floor scales down as MC grows so a new buyer can still qualify with a sensible USD ticket. The hold-cycles requirement scales up so late entrants prove conviction before getting drops.

### Worked example

Assume the fixed Pump.fun supply (1 B tokens). Token price = MC / supply.

| MC | Token price | `minTokens` | Min position in USD |
|---:|---:|---:|---:|
| $5 000 | $0.000005 | 500 000 | $2.50 |
| $250 000 | $0.000250 | 300 000 | $75.00 |
| $1 000 000 | $0.001000 | 150 000 | $150.00 |
| $5 000 000 | $0.005000 | 75 000 | $375.00 |
| $25 000 000 | $0.025000 | 30 000 | $750.00 |

Early bag is symbolic, later bag is a real ticket - both lock in conviction with `holdCycles`.

## Calculator

A standalone calculator that does this math (and adds your own custom tiers) lives at [latrinebot-calculator](https://github.com/dfnwtf/latrinebot-calculator) and at [calculator.latrinebot.com](https://calculator.latrinebot.com).

## Public eligibility lookup

For a live check against the production tier table for any token in a LIVE realm:

```http
GET /api/public/realm/<PROJECT_ID>/check-eligibility?wallet=<WALLET>
```

Returns `eligible: true|false`, the active tier, and the reason a wallet is rejected (cap, floor, hold cycles, excluded type).
