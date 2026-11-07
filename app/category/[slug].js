import { useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirIcon from '../../src/DirIcon';
import PressableScale from '../../src/PressableScale';
import { useCategoryProducts } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';
import { dec } from '../../src/text';

const W = Dimensions.get('window').width;
const num = (p) => Number(p?.prices?.price) || 0;

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const c = useTheme(); const t = useT(); const r = useRouter();
  const { data: products, isLoading, isError, refetch } = useCategoryProducts(slug);
  const [sort, setSort] = useState('default');
  const [onSale, setOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);

  const list = useMemo(() => {
    let a = Array.isArray(products) ? [...products] : [];
    if (onSale) a = a.filter((p) => p.on_sale);
    if (inStock) a = a.filter((p) => p.is_in_stock !== false);
    if (sort === 'low') a.sort((x, y) => num(x) - num(y));
    if (sort === 'high') a.sort((x, y) => num(y) - num(x));
    return a;
  }, [products, sort, onSale, inStock]);

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} /></View>;
  if (isError) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  const Chip = ({ label, active, onPress }) => (
    <PressableScale onPress={onPress} style={[s.chip, { backgroundColor: active ? c.text : c.card, borderColor: active ? c.text : c.border }]}>
      <Text style={{ color: active ? c.bg : c.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </PressableScale>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]} numberOfLines={1}>{dec(String(slug))}</Text>
        <Text style={{ color: c.sub, fontSize: 12 }}>{list.length} {t('itemsCount')}</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Chip label={t('sortDefault')} active={sort === 'default'} onPress={() => setSort('default')} />
          <Chip label={t('priceLow')} active={sort === 'low'} onPress={() => setSort('low')} />
          <Chip label={t('priceHigh')} active={sort === 'high'} onPress={() => setSort('high')} />
          <Chip label={t('onSaleOnly')} active={onSale} onPress={() => setOnSale(!onSale)} />
          <Chip label={t('inStockOnly')} active={inStock} onPress={() => setInStock(!inStock)} />
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(x) => String(x.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 12, alignItems: 'center' }}
        columnWrapperStyle={{ justifyContent: 'center', gap: 12 }}
        renderItem={({ item: p }) => (
          <PressableScale onPress={() => r.push(`/product/${p.slug}`)} style={[s.card, { backgroundColor: c.card, borderColor: c.border, opacity: p.is_in_stock === false ? 0.55 : 1 }]}>
            <Image source={p.images?.[0]?.src} style={s.pimg} contentFit="contain" />
            <Text numberOfLines={2} style={[s.pname, { color: c.text }]}>{dec(p.name)}</Text>
            {p.on_sale && <Text style={[s.old, { color: c.sub }]}>{money(p.prices.regular_price)}</Text>}
            <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: '700' }}>{money(p.prices.price)}</Text>
            {p.is_in_stock === false && <Text style={{ color: c.sale, fontSize: 11, marginTop: 2 }}>{t('outOfStock')}</Text>}
          </PressableScale>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: c.sub }}>{t('noProductsCat')}</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  card: { width: (W - 40) / 2, padding: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  pimg: { width: '100%', height: 110, marginBottom: 8 },
  pname: { fontSize: 13, height: 34 },
  old: { fontSize: 11, textDecorationLine: 'line-through' },
});
