import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useApp } from './store';
import { useTheme, money } from './theme';
import { useT } from './i18n';
import { getWoo } from './api';
import { dec } from './text';
import PressableScale from './PressableScale';

export default function Related({ product }) {
  const c = useTheme(); const t = useT(); const r = useRouter();
  const lang = useApp((x) => x.lang);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const cat = product?.categories?.slice(-1)[0]?.id;
    if (!cat) return;
    let live = true;
    getWoo(`/products?category=${cat}&per_page=10&exclude=${product.id}`, lang)
      .then((res) => { if (live) setItems(Array.isArray(res) ? res : []); })
      .catch(() => {});
    return () => { live = false; };
  }, [product?.id, lang]);

  if (!items.length) return null;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12 }}>{t('related')}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item: p }) => (
          <PressableScale onPress={() => r.push(`/product/${p.slug}`)} style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Image source={p.images?.[0]?.src} style={[s.img, { backgroundColor: c.bg }]} contentFit="contain" />
            <View style={{ padding: 10 }}>
              <Text style={{ color: c.text, fontSize: 12, fontWeight: '600', height: 32, lineHeight: 16 }} numberOfLines={2}>{dec(p.name)}</Text>
              <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: 'bold', marginTop: 4 }}>{money(p.prices?.price)}</Text>
            </View>
          </PressableScale>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: { width: 140, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden' },
  img: { width: '100%', height: 110 },
});
