const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function getEmbedding(text) {
  const res = await axios.post('https://api.openai.com/v1/embeddings', {
    input: text,
    model: 'text-embedding-ada-002',
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    }
  });
  return res.data.data[0].embedding;
}

async function generateReply(prompt) {
  try {    
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    });
    const reply = res.data.choices?.[0]?.message?.content;
    logger.info(`OpenAI reply: ${reply}`);
    return reply;
  } catch (err) {
    logger.error('OpenAI generation failed', err);
    return null;
  }
}

module.exports = { getEmbedding, generateReply };

async function synthesizeSpeech(text, outputDir, baseName = 'reply') {
  try {
    const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
    const voice = process.env.TTS_VOICE || 'alloy';

    const res = await axios.post('https://api.openai.com/v1/audio/speech', {
      model,
      voice,
      input: text,
      format: 'mp3'
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const timestamp = Date.now();
    const filename = `${baseName}-${timestamp}.mp3`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data));
    return { filePath, filename };
  } catch (err) {
    logger.error('TTS synthesis failed', err);
    return null;
  }
}

module.exports.synthesizeSpeech = synthesizeSpeech;