<#
set-env.ps1

Sets the environment variables used by the backend for the current PowerShell session.

Usage (from project root):
  Set-Location E:\Project\Testing\shop-acc-game\backend
  . .\set-env.ps1   # dot-source to ensure it runs in the current session
  npm run dev

Notes:
- Running this file with a separate PowerShell process (e.g. powershell -File .\set-env.ps1)
  will not keep the variables in your current interactive session. Dot-source it as shown.
- If your ExecutionPolicy prevents running scripts, you can temporarily bypass it in a new PowerShell
  session using: powershell -ExecutionPolicy Bypass -NoProfile -Command ". 'E:\Project\Testing\shop-acc-game\backend\set-env.ps1'; npm run dev"
#>

# Backend server
$env:PORT = '3001'
$env:HOST = 'localhost'

# Frontend client for CORS
$env:CLIENT_URL = 'localhost:8080'

# MongoDB
$env:DB_CONNECTION = 'mongodb'
$env:DB_HOST = 'localhost'
$env:DB_PORT = '27017'
$env:DB_NAME = 'shopgame'

# Session
$env:SESSION_SECRET = 'test'
$env:JWT_SECRET = 'dev-secret-key'

# Node environment
$env:NODE_ENV = 'development'

Write-Host "Backend environment variables set for this session:`n  PORT=$($env:PORT) HOST=$($env:HOST) DB=$($env:DB_HOST):$($env:DB_PORT)/$($env:DB_NAME) CLIENT_URL=$($env:CLIENT_URL)" -ForegroundColor Green
