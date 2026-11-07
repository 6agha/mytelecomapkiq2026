import DirIcon from '../src/DirIcon';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../src/store';
import { useTheme, money } from '../src/theme';
import { useT } from '../src/i18n';
import { getWoo } from '../src/api';
import { dec } from '../src/text';
import PressableScale from '../src/PressableScale';

const KEY = 'recentSearches';

export default function Search() {
  const c = useTheme(); const t = useT(); const r = useRouter();
  const lang = useApp((x) => x.lang);
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState([]);
  const reqId = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { try { setRecent(v ? JSON.parse(v) : []); } catch (e) {} });
  }, []);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) { setItems([]); setSearched(false); setLoading(false); return; }
    setLoading(true);
    const id = ++reqId.current;
    const h = setTimeout(async () => {
      try {
        const res = await getWoo(`/products?search=${encodeURIComponent(text)}&per_page=30`, lang);
        if (id === reqId.current) { setItems(Array.isArray(res) ? res : []); setSearched(true); }
      } catch (e) {
        if (id === reqId.current) { setItems([]); setSearched(true); }
      } finally { if (id === reqId.current) setLoading(false); }
    }, 450);
    return () => clearTimeout(h);
  }, [q, lang]);

  const saveRecent = async (text) => {
    const v = text.trim(); if (!v) return;
    const next = [v, ...recent.filter((x) => x !== v)].slice(0, 8);
    setRecent(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };
  const clearRecent = async () => { setRecent([]); await AsyncStorage.removeItem(KEY); };
  const open = (p) => { saveRecent(q); Keyboard.dismiss(); r.push(`/product/${p.slug}`); };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={s.top}>
        <PressableScale onPress={() => r.back()} hitSlop={10} style={{ padding: 6 }}>
          <DirIcon name="arrow-back" size={24} color={c.text} />
        </PressableScale>
        <View style={[s.box, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.sub} />
          <TextInput
            autoFocus value={q} onChangeText={setQ}
            placeholder={t('searchPlaceholder')} placeholderTextColor={c.sub}
            style={[s.input, { color: c.text }]} returnKeyType="search"
            onSubmitEditing={() => saveRecent(q)}
          />
          {q.length > 0 && (
            <PressableScale onPress={() => setQ('')} hitSlop={10}><Ionicons name="close-circle" size={18} color={c.sub} /></PressableScale>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator color={c.accent} style={{ marginTop: 20 }} />}

      {q.trim().length < 2 ? (
        <View style={{ padding: 16 }}>
          {recent.length > 0 ? (
            <>
              <View style={s.rowBetween}>
                <Text style={{ color: c.text, fontWeight: 'bold' }}>{t('recent')}</Text>
                <Text style={{ color: c.accent }} onPress={clearRecent}>{t('clear')}</Text>
              </View>
              {recent.map((x) => (
                <PressableScale key={x} onPress={() => setQ(x)} style={[s.recentRow, { borderBottomColor: c.border }]}>
                  <Ionicons name="time-outline" size={18} color={c.sub} />
                  <Text style={{ color: c.text, flex: 1, marginHorizontal: 10 }}>{x}</Text>
                </PressableScale>
              ))}
            </>
          ) : (
            <Text style={{ color: c.sub, textAlign: 'center', marginTop: 40 }}>{t('searchHint')}</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={searched && !loading ? <Text style={{ color: c.sub, textAlign: 'center', marginTop: 40 }}>{t('noResults')}</Text> : null}
          renderItem={({ item: p }) => (
            <PressableScale onPress={() => open(p)} style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Image source={p.images?.[0]?.src || p.images?.[0]?.thumbnail} style={[s.img, { backgroundColor: c.bg }]} contentFit="contain" />
              <View style={{ padding: 10 }}>
                <Text style={{ color: c.text, fontSize: 13, fontWeight: '600', height: 36, lineHeight: 18 }} numberOfLines={2}>{dec(p.name)}</Text>
                <Text style={{ color: p.on_sale ? c.sale : c.text, fontWeight: 'bold', marginTop: 6 }}>{money(p.prices?.price)}</Text>
              </View>
            </PressableScale>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  box: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, gap: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  card: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden' },
  img: { width: '100%', height: 130 },
});
