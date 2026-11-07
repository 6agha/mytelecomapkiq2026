import DirIcon from '../src/DirIcon';
import PressableScale from '../src/PressableScale';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCart, wooBase, customBase } from '../src/api';
import { useTheme, money } from '../src/theme';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';

export default function Checkout() {
  const c = useTheme(); const t = useT(); const r = useRouter(); const qc = useQueryClient();
  const { lang, cartToken, setCartToken, authToken, user } = useApp();
  const { data: cart } = useCart();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authToken) return;
    let live = true;
    fetch(`${customBase(lang)}/account/addresses`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((x) => x.json())
      .then((d) => {
        const b = d?.billing || {};
        if (!live) return;
        if (b.first_name) setFirstName((v) => v || b.first_name);
        if (b.last_name) setLastName((v) => v || b.last_name);
        if (b.state) setStateName((v) => v || b.state);
        if (b.city) setCity((v) => v || b.city);
        if (b.address_1) setAddress((v) => v || b.address_1);
        if (b.phone) setPhone((v) => v || b.phone);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [authToken, lang]);

  const handlePlaceOrder = async () => {
    if (!firstName || !email || !city || !address || !phone) {
      Alert.alert(t('errorTitle'), t('fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        first_name: firstName, last_name: lastName || firstName,
        company: '', address_1: address, address_2: '', city: city,
        state: stateName || city, postcode: '00000', country: 'IQ', phone: phone,
      };

      const body = {
        billing_address: { ...addressData, email: email },
        shipping_address: addressData,
        payment_method: 'cod',
        customer_id: user?.id || 0,
      };

      const headers = { 'Content-Type': 'application/json', 'Cart-Token': cartToken || '' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${wooBase(lang)}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('orderFailed'));

      if (setCartToken) await setCartToken(null);
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      if (authToken) {
        const sv = { first_name: firstName, last_name: lastName, address_1: address, city, state: stateName || city, phone };
        fetch(`${customBase(lang)}/account/addresses`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ billing: sv, shipping: sv }) }).catch(() => {});
      }

      Alert.alert(t('success'), `${t('orderReceived')} ${data.order_id}`, [
        { text: t('ok'), onPress: () => r.replace('/') }
      ]);
    } catch (e) {
      Alert.alert(t('errorTitle'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]}>{t('checkout')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>{t('shippingInfo')}</Text>
          <TextInput placeholder={t('firstName') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={firstName} onChangeText={setFirstName} />
          <TextInput placeholder={t('lastName')} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={lastName} onChangeText={setLastName} />
          <TextInput placeholder={t('email') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput placeholder={t('governorate') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={stateName} onChangeText={setStateName} />
          <TextInput placeholder={t('city') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={city} onChangeText={setCity} />
          <TextInput placeholder={t('address') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={address} onChangeText={setAddress} />
          <TextInput placeholder={t('phone') + ' *'} placeholderTextColor={c.sub} style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>{t('invoiceSummary')}</Text>
          <View style={s.row}>
            <Text style={{ color: c.sub }}>{t('productsTotal')}</Text>
            <Text style={{ color: c.text }}>{money(cart?.totals?.total_items || 0)}</Text>
          </View>
          <View style={[s.row, { marginTop: 8 }]}>
            <Text style={{ color: c.sub }}>{t('shipping')}</Text>
            <Text style={{ color: c.text }}>{money(cart?.totals?.total_shipping || 0)}</Text>
          </View>
          <View style={[s.row, { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
            <Text style={{ color: c.text, fontWeight: 'bold' }}>{t('grandTotal')}</Text>
            <Text style={{ color: c.accent, fontWeight: 'bold', fontSize: 18 }}>{money(cart?.totals?.total_price || 0)}</Text>
          </View>
        </View>

        <PressableScale style={[s.btn, { backgroundColor: c.text, marginTop: 24 }]} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color={c.bg} /> : <Text style={{ color: c.bg, fontWeight: 'bold', fontSize: 16 }}>{t('placeOrder')}</Text>}
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center' },
});
