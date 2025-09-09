# MediBot - AI-Powered Medical Chatbot

A full-stack web application that provides intelligent medical assistance through text and voice interactions using OpenAI's GPT models, Pinecone vector database, and real-time communication via Socket.IO.

## 🏗️ Project Architecture

```
MediBot/
├── 📁 Backend (Node.js/Express)
│   ├── server.js              # Main Express server
│   ├── socket.js              # Socket.IO handlers & AI logic
│   ├── services/              # External API integrations
│   │   ├── openai.js          # OpenAI API (GPT, TTS, Embeddings)
│   │   ├── pinecone.js        # Vector database operations
│   │   └── transcribe.js      # Audio transcription (Whisper)
│   ├── utils/
│   │   └── logger.js          # Winston logging utility
│   └── uploads/               # Temporary file storage
├── 📁 Frontend (Static HTML/CSS/JS)
│   ├── public/
│   │   ├── index.html         # Main chat interface
│   │   ├── chat.js           # Frontend JavaScript
│   │   ├── index-netlify.html # Netlify deployment version
│   │   └── chat-netlify.js   # Netlify deployment version
│   └── netlify.toml          # Netlify configuration
├── 📁 Configuration
│   ├── package.json          # Dependencies & scripts
│   ├── Procfile             # Railway/Heroku deployment
│   ├── env.example          # Environment variables template
│   └── DEPLOYMENT.md        # Deployment guide
└── README.md                # This file
```

## 🔄 Code Flow & Data Flow

### 1. **User Interaction Flow**
```
User Input → Frontend (chat.js) → Socket.IO → Backend (socket.js) → AI Processing → Response
```

### 2. **Text Message Flow**
```
1. User types message in input field
2. Frontend sends via Socket.IO: socket.emit('userMessage', msg)
3. Backend receives in socket.js: socket.on('userMessage', async (msg) => {...})
4. getSemanticResponse() processes the message
5. Response sent back: socket.emit('botResponse', response)
6. Frontend displays response: socket.on('botResponse', data => {...})
```

### 3. **Audio Message Flow**
```
1. User records audio OR uploads audio file
2. Frontend sends audio to /upload-audio endpoint
3. Backend processes audio:
   - Converts to WAV format (16kHz mono)
   - Transcribes using Whisper (local or OpenAI API)
   - Returns transcription text
4. Transcription sent to AI processing pipeline
5. AI generates response (text + optional audio)
6. Response sent back to frontend
```

### 4. **AI Processing Pipeline**
```
User Message → Vector Search (Pinecone) → Context Building → GPT-4 Generation → TTS (Optional) → Response
```

## 📁 File Structure Details

### **Backend Files**

#### `server.js` - Main Server
- **Purpose**: Express server setup and API endpoints
- **Key Features**:
  - Static file serving (`/public`)
  - File upload handling (`/upload-audio`)
  - Socket.IO server setup
  - Audio file management (`/uploads`)
- **Dependencies**: express, socket.io, multer, dotenv

#### `socket.js` - Real-time Communication & AI Logic
- **Purpose**: Handles Socket.IO connections and AI response generation
- **Key Functions**:
  - `getSemanticResponse()`: Main AI processing function
  - Vector search using Pinecone
  - Context building from search results
  - GPT-4 response generation
  - Optional TTS synthesis
- **Flow**:
  1. Receive user message
  2. Search Pinecone for relevant medical information
  3. Build context from search results
  4. Generate response using GPT-4
  5. Optionally synthesize speech
  6. Send response back to client

#### `services/openai.js` - OpenAI Integration
- **Functions**:
  - `getEmbedding()`: Convert text to vector embeddings
  - `generateReply()`: Generate GPT-4 responses
  - `synthesizeSpeech()`: Convert text to speech (TTS)
- **Models Used**:
  - `text-embedding-ada-002`: For embeddings
  - `gpt-4.1-nano`: For chat completions
  - `tts-1`: For text-to-speech (voice: nova)

#### `services/pinecone.js` - Vector Database
- **Purpose**: Semantic search for medical information
- **Functions**:
  - `searchVectors()`: Search for relevant medical content
- **Configuration**:
  - Uses Pinecone vector database
  - Configurable namespace and top-K results

#### `services/transcribe.js` - Audio Processing
- **Purpose**: Convert audio to text
- **Features**:
  - Audio format conversion (FFmpeg)
  - Local Whisper transcription (primary)
  - OpenAI Whisper API fallback
- **Supported Formats**: MP3, WAV, M4A, etc.

### **Frontend Files**

#### `public/index.html` - Main Interface
- **Features**:
  - Chat interface with message history
  - Audio recording button
  - File upload functionality
  - Real-time status updates
- **Styling**: Inline CSS with responsive design

#### `public/chat.js` - Frontend Logic
- **Key Functions**:
  - `sendMessage()`: Send text messages
  - `toggleRecording()`: Handle audio recording
  - `handleFileUpload()`: Process audio file uploads
  - `playBotAudio()`: Play AI-generated speech
- **Socket.IO Events**:
  - `userMessage`: Send user input
  - `botResponse`: Receive AI responses

## 🔌 API Endpoints

### **POST /upload-audio**
- **Purpose**: Upload and transcribe audio files
- **Input**: Multipart form data with audio file
- **Output**: JSON with transcription text
- **Process**:
  1. Save uploaded file temporarily
  2. Convert to WAV format
  3. Transcribe using Whisper
  4. Clean up temporary files
  5. Return transcription

### **DELETE /uploads/:filename**
- **Purpose**: Delete temporary audio files
- **Security**: Only allows deletion from uploads directory
- **Usage**: Called after audio playback completes

### **Socket.IO Events**
- **`userMessage`**: Client → Server (text input)
- **`botResponse`**: Server → Client (AI response)

## ⚙️ Environment Variables

### **Required Variables**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # OpenAI API key
TTS_MODEL=tts-1                          # Text-to-speech model
TTS_VOICE=nova                           # Voice for TTS

# Pinecone Configuration
PINECONE_API_KEY=...                     # Pinecone API key
PINECONE_INDEX=your-index-name           # Vector database index
PINECONE_HOST=https://your-host          # Pinecone host URL
PINECONE_NAMESPACE=default               # Database namespace

# Whisper Configuration
WHISPER_MODEL=base.en                    # Whisper model for transcription

# Server Configuration
PORT=3000                                # Server port
NODE_ENV=production                      # Environment mode
```

## 🚀 Setup & Installation

### **1. Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Pinecone account and API key
- FFmpeg (for audio processing)

### **2. Installation**
```bash
# Clone repository
git clone <repository-url>
cd MediBot/Medi_bot

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

### **3. Local Development**
```bash
# Start server
npm start

# Access application
http://localhost:3000
```

## 🔧 Dependencies

### **Backend Dependencies**
- `express`: Web framework
- `socket.io`: Real-time communication
- `multer`: File upload handling
- `dotenv`: Environment variable management
- `winston`: Logging
- `axios`: HTTP client
- `@pinecone-database/pinecone`: Vector database client
- `fluent-ffmpeg`: Audio processing
- `ffmpeg-static`: FFmpeg binary
- `nodejs-whisper`: Local Whisper transcription
- `form-data`: Form data handling

### **Frontend Dependencies**
- Socket.IO client (loaded from CDN)
- Native Web APIs (MediaRecorder, getUserMedia)

## 🌐 Deployment Options

### **Option 1: Railway (Recommended)**
- Full-stack deployment
- Automatic environment variable management
- Built-in logging and monitoring

### **Option 2: Netlify + Separate Backend**
- Frontend: Netlify (static hosting)
- Backend: Railway/Heroku/Render
- Uses proxy redirects for API calls

### **Option 3: Vercel**
- Supports Node.js backends
- Easy deployment with CLI
- Built-in environment management

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Audio Recording Not Working**
- **Cause**: Browser permissions or HTTPS requirement
- **Solution**: Ensure HTTPS or use localhost for development

#### **2. Transcription Failures**
- **Cause**: Missing FFmpeg or Whisper model issues
- **Solution**: Check FFmpeg installation and model availability

#### **3. Pinecone Connection Errors**
- **Cause**: Incorrect API key or index configuration
- **Solution**: Verify Pinecone credentials and index settings

#### **4. OpenAI API Errors**
- **Cause**: Invalid API key or rate limits
- **Solution**: Check API key and usage limits

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm start

# Check specific services
DEBUG=socket.io* npm start
```

## 📊 Performance Considerations

### **Optimization Tips**
1. **Audio Processing**: Use local Whisper for faster transcription
2. **Vector Search**: Limit Pinecone results to relevant top-K
3. **File Cleanup**: Automatic cleanup of temporary audio files
4. **Caching**: Consider caching frequent medical queries

### **Scalability**
- **Horizontal Scaling**: Multiple server instances with load balancer
- **Database**: Pinecone handles vector search scaling
- **File Storage**: Use cloud storage for audio files in production

## 🔒 Security Considerations

### **Implemented Security**
- File upload validation (audio files only)
- Secure file deletion (uploads directory only)
- Environment variable protection
- CORS configuration for production

### **Production Recommendations**
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use secure session management
- Regular security audits

## 📈 Future Enhancements

### **Planned Features**
- [ ] User authentication and session management
- [ ] Conversation history persistence
- [ ] Multi-language support
- [ ] Advanced medical knowledge base
- [ ] Integration with medical databases
- [ ] Mobile app development
- [ ] Voice command recognition
- [ ] Real-time collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the deployment guide (DEPLOYMENT.md)

---

**Note**: This application is for educational and informational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment.
