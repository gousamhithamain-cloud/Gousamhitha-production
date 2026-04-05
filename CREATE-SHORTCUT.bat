@echo off
echo Creating desktop shortcut for Gousamhitha website...
echo.

set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Start Gousamhitha.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%start-and-open.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Start Gousamhitha Website'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo.
    echo ================================================
    echo SUCCESS!
    echo ================================================
    echo.
    echo Shortcut created on your Desktop!
    echo.
    echo You can now:
    echo 1. Go to your Desktop
    echo 2. Double-click "Start Gousamhitha"
    echo 3. Website will open automatically!
    echo.
    echo ================================================
) else (
    echo.
    echo Failed to create shortcut.
    echo Please run this file as Administrator.
    echo.
)

pause
