import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './theme';
import { useT } from './i18n';
import PressableScale from './PressableScale';

export default function SearchBar() {
  const c = useTheme(); const t = useT(); const r = useRouter();
  return (
    <PressableScale onPress={() => r.push('/search')} style={[s.bar, { backgroundColor: c.card, borderColor: c.border }]}>
      <Ionicons name="search" size={18} color={c.sub} />
      <Text style={{ color: c.sub, flex: 1, marginHorizontal: 8 }}>{t('searchPlaceholder')}</Text>
    </PressableScale>
  );
}
const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
});
