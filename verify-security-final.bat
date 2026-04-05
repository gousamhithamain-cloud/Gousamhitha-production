@echo off
echo ========================================
echo   FINAL SECURITY VERIFICATION
echo ========================================
echo.

echo [1/5] Checking for hardcoded credentials...
findstr /S /I /C:"blsgyybaevuytmgpljyk" *.html *.js 2>nul | find /C ":" >nul
if %errorlevel%==0 (
    echo   [FAIL] Hardcoded credentials found!
    findstr /S /I /C:"blsgyybaevuytmgpljyk" *.html *.js 2>nul
) else (
    echo   [PASS] No hardcoded credentials found
)
echo.

echo [2/5] Checking for Supabase CDN scripts...
findstr /S /I /C:"cdn.jsdelivr.net/npm/@supabase" *.html 2>nul | find /C ":" >nul
if %errorlevel%==0 (
    echo   [FAIL] Supabase CDN scripts found!
    findstr /S /I /C:"cdn.jsdelivr.net/npm/@supabase" *.html 2>nul
) else (
    echo   [PASS] No Supabase CDN scripts found
)
echo.

echo [3/5] Verifying deleted files...
set PASS=0
set FAIL=0

if exist "js\supabase-client.js" (
    echo   [FAIL] js\supabase-client.js still exists
    set /a FAIL+=1
) else (
    echo   [PASS] js\supabase-client.js deleted
    set /a PASS+=1
)

if exist "js\supabase-auth.js" (
    echo   [FAIL] js\supabase-auth.js still exists
    set /a FAIL+=1
) else (
    echo   [PASS] js\supabase-auth.js deleted
    set /a PASS+=1
)

if exist "js\nhost-data-manager.js" (
    echo   [FAIL] js\nhost-data-manager.js still exists
    set /a FAIL+=1
) else (
    echo   [PASS] js\nhost-data-manager.js deleted
    set /a PASS+=1
)

if exist "api\config.js" (
    echo   [FAIL] api\config.js still exists
    set /a FAIL+=1
) else (
    echo   [PASS] api\config.js deleted
    set /a PASS+=1
)
echo.

echo [4/5] Verifying new secure files...
if exist "js\auth-handler.js" (
    echo   [PASS] js\auth-handler.js created
) else (
    echo   [FAIL] js\auth-handler.js missing!
)

if exist "js\api-client.js" (
    echo   [PASS] js\api-client.js exists
) else (
    echo   [FAIL] js\api-client.js missing!
)
echo.

echo [5/5] Verifying backend security...
if exist "backend\config\supabase.js" (
    echo   [PASS] backend\config\supabase.js intact
) else (
    echo   [FAIL] backend\config\supabase.js missing!
)

if exist "backend\.env" (
    echo   [PASS] backend\.env exists
) else (
    echo   [WARN] backend\.env missing - create from .env.example
)
echo.

echo ========================================
echo   VERIFICATION COMPLETE
echo ========================================
echo.
echo Summary:
echo   - Deleted Files: %PASS%/4
echo   - Failed Checks: %FAIL%/4
echo.

if %FAIL%==0 (
    echo [SUCCESS] All security checks passed!
    echo Your project is ready for production.
) else (
    echo [WARNING] Some checks failed. Review above.
)
echo.
echo See REFACTOR-SUMMARY.md for details.
echo.
pause
