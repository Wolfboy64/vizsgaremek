param(
    [string]$Configuration = "Release",
    [string]$Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectFile = Join-Path $repoRoot "CyberNest_Admin\CyberNest_Admin.csproj"
$publishDir = Join-Path $repoRoot "artifacts\publish\$Runtime"
$installerRoot = Join-Path $repoRoot "artifacts\installer"
$buildDir = Join-Path $installerRoot "build"
$payloadDir = Join-Path $buildDir "payload"
$payloadZip = Join-Path $payloadDir "app.zip"
$payloadIcon = Join-Path $payloadDir "app.ico"
$setupExe = Join-Path $installerRoot "CyberNest_Admin_Setup.exe"
$sedFile = Join-Path $buildDir "CyberNest_Admin_Setup.sed"
$iexpressPath = (Get-Command iexpress.exe).Source
$sourceIcon = Join-Path $repoRoot "CyberNest_Admin\ikonok\app.ico"

function Reset-Directory {
    param([string]$PathToReset)

    if (Test-Path -LiteralPath $PathToReset) {
        Remove-Item -LiteralPath $PathToReset -Recurse -Force
    }

    New-Item -ItemType Directory -Path $PathToReset -Force | Out-Null
}

Write-Host "1/4 Publish keszitese..."
dotnet publish $projectFile `
    -c $Configuration `
    -r $Runtime `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -o $publishDir

if ($LASTEXITCODE -ne 0) {
    throw "A dotnet publish hibaval leallt."
}

Write-Host "2/4 Telepito payload elokeszitese..."
Reset-Directory -PathToReset $buildDir
New-Item -ItemType Directory -Path $payloadDir -Force | Out-Null

$stagingAppDir = Join-Path $buildDir "app"
Reset-Directory -PathToReset $stagingAppDir

Copy-Item -Path (Join-Path $publishDir "*") -Destination $stagingAppDir -Recurse -Force -Exclude "*.pdb"
Compress-Archive -Path (Join-Path $stagingAppDir "*") -DestinationPath $payloadZip -CompressionLevel Optimal -Force
Copy-Item -LiteralPath (Join-Path $repoRoot "installer\install-app.ps1") -Destination (Join-Path $payloadDir "install-app.ps1") -Force
Copy-Item -LiteralPath (Join-Path $repoRoot "installer\uninstall-app.ps1") -Destination (Join-Path $payloadDir "uninstall-app.ps1") -Force
Copy-Item -LiteralPath $sourceIcon -Destination $payloadIcon -Force

$installCmd = @(
    "@echo off",
    "setlocal",
    "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""%~dp0install-app.ps1"" -PayloadZipPath ""%~dp0app.zip""",
    "exit /b %ERRORLEVEL%"
)
Set-Content -LiteralPath (Join-Path $payloadDir "install.cmd") -Value $installCmd -Encoding ASCII

Write-Host "3/4 IExpress konfiguracio generalasa..."
$sedContent = @"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=CyberNest Admin telepitese befejezodott.
TargetName=$setupExe
FriendlyName=CyberNest Admin Setup
AppLaunched=install.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=install.cmd
UserQuietInstCmd=install.cmd
SourceFiles=SourceFiles
[Strings]
FILE0=install.cmd
FILE1=install-app.ps1
FILE2=uninstall-app.ps1
FILE3=app.zip
FILE4=app.ico
[SourceFiles]
SourceFiles0=$payloadDir
[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
%FILE3%=
%FILE4%=
"@
Set-Content -LiteralPath $sedFile -Value $sedContent -Encoding ASCII

if (Test-Path -LiteralPath $setupExe) {
    Remove-Item -LiteralPath $setupExe -Force
}

Write-Host "4/4 Setup.exe generalasa..."
$beforeIexpressIds = @(Get-Process iexpress -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
& $iexpressPath /N $sedFile
$deadline = (Get-Date).AddMinutes(3)

do {
    $activeIexpress = Get-Process iexpress -ErrorAction SilentlyContinue |
        Where-Object { $beforeIexpressIds -notcontains $_.Id }

    if (Test-Path -LiteralPath $setupExe) {
        break
    }

    if (-not $activeIexpress) {
        Start-Sleep -Seconds 2
    }
    else {
        Wait-Process -Id ($activeIexpress | Select-Object -ExpandProperty Id) -Timeout 10 -ErrorAction SilentlyContinue
    }
}
while ((Get-Date) -lt $deadline -and -not (Test-Path -LiteralPath $setupExe))

if (-not (Test-Path -LiteralPath $setupExe)) {
    throw "Az IExpress nem hozta letre a telepitot: $setupExe"
}

Write-Host ""
Write-Host "Kesz: $setupExe"
