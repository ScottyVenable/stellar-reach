#Requires -Version 7
<#
.SYNOPSIS
  Part 1: Creates missing M10-M13 sub-issues.
  Part 2: Links ALL sub-issues (#17-#51 + new M10-M13 ones) to correct parents.
  Uses -F (capital F) to send integers to the GitHub API.
  Run once from the repo root.
#>

$repo  = "ScottyVenable/stellar-reach"
$owner = "ScottyVenable"

function New-SubIssue {
  param([string]$title, [string]$labels, [string]$body)
  $url = gh issue create --repo $repo --title $title --label $labels --body $body --assignee $owner 2>&1
  if ($LASTEXITCODE -ne 0) { Write-Warning "Create FAILED: $url"; return $null }
  $num = [int](($url -split "/")[-1])
  Write-Host "  Created #$num — $title"
  gh project item-add 8 --owner $owner --url $url 2>&1 | Out-Null
  return $num
}

function Connect-SubIssue {
  param([int]$parentNum, [int]$childNum)
  $result = gh api -X POST "/repos/$repo/issues/$parentNum/sub_issues" `
    -H "X-GitHub-Api-Version: 2026-03-10" `
    -F "sub_issue_id=$childNum" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "  Link FAILED #$childNum -> #$parentNum : $result"
  } else {
    Write-Host "  Linked #$childNum -> #$parentNum"
  }
}

# ─── PART 1: Create missing M10-M13 sub-issues ────────────────────────────────
Write-Host "`n=== Creating M10-M13 sub-issues (previously missed) ==="

$m10_1 = New-SubIssue "[M10.1] Establish three-tier branch model and protection rules" `
  "type:ci,area:ci,channel:development,priority:p1" `
  "Create ``development``, ``alpha``, and ``main`` branches. Set ``development`` as the default. Apply branch protection (require PR, no force-push) on all three. Document the model in ``docs/BRANCHING.md``."

$m10_2 = New-SubIssue "[M10.2] Author Sol agent persona files" `
  "type:ci,area:ci,channel:development,priority:p1" `
  "Write ``.github/copilot-instructions.md`` (full operating manual) and ``.github/agents/Sol.agent.md`` (VS Code agent picker entry). Verify the YAML frontmatter is valid and the description field contains adequate trigger phrases."

$m10_3 = New-SubIssue "[M10.3] Add issue templates, PR template, and CODEOWNERS" `
  "type:ci,area:ci,channel:development,priority:p2" `
  "Create ``.github/ISSUE_TEMPLATE/`` with bug, feature, balance, content, and modding templates. Add ``.github/PULL_REQUEST_TEMPLATE.md`` and ``.github/CODEOWNERS`` pinning all paths to ``@ScottyVenable``."

$m10_4 = New-SubIssue "[M10.4] Add label catalog and sync workflow" `
  "type:ci,area:ci,channel:development,priority:p2" `
  "Define ``.github/labels.yml`` with the full label taxonomy (type:*, priority:*, area:*, channel:*, release-bump:*). Add ``.github/workflows/labels-sync.yml`` using ``EndBug/label-sync@v2`` triggered on push and ``workflow_dispatch``."

$m10_5 = New-SubIssue "[M10.5] Add CI, version-bump, auto-project, and release workflows" `
  "type:ci,area:ci,channel:development,priority:p1" `
  "Write ``ci.yml`` (typecheck + build on every PR to ``development``), ``version-bump.yml`` (bumps package.json and promotes changelog on merge), ``auto-project.yml`` (adds issues/PRs to Project 8 on open), and extend ``release.yml`` to trigger on ``alpha`` and ``main`` branches."

$m11_1 = New-SubIssue "[M11.1] Write version.mjs computation script" `
  "type:ci,area:ci,channel:development,priority:p1" `
  "Create ``scripts/version.mjs``. Reads ``package.json`` for MAJOR.MINOR.PATCH, appends channel suffix (``-dev`` or ``-alpha``) from the current git branch, and appends BUILD = ``git rev-list --count HEAD``. Exposes ``--json`` flag for machine consumption."

$m11_2 = New-SubIssue "[M11.2] Write bump-and-promote.mjs logic" `
  "type:ci,area:ci,channel:development,priority:p1" `
  "Create ``.github/scripts/bump-and-promote.mjs``. On invocation: increments the patch version in ``package.json``, rewrites the ``## [Unreleased]`` block in ``CHANGELOG.md`` to a dated, versioned heading. Commit the result with ``[skip ci]``."

$m11_3 = New-SubIssue "[M11.3] Wire version-bump.yml workflow and add npm convenience scripts" `
  "type:ci,area:ci,channel:development,priority:p2" `
  "Create ``.github/workflows/version-bump.yml`` that runs ``bump-and-promote.mjs`` on PR merge to ``development``. Add ``npm run version:print`` and ``npm run version:json`` scripts to ``package.json``."

$m12_1 = New-SubIssue "[M12.1] Write parse-changelog.mjs prebuild script" `
  "type:ci,area:ci,channel:development,priority:p2" `
  "Create ``scripts/parse-changelog.mjs``. Parses ``CHANGELOG.md`` at build time into ``src/data/changelog.generated.json``. Runs as ``npm run prebuild`` before every build and typecheck."

$m12_2 = New-SubIssue "[M12.2] Create changelog.ts engine module" `
  "type:feature,area:ui,channel:development,priority:p2" `
  "Create ``src/engine/changelog.ts``. Typed import of the generated JSON. Exports ``releasesByChannel(channel)`` returning the filtered, sorted release list for a given channel (stable / alpha / development)."

$m12_3 = New-SubIssue "[M12.3] Build ChangelogModal component and wire to title screen" `
  "type:feature,area:ui,channel:development,priority:p2" `
  "Create ``src/ui/components/ChangelogModal.tsx``. Channel-tab modal (Stable / Alpha / Development). Wire the version chip on ``TitleScreen.tsx`` to open it on tap. Add supporting styles to ``global.css``."

$m13_1 = New-SubIssue "[M13.1] Define mod manifest schema and example mod" `
  "type:mod,area:mods,channel:development,priority:p2" `
  "Create ``mods/README.md`` with the mod contract. Create ``mods/example-mod/mod.json`` and ``mods/example-mod/data/goods.json`` with two goods using prefixed IDs."

$m13_2 = New-SubIssue "[M13.2] Implement mods.ts validation engine" `
  "type:mod,area:mods,channel:development,priority:p2" `
  "Create ``src/engine/mods.ts``. Export ``ModManifest``, ``ModBundle`` types and ``validateManifest()``, ``validateGoods()`` pure validation functions."

# ─── PART 2: Link all sub-issues to correct parents ──────────────────────────
Write-Host "`n=== Linking sub-issues to parents ==="

# M10 (#4) -> new sub-issues
foreach ($n in @($m10_1, $m10_2, $m10_3, $m10_4, $m10_5)) {
  if ($n) { Connect-SubIssue 4 $n }
}

# M11 (#5) -> new sub-issues
foreach ($n in @($m11_1, $m11_2, $m11_3)) {
  if ($n) { Connect-SubIssue 5 $n }
}

# M12 (#6) -> new sub-issues
foreach ($n in @($m12_1, $m12_2, $m12_3)) {
  if ($n) { Connect-SubIssue 6 $n }
}

# M13 (#7) -> new sub-issues
foreach ($n in @($m13_1, $m13_2)) {
  if ($n) { Connect-SubIssue 7 $n }
}

# M14 (#8) -> #17-#20
foreach ($n in @(17, 18, 19, 20)) { Connect-SubIssue 8 $n }

# M15 (#9) -> #21-#25
foreach ($n in @(21, 22, 23, 24, 25)) { Connect-SubIssue 9 $n }

# M16 (#10) -> #26-#30
foreach ($n in @(26, 27, 28, 29, 30)) { Connect-SubIssue 10 $n }

# M17 (#11) -> #31-#34
foreach ($n in @(31, 32, 33, 34)) { Connect-SubIssue 11 $n }

# M18 (#12) -> #35-#36
foreach ($n in @(35, 36)) { Connect-SubIssue 12 $n }

# M19 (#13) -> #37-#39
foreach ($n in @(37, 38, 39)) { Connect-SubIssue 13 $n }

# M20 (#14) -> #40-#41
foreach ($n in @(40, 41)) { Connect-SubIssue 14 $n }

# M21 (#15) -> #42-#46
foreach ($n in @(42, 43, 44, 45, 46)) { Connect-SubIssue 15 $n }

# M22 (#16) -> #47-#51
foreach ($n in @(47, 48, 49, 50, 51)) { Connect-SubIssue 16 $n }

Write-Host "`n=== All done. ==="
