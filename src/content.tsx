import { File, Paths } from 'expo-file-system';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import bundled from './content.json';

// Same file the website is built from. Edit it in Pages CMS (or content.json in aexomir/aexomir.github.io).
export const CONTENT_URL = 'https://aexomir.me/content.json';

export type Project = {
  slug: string;
  name: string;
  type: 'Apps' | 'Research' | 'Open Source';
  year: string;
  summary: string;
  repo?: string | null;
  facts?: { label: string; value: string }[];
};
export type Content = {
  profile: { name: string; title: string; description: string; intro: string; currently: string; city: string; timeZone: string; status: string };
  projects: Project[];
  experience: { years: string; role: string; company: string }[];
  certificates: { name: string; issuer: string; year: string; url?: string | null }[];
  links: { label: string; value: string; href: string }[];
};

export const TYPES: Project['type'][] = ['Apps', 'Research', 'Open Source'];
export const kicker = (p: Project) => `${p.type === 'Apps' ? 'App' : p.type} · ${p.year}`;

const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
// Pages CMS may drop an empty optional field or save it as null.
const optional = (v: unknown) => v == null || typeof v === 'string';
const all = (list: unknown, keys: string[]) =>
  Array.isArray(list) && list.every((item) => item && keys.every((k) => str((item as Record<string, unknown>)[k])));

/** The website build checks content in detail; the app only refuses a file whose shape would crash a screen. */
export function isContent(c: unknown): c is Content {
  const x = c as Content;
  return (
    !!x &&
    ['name', 'title', 'intro', 'currently', 'city', 'timeZone', 'status'].every((k) => str((x.profile as Record<string, unknown>)?.[k])) &&
    all(x.projects, ['slug', 'name', 'type', 'year', 'summary']) &&
    x.projects.every((p) => TYPES.includes(p.type) && optional(p.repo) && all(p.facts ?? [], ['label', 'value'])) &&
    all(x.experience, ['years', 'role', 'company']) &&
    all(x.certificates, ['name', 'issuer', 'year']) &&
    x.certificates.every((cert) => optional(cert.url)) &&
    all(x.links, ['label', 'value', 'href'])
  );
}

if (!isContent(bundled)) throw new Error('src/content.json is invalid; run npm run sync-content');

const cache = new File(Paths.document, 'content.json');

type Refresh = 'updated' | 'unchanged' | 'failed';
const ContentContext = createContext<{ content: Content; refresh: () => Promise<Refresh> }>({
  content: bundled as Content,
  refresh: async () => 'failed',
});

/** Shows the bundled copy first, then the last downloaded copy, then a fresh download. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(bundled as Content);

  const refresh = useCallback(async (): Promise<Refresh> => {
    try {
      const res = await fetch(CONTENT_URL, { cache: 'no-store' });
      if (!res.ok) return 'failed';
      const text = await res.text();
      const next: unknown = JSON.parse(text);
      if (!isContent(next)) return 'failed'; // keep the last good copy
      let same = false;
      setContent((prev) => { same = JSON.stringify(prev) === JSON.stringify(next); return same ? prev : next; });
      await cache.write(text);
      return same ? 'unchanged' : 'updated';
    } catch {
      return 'failed';
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (cache.exists) {
          const saved: unknown = JSON.parse(await cache.text());
          if (isContent(saved)) setContent(saved);
        }
      } catch {}
      refresh();
    })();
  }, [refresh]);

  return <ContentContext.Provider value={{ content, refresh }}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
