<#
  Windows Privacy - Optionale Bloatware entfernen
  - Standard: Vorschau. Mit -Apply wirklich entfernen.
  - Optional: -CurrentUserOnly (statt AllUsers), -ProvisionedOnly (nur Provisioned Pakete), -List (nur anzeigen)
  - Unterstützt -WhatIf und -Confirm
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [switch]$Apply,
  [switch]$CurrentUserOnly,
  [switch]$ProvisionedOnly,
  [switch]$List
)

$needsAdmin = $Apply -and (-not $CurrentUserOnly -or $ProvisionedOnly)
if ($needsAdmin) {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Für -Apply in AllUsers/Provisioned-Szenarien sind Administratorrechte erforderlich. Bitte als Administrator ausführen."
    exit 1
  }
}

$apps = @(
  'Microsoft.3DBuilder',
  'Microsoft.SkypeApp',
  'Microsoft.BingWeather',
  'Microsoft.GetHelp',
  'Microsoft.Getstarted',
  'Microsoft.Microsoft3DViewer',
  'Microsoft.MicrosoftOfficeHub',
  'Microsoft.MicrosoftSolitaireCollection',
  'Microsoft.People',
  'Microsoft.Print3D',
  'Microsoft.Xbox.TCUI',
  'Microsoft.XboxApp',
  'Microsoft.XboxGameOverlay',
  'Microsoft.XboxGamingOverlay',
  'Microsoft.XboxSpeechToTextOverlay',
  'Microsoft.YourPhone',
  'Microsoft.ZuneMusic',
  'Microsoft.ZuneVideo',
  # Windows 11 – zusätzliche optionale Apps
  'Clipchamp.Clipchamp',
  'MicrosoftTeams',
  'Microsoft.BingNews',
  'Microsoft.WindowsMaps',
  'Microsoft.WindowsFeedbackHub',
  # Achtung: Entfernen bricht Widgets/Copilot
  'MicrosoftWindows.Client.WebExperience'
)

if ($List) {
  Write-Host 'Kandidaten:' -ForegroundColor Cyan
  $apps | ForEach-Object { Write-Host " - $_" }
  return
}

foreach ($p in $apps) {
  if ($ProvisionedOnly) {
    $provPkgs = Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -eq $p }
    foreach ($prov in $provPkgs) {
      if ($Apply) {
        try {
          if ($PSCmdlet.ShouldProcess($prov.DisplayName, 'Remove-AppxProvisionedPackage')) {
            Remove-AppxProvisionedPackage -Online -PackageName $prov.PackageName -ErrorAction Stop | Out-Null
            Write-Host "Provisioned entfernt: $($prov.DisplayName)" -ForegroundColor Yellow
          }
        } catch {
          Write-Warning "Fehler bei Provisioned-Entfernung: $($prov.DisplayName) -> $($_.Exception.Message)"
        }
      } else {
        Write-Host "Würde Provisioned entfernen: $($prov.DisplayName) ($($prov.PackageName))" -ForegroundColor Cyan
      }
    }
  } else {
    $pkgs = if ($CurrentUserOnly) { Get-AppxPackage -Name $p -ErrorAction SilentlyContinue } else { Get-AppxPackage -Name $p -AllUsers -ErrorAction SilentlyContinue }
    if ($pkgs) {
      foreach ($pkg in $pkgs) {
        if ($Apply) {
          try {
            if ($PSCmdlet.ShouldProcess($pkg.Name, 'Remove-AppxPackage')) {
              if ($CurrentUserOnly) {
                Remove-AppxPackage -Package $pkg.PackageFullName -ErrorAction Stop
              } else {
                Remove-AppxPackage -Package $pkg.PackageFullName -AllUsers -ErrorAction Stop
              }
              Write-Host "Entfernt: $($pkg.Name)" -ForegroundColor Yellow
            }
          } catch {
            Write-Warning "Fehler beim Entfernen: $($pkg.Name) -> $($_.Exception.Message)"
          }
        } else {
          Write-Host "Würde entfernen: $($pkg.Name) ($($pkg.PackageFullName))" -ForegroundColor Cyan
        }
      }
    }
  }
}

if (-not $Apply) { Write-Host 'Vorschau beendet. Starte erneut mit -Apply, um zu entfernen.' -ForegroundColor Green }
