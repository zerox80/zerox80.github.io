Windows Privacy – Scripts
==========================

Inhalt
- telemetry_minimize.ps1: Minimiert Telemetrie/Erlebnis-Einstellungen, deaktiviert ausgewählte Tasks/Dienste.
- telemetry_revert.ps1: Macht die Änderungen weitgehend rückgängig (Tasks aktivieren, Dienste wieder auf "Manual", Policy-Registrywerte entfernen).
- remove_bloat.ps1: Entfernt optionale vorinstallierte Apps (mit Vorschau, optional AllUsers/Provisioned).
- privacy_defaults.reg: Empfehlung von Registry-Defaults (Telemetrie minimal, Empfehlungen/Ads aus, Bing/Cortana aus).
- revert_defaults.reg: Setzt obige REG-Defaults zurück (löscht gesetzte Werte).
 - edge_hardening.reg: Härtet Microsoft Edge via Richtlinien (Telemetry/Personalisierung aus, Sidebar/FRE deaktiviert).
 - edge_revert.reg: Setzt die Edge‑Richtlinien zurück.

Wichtige Hinweise
- Risiken: Änderungen am System erfolgen auf eigenes Risiko. Lies den Code vor Ausführung und mache ein Backup.
- Administratorrechte: Einige Aktionen erfordern Admin (z. B. Dienste/Tasks, Provisioned Packages, REG-Import).
- Wiederherstellungspunkt: telemetry_minimize.ps1 unterstützt optional -CreateRestorePoint.
- Transparenz: Prüfe Integrität per Hash (SHA256) der Dateien vor Ausführung.
- Optional: telemetry_minimize.ps1 mit -DisableWER deaktiviert Windows Error Reporting (WerSvc).
- Achtung: Entfernen von "MicrosoftWindows.Client.WebExperience" deaktiviert Widgets/Copilot.

Einfach starten (.cmd-Wrapper)
- Für jedes PowerShell-Skript gibt es einen passenden .cmd-Wrapper (double‑click‑freundlich):
  - telemetry_minimize.cmd, telemetry_revert.cmd, remove_bloat.cmd, pack_scripts.cmd
- Vorteile:
  - Startet PowerShell mit -ExecutionPolicy Bypass (um Signatur-/MOTW-Probleme zu vermeiden)
  - Hebt sich bei Bedarf automatisch auf Admin an (z. B. Remove Bloat mit -Apply für alle Benutzer/Provisioned)
  - Entblockt die .ps1-Dateien lokal (Unblock-File)

Hash-Prüfung (Beispiele)
- PowerShell:  Get-FileHash .\assets\scripts\telemetry_minimize.ps1 -Algorithm SHA256
- PowerShell:  Get-FileHash .\assets\scripts\remove_bloat.ps1 -Algorithm SHA256
- PowerShell:  Get-FileHash .\assets\scripts\privacy_defaults.reg -Algorithm SHA256
 - PowerShell:  Get-FileHash .\assets\scripts\edge_hardening.reg -Algorithm SHA256

Ausführung – Beispiele
- Einfach (Doppelklick) über Wrapper:
  .\assets\scripts\telemetry_minimize.cmd
  .\assets\scripts\telemetry_revert.cmd
  .\assets\scripts\remove_bloat.cmd
  .\assets\scripts\pack_scripts.cmd
- Telemetrie minimieren (mit Bestätigung/WhatIf-Unterstützung):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\telemetry_minimize.ps1 -CreateRestorePoint -WhatIf
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\telemetry_minimize.ps1 -CreateRestorePoint
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\telemetry_minimize.ps1 -DisableWER

- Telemetrie-Revert:
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\telemetry_revert.ps1

- Bloatware Vorschau / Entfernen (nur aktueller Benutzer):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\remove_bloat.ps1
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\remove_bloat.ps1 -List
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\remove_bloat.ps1 -Apply -CurrentUserOnly

- Bloatware für alle Benutzer / Provisioned Packages (Admin nötig):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\remove_bloat.ps1 -Apply
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\remove_bloat.ps1 -Apply -ProvisionedOnly

- Skriptpaket erzeugen (ZIP, optional Hash-Datei):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\pack_scripts.ps1
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\pack_scripts.ps1 -HashZip

- REG-Import / Revert:
  reg import .\assets\scripts\privacy_defaults.reg
  reg import .\assets\scripts\revert_defaults.reg
  reg import .\assets\scripts\edge_hardening.reg
  reg import .\assets\scripts\edge_revert.reg

Lizenz & Haftung
- Bereitgestellt "as-is", ohne Gewähr. Prüfe die Kompatibilität mit deiner Windows-Version (getestet unter Windows 10/11).
