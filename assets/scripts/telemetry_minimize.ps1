# Windows Privacy - Telemetry Minimieren (Admin erforderlich)
# Hinweis: Auf eigenes Risiko. Optional: -CreateRestorePoint legt vorab einen Systemwiederherstellungspunkt an.

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [switch]$CreateRestorePoint,
  [switch]$DisableWER
)

# Admin-Check
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Bitte als Administrator ausführen (Rechtsklick -> 'Als Administrator ausführen')."
  exit 1
}

if ($CreateRestorePoint) {
  try {
    if ($PSCmdlet.ShouldProcess('System', 'Wiederherstellungspunkt erstellen')) {
      Checkpoint-Computer -Description 'WindowsPrivacy Telemetry Minimize' -RestorePointType 'MODIFY_SETTINGS' -ErrorAction Stop
      Write-Host "Wiederherstellungspunkt erstellt." -ForegroundColor Green
    }
  } catch {
    Write-Warning "Konnte Wiederherstellungspunkt nicht erstellen: $($_.Exception.Message)"
  }
}

function New-RegistryKeyIfMissing { param([string]$Path) if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null } }

# Wichtige Schlüssel anlegen
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent"
New-RegistryKeyIfMissing "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo"
New-RegistryKeyIfMissing "HKCU:\Software\Microsoft\Windows\CurrentVersion\Privacy"
New-RegistryKeyIfMissing "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting"
New-RegistryKeyIfMissing "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot"

# Telemetrie/Erlebnisse minimieren
if ($PSCmdlet.ShouldProcess('HKLM: DataCollection', 'AllowTelemetry=0')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Type DWord -Value 0 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'DisableTailoredExperiences=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableTailoredExperiences" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKCU: AdvertisingInfo', 'Enabled=0')) {
  Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Type DWord -Value 0 -Force
}
if ($PSCmdlet.ShouldProcess('HKCU: Privacy', 'TailoredExperiencesWithDiagnosticDataEnabled=0')) {
  Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Privacy" -Name "TailoredExperiencesWithDiagnosticDataEnabled" -Type DWord -Value 0 -Force
}

# Suche/Cortana/Bing
if ($PSCmdlet.ShouldProcess('HKCU: Search', 'BingSearchEnabled=0')) {
  Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "BingSearchEnabled" -Type DWord -Value 0 -Force
}
if ($PSCmdlet.ShouldProcess('HKCU: Search', 'CortanaConsent=0')) {
  Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "CortanaConsent" -Type DWord -Value 0 -Force
}

# Windows 11 – zusätzliche Policies
if ($PSCmdlet.ShouldProcess('HKLM: DeliveryOptimization', 'DODownloadMode=0')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" -Name "DODownloadMode" -Type DWord -Value 0 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'DisableWindowsSpotlightFeatures=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsSpotlightFeatures" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'DisableWindowsConsumerFeatures=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsConsumerFeatures" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'DisableThirdPartySuggestions=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableThirdPartySuggestions" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: Explorer', 'DisableSearchBoxSuggestions=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer" -Name "DisableSearchBoxSuggestions" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: DataCollection', 'DoNotShowFeedbackNotifications=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "DoNotShowFeedbackNotifications" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: System', 'Disable Activity History Upload')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableActivityFeed" -Type DWord -Value 0 -Force
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "PublishUserActivities" -Type DWord -Value 0 -Force
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "UploadUserActivities" -Type DWord -Value 0 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: Windows Error Reporting', 'Disabled=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting" -Name "Disabled" -Type DWord -Value 1 -Force
}
if ($PSCmdlet.ShouldProcess('HKLM: WindowsCopilot', 'TurnOffWindowsCopilot=1')) {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot" -Name "TurnOffWindowsCopilot" -Type DWord -Value 1 -Force
}

# Diagnoseaufgaben (geplante Tasks) deaktivieren
$tasks = @(
  "\Microsoft\Windows\Application Experience\Microsoft Compatibility Appraiser",
  "\Microsoft\Windows\Application Experience\ProgramDataUpdater",
  "\Microsoft\Windows\Autochk\Proxy",
  "\Microsoft\Windows\Customer Experience Improvement Program\Consolidator",
  "\Microsoft\Windows\Customer Experience Improvement Program\UsbCeip",
  "\Microsoft\Windows\DiskDiagnostic\Microsoft-Windows-DiskDiagnosticDataCollector",
  "\Microsoft\Windows\Feedback\Siuf\DmClient",
  "\Microsoft\Windows\Feedback\Siuf\DmClientOnScenarioDownload",
  "\Microsoft\Windows\Windows Error Reporting\QueueReporting",
  "\Microsoft\Windows\Application Experience\StartupAppTask"
)
foreach ($t in $tasks) {
  try {
    if ($PSCmdlet.ShouldProcess($t, 'Disable Scheduled Task')) {
      Start-Process -FilePath schtasks.exe -ArgumentList "/Change /TN `"$t`" /Disable" -WindowStyle Hidden -Wait
    }
  } catch {}
}

# Telemetrie-bezogene Dienste
$svcs = @('DiagTrack','dmwappushservice')
if ($DisableWER) { $svcs += 'WerSvc' }
foreach ($s in $svcs) {
  try {
    $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
    if ($svc) {
      if ($PSCmdlet.ShouldProcess($s, 'Stop and Disable Service')) {
        Stop-Service -Name $s -ErrorAction SilentlyContinue
        Set-Service -Name $s -StartupType Disabled -ErrorAction SilentlyContinue
      }
    }
  } catch {}
}

Write-Host "Fertig. Ein Neustart wird empfohlen." -ForegroundColor Green
