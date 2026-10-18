import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Share } from 'react-native';

import type { Project } from '@/content';
type Toast = (msg: string) => void;

export const openUrl = (href: string) =>
  href.startsWith('http') ? WebBrowser.openBrowserAsync(href) : Linking.openURL(href);

// Link only picks up a menu that is its direct child, so these return the element instead of being components.

/** Native context menu actions for a project row (press and hold). */
export function projectMenu(p: Project, toast: Toast) {
  return (
    <Link.Menu>
      {p.repo ? <Link.MenuAction title="Open on GitHub" icon="arrow.up.right.square" onPress={() => openUrl(p.repo)} /> : null}
      {p.repo ? (
        <Link.MenuAction
          title="Copy link"
          icon="link"
          onPress={async () => { await Clipboard.setStringAsync(p.repo); toast('Link copied'); }}
        />
      ) : null}
      <Link.MenuAction
        title="Share"
        icon="square.and.arrow.up"
        onPress={() => Share.share({ message: p.repo ? `${p.name}: ${p.repo}` : p.name, url: p.repo || undefined })}
      />
    </Link.Menu>
  );
}

/** Menu for an outbound link: copy it (tap still opens it). */
export function copyMenu(value: string, what: string, toast: Toast) {
  return (
    <Link.Menu>
      <Link.MenuAction title="Copy" icon="doc.on.doc" onPress={async () => { await Clipboard.setStringAsync(value); toast(`${what} copied`); }} />
    </Link.Menu>
  );
}
