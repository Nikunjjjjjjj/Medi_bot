# MediBot Frontend

A React-based frontend for the MediBot AI medical chatbot application.

## Features

- 🤖 **Real-time Chat**: Socket.IO integration for instant messaging
- 🎤 **Voice Recording**: Record audio messages directly in the browser
- 📁 **File Upload**: Upload audio files for transcription
- 🔊 **Audio Playback**: Play AI-generated speech responses
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔗 **Connection Status**: Real-time connection indicator

## Tech Stack

- **React 18**: Modern React with hooks
- **Socket.IO Client**: Real-time communication
- **CSS3**: Modern styling with animations
- **Web APIs**: MediaRecorder, getUserMedia, Audio

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
REACT_APP_BACKEND_URL=https://medibot-production-03a5.up.railway.app
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App

## Deployment

### Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to Netlify

### Vercel

1. Connect your GitHub repository to Vercel
2. Set the build command: `npm run build`
3. Set the output directory: `build`

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Component styles
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Features Explained

### Real-time Communication
- Uses Socket.IO client to connect to the backend
- Handles connection status and error states
- Supports both text and audio message types

### Audio Recording
- Uses MediaRecorder API for browser-based recording
- Fallback to file upload if recording is not supported
- Automatic audio cleanup after playback

### Responsive Design
- Mobile-first approach
- Adaptive layout for different screen sizes
- Touch-friendly interface elements

## Backend Integration

The frontend connects to the backend API endpoints:

- **Socket.IO**: Real-time chat communication
- **POST /upload-audio**: Audio file transcription
- **DELETE /uploads/:filename**: Audio file cleanup

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Troubleshooting

### Connection Issues
- Check if the backend URL is correct in environment variables
- Verify the backend server is running
- Check browser console for error messages

### Audio Recording Issues
- Ensure HTTPS or localhost for microphone access
- Check browser permissions for microphone
- Try file upload as fallback

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed
