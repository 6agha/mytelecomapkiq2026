import DirIcon from '../src/DirIcon';
import PressableScale from '../src/PressableScale';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTheme } from '../src/theme';
import { useApp } from '../src/store';
import { SITE } from '../src/config';

export default function PrivacyScreen() {
  const c = useTheme(); const r = useRouter();
  const { lang } = useApp();
  const url = SITE + '/' + lang + '/privacy-policy/';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
      </View>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1, backgroundColor: c.bg }}
        startInLoadingState={true}
        renderLoading={() => <View style={s.loader}><ActivityIndicator color={c.accent} size="large" /></View>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});
