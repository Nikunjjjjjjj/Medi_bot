const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
let nodejsWhisperModule = null; // lazy-loaded to avoid build attempts on startup
const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

// Ensure ffmpeg binary path is set (works well on Windows via ffmpeg-static)
if (ffmpegStatic) {
	ffmpeg.setFfmpegPath(ffmpegStatic);
}

async function convertToWav16kMono(inputFilePath) {
	const outputFilePath = path.join(
		path.dirname(inputFilePath),
		`${path.basename(inputFilePath, path.extname(inputFilePath))}.wav`
	);

	await new Promise((resolve, reject) => {
		ffmpeg(inputFilePath)
			.toFormat('wav')
			.audioFrequency(16000)
			.audioChannels(1)
			.on('end', resolve)
			.on('error', reject)
			.save(outputFilePath);
	});

	return outputFilePath;
}

async function transcribeAudio(inputFilePath) {
	let wavPath;
	try {
		logger.info(`Converting audio: ${inputFilePath}`);
		wavPath = await convertToWav16kMono(inputFilePath);
		logger.info(`Transcribing audio: ${wavPath}`);

		// Primary: nodejs-whisper (requires model; may attempt native build on some envs)
		try {
			const transcriptLocal = await transcribeWithNodejsWhisper(wavPath);
			if (transcriptLocal && transcriptLocal.trim().length > 0) {
				return transcriptLocal;
			}
			throw new Error('Empty transcript from nodejs-whisper');
		} catch (localErr) {
			logger.error('nodejs-whisper failed, falling back to OpenAI API', localErr);
			// Fallback: OpenAI transcription API
			const transcriptRemote = await transcribeWithOpenAI(wavPath);
			return transcriptRemote;
		}
	} catch (err) {
		logger.error('Audio transcription error', err);
		throw err;
	} finally {
		// Best-effort cleanup
		try { await fsp.unlink(inputFilePath); } catch (_) {}
		if (wavPath) {
			try { await fsp.unlink(wavPath); } catch (_) {}
		}
	}
}

async function transcribeWithNodejsWhisper(audioFilePath) {
	console.log("transcribeWithNodejsWhisper start",audioFilePath,68)
	if (!nodejsWhisperModule) {
		try {
			nodejsWhisperModule = require('nodejs-whisper');
		} catch (e) {
			throw new Error('nodejs-whisper not installed');
		}
	}

	const { nodewhisper } = nodejsWhisperModule;
	const modelName = process.env.WHISPER_MODEL || 'base.en';

	await nodewhisper(audioFilePath, {
		modelName,
		autoDownloadModelName: modelName,
		verbose: false,
		removeWavFileAfterTranscription: false,
		withCuda: false,
		whisperOptions: {
			outputInText: true,
			outputInSrt: false,
			outputInJson: false,
			outputInJsonFull: false,
			outputInVtt: false,
			outputInCsv: false,
			outputInWords: false,
			translateToEnglish: false,
			wordTimestamps: false,
		},
	});

	const dir = path.dirname(audioFilePath);
	const base = path.basename(audioFilePath, path.extname(audioFilePath));
	const candidate1 = path.join(dir, `${base}.txt`);
	const candidate2 = `${audioFilePath}.txt`;

	let transcriptPath = null;
	if (fs.existsSync(candidate1)) transcriptPath = candidate1;
	else if (fs.existsSync(candidate2)) transcriptPath = candidate2;

	if (!transcriptPath) {
		throw new Error('nodejs-whisper did not produce a .txt transcript');
	}

	const text = await fsp.readFile(transcriptPath, 'utf-8');
	try { await fsp.unlink(transcriptPath); } catch (_) {}
	console.log("transcribeWithNodejsWhisper end",text,114);
	return text;
}

async function transcribeWithOpenAI(audioFilePath) {
	if (!process.env.OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY not set for fallback transcription');
	}
	const form = new FormData();
	form.append('file', fs.createReadStream(audioFilePath));
	form.append('model', 'whisper-1');
	// Optionally: form.append('response_format', 'json');

	const res = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
		headers: {
			...form.getHeaders(),
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		maxContentLength: Infinity,
		maxBodyLength: Infinity,
	});
	return res.data?.text || '';
}

module.exports = { transcribeAudio };


