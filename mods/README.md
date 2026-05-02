# Mods

Galactic Trader / Stellar Reach loads mods from this folder. A mod is a
folder containing a `mod.json` manifest and a `data/` subfolder with JSON
files that add to or override the game's data registry.

```
mods/
  example-mod/
    mod.json
    data/
      goods.json
      events.json
      ...
```

This README is the canonical contract. The loader's TypeScript schema
lives at `src/engine/mods.ts`.

## `mod.json` manifest

```json
{
  "id": "example-mod",
  "name": "Example Mod",
  "version": "0.1.0",
  "author": "Your Name",
  "description": "One-paragraph description.",
  "gameVersion": "^0.2.0",
  "manifestVersion": 1,
  "dependencies": [],
  "load": {
    "goods": "data/goods.json",
    "events": "data/events.json"
  },
  "overrides": {
    "goods": ["solvex"]
  }
}
```

Field reference:

- `id` (string, kebab-case, required) — globally unique. The folder name
  must match.
- `name` (string, required) — human-readable.
- `version` (SemVer, required) — for compatibility tracking with the
  modding marketplace (post-v1).
- `author` (string, required).
- `description` (string, required).
- `gameVersion` (SemVer range, required) — what versions of the game the
  mod supports. Loader rejects mods outside the range.
- `manifestVersion` (integer, required) — currently `1`.
- `dependencies` (array of mod ids, optional) — load order.
- `load` (object, required) — maps data category names to JSON files
  inside the mod folder.
- `overrides` (object of category -> array of ids, optional) — declares
  intent to **replace** existing entries with the same id; entries not
  listed in `overrides` will fail with a duplicate-id error.

## Data file shapes

Every data file is a JSON array of objects matching the engine's typed
shape for that category. Authoring:

- IDs are kebab-case strings, mod-prefixed (for example
  `"id": "example-mod:plasma-tea"`). The loader rejects unprefixed IDs
  unless they appear in `overrides`.
- Numbers are plain numbers (no underscores, no scientific notation).
- Strings have no emojis.

Supported categories (initial scaffold):

| Category   | Schema source                  | Example file               |
| ---------- | ------------------------------ | -------------------------- |
| `goods`    | `Good` in `src/engine/types.ts`  | `mods/example-mod/data/goods.json` |
| `events`   | `EventTemplate` (planned)      | not yet supported          |
| `traits`   | `Trait` (planned)              | not yet supported          |
| `modules`  | `ShipModule` (planned)         | not yet supported          |
| `races`    | `Race` (planned)               | not yet supported          |

Categories beyond `goods` are reserved; the loader will reject them
until they are wired up. Track progress in the roadmap (Phase B - M21).

## Loading

In v0.2 mods are bundled at build time: any mod folder under `mods/`
that ships in the source tree is compiled into `src/data/mods.generated.json`
by the prebuild step. End-user mod loading from a player's filesystem is
out of scope until M14 (save migrations) ships, after which the PWA may
read mods from a chosen file-system handle on platforms that support it.

## Validation

The loader (`src/engine/mods.ts`) validates each manifest and each data
entry. Validation errors are logged to the console and the mod is
skipped. CI fails if any mod committed to this repo fails validation.

## House rules

- No emojis anywhere in mod content.
- No external network calls from mod data (mods are pure data; there is
  no scripting layer in v0.2).
- Mods may not redefine the four pillars. They may add content; they may
  not break determinism.
