import { useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const W = Dimensions.get('window').width;

export default function Gallery({ images = [], bg }) {
  const [i, setI] = useState(0);
  const list = images.length ? images : [null];
  return (
    <View style={{ direction: 'ltr' }}>
      <FlatList
        data={list}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, k) => String(k)}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item }) => (
          <View style={{ width: W, height: 260, backgroundColor: bg }}>
            {item ? <Image source={item.src || item.thumbnail} style={{ flex: 1 }} contentFit="contain" transition={150} /> : null}
          </View>
        )}
      />
      {list.length > 1 && (
        <View style={s.dots}>
          {list.map((_, k) => <View key={k} style={[s.dot, { opacity: k === i ? 1 : 0.35, width: k === i ? 16 : 6 }]} />)}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  dots: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#9AA0A8' },
});
