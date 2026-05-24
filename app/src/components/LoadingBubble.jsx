import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useT } from '../constants/ThemeContext';

export function LoadingBubble() {
  const { styles } = useT();
  const dotAnims = useRef([
    new Animated.Value(0.2),
    new Animated.Value(0.2),
    new Animated.Value(0.2),
  ]).current;

  useEffect(() => {
    const anims = dotAnims.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(d, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0.2, duration: 360, useNativeDriver: true }),
        Animated.delay((2 - i) * 160),
      ]))
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.bubble}>
      <View style={[styles.bubbleAccent, styles.loadingAccent]} />
      <View style={styles.loadingDots}>
        {dotAnims.map((anim, i) => (
          <Animated.View key={i} style={[styles.loadingDot, { opacity: anim }]} />
        ))}
      </View>
    </View>
  );
}
