import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioModule } from 'expo-audio';
import { useT } from '../constants/ThemeContext';
import { useMeetingRecorder } from '../hooks/useMeetingRecorder';
import { Bubble } from '../components/Bubble';
import { LoadingBubble } from '../components/LoadingBubble';
import { RecordingIndicator } from '../components/RecordingIndicator';
import { WaveformBar } from '../components/WaveformBar';
import { exportTxt, exportAudio } from '../services/exportService';
import { getWhisperUrl, setWhisperUrl } from '../services/transcriptionApi';
import { formatTime, todayDate, todayDay } from '../utils/format';
import { t } from '../constants/i18n';

export function MeetingScreen({ isDark, toggleTheme, lang, toggleLang }) {
  const { C, styles } = useT();
  const scrollRef = useRef(null);
  const chunkUrisRef = useRef([]);
  const exportUriRef = useRef(null);

  const [bubbles, setBubbles] = useState([]);
  const [hasChunks, setHasChunks] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState(todayDate);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [serverUrl, setServerUrl] = useState(getWhisperUrl());
  const [editingServer, setEditingServer] = useState(false);
  const [draftServerUrl, setDraftServerUrl] = useState('');

  const startEdit = () => { setDraftTitle(meetingTitle); setEditingTitle(true); };
  const finishEdit = () => { if (draftTitle.trim()) setMeetingTitle(draftTitle.trim()); setEditingTitle(false); };

  const openServerEdit = () => { setDraftServerUrl(serverUrl); setEditingServer(true); };
  const saveServerUrl = () => {
    const url = draftServerUrl.trim().replace(/\/$/, '');
    if (url) { setWhisperUrl(url); setServerUrl(url); }
    setEditingServer(false);
  };

  const onBubble = useCallback((text, speaker) => {
    setBubbles((prev) => [...prev, { text, time: formatTime(new Date()), id: Date.now(), speaker }]);
  }, []);

  const recorder = useMeetingRecorder({ onBubble, lang });

  useEffect(() => { AudioModule.requestRecordingPermissionsAsync(); }, []);

  const handleStart = async () => {
    setBubbles([]);
    chunkUrisRef.current = [];
    exportUriRef.current = null;
    setHasChunks(false);
    await recorder.start();
  };

  const handleStop = async () => {
    const { chunkUris, exportUri } = await recorder.stop();
    chunkUrisRef.current = chunkUris;
    exportUriRef.current = exportUri;
    setHasChunks(chunkUris.length > 0);
  };

  const handleClear = () => Alert.alert(
    t(lang, 'clearTitle'),
    t(lang, 'clearMsg'),
    [
      { text: t(lang, 'cancel'), style: 'cancel' },
      {
        text: t(lang, 'clearConfirm'),
        style: 'destructive',
        onPress: () => {
          setBubbles([]);
          chunkUrisRef.current = [];
          exportUriRef.current = null;
          setHasChunks(false);
        },
      },
    ],
  );

  useEffect(() => {
    if (bubbles.length > 0 || recorder.isSending || recorder.isRecording)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [bubbles.length, recorder.isSending, recorder.isRecording]);

  const totalWords = bubbles.reduce((n, b) => n + b.text.split(/\s+/).length, 0);
  const showEmpty = bubbles.length === 0 && !recorder.isSending && !recorder.isRecording;
  const hasContent = bubbles.length > 0 || hasChunks;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style={C.bar} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={editingTitle ? undefined : startEdit} activeOpacity={0.7}>
          {editingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={draftTitle}
              onChangeText={setDraftTitle}
              onBlur={finishEdit}
              onSubmitEditing={finishEdit}
              autoFocus
              returnKeyType="done"
              selectTextOnFocus
            />
          ) : (
            <>
              <Text style={styles.titleDate}>{meetingTitle}</Text>
              <Text style={styles.titleDay}>{todayDay()}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {(recorder.isSending || isExporting) && !recorder.isRecording && (
            <ActivityIndicator size="small" color={C.accent} />
          )}
          {recorder.isRecording && (
            <>
              <WaveformBar metering={recorder.metering} />
              <RecordingIndicator totalDuration={recorder.totalDuration} />
            </>
          )}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={toggleLang}
            disabled={recorder.isRecording}
            activeOpacity={0.7}
          >
            <Text style={styles.langBtnText}>{lang.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} activeOpacity={0.7}>
            <View style={styles.themeBtnIcon}>
              <View style={styles.themeBtnHalf} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {bubbles.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>{bubbles.length} {t(lang, 'segments')}</Text>
          <Text style={styles.statsSep}>·</Text>
          <Text style={styles.statsText}>~{totalWords} {t(lang, 'words')}</Text>
        </View>
      )}

      {!!recorder.error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{recorder.error}</Text>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {showEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t(lang, 'ready')}</Text>
            <Text style={styles.emptyHint}>{t(lang, 'hint')}</Text>
            <TouchableOpacity style={styles.emptyServer} onPress={openServerEdit} activeOpacity={0.7}>
              <Text style={styles.emptyLabel}>{t(lang, 'server')}</Text>
              <Text style={styles.emptyValue}>{serverUrl}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {bubbles.map((b, i) => <Bubble key={b.id} text={b.text} time={b.time} index={i} speaker={b.speaker} />)}
            {(recorder.isRecording || recorder.isSending) && <LoadingBubble />}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, !bubbles.length && styles.btnDisabled]}
            onPress={() => exportTxt(bubbles, meetingTitle)}
            disabled={!bubbles.length}
          >
            <Text style={styles.actionBtnText}>TXT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, (!hasChunks || isExporting) && styles.btnDisabled]}
            onPress={() => exportAudio(chunkUrisRef.current, meetingTitle, () => setIsExporting(true), () => setIsExporting(false), exportUriRef.current)}
            disabled={!hasChunks || isExporting}
          >
            <Text style={styles.actionBtnText}>{t(lang, 'audioBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger, !hasContent && styles.btnDisabled]}
            onPress={handleClear}
            disabled={!hasContent}
          >
            <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>{t(lang, 'deleteBtn')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.recordBtn, recorder.isRecording && styles.recordBtnActive, recorder.isStarting && styles.btnDisabled]}
          onPress={recorder.isRecording ? handleStop : handleStart}
          activeOpacity={0.88}
          disabled={recorder.isStarting}
        >
          <View style={styles.recordBtnRow}>
            {recorder.isStarting
              ? <ActivityIndicator size="small" color="#fff" />
              : recorder.isRecording
                ? <View style={styles.stopSquare} />
                : <View style={styles.recCircle} />}
            <Text style={styles.recordBtnText}>
              {recorder.isStarting
                ? t(lang, 'starting')
                : recorder.isRecording
                  ? t(lang, 'stopRecording')
                  : t(lang, 'startRecording')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={editingServer} transparent animationType="fade" onRequestClose={() => setEditingServer(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t(lang, 'serverAddress')}</Text>
            <TextInput
              style={styles.modalInput}
              value={draftServerUrl}
              onChangeText={setDraftServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={saveServerUrl}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setEditingServer(false)}>
                <Text style={styles.modalBtnText}>{t(lang, 'cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveServerUrl}>
                <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>{t(lang, 'save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
