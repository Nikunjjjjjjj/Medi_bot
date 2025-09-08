const socket = io();
const input = document.getElementById('msgInput');
const chat = document.getElementById('chat');
const fileInput = document.getElementById('fileInput');
const statusEl = document.getElementById('status');
const micButton = document.querySelector('.mic-button');

// Recording state
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

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
      fetch(`/uploads/${filename}`, { method: 'DELETE' })
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
          fetch(`/uploads/${filename}`, { method: 'DELETE' })
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

    const res = await fetch('/upload-audio', {
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

    const res = await fetch('/upload-audio', {
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

// expose for inline handlers
window.toggleRecording = toggleRecording;
window.handleFileUpload = handleFileUpload;