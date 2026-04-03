@echo off
echo Installing dependencies...
npm install
echo.
echo Starting server...
npx nodemon app.js
pause