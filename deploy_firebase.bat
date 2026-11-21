@echo off
echo ========================================================
echo  Deploying Kosmetolog Dildora site to Firebase Hosting
echo ========================================================
echo.
echo Step 1: Checking Firebase login status...
call npx.cmd firebase-tools projects:list
if %errorlevel% neq 0 (
    echo.
    echo Please log in to your Google account for Firebase:
    call npx.cmd firebase-tools login
)

echo.
echo Step 2: Deploying to Firebase Hosting...
call npx.cmd firebase-tools deploy --only hosting
echo.
echo ========================================================
echo  Deployment complete!
echo ========================================================
pause
