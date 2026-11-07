import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useApp } from './store';
import { useTheme } from './theme';
import { useT } from './i18n';
import { customBase } from './api';
import PressableScale from './PressableScale';

export default function Newsletter({ visible, onClose }) {
  const c = useTheme(); const t = useT(); const lang = useApp((x) => x.lang);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) { Alert.alert(t('notice'), t('invalidEmail')); return; }
    setLoading(true);
    try {
      const res = await fetch(`${customBase(lang)}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e }),
      });
      if (!res.ok) throw new Error('fail');
      setEmail(''); onClose();
      Alert.alert(t('success'), t('subscribed'));
    } catch (err) {
      Alert.alert(t('errorTitle'), t('genericError'));
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.card, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => {}}>
          <Text style={[s.title, { color: c.text }]}>{t('newsletterTitle')}</Text>
          <Text style={{ color: c.sub, textAlign: 'center', marginBottom: 16, lineHeight: 22 }}>{t('newsletterDesc')}</Text>
          <TextInput
            placeholder={t('email')} placeholderTextColor={c.sub}
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address"
            style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
          />
          <PressableScale style={[s.btn, { backgroundColor: c.text }]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={c.bg} /> : <Text style={{ color: c.bg, fontWeight: 'bold', fontSize: 16 }}>{t('subscribe')}</Text>}
          </PressableScale>
          <Text style={{ color: c.sub, textAlign: 'center', marginTop: 14 }} onPress={onClose}>{t('cancel')}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 18, padding: 22, borderWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
});
