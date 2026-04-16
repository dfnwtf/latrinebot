# Docs style

Short, opinionated rules for everything under [`docs/`](docs/).

## Tone

- Plain English. Short sentences.
- Address the reader as "you".
- No marketing words ("revolutionary", "game-changing", "seamless").
- No emoji.

## Punctuation

- ASCII hyphen `-` only. **Never** em dash `—` or en dash `–`.
- Empty stat placeholders: `-`, not `—`.
- Sentence case for headings (`How it works`, not `How It Works`).

## Structure

- Each page opens with a 1-2 sentence summary, then the body.
- Use H2 (`##`) for sections, H3 (`###`) for subsections. Skip levels are fine if they read better.
- Tables for anything that fits in a table. Bullet points for short lists. Paragraphs for everything else.

## Code samples

- Use full endpoint paths, not pseudocode.
- Authentication header is shown on every authenticated example.
- Example values use clearly placeholder forms (`<MINT>`, `<PROJECT_ID>`, `lb_live_xxx`) - never real wallet pubkeys or real metrics keys.

## Linking

- Internal: relative paths (`./getting-started.md`), not absolute URLs.
- External: full URL, no shorteners.
- API endpoint references link to the API reference page anchor (`./api-reference.md#endpoint-name`).

## Versions

When something changes in a release, mention the version in a small note at the top of the affected section:

> Added in **0.4.0**. Renamed in **0.4.2**.

Service version is tracked in [latrinebot-changelog](https://github.com/dfnwtf/latrinebot-changelog).
