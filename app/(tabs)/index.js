import SearchBar from '../../src/SearchBar';
import { useState } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator, StyleSheet, Dimensions, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHome } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';
import { dec } from '../../src/text';
import { PHONE } from '../../src/config';
import PressableScale from '../../src/PressableScale';
import Slider from '../../src/Slider';
import Newsletter from '../../src/Newsletter';

export default function Home() {
  const c = useTheme(); const t = useT(); const r = useRouter();
  const { data, isLoading, isError, refetch } = useHome();
  const [newsOpen, setNewsOpen] = useState(false);

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} size="large" /></View>;
  if (isError || !data?.blocks) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  const call = () => Linking.openURL(`tel:${PHONE}`).catch(() => {});

  // حذف قسم الأقسام من الهوم مع عنوانه
  const blocks = data.blocks.filter((b, i, arr) => {
    if (b.type === 'categories') return false;
    const next = arr[i + 1];
    if ((b.type === 'heading' || (b.type === 'promo_deal' && !b.button)) && next?.type === 'categories') return false;
    return true;
  });

  const handlePress = (target) => {
    if (!target) return;
    if (target.type === 'product') r.push(`/product/${target.slug}`);
    else if (target.type === 'category') r.push(`/category/${target.slug}`);
    else if (target.type === 'brand') r.push(`/brand/${target.slug}`);
    else if (target.type === 'about') r.push('/about');
    else if (target.type === 'contact') call();
  };

  // آخر ثلاث بطاقات: خدمة العملاء، الأسئلة، النشرة الإخبارية
  const featIdx = blocks.reduce((a, b, i) => (b.type === 'feature' ? [...a, i] : a), []);
  const lastThree = featIdx.slice(-3);
  const featureAction = (i, b) => {
    if (b.target && ['product', 'category', 'brand', 'about', 'contact'].includes(b.target.type)) return () => handlePress(b.target);
    if (lastThree.length === 3) {
      if (i === lastThree[2]) return () => setNewsOpen(true);
      if (i === lastThree[0] || i === lastThree[1]) return call;
    }
    return null;
  };

  const renderBlock = (b, i) => {
    switch (b.type) {
      case 'slider':
        return <Slider key={i} slides={b.slides} onPress={handlePress} bg={c.card} />;

      case 'promo_deal':
        return (
          <PressableScale
            key={i}
            onPress={() => handlePress(b.target)}
            style={[s.promoCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            {b.titles?.map((titleText, tIdx) => (
              <View key={tIdx} style={s.promoTitleRow}>
                <View style={[s.headingLine, { backgroundColor: c.accent }]} />
                <Text style={[s.promoTitle, { color: c.text }]}>{dec(titleText)}</Text>
              </View>
            ))}
            {b.button ? (
              <View style={[s.promoBtn, { backgroundColor: c.text }]}>
                <Text style={{ color: c.bg, fontWeight: 'bold', fontSize: 15 }}>{b.button}</Text>
              </View>
            ) : null}
          </PressableScale>
        );

      case 'heading':
        return (
          <View key={i} style={s.headingContainer}>
            <View style={[s.headingLine, { backgroundColor: c.accent }]} />
            <Text style={[s.heading, { color: c.text }]}>{dec(b.text)}</Text>
          </View>
        );

      case 'brands':
        return (
          <FlatList
            key={i}
            data={b.items}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 14, marginBottom: 20 }}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <PressableScale onPress={() => handlePress(item.target)} style={[s.brandCard, { borderColor: c.border, backgroundColor: c.card }]}>
                <Image source={item.image} style={s.brandImg} contentFit="contain" />
              </PressableScale>
            )}
          />
        );

      case 'products':
        return (
          <FlatList
            key={i}
            data={b.items}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14, marginBottom: 20 }}
            keyExtractor={(p) => String(p.id)}
            renderItem={({ item: p }) => (
              <PressableScale onPress={() => r.push(`/product/${p.slug}`)} style={[s.productCard, { borderColor: c.border, backgroundColor: c.card }]}>
                <Image source={p.image} style={[s.productImg, { backgroundColor: c.bg }]} contentFit="contain" />
                <View style={s.productInfo}>
                  <Text style={[s.productName, { color: c.text }]} numberOfLines={2}>{dec(p.name)}</Text>
                  <View style={s.priceRow}>
                    <View>
                      {p.on_sale && <Text style={[s.oldPrice, { color: c.sub }]}>{money(p.regular_price)}</Text>}
                      <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: 'bold', fontSize: 14 }}>{money(p.price)}</Text>
                    </View>
                    <View style={[s.addBtn, { backgroundColor: c.text }]}>
                      <Ionicons name="add" size={18} color={c.bg} />
                    </View>
                  </View>
                </View>
              </PressableScale>
            )}
          />
        );

      case 'feature': {
        const act = featureAction(i, b);
        return (
          <PressableScale
            key={i}
            onPress={act || undefined}
            disabled={!act}
            style={[s.featureCard, { borderColor: c.border, backgroundColor: c.card }]}
          >
            <View style={[s.featureIcon, { backgroundColor: c.bg }]}>
              <Ionicons name="star-outline" size={28} color={c.accent} />
            </View>
            <Text style={[s.featureTitle, { color: c.text }]}>{dec(b.title)}</Text>
            <Text style={[s.featureText, { color: c.sub }]}>{dec(b.text)}</Text>
          </PressableScale>
        );
      }

      default:
        return null;
    }
  };

  const logoUrl = data?.site_logo || 'https://mytelecom.com.iq/wp-content/uploads/2026/09/Nazo-site-logo-1024x160-3-768x120.png';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.topBar, { borderBottomColor: c.border }]}>
        <Image source={{ uri: logoUrl }} style={s.logo} contentFit="contain" tintColor={c.bg === '#F6F6F6' ? c.text : undefined} />
      </View>
      <SearchBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {blocks.map((b, i) => renderBlock(b, i))}
      </ScrollView>
      <Newsletter visible={newsOpen} onClose={() => setNewsOpen(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { height: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  logo: { width: 180, height: 38 },

  promoCard: { marginHorizontal: 16, marginBottom: 20, padding: 20, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  promoTitleRow: { flexDirection: 'row', alignItems: 'center' },
  promoTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  promoBtn: { marginTop: 8, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },

  headingContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, marginBottom: 14 },
  headingLine: { width: 4, height: 18, borderRadius: 2, marginEnd: 8 },
  heading: { fontSize: 18, fontWeight: 'bold' },

  productCard: { width: 155, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, overflow: 'hidden' },
  productImg: { width: '100%', height: 135, padding: 8 },
  productInfo: { padding: 12, flex: 1, justifyContent: 'space-between' },
  productName: { fontSize: 13, fontWeight: '600', marginBottom: 6, lineHeight: 18, height: 36 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  addBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  brandCard: { width: 80, height: 80, borderWidth: StyleSheet.hairlineWidth, borderRadius: 40, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 10 },
  brandImg: { width: '100%', height: '100%' },

  featureCard: { alignItems: 'center', marginHorizontal: 16, marginBottom: 14, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 },
  featureIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  featureText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
