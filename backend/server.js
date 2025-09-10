require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
// Load dependencies with error handling
let getSemanticResponse, logger, transcribeAudio;

try {
  const socketModule = require('./socket');
  getSemanticResponse = socketModule.getSemanticResponse;
  console.log('✅ Socket module loaded');
} catch (err) {
  console.error('❌ Socket module error:', err);
  getSemanticResponse = () => ({ text: 'Socket module not available', audioUrl: null });
}

try {
  logger = require('./utils/logger');
  console.log('✅ Logger module loaded');
} catch (err) {
  console.error('❌ Logger module error:', err);
  logger = { info: console.log, error: console.error };
}

try {
  const transcribeModule = require('./services/transcribe');
  transcribeAudio = transcribeModule.transcribeAudio;
  console.log('✅ Transcribe module loaded');
} catch (err) {
  console.error('❌ Transcribe module error:', err);
  transcribeAudio = () => Promise.resolve('Transcription not available');
}

const app = express();
const server = http.createServer(app);

// Add CORS middleware for Express routes
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://jocular-medovik-513536.netlify.app", // Your existing Netlify domain
    "http://localhost:3000", 
    "http://localhost:3001",
    // Add your new Netlify domain here when you deploy
    process.env.FRONTEND_URL // Environment variable for frontend URL
  ].filter(Boolean); // Remove any undefined values
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configure Socket.IO for Railway deployment
const io = socketIo(server, {
  cors: {
    origin: [
      "https://jocular-medovik-513536.netlify.app", // Your existing Netlify domain
      "http://localhost:3000", 
      "http://localhost:3001",
      // Add your new Netlify domain here when you deploy
      process.env.FRONTEND_URL // Environment variable for frontend URL
    ].filter(Boolean), // Remove any undefined values
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, 'public')));
// Expose uploaded/generated files for direct access (e.g., MP3 replies)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const upload = multer({ dest: uploadsDir });

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasPinecone: !!process.env.PINECONE_API_KEY,
    nodeVersion: process.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MediBot Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: ['/health', '/upload-audio', '/uploads/*']
  });
});

// Audio upload + transcription endpoint
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const transcription = await transcribeAudio(req.file.path);
    return res.json({ transcription });
  } catch (err) {
    logger.error('Transcription failed', err);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// Delete audio file endpoint
app.delete('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // Security check: only allow deleting files in uploads directory
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error('Failed to delete audio file', err);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    logger.info(`Deleted audio file: ${filename}`);
    res.json({ success: true });
  });
});

io.on('connection', socket => {
  logger.info('User connected');
  socket.on('userMessage', async (msg) => {
    try {
      logger.info(`Received message: ${msg}`);
      const response = await getSemanticResponse(msg);
      socket.emit('botResponse', response);
    } catch (err) {
      logger.error('Error processing message:', err);
      socket.emit('botResponse', { text: 'Sorry, I encountered an error processing your message.', audioUrl: null });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('User disconnected');
  });
  
  socket.on('error', (err) => {
    logger.error('Socket error:', err);
  });
});

const PORT = process.env.PORT || 3000;

// Add error handling
server.on('error', (err) => {
  logger.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
  logger.info(`Pinecone API Key: ${process.env.PINECONE_API_KEY ? 'Set' : 'Not set'}`);
});