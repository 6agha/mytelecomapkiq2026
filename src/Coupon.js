import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { applyCoupon, removeCoupon } from './api';
import { useTheme, money } from './theme';
import { useT } from './i18n';
import PressableScale from './PressableScale';

export default function Coupon({ cart }) {
  const c = useTheme(); const t = useT(); const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const applied = cart?.coupons || [];
  const discount = Number(cart?.totals?.total_discount || 0);

  const run = async (fn, v) => {
    setLoading(true);
    try { await fn(v); setCode(''); await qc.invalidateQueries({ queryKey: ['cart'] }); }
    catch (e) { Alert.alert(t('errorTitle'), e.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={[s.wrap, { backgroundColor: c.card, borderTopColor: c.border }]}>
      <View style={s.row}>
        <TextInput
          value={code} onChangeText={setCode} autoCapitalize="none"
          placeholder={t('couponPlaceholder')} placeholderTextColor={c.sub}
          style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
        />
        <PressableScale disabled={loading || !code.trim()} onPress={() => run(applyCoupon, code.trim())} style={[s.btn, { backgroundColor: c.text, opacity: code.trim() ? 1 : 0.5 }]}>
          {loading ? <ActivityIndicator color={c.bg} /> : <Text style={{ color: c.bg, fontWeight: 'bold' }}>{t('apply')}</Text>}
        </PressableScale>
      </View>
      {applied.map((cp) => (
        <View key={cp.code} style={s.applied}>
          <Text style={{ color: c.text, fontWeight: '600' }}>{cp.code}</Text>
          {discount > 0 && <Text style={{ color: c.sale }}>- {money(discount)}</Text>}
          <Text style={{ color: c.accent }} onPress={() => run(removeCoupon, cp.code)}>{t('remove')}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  applied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
});
