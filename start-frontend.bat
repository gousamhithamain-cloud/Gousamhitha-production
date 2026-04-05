@echo off
echo Starting Gousamhitha Frontend Server...
echo.
echo Generating config.js from .env...
node generate-config.js
echo.
echo Server will run at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000
