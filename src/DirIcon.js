import { Ionicons } from '@expo/vector-icons';
import { useApp } from './store';

const LTR = { 'arrow-back': 'arrow-back', 'chevron-back': 'chevron-forward' };
const RTL = { 'arrow-back': 'arrow-forward', 'chevron-back': 'chevron-back' };

export default function DirIcon({ name, ...props }) {
  const rtl = useApp((s) => s.rtl);
  return <Ionicons name={(rtl ? RTL : LTR)[name] || name} {...props} />;
}
