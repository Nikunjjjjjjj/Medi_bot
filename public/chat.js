// Configuration - Update this with your backend URL
const BACKEND_URL = 'https://medibot-production-03a5.up.railway.app';

// Initialize Socket.IO connection to your deployed backend
const socket = io(BACKEND_URL);

// DOM elements - initialized after DOM is loaded
let input, chat, fileInput, statusEl, micButton;

// Recording state
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// Initialize DOM elements when page loads
document.addEventListener('DOMContentLoaded', function() {
  input = document.getElementById('msgInput');
  chat = document.getElementById('chat');
  fileInput = document.getElementById('fileInput');
  statusEl = document.getElementById('status');
  micButton = document.querySelector('.mic-button');
  
  // Add connection status indicator
  addConnectionStatus();
});

// Add connection status to the page
function addConnectionStatus() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'connectionStatus';
  statusDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; border-radius: 5px; font-size: 12px; z-index: 1000;';
  document.body.appendChild(statusDiv);
  
  // Update connection status
  socket.on('connect', () => {
    statusDiv.textContent = '🟢 Connected';
    statusDiv.style.backgroundColor = '#d4edda';
    statusDiv.style.color = '#155724';
  });
  
  socket.on('disconnect', () => {
    statusDiv.textContent = '🔴 Disconnected';
    statusDiv.style.backgroundColor = '#f8d7da';
    statusDiv.style.color = '#721c24';
  });
  
  socket.on('connect_error', () => {
    statusDiv.textContent = '⚠️ Connection Error';
    statusDiv.style.backgroundColor = '#fff3cd';
    statusDiv.style.color = '#856404';
  });
}

function sendMessage() {
  const msg = input.value;
  appendMessage('You', msg);
  socket.emit('userMessage', msg);
  input.value = '';
}

socket.on('botResponse', data => {
  if (typeof data === 'string') {
    appendMessage('Bot', data);
    return;
  }
  const text = data?.text || '';
  const audioUrl = data?.audioUrl || null;
  appendMessage('Bot', text);
  if (audioUrl) {
    playBotAudio(audioUrl);
  }
});

function appendMessage(sender, msg) {
  let displayText = '';
  if (typeof msg === 'string') {
    displayText = msg;
  } else if (msg && typeof msg === 'object') {
    displayText = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg);
  } else {
    displayText = String(msg ?? '');
  }
  const el = document.createElement('div');
  el.textContent = `${sender}: ${displayText}`;
  chat.appendChild(el);
}

function playBotAudio(url) {
  try {
    const audio = new Audio(url);
    
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
      const link = document.createElement('a');
      link.href = url;
      link.textContent = 'Play bot audio';
      link.target = '_blank';
      link.onclick = () => {
        // Also delete when user clicks the link
        setTimeout(() => {
          const filename = url.split('/').pop();
          fetch(`${BACKEND_URL}/uploads/${filename}`, { method: 'DELETE' })
            .then(response => {
              if (response.ok) {
                console.log('Audio file deleted after manual play');
              }
            })
            .catch(err => console.warn('Failed to delete audio file:', err));
        }, 5000); // Delete after 5 seconds (assuming audio is short)
      };
      const wrap = document.createElement('div');
      wrap.appendChild(link);
      chat.appendChild(wrap);
    });
  } catch (err) {
    console.error('Error creating audio element:', err);
  }
}

// Toggle between recording and file upload
async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    // Check if browser supports recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to file upload
      if (fileInput) fileInput.click();
      return;
    }
    
    try {
      await startRecording();
    } catch (err) {
      console.error('Recording failed:', err);
      if (statusEl) statusEl.textContent = 'Recording not supported, please upload audio file';
      // Fallback to file upload
      if (fileInput) fileInput.click();
    }
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      await sendRecordedAudio(audioBlob);
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    isRecording = true;
    
    // Update UI
    if (micButton) {
      micButton.classList.add('recording');
      micButton.textContent = '⏹️';
      micButton.title = 'Click to stop recording';
    }
    if (statusEl) statusEl.textContent = 'Recording... Click mic to stop';
    
  } catch (err) {
    console.error('Error starting recording:', err);
    throw err;
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    // Update UI
    if (micButton) {
      micButton.classList.remove('recording');
      micButton.textContent = '🎤';
      micButton.title = 'Click to record or upload audio';
    }
    if (statusEl) statusEl.textContent = 'Processing audio...';
  }
}

async function sendRecordedAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const res = await fetch(`${BACKEND_URL}/upload-audio`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Transcription failed');
    }

    const text = data?.transcription || '';
    if (text) {
      appendMessage('You (recorded)', text);
      socket.emit('userMessage', text);
    } else {
      appendMessage('System', 'No transcription received.');
    }
  } catch (err) {
    console.error(err);
    appendMessage('Error', err.message || 'Audio processing failed');
  } finally {
    if (statusEl) statusEl.textContent = '';
  }
}

// Handle audio file upload and send for transcription
async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    if (statusEl) statusEl.textContent = 'Uploading audio…';
    const formData = new FormData();
    formData.append('audio', file);

    const res = await fetch(`${BACKEND_URL}/upload-audio`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Transcription failed');
    }

    const text = data?.transcription || '';
    if (text) {
      appendMessage('You (transcribed)', text);
      socket.emit('userMessage', text);
    } else {
      appendMessage('System', 'No transcription received.');
    }
  } catch (err) {
    console.error(err);
    appendMessage('Error', err.message || 'Audio upload failed');
  } finally {
    if (statusEl) statusEl.textContent = '';
    // reset the input so same file can be re-selected
    event.target.value = '';
  }
}

// Expose functions for inline handlers
window.sendMessage = sendMessage;
window.toggleRecording = toggleRecording;
window.handleFileUpload = handleFileUpload;

// Add error handling for Socket.IO connection
socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
  if (statusEl) {
    statusEl.textContent = 'Connection error. Please check if backend is running.';
    statusEl.style.color = 'red';
  }
});

// Add error handling for bot responses
socket.on('error', (error) => {
  console.error('Socket.IO error:', error);
  appendMessage('Error', 'Connection error occurred');
});