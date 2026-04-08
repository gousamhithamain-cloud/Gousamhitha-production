@echo off
echo ========================================
echo Testing Admin API Endpoints
echo ========================================
echo.

echo Testing Products API...
curl -s http://localhost:4000/api/products?limit=1
echo.
echo.

echo Testing Vendors API...
curl -s http://localhost:4000/api/vendors?limit=1
echo.
echo.

echo ========================================
echo Test Complete
echo ========================================
pause
