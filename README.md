# Galactic Trader — Stellar Reach

A sci-fi mobile trading and management simulator built as an installable
Progressive Web App. Captain a starship across a procedurally generated
galaxy, trade goods across six sentient races, hire crew to do the work
or fly the milk run yourself.

> The game is shipped as a static PWA so it can be served from any host,
> installed on iOS and Android home screens, and released automatically
> from CI on every pull request.

---

## Documentation

-   **[docs/GDD.md](docs/GDD.md)** — the rewritten Game Design Document.
-   **[docs/ROADMAP.md](docs/ROADMAP.md)** — the milestone-by-milestone
    plan that produced this build.

The original PDF that seeded the design lives at
`Game Design Document_ Stellar Reach.pdf` in the repository root.

## Highlights

-   Mobile-first, portrait-oriented UI with a sleek dark / neon accent
    aesthetic.
-   Procedurally generated universe — different galaxies on every new
    campaign, deterministic from a single seed.
-   36 hand-authored goods across 12 categories (Foodstuffs, Raw
    Materials, Refined Goods, Technology, Medical, Luxury, Weapons,
    Energy, Biological, Contraband, Data, Cultural).
-   6 playable sentient races (Terran, Vendari, Kresh, Silicari, Aelyn,
    Voidkin), each with cultural import / export biases that shape every
    market they control.
-   Crew system with 8 roles, 12 traits, and an "energy frequency" model
    that replaces hit points with stress-driven performance bands.
-   18 ship modules across 6 hardpoints (Hull, Cargo, Drive, Shield,
    Sensor, Utility).
-   Travel routes (Safe vs Fast) with d20 + skill transit events.
-   News feed that perturbs the economy across whole star systems.
-   Hire couriers to ferry cargo while you stay in port, **or** fly it
    yourself.
-   Save / autosave / abandon-and-restart in `localStorage`.
-   Installable, offline-capable PWA with service worker caching.
-   No emojis anywhere in the UI.

## Running locally

```bash
npm install
npm run dev          # vite dev server on http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build
npm run typecheck    # tsc -b in noEmit mode
```

The build produces a fully static `dist/` folder. Serve it from any
static host, or open it via `npm run preview`. The app respects a
`VITE_BASE` environment variable so it can be hosted under a sub-path
such as a GitHub Pages project site.

## Continuous integration and releases

Every pull request triggers `.github/workflows/release.yml`:

1.  `npm ci`
2.  `npm run typecheck`
3.  `npm run build`
4.  Pack `dist/` into `stellar-reach-<sha>.zip` and upload it as a build
    artifact.
5.  For pull requests opened from this repository (not forks), publish a
    pre-release with the zip attached, tagged `pr-<number>-<short-sha>`.

Pushes to `main` build and validate but do not publish a release.

## Project layout

```
.
├─ docs/                       # GDD and roadmap
├─ public/                     # PWA shell (manifest, icons, service worker)
├─ src/
│  ├─ data/                    # authored content (goods, races, modules, traits, names)
│  ├─ engine/                  # pure game logic (rng, galaxy, economy, news, crew, events, game, save)
│  ├─ state/                   # Zustand store wiring engine to React
│  ├─ styles/                  # global CSS tokens
│  ├─ ui/                      # React components
│  │  ├─ components/           # shared UI primitives
│  │  └─ screens/              # tab screens and the title screen
│  └─ main.tsx                 # entry, registers the service worker
├─ .github/workflows/          # CI / release pipeline
└─ vite.config.ts
```

All game-state mutations are pure functions in `src/engine/game.ts`. The
store in `src/state/store.ts` is a thin shell that calls them and
autosaves the result.

## Privacy

The game stores its save in your browser's `localStorage`. Nothing is
sent over the network beyond loading the static assets.
