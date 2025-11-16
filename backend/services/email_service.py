import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.email_user = os.getenv('EMAIL_USER')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.from_name = os.getenv('FROM_NAME', 'Resume Screener AI')
        
        print(f"📧 Email Service Configuration:")
        print(f"   SMTP Server: {self.smtp_server}:{self.smtp_port}")
        print(f"   Email User: {self.email_user}")
        print(f"   Configured: {'✅' if self.email_user and self.email_password else '❌'}")
    
    def send_team_invitation(self, to_email, inviter_name, team_name="Resume Screener AI Team"):
        """Send team collaboration invitation email"""
        try:
            if not self.email_user or not self.email_password:
                print("❌ Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env")
                return {
                    'success': False,
                    'message': 'Email service not configured',
                    'mock_sent': True
                }
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"🤝 You're invited to join {team_name}"
            msg['From'] = f"{self.from_name} <{self.email_user}>"
            msg['To'] = to_email
            
            # HTML email template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Team Invitation</title>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 600; }}
                    .content {{ padding: 40px 30px; }}
                    .invitation-box {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }}
                    .invitation-box h2 {{ color: white; margin: 0 0 15px 0; font-size: 24px; }}
                    .invitation-box p {{ color: white; margin: 0; font-size: 16px; opacity: 0.9; }}
                    .cta-button {{ display: inline-block; background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                    .features {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }}
                    .feature {{ text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }}
                    .feature-icon {{ font-size: 24px; margin-bottom: 10px; }}
                    .footer {{ background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🤖 Resume Screener AI</h1>
                    </div>
                    
                    <div class="content">
                        <h2>You've been invited to collaborate! 🎉</h2>
                        
                        <p>Hi there!</p>
                        
                        <p><strong>{inviter_name}</strong> has invited you to join the <strong>{team_name}</strong> for collaborative hiring and candidate evaluation.</p>
                        
                        <div class="invitation-box">
                            <h2>🤝 Join Our Team</h2>
                            <p>Start collaborating on candidate reviews, share insights, and make better hiring decisions together.</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:3000/collaboration" class="cta-button">
                                🚀 Join Team Collaboration
                            </a>
                        </div>
                        
                        <div class="features">
                            <div class="feature">
                                <div class="feature-icon">💬</div>
                                <h3>Real-time Chat</h3>
                                <p>Discuss candidates with your team in real-time</p>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">📹</div>
                                <h3>Video Calls</h3>
                                <p>Face-to-face collaboration with video conferencing</p>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">📊</div>
                                <h3>Candidate Reviews</h3>
                                <p>Collaborative candidate evaluation and scoring</p>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">📁</div>
                                <h3>File Sharing</h3>
                                <p>Share documents and candidate files instantly</p>
                            </div>
                        </div>
                        
                        <h3>What you can do:</h3>
                        <ul style="color: #4b5563; line-height: 1.6;">
                            <li>🎯 <strong>Review Candidates:</strong> Access and evaluate candidate profiles</li>
                            <li>💬 <strong>Team Chat:</strong> Communicate with team members in real-time</li>
                            <li>📹 <strong>Video Meetings:</strong> Join video calls for discussions</li>
                            <li>📊 <strong>Share Insights:</strong> Collaborate on hiring decisions</li>
                            <li>📁 <strong>File Access:</strong> Share and access team documents</li>
                        </ul>
                        
                        <p style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <strong>💡 Getting Started:</strong><br>
                            Click the button above to access the collaboration platform. No additional setup required - just start collaborating!
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>This invitation was sent by {inviter_name} on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p>Resume Screener AI - Intelligent Hiring Platform</p>
                        <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                            If you didn't expect this invitation, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_content = f"""
            You've been invited to join {team_name}!
            
            {inviter_name} has invited you to collaborate on candidate evaluation and hiring decisions.
            
            Join the team at: http://localhost:3000/collaboration
            
            What you can do:
            - Review and evaluate candidates
            - Chat with team members in real-time
            - Join video calls for discussions
            - Share files and documents
            - Collaborate on hiring decisions
            
            This invitation was sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
            
            Resume Screener AI - Intelligent Hiring Platform
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
            
            print(f"✅ Team invitation sent successfully to {to_email}")
            return {
                'success': True,
                'message': f'Invitation sent to {to_email}',
                'sent_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error sending email: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send email: {str(e)}',
                'mock_sent': True
            }
    
    def send_notification_email(self, to_email, subject, message, sender_name):
        """Send general notification email"""
        try:
            if not self.email_user or not self.email_password:
                print("❌ Email service not configured")
                return {'success': False, 'message': 'Email service not configured'}
            
            msg = MIMEMultipart()
            msg['Subject'] = f"🔔 {subject}"
            msg['From'] = f"{self.from_name} <{self.email_user}>"
            msg['To'] = to_email
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .notification {{ background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🤖 Resume Screener AI</h1>
                        <h2>{subject}</h2>
                    </div>
                    <div class="notification">
                        <p><strong>From:</strong> {sender_name}</p>
                        <p><strong>Message:</strong> {message}</p>
                        <p><strong>Time:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                    </div>
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/collaboration" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                            View in Collaboration Platform
                        </a>
                    </p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_content, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
            
            return {'success': True, 'message': f'Notification sent to {to_email}'}
            
        except Exception as e:
            print(f"❌ Error sending notification email: {str(e)}")
            return {'success': False, 'message': str(e)}
