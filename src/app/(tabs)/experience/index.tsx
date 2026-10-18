import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EXPERIENCE } from '@/data';
import { useColors } from '@/theme';
import { s, Screen, T } from '@/ui';

export default function Experience() {
  const c = useColors();
  return (
    <Screen>
      <View style={{ marginTop: 28, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
        {EXPERIENCE.map(([yr, role, company]) => (
          <View key={role + company} style={[styles.row, { borderColor: c.line2 }]}>
            <T style={[s.yr, { width: 100, color: c.muted }]}>{yr}</T>
            <View style={{ flex: 1, gap: 4 }}>
              <T style={s.name}>{role}</T>
              <T style={[s.sub, { color: c.muted }]}>{company}</T>
            </View>
          </View>
        ))}
      </View>
      <Pressable onPress={() => router.navigate('/certificates')} style={{ marginTop: 36, marginHorizontal: 20 }}>
        {({ pressed }) => <T style={{ fontSize: 15, color: pressed ? c.accent : c.muted }}>Certificates →</T>}
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 12, paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
});
