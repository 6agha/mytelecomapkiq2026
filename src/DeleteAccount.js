import { useState } from 'react';
import { Modal, Text, TextInput, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useApp } from './store';
import { useTheme } from './theme';
import { useT } from './i18n';
import { customBase } from './api';
import PressableScale from './PressableScale';

export default function DeleteAccount({ visible, onClose }) {
  const c = useTheme(); const t = useT();
  const { lang, authToken, setUser, setAuthToken } = useApp();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password) { Alert.alert(t('notice'), t('enterPassword')); return; }
    setLoading(true);
    try {
      const res = await fetch(`${customBase(lang)}/account/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t('genericError'));
      setPassword(''); onClose();
      await setUser(null); await setAuthToken(null);
      Alert.alert(t('success'), t('deleted'));
    } catch (e) {
      Alert.alert(t('errorTitle'), e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.card, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => {}}>
          <Text style={s.title}>{t('deleteAccount')}</Text>
          <Text style={{ color: c.sub, textAlign: 'center', marginBottom: 16, lineHeight: 22 }}>{t('deleteWarn')}</Text>
          <TextInput
            placeholder={t('enterPassword')} placeholderTextColor={c.sub}
            value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none"
            style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
          />
          <PressableScale style={[s.btn, { backgroundColor: '#D32F2F' }]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('deleteConfirm')}</Text>}
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
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#D32F2F' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
});
