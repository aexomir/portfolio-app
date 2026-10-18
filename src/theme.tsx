import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Tokens from aexomir.me. Accents are the site's oklch values converted to sRGB.
export const palette = {
  light: {
    bg: '#f6f5f2', ink: '#171716', muted: '#6c6b66', line: 'rgba(23,23,22,0.1)', line2: 'rgba(23,23,22,0.22)',
    accent: '#267b4c', onAccent: '#ffffff', fill: 'rgba(23,23,22,0.06)', press: 'rgba(23,23,22,0.05)', thumb: '#ffffff',
  },
  dark: {
    bg: '#131312', ink: '#ecebe6', muted: '#93928c', line: 'rgba(236,235,230,0.12)', line2: 'rgba(236,235,230,0.26)',
    accent: '#74c692', onAccent: '#0f1a14', fill: 'rgba(236,235,230,0.08)', press: 'rgba(236,235,230,0.06)', thumb: 'rgba(236,235,230,0.16)',
  },
};
export type Colors = typeof palette.light;

export const font = {
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
};

export type ThemePref = 'system' | 'light' | 'dark';

const ThemeContext = createContext<{ pref: ThemePref; setPref: (p: ThemePref) => void }>({ pref: 'system', setPref: () => {} });

// Theme follows the system until the visitor picks one from the theme menu.
// shortcut: the choice is not persisted across launches, add expo-sqlite/kv-store if wanted.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemePref>('system');
  useEffect(() => {
    // Overriding the app's color scheme also restyles native chrome (tab bar, headers, menus).
    Appearance.setColorScheme(pref === 'system' ? 'unspecified' : pref);
  }, [pref]);
  return <ThemeContext.Provider value={{ pref, setPref }}>{children}</ThemeContext.Provider>;
}

export const useThemePref = () => useContext(ThemeContext);

export function useColors(): Colors {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
