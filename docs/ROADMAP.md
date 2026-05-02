# Stellar Reach - Roadmap

This is the live roadmap. It is structured around the three branches
(`development` -> `alpha` -> `main`) and a SemVer cadence. Every item is
scoped enough to fit in a small handful of pull requests, and every
milestone has a definition-of-done that gates promotion to the next
channel.

The four pillars (Calm density, Emergent narrative, Portrait one-handed,
Authored systems / generated content) are the only acceptance criteria
that override schedule.

History through `v0.1.0-dev.0` (M1 - M9) is captured in
`CHANGELOG.md`. This document covers everything from `v0.2` onward.

---

## Channel and version map

| Channel       | Format                          | Audience                          | Promotion gate                              |
| ------------- | ------------------------------- | --------------------------------- | ------------------------------------------- |
| `development` | `<MAJOR>.<MINOR>.<PATCH>-dev.B` | Contributors only                 | CI green, design pillars defended in the PR |
| `alpha`       | `<MAJOR>.<MINOR>.<PATCH>-alpha.B` | Public alpha testers              | Two consecutive playtest cycles with no P0/P1 bugs and one explicit "balance is interesting" sign-off |
| `main`        | `<MAJOR>.<MINOR>.<PATCH>`       | Public stable                     | Full alpha cycle complete, no open P0/P1, save migration verified, store-listing parity |

`B` is the git commit count appended at build time
(`scripts/version.mjs`). It is never edited by hand.

---

## Phase A - Foundations and Pipeline (v0.2)

**Theme.** Make the project safely promotable and moddable. No new gameplay
in this phase; everything serves the next year of work.

| Milestone | Title                                              | Target version       | Notes |
| --------- | -------------------------------------------------- | -------------------- | ----- |
| M10       | Three-tier branch model + Sol agent + GitHub plumbing | 0.2.0-dev            | This PR. |
| M11       | Versioning and changelog automation                | 0.2.0-dev            | This PR. |
| M12       | In-game changelog viewer                           | 0.2.0-dev            | This PR. |
| M13       | Mod-loader scaffold + JSON data registry           | 0.2.0-dev            | This PR. |
| M14       | Save migrations framework                          | 0.2.1-dev            | A registered list of `from -> to` migrations replacing the current `KEY` bump shortcut. |
| M15       | First public alpha cut                             | 0.2.0-alpha          | Promote `development` to `alpha`. Publish APK + Windows + web bundle to the alpha pre-release. |

**Definition of done for Phase A.** A new contributor can clone the repo,
read `.github/copilot-instructions.md`, branch off `development`, push a
PR, and the version-bump and changelog automation does the rest. A modder
can drop a mod folder into `mods/` and see new goods appear in the next
campaign.

---

## Phase B - Content Density (v0.3)

**Theme.** Double the authored surface area without changing systems.

| Milestone | Title                                              | Target version       |
| --------- | -------------------------------------------------- | -------------------- |
| M16       | Content pass: 36 -> 60 goods, all 12 categories filled out | 0.3.0-dev    |
| M17       | Content pass: 18 -> 30 ship modules                | 0.3.0-dev            |
| M18       | Content pass: 12 -> 24 crew traits                 | 0.3.0-dev            |
| M19       | Content pass: 6 -> 16 transit events               | 0.3.0-dev            |
| M20       | Two new station kinds (Diplomatic Embassy, Reclamation Yard) | 0.3.0-dev  |
| M21       | Migrate authored data from `src/data/*.ts` to `src/data/json/` | 0.3.0-dev    |
| M22       | Public alpha cut                                   | 0.3.0-alpha          |

**Definition of done.** A campaign feels meaningfully different across
two seeded runs in the same region of space. No new code paths beyond
the new station-kind biases.

---

## Phase C - Systems Depth (v0.4 - v0.5)

**Theme.** New systems that compose with existing ones.

| Milestone | Title                                              | Target version       |
| --------- | -------------------------------------------------- | -------------------- |
| M23       | Reputation per race (and station-tier discounts)   | 0.4.0-dev            |
| M24       | Faction storyline framework (multi-step contracts) | 0.4.0-dev            |
| M25       | First two authored storylines (Concord + Voidkin)  | 0.4.0-dev            |
| M26       | Station ownership: buy shares, daily dividend tick | 0.5.0-dev            |
| M27       | Fleet management (own multiple ships, route them)  | 0.5.0-dev            |
| M28       | Combat-encounter framework (short tactical events) | 0.5.0-dev            |
| M29       | Public alpha cut                                   | 0.5.0-alpha          |

**Definition of done.** All four pillars survive the addition. Player
choice load per turn does not exceed three meaningful decisions.

---

## Phase D - Polish and Platform (v0.9)

**Theme.** Get to a shippable v1.

| Milestone | Title                                              | Target version       |
| --------- | -------------------------------------------------- | -------------------- |
| M30       | Tutorial flow (first-30-day gentle onboarding)     | 0.9.0-dev            |
| M31       | Accessibility audit (contrast, scaling, reduced motion) | 0.9.0-dev       |
| M32       | Localisation framework (English first, hooks for more) | 0.9.0-dev        |
| M33       | Capacitor signed Android build + iOS build path    | 0.9.0-alpha         |
| M34       | Performance budget enforcement in CI               | 0.9.0-alpha         |
| M35       | Final v1 alpha cut                                 | 0.9.0-alpha          |

---

## v1.0 Release Gate (`main`)

The first push to `main` (and the rename `main -> release`) requires:

- All Phase A through Phase D milestones merged.
- Two consecutive alpha cycles with zero open P0 / P1 issues.
- Save format frozen for the v1 line, with documented migration policy.
- `docs/GDD.md` reconciled against shipped reality.
- `CHANGELOG.md` rewritten for the v1.0.0 release with a single
  authoritative `## [1.0.0]` heading consolidating the alpha cycle.
- Wiki pages: Getting Started, Crew Guide, Trading Guide, Modding Guide,
  Lore Primer, all updated.
- Public Discussion thread for the release announcement.

After `v1.0.0` ships:

- `main` becomes the protected `release` branch (rename via
  `gh repo edit --default-branch release` and a follow-up branch rename).
- `alpha` becomes the perpetual public test channel.
- `development` continues as before.

---

## Post-v1 (v1.x and beyond)

| Theme                 | Notes |
| --------------------- | ----- |
| Cloud save sync       | Requires a backend; design for the simplest possible service. |
| Long-form story arcs  | Multi-campaign continuity, scoring, ledger of past captains. |
| Modding marketplace   | A discoverable mod index hosted as a static JSON feed. |
| Hard mode / sandbox   | Difficulty presets that tune the economy, news cadence, and event lethality. |
| Procedural lore       | Per-galaxy historical events that perturb baseline biases at gen time. |

---

## How items move on this roadmap

1. Each milestone above is mirrored as an issue in GitHub with the
   `roadmap` label and the milestone name as the title.
2. Issues are added to the `Galactic Trader` Project board under the
   Phase column.
3. When a milestone's PRs all merge into `development`, the issue is
   closed and the milestone row in this document is struck through:

   ~~M16 - Content pass: 36 -> 60 goods~~

4. The roadmap is rewritten only at phase boundaries, not after every
   milestone, to avoid churn.
