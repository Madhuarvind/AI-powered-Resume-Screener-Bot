import os
import sys
import json
from services.gemini_service import GeminiService

# Mock candidate data for testing
mock_candidate = {
    "id": 1,
    "analysis": {
        "contact_info": {"name": "Test User"},
        "overall_score": 85,
        "category": "Qualified",
        "key_skills": ["Python", "Flask", "React"],
        "experience_years": 5,
        "strengths": ["Coding", "Debugging"],
        "weaknesses": ["Public Speaking"]
    }
}

def test_chat():
    print("Testing Gemini Service...")
    service = GeminiService()
    
    default_key = 'AIzaSyCfBXN7Iqy6bzh_k8vG2nn8o2jTM69XTUY'
    if service.api_key == default_key:
        print("⚠️  WARNING: Using default (likely invalid) API key!")
    else:
        print("✅ Using custom API key.")

    # Test 1: Simple Chat
    print("\n1. Testing Candidate Chat...")
    try:
        response = service.chat_about_candidate(mock_candidate, "What are the key skills?")
        print(f"Response: {response[:100]}...")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    # Add backend to path
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    test_chat()
