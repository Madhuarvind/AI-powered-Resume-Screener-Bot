# 📧 Email Setup Guide - Team Collaboration

## 🎯 Current Status
- ✅ **Video Calls**: Real WebRTC implementation with camera/microphone
- ✅ **Email Service**: Backend configured for real email sending
- ⚠️ **Email Configuration**: Requires SMTP setup for real emails

## 🚀 Real Video Calls Now Working!

### ✅ Video Call Features:
- **Real Camera Access**: Requests actual camera/microphone permissions
- **Live Video Stream**: Shows your real video feed
- **Functional Controls**: Mute/unmute, video on/off, screen sharing
- **Participant Display**: Shows team member thumbnails
- **Call Management**: Start/end calls with proper cleanup

### 🎮 How to Test Video:
1. Navigate to Collaboration page
2. Click "Start Video Call"
3. Allow camera/microphone permissions
4. See your real video stream
5. Test mute/video/screen share controls

## 📧 Email Service Setup

### Option 1: Gmail SMTP (Recommended)

#### Step 1: Enable App Passwords
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Generate new app password for "Resume Screener AI"
5. Copy the 16-character password

#### Step 2: Configure Environment
1. Navigate to backend folder:
   ```bash
   cd c:\Users\Admin\Downloads\GenAi_resume_Bot\backend
   ```

2. Create/edit `.env` file:
   ```bash
   notepad .env
   ```

3. Add email configuration:
   ```env
   # Email Configuration
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   FROM_NAME=Resume Screener AI Team
   ```

### Option 2: Outlook/Hotmail SMTP

```env
# Outlook Configuration
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
FROM_NAME=Resume Screener AI Team
```

### Option 3: Custom SMTP

```env
# Custom SMTP Configuration
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
FROM_NAME=Resume Screener AI Team
```

## 🔧 Testing Email Setup

### Step 1: Restart Server
```bash
# Stop current server (Ctrl+C)
# Restart with new configuration
.\start.bat
```

### Step 2: Check Console Logs
Look for email service status:
```
📧 Email Service Configuration:
   SMTP Server: smtp.gmail.com:587
   Email User: your-email@gmail.com
   Configured: ✅
```

### Step 3: Test Team Invitation
1. Go to Collaboration page
2. Click "Invite Team Member"
3. Enter a real email address
4. Click "Send Invite"
5. Check if email is received

## 📬 Email Templates

### Team Invitation Email
- **Beautiful HTML design** with gradients and styling
- **Professional layout** with company branding
- **Clear call-to-action** button
- **Feature highlights** (chat, video, file sharing)
- **Mobile-responsive** design

### Notification Email
- **Clean, simple design**
- **Sender information**
- **Timestamp and context**
- **Direct link** to collaboration platform

## 🛠️ Troubleshooting

### Issue: "Email service not configured"
**Solution**: 
1. ✅ Check `.env` file exists in backend folder
2. ✅ Verify EMAIL_USER and EMAIL_PASSWORD are set
3. ✅ Restart the server after adding credentials

### Issue: "Authentication failed"
**Solutions**:
- **Gmail**: Use App Password, not regular password
- **2FA**: Must be enabled for Gmail App Passwords
- **Less Secure Apps**: May need to enable for some providers

### Issue: "Connection timeout"
**Solutions**:
- Check SMTP server and port settings
- Verify firewall/antivirus isn't blocking
- Try different SMTP port (465 for SSL)

### Issue: Emails go to spam
**Solutions**:
- Check sender reputation
- Add proper SPF/DKIM records (advanced)
- Ask recipients to whitelist sender

## 🎯 Expected Results

### Without Email Configuration:
- ✅ Mock invitations sent (UI feedback)
- ✅ Team members added to interface
- ❌ No actual emails sent

### With Email Configuration:
- ✅ Real HTML emails sent
- ✅ Professional email templates
- ✅ Delivery confirmations
- ✅ Beautiful invitation design

## 📊 Current Features Working:

| Feature | Status | Notes |
|---------|--------|-------|
| **Video Calls** | ✅ Working | Real WebRTC implementation |
| **Camera Access** | ✅ Working | Requests permissions |
| **Microphone** | ✅ Working | Mute/unmute functionality |
| **Screen Share** | ✅ Working | Browser screen sharing API |
| **Video Controls** | ✅ Working | All buttons functional |
| **Email Service** | ⚠️ Setup Required | Backend ready, needs SMTP |
| **Team Invites** | ✅ Working | Mock mode until SMTP configured |
| **Email Templates** | ✅ Ready | Beautiful HTML designs |

## 🚀 Next Steps

1. **Immediate**: Test video calls (already working!)
2. **Recommended**: Set up Gmail SMTP for real emails
3. **Optional**: Configure custom SMTP server

## 💡 Pro Tips

- **Gmail**: Most reliable, use App Passwords
- **Testing**: Use your own email first
- **Security**: Never commit email passwords to git
- **Backup**: Keep SMTP credentials secure
- **Performance**: Email sending is async, won't block UI

---

## 🆘 Need Help?

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify email credentials are correct
3. Test with a simple email first
4. Ensure server restart after configuration changes

**Your collaboration platform now has real video calls and professional email system! 🎉**
