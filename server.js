require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { getSemanticResponse } = require('./socket');
const logger = require('./utils/logger');
const { transcribeAudio } = require('./services/transcribe');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
// Expose uploaded/generated files for direct access (e.g., MP3 replies)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const upload = multer({ dest: uploadsDir });

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
    logger.info(`Received message: ${msg}`);
    const response = await getSemanticResponse(msg);
    socket.emit('botResponse', response);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));