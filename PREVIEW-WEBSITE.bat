@echo off
echo ========================================
echo   Gousamhitha Website Preview
echo ========================================
echo.
echo Starting local server...
echo.
echo The website will open in your default browser.
echo.
echo To test responsive design:
echo 1. Press F12 to open DevTools
echo 2. Click the device toolbar icon (Ctrl+Shift+M)
echo 3. Test different screen sizes
echo.
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python HTTP Server...
    echo.
    echo Website running at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    start http://localhost:8000/index.html
    python -m http.server 8000
) else (
    REM Check if Node.js is installed
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using Node.js HTTP Server...
        echo.
        echo Installing http-server if needed...
        call npm install -g http-server
        echo.
        echo Website running at: http://localhost:8080
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        start http://localhost:8080/index.html
        http-server -p 8080
    ) else (
        echo ERROR: Neither Python nor Node.js is installed!
        echo.
        echo Please install one of the following:
        echo - Python: https://www.python.org/downloads/
        echo - Node.js: https://nodejs.org/
        echo.
        pause
    )
)
