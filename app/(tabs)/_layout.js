import PressableScale from '../../src/PressableScale';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '../../src/i18n';
import { useTheme } from '../../src/theme';

export default function TabsLayout() {
  const t = useT();
  const c = useTheme();
  const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarButton: (p) => <PressableScale {...p} />, tabBarActiveTintColor: c.text, tabBarInactiveTintColor: c.sub, tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border } }}>
      <Tabs.Screen name="index" options={{ title: t('home'), tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="categories" options={{ title: t('categories'), tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="cart" options={{ title: t('cart'), tabBarIcon: icon('cart-outline') }} />
      <Tabs.Screen name="account" options={{ title: t('account'), tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}
