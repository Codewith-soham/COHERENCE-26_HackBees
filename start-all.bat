@echo off
echo ========================================
echo    BudgetSetu - Starting All Services
echo ========================================
echo.

echo [1/3] Starting Python AI Service...
start "" /D "D:\BudgetSetu\ai" cmd /k "call D:\BudgetSetu\.venv\Scripts\activate.bat && python main.py"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Node.js Backend...
start "" /D "D:\BudgetSetu\backend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo [3/3] Starting React Frontend...
start "" /D "D:\BudgetSetu\frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    All services started!
echo.
echo    AI Service  → http://localhost:8000
echo    Backend     → http://localhost:5000
echo    Frontend    → http://localhost:5173
echo ========================================
echo.