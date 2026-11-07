import DirIcon from '../../src/DirIcon';
import PressableScale from '../../src/PressableScale';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBrandProducts } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';

const W = Dimensions.get('window').width;

export default function BrandScreen() {
  const { slug } = useLocalSearchParams();
  const c = useTheme(); const t = useT(); const r = useRouter();
  const { data: products, isLoading, isError, refetch } = useBrandProducts(slug);

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} /></View>;
  if (isError) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]} numberOfLines={1}>{slug}</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(x) => String(x.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 12, alignItems: 'center' }}
        columnWrapperStyle={{ justifyContent: 'center', gap: 12 }}
        renderItem={({ item: p }) => (
          <PressableScale onPress={() => r.push(`/product/${p.slug}`)} style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Image source={p.images?.[0]?.src} style={s.pimg} contentFit="contain" />
            <Text numberOfLines={2} style={[s.pname, { color: c.text }]}>{p.name}</Text>
            {p.on_sale && <Text style={[s.old, { color: c.sub }]}>{money(p.prices.regular_price)}</Text>}
            <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: '700' }}>{money(p.prices.price)}</Text>
          </PressableScale>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: c.sub }}>{t('noProductsBrand')}</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  card: { width: (W - 40) / 2, padding: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  pimg: { width: '100%', height: 110, marginBottom: 8 },
  pname: { fontSize: 13, height: 34 },
  old: { fontSize: 11, textDecorationLine: 'line-through' },
});
