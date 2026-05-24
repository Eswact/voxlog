import { Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { File as FSFile, UploadType } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';
import { toFilename } from '../utils/format';
import { getWhisperUrl } from './transcriptionApi';

export async function exportTxt(bubbles, meetingTitle) {
  if (!bubbles.length) return;
  const content = bubbles.map((b, i) => `[${i + 1}] ${b.time}\n${b.text}`).join('\n\n');
  try {
    await Share.share({ message: content, title: meetingTitle });
  } catch (e) {
    Alert.alert('Hata', e.message);
  }
}

async function saveToMediaLibrary(uri) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Medya kütüphanesi izni verilmedi.');
  await MediaLibrary.createAssetAsync(uri);
}

export async function exportAudio(chunkUris, meetingTitle, onStart, onEnd, exportUri) {
  if (exportUri) {
    onStart?.();
    try {
      const namedPath = `${FileSystem.cacheDirectory}${toFilename(meetingTitle)}.m4a`;
      await FileSystem.copyAsync({ from: exportUri, to: namedPath });
      await saveToMediaLibrary(namedPath);
      Alert.alert('Kaydedildi', 'Ses dosyası cihazınızdaki Müzik/Audio klasörüne kaydedildi.');
    } catch (e) {
      Alert.alert('Ses export hatası', e.message);
    } finally {
      onEnd?.();
    }
    return;
  }

  if (!chunkUris.length) {
    Alert.alert('Ses yok', 'Henüz kayıt yapılmadı.');
    return;
  }
  const whisperUrl = getWhisperUrl();
  const sessionId = `ses_${Date.now()}`;
  const filename = `${toFilename(meetingTitle)}.wav`;
  onStart?.();
  try {
    for (const uri of chunkUris) {
      const result = await new FSFile(uri).upload(`${whisperUrl}/join/add?session=${sessionId}`, {
        uploadType: UploadType.MULTIPART,
        fieldName: 'audio',
        mimeType: 'audio/m4a',
      });
      if (result.status < 200 || result.status >= 300) {
        throw new Error(`Chunk yükleme hatası: HTTP ${result.status}`);
      }
    }

    const outPath = `${FileSystem.cacheDirectory}${filename}`;
    const download = await FileSystem.downloadAsync(
      `${whisperUrl}/join/result?session=${sessionId}`,
      outPath,
    );
    if (download.status !== 200) throw new Error(`Sunucu hatası: HTTP ${download.status}`);

    await saveToMediaLibrary(outPath);
    Alert.alert(
      'Kaydedildi',
      'Ses dosyası cihazınızdaki Müzik/Audio klasörüne kaydedildi.',
    );
  } catch (e) {
    Alert.alert('Ses export hatası', e.message);
  } finally {
    onEnd?.();
  }
}
