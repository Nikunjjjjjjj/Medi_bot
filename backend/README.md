# MediBot Backend

A Node.js backend server for the MediBot AI medical chatbot application.

## Features

- 🤖 **AI Integration**: OpenAI GPT-4 for intelligent responses
- 🔍 **Vector Search**: Pinecone for semantic medical knowledge search
- 🎤 **Audio Processing**: Whisper for speech-to-text transcription
- 🔊 **Text-to-Speech**: OpenAI TTS for voice responses
- 🔄 **Real-time Communication**: Socket.IO for instant messaging
- 📁 **File Management**: Audio file upload and processing

## Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **OpenAI API**: GPT-4, Whisper, TTS
- **Pinecone**: Vector database
- **Winston**: Logging
- **Multer**: File upload handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Pinecone API key and index

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp ../env.example .env
   ```

4. Update `.env` with your API keys:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_index_name
   PINECONE_HOST=your_host_url
   TTS_MODEL=tts-1
   TTS_VOICE=nova
   WHISPER_MODEL=base.en
   NODE_ENV=development
   PORT=3000
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Audio Processing
- **POST** `/upload-audio` - Upload and transcribe audio files
- **DELETE** `/uploads/:filename` - Delete audio files

### Socket.IO Events
- **userMessage** - Receive user messages
- **botResponse** - Send AI responses

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `PINECONE_INDEX` | Pinecone index name | Yes |
| `PINECONE_HOST` | Pinecone host URL | Yes |
| `PINECONE_NAMESPACE` | Pinecone namespace | No |
| `TTS_MODEL` | Text-to-speech model | No |
| `TTS_VOICE` | TTS voice | No |
| `WHISPER_MODEL` | Whisper model | No |
| `PORT` | Server port | No |
| `NODE_ENV` | Environment | No |

## Project Structure

```
backend/
├── services/
│   ├── openai.js        # OpenAI API integration
│   ├── pinecone.js      # Pinecone vector search
│   └── transcribe.js    # Audio transcription
├── utils/
│   └── logger.js        # Winston logging
├── uploads/             # Temporary audio files
├── server.js            # Main Express server
├── socket.js            # Socket.IO handlers
├── package.json         # Dependencies
├── Procfile            # Railway deployment
└── railway.json        # Railway configuration
```

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Heroku

1. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set PINECONE_API_KEY=your_key
   # ... other variables
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

## Development

### Local Development
```bash
npm start
```

### Debug Mode
```bash
DEBUG=* npm start
```

## Error Handling

The server includes comprehensive error handling:

- Graceful dependency loading
- Fallback functions for failed modules
- Socket.IO error handling
- File upload error handling
- Process error handling

## Logging

Uses Winston for structured logging:

- Info: Server startup, connections
- Error: API failures, crashes
- Debug: Detailed operation logs

## Security

- CORS configuration for frontend domains
- File upload validation
- Secure file deletion
- Environment variable protection

## Performance

- Audio file cleanup after playback
- Efficient vector search with Pinecone
- Optimized Socket.IO configuration
- Memory management for large files

## Troubleshooting

### Common Issues

1. **Module Loading Errors**
   - Check all dependencies are installed
   - Verify environment variables are set
   - Check file paths and permissions

2. **API Connection Issues**
   - Verify API keys are correct
   - Check network connectivity
   - Review API rate limits

3. **Audio Processing Issues**
   - Ensure FFmpeg is available
   - Check file format support
   - Verify Whisper model availability

### Debug Commands

```bash
# Check server health
curl http://localhost:3000/health

# Test Socket.IO connection
# Use browser console or Socket.IO client

# Check logs
# View Railway/Heroku logs
```
