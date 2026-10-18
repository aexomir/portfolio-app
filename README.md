# Amir Ranjbar — iPhone portfolio

The [aexomir.me](https://aexomir.me) portfolio as a native iPhone app, built with Expo and React Native. It has the same palette, type and content as the site. Liquid Glass appears only on the navigation layer: the tab bar, the bar buttons, the sheet and the action buttons.

## What's native

| Design | Implementation |
|---|---|
| Floating glass tab bar that shrinks on scroll | `NativeTabs` with `minimizeBehavior="onScrollDown"` (system tab bar on iOS 26+) |
| Large titles collapsing into the nav bar | Native stack `headerLargeTitleEnabled` |
| Swipe back from project detail | Native stack push |
| Press and hold for menus with a preview | `Link.Preview` and `Link.Menu` (UIKit context menus) |
| Theme button, top right | Native header menu: System / Light / Dark. Follows the system until you choose |
| Status, then the "Get in touch" sheet | `formSheet` sized to its content, drag down to dismiss |
| Pull to refresh | `RefreshControl`, re-downloads the content |
| Swipe the project list sideways | Gesture Handler pan; the segmented thumb follows your finger |
| Bold wave through the name | Runs on load and wherever you tap |

## Run

```bash
npm install
npx expo run:ios
```

It needs a development build, not Expo Go, because it uses native modules (glass, symbols, clipboard).

## Content

The app shows the same `content.json` the website is built from ([aexomir/aexomir.github.io](https://github.com/aexomir/aexomir.github.io)), so content changes need no new app build.

- On launch, and on pull to refresh, it downloads `https://aexomir.me/content.json`, checks it, shows it and saves it.
- Without a network it shows the last saved copy, or on first launch the bundled copy in [`src/content.json`](src/content.json).
- A downloaded file that fails the check is ignored, and the last good copy stays.

Refresh the bundled copy before each App Store build:

```bash
npm run sync-content
```

Loading and checking live in [`src/content.tsx`](src/content.tsx). Theme tokens are in [`src/theme.tsx`](src/theme.tsx).

## Ship to TestFlight

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```
