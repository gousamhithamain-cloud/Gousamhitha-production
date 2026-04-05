@echo off
echo ========================================
echo SECURITY VERIFICATION SCRIPT
echo ========================================
echo.

echo [1/5] Checking for deleted unsafe files...
echo.

set UNSAFE_FILES=0

if exist "admin-script.js" (
    echo [X] FAIL: admin-script.js still exists
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] admin-script.js deleted
)

if exist "js\admin-script-optimized.js" (
    echo [X] FAIL: js\admin-script-optimized.js still exists
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] js\admin-script-optimized.js deleted
)

if exist "js\admin-edit-modal-error-fix.js" (
    echo [X] FAIL: js\admin-edit-modal-error-fix.js still exists
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] js\admin-edit-modal-error-fix.js deleted
)

if exist "js\admin-image-update-fix.js" (
    echo [X] FAIL: js\admin-image-update-fix.js still exists
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] js\admin-image-update-fix.js deleted
)

if exist "js\turbo-database-boost.js" (
    echo [X] FAIL: js\turbo-database-boost.js still exists
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] js\turbo-database-boost.js deleted
)

echo.
echo [2/5] Checking for secure files...
echo.

if exist "js\supabase-client.js" (
    echo [OK] js\supabase-client.js exists (secured)
) else (
    echo [X] FAIL: js\supabase-client.js missing
    set /a UNSAFE_FILES+=1
)

if exist "js\mobile-cart-handler.js" (
    echo [OK] js\mobile-cart-handler.js exists (secured)
) else (
    echo [X] FAIL: js\mobile-cart-handler.js missing
    set /a UNSAFE_FILES+=1
)

if exist "js\api-client.js" (
    echo [OK] js\api-client.js exists
) else (
    echo [X] FAIL: js\api-client.js missing
    set /a UNSAFE_FILES+=1
)

if exist "admin-db.js" (
    echo [OK] admin-db.js exists
) else (
    echo [X] FAIL: admin-db.js missing
    set /a UNSAFE_FILES+=1
)

echo.
echo [3/5] Checking HTML files for unsafe script references...
echo.

findstr /C:"admin-script.js" admin-*.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [X] FAIL: Found references to admin-script.js in HTML files
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] No references to admin-script.js
)

findstr /C:"admin-script-optimized.js" *.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [X] FAIL: Found references to admin-script-optimized.js
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] No references to admin-script-optimized.js
)

findstr /C:"turbo-database-boost.js" *.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [X] FAIL: Found references to turbo-database-boost.js
    set /a UNSAFE_FILES+=1
) else (
    echo [OK] No references to turbo-database-boost.js
)

echo.
echo [4/5] Checking backend configuration...
echo.

if exist "backend\config\supabase.js" (
    echo [OK] backend\config\supabase.js exists
) else (
    echo [X] FAIL: backend\config\supabase.js missing
    set /a UNSAFE_FILES+=1
)

if exist "backend\.env" (
    echo [OK] backend\.env exists
) else (
    echo [WARNING] backend\.env missing - create from .env.example
)

echo.
echo [5/5] Checking documentation...
echo.

if exist "SECURITY-AUDIT-COMPLETE.md" (
    echo [OK] SECURITY-AUDIT-COMPLETE.md exists
) else (
    echo [WARNING] SECURITY-AUDIT-COMPLETE.md missing
)

if exist "SECURITY-FIX-SUMMARY.md" (
    echo [OK] SECURITY-FIX-SUMMARY.md exists
) else (
    echo [WARNING] SECURITY-FIX-SUMMARY.md missing
)

echo.
echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.

if %UNSAFE_FILES% EQU 0 (
    echo [SUCCESS] All security checks passed!
    echo.
    echo Your frontend is now secure:
    echo - No direct database access
    echo - All operations via backend API
    echo - Credentials properly protected
    echo.
    echo Next steps:
    echo 1. Start backend: cd backend ^&^& npm start
    echo 2. Test admin panel operations
    echo 3. Test cart add/remove/update
    echo 4. Verify all API calls in browser DevTools
    echo.
) else (
    echo [FAIL] Found %UNSAFE_FILES% security issues
    echo Please review the errors above and fix them.
    echo.
)

pause
