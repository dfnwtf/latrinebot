# Contributing

Short and friendly.

## Repo layout

```
docs/          Markdown docs - mirrors latrinebot.com/docs (CC BY 4.0)
sdk/           @latrinebot/sdk - TypeScript client + OpenAPI 3.1 spec (MIT)
widgets/       @latrinebot/widgets - browser embeds (MIT)
calculator/    Standalone eligibility calculator (MIT)
cli/           @latrinebot/cli - CLI over the public API (MIT)
CHANGELOG.md   Service-level changelog
```

Each package has its own `CHANGELOG.md` with per-package versions.

## Small fixes

Typos, broken links, doc clarity, obvious bugs - open a PR directly. No need to ask first.

## Bigger changes

Open an issue first so we agree on scope. Especially:

- New SDK methods. We add them on the service side first, then the OpenAPI spec, then the SDK.
- New docs sections or restructuring.
- New widget block types or themes.

## Setup

```bash
git clone https://github.com/dfnwtf/latrinebot.git
cd latrinebot
npm install        # uses workspaces
npm run lint
npm run build
npm test
```

Each workspace (`sdk`, `widgets`, `cli`) can be built individually:

```bash
npm run build --workspace=@latrinebot/sdk
```

## Style

- ASCII hyphen `-` only. Never em dash, never en dash.
- Sentence case for headings.
- One sentence per line in lists and short notes; paragraphs for prose.
- TypeScript strict, `noUncheckedIndexedAccess: true` across all packages.
- No new runtime deps in `sdk/` (zero-dep on purpose) or `widgets/` (browser).
- No emoji in code, comments, or docs.

## Examples and example values

- Use `<MINT>`, `<PROJECT_ID>`, `lb_live_xxx` style placeholders. Never paste a real wallet or key.
- Run `node ../scripts/check-leaks.mjs latrinebot` before opening a PR if you touched secrets-adjacent text.

## Releases

Releases follow the service version. Maintainers bump the version in the affected workspace, update its CHANGELOG and the root `CHANGELOG.md`, then publish via `npm publish --workspace=…`.
