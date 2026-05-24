import { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { useT } from '../constants/ThemeContext';

const BAR_COUNT = 20;
const MIN_DB = -60;
const MAX_DB = -10;

function dbToHeight(db) {
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

export function WaveformBar({ metering }) {
  const { C } = useT();
  const bars = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.05))).current;
  const historyRef = useRef(Array(BAR_COUNT).fill(0.05));

  useEffect(() => {
    const level = dbToHeight(metering ?? -60);
    historyRef.current = [...historyRef.current.slice(1), level];
    historyRef.current.forEach((h, i) => {
      Animated.spring(bars[i], {
        toValue: Math.max(0.05, h),
        useNativeDriver: false,
        speed: 40,
        bounciness: 0,
      }).start();
    });
  }, [metering]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 28 }}>
      {bars.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: C.accentRed,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [3, 28],
            }),
            opacity: 0.6 + 0.4 * (i / BAR_COUNT),
          }}
        />
      ))}
    </View>
  );
}
