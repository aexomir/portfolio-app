import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { projectMenu } from '@/components/menus';
import { TYPES, useContent, type Project } from '@/content';
import { font, useColors } from '@/theme';
import { Chevron, s, Screen, T, useToast } from '@/ui';

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
              <T style={[s.yr, { color: c.muted }]}>{p.year}</T>
            </View>
            <T style={[s.sub, { color: c.muted }]}>{p.summary}</T>
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
  const { projects } = useContent().content;
  // One segment per project type that has projects, in a fixed order.
  const filters = TYPES.filter((t) => projects.some((p) => p.type === t));
  const [picked, setPicked] = useState(0);
  const at = Math.min(picked, Math.max(0, filters.length - 1));
  const n = Math.max(1, filters.length);
  const segW = useSharedValue(0);
  const seg = useSharedValue(0); // index of the selected segment; follows the finger while dragging
  const listX = useSharedValue(0);
  const listO = useSharedValue(1);

  const select = (i: number) => {
    seg.set(withSpring(i, { damping: 16, stiffness: 220 }));
    if (i === at) { listX.set(withSpring(0)); return; }
    // New list slides in from the side it came from, like the prototype.
    listX.set(i > at ? 90 : -90);
    listO.set(0);
    setPicked(i);
    listX.set(withTiming(0, { duration: 380 }));
    listO.set(withTiming(1, { duration: 300 }));
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const atEdge = (at === 0 && e.translationX > 0) || (at === n - 1 && e.translationX < 0);
      listX.set(atEdge ? e.translationX * 0.22 : e.translationX);
      seg.set(Math.min(n - 1, Math.max(0, at - (e.translationX * 0.7) / Math.max(1, segW.get()))));
    })
    .onEnd((e) => {
      const next = e.translationX < -50 && at < n - 1 ? at + 1 : e.translationX > 50 && at > 0 ? at - 1 : -1;
      if (next >= 0) scheduleOnRN(select, next);
      else { listX.set(withSpring(0)); seg.set(withSpring(at)); }
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
        onLayout={(e: LayoutChangeEvent) => { segW.set((e.nativeEvent.layout.width - 8) / n); }}>
        <Animated.View style={[styles.thumb, { backgroundColor: c.thumb }, thumb]} />
        {filters.map((f, i) => (
          <Pressable key={f} onPress={() => select(i)} style={styles.segItem} accessibilityRole="tab" accessibilityState={{ selected: i === at }}>
            <T style={{ fontFamily: font.medium, fontSize: 14, color: i === at ? c.ink : c.muted }}>{f}</T>
            <T style={[s.yr, { fontSize: 11, color: c.muted }]}>{projects.filter((p) => p.type === f).length}</T>
          </Pressable>
        ))}
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ marginTop: 12, minHeight: 420, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }, listStyle]}>
          {projects.filter((p) => p.type === filters[at]).map((p) => <ProjectRow key={p.slug} p={p} />)}
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
