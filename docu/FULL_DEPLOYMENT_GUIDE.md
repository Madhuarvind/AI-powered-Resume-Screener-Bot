# Complete Deployment Guide: Backend (Render) + Frontend (Netlify)

This guide will help you deploy both the backend and frontend of the GenAI Resume Bot.

## Prerequisites

1. **Render Account**: [Sign up at render.com](https://render.com) (free tier available)
2. **Netlify Account**: [Sign up at netlify.com](https://netlify.com) (free tier available)
3. **GitHub Repository**: Your code should be pushed to GitHub
4. **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Deploy Backend to Render

### 1.1 Access Render Dashboard
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New" → "Web Service"

### 1.2 Connect Repository
- Connect your GitHub repository: `https://github.com/Madhuarvind/AI-powered-Resume-Screener-Bot`
- Allow Render to access your repository

### 1.3 Configure Service
Use these settings:
- **Name**: `resume-screener-backend`
- **Runtime**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 1 --worker-class sync --timeout 30 start:app`

### 1.4 Set Environment Variables
Add these environment variables in the "Environment" section:
- `FLASK_ENV`: `production`
- `GEMINI_API_KEY`: `your-actual-gemini-api-key-here`

### 1.5 Deploy
- Click "Create Web Service"
- Wait for deployment to complete (usually 5-10 minutes)
- Note your backend URL: `https://resume-screener-backend-xxxx.onrender.com`

## Step 2: Deploy Frontend to Netlify

### 2.1 Access Netlify Dashboard
- Go to [Netlify Dashboard](https://app.netlify.com)
- Click "Add new site" → "Import an existing project"

### 2.2 Connect Repository
- Connect your GitHub repository
- Branch: `main`

### 2.3 Configure Build Settings
Use these settings:
- **Base directory**: (leave empty)
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/build`

### 2.4 Set Environment Variables
Add this environment variable:
- `REACT_APP_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`

### 2.5 Deploy
- Click "Deploy site"
- Wait for deployment to complete (usually 2-5 minutes)
- Note your frontend URL: `https://amazing-site-name.netlify.app`

## Step 3: Update CORS (if needed)

If you encounter CORS issues, update the backend's CORS configuration in `backend/app.py`:

```python
from flask_cors import CORS

# For production, specify allowed origins
CORS(app, origins=["https://your-netlify-site.netlify.app"])
```

## Step 4: Testing

### Test Backend API
```bash
# Test health endpoint
curl https://your-render-url.onrender.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T12:00:00.000000"}
```

### Test Frontend
- Visit your Netlify URL
- Try uploading a resume
- Check if API calls work

## Troubleshooting

### Backend Issues
- **Port binding**: Ensure start command uses `$PORT`
- **Timeout**: Increase gunicorn timeout if needed
- **API key**: Verify GEMINI_API_KEY is set correctly
- **Logs**: Check Render service logs

### Frontend Issues
- **Build fails**: Ensure all dependencies are in `package.json`
- **API calls fail**: Check REACT_APP_API_BASE_URL
- **CORS errors**: Update CORS origins in backend
- **404 errors**: Check netlify.toml redirects

### Common Fixes
1. **Database persistence**: SQLite resets on redeploy. Consider PostgreSQL
2. **File uploads**: Files are temporary. Consider cloud storage
3. **Rate limits**: Free tiers have limitations

## Production Considerations

### Security
- Add authentication
- Use HTTPS (automatically enabled)
- Validate inputs
- Rate limiting

### Performance
- Upgrade to paid plans for higher limits
- Implement caching
- Optimize images and assets
- Use CDN

### Monitoring
- Set up error tracking
- Monitor API usage
- Check performance metrics

## URLs Summary

After deployment, you'll have:
- **Backend API**: `https://resume-screener-backend-xxxx.onrender.com`
- **Frontend App**: `https://amazing-site-name.netlify.app`

Update any documentation or marketing materials with these URLs.
