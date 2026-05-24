# VoxLog

Real-time meeting transcription app built with Expo (React Native) and a local Python/FastAPI backend powered by [faster-whisper](https://github.com/SYSTRAN/faster-whisper). No cloud dependency — everything runs on your own machine.

## How it works

The app records audio and splits it into chunks based on silence detection. Each chunk is sent to the local server, transcribed with OpenAI's Whisper model, and displayed as a timestamped bubble. Transcription continues in the background even while recording.

## Features

- Real-time speech-to-text with silence-based chunking
- Turkish and English language support
- Export transcript as `.txt` or full meeting audio as `.m4a`
- Fully local — no API keys, no internet required

## Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo (React Native) |
| Backend | Python, FastAPI, uvicorn |
| STT model | faster-whisper (`medium`, int8 CPU) |
| Audio joining | PyAV (no external ffmpeg needed) |

## Setup

**Server**
```bash
cd server
pip install -r requirements.txt
python main.py
```

**App** (set server URL to your machine's local IP in the app settings)
```bash
cd app
npx expo run:android
```

## Configuration

Edit `server/.env` to change the model or language:

```
WHISPER_MODEL=medium   # tiny / base / small / medium / large-v3
PORT=8080
```
