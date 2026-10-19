import { GlassView } from 'expo-glass-effect';
import { useNavigation } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewProps, type TextProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openUrl } from '@/components/menus';
import { useAppStatus, useContent } from '@/content';
import { font, useColors } from '@/theme';

/** Mono uppercase label, the site's `.lbl`. */
export function Label({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text {...props} style={[s.label, { color: c.muted }, style]} />;
}

export function T({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text {...props} style={[{ color: c.ink, fontFamily: font.regular }, style]} />;
}

export function Chevron() {
  const c = useColors();
  return <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={c.muted} />;
}

export function Divider() {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line2 }} />;
}

/** Accent dot with the site's soft pulse. */
export function PulseDot() {
  const c = useColors();
  const p = useSharedValue(0);
  useEffect(() => { p.set(withRepeat(withTiming(1, { duration: 2400 }), -1)); }, [p]);
  const ring = useAnimatedStyle(() => ({ opacity: p.get() < 0.6 ? 0.6 - p.get() : 0, transform: [{ scale: 1 + Math.min(p.get(), 0.6) * 2.8 }] }));
  return (
    <View style={{ width: 6, height: 6 }}>
      <Animated.View style={[StyleSheet.absoluteFill, s.dot, { backgroundColor: c.accent }, ring]} />
      <View style={[s.dot, { backgroundColor: c.accent }]} />
    </View>
  );
}

/** Ticks every second. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export const localTime = (d: Date, timeZone: string) => d.toLocaleTimeString('en-GB', { timeZone, hour12: false });
export function zoneName(d: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'short' }).formatToParts(d).find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** Shows `title` in the nav bar only once the screen has scrolled past `threshold`. */
export function useScrollTitle(title: string, threshold: number) {
  const navigation = useNavigation();
  const shown = useRef<boolean | null>(null);
  const set = useCallback((show: boolean) => {
    if (shown.current === show) return;
    shown.current = show;
    navigation.setOptions({ title: show ? title : '' });
  }, [navigation, title]);
  useEffect(() => { shown.current = null; set(false); }, [set]);
  return useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { y } = e.nativeEvent.contentOffset;
    set(y + e.nativeEvent.contentInset.top > threshold);
  }, [set, threshold]);
}

/** Scroll container for every tab: native large-title insets plus pull to refresh, which re-downloads the content. */
export function Screen({ children, contentContainerStyle, ...props }: ScrollViewProps & { children: ReactNode }) {
  const c = useColors();
  const toast = useToast();
  const { refresh } = useContent();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    const result = await refresh();
    setRefreshing(false);
    toast({ updated: 'Updated', unchanged: 'Up to date', failed: 'Couldn’t refresh, showing saved copy' }[result]);
  };
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[{ paddingBottom: 48 }, contentContainerStyle]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.muted} />}
      {...props}>
      <Notices />
      {children}
    </ScrollView>
  );
}

/** Maintenance banner and new-version notice, both set in Pages CMS under App status. */
function Notices() {
  const c = useColors();
  const { maintenance, update } = useAppStatus();
  if (!maintenance && !update) return null;
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, gap: 8 }}>
      {maintenance ? (
        <View accessibilityRole="alert" style={[s.notice, { backgroundColor: c.fill }]}>
          <Label>Maintenance</Label>
          <T style={s.noticeText}>{maintenance}</T>
        </View>
      ) : null}
      {update ? (
        <Pressable
          disabled={!update.url}
          onPress={() => update.url && openUrl(update.url)}
          accessibilityHint={update.url ? 'Opens the update link' : undefined}
          style={({ pressed }) => [s.notice, { backgroundColor: c.fill }, pressed && { opacity: 0.7 }]}>
          <Label>Update · {update.version}</Label>
          <T style={s.noticeText}>{update.message}</T>
          {update.url ? <T style={[s.noticeText, { color: c.accent, fontFamily: font.medium }]}>Update ↗</T> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

// Toast: a small glass pill under the status bar.
const ToastContext = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState('');
  const shown = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((m: string) => {
    clearTimeout(timer.current);
    setMsg(m);
    shown.set(withSpring(1, { damping: 14, stiffness: 220 }));
    timer.current = setTimeout(() => { shown.set(withTiming(0, { duration: 250 })); }, 1700);
  }, [shown]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: (shown.get() - 1) * 16 }, { scale: 0.9 + shown.get() * 0.1 }],
  }));
  return (
    <ToastContext.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={[s.toastWrap, { top: insets.top + 8 }, style]}>
        <GlassView glassEffectStyle="regular" style={s.toast}>
          <View style={[s.dot, { backgroundColor: c.accent }]} />
          <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>{msg}</Text>
        </GlassView>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export const s = StyleSheet.create({
  label: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.88, textTransform: 'uppercase' },
  pageTitle: { marginHorizontal: 20, marginTop: 6 },
  row: { paddingVertical: 18, paddingHorizontal: 20 },
  name: { fontFamily: font.medium, fontSize: 17, lineHeight: 22, letterSpacing: -0.17 },
  sub: { fontFamily: font.regular, fontSize: 15, lineHeight: 21.75 },
  yr: { fontFamily: font.mono, fontSize: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  toastWrap: { position: 'absolute', alignSelf: 'center' },
  notice: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, gap: 6 },
  noticeText: { fontFamily: font.regular, fontSize: 15, lineHeight: 21 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999, overflow: 'hidden' },
});
