import { Stack } from 'expo-router';

import { font, useColors, useThemePref, type ThemePref } from '@/theme';

/** One stack per tab: native large titles and the theme menu in the top-right glass button. */
export function TabStack({ title, largeTitle = true }: { title: string; largeTitle?: boolean }) {
  const c = useColors();
  const { pref, setPref } = useThemePref();
  const option = (label: string, value: ThemePref) => ({
    type: 'action' as const, label, state: pref === value ? ('on' as const) : ('off' as const), onPress: () => setPref(value),
  });
  return (
    <Stack
      screenOptions={{
        title: largeTitle ? title : '',
        headerLargeTitleEnabled: largeTitle,
        headerLargeTitleStyle: { fontFamily: font.medium, color: c.ink },
        headerTitleStyle: { fontFamily: font.semibold, color: c.ink },
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
        unstable_headerRightItems: () => [
          {
            type: 'menu',
            label: 'Theme',
            accessibilityLabel: 'Theme',
            icon: { type: 'sfSymbol', name: 'circle.lefthalf.filled' },
            menu: { title: 'Appearance', items: [option('System', 'system'), option('Light', 'light'), option('Dark', 'dark')] },
          },
        ],
      }}
    />
  );
}
