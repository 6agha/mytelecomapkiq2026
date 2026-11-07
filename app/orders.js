import DirIcon from '../src/DirIcon';
import { useT } from '../src/i18n';
import PressableScale from '../src/PressableScale';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../src/api';
import { useTheme, money } from '../src/theme';

export default function OrdersScreen() {
  const t = useT();
  const c = useTheme(); const r = useRouter();
  const { data: orders, isLoading, isError, refetch } = useOrders();

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} size="large" /></View>;
  if (isError) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]}>{t('myOrders')}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <PressableScale onPress={() => r.push(`/order/${item.id}`)} style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={s.row}>
              <Text style={{ color: c.text, fontWeight: 'bold', fontSize: 16 }}>{t('order')} #{item.number}</Text>
              <View style={[s.badge, { backgroundColor: c.border }]}><Text style={{ color: c.text, fontSize: 12 }}>{item.status_label}</Text></View>
            </View>
            <View style={[s.row, { marginTop: 12 }]}>
              <Text style={{ color: c.sub, fontSize: 13 }}>{new Date(item.date).toLocaleDateString('ar-EG')}</Text>
              <Text style={{ color: c.accent, fontWeight: 'bold' }}>{money(item.total)}</Text>
            </View>
          </PressableScale>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: c.sub }}>{t('noOrders')}</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
