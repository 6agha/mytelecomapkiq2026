import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'wishlist';

export const useWishlist = create((set, get) => ({
  items: [],
  toggle: (p) => {
    const cur = get().items;
    const next = cur.some((x) => x.id === p.id) ? cur.filter((x) => x.id !== p.id) : [p, ...cur];
    set({ items: next });
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  },
}));

AsyncStorage.getItem(KEY).then((v) => {
  try { if (v) useWishlist.setState({ items: JSON.parse(v) }); } catch (e) {}
}).catch(() => {});
