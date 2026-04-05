@echo off
echo ================================================
echo Starting Gousamhitha Website
echo ================================================
echo.

echo Step 1: Generating config.js from .env...
node generate-config.js
echo.

echo Step 2: Starting web server...
echo Server will run at: http://localhost:8000
echo.
echo IMPORTANT: Keep this window open while using the website!
echo Press Ctrl+C to stop the server
echo.

echo Step 3: Opening browser in 3 seconds...
timeout /t 3 /nobreak > nul

start http://localhost:8000

echo.
echo ================================================
echo Website is now running!
echo ================================================
echo.
echo - Website: http://localhost:8000
echo - Admin: http://localhost:8000/admin-dashboard.html
echo.
echo Keep this window open. Press Ctrl+C to stop.
echo ================================================
echo.

python -m http.server 8000
