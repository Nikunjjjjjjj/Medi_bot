// Simple test server for Railway debugging
console.log('Starting test server...');

try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
} catch (err) {
  console.log('⚠️ dotenv not available:', err.message);
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

console.log('✅ Express and HTTP modules loaded');

const app = express();
const server = http.createServer(app);

console.log('✅ Server created');

// Simple Socket.IO setup with error handling
let io;
try {
  io = socketIo(server, {
    cors: {
      origin: ["https://jocular-medovik-513536.netlify.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  console.log('✅ Socket.IO configured');
} catch (err) {
  console.error('❌ Socket.IO error:', err);
}

// Basic middleware
app.use(express.json());
app.use(express.static('public'));
console.log('✅ Middleware configured');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasPinecone: !!process.env.PINECONE_API_KEY,
    nodeVersion: process.version,
    message: 'Simple test server is running!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MediBot Test Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: ['/health']
  });
});

// Simple Socket.IO connection with error handling
if (io) {
  try {
    io.on('connection', (socket) => {
      console.log('✅ User connected to test server');
      
      socket.on('userMessage', (msg) => {
        console.log('📨 Received message:', msg);
        socket.emit('botResponse', `Test response: ${msg}`);
      });
      
      socket.on('disconnect', () => {
        console.log('👋 User disconnected from test server');
      });
    });
    console.log('✅ Socket.IO event handlers configured');
  } catch (err) {
    console.error('❌ Socket.IO event handler error:', err);
  }
}

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Process error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with detailed logging
const PORT = process.env.PORT || 3000;
console.log(`🚀 Starting server on port ${PORT}`);

try {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test server listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`🔑 Pinecone API Key: ${process.env.PINECONE_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`📁 Node version: ${process.version}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`📁 Files in directory: ${require('fs').readdirSync('.').join(', ')}`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
