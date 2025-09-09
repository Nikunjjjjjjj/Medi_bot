// Simple test server for Railway debugging
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Simple Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: ["https://jocular-medovik-513536.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

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

// Simple Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected to test server');
  
  socket.on('userMessage', (msg) => {
    console.log('Received message:', msg);
    socket.emit('botResponse', `Test response: ${msg}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from test server');
  });
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`Pinecone API Key: ${process.env.PINECONE_API_KEY ? 'Set' : 'Not set'}`);
});
