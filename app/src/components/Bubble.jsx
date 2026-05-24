import { useState } from 'react';
import { View, Text, TouchableOpacity, Clipboard, Animated } from 'react-native';
import { useT } from '../constants/ThemeContext';

const SPEAKER_COLORS = [
  '#818CF8', '#34D399', '#FB923C', '#F472B6',
  '#38BDF8', '#A78BFA', '#4ADE80', '#FBBF24',
];

function getSpeakerColor(speaker) {
  if (!speaker) return null;
  const n = parseInt(speaker.replace(/\D/g, ''), 10) || 1;
  return SPEAKER_COLORS[(n - 1) % SPEAKER_COLORS.length];
}

export function Bubble({ text, time, index, speaker }) {
  const { styles } = useT();
  const [copied, setCopied] = useState(false);
  const accentColor = getSpeakerColor(speaker);

  const handleLongPress = () => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.85} delayLongPress={400}>
      <View style={[styles.bubble, copied && styles.bubbleCopied]}>
        <View style={[styles.bubbleAccent, accentColor && { backgroundColor: accentColor }]} />
        <View style={styles.bubbleBody}>
          <View style={styles.bubbleHead}>
            <View style={styles.bubbleHeadLeft}>
              <Text style={[styles.bubbleNum, accentColor && { color: accentColor }]}>
                #{String(index + 1).padStart(2, '0')}
              </Text>
              {speaker && (
                <Text style={[styles.bubbleSpeaker, accentColor && { color: accentColor }]}>
                  {speaker}
                </Text>
              )}
            </View>
            <Text style={styles.bubbleTime}>{copied ? 'Kopyalandı' : time}</Text>
          </View>
          <Text style={styles.bubbleText}>{text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
