import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useT } from '../constants/ThemeContext';
import { formatDuration } from '../utils/format';

export function RecordingIndicator({ totalDuration }) {
  const { styles } = useT();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.15, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.recBadge}>
      <Animated.View style={[styles.recDot, { opacity: pulse }]} />
      <Text style={styles.recTime}>{formatDuration(totalDuration)}</Text>
    </View>
  );
}
