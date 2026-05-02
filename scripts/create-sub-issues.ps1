#Requires -Version 7
<#
.SYNOPSIS
  Creates sub-issues for all Galactic Trader milestone issues and links them
  to their parent via the GitHub sub-issues REST API.
  Run once from the repo root.
#>

$repo  = "ScottyVenable/galactic-trader"
$owner = "ScottyVenable"

# Sub-issue definitions keyed by parent issue number
# Each entry: @{ title; labels; body }
$subIssues = [ordered]@{

  # M10 — Three-tier branch model, Sol agent, GitHub plumbing (Done)
  4 = @(
    @{ title = "[M10.1] Establish three-tier branch model and protection rules"
       labels = "type:ci,area:ci,channel:development,priority:p1"
       body   = "Create `development`, `alpha`, and `main` branches. Set `development` as the default. Apply branch protection (require PR, no force-push) on all three. Document the model in `docs/BRANCHING.md`." }
    @{ title = "[M10.2] Author Sol agent persona files"
       labels = "type:ci,area:ci,channel:development,priority:p1"
       body   = "Write `.github/copilot-instructions.md` (full operating manual) and `.github/agents/Sol.agent.md` (VS Code agent picker entry). Verify the YAML frontmatter is valid and the description field contains adequate trigger phrases." }
    @{ title = "[M10.3] Add issue templates, PR template, and CODEOWNERS"
       labels = "type:ci,area:ci,channel:development,priority:p2"
       body   = "Create `.github/ISSUE_TEMPLATE/` with bug, feature, balance, content, and modding templates. Add `.github/PULL_REQUEST_TEMPLATE.md` and `.github/CODEOWNERS` pinning all paths to `@ScottyVenable`." }
    @{ title = "[M10.4] Add label catalog and sync workflow"
       labels = "type:ci,area:ci,channel:development,priority:p2"
       body   = "Define `.github/labels.yml` with the full label taxonomy (type:*, priority:*, area:*, channel:*, release-bump:*). Add `.github/workflows/labels-sync.yml` using `EndBug/label-sync@v2` triggered on push and `workflow_dispatch`." }
    @{ title = "[M10.5] Add CI, version-bump, auto-project, and release workflows"
       labels = "type:ci,area:ci,channel:development,priority:p1"
       body   = "Write `ci.yml` (typecheck + build on every PR to `development`), `version-bump.yml` (bumps package.json and promotes changelog on merge), `auto-project.yml` (adds issues/PRs to Project 8 on open), and extend `release.yml` to trigger on `alpha` and `main` branches." }
  )

  # M11 — Versioning and changelog automation (Done)
  5 = @(
    @{ title = "[M11.1] Write version.mjs computation script"
       labels = "type:ci,area:ci,channel:development,priority:p1"
       body   = "Create `scripts/version.mjs`. Reads `package.json` for MAJOR.MINOR.PATCH, appends channel suffix (`-dev` or `-alpha`) from the current git branch, and appends BUILD = `git rev-list --count HEAD`. Exposes `--json` flag for machine consumption." }
    @{ title = "[M11.2] Write bump-and-promote.mjs logic"
       labels = "type:ci,area:ci,channel:development,priority:p1"
       body   = "Create `.github/scripts/bump-and-promote.mjs`. On invocation: increments the patch version in `package.json`, rewrites the `## [Unreleased]` block in `CHANGELOG.md` to a dated, versioned heading. Commit the result with `[skip ci]`." }
    @{ title = "[M11.3] Wire version-bump.yml workflow and add npm convenience scripts"
       labels = "type:ci,area:ci,channel:development,priority:p2"
       body   = "Create `.github/workflows/version-bump.yml` that runs `bump-and-promote.mjs` on PR merge to `development`. Add `npm run version:print` and `npm run version:json` scripts to `package.json`." }
  )

  # M12 — In-game changelog viewer (Done)
  6 = @(
    @{ title = "[M12.1] Write parse-changelog.mjs prebuild script"
       labels = "type:ci,area:ci,channel:development,priority:p2"
       body   = "Create `scripts/parse-changelog.mjs`. Parses `CHANGELOG.md` at build time into `src/data/changelog.generated.json` (array of release objects with version, date, channel, title, description, and category arrays). Runs as `npm run prebuild` before every build and typecheck." }
    @{ title = "[M12.2] Create changelog.ts engine module"
       labels = "type:feature,area:ui,channel:development,priority:p2"
       body   = "Create `src/engine/changelog.ts`. Typed import of the generated JSON. Exports `releasesByChannel(channel)` returning the filtered, sorted release list for a given channel (stable / alpha / development)." }
    @{ title = "[M12.3] Build ChangelogModal component and wire to title screen"
       labels = "type:feature,area:ui,channel:development,priority:p2"
       body   = "Create `src/ui/components/ChangelogModal.tsx`. Channel-tab modal (Stable / Alpha / Development), renders release blocks with version chip, date, title, description, and categorised entry lists. Wire the version chip on `TitleScreen.tsx` to open it on tap. Add supporting styles to `global.css`." }
  )

  # M13 — Mod-loader scaffold (Done)
  7 = @(
    @{ title = "[M13.1] Define mod manifest schema and example mod"
       labels = "type:mod,area:mods,channel:development,priority:p2"
       body   = "Create `mods/README.md` with the mod contract. Create `mods/example-mod/mod.json` (reference manifest with id, name, version, author, and data paths) and `mods/example-mod/data/goods.json` (two goods with prefixed IDs)." }
    @{ title = "[M13.2] Implement mods.ts validation engine"
       labels = "type:mod,area:mods,channel:development,priority:p2"
       body   = "Create `src/engine/mods.ts`. Export `ModManifest`, `ModBundle` types. Export `validateManifest()` and `validateGoods()` pure validation functions. No side-effects; the loader calls these before merging mod data into the game state." }
  )

  # M14 — Save migrations framework
  8 = @(
    @{ title = "[M14.1] Design migration registry interface"
       labels = "type:feature,area:save,channel:development,priority:p1"
       body   = "Define the `Migration` interface in `src/engine/migrations.ts`: `{ fromVersion: string; toVersion: string; migrate: (old: unknown) => GameState }`. Export a `MIGRATIONS` array. The runner will iterate this array in order to chain applicable migrations." }
    @{ title = "[M14.2] Implement chained migration runner in save.ts"
       labels = "type:feature,area:save,channel:development,priority:p1"
       body   = "Update `src/engine/save.ts`. After loading raw JSON from `localStorage`, pass it through the migration chain before handing to the store. A save with an unrecognised version should migrate to the nearest known version, not discard data." }
    @{ title = "[M14.3] Write migration: v0.1.0 -> v0.2.x"
       labels = "type:feature,area:save,channel:development,priority:p1"
       body   = "Implement the first concrete migration function. Map fields that changed between `v0.1.0-dev.0` and the v0.2 save shape. Add a fixture file under `src/engine/__fixtures__/save-v0.1.0.json` for manual verification." }
    @{ title = "[M14.4] Remove SAVE_KEY bump shortcut"
       labels = "type:chore,area:save,channel:development,priority:p2"
       body   = "Delete the existing `SAVE_KEY` constant trick that silently discards saves on schema change. Confirm that all existing tests (or a new smoke test) still pass after removal. Update `CHANGELOG.md` under `### Improvements`." }
  )

  # M15 — First public alpha gate
  9 = @(
    @{ title = "[M15.1] Verify all P0 and P1 bugs resolved before promotion"
       labels = "type:chore,channel:alpha,priority:p0"
       body   = "Audit the issue tracker for any open bugs labelled `priority:p0` or `priority:p1`. All must be closed or explicitly deferred with a written rationale before the promotion PR is opened." }
    @{ title = "[M15.2] Run full playtest and sign off balance"
       labels = "type:chore,channel:alpha,priority:p1"
       body   = "Complete at least one full playtest session covering: new game, 10+ trade runs, 5+ transit events, module upgrades, courier hire, and crew management. Sign off that 'balance is interesting' or open P2 issues for any friction found." }
    @{ title = "[M15.3] Verify v0.1.0 save migrates cleanly to v0.2.x"
       labels = "type:chore,area:save,channel:alpha,priority:p1"
       body   = "Load the `src/engine/__fixtures__/save-v0.1.0.json` fixture through the migration runner. Confirm all fields map correctly and the game reaches the market screen without errors." }
    @{ title = "[M15.4] Draft v0.2.0-alpha release notes in CHANGELOG.md"
       labels = "type:docs,channel:alpha,priority:p1"
       body   = "Write the `## [0.2.0-alpha]` block in `CHANGELOG.md` before the promotion PR. Include a player-facing description, headline features, and known limitations. The version-bump workflow will promote `[Unreleased]` — ensure the block is clear before merge." }
    @{ title = "[M15.5] Open and merge development -> alpha promotion PR"
       labels = "type:chore,channel:alpha,priority:p0"
       body   = "Open a PR from `development` to `alpha`. Title: `chore: promote v0.2.0 to alpha`. Confirm CI is green. Confirm all sub-issues in M15 are closed. Request review from `@ScottyVenable` before merging." }
  )

  # M16 — 36 -> 60 goods
  10 = @(
    @{ title = "[M16.1] Fill Foodstuffs, Raw Materials, and Refined Goods categories"
       labels = "type:content,area:economy,channel:development,priority:p2"
       body   = "Add goods to bring each of these three categories to 5+ entries. Each good needs id, name, category, basePriceCr, massKg, legal tier, and at least one race bias. Target: ~6 new goods total across the three categories." }
    @{ title = "[M16.2] Fill Technology, Medical, and Energy categories"
       labels = "type:content,area:economy,channel:development,priority:p2"
       body   = "Add 2+ new goods per category. Technology should include at least one high-value data-adjacent item. Medical should include at least one restricted-tier item. Energy should include at least one bulk commodity. Target: ~6 new goods." }
    @{ title = "[M16.3] Fill Luxury, Cultural, and Data categories"
       labels = "type:content,area:economy,channel:development,priority:p2"
       body   = "These categories interact most with race biases. Each new good should have at least two races with strong import or export preferences. Target: ~6 new goods. Luxury should include at least one item with a Legal but high-value profile." }
    @{ title = "[M16.4] Fill Weapons, Biological, and Contraband categories"
       labels = "type:content,area:economy,channel:development,priority:p2"
       body   = "Contraband and Weapons are intentionally sparse for balance reasons, but Biological needs more variety. Add 1-2 Weapons, 1-2 Contraband, and 3+ Biological goods. Each Contraband entry must have a clear legal-tier annotation. Target: ~6 new goods." }
    @{ title = "[M16.5] Balance review: check that no category dominates trade profits"
       labels = "type:balance,area:economy,channel:development,priority:p2"
       body   = "After all new goods are added, run 5 trade routes across 3 different seeds. Verify no single category accounts for more than 40% of optimal-route profit. Adjust basePriceCr or race biases as needed. Document findings in the PR description." }
  )

  # M17 — 18 -> 30 ship modules
  11 = @(
    @{ title = "[M17.1] Add Tier II and III options to Hull and Cargo hardpoints"
       labels = "type:content,channel:development,priority:p2"
       body   = "Each hardpoint currently has 3 tiers. Add 1-2 new modules per hardpoint to Hull and Cargo. Hull additions should offer trade-off profiles (lighter hull with passive regen vs heavy armour). Cargo additions should include a refrigerated hold (bonus for Foodstuffs/Medical) and a contraband shielding unit." }
    @{ title = "[M17.2] Add Tier II and III options to Drive and Shield hardpoints"
       labels = "type:content,channel:development,priority:p2"
       body   = "Drive: add at least one module with a stealth/evasion trade-off (fast but high event DC). Shield: add at least one reactive shield that improves on Fast routes specifically. Target: 2 new modules per hardpoint." }
    @{ title = "[M17.3] Add Tier II and III options to Sensor and Utility hardpoints"
       labels = "type:content,channel:development,priority:p2"
       body   = "Sensor: add a long-range scanner (reveals station prices before docking) and a trade-forecasting array (surfaces M16 buy opportunity hints at greater range). Utility: add a crew comfort module (reduces stress gain) and a self-repair drone (passive hull tick). Target: 2 new per hardpoint." }
    @{ title = "[M17.4] Write flavour descriptions for all new modules"
       labels = "type:content,channel:development,priority:p3"
       body   = "Every module entry requires a one-line flavour description. Descriptions should be in-universe, third-person, and consistent with the game's tone — precise and lightly literary, no hype. Review all existing descriptions for consistency while adding new ones." }
  )

  # M18 — 12 -> 24 crew traits
  12 = @(
    @{ title = "[M18.1] Add 6 new positive and conditional traits"
       labels = "type:content,area:crew,channel:development,priority:p3"
       body   = "Add 6 traits with positive or conditional modifiers. At least 2 should interact with the energy-frequency system (e.g. bonus when Radiant, penalty when Depleted). At least 1 should interact with a specific role (e.g. Navigator gets +2 on Safe routes). Follow existing trait data contract in `src/data/traits.ts`." }
    @{ title = "[M18.2] Add 6 new negative and mixed traits"
       labels = "type:content,area:crew,channel:development,priority:p3"
       body   = "Add 6 traits with negative or mixed modifiers. At least 2 should create interesting roster trade-offs rather than being purely bad (e.g. high skill but rapid stress accumulation). Avoid traits that are never worth hiring around — every negative trait should have a context where it's tolerable." }
  )

  # M19 — 6 -> 16 transit events
  13 = @(
    @{ title = "[M19.1] Add 4 new hazard and environmental events"
       labels = "type:content,area:travel,channel:development,priority:p2"
       body   = "Write 4 new events covering environmental hazards: asteroid field navigation, solar flare warning, debris field salvage, and gravitational anomaly. Each needs 2-3 choice branches with `d20 + skill vs DC` resolution and a state-delta outcome. Vary the primary skill tested (pilot, engineer, navigator)." }
    @{ title = "[M19.2] Add 3 new diplomatic and faction events"
       labels = "type:content,area:travel,channel:development,priority:p2"
       body   = "Write 3 events involving other ships or factions: a patrol intercept, a faction envoy requesting transport, and a black market rendezvous. At least 1 should reference the player's cargo manifest (contraband check). At least 1 should have a different outcome based on the active news headlines." }
    @{ title = "[M19.3] Add 3 new crew and character events"
       labels = "type:content,area:travel,channel:development,priority:p2"
       body   = "Write 3 events driven by crew state: a crew conflict during a long haul, a crew member's personal crisis, and a morale-boosting discovery. Outcomes should affect crew stress or trait expression. These events should only trigger when crew count >= 2." }
  )

  # M20 — Two new station kinds
  14 = @(
    @{ title = "[M20.1] Implement Diplomatic Embassy station kind"
       labels = "type:feature,channel:development,priority:p3"
       body   = "Add `DiplomaticEmbassy` to the station-kind enum in `src/engine/galaxy.ts`. In `src/engine/economy.ts`: Cultural goods priced 20% above base, Weapons suppressed 20% below base. Biased toward Terran and Aelyn factions in galaxy generation. Add a distinct label (`Embassy`) in the Helm screen station tooltip." }
    @{ title = "[M20.2] Implement Reclamation Yard station kind"
       labels = "type:feature,channel:development,priority:p3"
       body   = "Add `ReclamationYard` to the station-kind enum. In economy: Raw Materials priced 15% above base. In module shop: all Tier-I modules discounted 20%. Biased toward Kresh and Voidkin factions. Add a distinct label (`Salvage Yard`) in the Helm screen tooltip. Ensure the discount is applied at point-of-purchase in `game.ts:installModule`, not in the data." }
  )

  # M21 — Migrate data to JSON
  15 = @(
    @{ title = "[M21.1] Extract goods.ts to src/data/json/goods.json"
       labels = "type:chore,area:economy,channel:development,priority:p3"
       body   = "Convert the `GOODS` constant array in `src/data/goods.ts` to `src/data/json/goods.json`. Update the importer to use a direct JSON import (Vite handles this natively). Confirm `npm run typecheck` and `npm run build` both pass." }
    @{ title = "[M21.2] Extract modules.ts, traits.ts, and races.ts to JSON"
       labels = "type:chore,channel:development,priority:p3"
       body   = "Convert `MODULES`, `TRAITS`, and `RACES` constant arrays to their respective JSON files under `src/data/json/`. Update importers. No behavioural changes. Bundle size should decrease slightly due to reduced TS overhead." }
    @{ title = "[M21.3] Extract names.ts to JSON and validate encoding"
       labels = "type:chore,channel:development,priority:p3"
       body   = "Convert the name pool arrays in `src/data/names.ts` to `src/data/json/names.json`. Confirm that Unicode characters (Aelyn and Voidkin name syllables) round-trip correctly through the JSON serialiser and the seeded RNG picker." }
    @{ title = "[M21.4] Add build-time JSON data validator"
       labels = "type:chore,area:ci,channel:development,priority:p3"
       body   = "Create `scripts/validate-data.mjs`. Runs as part of `npm run prebuild`. Validates that each JSON data file conforms to its expected shape (required fields present, types correct, IDs unique, prefixes match for mod goods). Fails the build with a clear error message on violation." }
    @{ title = "[M21.5] Verify mod-loader merges cleanly against JSON sources"
       labels = "type:chore,area:mods,channel:development,priority:p3"
       body   = "After all data is in JSON, confirm that `src/engine/mods.ts:validateGoods()` and the merge logic still work correctly against the new JSON-sourced base data. Run the example mod through a manual load and verify the two example goods appear in the market." }
  )

  # M22 — Second public alpha gate
  16 = @(
    @{ title = "[M22.1] Verify all P0 and P1 bugs resolved before Phase B promotion"
       labels = "type:chore,channel:alpha,priority:p0"
       body   = "Audit the issue tracker for any open bugs labelled `priority:p0` or `priority:p1`. All must be closed or explicitly deferred with a written rationale. Check that no P2 bugs introduced in Phase B content passes are actually P1 in disguise." }
    @{ title = "[M22.2] Run two consecutive playtest cycles and collect sign-off"
       labels = "type:chore,channel:alpha,priority:p1"
       body   = "Complete two full playtest sessions (different seeds) covering all Phase B content: new goods, new modules, new traits, new events, new station kinds. Collect at least one explicit written sign-off that 'balance is interesting' before proceeding." }
    @{ title = "[M22.3] Verify v0.2.x saves migrate cleanly to v0.3.x"
       labels = "type:chore,area:save,channel:alpha,priority:p1"
       body   = "Test that saves written at v0.2.0-alpha load correctly in the v0.3 build. If the M21 JSON migration changed the internal data shape, ensure the migration runner handles any affected save fields. Add a v0.2.x fixture if one doesn't exist." }
    @{ title = "[M22.4] Draft v0.3.0-alpha release notes in CHANGELOG.md"
       labels = "type:docs,channel:alpha,priority:p1"
       body   = "Write the `## [0.3.0-alpha]` block before the promotion PR. Highlight the content density improvements: goods count, module count, trait count, event count, new station kinds. Include any known limitations or deferred work." }
    @{ title = "[M22.5] Open and merge development -> alpha promotion PR for v0.3.0"
       labels = "type:chore,channel:alpha,priority:p0"
       body   = "Open a PR from `development` to `alpha`. Title: `chore: promote v0.3.0 to alpha`. Confirm CI is green. Confirm all M22 sub-issues are closed. Request review from `@ScottyVenable` before merging." }
  )
}

$allCreated = @{}

foreach ($parentNum in $subIssues.Keys) {
  Write-Host "`n=== Parent #$parentNum ==="
  foreach ($sub in $subIssues[$parentNum]) {
    Write-Host "  Creating: $($sub.title)"
    $url = gh issue create `
      --repo   $repo `
      --title  $sub.title `
      --label  $sub.labels `
      --body   $sub.body `
      --assignee $owner 2>&1

    if ($LASTEXITCODE -ne 0) {
      Write-Warning "  FAILED: $url"
      continue
    }

    $childNum = ($url -split "/")[-1]
    Write-Host "  -> #$childNum $url"

    # Link to parent via sub-issues API
    $linkResult = gh api -X POST "/repos/$repo/issues/$parentNum/sub_issues" `
      -f "sub_issue_id=$childNum" 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "  Link FAILED: $linkResult"
    } else {
      Write-Host "  Linked #$childNum -> #$parentNum"
    }

    # Add the new sub-issue to Project 8 as well
    gh project item-add 8 --owner $owner --url $url 2>&1 | Out-Null

    $allCreated[$childNum] = $parentNum
  }
}

Write-Host "`n=== Done. Created $($allCreated.Count) sub-issues. ==="
