#Requires -Version 7
<#
.SYNOPSIS
  Updates each milestone issue body to include a tasklist referencing its sub-issues.
  This is the fallback approach since the sub-issues API requires a feature flag
  that is not enabled on this account. GitHub tasklist checkboxes achieve the same
  visual result in the issue UI and project board progress tracking.
#>

$repo = "ScottyVenable/stellar-reach"

# parent issue number -> child issue numbers + body prefix
$tasks = [ordered]@{
  4  = @{
    prefix = "**Phase A — v0.2.0-dev** | Three-tier branch model, Sol agent, and GitHub plumbing.`n`nAll sub-tasks completed. Awaiting promotion to ``alpha``."
    kids   = @(52, 53, 54, 55, 56)
  }
  5  = @{
    prefix = "**Phase A — v0.2.0-dev** | Versioning and changelog automation.`n`nAll sub-tasks completed. Awaiting promotion to ``alpha``."
    kids   = @(57, 58, 59)
  }
  6  = @{
    prefix = "**Phase A — v0.2.0-dev** | In-game changelog viewer.`n`nAll sub-tasks completed. Awaiting promotion to ``alpha``."
    kids   = @(60, 61, 62)
  }
  7  = @{
    prefix = "**Phase A — v0.2.0-dev** | Mod-loader scaffold and JSON data registry.`n`nAll sub-tasks completed. Awaiting promotion to ``alpha``."
    kids   = @(63, 64)
  }
  8  = @{
    prefix = "**Phase A — v0.2.1-dev** | Save migrations framework.`n`nReplaces the ``SAVE_KEY`` bump shortcut with a registered migration chain."
    kids   = @(17, 18, 19, 20)
  }
  9  = @{
    prefix = "**Phase A gate — v0.2.0-alpha** | First public alpha cut.`n`nAll Phase A milestones must be merged to ``development`` before opening the promotion PR."
    kids   = @(21, 22, 23, 24, 25)
  }
  10 = @{
    prefix = "**Phase B — v0.3.0-dev** | Content pass: 36 -> 60 goods across all 12 categories."
    kids   = @(26, 27, 28, 29, 30)
  }
  11 = @{
    prefix = "**Phase B — v0.3.0-dev** | Content pass: 18 -> 30 ship modules."
    kids   = @(31, 32, 33, 34)
  }
  12 = @{
    prefix = "**Phase B — v0.3.0-dev** | Content pass: 12 -> 24 crew traits."
    kids   = @(35, 36)
  }
  13 = @{
    prefix = "**Phase B — v0.3.0-dev** | Content pass: 6 -> 16 transit events."
    kids   = @(37, 38, 39)
  }
  14 = @{
    prefix = "**Phase B — v0.3.0-dev** | Two new station kinds: Diplomatic Embassy and Reclamation Yard."
    kids   = @(40, 41)
  }
  15 = @{
    prefix = "**Phase B — v0.3.0-dev** | Migrate authored data from src/data/*.ts to src/data/json/."
    kids   = @(42, 43, 44, 45, 46)
  }
  16 = @{
    prefix = "**Phase B gate — v0.3.0-alpha** | Second public alpha cut.`n`nAll Phase B milestones must be merged to ``development`` before opening the promotion PR."
    kids   = @(47, 48, 49, 50, 51)
  }
}

foreach ($parentNum in $tasks.Keys) {
  $entry = $tasks[$parentNum]
  $kids  = $entry.kids

  # Build tasklist
  $checklist = $kids | ForEach-Object { "- [ ] #$_" }
  $newBody   = "$($entry.prefix)`n`n**Sub-tasks:**`n$($checklist -join "`n")"

  Write-Host "Updating issue #$parentNum ($($kids.Count) sub-tasks)..."
  $out = gh issue edit $parentNum --repo $repo --body $newBody 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "  FAILED: $out"
  } else {
    Write-Host "  OK"
  }
}

Write-Host "`nAll parent issues updated with sub-task checklists."
