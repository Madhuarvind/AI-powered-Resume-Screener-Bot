#!/usr/bin/env python3
"""
Resume Screener Bot - Setup Script
Automated setup for the entire application
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        print(f"🔄 Running: {command}")
        result = subprocess.run(
            command, 
            shell=shell, 
            cwd=cwd, 
            capture_output=True, 
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ Success: {command}")
            return True
        else:
            print(f"❌ Failed: {command}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception running {command}: {e}")
        return False

def check_prerequisites():
    """Check if required software is installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    try:
        python_version = sys.version_info
        if python_version.major >= 3 and python_version.minor >= 8:
            print(f"✅ Python {python_version.major}.{python_version.minor} found")
        else:
            print("❌ Python 3.8+ required")
            return False
    except:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    if run_command("node --version"):
        print("✅ Node.js found")
    else:
        print("❌ Node.js not found - please install Node.js 14+")
        return False
    
    # Check npm
    if run_command("npm --version"):
        print("✅ npm found")
    else:
        print("❌ npm not found")
        return False
    
    return True

def setup_backend():
    """Set up the backend environment"""
    print("\n🐍 Setting up backend...")
    
    backend_dir = Path(__file__).parent / "backend"
    
    # Create virtual environment
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        if not run_command("python -m venv venv", cwd=backend_dir):
            return False
    
    # Determine activation script path
    if os.name == 'nt':  # Windows
        activate_script = venv_path / "Scripts" / "activate.bat"
        pip_path = venv_path / "Scripts" / "pip.exe"
    else:  # Unix/Linux/Mac
        activate_script = venv_path / "bin" / "activate"
        pip_path = venv_path / "bin" / "pip"
    
    # Install requirements
    if pip_path.exists():
        if not run_command(f'"{pip_path}" install -r requirements.txt', cwd=backend_dir):
            return False
    else:
        print("❌ Could not find pip in virtual environment")
        return False
    
    # Create .env file if it doesn't exist
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from template")
        print("⚠️  Please edit backend/.env and add your API keys")
    
    # Create uploads directory
    uploads_dir = backend_dir / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    print("✅ Created uploads directory")
    
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print("\n⚛️  Setting up frontend...")
    
    frontend_dir = Path(__file__).parent / "frontend"
    
    # Install npm dependencies
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✅ Frontend dependencies installed")
    return True

def create_start_scripts():
    """Create convenient start scripts"""
    print("\n📝 Creating start scripts...")
    
    root_dir = Path(__file__).parent
    
    # Windows start script
    if os.name == 'nt':
        start_script = root_dir / "start.bat"
        with open(start_script, 'w') as f:
            f.write("""@echo off
echo Starting Resume Screener Bot...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && venv\\Scripts\\activate && python run.py"

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
""")
        print("✅ Created start.bat for Windows")
    
    # Unix/Linux/Mac start script
    start_script = root_dir / "start.sh"
    with open(start_script, 'w') as f:
        f.write("""#!/bin/bash

echo "🤖 Starting Resume Screener Bot..."
echo

# Function to start backend
start_backend() {
    echo "🐍 Starting backend server..."
    cd backend
    source venv/bin/activate
    python run.py
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting frontend server..."
    cd frontend
    npm start
}

# Start backend in background
start_backend &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
start_frontend &
FRONTEND_PID=$!

echo
echo "🚀 Both servers are starting..."
echo "📍 Backend: http://localhost:5000"
echo "📍 Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
""")
    
    # Make script executable
    os.chmod(start_script, 0o755)
    print("✅ Created start.sh for Unix/Linux/Mac")

def main():
    """Main setup function"""
    print("🤖 Resume Screener Bot - Setup Script")
    print("=" * 50)
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please install required software.")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed.")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed.")
        sys.exit(1)
    
    # Create start scripts
    create_start_scripts()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit backend/.env and add your API keys:")
    print("   - OPENAI_API_KEY=your_openai_key")
    print("   - Or GEMINI_API_KEY=your_gemini_key")
    print("\n2. Start the application:")
    if os.name == 'nt':
        print("   - Windows: Double-click start.bat")
        print("   - Or run: python setup.py --start")
    else:
        print("   - Unix/Linux/Mac: ./start.sh")
        print("   - Or run: python setup.py --start")
    
    print("\n3. Access the application:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend API: http://localhost:5000/api/")
    
    print("\n🛡️  Features included:")
    print("   ✅ AI-powered resume analysis")
    print("   ✅ Bias detection and fair screening")
    print("   ✅ Interactive dashboard with animations")
    print("   ✅ HR assistant chatbot")
    print("   ✅ Candidate management system")
    
    # Check if user wants to start immediately
    if len(sys.argv) > 1 and sys.argv[1] == '--start':
        print("\n🚀 Starting application...")
        if os.name == 'nt':
            os.system('start.bat')
        else:
            os.system('./start.sh')

if __name__ == "__main__":
    main()
