import Related from '../../src/Related';
import Gallery from '../../src/Gallery';
import { useWishlist } from '../../src/wishlist';
import DirIcon from '../../src/DirIcon';
import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProduct, addToCart } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';
import { dec } from '../../src/text';
import PressableScale from '../../src/PressableScale';

const W = Dimensions.get('window').width;
const stripHtml = (h) => dec((h || '').replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, '\n').replace(/<\/(td|th)>/gi, '  ').replace(/<[^>]+>/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')).trim();

export default function ProductScreen() {
  const { slug } = useLocalSearchParams();
  const c = useTheme(); const t = useT(); const r = useRouter(); const qc = useQueryClient();
  const { data: p, isLoading, isError, refetch } = useProduct(slug);

  const [qty, setQty] = useState(1);
  const favItems = useWishlist((x) => x.items);
  const [selectedOptions, setSelectedOptions] = useState({});

  const isVariable = p?.type === 'variable';
  const hasOptions = p?.attributes && p.attributes.length > 0;

  const addReq = useMutation({
    mutationFn: () => {
      const variationPayload = Object.keys(selectedOptions).map(key => ({
        attribute: key,
        value: selectedOptions[key]
      }));
      return addToCart(p.id, qty, variationPayload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      Alert.alert(t('addedToCart'), '', [
        { text: t('continueShopping'), style: 'cancel' },
        { text: t('goToCart'), onPress: () => r.push('/cart') }
      ]);
    },
    onError: (err) => {
      Alert.alert(t('error'), err.message);
    }
  });

  const handleAdd = () => {
    if (isVariable && Object.keys(selectedOptions).length === 0) {
      Alert.alert(t('notice'), t('selectOptions'));
      return;
    }
    addReq.mutate();
  };

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} size="large" /></View>;
  if (isError || !p) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  const img = p.images?.[0]?.src || p.images?.[0]?.thumbnail;
  const shortDesc = stripHtml(p.short_description);
  const fullDesc = stripHtml(p.description);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back} hitSlop={10}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]} numberOfLines={1}>{dec(p.name)}</Text>
        <PressableScale hitSlop={10} style={{ marginEnd: 14 }} onPress={() => Share.share({ message: dec(p.name) + '\nhttps://mytelecom.com.iq/product/' + p.slug })}>
          <Ionicons name="share-outline" size={24} color={c.text} />
        </PressableScale>
        <PressableScale hitSlop={10} onPress={() => useWishlist.getState().toggle({ id: p.id, slug: p.slug, name: p.name, image: p.images?.[0]?.src, price: p.prices.price, on_sale: p.on_sale })}>
          <Ionicons name={favItems.some((x) => x.id === p.id) ? 'heart' : 'heart-outline'} size={24} color={favItems.some((x) => x.id === p.id) ? c.sale : c.text} />
        </PressableScale>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Gallery images={p.images} bg={c.card} />

        <View style={s.container}>
          <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[s.title, { color: c.text }]}>{dec(p.name)}</Text>
            {p.on_sale && <Text style={[s.oldPrice, { color: c.sub }]}>{money(p.prices.regular_price)}</Text>}
            <Text style={[s.price, { color: p.on_sale ? c.sale : c.accent }]}>{money(p.prices.price)}</Text>
            {p.is_in_stock === false ? <Text style={{ color: c.sale, marginTop: 6, fontWeight: '600' }}>{t('outOfStock')}</Text> : (p.low_stock_remaining ? <Text style={{ color: c.sale, marginTop: 6 }}>{p.low_stock_remaining} {t('onlyLeft')}</Text> : null)}
          </View>

          {hasOptions && (
            <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[s.sectionTitle, { color: c.text }]}>{t('options')}</Text>
              {p.attributes.map((attr, idx) => (
                <View key={attr.id || idx} style={{ marginBottom: 12 }}>
                  <Text style={{ color: c.text, marginBottom: 8, fontWeight: '600' }}>{dec(attr.name)}:</Text>
                  <View style={s.optionsRow}>
                    {attr.terms?.map(term => {
                      const taxonomyKey = attr.taxonomy || attr.name;
                      const isSelected = selectedOptions[taxonomyKey] === term.slug;
                      return (
                        <PressableScale
                          key={term.slug}
                          onPress={() => setSelectedOptions(prev => ({ ...prev, [taxonomyKey]: term.slug }))}
                          style={[s.optionBtn, { backgroundColor: isSelected ? c.text : c.bg, borderColor: isSelected ? c.text : c.border }]}
                        >
                          <Text style={{ color: isSelected ? c.bg : c.text, fontSize: 13, fontWeight: isSelected ? 'bold' : 'normal' }}>
                            {dec(term.name)}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {(shortDesc || fullDesc) && (
            <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[s.sectionTitle, { color: c.text }]}>{t('productDetails')}</Text>
              {shortDesc ? <Text style={[s.descText, { color: c.sub, marginBottom: fullDesc ? 12 : 0 }]}>{shortDesc}</Text> : null}
              {fullDesc && fullDesc !== shortDesc ? (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingTop: 12 }}>
                  <Text style={[s.descText, { color: c.text }]}>{fullDesc}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      <Related product={p} />
      </ScrollView>

      <View style={[s.footer, { backgroundColor: c.card, borderTopColor: c.border }]}>
        <View style={[s.qtyBox, { borderColor: c.border }]}>
          <PressableScale hitSlop={8} onPress={() => setQty(Math.max(1, qty - 1))}><Ionicons name="remove" size={20} color={c.text} /></PressableScale>
          <Text style={{ color: c.text, fontWeight: 'bold' }}>{qty}</Text>
          <PressableScale hitSlop={8} onPress={() => setQty(qty + 1)}><Ionicons name="add" size={20} color={c.text} /></PressableScale>
        </View>
        <PressableScale style={[s.btn, { backgroundColor: c.text }]} onPress={handleAdd} disabled={addReq.isPending || p.is_in_stock === false}>
          {addReq.isPending ? <ActivityIndicator color={c.bg} /> : <Text style={{ color: c.bg, fontWeight: 'bold', fontSize: 16 }}>{p.is_in_stock === false ? t('outOfStock') : t('addToCart')}</Text>}
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  container: { padding: 16, gap: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  oldPrice: { fontSize: 13, textDecorationLine: 'line-through', marginBottom: 2 },
  price: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  descText: { fontSize: 14, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 16, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, gap: 16 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
});
