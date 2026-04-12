$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$projectPath = Join-Path $PSScriptRoot "CyberNestLauncher.csproj"
$outputPath = Join-Path $projectRoot "artifacts\CyberNestLauncher\publish"

dotnet publish $projectPath `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true `
  -o $outputPath

Write-Host ""
Write-Host "Launcher elkeszult itt:"
Write-Host $outputPath
