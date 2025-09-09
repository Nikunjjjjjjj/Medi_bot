# Railway Deployment Fix Guide

## 🚨 Current Issue
Your Railway backend is returning **502 Bad Gateway** with "Application failed to respond" error.

## ✅ What We've Fixed
1. ✅ Added CORS configuration for Socket.IO
2. ✅ Added health check endpoint (`/health`)
3. ✅ Added better error handling and logging
4. ✅ Added Railway-specific configuration (`railway.json`)
5. ✅ Added graceful shutdown handling

## 🔧 Railway Environment Variables Setup

### **Step 1: Go to Railway Dashboard**
1. Visit [Railway Dashboard](https://railway.app/dashboard)
2. Click on your `medibot-production` project
3. Go to **"Variables"** tab

### **Step 2: Add These Environment Variables**
```
OPENAI_API_KEY=your_actual_openai_api_key_here
PINECONE_API_KEY=your_actual_pinecone_api_key_here
PINECONE_INDEX=your_pinecone_index_name
PINECONE_HOST=your_pinecone_host_url
PINECONE_NAMESPACE=default
TTS_MODEL=tts-1
TTS_VOICE=nova
WHISPER_MODEL=base.en
NODE_ENV=production
PORT=3000
```

### **Step 3: Verify Variables**
Make sure all variables are set correctly:
- ✅ No extra spaces or quotes
- ✅ Values are exactly as they appear in your `.env` file
- ✅ All required variables are present

## 🚀 Deployment Steps

### **Step 1: Commit Changes**
```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

### **Step 2: Trigger Railway Redeploy**
1. Go to Railway dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** on the latest deployment

### **Step 3: Monitor Deployment**
1. Watch the **"Logs"** section during deployment
2. Look for these success messages:
   ```
   Server listening on port 3000
   Environment: production
   OpenAI API Key: Set
   Pinecone API Key: Set
   ```

## 🔍 Testing Your Deployment

### **Test 1: Health Check**
Visit: `https://medibot-production-03a5.up.railway.app/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-09-09T11:30:00.000Z",
  "environment": "production",
  "port": 3000,
  "hasOpenAI": true,
  "hasPinecone": true,
  "nodeVersion": "v18.x.x"
}
```

### **Test 2: Root Endpoint**
Visit: `https://medibot-production-03a5.up.railway.app/`

Expected response:
```json
{
  "message": "MediBot Backend is running!",
  "timestamp": "2025-09-09T11:30:00.000Z",
  "environment": "production",
  "endpoints": ["/health", "/upload-audio", "/uploads/*"]
}
```

### **Test 3: Frontend Connection**
Visit: `https://jocular-medovik-513536.netlify.app/`
- Should show 🟢 **Connected** status
- Should be able to send messages

## 🐛 Common Railway Issues & Solutions

### **Issue 1: Environment Variables Not Set**
**Symptoms**: Health check shows `hasOpenAI: false` or `hasPinecone: false`
**Solution**: Double-check all environment variables in Railway dashboard

### **Issue 2: Port Binding Issues**
**Symptoms**: Server starts but Railway can't connect
**Solution**: ✅ Fixed - Added `'0.0.0.0'` binding

### **Issue 3: CORS Issues**
**Symptoms**: Frontend can't connect to backend
**Solution**: ✅ Fixed - Added CORS configuration for Socket.IO

### **Issue 4: Dependencies Issues**
**Symptoms**: Build fails or runtime errors
**Solution**: Check Railway logs for specific dependency errors

## 📋 Railway Logs to Check

### **Successful Deployment Logs**
```
[dotenv@17.2.0] injecting env (9) from .env
Server listening on port 3000
Environment: production
OpenAI API Key: Set
Pinecone API Key: Set
```

### **Error Logs to Look For**
- `Error: Cannot find module` - Missing dependencies
- `Error: connect ECONNREFUSED` - Port binding issues
- `Error: API key not found` - Environment variable issues

## 🎯 Next Steps

1. **Set Environment Variables** in Railway dashboard
2. **Commit and Push** your changes
3. **Redeploy** on Railway
4. **Test** the health check endpoint
5. **Verify** frontend connection

## 📞 If Still Not Working

1. **Check Railway Logs** for specific error messages
2. **Verify Environment Variables** are set correctly
3. **Test Locally** to ensure code works
4. **Contact Railway Support** if issues persist

---

**Note**: Your local server is working perfectly, so the issue is specifically with Railway's deployment environment. The fixes above should resolve the 502 error.
