import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { ActionSheetIOS, Pressable, StyleSheet, View } from 'react-native';

import { CERTS } from '@/data';
import { useColors } from '@/theme';
import { s, Screen, T, useToast } from '@/ui';

type Cert = (typeof CERTS)[number];

function CertBody({ cert: [name, issuer, yr, repo] }: { cert: Cert }) {
  const c = useColors();
  return (
    <>
      <View style={{ flex: 1, gap: 5 }}>
        <T style={s.name}>{name}</T>
        <T style={[s.sub, { color: c.muted }]}>{issuer}</T>
        {repo ? <T style={[s.yr, { marginTop: 2, color: c.accent }]}>Repo ↗</T> : null}
      </View>
      <T style={[s.yr, { color: c.muted }]}>{yr}</T>
    </>
  );
}

export default function Certificates() {
  const c = useColors();
  const toast = useToast();
  const rowStyle = ({ pressed }: { pressed: boolean }) => [styles.row, { borderColor: c.line2 }, pressed && { backgroundColor: c.press }];
  const copyTitle = async (name: string) => { await Clipboard.setStringAsync(name); toast('Title copied'); };

  return (
    <Screen>
      <View style={{ marginTop: 28, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line2 }}>
        {CERTS.map((cert) =>
          cert[3] ? (
            // Certificates with a repo open it on tap, with a native context menu on long press.
            <Link key={cert[0]} href={cert[3] as `https://${string}`} target="_blank" asChild>
              <Link.Trigger>
                <Pressable style={StyleSheet.flatten([styles.row, { borderColor: c.line2 }])}><CertBody cert={cert} /></Pressable>
              </Link.Trigger>
              <Link.Menu>
                <Link.MenuAction title="Copy title" icon="doc.on.doc" onPress={() => copyTitle(cert[0])} />
              </Link.Menu>
            </Link>
          ) : (
            <Pressable
              key={cert[0]}
              style={rowStyle}
              onLongPress={() =>
                ActionSheetIOS.showActionSheetWithOptions(
                  { title: cert[0], message: cert[1], options: ['Copy title', 'Cancel'], cancelButtonIndex: 1, tintColor: c.accent },
                  (i) => { if (i === 0) copyTitle(cert[0]); },
                )
              }>
              <CertBody cert={cert} />
            </Pressable>
          ),
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 16, paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
});
