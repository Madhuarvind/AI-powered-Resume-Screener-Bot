@echo off
echo Starting Video Call Server...
echo.

cd backend

echo Installing video call dependencies...
pip install -r requirements_video.txt

echo.
echo Starting Socket.IO Video Server on port 5001...
python video_server.py

pause
