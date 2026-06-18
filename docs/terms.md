# Terms and Conditions

*Last updated: June 11, 2026*

Canonical web version: [latrinebot.com/terms.html](https://latrinebot.com/terms.html)

These Terms and Conditions ("Terms") govern your access to and use of the Latrine Bot website at [latrinebot.com](https://latrinebot.com), the developer dashboard, APIs, documentation, and related cloud automation tools (together, the "Service"). By using the Service, you agree to these Terms. If you do not agree, do not use the Service.

## 1. The Service

Latrine Bot is a software tool that helps token creators automate Pump.fun creator-fee workflows (claim, buyback, holder airdrops) on Solana mainnet. The public dashboard runs live on-chain cycles only.

LIVE projects receive a public token page that shows live stats, an activity log, current fee split, optional holder perks (reward currency choice, X post boost), optional hold fund transparency when you configure a public goal, and a permanent public record when you change distribution or related settings. See section 4.

We may change, suspend, or discontinue any part of the Service at any time, with or without notice.

## 2. Eligibility

- You must be at least 18 years old (or the age of majority where you live) and able to enter a binding contract.
- You are responsible for ensuring that your use of the Service complies with laws and rules that apply to you, including securities, tax, marketing, and sanctions laws.
- You must not use the Service if you are located in, or acting on behalf of anyone in, a jurisdiction where such use is prohibited.

## 3. Your responsibilities

- **Wallet and keys.** You control the Solana wallets and secrets you provide (for example dev wallet private key and RPC URL). You are solely responsible for securing them and for all on-chain activity signed with those credentials.
- **Configuration.** You configure mint, tiers, thresholds, modes, and schedules. You are responsible for reviewing settings before LIVE mode.
- **Third-party infrastructure.** The Service relies on Solana, Pump.fun, RPC providers (such as Helius, which you may supply), DexScreener, and other third parties. Their availability, fees, and terms are outside our control.
- **No advice.** Nothing on the Service is financial, legal, or tax advice. Token launches, airdrops, and trading involve substantial risk, including total loss of funds.
- **Public transparency.** When you save LIVE policy settings (fee split, default reward asset, holder reward choice, X post boost, hold fund transparency), the Service appends public `POLICY` events. You cannot disable this audit log or the platform rules for major holder cuts (for example a drop of 20 percentage points or more, or to 0%). Holders may rely on the public token page and APIs; you are responsible for settings you choose and for how you communicate with your community.
- **Holder perks.** If you enable holder reward choice or X post boost, eligible holders interact via public endpoints (wallet checks, Sign-In With Solana where required, and tweet verification for boost). You configure whether those perks are on; holders choose whether to use them.

## 4. Public transparency (mandatory for LIVE)

For LIVE mode projects, the Service maintains and displays:

- Current fee split (airdrop / burn / hold), default payout, and enabled perks on the token page.
- Optional **hold fund transparency** when you choose **Hold with a goal** in the dashboard: a public purpose label (preset or custom), cumulative held SOL from your hold % slice, and an optional SOL goal with progress. Simple hold (no public goal) does not show this card on the token page; Stream Studio may still show a read-only reserve amount if you enable that overlay layer.
- A sticky notice with the latest policy change until you save a newer one.
- A sidebar **Distribution history** of past policy changes (stored in a dedicated audit table, separate from cycle spam in the activity log).
- Highlighted `POLICY` lines in the public activity log and dashboard Output.

These records are intentional, permanent for the life of the project (subject to operational retention limits described in our [Privacy Policy](./privacy.md)), and not optional for creators. Held SOL figures and progress bars are informational counters based on your configured hold % and platform stats; they are not a guarantee of how you will spend funds off-platform. By using LIVE mode you consent to this transparency.

## 5. Fees and payments

Access to the Service may be free or paid depending on current offerings. On-chain costs (network fees, priority fees, ATA rent, slippage, and similar) are paid from wallets you control, not by us. We do not custody your tokens or SOL except as needed to execute transactions you configure.

## 6. Acceptable use

You agree not to:

- Use the Service for fraud, market manipulation, money laundering, sanctions evasion, or illegal activity.
- Attempt to break, probe, or overload the Service or related systems.
- Share dashboard sessions, metrics keys, or decrypted secrets in public channels.
- Reverse engineer the Service except where law expressly allows it.
- Misrepresent affiliation with Latrine Bot or impersonate others.

## 7. Intellectual property

The Service, including software, design, documentation, and branding, is owned by us or our licensors. You receive a limited, non-exclusive, revocable license to use the Service for your own projects while you comply with these Terms. You retain rights to your own token projects and content you supply.

## 8. Disclaimers

**The Service is provided "as is" and "as available."** To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.

We do not guarantee uninterrupted operation, error-free transactions, profitable outcomes, eligibility accuracy, or compatibility with future protocol changes on Solana or Pump.fun.

## 9. Limitation of liability

To the fullest extent permitted by law, we and our operators, affiliates, and suppliers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, or digital assets, arising from or related to the Service, even if we were advised of the possibility.

Our total liability for any claim relating to the Service is limited to the greater of (a) amounts you paid us for the Service in the twelve (12) months before the claim, or (b) one hundred U.S. dollars (USD $100).

## 10. Indemnity

You will defend, indemnify, and hold harmless us and our operators from claims, damages, and expenses (including reasonable legal fees) arising from your use of the Service, your token project, your on-chain transactions, or your violation of these Terms or applicable law.

## 11. Suspension and termination

We may suspend or terminate your access if we reasonably believe you violated these Terms, pose risk to the Service or others, or as required by law. You may stop using the Service at any time. Sections that by nature should survive (disclaimers, liability limits, indemnity, governing law) survive termination.

## 12. Changes to these Terms

We may update these Terms by posting a new version on this page and updating the "Last updated" date. Continued use after changes means you accept the revised Terms. Material changes may also be noted in the dashboard or on the homepage when practical.

## 13. Governing law

These Terms are governed by the laws applicable in the place where the Service operator is established, without regard to conflict-of-law rules. Courts in that jurisdiction will have exclusive venue for disputes, unless mandatory consumer protection law in your country requires otherwise.

## 14. Contact

Questions about these Terms: contact us on X at [@Latrine_bot](https://x.com/Latrine_bot).

[Privacy Policy](./privacy.md) · [Home](https://latrinebot.com)
