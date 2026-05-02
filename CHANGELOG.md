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

### Features
- UI rehaul: bridge-console identity. Self-hosted typography pairing
  (Chakra Petch for HUD chrome and headings, Space Grotesk for body
  copy, JetBrains Mono for numerics and labels). Desktop adopts a full
  HUD strip across the top with stardate, callsign, hull / fuel / cargo
  bars, credits, and net worth; the left tab rail becomes vertical
  console buttons with iconography and `Fn` hotkey hints; the right rail
  picks up a live news ticker and trade-hold readout. Mobile keeps its
  portrait stack but gains the same icon set on the bottom bar and a
  contextual breadcrumb on every screen. Each active screen now renders
  inside a thin "viewport" frame with corner brackets, fading in on
  navigation (or instantly under reduced motion). (#100)
- Settings modal. New gear button in the HUD opens a Settings dialog
  with three controls: font scale (Small / Standard / Large / XL),
  density (Comfortable / Compact), and motion (System / Reduce / Full).
  Persisted to `localStorage` independently of the game save, so they
  survive new game and reset. (#100)
- Responsive desktop layout. Viewports `>= 960px` wide unfold a 16:9
  dashboard with a vertical tab rail on the left, the active screen in
  the center, and a live status rail on the right (credits, day, station
  summary, ship hull / fuel / cargo). Viewports `< 960px` keep the
  portrait stack unchanged. The break is viewport-driven, not user-agent
  driven. Electron windows now open at 1280x720 with a 960x540 minimum,
  and the PWA manifest no longer locks orientation to portrait. (#89)

### Improvements
- Datapad visual restyle. Sharp-cornered panels replace the previous
  rounded look. Two accent colours dominate: muted neon green
  (`#7BD389`) for confirm / active / nominal states, muted red
  (`#E5484D`) for warnings / close / critical. Cyan, violet, and amber
  are demoted to secondary accents. New `PanelHeader` component renders
  a monospace tag like `MARKET / FN03` with a thin status strip on every
  gameplay screen. Numeric readouts use a monospace face; labels use
  small uppercase tracked sans. Decorative diagonal-stripe accents anchor
  the four corners of the app shell. Reduced-motion preference respected.
  (#90)
- Save files now carry a version envelope (`{ v, state }`) and migrate
  forward automatically on load. Legacy saves written by v0.1.x are detected
  by the old key and migrated seamlessly — no save lost on upgrade. (#21)

### Internal
- Galaxy map renderer scaffold. Adds `GalaxyMap`, `SystemMap`, and
  `MiniMap` SVG components plus a `flags.galaxyMap` feature flag in the
  Zustand store. The Helm screen renders the new components only when
  the flag is on; default is off, so existing behaviour is unchanged.
  Full implementation lands across three sub-issues of #91. (Refs #91)

### Bug Fixes
- Datapad redesign accessibility/layout fixes: corner-accent stripes now
  anchor to the `.app` shell (added `position: relative`) instead of
  drifting to the viewport corners on tablet-width layouts; `PanelHeader`
  renders a real heading element (default `<h2>`, optional `as="h3"`)
  so screen-reader heading navigation continues to land on each panel
  title. (#90)
- Galaxy map scaffold now sizes correctly via shared `.galaxy-map` /
  `.system-map` CSS rules (mirrors `.starmap`); previously the new SVGs
  fell back to the 300x150 default. Markers in `GalaxyMap` and
  `SystemMap` are keyboard-focusable with `role="button"`, descriptive
  `aria-label`s, and Enter/Space activation; `role="img"` removed from
  the interactive SVGs. `MiniMap` now exposes its name to assistive tech
  via `<title>` + `aria-labelledby` on the `<svg>` itself. (Refs #91)
- Replaced `Math.random()` bootstrap calls in `src/engine/rng.ts` and
  `src/engine/game.ts` with `crypto.getRandomValues()`, satisfying the
  determinism policy. The UI and engine no longer call `Math.random`
  anywhere. (#22)

### Internal
- Bumped CI and release workflows from Node.js 20 to Node.js 22 to satisfy
  the Capacitor CLI minimum requirement (`>=22`); also updated the Android
  build job from Java 17 to Java 21 to match Gradle's `sourceCompatibility`
  target and avoid the `invalid source release: 21` build error.
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
- Bumped version to 0.2.0-dev.0 to mark Phase A (Foundations and Pipeline)
  complete and gate the `development -> alpha` promotion. (#23)
- Corrected stale `galactic-trader` repository references in README badges
  and links to point at the live `stellar-reach` repository. (#24)

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
