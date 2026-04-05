@echo off
echo Starting local web server...
echo.
echo Your website will be available at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Try Python 3 first
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python 3...
    python -m http.server 8000
    goto :end
)

REM Try Python 2
python2 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python 2...
    python2 -m SimpleHTTPServer 8000
    goto :end
)

REM Try Node.js with http-server
where http-server >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js http-server...
    http-server -p 8000
    goto :end
)

REM Try npx http-server
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo Using npx http-server...
    npx http-server -p 8000
    goto :end
)

echo ERROR: No web server found!
echo.
echo Please install one of the following:
echo 1. Python: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
echo After installing, run this script again.
pause

:end
