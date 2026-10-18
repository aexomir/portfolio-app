import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { font, useColors } from '@/theme';
import { Chevron, Label, PulseDot, Screen, T, turinTime, turinZone, useNow, useScrollTitle } from '@/ui';

const LINES = ['Amir', 'Ranjbar'];
const COUNT = LINES.join('').length;
// Geist ships static weights here, so the wave steps through the nearest one.
const WEIGHTS: [number, string][] = [[300, font.light], [400, font.regular], [500, font.medium], [600, font.semibold]];
const familyFor = (w: number) => WEIGHTS.reduce((best, cur) => (Math.abs(cur[0] - w) < Math.abs(best[0] - w) ? cur : best))[1];
const weightAt = (d: number, radius: number) => 300 + 260 * Math.pow(Math.max(0, 1 - d / radius), 2);

/** "Amir Ranjbar" with a bold wave that sweeps out from a point (on load, and wherever you tap). */
function Hero() {
  const c = useColors();
  const heroRef = useRef<ComponentRef<typeof View>>(null);
  const centers = useRef<number[]>(new Array(COUNT).fill(0));
  const raf = useRef(0);
  const [weights, setWeights] = useState<number[]>(() => new Array(COUNT).fill(300));

  const ripple = (originX: number) => {
    const reach = Math.max(...centers.current.map((x) => Math.abs(x - originX))) + 80;
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      const front = reach * (1 - Math.pow(1 - t, 2));
      setWeights(centers.current.map((x) => (t < 1 ? weightAt(Math.abs(Math.abs(x - originX) - front), 70) : 300)));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const id = setTimeout(() => ripple(30), 1300);
    return () => { clearTimeout(id); cancelAnimationFrame(raf.current); };
  }, []);

  const onPress = (e: GestureResponderEvent) => {
    const { pageX } = e.nativeEvent;
    heroRef.current?.measureInWindow((x) => ripple(pageX - x));
  };

  let i = 0;
  return (
    <Pressable onPressIn={onPress} accessibilityRole="header" accessibilityLabel="Amir Ranjbar">
      <View ref={heroRef} style={{ marginTop: 22 + 13, marginBottom: 13, marginLeft: -5 }}>
        {LINES.map((line) => (
          <View key={line} style={styles.line}>
            {line.split('').map((ch) => {
              const idx = i++;
              return (
                <Text
                  key={idx}
                  onLayout={(e) => { centers.current[idx] = e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2; }}
                  style={[styles.letter, { color: c.ink, fontFamily: familyFor(weights[idx]) }]}>
                  {ch}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    </Pressable>
  );
}


export default function Home() {
  const c = useColors();
  const now = useNow();
  const onScroll = useScrollTitle('Amir Ranjbar', 230);
  const border = { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line2 };
  return (
    <Screen onScroll={onScroll}>
      <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
        <Label>Software Engineer · React Native &amp; ML</Label>
        <Hero />
        <T style={styles.intro}>
          I build fast, reliable mobile apps with React Native, shipped to a combined 100M+ users at Digikala and MyMCI. Now I&apos;m doing an MSc in AI at Politecnico di Torino, working on LLM systems and on-device ML. See my{' '}
          <Text onPress={() => router.navigate('/projects')} style={{ textDecorationLine: 'underline', textDecorationColor: c.line2 }}>projects</Text>.
        </T>
      </View>

      <View style={{ marginTop: 40, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
        <View style={[styles.stat, border]}>
          <Label style={styles.statKey}>Currently</Label>
          <T style={{ fontSize: 15 }}>MSc AI · Politecnico di Torino</T>
        </View>
        <View style={[styles.stat, border]}>
          <Label style={styles.statKey}>Turin</Label>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <T style={{ fontFamily: font.mono, fontSize: 15 }}>{turinTime(now)}</T>
            <Label style={{ letterSpacing: 0 }}>{turinZone(now)}</Label>
          </View>
        </View>
        <Pressable onPress={() => router.push('/contact-sheet')} style={({ pressed }) => [styles.stat, border, pressed && { backgroundColor: c.press }]}>
          <Label style={styles.statKey}>Status</Label>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <PulseDot />
            <T style={{ fontSize: 15 }}>Open to new roles</T>
          </View>
          <Chevron />
        </Pressable>
      </View>

      <View style={styles.foot}>
        <Label style={{ letterSpacing: 0.44, textTransform: 'none' }}>© 2026 Amir Ranjbar</Label>
        <Label style={{ letterSpacing: 0.44, textTransform: 'none' }}>aexomir.me</Label>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // iOS clips glyphs taller than the line box, so the box is taller and the lines overlap instead.
  letter: { fontSize: 96, lineHeight: 112, letterSpacing: -5.28 },
  line: { flexDirection: 'row', marginVertical: -13 },
  intro: { marginTop: 40, fontSize: 17, lineHeight: 27.2, letterSpacing: -0.17 },
  stat: { flexDirection: 'row', alignItems: 'center', paddingVertical: 17, paddingHorizontal: 20 },
  statKey: { width: 100 },
  foot: { marginTop: 44, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
});
