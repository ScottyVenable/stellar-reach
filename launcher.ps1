param(
  [ValidateSet('Menu', 'Run', 'Build', 'Sync')]
  [string]$Action = 'Menu',

  [string]$DriveRoot = 'G:\My Drive\Entertainment\Game Development\Galactic Trader'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = $PSScriptRoot
$PrivateDocsRoot = Join-Path (Split-Path -Parent $RepoRoot) 'internal-dev-docs'
$DriveRepoRoot = Join-Path $DriveRoot 'galactic-trader'
$DrivePrivateDocsRoot = Join-Path $DriveRoot 'internal-dev-docs'

function Assert-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

function Invoke-GameRun {
  Write-Host 'Starting the development server...' -ForegroundColor Cyan
  Push-Location $RepoRoot
  try {
    Assert-Command 'npm'
    & npm run dev
    if ($LASTEXITCODE -ne 0) {
      throw "npm run dev failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

function Invoke-GameBuild {
  Write-Host 'Building the game...' -ForegroundColor Cyan
  Push-Location $RepoRoot
  try {
    Assert-Command 'npm'
    & npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "npm run build failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

function Invoke-RobocopyMirror {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination,
    [string[]]$ExcludeDirectories = @()
  )

  New-Item -ItemType Directory -Force -Path $Destination | Out-Null

  $arguments = @(
    $Source,
    $Destination,
    '/MIR',
    '/R:2',
    '/W:1',
    '/NFL',
    '/NDL',
    '/NP'
  )

  foreach ($directory in $ExcludeDirectories) {
    $arguments += '/XD'
    $arguments += $directory
  }

  & robocopy @arguments | Out-Host
  $exitCode = $LASTEXITCODE

  if ($exitCode -ge 8) {
    throw "Robocopy failed while syncing '$Source' to '$Destination' (exit code $exitCode)."
  }
}

function Invoke-GameSync {
  Write-Host 'Building first, then syncing to Google Drive...' -ForegroundColor Cyan
  Invoke-GameBuild

  if (-not (Test-Path $DriveRoot)) {
    throw "Google Drive path not found: $DriveRoot"
  }

  Write-Host "Syncing repo to $DriveRepoRoot" -ForegroundColor Cyan
  Invoke-RobocopyMirror -Source $RepoRoot -Destination $DriveRepoRoot -ExcludeDirectories @('.git', 'node_modules')

  if (Test-Path $PrivateDocsRoot) {
    Write-Host "Syncing private docs to $DrivePrivateDocsRoot" -ForegroundColor Cyan
    Invoke-RobocopyMirror -Source $PrivateDocsRoot -Destination $DrivePrivateDocsRoot
  }

  Write-Host 'Sync complete.' -ForegroundColor Green
}

function Show-Menu {
  Write-Host ''
  Write-Host 'Galactic Trader Launcher' -ForegroundColor Yellow
  Write-Host '1. Run the game (npm run dev)'
  Write-Host '2. Build the game (npm run build)'
  Write-Host '3. Sync to Google Drive'
  Write-Host '4. Exit'

  $choice = Read-Host 'Choose an action'

  switch ($choice) {
    '1' { Invoke-GameRun }
    '2' { Invoke-GameBuild }
    '3' { Invoke-GameSync }
    default { Write-Host 'Nothing to do.' -ForegroundColor DarkGray }
  }
}

Set-Location $RepoRoot

switch ($Action) {
  'Run' { Invoke-GameRun }
  'Build' { Invoke-GameBuild }
  'Sync' { Invoke-GameSync }
  default { Show-Menu }
}