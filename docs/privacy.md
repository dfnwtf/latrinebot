# Privacy Policy

*Last updated: June 6, 2026*

Canonical web version: [latrinebot.com/privacy.html](https://latrinebot.com/privacy.html)

This Privacy Policy explains how Latrine Bot ("we", "us") collects, uses, and shares information when you visit [latrinebot.com](https://latrinebot.com), use the developer dashboard, APIs, or related services (the "Service").

## 1. Information we collect

### Information you provide

- **Wallet address** used to sign in (Sign-In With Solana).
- **Project settings** such as project name, token mint (contract address), tiers, thresholds, and cycle parameters for mainnet LIVE automation.
- **Secrets you store in the dashboard** - dev wallet private key and RPC URL (including API keys embedded in the URL). These are encrypted at rest on our servers and are not shown in full after save. See [Security](./security.md).
- **Metrics API keys** you generate for read-only access to project stats and events.
- **Messages on X** if you contact us via our official account.
- **Holder perk data** - wallet addresses and reward currency preferences when holders use Sign-In With Solana on a token page; tweet URLs and wallet addresses when holders submit an X post boost claim.

### Information collected automatically

- **Usage and logs** - requests to our API, dashboard actions, bot cycle events, errors, and timestamps stored in our database for operations and your project history.
- **Public policy audit** - when a LIVE creator changes fee split, default reward asset, or certain perks, we store `POLICY` lines in a dedicated audit table and expose them on the public token page, APIs, and activity log (mandatory transparency).
- **On-chain and public data** - token balances, holder snapshots, market data, and transaction results obtained via Solana RPC and public APIs (for example DexScreener) to run the Service.
- **Technical data** - IP address, browser type, and similar data in server and CDN logs (see hosting below).
- **Cookies** - session cookie for dashboard login (JWT). We do not use third-party advertising cookies on the core Service.

## 2. How we use information

- Provide, secure, and improve the Service (authentication, running cycles, displaying stats, share cards, documentation).
- Encrypt and store credentials; decrypt only inside secure workers during active mainnet cycles.
- Respond to support requests and enforce our [Terms and Conditions](./terms.md).
- Monitor abuse, fraud, and reliability (rate limits, error diagnostics).
- Comply with legal obligations and protect rights and safety.

## 3. How we share information

We do not sell your personal information. We may share data only as follows:

- **Infrastructure providers** - hosting and edge (for example Cloudflare), databases, and workers that process data on our behalf under contractual safeguards.
- **Blockchain networks** - transactions you authorize are public on Solana and visible to anyone.
- **RPC and data APIs** - requests you configure (for example to Helius or DexScreener) are sent to those providers under their privacy policies.
- **Metrics API consumers** - anyone with a valid metrics key can read project metrics and events you expose; treat keys like passwords.
- **Public token pages and APIs** - LIVE project stats, fee split, perk flags, policy history, activity log tail, eligibility checks, and (where enabled) holder reward preferences readable by wallet are visible to anyone without login. Do not use the Service for sensitive personal data you do not want public.
- **Legal** - if required by law, court order, or to protect users and the Service.
- **Business transfers** - in connection with a merger, acquisition, or asset sale, with notice where required.

## 4. Retention

- Project data and event logs are kept while your project exists and as needed for operations, backups, and legal compliance.
- Policy audit entries are retained in a dedicated table (up to the last 100 changes per project) and remain visible on the public token page for the life of the project, separate from trimmed cycle event spam.
- Encrypted secrets remain until you delete them or delete the project, subject to backup retention windows.
- Server logs are retained for a limited period for security and debugging, then deleted or aggregated.

## 5. Security

We use encryption (AES-GCM) for stored secrets, access controls, and industry-standard hosting practices. No method of transmission or storage is 100% secure. You are responsible for protecting your wallet, session, and metrics keys. Details: [Security documentation](./security.md).

## 6. Your choices

- Disconnect your wallet session and stop using the dashboard.
- Delete or rotate secrets and metrics keys in project settings.
- Request access, correction, or deletion of account-related data by contacting us (subject to legal and operational limits).
- Do not submit sensitive personal data unrelated to operating a token project; the Service is not designed for consumer PII beyond what is needed to run automation.

## 7. International users

We may process and store information in countries where we and our providers operate. By using the Service, you understand that data may be transferred to jurisdictions with different privacy laws than your own.

## 8. Children

The Service is not directed to anyone under 18. We do not knowingly collect information from children. If you believe a child provided data to us, contact us and we will take appropriate steps to delete it.

## 9. Third-party links

The Service may link to third-party sites (for example X, Pump.fun, block explorers). Their privacy practices are governed by their own policies, not this one.

## 10. Changes

We may update this Privacy Policy by posting a new version on this page with an updated "Last updated" date. Continued use after changes means you accept the revised policy.

## 11. Contact

Privacy questions or requests: contact us on X at [@Latrine_bot](https://x.com/Latrine_bot).

[Terms and Conditions](./terms.md) · [Home](https://latrinebot.com)
