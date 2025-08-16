# Windows Privacy - Telemetry Revert (Admin erforderlich)
# Setzt Änderungen aus telemetry_minimize.ps1 weitgehend zurück.
# - Entfernt gesetzte Policy-Registrywerte (zurück zu Windows-Default)
# - Aktiviert zuvor deaktivierte Diagnose-Tasks
# - Setzt zugehörige Dienste auf 'Manual' und startet sie optional

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [switch]$StartServices
)

# Admin-Check
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Bitte als Administrator ausführen (Rechtsklick -> 'Als Administrator ausführen')."
  exit 1
}

# Registry-Werte entfernen (zurück zu Default-Verhalten)
try {
  if ($PSCmdlet.ShouldProcess('HKLM: DataCollection', 'Remove AllowTelemetry')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'Remove DisableTailoredExperiences')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableTailoredExperiences" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKCU: AdvertisingInfo', 'Remove Enabled')) {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKCU: Privacy', 'Remove TailoredExperiencesWithDiagnosticDataEnabled')) {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Privacy" -Name "TailoredExperiencesWithDiagnosticDataEnabled" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKCU: Search', 'Remove BingSearchEnabled')) {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "BingSearchEnabled" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKCU: Search', 'Remove CortanaConsent')) {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "CortanaConsent" -ErrorAction SilentlyContinue
  }

  # Windows 11 – zusätzliche Policies rückgängig machen
  if ($PSCmdlet.ShouldProcess('HKLM: DeliveryOptimization', 'Remove DODownloadMode')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" -Name "DODownloadMode" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: CloudContent', 'Remove Spotlight/Consumer/ThirdParty suggestions')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsSpotlightFeatures" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsConsumerFeatures" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableThirdPartySuggestions" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: Explorer', 'Remove DisableSearchBoxSuggestions')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer" -Name "DisableSearchBoxSuggestions" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: DataCollection', 'Remove DoNotShowFeedbackNotifications')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "DoNotShowFeedbackNotifications" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: System', 'Remove Activity History policy values')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableActivityFeed" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "PublishUserActivities" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "UploadUserActivities" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: Windows Error Reporting', 'Remove Disabled')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting" -Name "Disabled" -ErrorAction SilentlyContinue
  }
  if ($PSCmdlet.ShouldProcess('HKLM: WindowsCopilot', 'Remove TurnOffWindowsCopilot')) {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot" -Name "TurnOffWindowsCopilot" -ErrorAction SilentlyContinue
  }
} catch {}

# Diagnoseaufgaben wieder aktivieren
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
    if ($PSCmdlet.ShouldProcess($t, 'Enable Scheduled Task')) {
      Start-Process -FilePath schtasks.exe -ArgumentList "/Change /TN `"$t`" /Enable" -WindowStyle Hidden -Wait
    }
  } catch {}
}

# Dienste wieder auf Manual setzen und optional starten
$svcs = @('DiagTrack','dmwappushservice','WerSvc')
foreach ($s in $svcs) {
  try {
    $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
    if ($svc) {
      if ($PSCmdlet.ShouldProcess($s, 'Set StartupType Manual')) {
        Set-Service -Name $s -StartupType Manual -ErrorAction SilentlyContinue
      }
      if ($StartServices) {
        try {
          if ($PSCmdlet.ShouldProcess($s, 'Start Service')) { Start-Service -Name $s -ErrorAction SilentlyContinue }
        } catch {}
      }
    }
  } catch {}
}

Write-Host "Revert abgeschlossen. Ein Neustart wird empfohlen." -ForegroundColor Green
