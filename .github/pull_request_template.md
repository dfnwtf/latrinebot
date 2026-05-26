### What

Short summary of the change.

### Why

What does it unlock or fix.

### Scope

- [ ] `sdk/`
- [ ] `widgets/`
- [ ] `cli/`
- [ ] `calculator/`
- [ ] `docs/`
- [ ] Tooling / scripts

### Checks

- [ ] No new runtime deps in `sdk/` or `widgets/`
- [ ] ASCII hyphen `-` only - no em / en dash anywhere I touched
- [ ] If touching public-facing text, ran `node ../scripts/check-leaks.mjs latrinebot`
- [ ] CHANGELOG entry added (root + affected package if applicable)
