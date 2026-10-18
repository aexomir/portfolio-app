import { Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ContentProvider } from '@/content';
import { font, palette, ThemeProvider } from '@/theme';
import { ToastProvider } from '@/ui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, GeistMono_400Regular });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return (
    <ThemeProvider>
      <ContentProvider>
        <Navigation />
      </ContentProvider>
    </ThemeProvider>
  );
}

function Navigation() {
  const dark = useColorScheme() === 'dark';
  const c = palette[dark ? 'dark' : 'light'];
  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: c.bg, card: c.bg, text: c.ink, primary: c.accent, border: c.line } };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavThemeProvider value={navTheme}>
        <ToastProvider>
          <Stack screenOptions={{ headerTitleStyle: { fontFamily: font.semibold }, headerTintColor: c.ink, contentStyle: { backgroundColor: c.bg } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="project/[slug]" options={{ title: '', headerBackTitle: 'Projects', headerTransparent: true }} />
            <Stack.Screen
              name="contact-sheet"
              options={{ presentation: 'formSheet', headerShown: false, sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, sheetCornerRadius: 40, contentStyle: { backgroundColor: 'transparent' } }}
            />
          </Stack>
        </ToastProvider>
      </NavThemeProvider>
    </GestureHandlerRootView>
  );
}
