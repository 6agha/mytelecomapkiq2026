import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { LANGS } from './config';

// الاتجاه يُدار داخل التطبيق، ولا نعتمد على اتجاه النظام ولا على إعادة التشغيل
try { I18nManager.allowRTL(false); I18nManager.forceRTL(false); } catch (e) {}

const isRtl = (code) => LANGS.find((x) => x.code === code)?.rtl ?? true;

export const useApp = create((set) => ({
  ready: false,
  lang: 'ar',
  rtl: true,
  dark: false,
  cartToken: null,
  authToken: null,
  user: null,
  load: async () => {
    const [l, d, ct, at, u] = await Promise.all([
      AsyncStorage.getItem('lang'),
      AsyncStorage.getItem('dark'),
      AsyncStorage.getItem('cartToken'),
      AsyncStorage.getItem('authToken'),
      AsyncStorage.getItem('user'),
    ]);
    const langCode = l || 'ar';
    let user = null;
    try { user = u ? JSON.parse(u) : null; } catch (e) {}
    set({ lang: langCode, rtl: isRtl(langCode), dark: d === '1', cartToken: ct, authToken: at, user, ready: true });
  },
  setDark: async (dark) => {
    set({ dark });
    await AsyncStorage.setItem('dark', dark ? '1' : '0');
  },
  setCartToken: async (token) => {
    set({ cartToken: token });
    if (token) await AsyncStorage.setItem('cartToken', token);
    else await AsyncStorage.removeItem('cartToken');
  },
  setAuthToken: async (token) => {
    set({ authToken: token });
    if (token) await AsyncStorage.setItem('authToken', token);
    else await AsyncStorage.removeItem('authToken');
  },
  setUser: async (user) => {
    set({ user });
    if (user) await AsyncStorage.setItem('user', JSON.stringify(user));
    else await AsyncStorage.removeItem('user');
  },
  setLang: async (code) => {
    set({ lang: code, rtl: isRtl(code) });
    await AsyncStorage.setItem('lang', code);
  },
}));
