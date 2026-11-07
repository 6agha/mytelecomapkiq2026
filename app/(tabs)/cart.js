import Coupon from '../../src/Coupon';
import { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart, updateCartItem, removeCartItem } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';
import { useApp } from '../../src/store';
import { dec } from '../../src/text';
import PressableScale from '../../src/PressableScale';

export default function Cart() {
  const c = useTheme(); const t = useT(); const router = useRouter(); const qc = useQueryClient();
  const lang = useApp((x) => x.lang);
  const key = ['cart', lang];
  const { data: cart, isLoading, isError, refetch, isFetching } = useCart();

  // جلب السلة من الموقع كلما فُتحت الشاشة
  useFocusEffect(useCallback(() => { refetch(); }, []));

  const patchCache = (fn) => {
    const prev = qc.getQueryData(key);
    if (prev?.items) qc.setQueryData(key, { ...prev, items: fn(prev.items) });
    return prev;
  };

  const updateReq = useMutation({
    mutationFn: ({ k, qty }) => updateCartItem(k, qty),
    onMutate: async ({ k, qty }) => {
      await qc.cancelQueries({ queryKey: key });
      return { prev: patchCache((items) => items.map((i) => (i.key === k ? { ...i, quantity: qty } : i))) };
    },
    onError: (err, vars, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); Alert.alert(t('errorTitle'), err.message); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeReq = useMutation({
    mutationFn: (k) => removeCartItem(k),
    onMutate: async (k) => {
      await qc.cancelQueries({ queryKey: key });
      return { prev: patchCache((items) => items.filter((i) => i.key !== k)) };
    },
    onError: (err, vars, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); Alert.alert(t('errorTitle'), err.message); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} size="large" /></View>;
  if (isError && !cart) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={[s.title, { color: c.text }]}>{t('cart')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {isFetching && <ActivityIndicator size="small" color={c.accent} />}
          <PressableScale onPress={() => refetch()} style={{ padding: 4 }}><Ionicons name="refresh-circle-outline" size={26} color={c.accent} /></PressableScale>
        </View>
      </View>

      {isEmpty ? (
        <View style={s.center}>
          <Ionicons name="cart-outline" size={64} color={c.sub} />
          <Text style={{ color: c.sub, marginTop: 16 }}>{t('emptyCart')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(x) => String(x.key)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={[s.item, { backgroundColor: c.card, borderColor: c.border }]}>
                <Image source={item.images?.[0]?.src} style={s.img} contentFit="contain" />
                <View style={s.info}>
                  <Text style={[s.name, { color: c.text }]} numberOfLines={2}>{dec(item.name)}</Text>
                  {item.item_data && item.item_data.map((opt, idx) => (
                    <Text key={idx} style={{ color: c.sub, fontSize: 12, marginTop: 2 }}>{dec(opt.key)}: {dec(opt.value)}</Text>
                  ))}
                  <Text style={[s.price, { color: c.accent }]}>{money(item.prices.price)}</Text>
                  <View style={s.actions}>
                    <View style={[s.qtyBox, { borderColor: c.border }]}>
                      <PressableScale onPress={() => updateReq.mutate({ k: item.key, qty: item.quantity - 1 })} disabled={item.quantity <= 1}><Ionicons name="remove" size={18} color={c.text} /></PressableScale>
                      <Text style={{ color: c.text, fontWeight: 'bold', marginHorizontal: 8 }}>{item.quantity}</Text>
                      <PressableScale onPress={() => updateReq.mutate({ k: item.key, qty: item.quantity + 1 })}><Ionicons name="add" size={18} color={c.text} /></PressableScale>
                    </View>
                    <PressableScale onPress={() => removeReq.mutate(item.key)}><Ionicons name="trash-outline" size={22} color={c.sale} /></PressableScale>
                  </View>
                </View>
              </View>
            )}
          />
          <Coupon cart={cart} />
          <View style={[s.footer, { backgroundColor: c.card, borderTopColor: c.border }]}>
            <View style={s.totals}>
              <Text style={{ color: c.sub }}>{t('total')}</Text>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: 'bold' }}>{money(Number(cart.totals?.total_items || 0) - Number(cart.totals?.total_discount || 0))}</Text>
            </View>
            <PressableScale style={[s.btn, { backgroundColor: c.text }]} onPress={() => router.push('/checkout')}>
              <Text style={{ color: c.bg, fontWeight: 'bold', fontSize: 16 }}>{t('checkout')}</Text>
            </PressableScale>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  item: { flexDirection: 'row', padding: 12, marginBottom: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  img: { width: 80, height: 80, borderRadius: 8, marginEnd: 12 },
  info: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 14, marginTop: 4, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totals: { flex: 1 },
  btn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
});
