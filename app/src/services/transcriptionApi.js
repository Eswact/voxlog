import { File as FSFile, UploadType } from 'expo-file-system';

let whisperUrl = 'http://localhost:8080';

export const getWhisperUrl = () => whisperUrl;
export const setWhisperUrl = (url) => { whisperUrl = url.replace(/\/$/, ''); };

export async function sendAudioChunk(uri, lang, sessionId) {
  const params = new URLSearchParams();
  if (lang) params.set('lang', lang);
  if (sessionId) params.set('session', sessionId);
  const qs = params.toString();
  const url = `${whisperUrl}/transcribe${qs ? `?${qs}` : ''}`;
  const result = await new FSFile(uri).upload(url, {
    uploadType: UploadType.MULTIPART,
    fieldName: 'audio',
    mimeType: 'audio/m4a',
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`HTTP ${result.status}`);
  }
  return JSON.parse(result.body);
}

export async function checkHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(`${whisperUrl}/health`, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  } finally {
    clearTimeout(timer);
  }
}
