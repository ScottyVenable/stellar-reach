#Requires -Version 7
<#
.SYNOPSIS
  One-time script: creates Galactic Trader alpha roadmap issues and adds them to Project 8.
  Run from the repo root.  Delete this script after first successful run.
#>

$repo  = "ScottyVenable/galactic-trader"
$owner = "ScottyVenable"
$proj  = 8

$issues = @(
  @{
    title  = "[M10] Three-tier branch model, Sol agent, and GitHub plumbing"
    labels = "type:ci,area:ci,channel:development,priority:p1"
    body   = @"
**Phase A — v0.2.0-dev**
Establishes the infrastructure that makes every downstream milestone safe to ship.

**Scope**
- Three-tier branch model (`development` → `alpha` → `main`) with branch protection on all three.
- Sol agent persona at `.github/copilot-instructions.md` and `.github/agents/Sol.agent.md`.
- Issue templates (bug, feature, balance, content, mod), PR template, CODEOWNERS, and label catalog.
- GitHub Actions: `ci.yml`, `version-bump.yml`, `labels-sync.yml`, `auto-project.yml`, `release.yml`.
- Changelog pipeline: `scripts/parse-changelog.mjs` → `src/data/changelog.generated.json`.
- In-game changelog viewer accessible from the title screen.
- Mod-loader scaffold under `mods/` with an example mod and `src/engine/mods.ts`.

**Status:** complete — awaiting promotion to `alpha`.
"@
  }
  @{
    title  = "[M11] Versioning and changelog automation"
    labels = "type:ci,area:ci,channel:development,priority:p1"
    body   = @"
**Phase A — v0.2.0-dev**
Automates version computation and changelog promotion so no human ever edits a version number by hand.

**Scope**
- `scripts/version.mjs`: computes `MAJOR.MINOR.PATCH[-channel.BUILD]` where BUILD = `git rev-list --count HEAD`.
- `.github/workflows/version-bump.yml`: on PR merge to `development`, bumps `package.json` and promotes the `[Unreleased]` block in `CHANGELOG.md` to a dated, versioned heading.
- `.github/scripts/bump-and-promote.mjs`: the bump logic itself.
- `npm run version:print` and `npm run version:json` convenience scripts.

**Status:** complete — awaiting promotion to `alpha`.
"@
  }
  @{
    title  = "[M12] In-game changelog viewer"
    labels = "type:feature,area:ui,channel:development,priority:p2"
    body   = @"
**Phase A — v0.2.0-dev**
Players can read the release history without leaving the game.

**Scope**
- `src/ui/components/ChangelogModal.tsx`: channel-tab modal (Stable / Alpha / Development).
- `src/engine/changelog.ts`: typed import of `changelog.generated.json` + `releasesByChannel()`.
- Title screen version chip opens the modal on tap.
- Styles appended to `src/styles/global.css`.

**Status:** complete — awaiting promotion to `alpha`.
"@
  }
  @{
    title  = "[M13] Mod-loader scaffold and JSON data registry"
    labels = "type:feature,area:mods,channel:development,priority:p2"
    body   = @"
**Phase A — v0.2.0-dev**
Lays the groundwork for community mods before any content is committed in earnest.

**Scope**
- `mods/README.md`: mod contract documentation.
- `mods/example-mod/mod.json`: reference manifest.
- `mods/example-mod/data/goods.json`: two example goods with prefixed IDs.
- `src/engine/mods.ts`: `ModManifest`, `ModBundle`, `validateManifest()`, `validateGoods()`.

**Status:** complete — awaiting promotion to `alpha`.
"@
  }
  @{
    title  = "[M14] Save migrations framework"
    labels = "type:feature,area:save,channel:development,priority:p1"
    body   = @"
**Phase A — v0.2.1-dev**
Replaces the current `SAVE_KEY` bump shortcut with a registered list of `from → to` migration functions so old saves can be upgraded rather than discarded.

**Scope**
- A migrations registry in `src/engine/save.ts` (or a new `src/engine/migrations.ts`).
- Each migration is a pure function `(oldState: unknown) => GameState`.
- The save loader chains applicable migrations in order before handing state to the store.
- Migrations are tested with a fixture of the previous save format.
- `CHANGELOG.md` entry under `### Internal` or `### Improvements`.

**Definition of done:** A save written at v0.1.0 loads cleanly at v0.2.x without data loss.
"@
  }
  @{
    title  = "[M15] First public alpha cut — v0.2.0-alpha"
    labels = "type:chore,channel:alpha,priority:p0,release-bump:minor"
    body   = @"
**Phase A gate — v0.2.0-alpha**
Promote `development` to `alpha`. This is the first build available to public alpha testers.

**Gate criteria**
- CI green on the promotion PR.
- All Phase A milestones (M10–M14) merged to `development`.
- No open P0 or P1 bugs.
- Design pillars defended in the PR description.
- Save migration verified: a v0.1.0 save loads cleanly.
- Pre-release published: web PWA zip + Windows Electron installer + Android debug APK.

**Audience:** Public alpha testers only. Communicate via release notes that saves may still migrate between alpha builds.
"@
  }
  @{
    title  = "[M16] Content pass: 36 → 60 goods across all 12 categories"
    labels = "type:content,area:economy,channel:development,priority:p2"
    body   = @"
**Phase B — v0.3.0-dev**
Fill every goods category to saturation so no category feels sparse on the first run.

**Scope**
- Add 24 new goods in `src/data/goods.ts` (migrating to JSON under M21 can come after).
- Each category (Foodstuffs, Raw Materials, Refined Goods, Technology, Medical, Luxury, Weapons, Energy, Biological, Contraband, Data, Cultural) should have 4–6 goods minimum.
- New goods must include: `id`, `name`, `category`, `basePriceCr`, `massKg`, `legal` tier, and at least one race import/export bias.
- No new code paths required — goods plug directly into the existing economy engine.
- Update `CHANGELOG.md` under `### Content`.

**Definition of done:** Every category has at least 4 goods. The market screen is visibly richer on first session.
"@
  }
  @{
    title  = "[M17] Content pass: 18 → 30 ship modules"
    labels = "type:content,channel:development,priority:p2"
    body   = @"
**Phase B — v0.3.0-dev**
Doubles the ship build variety so players have meaningful hardware decisions at every budget tier.

**Scope**
- Add 12 new modules in `src/data/modules.ts` spread across the 6 hardpoints (Hull, Cargo, Drive, Shield, Sensor, Utility).
- Maintain the existing upgrade tree pattern (Tier I / II / III per slot).
- Each module needs: `id`, `name`, `slot`, `tier`, stat deltas, `priceCr`, and a one-line flavour description.
- No new code paths — modules plug into `src/engine/game.ts:installModule`.
- Update `CHANGELOG.md` under `### Content`.

**Definition of done:** Each hardpoint has at least 5 module options. A min-max player can reason about trade-offs within a single slot.
"@
  }
  @{
    title  = "[M18] Content pass: 12 → 24 crew traits"
    labels = "type:content,area:crew,channel:development,priority:p3"
    body   = @"
**Phase B — v0.3.0-dev**
Doubles the trait pool so crew feel meaningfully differentiated and repeat hires are interesting.

**Scope**
- Add 12 new traits in `src/data/traits.ts`.
- Traits must follow the existing contract: `id`, `name`, `description`, and a modifier object that maps to crew stat adjustments.
- Cover a mix of positive, negative, and neutral (conditional) traits.
- At least 2 traits should interact with the energy-frequency system specifically.
- Update `CHANGELOG.md` under `### Content`.

**Definition of done:** A player hiring 4 crew members is unlikely to see a repeated trait combination across two campaigns.
"@
  }
  @{
    title  = "[M19] Content pass: 6 → 16 transit events"
    labels = "type:content,area:travel,channel:development,priority:p2"
    body   = @"
**Phase B — v0.3.0-dev**
10 new transit events so the Safe and Fast routes feel alive rather than repetitive after a few runs.

**Scope**
- Add 10 new events to the pool in `src/engine/events.ts`.
- Each event: a scenario description, 2–3 choice branches, a `d20 + skill vs DC` resolution, and outcome state delta.
- Cover variety: at least 2 diplomatic, 2 exploration, 2 hazard, 2 character/crew, 2 contraband/legal.
- At least 1 event should reference the active news headlines to feel emergent.
- Update `CHANGELOG.md` under `### Content`.

**Definition of done:** A player who does 10 Safe routes and 10 Fast routes sees no repeated event in the same session.
"@
  }
  @{
    title  = "[M20] Two new station kinds: Diplomatic Embassy and Reclamation Yard"
    labels = "type:feature,channel:development,priority:p3"
    body   = @"
**Phase B — v0.3.0-dev**
Two new station archetypes expand the strategic variety of each generated galaxy.

**Diplomatic Embassy**
- Specialises in Cultural goods; suppresses Weapons pricing.
- Offers a reputation-adjacent service placeholder (reputation proper arrives in Phase C).
- Biased toward Terran and Aelyn factions.

**Reclamation Yard**
- Specialises in Raw Materials and salvaged ship components.
- Offers discounted Tier-I module sales (20% below market).
- Biased toward Kresh and Voidkin factions.

**Scope**
- Add both kinds to the station-kind enum in `src/engine/galaxy.ts`.
- Wire market biases in `src/engine/economy.ts`.
- Add distinguishing UI label in the Helm screen station tooltip.
- Update `CHANGELOG.md` under `### Features`.

**Definition of done:** Both station kinds appear in generated galaxies, have correct market biases, and display distinct labels on the star map.
"@
  }
  @{
    title  = "[M21] Migrate authored data from src/data/*.ts to src/data/json/"
    labels = "type:chore,channel:development,priority:p3"
    body   = @"
**Phase B — v0.3.0-dev**
Moves all hand-authored content (goods, modules, traits, names, races) from TypeScript constant files to JSON files under `src/data/json/`. This makes the data modder-friendly and separates content from code.

**Scope**
- Create `src/data/json/goods.json`, `modules.json`, `traits.json`, `names.json`, `races.json`.
- Update importers in `src/data/` to load from JSON (Vite handles JSON imports natively).
- Validate JSON at build time with a lightweight schema check in `scripts/validate-data.mjs`.
- Confirm that the existing mod-loader in `src/engine/mods.ts` merges cleanly against the new JSON sources.
- No gameplay changes — this is a pure refactor.
- Update `CHANGELOG.md` under `### Internal`.

**Definition of done:** `npm run build` passes. All content loads from JSON. `mods/example-mod/data/goods.json` still merges correctly.
"@
  }
  @{
    title  = "[M22] Second public alpha cut — v0.3.0-alpha"
    labels = "type:chore,channel:alpha,priority:p0,release-bump:minor"
    body   = @"
**Phase B gate — v0.3.0-alpha**
Promote `development` to `alpha` after Phase B content density work is complete.

**Gate criteria**
- CI green on the promotion PR.
- All Phase B milestones (M16–M21) merged to `development`.
- Two consecutive playtest sessions with no P0 or P1 bugs reported.
- At least one explicit sign-off that "balance is interesting" from a playtest participant.
- Release notes drafted in `CHANGELOG.md` under a new versioned heading.
- Pre-release published: web PWA zip + Windows Electron installer + Android debug APK.

**Audience:** Public alpha testers. Saves from v0.2.x should migrate cleanly via the M14 framework.
"@
  }
)

$created = @()
foreach ($iss in $issues) {
  Write-Host "Creating: $($iss.title)"
  $url = gh issue create `
    --repo   $repo `
    --title  $iss.title `
    --label  $iss.labels `
    --body   $iss.body `
    --assignee $owner 2>&1

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Failed to create: $($iss.title)`n$url"
  } else {
    Write-Host "  -> $url"
    $created += $url
  }
}

Write-Host "`nAdding $($created.Count) issues to Project $proj..."
foreach ($url in $created) {
  gh project item-add $proj --owner $owner --url $url 2>&1 | Write-Host
}

Write-Host "Done."
