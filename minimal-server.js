// Minimal server to test Railway deployment
console.log('🚀 Starting minimal server...');

// Test basic Node.js functionality
console.log('✅ Node.js working');
console.log('📁 Working directory:', process.cwd());
console.log('📁 Node version:', process.version);

// Test environment variables
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('🔑 Pinecone API Key:', process.env.PINECONE_API_KEY ? 'Set' : 'Not set');

// Test basic modules
try {
  const fs = require('fs');
  console.log('✅ fs module loaded');
} catch (err) {
  console.error('❌ fs module error:', err);
}

try {
  const path = require('path');
  console.log('✅ path module loaded');
} catch (err) {
  console.error('❌ path module error:', err);
}

// Test Express
try {
  const express = require('express');
  console.log('✅ express module loaded');
  
  const app = express();
  console.log('✅ express app created');
  
  // Basic route
  app.get('/', (req, res) => {
    res.json({
      message: 'Minimal server is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  });
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasPinecone: !!process.env.PINECONE_API_KEY,
      nodeVersion: process.version,
      message: 'Minimal server health check'
    });
  });
  
  console.log('✅ routes configured');
  
  // Start server
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Minimal server listening on port ${PORT}`);
    console.log('🎉 Server started successfully!');
  });
  
  // Error handling
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
  
} catch (err) {
  console.error('❌ Express error:', err);
  process.exit(1);
}

// Process error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
