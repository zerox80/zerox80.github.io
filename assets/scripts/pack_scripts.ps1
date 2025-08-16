# Windows Privacy - Pack Scripts
# Erstellt ein ZIP mit allen Skripten und REG-Dateien inklusive README.

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$Destination,
  [switch]$HashZip
)

$ErrorActionPreference = 'Stop'
try {
  $root = Split-Path -Parent $PSCommandPath
  if (-not $Destination) { $Destination = Join-Path $root 'scripts.zip' }

  # Dateien sammeln (ps1, cmd, reg, txt)
  $files = Get-ChildItem -Path (Join-Path $root '*') -File -Include *.ps1, *.cmd, *.reg, README.txt
  if (-not $files) { throw 'Keine Dateien zum Packen gefunden.' }

  if (Test-Path $Destination) {
    if ($PSCmdlet.ShouldProcess($Destination, 'Bestehende ZIP löschen')) {
      Remove-Item -Path $Destination -Force
    }
  }

  if ($PSCmdlet.ShouldProcess($Destination, 'ZIP erzeugen')) {
    Compress-Archive -Path $files.FullName -DestinationPath $Destination -Force
  }

  Write-Host "ZIP erstellt: $Destination" -ForegroundColor Green

  if ($HashZip -and (Test-Path $Destination)) {
    $hash = Get-FileHash -Path $Destination -Algorithm SHA256
    $hashFile = "$Destination.sha256"
    "SHA256 ($([System.IO.Path]::GetFileName($Destination))) = $($hash.Hash)" | Set-Content -Path $hashFile -Encoding UTF8
    Write-Host "Hash geschrieben: $hashFile" -ForegroundColor Green
  }
}
catch {
  Write-Error $_.Exception.Message
}

