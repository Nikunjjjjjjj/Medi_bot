import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

function App() {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDedicatedRecording, setIsDedicatedRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Refs
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dedicatedRecorderRef = useRef(null);
  const dedicatedAudioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['polling', 'websocket']
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to backend');
    });

    socketRef.current.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from backend');
    });

    socketRef.current.on('connect_error', (error) => {
      setConnectionStatus('error');
      console.error('Connection error:', error);
      setStatus('Connection error. Please check if backend is running.');
    });

    // Bot response handler
    socketRef.current.on('botResponse', (data) => {
      let displayText = '';
      let audioUrl = null;

      if (typeof data === 'string') {
        displayText = data;
      } else if (data && typeof data === 'object') {
        displayText = data.text || '';
        audioUrl = data.audioUrl || null;
      }

      addMessage('Bot', displayText);
      
      if (audioUrl) {
        playBotAudio(audioUrl);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Add message to chat
  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Send text message
  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage('You', inputMessage);
    socketRef.current.emit('userMessage', inputMessage);
    setInputMessage('');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('Microphone access granted, creating MediaRecorder...');
      
      // Try different MIME types for better browser compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
          }
        }
      }
      
      console.log('Using MIME type:', mimeType);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        await sendRecordedAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setStatus('Recording error occurred');
        setIsRecording(false);
      };

      // Start recording with time slices
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setStatus('Recording... Click mic to stop');
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Error starting recording:', err);
      setStatus('Recording not supported, please upload audio file');
      setIsRecording(false);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing audio...');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Check if browser supports recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to file upload
        fileInputRef.current?.click();
        return;
      }
      startRecording();
    }
  };

  // Dedicated Recording Functions (Start/Stop Button)
  const startDedicatedRecording = async () => {
    try {
      console.log('Starting dedicated recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Try different MIME types for better browser compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
          }
        }
      }
      
      console.log('Dedicated recording using MIME type:', mimeType);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      dedicatedRecorderRef.current = mediaRecorder;
      dedicatedAudioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Dedicated recording data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          dedicatedAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Dedicated recording stopped, processing audio...');
        const audioBlob = new Blob(dedicatedAudioChunksRef.current, { type: mimeType });
        console.log('Dedicated recording blob created:', audioBlob.size, 'bytes');
        await sendRecordedAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('Dedicated recording error:', event.error);
        setStatus('Recording error occurred');
        setIsDedicatedRecording(false);
      };

      // Start recording with time slices
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsDedicatedRecording(true);
      setStatus('Recording... Click Record button to stop');
      console.log('Dedicated recording started successfully');
    } catch (err) {
      console.error('Error starting dedicated recording:', err);
      setStatus('Recording not supported');
      setIsDedicatedRecording(false);
    }
  };

  const stopDedicatedRecording = () => {
    if (dedicatedRecorderRef.current && isDedicatedRecording) {
      console.log('Stopping dedicated recording...');
      dedicatedRecorderRef.current.stop();
      setIsDedicatedRecording(false);
      setStatus('Processing audio...');
    }
  };

  const handleDedicatedRecordClick = () => {
    if (isDedicatedRecording) {
      stopDedicatedRecording();
    } else {
      // Check if browser supports recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('Recording not supported in this browser');
        return;
      }
      startDedicatedRecording();
    }
  };

  // Send recorded audio to backend
  const sendRecordedAudio = async (audioBlob) => {
    try {
      console.log('Sending audio to backend:', audioBlob.size, 'bytes, type:', audioBlob.type);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${BACKEND_URL}/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);

      if (!response.ok) {
        throw new Error(data?.error || 'Transcription failed');
      }

      const text = data?.transcription || '';
      if (text) {
        console.log('Transcription received:', text);
        addMessage('You (recorded)', text);
        socketRef.current.emit('userMessage', text);
      } else {
        console.log('No transcription received');
        addMessage('System', 'No transcription received.');
      }
    } catch (err) {
      console.error('Error sending audio:', err);
      addMessage('Error', err.message || 'Audio processing failed');
    } finally {
      setStatus('');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Uploading audio…');
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${BACKEND_URL}/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Transcription failed');
      }

      const text = data?.transcription || '';
      if (text) {
        addMessage('You (transcribed)', text);
        socketRef.current.emit('userMessage', text);
      } else {
        addMessage('System', 'No transcription received.');
      }
    } catch (err) {
      console.error(err);
      addMessage('Error', err.message || 'Audio upload failed');
    } finally {
      setStatus('');
      // Reset the input so same file can be re-selected
      event.target.value = '';
    }
  };

  // Play bot audio
  const playBotAudio = (url) => {
    try {
      // Ensure the audio URL is absolute (includes backend URL)
      const audioUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
      const audio = new Audio(audioUrl);
      
      // Delete audio file after playback completes
      audio.addEventListener('ended', () => {
        console.log('Audio playback ended, deleting file:', url);
        const filename = url.split('/').pop();
        fetch(`${BACKEND_URL}/uploads/${filename}`, { method: 'DELETE' })
          .then(response => {
            if (response.ok) {
              console.log('Audio file deleted successfully');
            } else {
              console.warn('Failed to delete audio file:', response.status);
            }
          })
          .catch(err => console.warn('Failed to delete audio file:', err));
      });
      
      audio.play().catch(() => {
        console.log('Autoplay blocked, creating fallback link');
        addMessage('System', `Audio response available: ${audioUrl}`);
      });
    } catch (err) {
      console.error('Error creating audio element:', err);
    }
  };

  return (
    <div className="App">
      {/* Connection Status */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' && '🟢 Connected'}
        {connectionStatus === 'disconnected' && '🔴 Disconnected'}
        {connectionStatus === 'error' && '⚠️ Connection Error'}
      </div>

      {/* Header */}
      <header className="app-header">
        <h1>Ask Me Anything 🤖</h1>
      </header>

      {/* Chat Messages */}
      <div className="chat-container" ref={chatRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender.toLowerCase()}`}>
            <div className="message-header">
              <span className="sender">{message.sender}</span>
              <span className="timestamp">{message.timestamp}</span>
            </div>
            <div className="message-content">{message.text}</div>
          </div>
        ))}
      </div>

      {/* Input Container */}
      <div className="input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="message-input"
        />
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          title="Click to record or upload audio"
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        <button
          className={`record-button ${isDedicatedRecording ? 'recording' : ''}`}
          onClick={handleDedicatedRecordClick}
          title={isDedicatedRecording ? "Click to stop recording" : "Click to start recording"}
        >
          {isDedicatedRecording ? '⏹️ Stop' : '🔴 Record'}
        </button>
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*,.mp3"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Status */}
      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default App;
