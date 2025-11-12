<#
set-env.ps1

Sets the environment variables used by the frontend for the current PowerShell session.

Usage (from project root):
  Set-Location E:\Project\Testing\shop-acc-game\frontend
  . .\set-env.ps1   # dot-source to ensure it runs in the current session
  npm run serve

Notes:
- Running this file with a separate PowerShell process (e.g. powershell -File .\set-env.ps1)
  will not keep the variables in your current interactive session. Dot-source it as shown.
- If your ExecutionPolicy prevents running scripts, you can temporarily bypass it in a new PowerShell
  session using: powershell -ExecutionPolicy Bypass -NoProfile -Command ". 'E:\Project\Testing\shop-acc-game\frontend\set-env.ps1'; npm run serve"
#>

# Port the Vue dev server will use (default Vue CLI uses 8080)
$env:PORT = '8080'

# Workaround for OpenSSL / Webpack issues on Node 17+
$env:NODE_OPTIONS = '--openssl-legacy-provider'

# Backend API base URL used by the frontend (include protocol)
# Update if your backend runs on a different host/port or uses HTTPS in production
$env:VUE_APP_URL = 'http://localhost:3001'

Write-Host "Frontend environment variables set for this session:`n  PORT=$($env:PORT) NODE_OPTIONS=$($env:NODE_OPTIONS)" -ForegroundColor Green
