# Plan: one admin page for the website and the app

Status: Phases 1–3 done (site built from `content.json` and live; app reads it). Next: Phase 4, Pages CMS.

Goal: add, edit, reorder and delete projects, experience, certificates, links and the intro copy in one place, and have both aexomir.me and the iPhone app pick up the changes without editing code or shipping an App Store update.

## The idea in one line

Keep all content in one file, `content.json`, in the `aexomir/aexomir.github.io` repo. The admin page edits that file. The website is rebuilt from it on every change, and the app downloads it.

```
Admin page ──commit──▶ content.json (aexomir.github.io repo)
                           │
            GitHub Action  │  validate → render index.html → deploy Pages
                           ▼
              https://aexomir.me            (static HTML, as today)
              https://aexomir.me/content.json
                           │
                           ▼
              iPhone app: fetch on launch and on pull to refresh,
              cache the last good copy, fall back to the bundled copy
```

## Phase 1: one content file

- Create `content.json` with today's content (the merged data from `index.html` and `src/data.ts`):
  - `profile`: name, title, intro, currently, status, city and time zone.
  - `projects[]`: slug, name, type (Apps/Research), year, summary, repo URL, and facts (key/value pairs, used by the app's detail screen).
  - `experience[]`: years, role, company.
  - `certificates[]`: name, issuer, year, optional URL.
  - `links[]`: label, value, href.
- Checks for required fields, URL formats, project types and unique slugs live in `scripts/build.mjs` (no separate schema file, since nothing else would read it). The app runs a lighter shape check before it uses a downloaded file.

**Done when** the file holds everything that is hard-coded today, and the schema accepts it.

## Phase 2: website builds from the file

- Move today's `index.html` to `template.html`, replacing the hard-coded rows with placeholders.
- Add a small Node script, `scripts/build.mjs` (no dependencies), that reads `content.json`, validates it, escapes every string for HTML and writes `index.html`.
- Add a GitHub Actions workflow, `.github/workflows/pages.yml`, that runs the script on every push to `main` and deploys with `actions/deploy-pages`. Switch Pages from "deploy from branch" to "GitHub Actions", and keep the `CNAME` / `aexomir.me`.
- Also publish `content.json` next to `index.html` so the app can fetch it.

The page stays static: no runtime fetch, so it stays fast and search engines still see everything. Bad content fails the build, and the live site keeps the last good version.

**Done when** editing `content.json` and pushing updates aexomir.me in about a minute, and a broken file leaves the site untouched.

## Phase 3: app reads the same file

- On launch, fetch `https://aexomir.me/content.json`. Validate it, show it, and save it to disk (`expo-file-system`).
- Order of preference: fresh download, then the saved copy, then the bundled copy (`src/data.ts`, regenerated from `content.json` at build time) for the first launch or when offline.
- Pull to refresh fetches again. This also replaces today's fake refresh.
- All screens read from one `useContent()` hook instead of importing `src/data.ts`.

**Done when** a change made in the admin page shows up in the app after pull to refresh, with no new build, and the app still works in airplane mode.

## Phase 4: the admin page

Pick one option.

**A. Pages CMS (recommended, no code to maintain).** A free, hosted, open-source CMS for GitHub repos (pagescms.org). You sign in with GitHub, and it edits files in the repo through a form generated from a `.pages.yml` config.
- Add `.pages.yml` that describes `content.json`: lists for projects, experience, certificates and links; text, URL and select fields; drag to reorder.
- Each save is a commit, which triggers Phase 2 and so reaches the app.
- Cost: a few dozen lines of config. It needs a GitHub App installed on the one repo. Check at setup that it handles nested lists in a JSON file. If it doesn't, store the content as `content.yml` and have the build script turn it into JSON.

**B. Your own `/admin` page (full control, more code).** A static page at `aexomir.me/admin/`, in the site's own style, with forms for each section.
- It reads and writes `content.json` through the GitHub contents API, using a fine-grained token limited to this repo with Contents read/write. You paste the token once and it stays in that browser only. The token is never committed.
- The page carries no secrets, so a stranger who opens it can't do anything without a token.
- Cost: roughly 400–600 lines (forms, list editing and reordering, validation, conflict handling when the file changed since it was loaded).

Both options keep GitHub as the only backend: no server, no database and no hosting bill. Every edit is a commit, so history and undo come free.

**Done when** you can add a project from your phone's browser, and it appears on aexomir.me and in the app.

## Phase 5: safety checks

- The build fails on invalid content (schema, duplicate slugs, broken URL formats), so a typo can't break the site.
- The app ignores a downloaded file that fails validation and keeps its last good copy.
- Add one test for the build script: given a sample `content.json`, the output contains every project and escapes HTML in names.
- Document the flow in both READMEs.

## Out of scope for now

- Images and screenshots for projects. Add an `image` field later, with uploads to `/assets` in the same repo.
- Drafts and scheduled publishing.
- More than one editor, or roles.
- Android.

## Order and size

1. Phase 1 + 2 (website from file): half a day.
2. Phase 3 (app reads file): half a day, including a new dev build.
3. Phase 4: option A about an hour, option B one to two days.
4. Phase 5: alongside each phase.

## Open decisions

1. Admin option A (Pages CMS) or B (own page)?
2. Should the app ship with a bundled copy (works offline on first launch) or always download (simpler, but blank without a network on first launch)? Recommendation: bundled copy.
