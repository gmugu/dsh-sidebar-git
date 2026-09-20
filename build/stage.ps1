# Stage the built dsh-sidebar-git package into the DSH web profile's local
# bundle directory (the deployment's own staging convention: pnpm cannot
# junction across drives, so a D:\-workspace path cannot be linked directly).
# Run this after every successful build, then reinstall via the plugin manager.
$ErrorActionPreference = 'Stop'
$staged = "C:\Users\admin\.dsh\profiles\web\local\dsh-sidebar-git"
$pkg = Split-Path -Parent $PSScriptRoot

New-Item -ItemType Directory -Path $staged -Force | Out-Null
Copy-Item (Join-Path $pkg 'package.json'), (Join-Path $pkg 'cordis.patch.yml') $staged -Force
if (Test-Path "$staged\lib") { Remove-Item "$staged\lib" -Recurse -Force }
Copy-Item (Join-Path $pkg 'lib') "$staged\lib" -Recurse -Force
# Every shipped doc (the package carries both language versions).
foreach ($doc in 'README.md', 'README.zh.md') {
  $path = Join-Path $pkg $doc
  if (Test-Path $path) { Copy-Item $path $staged -Force }
}

$link = "C:\Users\admin\.dsh\profiles\web\node_modules\dsh-sidebar-git"
$item = Get-Item $link -ErrorAction SilentlyContinue
if ($item -and $item.LinkType) {
  $target = "$staged"
  if ("$($item.Target)" -notlike "*local*dsh-sidebar-git*") {
    $item.Delete()
    New-Item -ItemType Junction -Path $link -Target $target | Out-Null
  }
}
elseif (-not $item) {
  New-Item -ItemType Junction -Path $link -Target $staged | Out-Null
}
Write-Host "staged → $staged"
Get-ChildItem $staged | ForEach-Object { "  $($_.Name)" }
