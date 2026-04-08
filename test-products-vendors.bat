@echo off
echo ========================================
echo Testing Products and Vendors API
echo ========================================
echo.

echo Testing Products API...
curl -X GET http://localhost:4000/api/products
echo.
echo.

echo Testing Vendors API...
curl -X GET http://localhost:4000/api/vendors
echo.
echo.

echo ========================================
echo Test Complete!
echo ========================================
pause
