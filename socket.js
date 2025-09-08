const path = require('path');
const { searchVectors } = require('./services/pinecone');
const { generateReply, synthesizeSpeech } = require('./services/openai');
const logger = require('./utils/logger');

async function getSemanticResponse(query) {
  try {
    const contextResults = await searchVectors(query);
    logger.info(`Pinecone results: ${contextResults.length}`);
//console.log(contextResults,10);

   const contextText = contextResults.map(r => r.metadata?.text || '').join('\n');

  
    const finalPrompt = `You are a kind and generous chatbot.\nContext:\n${contextText}\nUser: ${query}`;


    const reply = await generateReply(finalPrompt);
    const text = reply || fallbackMessage();

    // Generate speech for the reply and return audio URL
    //make it under if condition
    const uploadsDir = path.join(__dirname, 'uploads');
    let audioUrl = null;
    try {
      const tts = await synthesizeSpeech(text, uploadsDir, 'bot-reply');
      if (tts && tts.filename) {
        audioUrl = `/uploads/${tts.filename}`;
      }
    } catch (ttsErr) {
      logger.error('TTS generation error', ttsErr);
    }

    return { text, audioUrl };
    //return "bye";
  } catch (err) {
    logger.error('Error in semantic response:', err);
    return fallbackMessage();
  }
}

function fallbackMessage() {
  return "I'm really sorry, I couldn’t find the perfect answer right now — but I'm here if you'd like to try again!";
}

module.exports = { getSemanticResponse };