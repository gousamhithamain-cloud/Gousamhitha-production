@echo off
echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Add e-commerce project files with Supabase backend"

echo Setting main branch...
git branch -M main

echo Adding remote repository...
git remote add origin https://github.com/primeflex200-ui/ecommerce.git

echo Pulling existing files from repository...
git pull origin main --allow-unrelated-histories

echo Pushing all files to GitHub...
git push -u origin main

echo.
echo Done! All files have been pushed to GitHub.
pause
