@echo off
echo Starting Gousamhitha Frontend Server...
echo.
echo Generating config.js from .env...
node generate-config.js
echo.
echo Installing http-server (one-time only)...
call npm install -g http-server
echo.
echo Server will run at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

http-server -p 8000
