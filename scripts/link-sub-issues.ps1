#Requires -Version 7
<#
.SYNOPSIS
  Links all sub-issues to their milestone parents via the GitHub sub-issues API.
  All sub-issues already exist: #52-#64 (M10-M13) and #17-#51 (M14-M22).
  Requires GitHub sub-issues beta to be enabled:
    GitHub.com -> Settings -> Feature preview -> Sub-issues -> Enable
  Uses -F (capital F) to send integers and X-GitHub-Api-Version: 2026-03-10.
  Safe to re-run — already-linked items return a 422 which is logged and skipped.
#>

$repo  = "ScottyVenable/stellar-reach"
$owner = "ScottyVenable"

function Connect-SubIssue {
  param([int]$parentNum, [int]$childNum)
  $result = gh api -X POST "/repos/$repo/issues/$parentNum/sub_issues" `
    -H "X-GitHub-Api-Version: 2026-03-10" `
    -F "sub_issue_id=$childNum" 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "  Linked #$childNum -> #$parentNum"
  } elseif ($result -match "already") {
    Write-Host "  Already linked #$childNum -> #$parentNum (skipped)"
  } else {
    Write-Warning "  Link FAILED #$childNum -> #$parentNum : $result"
  }
}

# ─── Link all sub-issues to correct parents ───────────────────────────────────
# Sub-issues already created:
#   M10 (#4)  -> #52-#56  (5 items)
#   M11 (#5)  -> #57-#59  (3 items)
#   M12 (#6)  -> #60-#62  (3 items)
#   M13 (#7)  -> #63-#64  (2 items)
#   M14 (#8)  -> #17-#20  (4 items)
#   M15 (#9)  -> #21-#25  (5 items)
#   M16 (#10) -> #26-#30  (5 items)
#   M17 (#11) -> #31-#34  (4 items)
#   M18 (#12) -> #35-#36  (2 items)
#   M19 (#13) -> #37-#39  (3 items)
#   M20 (#14) -> #40-#41  (2 items)
#   M21 (#15) -> #42-#46  (5 items)
#   M22 (#16) -> #47-#51  (5 items)

Write-Host "`n=== Linking sub-issues to parents ==="

# M10 (#4) -> #52-#56
foreach ($n in @(52, 53, 54, 55, 56)) { Connect-SubIssue 4 $n }

# M11 (#5) -> #57-#59
foreach ($n in @(57, 58, 59)) { Connect-SubIssue 5 $n }

# M12 (#6) -> #60-#62
foreach ($n in @(60, 61, 62)) { Connect-SubIssue 6 $n }

# M13 (#7) -> #63-#64
foreach ($n in @(63, 64)) { Connect-SubIssue 7 $n }

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
