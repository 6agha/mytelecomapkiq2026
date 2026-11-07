import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { registerPush, listenTaps } from '../src/push';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApp } from '../src/store';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export default function Root() {
  const { ready, load, dark, rtl, authToken, lang } = useApp();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => { load(); }, []);
  useEffect(() => listenTaps(router), []);
  useEffect(() => { if (ready) registerPush(); }, [ready, authToken, lang]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(logoScale, { toValue: 1.08, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1.35, duration: 450, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(screenOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start(() => setShowSplash(false));
  }, [ready]);

  return (
    <QueryClientProvider client={qc}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }}>
        <Stack screenOptions={{ headerShown: false, animation: rtl ? 'slide_from_left' : 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="order/[id]" options={{ animation: rtl ? 'slide_from_left' : 'slide_from_right' }} />
        </Stack>
      </View>

      {showSplash && (
        <Animated.View style={[s.splash, { opacity: screenOpacity }]} pointerEvents="none">
          <Animated.Image
            source={require('../assets/splash-logo.png')}
            style={[s.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </QueryClientProvider>
  );
}

const s = StyleSheet.create({
  splash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#101112', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  logo: { width: 200, height: 200 },
});
