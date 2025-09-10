# MediBot - AI-Powered Medical Chatbot

A full-stack web application that provides intelligent medical assistance through text and voice interactions using OpenAI's GPT models, Pinecone vector database, and real-time communication.

## 🏗️ Project Structure

```
MediBot/
├── 📁 frontend/          # React Frontend
│   ├── src/              # React components and logic
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend documentation
├── 📁 backend/           # Node.js Backend
│   ├── services/         # AI service integrations
│   ├── utils/            # Utility functions
│   ├── uploads/          # Temporary file storage
│   ├── package.json      # Backend dependencies
│   └── README.md         # Backend documentation
└── 📁 docs/              # Project documentation
    ├── DEPLOYMENT.md     # Deployment guide
    └── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key
- Pinecone account and API key

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
cp ../env.example .env
# Edit .env with your API keys
npm start
```

## 🌟 Features

### Frontend (React)
- 🤖 **Real-time Chat**: Socket.IO integration
- 🎤 **Voice Recording**: Browser-based audio recording
- 📁 **File Upload**: Audio file transcription
- 🔊 **Audio Playback**: AI-generated speech
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔗 **Connection Status**: Real-time connection indicator

### Backend (Node.js)
- 🧠 **AI Integration**: OpenAI GPT-4 responses
- 🔍 **Vector Search**: Pinecone semantic search
- 🎤 **Speech-to-Text**: Whisper transcription
- 🔊 **Text-to-Speech**: OpenAI TTS synthesis
- 🔄 **Real-time Communication**: Socket.IO server
- 📁 **File Management**: Audio processing and cleanup

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Socket.IO Client**: Real-time communication
- **CSS3**: Modern styling and animations
- **Web APIs**: MediaRecorder, getUserMedia, Audio

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **OpenAI API**: GPT-4, Whisper, TTS
- **Pinecone**: Vector database
- **Winston**: Logging
- **Multer**: File upload handling

## 🚀 Deployment

### Option 1: Separate Deployment (Recommended)
- **Frontend**: Deploy to Netlify/Vercel
- **Backend**: Deploy to Railway/Heroku
- **Communication**: Socket.IO between services

### Option 2: Monorepo Deployment
- **Frontend**: Build and serve from backend
- **Backend**: Deploy as full-stack application
- **Communication**: Internal Socket.IO

## 📋 Environment Variables

### Frontend
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Backend
```bash
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
PINECONE_HOST=your_host_url
TTS_MODEL=tts-1
TTS_VOICE=nova
WHISPER_MODEL=base.en
NODE_ENV=production
PORT=3000
```

## 🔧 Development

### Local Development
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open http://localhost:3000

### Production Build
1. Build frontend: `cd frontend && npm run build`
2. Deploy backend with frontend build
3. Set environment variables
4. Deploy to your chosen platform

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guides

---

**MediBot** - Making medical information accessible through AI-powered conversations.