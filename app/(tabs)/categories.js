import SearchBar from '../../src/SearchBar';
import { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '../../src/api';
import { useTheme } from '../../src/theme';
import { useT } from '../../src/i18n';
import { useApp } from '../../src/store';
import { dec } from '../../src/text';
import PressableScale from '../../src/PressableScale';

export default function Categories() {
  const c = useTheme(); const t = useT(); const router = useRouter();
  const { data, isLoading, isError, refetch } = useCategories();
  const [open, setOpen] = useState({});
  const dark = useApp((x) => x.dark);

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} /></View>;
  if (isError) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  const list = Array.isArray(data) ? data : [];
  const kids = (id) => list.filter((x) => x.parent === id);
  const roots = list.filter((x) => x.parent === 0);
  const rows = [];
  const walk = (node, depth) => {
    rows.push({ ...node, depth });
    if (open[node.id]) kids(node.id).forEach((k) => walk(k, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <Text style={[s.title, { color: c.text }]}>{t('categories')}</Text>
      <SearchBar />
      <FlatList data={rows} keyExtractor={(x) => String(x.id)} renderItem={({ item }) => {
        const hasKids = kids(item.id).length > 0;
        const imgUrl = item.image?.src || item.image;
        return (
          <View style={[s.row, { backgroundColor: c.card, marginStart: 12 + item.depth * 20, borderColor: c.border }]}>
            <PressableScale style={s.main} onPress={() => router.push(`/category/${item.slug}`)}>
              {imgUrl ? <View style={[s.icon, dark && { backgroundColor: '#F2F2F2', padding: 4 }]}><Image source={imgUrl} style={{ flex: 1 }} contentFit="contain" /></View> : <View style={s.icon} />}
              <Text style={{ color: c.text, flex: 1, fontWeight: item.depth ? '400' : '600' }}>{dec(item.name)}</Text>
              <Text style={{ color: c.sub, fontSize: 12 }}>{item.count}</Text>
            </PressableScale>
            {hasKids && (
              <PressableScale onPress={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))} style={s.chev}>
                <Ionicons name={open[item.id] ? 'chevron-up' : 'chevron-down'} size={20} color={c.sub} />
              </PressableScale>
            )}
          </View>
        );
      }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginEnd: 12, marginBottom: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 6 },
  chev: { padding: 12 },
});
