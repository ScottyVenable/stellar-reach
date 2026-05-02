#Requires -Version 7
<#
.SYNOPSIS
  Fills every GitHub Project field for all 13 Galactic Trader milestone issues.
  Run once from the repo root. Safe to re-run (idempotent updates).
#>

$projectId = "PVT_kwHOATql1s4BWbwi"   # Galactic Trader Master Roadmap (project 8)

# Field node IDs
$F_Status   = "PVTSSF_lAHOATql1s4BWbwizhRwF4g"
$F_Priority = "PVTSSF_lAHOATql1s4BWbwizhRwHzE"
$F_Size     = "PVTSSF_lAHOATql1s4BWbwizhRwHzI"
$F_Estimate = "PVTF_lAHOATql1s4BWbwizhRwHzM"
$F_Start    = "PVTF_lAHOATql1s4BWbwizhRwHzQ"
$F_Target   = "PVTF_lAHOATql1s4BWbwizhRwHzU"

# Status option IDs
$S_Backlog = "f75ad846"
$S_Done    = "98236657"

# Priority option IDs
$P0 = "79628723"; $P1 = "0a877460"; $P2 = "da944a9c"; $P3 = "c5f66cfd"

# Size option IDs
$XS = "6c6483d2"; $S = "f784b110"; $M = "7515a9f1"; $L = "817d0097"

# Item definitions — ordered M10 through M22
# Fields: itemId, status, priority, size, estimate (hrs), startDate, targetDate
$items = @(
  # Phase A — foundations (complete)
  @{ id="PVTI_lAHOATql1s4BWbwizgroSlo"; status=$S_Done;    pri=$P1; sz=$L;  est=13; start="2026-04-15"; target="2026-05-02"; label="M10" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSls"; status=$S_Done;    pri=$P1; sz=$M;  est=5;  start="2026-04-15"; target="2026-05-02"; label="M11" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSl4"; status=$S_Done;    pri=$P2; sz=$S;  est=3;  start="2026-04-20"; target="2026-05-02"; label="M12" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSmA"; status=$S_Done;    pri=$P2; sz=$S;  est=3;  start="2026-04-20"; target="2026-05-02"; label="M13" }
  # Phase A — pending
  @{ id="PVTI_lAHOATql1s4BWbwizgroSmQ"; status=$S_Backlog; pri=$P1; sz=$M;  est=5;  start="2026-05-05"; target="2026-05-16"; label="M14" }
  # Alpha gate
  @{ id="PVTI_lAHOATql1s4BWbwizgroSmU"; status=$S_Backlog; pri=$P0; sz=$XS; est=2;  start="2026-05-17"; target="2026-05-20"; label="M15" }
  # Phase B — content
  @{ id="PVTI_lAHOATql1s4BWbwizgroSmk"; status=$S_Backlog; pri=$P2; sz=$L;  est=8;  start="2026-05-21"; target="2026-06-10"; label="M16" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSms"; status=$S_Backlog; pri=$P2; sz=$M;  est=5;  start="2026-05-21"; target="2026-06-05"; label="M17" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSmw"; status=$S_Backlog; pri=$P3; sz=$S;  est=3;  start="2026-06-01"; target="2026-06-15"; label="M18" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSm4"; status=$S_Backlog; pri=$P2; sz=$M;  est=5;  start="2026-06-01"; target="2026-06-20"; label="M19" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSnA"; status=$S_Backlog; pri=$P3; sz=$M;  est=5;  start="2026-06-10"; target="2026-06-30"; label="M20" }
  @{ id="PVTI_lAHOATql1s4BWbwizgroSnQ"; status=$S_Backlog; pri=$P3; sz=$M;  est=5;  start="2026-06-15"; target="2026-07-01"; label="M21" }
  # Second alpha gate
  @{ id="PVTI_lAHOATql1s4BWbwizgroSng"; status=$S_Backlog; pri=$P0; sz=$XS; est=2;  start="2026-07-02"; target="2026-07-08"; label="M22" }
)

function Set-Field {
  param($itemId, $fieldId, [string]$type, $value)
  $ghArgs = @(
    "project", "item-edit",
    "--id", $itemId,
    "--project-id", $projectId,
    "--field-id", $fieldId
  )
  switch ($type) {
    "select"  { $ghArgs += "--single-select-option-id", $value }
    "number"  { $ghArgs += "--number", "$value" }
    "date"    { $ghArgs += "--date", $value }
  }
  $out = & gh @ghArgs 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "  FAILED [$fieldId]: $out"
  }
}

foreach ($item in $items) {
  Write-Host "$($item.label) — $($item.id)"
  Set-Field $item.id $F_Status   "select" $item.status
  Set-Field $item.id $F_Priority "select" $item.pri
  Set-Field $item.id $F_Size     "select" $item.sz
  Set-Field $item.id $F_Estimate "number" $item.est
  Set-Field $item.id $F_Start    "date"   $item.start
  Set-Field $item.id $F_Target   "date"   $item.target
  Write-Host "  -> Status=$($item.status -eq $S_Done ? 'Done' : 'Backlog') Pri=$($item.pri) Size=$($item.sz) Est=$($item.est)h $($item.start) -> $($item.target)"
}

Write-Host "`nAll fields updated."
