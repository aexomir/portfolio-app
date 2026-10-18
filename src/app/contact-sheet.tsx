import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openUrl } from '@/components/menus';
import { useContent } from '@/content';
import { font, useColors } from '@/theme';
import { Label, localTime, PulseDot, T, useNow } from '@/ui';

/** "Get in touch" sheet, opened from Status on Home. Native form sheet: drag down to dismiss. */
export default function ContactSheet() {
  const c = useColors();
  const now = useNow();
  const { profile, links } = useContent().content;
  const mail = links.find((l) => l.href.startsWith('mailto:'));
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: 7, paddingBottom: Math.max(22, insets.bottom) }}>
      <View style={styles.head}>
        <T style={{ fontFamily: font.semibold, fontSize: 17 }}>Get in touch</T>
        <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { backgroundColor: c.fill }]}>
          <SymbolView name="xmark" size={13} weight="semibold" tintColor={c.ink} />
        </Pressable>
      </View>
      <View style={styles.status}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <PulseDot />
          <T style={{ fontSize: 15 }}>{profile.status}</T>
        </View>
        <T style={{ fontFamily: font.mono, fontSize: 12, color: c.muted }}>{profile.city} {localTime(now, profile.timeZone).slice(0, 5)}</T>
      </View>
      <View style={[styles.group, { backgroundColor: c.fill }]}>
        {links.map((l, i) => (
          <Pressable
            key={l.label}
            onPress={() => openUrl(l.href)}
            style={({ pressed }) => [styles.link, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }, pressed && { backgroundColor: c.press }]}>
            <Label style={{ width: 76 }}>{l.label}</Label>
            <T numberOfLines={1} style={{ flex: 1, fontSize: 16, letterSpacing: -0.16 }}>{l.value}</T>
            <T style={{ color: c.muted }}>↗</T>
          </Pressable>
        ))}
      </View>
      {mail ? (
        <Pressable onPress={() => openUrl(mail.href)} style={{ marginTop: 16, marginHorizontal: 12 }}>
          <GlassView isInteractive glassEffectStyle="regular" tintColor={c.accent} style={styles.cta}>
            <T style={{ fontFamily: font.semibold, fontSize: 16, color: c.onAccent }}>Email me</T>
          </GlassView>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { height: 58, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', right: 14, top: 7, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  status: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 26, paddingTop: 6, paddingBottom: 18 },
  group: { marginHorizontal: 12, borderRadius: 26, overflow: 'hidden' },
  link: { flexDirection: 'row', alignItems: 'baseline', gap: 12, paddingVertical: 16, paddingHorizontal: 18 },
  cta: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
