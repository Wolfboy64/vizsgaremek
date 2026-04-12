param(
    [string]$PayloadZipPath = (Join-Path $PSScriptRoot "app.zip"),
    [switch]$LaunchAfterInstall = $true
)

$ErrorActionPreference = "Stop"

$appName = "CyberNest Admin"
$exeName = "CyberNest_Admin.exe"
$processName = "CyberNest_Admin"
$installDir = Join-Path $env:LOCALAPPDATA "Programs\$appName"
$startMenuDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\$appName"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "$appName.lnk"
$startMenuShortcut = Join-Path $startMenuDir "$appName.lnk"
$uninstallShortcut = Join-Path $startMenuDir "$appName Eltavolitasa.lnk"
$uninstallScriptDestination = Join-Path $installDir "uninstall-app.ps1"
$scriptIconPath = Join-Path $PSScriptRoot "app.ico"

if (-not (Test-Path -LiteralPath $PayloadZipPath)) {
    throw "A telepito csomag nem talalhato: $PayloadZipPath"
}

if (Get-Process -Name $processName -ErrorAction SilentlyContinue) {
    throw "A $appName jelenleg fut. Zarja be, majd inditsa ujra a telepitot."
}

$tempExtractDir = Join-Path ([System.IO.Path]::GetTempPath()) ("CyberNest_Admin_Install_" + [guid]::NewGuid().ToString("N"))

try {
    New-Item -ItemType Directory -Path $tempExtractDir -Force | Out-Null
    Expand-Archive -LiteralPath $PayloadZipPath -DestinationPath $tempExtractDir -Force

    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    Get-ChildItem -LiteralPath $installDir -Force | Remove-Item -Recurse -Force

    # App fájlok másolása
    Copy-Item -Path (Join-Path $tempExtractDir "*") -Destination $installDir -Recurse -Force

    # Uninstall script másolása
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "uninstall-app.ps1") -Destination $uninstallScriptDestination -Force

    # Ikon másolása (FONTOS: app.ico legyen az installer mellett!)
    New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null

    $shell = New-Object -ComObject WScript.Shell

    $exePath = Join-Path $installDir $exeName
    $installedIconPath = Join-Path $installDir "app.ico"

    if (Test-Path -LiteralPath $scriptIconPath) {
        Copy-Item -LiteralPath $scriptIconPath -Destination $installedIconPath -Force
    }
    elseif (Test-Path -LiteralPath (Join-Path $installDir "ikonok\app.ico")) {
        Copy-Item -LiteralPath (Join-Path $installDir "ikonok\app.ico") -Destination $installedIconPath -Force
    }

    $iconPath = if (Test-Path -LiteralPath $installedIconPath) { $installedIconPath } else { $exePath }

    # Desktop shortcut
    $appShortcut = $shell.CreateShortcut($desktopShortcut)
    $appShortcut.TargetPath = $exePath
    $appShortcut.WorkingDirectory = $installDir
    $appShortcut.IconLocation = "$iconPath,0"
    $appShortcut.Save()

    # Start Menu shortcut
    $startShortcut = $shell.CreateShortcut($startMenuShortcut)
    $startShortcut.TargetPath = $exePath
    $startShortcut.WorkingDirectory = $installDir
    $startShortcut.IconLocation = "$iconPath,0"
    $startShortcut.Save()

    # Uninstall shortcut
    $removeShortcut = $shell.CreateShortcut($uninstallShortcut)
    $removeShortcut.TargetPath = (Get-Command powershell.exe).Source
    $removeShortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$uninstallScriptDestination`""
    $removeShortcut.WorkingDirectory = $installDir
    $removeShortcut.IconLocation = "$iconPath,0"
    $removeShortcut.Save()

    Write-Host ""
    Write-Host "$appName sikeresen telepitve ide:"
    Write-Host $installDir
    Write-Host ""
    Write-Host "Fontos: az alkalmazas a http://localhost:5050/api/ backendhez csatlakozik."
    Write-Host "A hasznalathoz a backend szervernek is futnia kell."

    if ($LaunchAfterInstall) {
        Start-Process -FilePath $exePath -WorkingDirectory $installDir
    }
}
finally {
    if (Test-Path -LiteralPath $tempExtractDir) {
        Remove-Item -LiteralPath $tempExtractDir -Recurse -Force
    }
}
