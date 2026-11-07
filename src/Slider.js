import { useEffect, useRef, useState } from 'react';
import { FlatList, View, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import PressableScale from './PressableScale';

const W = Dimensions.get('window').width;
const INTERVAL = 3000;

export default function Slider({ slides = [], onPress, bg }) {
  const n = slides.length;
  const data = n > 1 ? [...slides, slides[0]] : slides;
  const ref = useRef(null);
  const idx = useRef(0);
  const nRef = useRef(n);
  const timer = useRef(null);
  const jump = useRef(null);
  const [active, setActive] = useState(0);
  nRef.current = n;

  const goTo = (index, animated) => {
    try { ref.current?.scrollToIndex({ index, animated }); } catch (e) {}
  };
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  const start = () => {
    stop();
    if (nRef.current < 2) return;
    timer.current = setInterval(() => {
      if (idx.current >= nRef.current) return;
      goTo(idx.current + 1, true);
    }, INTERVAL);
  };

  const onViewable = useRef(({ viewableItems }) => {
    const v = viewableItems?.[0];
    if (!v || v.index == null) return;
    idx.current = v.index;
    setActive(v.index % nRef.current);
    if (v.index === nRef.current) {
      clearTimeout(jump.current);
      jump.current = setTimeout(() => goTo(0, false), 300);
    }
  }).current;
  const cfg = useRef({ itemVisiblePercentThreshold: 70 }).current;

  useEffect(() => { start(); return () => { stop(); clearTimeout(jump.current); }; }, [n]);

  return (
    <View style={{ marginTop: 12, marginBottom: 20, direction: 'ltr' }}>
      <FlatList
        ref={ref}
        data={data}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        initialNumToRender={data.length}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={cfg}
        onScrollBeginDrag={stop}
        onScrollEndDrag={start}
        renderItem={({ item }) => (
          <PressableScale onPress={() => onPress?.(item.target)}>
            <Image source={item.image} style={[s.img, { backgroundColor: bg }]} contentFit="cover" transition={150} />
          </PressableScale>
        )}
      />
      {n > 1 && (
        <View style={s.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[s.dot, { opacity: i === active ? 1 : 0.35, width: i === active ? 18 : 6 }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  img: { width: W - 32, height: (W - 32) * 0.45, borderRadius: 16, marginHorizontal: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 10 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#9AA0A8' },
});
