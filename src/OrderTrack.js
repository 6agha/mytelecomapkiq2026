import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './theme';
import { useT } from './i18n';

const STEP = { pending: 0, 'on-hold': 0, processing: 1, completed: 2 };
const BAD = { cancelled: 'statusCancelled', refunded: 'statusRefunded', failed: 'statusFailed' };
const STEPS = ['stepReceived', 'stepProcessing', 'stepCompleted'];

export default function OrderTrack({ status, label }) {
  const c = useTheme(); const t = useT();
  const box = [s.card, { backgroundColor: c.card, borderColor: c.border }];

  if (BAD[status]) {
    return (
      <View style={box}>
        <View style={s.badRow}>
          <Ionicons name="close-circle" size={22} color={c.sale} />
          <Text style={{ color: c.sale, fontWeight: 'bold', fontSize: 15 }}>{t(BAD[status])}</Text>
        </View>
      </View>
    );
  }

  const cur = STEP[status];
  if (cur === undefined) {
    return (
      <View style={box}>
        <Text style={{ color: c.text, fontWeight: 'bold', textAlign: 'center' }}>{label || status}</Text>
      </View>
    );
  }

  return (
    <View style={box}>
      <View style={s.cols}>
        {STEPS.map((k, i) => (
          <View key={k} style={s.col}>
            {i < STEPS.length - 1 && <View style={[s.bar, { backgroundColor: i < cur ? c.text : c.border }]} />}
            <View style={[s.dot, { backgroundColor: i <= cur ? c.text : c.card, borderColor: i <= cur ? c.text : c.border }]}>
              {i <= cur && <Ionicons name="checkmark" size={14} color={c.bg} />}
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, textAlign: 'center', color: i <= cur ? c.text : c.sub, fontWeight: i === cur ? '700' : '400' }}>{t(k)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  cols: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center' },
  bar: { position: 'absolute', top: 11, start: '50%', width: '100%', height: 2 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  badRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
