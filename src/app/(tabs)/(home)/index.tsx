import { router } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { useAppStatus, useContent } from '@/content';
import { font, useColors } from '@/theme';
import { Chevron, Label, localTime, PulseDot, Screen, T, useNow, useScrollTitle, zoneName } from '@/ui';

// Geist ships static weights here, so the wave steps through the nearest one.
const WEIGHTS: [number, string][] = [[300, font.light], [400, font.regular], [500, font.medium], [600, font.semibold]];
const familyFor = (w: number) => WEIGHTS.reduce((best, cur) => (Math.abs(cur[0] - w) < Math.abs(best[0] - w) ? cur : best))[1];
const weightAt = (d: number, radius: number) => 300 + 260 * Math.pow(Math.max(0, 1 - d / radius), 2);

/** The name, one word per line, with a bold wave that sweeps out from a point (on load, and wherever you tap). */
function Hero({ name, wave }: { name: string; wave: boolean }) {
  const c = useColors();
  const lines = name.split(/\s+/);
  const count = lines.join('').length;
  const heroRef = useRef<ComponentRef<typeof View>>(null);
  const centers = useRef<number[]>([]);
  const raf = useRef(0);
  const [weights, setWeights] = useState<number[]>([]);

  const ripple = (originX: number) => {
    if (!wave) return;
    const xs = centers.current.slice(0, count);
    const reach = Math.max(...xs.map((x) => Math.abs(x - originX))) + 80;
    let start: number | undefined;
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / 1100);
      const front = reach * (1 - Math.pow(1 - t, 2));
      setWeights(xs.map((x) => (t < 1 ? weightAt(Math.abs(Math.abs(x - originX) - front), 70) : 300)));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onLoad = useEffectEvent(() => ripple(30));
  useEffect(() => {
    const id = setTimeout(onLoad, 1300);
    return () => { clearTimeout(id); cancelAnimationFrame(raf.current); };
  }, []);

  const onPress = (e: GestureResponderEvent) => {
    const { pageX } = e.nativeEvent;
    heroRef.current?.measureInWindow((x) => ripple(pageX - x));
  };

  let i = 0;
  return (
    <Pressable onPressIn={onPress} accessibilityRole="header" accessibilityLabel={name}>
      <View ref={heroRef} style={{ marginTop: 22 + 13, marginBottom: 13, marginLeft: -5 }}>
        {lines.map((line, li) => (
          <View key={li} style={styles.line}>
            {line.split('').map((ch) => {
              const idx = i++;
              return (
                <Text
                  key={idx}
                  onLayout={(e) => { centers.current[idx] = e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2; }}
                  style={[styles.letter, { color: c.ink, fontFamily: familyFor(weights[idx] ?? 300) }]}>
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
  const { profile } = useContent().content;
  const { on } = useAppStatus();
  const sheet = on('contactSheet');
  const onScroll = useScrollTitle(profile.name, 230);
  const border = { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line2 };
  return (
    <Screen onScroll={onScroll}>
      <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
        <Label>{profile.title}</Label>
        <Hero name={profile.name} wave={on('nameWave')} />
        <T style={styles.intro}>
          {profile.intro} See my{' '}
          <Text onPress={() => router.navigate('/projects')} style={{ textDecorationLine: 'underline', textDecorationColor: c.line2 }}>projects</Text>.
        </T>
      </View>

      <View style={{ marginTop: 40, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
        <View style={[styles.stat, border]}>
          <Label style={styles.statKey}>Currently</Label>
          <T style={{ fontSize: 15 }}>{profile.currently}</T>
        </View>
        {on('liveClock') ? (
          <View style={[styles.stat, border]}>
            <Label style={styles.statKey}>{profile.city}</Label>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <T style={{ fontFamily: font.mono, fontSize: 15 }}>{localTime(now, profile.timeZone)}</T>
              <Label style={{ letterSpacing: 0 }}>{zoneName(now, profile.timeZone)}</Label>
            </View>
          </View>
        ) : null}
        <Pressable disabled={!sheet} onPress={() => router.push('/contact-sheet')} style={({ pressed }) => [styles.stat, border, pressed && { backgroundColor: c.press }]}>
          <Label style={styles.statKey}>Status</Label>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <PulseDot />
            <T style={{ fontSize: 15 }}>{profile.status}</T>
          </View>
          {sheet ? <Chevron /> : null}
        </Pressable>
      </View>

      <View style={styles.foot}>
        <Label style={{ letterSpacing: 0.44, textTransform: 'none' }}>© {now.getFullYear()} {profile.name}</Label>
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
