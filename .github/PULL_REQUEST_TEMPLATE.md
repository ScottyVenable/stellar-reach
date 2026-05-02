# Pull Request

## Summary

<!-- One or two sentences. What does this PR change and why? -->

## Type

<!-- Check exactly one. -->

- [ ] feat — new feature or system
- [ ] fix — bug fix
- [ ] balance — content / numeric balance changes
- [ ] content — new authored content (goods, races, modules, traits, events)
- [ ] chore — tooling, dependencies, refactors with no behaviour change
- [ ] docs — documentation only
- [ ] ci — workflows and automation
- [ ] mod — modding API or mod-loader work
- [ ] promote — promotion PR (development -> alpha, or alpha -> main)

## Linked issues

<!-- Use "Closes #N" so the issue is auto-closed on merge. -->

Closes #

## Design pillar check

This change respects the four pillars (or explains the trade-off below):

- [ ] Calm density (no time pressure introduced; decisions stay meaningful)
- [ ] Emergent narrative (interactions remain systemic, not scripted dead-ends)
- [ ] Portrait, one-handed (UI fits a 360px portrait viewport, tap targets >= 44px)
- [ ] Authored systems, generated content (no hand-baked specifics that should
      have been data-driven)

If a pillar is not met, justify here:

> 

## Self-review checklist

- [ ] Branch name follows `[type]/[initials]-[short-description]`.
- [ ] No emojis anywhere in the diff.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `CHANGELOG.md` updated under `## [Unreleased]` if user-visible.
- [ ] No new `Math.random` calls (use the seeded RNG).
- [ ] No new magic numbers (named constants instead).
- [ ] Save format unchanged, or a migration was added in `src/engine/save.ts`.
- [ ] Issue and PR are added to the `Galactic Trader` Project board.

## Version-bump

<!-- Add at most one of these labels to override the default patch bump:
     release-bump:major, release-bump:minor, release-bump:patch -->

## Notes for reviewers

<!-- Optional: anything that needs special attention. -->
