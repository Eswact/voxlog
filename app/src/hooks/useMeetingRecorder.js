import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder, useAudioRecorderState,
  AudioModule, RecordingPresets,
} from 'expo-audio';
import {
  SILENCE_THRESHOLD_DB, SILENCE_DURATION_MS,
  MIN_CHUNK_MS, MAX_CHUNK_MS,
} from '../constants/config';
import { sendAudioChunk, checkHealth } from '../services/transcriptionApi';
import { t } from '../constants/i18n';

export function useMeetingRecorder({ onBubble, lang }) {
  const audioRecorder = useAudioRecorder(
    { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true },
  );
  const exportRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY });
  const recorderState = useAudioRecorderState(audioRecorder, 100);
  const exportActiveRef = useRef(false);
  const exportUriRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);

  const allChunkUrisRef = useRef([]);
  const isRecordingRef = useRef(false);
  const chunkStartTimeRef = useRef(0);
  const sessionStartRef = useRef(0);
  const silenceStartRef = useRef(null);
  const pendingSendRef = useRef(false);
  const meteringRef = useRef(-160);
  const triggerChunkRef = useRef(null);
  const sessionIdRef = useRef(null);
  const activeTokenRef = useRef(0);
  const langRef = useRef(lang);
  const uploadQueueRef = useRef([]);
  const isUploadingRef = useRef(false);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { meteringRef.current = recorderState.metering ?? -160; }, [recorderState.metering]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setTotalDuration(Date.now() - sessionStartRef.current), 500);
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      if (!isRecordingRef.current || !triggerChunkRef.current) return;
      const db = meteringRef.current;
      const now = Date.now();
      const chunkAge = now - chunkStartTimeRef.current;
      if (chunkAge >= MAX_CHUNK_MS && !pendingSendRef.current) {
        triggerChunkRef.current();
        return;
      }
      if (db < SILENCE_THRESHOLD_DB) {
        if (silenceStartRef.current === null) silenceStartRef.current = now;
        if ((now - silenceStartRef.current) >= SILENCE_DURATION_MS
            && !pendingSendRef.current && chunkAge >= MIN_CHUNK_MS) {
          triggerChunkRef.current();
        }
      } else {
        silenceStartRef.current = null;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const triggerChunk = useCallback(async () => {
    if (pendingSendRef.current || !isRecordingRef.current) return;
    pendingSendRef.current = true;
    silenceStartRef.current = null;
    let chunkUri = null;
    try {
      await audioRecorder.stop();
      chunkUri = audioRecorder.uri;
      if (chunkUri) allChunkUrisRef.current.push(chunkUri);
      if (isRecordingRef.current) {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        chunkStartTimeRef.current = Date.now();
      }
    } catch (e) {
      console.warn('Chunk error:', e);
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        setIsRecording(false);
        showError(t(langRef.current, 'recordCut'));
      }
    } finally {
      pendingSendRef.current = false;
    }
    if (chunkUri) sendChunk(chunkUri, activeTokenRef.current);
  }, [audioRecorder]);

  useEffect(() => { triggerChunkRef.current = triggerChunk; }, [triggerChunk]);

  const processUploadQueue = async () => {
    if (isUploadingRef.current || uploadQueueRef.current.length === 0) return;
    isUploadingRef.current = true;
    const { uri, token } = uploadQueueRef.current.shift();
    try {
      const data = await sendAudioChunk(uri, langRef.current, sessionIdRef.current);
      if (token !== activeTokenRef.current) return;
      if (data.text?.trim().length > 1) onBubble(data.text.trim(), data.speaker || null);
    } catch (e) {
      if (token !== activeTokenRef.current) return;
      console.warn('Whisper error:', e.message);
      showError(`${t(langRef.current, 'serverError')}: ${e.message}`);
    } finally {
      isUploadingRef.current = false;
      setIsSending(uploadQueueRef.current.length > 0);
      processUploadQueue();
    }
  };

  const sendChunk = (uri, token) => {
    uploadQueueRef.current.push({ uri, token });
    setIsSending(true);
    processUploadQueue();
  };

  const start = async () => {
    setIsStarting(true);
    setError('');
    try {
      try {
        await checkHealth();
      } catch (_) {
        Alert.alert(
          t(langRef.current, 'cannotConnectTitle'),
          t(langRef.current, 'cannotConnectMsg'),
        );
        return;
      }
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t(langRef.current, 'micPermTitle'),
          t(langRef.current, 'micPermMsg'),
        );
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      activeTokenRef.current += 1;
      allChunkUrisRef.current = [];
      sessionIdRef.current = `mtg_${Date.now()}`;
      isRecordingRef.current = true;
      pendingSendRef.current = false;
      silenceStartRef.current = null;
      chunkStartTimeRef.current = Date.now();
      sessionStartRef.current = Date.now();
      exportActiveRef.current = false;
      exportUriRef.current = null;
      setTotalDuration(0);
      try {
        try {
          await exportRecorder.prepareToRecordAsync();
          exportRecorder.record();
          exportActiveRef.current = true;
        } catch (exportErr) {
          console.warn('Export recorder unavailable, falling back to chunk join:', exportErr?.message);
          exportActiveRef.current = false;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
      } catch (e) {
        isRecordingRef.current = false;
        if (exportActiveRef.current) {
          try { await exportRecorder.stop(); } catch (_) {}
          exportActiveRef.current = false;
        }
        showError(`${t(langRef.current, 'cannotStart')}: ${e.message}`);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const stop = async () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    pendingSendRef.current = false;
    silenceStartRef.current = null;
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        allChunkUrisRef.current.push(uri);
        sendChunk(uri, activeTokenRef.current);
      }
    } catch (_) {}
    if (exportActiveRef.current) {
      try {
        await exportRecorder.stop();
        exportUriRef.current = exportRecorder.uri ?? null;
      } catch (e) {
        console.warn('Export recorder stop failed:', e?.message);
        exportUriRef.current = null;
      }
      exportActiveRef.current = false;
    }
    return {
      chunkUris: [...allChunkUrisRef.current],
      exportUri: exportUriRef.current,
    };
  };

  return {
    start,
    stop,
    isRecording,
    isStarting,
    isSending,
    error,
    totalDuration,
    metering: recorderState.metering ?? -160,
  };
}
