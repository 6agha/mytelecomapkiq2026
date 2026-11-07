import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useApp } from './store';
import { customBase } from './api';

const inExpoGo = Constants.appOwnership === 'expo';

if (!inExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {}
}

// تسجيل الجهاز في الموقع (أندرويد)
export async function registerPush() {
  try {
    if (inExpoGo || Platform.OS !== 'android' || !Device.isDevice) return;
    
    // التحقق مما إذا كان المستخدم قد أوقف الإشعارات يدوياً
    const notifPref = await AsyncStorage.getItem('app_notifications_enabled');
    if (notifPref === 'false') return;

    await Notifications.setNotificationChannelAsync('default', {
      name: 'My Telecom',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
    
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;
    
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    const { lang, authToken } = useApp.getState();
    const sig = `${token}|${lang}|${authToken ? authToken.slice(-16) : ''}`;
    
    if ((await AsyncStorage.getItem('pushSig')) === sig) return;
    
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    
    const res = await fetch(`${customBase(lang)}/device/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token, platform: 'android', lang }),
    });
    
    if (res.ok) await AsyncStorage.setItem('pushSig', sig);
  } catch (e) {}
}

// دالة التحكم بتشغيل أو إيقاف الإشعارات
export async function togglePushNotifications(enable) {
  try {
    await AsyncStorage.setItem('app_notifications_enabled', enable ? 'true' : 'false');
    if (enable) {
      await registerPush();
    } else {
      await AsyncStorage.removeItem('pushSig');
    }
  } catch (e) {}
}

// عند الضغط على إشعار: فتح الطلب أو المنتج أو القسم
export function listenTaps(router) {
  if (inExpoGo) return undefined;
  
  const go = (resp) => {
    const d = resp?.notification?.request?.content?.data || {};
    try {
      if (d.type === 'order' && d.id) router.push('/order/' + d.id);
      else if (d.type === 'product' && d.slug) router.push('/product/' + d.slug);
      else if (d.type === 'category' && d.slug) router.push('/category/' + d.slug);
    } catch (e) {}
  };
  
  try {
    const sub = Notifications.addNotificationResponseReceivedListener(go);
    Notifications.getLastNotificationResponseAsync().then((r) => { if (r) setTimeout(() => go(r), 800); }).catch(() => {});
    return () => sub.remove();
  } catch (e) { return undefined; }
}
