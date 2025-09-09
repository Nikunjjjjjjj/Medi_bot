#!/bin/bash
# Railway startup script

echo "🚀 Starting MediBot on Railway..."
echo "📁 Working directory: $(pwd)"
echo "📁 Files in directory: $(ls -la)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Check if minimal-server.js exists
if [ -f "minimal-server.js" ]; then
    echo "✅ minimal-server.js found, starting minimal server..."
    node minimal-server.js
elif [ -f "test-server.js" ]; then
    echo "✅ test-server.js found, starting test server..."
    node test-server.js
else
    echo "❌ No test servers found, falling back to server.js"
    node server.js
fi
