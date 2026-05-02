# Branching and Promotion

This document explains, in one page, how code moves from a contributor's
laptop into a player's hands.

## Three trunks

```
work branch  ─► development  ─► alpha  ─► main (will rename to release)
```

- **`development`** is the **default branch** and the only place new work
  lands first. Builds carry the `-dev.<build>` suffix.
- **`alpha`** is the public testing channel. Builds carry the
  `-alpha.<build>` suffix. Promote here when development is "semi-stable":
  CI green for a week, no P0/P1 open, all Phase milestones for the version
  closed.
- **`main`** is the public stable channel. Builds carry no suffix. Promote
  here only after a complete alpha cycle (see `docs/ROADMAP.md`).

All three are protected branches: no direct pushes, PR with passing CI
required, CODEOWNERS review required.

## Working branches

```
[type]/[initials]-[short-kebab-description]
```

`[type]` is `feat`, `fix`, `balance`, `content`, `chore`, `docs`, `ci`,
`mod`, or `promote`. Examples:

```
feat/sv-station-ownership
fix/sol-courier-payout-rounding
content/sv-aelyn-event-pack
promote/sol-development-to-alpha
```

Working branches are deleted on squash-merge.

## Promotion procedure

```
gh pr create \
  --base alpha \
  --head development \
  --title "promote: development -> alpha (v0.2.0-alpha)" \
  --body-file .github/promotion-template.md
```

The PR title prefix `promote:` triggers the version-bump workflow to
rewrite the channel suffix instead of bumping the patch number.

After merge, tag the new version and let `release.yml` produce
artifacts:

```
git switch alpha && git pull
git tag v0.2.0-alpha.<build>
git push --tags
```

## Hotfixes

Hotfixes target `main` (or `release`, post-v1.0) directly:

```
fix/sv-hotfix-<short>
gh pr create --base main --head fix/sv-hotfix-<short>
```

After merge, immediately back-merge `main -> alpha -> development` so the
fix propagates and the work branches do not diverge.
