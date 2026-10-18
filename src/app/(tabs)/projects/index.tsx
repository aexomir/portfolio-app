import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { projectMenu } from '@/components/menus';
import { PROJECTS, type Project } from '@/data';
import { font, useColors } from '@/theme';
import { Chevron, s, Screen, T, useToast } from '@/ui';

const FILTERS = ['Apps', 'Research'] as const;
type Filter = (typeof FILTERS)[number];
const count = (f: Filter) => PROJECTS.filter((p) => p.type === f).length;

function ProjectRow({ p }: { p: Project }) {
  const c = useColors();
  const toast = useToast();
  return (
    <Link href={`/project/${p.slug}`} asChild>
      <Link.Trigger>
        <Pressable style={StyleSheet.flatten([styles.row, { borderColor: c.line2 }])}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.rowTop}>
              <T style={[s.name, { flexShrink: 1 }]}>{p.name}</T>
              <T style={[s.yr, { color: c.muted }]}>{p.yr}</T>
            </View>
            <T style={[s.sub, { color: c.muted }]}>{p.sub}</T>
          </View>
          <Chevron />
        </Pressable>
      </Link.Trigger>
      <Link.Preview />
      {projectMenu(p, toast)}
    </Link>
  );
}

export default function Projects() {
  const c = useColors();
  const [filter, setFilter] = useState<Filter>('Apps');
  const segW = useSharedValue(0);
  const seg = useSharedValue(0); // 0 = Apps, 1 = Research; follows the finger while dragging
  const listX = useSharedValue(0);
  const listO = useSharedValue(1);

  const select = (f: Filter) => {
    const to = f === 'Apps' ? 0 : 1;
    seg.set(withSpring(to, { damping: 16, stiffness: 220 }));
    if (f === filter) { listX.set(withSpring(0)); return; }
    // New list slides in from the side it came from, like the prototype.
    listX.set(to ? 90 : -90);
    listO.set(0);
    setFilter(f);
    listX.set(withTiming(0, { duration: 380 }));
    listO.set(withTiming(1, { duration: 300 }));
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const atEdge = (filter === 'Apps' && e.translationX > 0) || (filter === 'Research' && e.translationX < 0);
      listX.set(atEdge ? e.translationX * 0.22 : e.translationX);
      const base = filter === 'Apps' ? 0 : 1;
      seg.set(Math.min(1, Math.max(0, base - (e.translationX * 0.7) / Math.max(1, segW.get()))));
    })
    .onEnd((e) => {
      const next: Filter | null = e.translationX < -50 && filter === 'Apps' ? 'Research' : e.translationX > 50 && filter === 'Research' ? 'Apps' : null;
      if (next) scheduleOnRN(select, next);
      else { listX.set(withSpring(0)); seg.set(withSpring(filter === 'Apps' ? 0 : 1)); }
    });

  const thumb = useAnimatedStyle(() => ({
    width: segW.get(),
    transform: [{ translateX: seg.get() * segW.get() }, { scale: interpolate(Math.abs(listX.get()), [0, 40], [1, 1.06], 'clamp') }],
  }));
  const listStyle = useAnimatedStyle(() => ({ opacity: listO.get(), transform: [{ translateX: listX.get() }] }));

  return (
    <Screen>
      <View
        style={[styles.seg, { backgroundColor: c.fill }]}
        onLayout={(e: LayoutChangeEvent) => { segW.set((e.nativeEvent.layout.width - 8) / 2); }}>
        <Animated.View style={[styles.thumb, { backgroundColor: c.thumb }, thumb]} />
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => select(f)} style={styles.segItem} accessibilityRole="tab" accessibilityState={{ selected: f === filter }}>
            <T style={{ fontFamily: font.medium, fontSize: 14, color: f === filter ? c.ink : c.muted }}>{f}</T>
            <T style={[s.yr, { fontSize: 11, color: c.muted }]}>{count(f)}</T>
          </Pressable>
        ))}
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ marginTop: 12, minHeight: 420, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }, listStyle]}>
          {PROJECTS.filter((p) => p.type === filter).map((p) => <ProjectRow key={p.slug} p={p} />)}
        </Animated.View>
      </GestureDetector>
    </Screen>
  );
}

const styles = StyleSheet.create({
  seg: { marginTop: 20, marginHorizontal: 20, height: 40, borderRadius: 20, padding: 4, flexDirection: 'row' },
  thumb: { position: 'absolute', top: 4, left: 4, bottom: 4, borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.10)' },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
});
