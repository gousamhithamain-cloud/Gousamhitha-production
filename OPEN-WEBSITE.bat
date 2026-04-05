@echo off
echo Opening Gousamhitha Website...
echo.
echo Make sure the Python server is running on port 8000!
echo If not, run: python -m http.server 8000
echo.
timeout /t 2
start http://localhost:8000
