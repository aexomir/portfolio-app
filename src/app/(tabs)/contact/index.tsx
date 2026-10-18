import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { copyMenu } from '@/components/menus';
import { useContent } from '@/content';
import { useColors } from '@/theme';
import { Label, Screen, T, useToast } from '@/ui';

export default function Contact() {
  const c = useColors();
  const toast = useToast();
  const { content } = useContent();
  return (
    <Screen>
      <View style={{ marginTop: 36, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
        {content.links.map((l) => (
          <Link key={l.label} href={l.href as `https://${string}`} asChild>
            <Link.Trigger>
              <Pressable style={StyleSheet.flatten([styles.row, { borderColor: c.line2 }])}>
                <Label style={{ width: '100%' }}>{l.label}</Label>
                <T style={styles.value}>{l.value}</T>
                <T style={{ color: c.muted }}>↗</T>
              </Pressable>
            </Link.Trigger>
            {copyMenu(l.value, l.label, toast)}
          </Link>
        ))}
      </View>
      <View style={styles.foot}>
        <Label style={styles.footText}>© {new Date().getFullYear()} {content.profile.name}</Label>
        <Label style={styles.footText}>Hosted on GitHub Pages</Label>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', rowGap: 8, columnGap: 16, paddingVertical: 22, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  value: { flex: 1, fontSize: 21, letterSpacing: -0.42 },
  foot: { marginTop: 48, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
  footText: { letterSpacing: 0.44, textTransform: 'none' },
});
