# Changelog

All notable changes to Galactic Trader / Stellar Reach are recorded here.
The format is locked because the in-game changelog viewer parses this file
directly. See [docs/CHANGELOG_FORMAT.md](docs/CHANGELOG_FORMAT.md) for the
full grammar.

The project uses Semantic Versioning. Pre-release builds carry a channel
suffix (`-dev.<build>` on `development`, `-alpha.<build>` on `alpha`).
The fourth digit (build) is the git commit count and is appended at build
time, never written here.

## [Unreleased]

<!--
Add new entries under the appropriate category. The version-bump workflow
rewrites this section into a dated, versioned heading on merge. Do not
pre-date entries.

Categories (omit a category if it has no entries):
  ### Features
  ### Improvements
  ### Bug Fixes
  ### Balance
  ### Content
  ### Modding
  ### Internal
-->

### Internal
- Established three-tier branch model (`development` -> `alpha` -> `main`)
  with `development` as the default branch.
- Introduced the **Sol** agent persona and the operating manual at
  `.github/copilot-instructions.md`.
- Added issue templates, PR template, CODEOWNERS, label catalog, and the
  `Galactic Trader` Project workflow conventions.
- Added the version-bump and build-number automation
  (`scripts/version.mjs`, `.github/workflows/version-bump.yml`).
- Added the mod-loader scaffold under `mods/` with an example mod and a
  draft JSON schema in `src/engine/mods.ts`.
- Added the in-game changelog viewer accessible from the title screen.

---

## [0.1.0-dev.0] - 2026-05-02 - Development

**Title:** First Light

**Description:** Initial public scaffold of Stellar Reach: PWA shell, the
deterministic galaxy generator, the dynamic economy and news feed, the
crew system with energy frequencies, the courier track, and the six-tab
mobile UI. This entry is a snapshot of everything shipped through pull
requests #1 and #2 prior to the development-branch reorganisation.

### Features
- Procedurally generated galaxy of 14 systems and 1-3 stations per system,
  seeded from a single string.
- 36 hand-authored goods across 12 categories with legality tiers.
- 6 sentient races with cultural import / export biases.
- 18 ship modules across 6 hardpoints with upgrade trees.
- 12 crew traits and an energy-frequency model derived from stress.
- Six authored transit events resolved by d20 + skill checks.
- Captain's Log of every event, trade, hire, and arrival.
- Courier hiring track running in parallel to player-flown deliveries.
- Installable PWA with offline service-worker caching.

### Internal
- Vite + React + TypeScript + Zustand stack, strict tsconfig, ESLint.
- GitHub Actions release pipeline producing web bundle, Windows installer,
  and Android debug APK on every PR and `main` push.
