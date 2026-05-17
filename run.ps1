# Script to run the Focus Friction AI project

Write-Host "Starting Focus Friction AI Backend..." -ForegroundColor Green

# Ensure we're in the right directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $scriptDir

# Check if the virtual environment exists
if (-not (Test-Path ".\.venv")) {
    Write-Host "Virtual environment not found. Please create one and install dependencies." -ForegroundColor Red
    exit
}

# Start the FastAPI server in a new window so it stays open
Start-Process -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn main:app --reload" -NoNewWindow:$false

Write-Host "FastAPI Server started." -ForegroundColor Green
Start-Sleep -Seconds 2

# Start the Vision Engine in a new window
Write-Host "Starting Vision Engine..." -ForegroundColor Green
Start-Process -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "vision_engine.py" -NoNewWindow:$false

Write-Host "Vision Engine started." -ForegroundColor Green
Write-Host ""
Write-Host "=========================================="
Write-Host "Focus Friction AI is now fully running!"
Write-Host "=========================================="
Write-Host "To use the Chrome Extension:"
Write-Host "1. Go to chrome://extensions/"
Write-Host "2. Enable Developer mode"
Write-Host "3. Click 'Load unpacked' and select this folder"
Write-Host "=========================================="
