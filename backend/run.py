#!/usr/bin/env python3
"""
Resume Screener Bot - Development Server
Run this file to start the Flask development server
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db_manager

def initialize_app():
    """Initialize the application and database"""
    print("🤖 Resume Screener Bot - Starting up...")
    
    # Initialize database
    try:
        db_manager.init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False
    
    # Create uploads directory if it doesn't exist
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print("✅ Uploads directory created")
    
    # Check API keys
    openai_key = os.getenv('OPENAI_API_KEY')
    gemini_key = os.getenv('GEMINI_API_KEY')
    
    if openai_key:
        print("✅ OpenAI API key found")
    elif gemini_key:
        print("✅ Gemini API key found")
    else:
        print("⚠️  No AI API keys found - using mock responses")
        print("   Add OPENAI_API_KEY or GEMINI_API_KEY to .env file for full functionality")
    
    return True

if __name__ == '__main__':
    if initialize_app():
        print("\n🚀 Starting Flask development server...")
        print("📍 Backend running at: http://localhost:5000")
        print("📍 API endpoints available at: http://localhost:5000/api/")
        print("📍 Health check: http://localhost:5000/api/health")
        print("\n💡 Make sure to start the React frontend on port 3000")
        print("   cd frontend && npm start")
        print("\n🛑 Press Ctrl+C to stop the server\n")
        
        app.run(
            debug=True,
            host='0.0.0.0',
            port=5000,
            use_reloader=True
        )
    else:
        print("❌ Failed to initialize application")
        sys.exit(1)
