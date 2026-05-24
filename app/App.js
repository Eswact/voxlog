import { useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeCtx } from './src/constants/ThemeContext';
import { MeetingScreen } from './src/screens/MeetingScreen';
import { DARK, LIGHT } from './src/constants/theme';
import { getStyles } from './src/constants/styles';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('tr');
  const C = isDark ? DARK : LIGHT;
  const styles = useMemo(() => getStyles(C), [isDark]);

  return (
    <ThemeCtx.Provider value={{ C, styles }}>
      <SafeAreaProvider>
        <MeetingScreen
          isDark={isDark}
          toggleTheme={() => setIsDark((d) => !d)}
          lang={lang}
          toggleLang={() => setLang((l) => (l === 'tr' ? 'en' : 'tr'))}
        />
      </SafeAreaProvider>
    </ThemeCtx.Provider>
  );
}
