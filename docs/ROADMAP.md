# Stellar Reach — Roadmap

This roadmap was produced by reading the `Game Design Document_ Stellar Reach.pdf`
shipped with the repository, rewriting it as `docs/GDD.md`, and then sequencing
every system the GDD requires.

Each milestone below has a clear definition of done and a list of files /
modules touched. Milestones M1 through M9 are *delivered in this PR*. M10+ are
planned post-v1 stretch goals reserved for future work.

---

## M1. Project Foundations
**Status:** Done.

-   Vite + React + TypeScript scaffold.
-   PWA: manifest, icons, service worker, install metadata.
-   Strict tsconfig, ESLint, GitHub Actions release pipeline.
-   `docs/GDD.md` rewritten from the source PDF.
-   `docs/ROADMAP.md` (this file).

Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`,
`public/manifest.webmanifest`, `public/icon.svg`, `public/icon-{192,512}.png`,
`public/sw.js`, `.eslintrc.cjs`, `.github/workflows/release.yml`.

## M2. Deterministic RNG and Domain Types
**Status:** Done.

-   `src/engine/rng.ts` — mulberry32 + FNV-1a string seeds, with `int`,
    `range`, `chance`, `pick`, `shuffle`, `roll`, and `fork`.
-   `src/engine/types.ts` — every persisted entity (Good, Race, Station,
    StarSystem, NewsItem, ShipModule, CrewMember, CourierMission, GameState).

## M3. Authored Content
**Status:** Done.

-   `src/data/goods.ts` — 36 goods across 12 categories with bulk and legality.
-   `src/data/races.ts` — 6 sentient races with cultural import/export biases.
-   `src/data/modules.ts` — 18 ship modules across 6 hardpoints.
-   `src/data/traits.ts` — 12 crew traits with role and stress modifiers.
-   `src/data/names.ts` — system, station, and per-race name pools.

## M4. Procedural Universe
**Status:** Done.

-   `src/engine/galaxy.ts` — generates 14 systems x 1-3 stations from a seed,
    assigning races by region, station kinds with culture-aware preferences,
    and seeding the initial market for every station.

## M5. Dynamic Economy and News
**Status:** Done.

-   `src/engine/economy.ts` — daily market drift toward baseline, supply and
    demand restock, news-driven price multipliers, post-trade adjustments.
-   `src/engine/news.ts` — 10 templated news beats keyed to specific systems
    and goods/categories, with decay over 3-7 days.

## M6. Crew System
**Status:** Done.

-   `src/engine/crew.ts` — procedural crew generation with race-flavoured
    names and skill curves, daily stress decay, energy state derivation, and
    effective skill computation.
-   Sensory Deprivation Pod resting (toggle), hiring with signing fee,
    dismissal with severance, daily wage cost.

## M7. Travel, Events, and Resolution
**Status:** Done.

-   `src/engine/events.ts` — six authored event templates (derelict freighter,
    pirate skiffs, subspace anomaly, refugees, customs inspection, meteors)
    with multi-choice resolution including auto-options.
-   `src/engine/game.ts` — `estimateRoute`, `beginTravel`, `resolveChoice`,
    `arriveAt`. Each travel step ticks news, economy, crew, wages, and any
    couriers whose end day has been reached.

## M8. Couriers (Hire vs DIY)
**Status:** Done.

-   `hireCourier` in `src/engine/game.ts` and the **Jobs** screen in
    `src/ui/screens/MissionsScreen.tsx` let the player ship cargo without
    leaving port. Pay rates use the destination's *current* market price.

## M9. UI Shell and Screens
**Status:** Done.

Mobile portrait shell with a top bar, six bottom tabs, modal-based transit,
and a captain's log:

-   `src/ui/App.tsx`, `src/ui/components/{TopBar,TabBar,TripModal}.tsx`.
-   Screens: `MarketScreen`, `ShipScreen`, `CrewScreen`, `HelmScreen`,
    `NewsScreen`, `MissionsScreen`, `LogScreen`, plus the `TitleScreen`.
-   `src/state/store.ts` — Zustand store wiring pure engine functions to
    React, with autosave to `localStorage`.
-   `src/styles/global.css` — dark / neon UI tokens, tap-target sizing,
    viewport-fit safe-area handling.

---

## v1 Acceptance Criteria

-   [x] Random universe per game (seed-driven, reroll on title screen).
-   [x] At least 30 distinct goods.
-   [x] At least 4 distinct sentient races (we ship 6).
-   [x] Sci-fi datapad UI: dark, neon-accented, portrait, no emojis.
-   [x] Hire crew to ferry cargo *or* fly it yourself.
-   [x] Multiple ship hardpoints with upgrade trees.
-   [x] Travel events with d20 + skill resolution.
-   [x] News feed driving the economy.
-   [x] Save/load and abandon-and-restart.
-   [x] Installable PWA, offline-capable.
-   [x] GitHub Actions workflow that publishes a release per PR.
-   [x] Documentation: rewritten GDD and this roadmap.

---

## M10+. Post-v1 Stretch (out of scope for this PR)

-   **Station ownership.** Buy controlling shares in a station; receive a
    cut of its trade. Hooks already exist via `Station.prosperity`.
-   **Authored faction storylines.** Multi-step contracts unlocked by
    reputation with each race.
-   **Combat resolution depth.** Replace single-choice combat events with
    short tactical mini-encounters.
-   **Cloud save sync.** Optional, requires a backend.
-   **Native app store releases.** Wrap the PWA in Capacitor and publish
    signed iOS / Android binaries (requires developer accounts, out of
    scope for an unsigned CI pipeline).
