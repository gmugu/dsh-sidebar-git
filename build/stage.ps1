# Stage the built dsh-sidebar-git package into a DSH profile's local bundle
# directory (the deployment's own staging convention: pnpm cannot junction
# across drives, so a workspace on another drive cannot be linked directly).
# Run this after every successful build, then reload the page (client change) or
# restart dsh (host change).
#
#   powershell -File build/stage.ps1
#   powershell -File build/stage.ps1 -Profile default
#   powershell -File build/stage.ps1 -DshHome D:\dsh-home -Profile web
param(
  [string]$Profile = 'web',
  [string]$DshHome
)

$ErrorActionPreference = 'Stop'
$PackageName = 'dsh-sidebar-git'

if (-not $DshHome) {
  # $homeDir, not $home: PowerShell variable names are case-insensitive, so
  # `$home` would collide with the read-only automatic $HOME.
  $homeDir = if ($env:USERPROFILE) { $env:USERPROFILE } else { $HOME }
  $DshHome = Join-Path $homeDir '.dsh'
}
$profiles = Join-Path $DshHome 'profiles'
if (-not (Test-Path $profiles)) {
  throw "no DSH profiles under `"$profiles`" — pass -DshHome and/or -Profile"
}
$profileDir = Join-Path $profiles $Profile
if (-not (Test-Path $profileDir)) {
  $known = (Get-ChildItem $profiles -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) -join ', '
  throw "no profile `"$Profile`" under `"$profiles`" (found: $known)"
}

$staged = Join-Path $profileDir "local\$PackageName"
$link = Join-Path $profileDir "node_modules\$PackageName"
$pkg = Split-Path -Parent $PSScriptRoot

New-Item -ItemType Directory -Path $staged -Force | Out-Null
Copy-Item (Join-Path $pkg 'package.json'), (Join-Path $pkg 'cordis.patch.yml') $staged -Force
if (Test-Path "$staged\lib") { Remove-Item "$staged\lib" -Recurse -Force }
Copy-Item (Join-Path $pkg 'lib') "$staged\lib" -Recurse -Force
# Every shipped doc (the package carries both language versions and its licence).
foreach ($doc in 'README.md', 'README.zh.md', 'LICENSE') {
  $path = Join-Path $pkg $doc
  if (Test-Path $path) { Copy-Item $path $staged -Force }
}

$item = Get-Item $link -ErrorAction SilentlyContinue
if ($item -and $item.LinkType) {
  if ("$($item.Target)" -notlike "*local*$PackageName*") {
    $item.Delete()
    New-Item -ItemType Junction -Path $link -Target $staged | Out-Null
  }
}
elseif (-not $item) {
  New-Item -ItemType Junction -Path $link -Target $staged | Out-Null
}
Write-Host "staged → $staged"
Get-ChildItem $staged | ForEach-Object { "  $($_.Name)" }