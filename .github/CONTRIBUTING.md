# Contributing to Galactic Trader

Thanks for considering a contribution. This document is the short, human
version of the workflow. Automated contributors (the agent **Sol**) follow
the longer manual at
[.github/copilot-instructions.md](copilot-instructions.md).

## Branch model

- `development` — default branch. All work merges here first.
- `alpha`       — public alpha testing channel.
- `main`        — public stable releases (will be renamed `release` once
  the first stable build ships).

You never push directly to those three. You always work on a branch named:

```
[type]/[your-initials]-[short-kebab-description]
```

`[type]` is one of: `feat`, `fix`, `balance`, `content`, `chore`, `docs`,
`ci`, `mod`. Example: `feat/sv-station-ownership`.

## Workflow

1. Open or pick up an issue. Add yourself as assignee.
2. Branch from the latest `development`.
3. Make focused changes. Match the surrounding style.
4. Run `npm run typecheck`, `npm run lint`, `npm run build` locally.
5. Add an entry to `CHANGELOG.md` under `## [Unreleased]` if your change
   is user-visible. See [docs/CHANGELOG_FORMAT.md](../docs/CHANGELOG_FORMAT.md).
6. Open a pull request against `development`. Fill in the template. Link
   the issue with `Closes #N`.
7. CI must pass. Address review comments by pushing follow-up commits;
   do not force-push during review unless asked.
8. Squash-merge once approved.

## House rules

- **No emojis** anywhere in code, documentation, commits, PR titles, PR
  bodies, issue titles, issue bodies, the wiki, the changelog, or the
  game UI.
- **No `Math.random`.** Use the seeded RNG from `src/engine/rng.ts`
  forked off the game state.
- **No magic numbers.** Pull constants into a named export.
- **Save compatibility.** If you change the shape of persisted state, add
  a migration in `src/engine/save.ts`.
- **Mobile-first.** All tap targets are at least 44px tall. Test in a
  portrait 360px viewport.
- **Determinism.** Same seed must always produce the same galaxy.

## Internal documentation

Sensitive design notes, balance spreadsheets, and unpublished narrative
material live in `../internal-dev-docs/` outside this repository.
`.gitignore` keeps that folder out of commits. Do not paste internal
material into public files; paraphrase or wait until it is ready to ship.

## Code of conduct

Be precise, be kind, hold the line on the design pillars. If a change
breaks one of the four pillars (calm density, emergent narrative, portrait
one-handed, authored systems and generated content) it must defend itself
in writing in the PR description.
