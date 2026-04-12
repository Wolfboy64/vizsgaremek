# CyberNest Admin telepito

Az egykattintasos Windows telepitot ez a szkript allitja elo:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1
```

Az eredmeny ide kerul:

`artifacts\installer\CyberNest_Admin_Setup.exe`

Telepites utan az alkalmazas ide kerul:

`%LOCALAPPDATA%\Programs\CyberNest Admin`

Az alkalmazas indulaskor a `http://localhost:5050/api/` backendhez csatlakozik, ezert a backend szervernek is futnia kell.
