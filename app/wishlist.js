import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DirIcon from '../src/DirIcon';
import { useTheme, money } from '../src/theme';
import { useT } from '../src/i18n';
import { dec } from '../src/text';
import { useWishlist } from '../src/wishlist';
import PressableScale from '../src/PressableScale';

export default function Wishlist() {
  const c = useTheme(); const t = useT(); const r = useRouter();
  const items = useWishlist((x) => x.items);
  const toggle = useWishlist((x) => x.toggle);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={s.top}>
        <PressableScale onPress={() => r.back()} hitSlop={10} style={{ padding: 6 }}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={{ color: c.text, fontSize: 20, fontWeight: '700', marginHorizontal: 8 }}>{t('wishlist')}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ color: c.sub, textAlign: 'center', marginTop: 60 }}>{t('wishlistEmpty')}</Text>}
        renderItem={({ item: p }) => (
          <PressableScale onPress={() => r.push(`/product/${p.slug}`)} style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Image source={p.image} style={[s.img, { backgroundColor: c.bg }]} contentFit="contain" />
            <PressableScale onPress={() => toggle(p)} hitSlop={8} style={s.heart}><Ionicons name="heart" size={22} color={c.sale} /></PressableScale>
            <View style={{ padding: 10 }}>
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600', height: 36, lineHeight: 18 }} numberOfLines={2}>{dec(p.name)}</Text>
              <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: 'bold', marginTop: 6 }}>{money(p.price)}</Text>
            </View>
          </PressableScale>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
  card: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden' },
  img: { width: '100%', height: 130 },
  heart: { position: 'absolute', top: 8, end: 8 },
});
