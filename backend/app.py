from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sqlite3
from datetime import datetime
import json
from werkzeug.utils import secure_filename
import uuid

from services.resume_parser import ResumeParser
from services.openai_service import OpenAIService
from services.bias_detection import BiasDetector
from services.database import DatabaseManager
from services.email_service import EmailService

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize services
resume_parser = ResumeParser()
ai_service = OpenAIService()
bias_detector = BiasDetector()
db_manager = DatabaseManager()
email_service = EmailService()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_resume():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        job_description = request.form.get('job_description', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF and DOCX allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Parse resume
        resume_text = resume_parser.extract_text(file_path)
        
        # AI Analysis
        analysis = ai_service.analyze_resume(resume_text, job_description)
        
        # Bias Detection
        bias_analysis = bias_detector.analyze_bias(resume_text)
        blind_resume = bias_detector.create_blind_resume(resume_text)
        
        # Save to database
        candidate_id = db_manager.save_candidate({
            'filename': filename,
            'file_path': file_path,
            'resume_text': resume_text,
            'job_description': job_description,
            'analysis': analysis,
            'bias_analysis': bias_analysis,
            'blind_resume': blind_resume,
            'upload_date': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'candidate_id': candidate_id,
            'analysis': analysis,
            'bias_analysis': bias_analysis
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    try:
        candidates = db_manager.get_all_candidates()
        return jsonify({'candidates': candidates})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    try:
        candidate = db_manager.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        return jsonify({'candidate': candidate})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bias-analysis/<int:candidate_id>', methods=['GET'])
def get_bias_analysis(candidate_id):
    try:
        candidate = db_manager.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        return jsonify({
            'bias_analysis': candidate.get('bias_analysis', {}),
            'recommendations': bias_detector.get_recommendations(candidate.get('bias_analysis', {}))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blind-resume/<int:candidate_id>', methods=['GET'])
def get_blind_resume(candidate_id):
    try:
        candidate = db_manager.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        return jsonify({'blind_resume': candidate.get('blind_resume', '')})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def candidate_chat():
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        message = data.get('message')
        
        if not candidate_id or not message:
            return jsonify({'error': 'Missing candidate_id or message'}), 400
        
        candidate = db_manager.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        response = ai_service.chat_about_candidate(candidate, message)
        return jsonify({'response': response})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hr-chat', methods=['POST'])
def hr_chat():
    """HR assistant chat endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get all candidates for context
        candidates = db_manager.get_all_candidates()
        
        # Get AI response with candidate context
        response = ai_service.hr_assistant_chat(candidates, message)
        
        # Save chat history
        db_manager.save_hr_chat_message(message, response)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in HR chat: {e}")
        return jsonify({'error': 'Failed to process chat message'}), 500

@app.route('/api/fair-screening/toggle', methods=['POST'])
def toggle_fair_screening():
    try:
        data = request.get_json()
        enabled = data.get('enabled', False)
        
        # This could be stored in a configuration table
        # For now, we'll just return the status
        return jsonify({
            'fair_screening_enabled': enabled,
            'message': f"Fair screening {'enabled' if enabled else 'disabled'}"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    try:
        stats = db_manager.get_statistics()
        return jsonify({'statistics': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/collaboration/invite', methods=['POST'])
def send_team_invitation():
    try:
        data = request.get_json()
        to_email = data.get('email')
        inviter_name = data.get('inviter_name', 'Team Member')
        team_name = data.get('team_name', 'Resume Screener AI Team')
        
        if not to_email:
            return jsonify({'error': 'Email address is required'}), 400
        
        # Send invitation email
        result = email_service.send_team_invitation(to_email, inviter_name, team_name)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'sent_at': result.get('sent_at')
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message'],
                'mock_sent': result.get('mock_sent', False)
            }), 200  # Still return 200 for mock sends
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/collaboration/notify', methods=['POST'])
def send_notification():
    try:
        data = request.get_json()
        to_email = data.get('email')
        subject = data.get('subject', 'Team Notification')
        message = data.get('message', '')
        sender_name = data.get('sender_name', 'Team Member')
        
        if not to_email or not message:
            return jsonify({'error': 'Email and message are required'}), 400
        
        # Send notification email
        result = email_service.send_notification_email(to_email, subject, message, sender_name)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database
    db_manager.init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
