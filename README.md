# VoxLog

Real-time meeting transcription app built with Expo (React Native) and a local Python/FastAPI backend powered by [faster-whisper](https://github.com/SYSTRAN/faster-whisper). No cloud dependency — everything runs on your own machine.

## How it works

The app records audio continuously and splits it into chunks whenever silence is detected. Each chunk is sent over HTTP to the local FastAPI server, where faster-whisper transcribes it. Results come back as timestamped text bubbles and are appended to the transcript in real time. Multiple chunks can be in flight simultaneously so transcription keeps up with speech without blocking the recording.

## Features

- Real-time speech-to-text with silence-based chunking
- Turkish and English language support
- Timestamped transcript bubbles for easy review
- Export transcript as `.txt` or full meeting audio as `.m4a`
- Audio chunks are joined server-side with PyAV — no ffmpeg install needed
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
npm install
npx expo run:android
```

> The server is best run inside WSL or a Linux environment. The app connects to it over your local network, so make sure both are on the same Wi-Fi or the WSL port is forwarded to your host IP.

## Configuration

Edit `server/.env` to change the model or language:

```
WHISPER_MODEL=medium   # tiny / base / small / medium / large-v3
PORT=8080
```
