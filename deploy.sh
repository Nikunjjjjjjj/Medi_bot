#!/bin/bash
# Railway deployment script

echo "🚀 Deploying MediBot to Railway..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the Medi_bot directory."
    exit 1
fi

# Check if test-server.js exists
if [ ! -f "test-server.js" ]; then
    echo "❌ Error: test-server.js not found."
    exit 1
fi

echo "✅ Files check passed"

# Add all changes
git add .

# Commit changes
git commit -m "Deploy test server to Railway for debugging"

# Push to trigger Railway deployment
git push origin main

echo "✅ Changes pushed to Railway"
echo "🔍 Check Railway logs for deployment status"
echo "🌐 Test URL: https://medibot-production-03a5.up.railway.app/health"
