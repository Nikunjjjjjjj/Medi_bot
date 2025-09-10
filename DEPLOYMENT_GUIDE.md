# MediBot Deployment Guide

## Backend Deployment (Railway)

### 1. Prepare Backend
The backend is already configured for Railway deployment with:
- `Procfile` - Railway deployment configuration
- `railway.json` - Railway-specific settings
- CORS configured for production domains

### 2. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `Medi_bot/backend` folder
4. Railway will automatically detect the Node.js app

### 3. Set Environment Variables in Railway
Add these environment variables in your Railway project settings:

```
OPENAI_API_KEY=your_actual_openai_api_key
TTS_MODEL=tts-1
TTS_VOICE=nova
PINECONE_API_KEY=your_actual_pinecone_api_key
PINECONE_INDEX=your_actual_pinecone_index_name
PINECONE_HOST=your_actual_pinecone_host_url
PINECONE_NAMESPACE=default
WHISPER_MODEL=base.en
NODE_ENV=production
FRONTEND_URL=https://your-netlify-domain.netlify.app
```

### 4. Get Railway Domain
After deployment, Railway will provide a domain like:
`https://your-app-name.up.railway.app`

---

## Frontend Deployment (Netlify)

### 1. Prepare Frontend
The frontend is configured with:
- `netlify.toml` - Netlify deployment configuration
- Environment variable support for backend URL

### 2. Deploy to Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Base directory**: `Medi_bot/frontend`

### 3. Set Environment Variables in Netlify
Add these environment variables in your Netlify site settings:

```
REACT_APP_BACKEND_URL=https://your-railway-domain.up.railway.app
```

### 4. Get Netlify Domain
After deployment, Netlify will provide a domain like:
`https://your-site-name.netlify.app`

---

## Final Configuration

### 1. Update Backend CORS
After getting your Netlify domain, update the `FRONTEND_URL` environment variable in Railway with your actual Netlify domain.

### 2. Update Frontend Backend URL
After getting your Railway domain, update the `REACT_APP_BACKEND_URL` environment variable in Netlify with your actual Railway domain.

### 3. Test Deployment
- Visit your Netlify frontend URL
- Test the chat functionality
- Test audio recording
- Check console for any CORS errors

---

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Check that `FRONTEND_URL` in Railway matches your Netlify domain exactly
2. Check that `REACT_APP_BACKEND_URL` in Netlify matches your Railway domain exactly
3. Ensure both domains use HTTPS

### Audio Issues
- Check that your Railway backend has the necessary environment variables
- Verify that the `/uploads` endpoint is working
- Check browser console for audio-related errors

### Socket.IO Connection Issues
- Ensure both domains are using HTTPS
- Check that Socket.IO CORS configuration includes your Netlify domain
- Verify that Railway is not blocking WebSocket connections
