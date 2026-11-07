import DirIcon from '../../src/DirIcon';
import DeleteAccount from '../../src/DeleteAccount';
import PressableScale from '../../src/PressableScale';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert, Switch, Linking } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../src/store';
import { useTheme } from '../../src/theme';
import { useT } from '../../src/i18n';
import { customBase } from '../../src/api';
import { togglePushNotifications } from '../../src/push';
import { LANGS, PHONE, SITE, MESSENGER_URL } from '../../src/config';

export default function Account() {
  const c = useTheme(); const t = useT(); const r = useRouter();
  const { dark, setDark, lang, setLang, user, setUser, authToken, setAuthToken } = useApp();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('app_notifications_enabled').then((val) => {
      if (val !== null) setNotifEnabled(val === 'true');
    });
  }, []);

  const handleToggleNotif = async (val) => {
    setNotifEnabled(val);
    await togglePushNotifications(val);
  };

  const handleAuth = async (endpoint, body) => {
    setLoading(true);
    try {
      const res = await fetch(`${customBase(lang)}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('genericError'));
      return data;
    } catch (e) {
      Alert.alert(t('errorTitle'), e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    const data = await handleAuth('/auth/login', { username: email, password });
    if (data) { await setUser(data.user); await setAuthToken(data.token); }
  };

  const onRegister = async () => {
    const data = await handleAuth('/auth/register', { email, password, first_name: firstName, last_name: lastName });
    if (data) { await setUser(data.user); await setAuthToken(data.token); Alert.alert(t('success'), t('accountCreated')); }
  };

  const onForgot = async () => {
    const e = email.trim();
    const data = await handleAuth('/auth/forgot', { email: e });
    if (data) { Alert.alert(t('success'), t('resetSent')); setMode('login'); }
  };

  const callSupport = () => Linking.openURL(`tel:${PHONE}`).catch(() => Alert.alert(t('notice'), t('cannotCall')));

  const inp = [s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Image source={require('../../assets/splash-logo.png')} style={s.logo} contentFit="contain" />
        <Text style={[s.title, { color: c.text }]}>{t('account')}</Text>
        <PressableScale onPress={() => r.push('/wishlist')} style={[s.actionBtn, { borderColor: c.border, backgroundColor: c.card, marginBottom: 16 }]}>
          <Ionicons name="heart-outline" size={24} color={c.text} />
          <Text style={{ color: c.text, flex: 1, marginHorizontal: 12, fontSize: 16 }}>{t('wishlist')}</Text>
          <DirIcon name="chevron-back" size={20} color={c.sub} />
        </PressableScale>

        {user && authToken ? (
          <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="person-circle-outline" size={54} color={c.accent} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={[s.headerText, { color: c.text, textAlign: 'center' }]}>{user.first_name ? `${user.first_name} ${user.last_name}` : user.email}</Text>
            <Text style={[s.subText, { color: c.sub, textAlign: 'center', marginBottom: 16 }]}>{user.email}</Text>

            <PressableScale style={[s.actionBtn, { borderColor: c.border }]} onPress={() => r.push('/orders')}>
              <Ionicons name="cube-outline" size={24} color={c.text} />
              <Text style={{ color: c.text, flex: 1, marginHorizontal: 12, fontSize: 16 }}>{t('myOrders')}</Text>
              <DirIcon name="chevron-back" size={20} color={c.sub} />
            </PressableScale>

            <PressableScale style={[s.btn, { backgroundColor: '#6c757d', marginTop: 16 }]} onPress={() => { setUser(null); setAuthToken(null); }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{t('logout')}</Text>
            </PressableScale>
            <Text style={{ color: '#D32F2F', textAlign: 'center', marginTop: 18, fontSize: 13 }} onPress={() => setDelOpen(true)}>{t('deleteAccount')}</Text>
            <DeleteAccount visible={delOpen} onClose={() => setDelOpen(false)} />
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[s.headerText, { color: c.text }]}>{mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('resetTitle')}</Text>
            {mode === 'register' && (
              <>
                <TextInput placeholder={t('firstName')} placeholderTextColor={c.sub} style={inp} value={firstName} onChangeText={setFirstName} />
                <TextInput placeholder={t('lastName')} placeholderTextColor={c.sub} style={inp} value={lastName} onChangeText={setLastName} />
              </>
            )}
            <TextInput placeholder={t('email')} placeholderTextColor={c.sub} style={inp} value={email} onChangeText={setEmail} autoCapitalize="none" />
            {mode !== 'forgot' && (
              <TextInput placeholder={t('password')} placeholderTextColor={c.sub} style={inp} value={password} onChangeText={setPassword} secureTextEntry />
            )}
            <PressableScale style={[s.btn, { backgroundColor: '#6c757d' }]} onPress={mode === 'login' ? onLogin : mode === 'register' ? onRegister : onForgot} disabled={loading}>
              {loading ? <ActivityIndicator color={c.bg} /> : <Text style={{ color: c.bg, fontWeight: 'bold', textAlign: 'center' }}>{mode === 'login' ? t('signIn') : mode === 'register' ? t('signUp') : t('sendReset')}</Text>}
            </PressableScale>
            <View style={s.linksRow}>
              {mode === 'login' ? (
                <>
                  <Text style={{ color: c.accent }} onPress={() => setMode('register')}>{t('registerQ')}</Text>
                  <Text style={{ color: c.accent }} onPress={() => setMode('forgot')}>{t('forgotQ')}</Text>
                </>
              ) : (
                <Text style={{ color: c.accent, textAlign: 'center', width: '100%' }} onPress={() => setMode('login')}>{t('backToLogin')}</Text>
              )}
            </View>
          </View>
        )}

        {/* إعدادات التطبيق */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
          <Text style={[s.headerText, { color: c.text }]}>{t('settings')}</Text>
          
          {/* الوضع الليلي */}
          <View style={s.row}><Text style={{ color: c.text }}>{t('darkMode')}</Text><Switch value={dark} onValueChange={setDark} /></View>
          
          {/* زر تشغيل/إيقاف الإشعارات */}
          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]}>
            <Text style={{ color: c.text }}>{t('notifications') || 'الإشعارات'}</Text>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: '#767577', true: c.accent || '#000' }}
              thumbColor={notifEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]}>
            <Text style={{ color: c.text }}>{t('language')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {LANGS.map((l) => (
                <PressableScale key={l.code} onPress={() => setLang(l.code)} style={[s.langBtn, { backgroundColor: lang === l.code ? '#6c757d' : c.bg, borderColor: c.border }]}>
                  <Text style={{ color: lang === l.code ? c.bg : c.text, fontSize: 12, fontWeight: 'bold' }}>{l.label}</Text>
                </PressableScale>
              ))}
            </View>
          </View>

          <PressableScale style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]} onPress={() => r.push('/privacy')}>
            <Text style={{ color: c.text }}>{t('privacy')}</Text>
            <DirIcon name="chevron-back" size={18} color={c.sub} />
          </PressableScale>

          <PressableScale style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]} onPress={() => r.push('/about')}>
            <Text style={{ color: c.text }}>{t('about')}</Text>
            <DirIcon name="chevron-back" size={18} color={c.sub} />
          </PressableScale>

          <PressableScale style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]} onPress={() => Linking.openURL(MESSENGER_URL).catch(() => Linking.openURL('https://www.facebook.com/nazogroup').catch(() => {}))}>
            <Text style={{ color: c.text }}>{t('messenger')}</Text>
            <Ionicons name="logo-facebook" size={22} color="#0084FF" />
          </PressableScale>

          <PressableScale style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]} onPress={callSupport}>
            <View><Text style={{ color: c.text }}>{t('contact')}</Text><Text style={{ color: c.sub, fontSize: 11, marginTop: 2 }}>{t('contactNote')}</Text></View>
            <Text style={{ color: c.accent, fontWeight: 'bold' }}>{PHONE}</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  logo: { width: 80, height: 80, borderRadius: 16, alignSelf: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  headerText: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  subText: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  btn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 }
});
