import OrderTrack from '../../src/OrderTrack';
import DirIcon from '../../src/DirIcon';
import PressableScale from '../../src/PressableScale';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder } from '../../src/api';
import { useTheme, money } from '../../src/theme';
import { useT } from '../../src/i18n';

// دالة لتنظيف وسوم HTML والنصوص الزائدة من اسم المنتج
const cleanItemName = (name) => {
  if (!name) return '';
  return name.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').trim();
};

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const c = useTheme(); const t = useT(); const r = useRouter();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  if (isLoading) return <View style={[s.center, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} size="large" /></View>;
  if (isError || !order) return <View style={[s.center, { backgroundColor: c.bg }]}><Text style={{ color: c.text }} onPress={refetch}>{t('error')} · {t('retry')}</Text></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <PressableScale onPress={() => r.back()} style={s.back}><DirIcon name="arrow-back" size={24} color={c.text} /></PressableScale>
        <Text style={[s.headerTitle, { color: c.text }]}>{t('orderDetails')} #{order.number}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <OrderTrack status={order.status} label={order.status_label} />
        {/* عنوان التوصيل */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>{t('deliveryAddress')}</Text>
          <Text style={{ color: c.text, fontWeight: 'bold', marginBottom: 4 }}>{order.billing?.first_name} {order.billing?.last_name}</Text>
          <Text style={{ color: c.sub }}>{order.billing?.city}</Text>
          <Text style={{ color: c.sub }}>{order.billing?.address_1}</Text>
          <Text style={{ color: c.sub, marginTop: 4 }}>{t('phone')}: {order.billing?.phone}</Text>
        </View>

        {/* قائمة المنتجات */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>{t('products')} ({order.items?.length || 0})</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={[s.itemRow, { borderBottomColor: c.border, borderBottomWidth: idx === order.items.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
              <Image source={item.image} style={s.itemImg} contentFit="contain" />
              <View style={{ flex: 1 }}>
                {/* هنا استخدام الدالة لتنظيف الاسم المباشر */}
                <Text style={[s.itemName, { color: c.text }]} numberOfLines={2}>{cleanItemName(item.name)}</Text>
                <Text style={{ color: c.sub, fontSize: 12, marginTop: 4 }}>{t('qty')}: {item.qty}</Text>
              </View>
              <Text style={{ color: c.accent, fontWeight: 'bold' }}>{money(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ملخص الفاتورة */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>{t('invoiceSummary')}</Text>
          <View style={s.row}>
            <Text style={{ color: c.sub }}>{t('subtotal')}</Text>
            <Text style={{ color: c.text }}>{money(order.subtotal || order.total)}</Text>
          </View>
          <View style={[s.row, { marginTop: 8 }]}>
            <Text style={{ color: c.sub }}>{t('shipping')}</Text>
            <Text style={{ color: c.text }}>{money(order.shipping_total || 0)}</Text>
          </View>
          <View style={[s.row, { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
            <Text style={{ color: c.text, fontWeight: 'bold', fontSize: 16 }}>{t('grandTotal')}</Text>
            <Text style={{ color: c.accent, fontWeight: 'bold', fontSize: 18 }}>{money(order.total)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { marginEnd: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  itemImg: { width: 60, height: 60, borderRadius: 8 },
  itemName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
