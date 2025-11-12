<#
start-all.ps1

Launches backend and frontend dev servers each in a new PowerShell window.

Usage (from project root):
  .\start-all.ps1

This script will:
- open a new PowerShell window for the backend, dot-source `backend\set-env.ps1`, then run `npm run dev`.
- open a new PowerShell window for the frontend, dot-source `frontend\set-env.ps1`, then run `npm run serve`.

Notes:
- Make sure you've run `npm install` in both `backend` and `frontend` before using this.
- The new windows are started with -NoExit so you can see logs and stop them manually.
#>

try {
  $root = Split-Path -Parent $MyInvocation.MyCommand.Definition
}
catch {
  # fallback when run from ISE or other hosts
  $root = Get-Location
}

$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

if (-not (Test-Path $backendPath)) {
  Write-Error "Backend folder not found at: $backendPath"
  exit 1
}
if (-not (Test-Path $frontendPath)) {
  Write-Error "Frontend folder not found at: $frontendPath"
  exit 1
}

Write-Host "Starting backend and frontend in separate PowerShell windows..." -ForegroundColor Cyan

# Backend command: dot-source backend\set-env.ps1 then run dev
$backendCmd = "Set-Location '$backendPath'; if (Test-Path .\set-env.ps1) { . .\set-env.ps1 } else { Write-Host 'Warning: set-env.ps1 not found in backend'; }; npm run dev"
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $backendCmd

Start-Sleep -Milliseconds 500

# Frontend command: dot-source frontend\set-env.ps1 then run serve
$frontendCmd = "Set-Location '$frontendPath'; if (Test-Path .\set-env.ps1) { . .\set-env.ps1 } else { Write-Host 'Warning: set-env.ps1 not found in frontend'; }; npm run serve"
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $frontendCmd

Write-Host "Started both processes. Check the new terminals for logs." -ForegroundColor Green
