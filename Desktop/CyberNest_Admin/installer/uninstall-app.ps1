$ErrorActionPreference = "Stop"

$appName = "CyberNest Admin"
$processName = "CyberNest_Admin"
$installDir = Join-Path $env:LOCALAPPDATA "Programs\$appName"
$startMenuDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\$appName"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "$appName.lnk"

if (Get-Process -Name $processName -ErrorAction SilentlyContinue) {
    throw "A $appName jelenleg fut. Zarja be, majd probalja ujra az eltavolitast."
}

if (Test-Path -LiteralPath $desktopShortcut) {
    Remove-Item -LiteralPath $desktopShortcut -Force
}

if (Test-Path -LiteralPath $startMenuDir) {
    Remove-Item -LiteralPath $startMenuDir -Recurse -Force
}

if (-not (Test-Path -LiteralPath $installDir)) {
    Write-Host "$appName mar nincs telepitve."
    exit 0
}

$cleanupScript = Join-Path $env:TEMP ("CyberNest_Admin_Remove_" + [guid]::NewGuid().ToString("N") + ".cmd")
$cleanupLines = @(
    "@echo off",
    "ping 127.0.0.1 -n 3 >nul",
    "rmdir /s /q ""$installDir""",
    "del ""%~f0"""
)

Set-Content -LiteralPath $cleanupScript -Value $cleanupLines -Encoding ASCII
Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$cleanupScript`"" -WindowStyle Hidden

Write-Host "$appName eltavolitasa elindult."
