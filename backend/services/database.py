import sqlite3
import json
from datetime import datetime
import os

class DatabaseManager:
    def __init__(self, db_path='resume_screener.db'):
        self.db_path = db_path
    
    def init_db(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create candidates table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                resume_text TEXT NOT NULL,
                job_description TEXT,
                analysis TEXT NOT NULL,
                bias_analysis TEXT,
                blind_resume TEXT,
                upload_date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create chat_history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id INTEGER,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates (id)
            )
        ''')
        
        # Create hr_chat_history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS hr_chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_candidate(self, candidate_data):
        """Save candidate data to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO candidates (
                filename, file_path, resume_text, job_description, 
                analysis, bias_analysis, blind_resume, upload_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            candidate_data['filename'],
            candidate_data['file_path'],
            candidate_data['resume_text'],
            candidate_data.get('job_description', ''),
            json.dumps(candidate_data['analysis']),
            json.dumps(candidate_data.get('bias_analysis', {})),
            candidate_data.get('blind_resume', ''),
            candidate_data['upload_date']
        ))
        
        candidate_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return candidate_id
    
    def get_candidate(self, candidate_id):
        """Get candidate by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM candidates WHERE id = ?', (candidate_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return self._row_to_dict(row)
        return None
    
    def get_all_candidates(self):
        """Get all candidates"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM candidates 
            ORDER BY created_at DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_dict(row) for row in rows]
    
    def _row_to_dict(self, row):
        """Convert database row to dictionary"""
        return {
            'id': row[0],
            'filename': row[1],
            'file_path': row[2],
            'resume_text': row[3],
            'job_description': row[4],
            'analysis': json.loads(row[5]) if row[5] else {},
            'bias_analysis': json.loads(row[6]) if row[6] else {},
            'blind_resume': row[7],
            'upload_date': row[8],
            'created_at': row[9]
        }
    
    def save_chat_message(self, candidate_id, message, response):
        """Save chat message and response"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_history (candidate_id, message, response)
            VALUES (?, ?, ?)
        ''', (candidate_id, message, response))
        
        conn.commit()
        conn.close()
    
    def get_chat_history(self, candidate_id):
        """Get chat history for a candidate"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message, response, timestamp 
            FROM chat_history 
            WHERE candidate_id = ?
            ORDER BY timestamp ASC
        ''', (candidate_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{'message': row[0], 'response': row[1], 'timestamp': row[2]} for row in rows]
    
    def save_hr_chat_message(self, message, response):
        """Save HR chat message and response"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO hr_chat_history (message, response)
            VALUES (?, ?)
        ''', (message, response))
        
        conn.commit()
        conn.close()
    
    def get_hr_chat_history(self, limit=50):
        """Get HR chat history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message, response, timestamp 
            FROM hr_chat_history 
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{'message': row[0], 'response': row[1], 'timestamp': row[2]} for row in reversed(rows)]
    
    def get_statistics(self):
        """Get application statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total candidates
        cursor.execute('SELECT COUNT(*) FROM candidates')
        total_candidates = cursor.fetchone()[0]
        
        # Candidates by category
        cursor.execute('''
            SELECT 
                SUM(CASE WHEN json_extract(analysis, '$.category') = 'Highly Qualified' THEN 1 ELSE 0 END) as highly_qualified,
                SUM(CASE WHEN json_extract(analysis, '$.category') = 'Qualified' THEN 1 ELSE 0 END) as qualified,
                SUM(CASE WHEN json_extract(analysis, '$.category') = 'Not a Fit' THEN 1 ELSE 0 END) as not_fit
            FROM candidates
        ''')
        categories = cursor.fetchone()
        
        # Average scores
        cursor.execute('''
            SELECT 
                AVG(CAST(json_extract(analysis, '$.overall_score') AS FLOAT)) as avg_overall_score,
                AVG(CAST(json_extract(analysis, '$.skills_match') AS FLOAT)) as avg_skills_match
            FROM candidates
        ''')
        scores = cursor.fetchone()
        
        # Recent uploads (last 7 days)
        cursor.execute('''
            SELECT COUNT(*) 
            FROM candidates 
            WHERE created_at >= datetime('now', '-7 days')
        ''')
        recent_uploads = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_candidates': total_candidates,
            'categories': {
                'highly_qualified': categories[0] or 0,
                'qualified': categories[1] or 0,
                'not_fit': categories[2] or 0
            },
            'average_scores': {
                'overall_score': round(scores[0] or 0, 2),
                'skills_match': round(scores[1] or 0, 2)
            },
            'recent_uploads': recent_uploads
        }
    
    def update_setting(self, key, value):
        """Update or insert a setting"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        ''', (key, value))
        
        conn.commit()
        conn.close()
    
    def get_setting(self, key, default=None):
        """Get a setting value"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
        row = cursor.fetchone()
        conn.close()
        
        return row[0] if row else default
