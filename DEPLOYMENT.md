# MediBot Netlify Deployment Guide

## Overview
This guide explains how to deploy your MediBot application using Netlify for the frontend and a separate service for the backend.

## Architecture
- **Frontend**: Deployed to Netlify (static files)
- **Backend**: Deployed separately (Heroku, Railway, Render, etc.)
- **Communication**: Frontend proxies API calls to backend via Netlify redirects

## Prerequisites
1. A Netlify account
2. Your backend deployed to a service like Heroku, Railway, or Render
3. Your backend URL (e.g., `https://your-mediBot-backend.herokuapp.com`)

## Step 1: Deploy Your Backend First

### Option A: Heroku
1. Create a `Procfile` in your project root:
   ```
   web: node server.js
   ```
2. Deploy to Heroku:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create your-mediBot-backend
   git push heroku main
   ```

### Option B: Railway
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Option C: Render
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `npm start`

## Step 2: Configure Environment Variables

Set these environment variables in your backend deployment:

### Required Environment Variables
```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
PINECONE_HOST=your_pinecone_host
PINECONE_NAMESPACE=your_namespace_or_default
TTS_MODEL=tts-1
TTS_VOICE=nova
WHISPER_MODEL=base.en
PORT=3000
```

## Step 3: Deploy Frontend to Netlify

### Method 1: Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --dir=public --prod
   ```

### Method 2: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `echo "No build required"`
   - **Publish directory**: `public`
5. Set environment variables:
   - `REACT_APP_BACKEND_URL`: Your backend URL

## Step 4: Update Configuration Files

### Update netlify.toml
Replace `https://your-backend-url.herokuapp.com` with your actual backend URL in:
- `netlify.toml`
- `public/chat-netlify.js`

### Update Frontend Files
1. Rename `index-netlify.html` to `index.html` (backup original)
2. Rename `chat-netlify.js` to `chat.js` (backup original)
3. Update the `BACKEND_URL` variable in `chat.js`

## Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Test the chat functionality
3. Test audio recording/upload
4. Verify Socket.IO connection

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your backend has proper CORS configuration
2. **Socket.IO Connection**: Check that Socket.IO is properly configured for cross-origin
3. **File Upload Issues**: Verify file upload endpoints are accessible
4. **Environment Variables**: Double-check all required environment variables are set

### Backend CORS Configuration
Add this to your `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Alternative: Full-Stack Deployment Options

If you prefer to deploy everything together:

### Option 1: Vercel (Recommended)
- Supports Node.js backends
- Easy deployment with `vercel` CLI
- Built-in environment variable management

### Option 2: Railway
- Full-stack deployment
- Automatic deployments from GitHub
- Built-in database support

### Option 3: Render
- Supports both static sites and web services
- Can deploy frontend and backend separately or together

## Environment Variables Reference

### Frontend (Netlify)
```
REACT_APP_BACKEND_URL=https://your-backend-url.herokuapp.com
```

### Backend
```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=your-index
PINECONE_HOST=https://your-index-host
PINECONE_NAMESPACE=default
TTS_MODEL=tts-1
TTS_VOICE=nova
WHISPER_MODEL=base.en
PORT=3000
NODE_ENV=production
```
