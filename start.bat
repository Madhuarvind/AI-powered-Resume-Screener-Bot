@echo off
echo Starting Resume Screener Bot...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python run.py"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
