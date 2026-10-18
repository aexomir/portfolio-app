import { GlassView } from 'expo-glass-effect';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openUrl } from '@/components/menus';
import { kicker, useContent } from '@/content';
import { font, useColors } from '@/theme';
import { Chevron, Label, s, Screen, T, useScrollTitle } from '@/ui';

export default function ProjectDetail() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { projects } = useContent().content;
  // A slug that was deleted in the CMS falls back to the first project.
  const i = Math.max(0, projects.findIndex((p) => p.slug === slug));
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const onScroll = useScrollTitle(p?.name ?? '', 90);
  const line = { borderColor: c.line2, borderBottomWidth: StyleSheet.hairlineWidth };
  if (!p) return null; // every project was deleted

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Screen onScroll={onScroll} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
          <Label>{kicker(p)}</Label>
          <T style={styles.title}>{p.name}</T>
          <T style={styles.lead}>{p.summary}</T>
        </View>

        <View style={{ marginTop: 28, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
          {(p.facts ?? []).map((f) => (
            <View key={f.label} style={[styles.fact, line]}>
              <Label style={{ width: 100 }}>{f.label}</Label>
              <T style={{ flex: 1, fontSize: 15, lineHeight: 21.75 }}>{f.value}</T>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace(`/project/${next.slug}`)}
          style={({ pressed }) => [styles.next, line, { borderTopWidth: StyleSheet.hairlineWidth }, pressed && { backgroundColor: c.press }]}>
          <View style={{ flex: 1, gap: 6 }}>
            <Label>Next</Label>
            <T style={s.name}>{next.name}</T>
          </View>
          <Chevron />
        </Pressable>
      </Screen>

      <View style={[styles.bar, { bottom: insets.bottom + 8 }]} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Share"
          onPress={() => Share.share({ message: p.repo ? `${p.name}: ${p.repo}` : p.name, url: p.repo || undefined })}>
          <GlassView isInteractive glassEffectStyle="regular" style={styles.round}>
            <SymbolView name="square.and.arrow.up" size={20} tintColor={c.ink} />
          </GlassView>
        </Pressable>
        {p.repo ? (
          <Pressable onPress={() => openUrl(p.repo)}>
            <GlassView isInteractive glassEffectStyle="regular" tintColor={c.accent} style={styles.pill}>
              <T style={{ fontFamily: font.semibold, fontSize: 16, color: c.onAccent }}>View on GitHub ↗</T>
            </GlassView>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.medium, fontSize: 34, lineHeight: 37.4, letterSpacing: -1.02 },
  lead: { marginTop: 4, fontSize: 17, lineHeight: 27.2, letterSpacing: -0.17 },
  fact: { flexDirection: 'row', alignItems: 'baseline', gap: 12, paddingVertical: 15, paddingHorizontal: 20 },
  next: { marginTop: 36, flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, paddingHorizontal: 20 },
  bar: { position: 'absolute', left: 21, right: 21, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  round: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pill: { height: 54, paddingHorizontal: 26, borderRadius: 27, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
