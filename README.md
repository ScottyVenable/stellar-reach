# Galactic Trader — Stellar Reach

<div align="center">

[![Version](https://img.shields.io/badge/version-0.1.0--dev-blue?style=flat-square)](CHANGELOG.md)
[![Channel](https://img.shields.io/badge/channel-development-6366f1?style=flat-square)](docs/BRANCHING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square&logo=pwa&logoColor=white)](public/manifest.webmanifest)
[![Electron](https://img.shields.io/badge/Electron-41-47848f?style=flat-square&logo=electron&logoColor=white)](electron/main.cjs)
[![Android](https://img.shields.io/badge/Android-Capacitor_8-3ddc84?style=flat-square&logo=android&logoColor=white)](capacitor.config.json)
[![CI](https://img.shields.io/github/actions/workflow/status/ScottyVenable/galactic-trader/ci.yml?branch=development&style=flat-square&label=CI)](https://github.com/ScottyVenable/galactic-trader/actions)
[![License](https://img.shields.io/badge/license-private-red?style=flat-square)](#privacy)

**Captain a starship. Trade across six civilisations. Build a crew. Survive the void.**

A sci-fi mobile trading and management simulator — installable PWA, Windows desktop, and Android APK, all from a single codebase.

[Play (PWA)](https://scottyvenable.github.io/galactic-trader/) · [Changelog](CHANGELOG.md) · [Roadmap](docs/ROADMAP.md) · [GDD](docs/GDD.md) · [Contributing](.github/CONTRIBUTING.md)

</div>

---

## What is Stellar Reach?

You command a mid-sized freighter in a procedurally generated galaxy of fourteen star systems. Every run seeds a different trade landscape — but the physics are always the same. Six sentient races control stations and shape local economies. Prices drift with news, supply, and the aftermath of your own trades. Crew manage themselves on a stress-driven energy model; push them too hard and they go Chaotic or Depleted. Routes are fast or safe, never both.

The game ships as a fully static PWA: no server, no account, no tracking. Install it to your home screen, play offline, and carry your save in `localStorage`.

---

## Feature highlights

| System | Detail |
|---|---|
| **Galaxy** | 14 star systems, 1–3 stations each, 4 regions (Core / Inner / Frontier / Lawless), fully deterministic from a single seed |
| **Economy** | Daily price drift toward baseline, supply/demand restock, news multipliers, post-trade nudges |
| **Goods** | 36 hand-authored goods across 12 categories; legality tiers; bulk pricing |
| **Races** | 6 sentient races (Terran, Vendari, Kresh, Silicari, Aelyn, Voidkin) — each with import/export biases that shape every market they control |
| **Crew** | 8 roles, 12 traits, energy-frequency model (Radiant / Focused / Grounded / Chaotic / Depleted) replaces hit points with stress-driven performance bands |
| **Ship** | 18 modules across 6 hardpoints (Hull, Cargo, Drive, Shield, Sensor, Utility) with upgrade tiers |
| **Routes** | Safe vs Fast travel resolved as `d20 + skill vs DC`; 9 hand-authored transit events |
| **News** | 10 templated news beats that decay over 3–7 days and perturb economy system-wide |
| **Couriers** | Hire NPCs to ferry cargo while you manage the ship — or fly it yourself |
| **Save** | Autosave + manual save + abandon-and-restart, all in `localStorage` |
| **Mods** | Drop a `mods/` folder with a `mod.json` manifest to add new goods without touching engine code |

---

## Running locally

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Serve the production build locally
npm run typecheck    # tsc strict check (no emit)
```

The build is a fully static `dist/` folder. Deploy to any static host or
open via `npm run preview`. Set `VITE_BASE` to host under a sub-path (e.g. a GitHub Pages project site).

### Desktop (Windows)

```bash
npm run electron:build   # Packages the Electron .exe installer into dist-electron/
```

### Launcher (convenience)

```powershell
.\launcher.ps1          # Interactive menu: run dev / build / sync to Google Drive
.\launcher.ps1 -Action Run
.\launcher.ps1 -Action Build
.\launcher.ps1 -Action Sync
```

---

## Releases and CI

Every PR to `development` triggers `.github/workflows/ci.yml`:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`

On merge, `.github/workflows/version-bump.yml` bumps `package.json` and promotes the `[Unreleased]` changelog block to a dated heading.

On PRs from this repo, `.github/workflows/release.yml` publishes three pre-release artifacts:

| Artifact | Tag pattern |
|---|---|
| Web PWA (`.zip`) | `pr-<N>-<sha>` |
| Windows Electron (`.exe`) | `pr-<N>-<sha>-windows` |
| Android APK (`.apk`) | `pr-<N>-<sha>-android` |

---

## Project layout

```
.
├─ docs/                        GDD, roadmap, branching model, changelog format
├─ mods/                        Example mod and modding contract documentation
├─ public/                      PWA shell — manifest, service worker
├─ scripts/                     Build-time: parse-changelog, version, data validation
├─ src/
│  ├─ data/                     Authored content: goods, races, modules, traits, names
│  ├─ engine/                   Pure game logic: rng, galaxy, economy, news, crew, events, game, save
│  ├─ state/                    Zustand store — thin shell over engine, autosaves on every mutation
│  ├─ styles/                   Global CSS design tokens
│  └─ ui/
│     ├─ components/            Shared primitives: TabBar, TopBar, TripModal, ChangelogModal
│     └─ screens/               Title, Market, Ship, Crew, Helm, News, Missions, Log
├─ electron/                    Electron main process
├─ .github/
│  ├─ agents/Sol.agent.md       Sol — AI co-creative director and lead programmer
│  ├─ copilot-instructions.md   Full operating manual for Sol
│  ├─ workflows/                CI, version-bump, release, labels-sync, auto-project
│  └─ CONTRIBUTING.md           Branch model, PR workflow, house rules
└─ launcher.ps1                 Developer convenience launcher
```

All game-state mutations are pure functions in `src/engine/game.ts`. The Zustand store in `src/state/store.ts` calls them and autosaves the result. There is no server, no network state, no `Math.random`.

---

## Branch model

| Branch | Channel | Audience |
|---|---|---|
| `development` | `-dev.B` | Contributors — default branch, all PRs target here |
| `alpha` | `-alpha.B` | Public alpha testers — promoted from `development` at milestone gates |
| `main` | (none) | Public stable — promoted from `alpha` at v1.0 |

`B` is the git commit count, computed at build time. Never edited by hand.

See [docs/BRANCHING.md](docs/BRANCHING.md) for the full promotion criteria.

---

## Contributing

Read [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) and [`.github/copilot-instructions.md`](.github/copilot-instructions.md) before opening a PR. The short version: branch off `development`, use Conventional Commits, update `CHANGELOG.md`, and open a PR — CI and version automation handle the rest.

The AI agent **Sol** ([`.github/agents/Sol.agent.md`](.github/agents/Sol.agent.md)) is available in VS Code Copilot to help with implementation, PR workflow, and changelog discipline.

---

## Privacy

The game stores its save in your browser's `localStorage`. Nothing is
sent over the network beyond loading the static assets. No analytics, no accounts, no telemetry.
